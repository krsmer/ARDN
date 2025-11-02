import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import prisma from '../../../../lib/prisma'

interface RegisterRequest {
  // Organization info
  organizationName: string
  organizationSlug: string
  organizationAddress?: string
  organizationPhone?: string
  
  // Admin user info
  adminName: string
  adminEmail: string
  adminPassword: string
}

// Define a schema for input validation using Zod
const registerSchema = z.object({
  organizationName: z.string().min(3, 'Yurt adı en az 3 karakter olmalıdır.'),
  organizationSlug: z.string().min(3, 'Yurt kodu en az 3 karakter olmalıdır.').regex(/^[a-z0-9-]+$/, 'Yurt kodu sadece küçük harf, rakam ve tire içerebilir.'),
  organizationAddress: z.string().optional(),
  organizationPhone: z.string().optional(),
  adminName: z.string().min(2, 'Yönetici adı en az 2 karakter olmalıdır.'),
  adminEmail: z.string().email('Geçersiz yönetici e-posta adresi.'),
  adminPassword: z.string().min(8, 'Şifre en az 8 karakter olmalıdır.')
});

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json()

    // Validate request body against the schema
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        message: 'Geçersiz form verisi.',
        errors: validationResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { organizationSlug, adminEmail, adminPassword } = validationResult.data;

    // Check if organization slug already exists
    const existingOrg = await prisma.organization.findUnique({
      where: { slug: organizationSlug }
    })
    if (existingOrg) {
      return NextResponse.json({
        success: false,
        message: 'Bu yurt kodu zaten kullanımda. Lütfen farklı bir kod seçin.'
      }, { status: 409 })
    }
    // Check if admin email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail }
    })

    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: 'Bu email adresi zaten kullanımda'
      }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10)

    // Create organization and admin user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create organization
      const organization = await tx.organization.create({
        data: {
          name: validationResult.data.organizationName,
          slug: validationResult.data.organizationSlug,
          address: validationResult.data.organizationAddress,
          phone: validationResult.data.organizationPhone,
          email: null, // Removed organizationEmail
          isActive: true
        }
      })

      // Create admin user
      const adminUser = await tx.user.create({
        data: {
          email: validationResult.data.adminEmail,
          passwordHash: hashedPassword,
          name: validationResult.data.adminName,
          role: 'ORGANIZATION_ADMIN', // Consider using an enum for roles
          organizationId: organization.id,
          isActive: true
        }
      })

      // Create default program for the organization
      const defaultProgram = await tx.program.create({
        data: {
          name: '2024-2025 Akademik Yılı',
          description: `${validationResult.data.organizationName} için varsayılan ARDN puan takip programı`,
          startDate: new Date('2024-09-01'),
          endDate: new Date('2025-06-30'),
          organizationId: organization.id,
          createdById: adminUser.id,
          isActive: true
        }
      })

      return { organization, adminUser, defaultProgram }
    })

    return NextResponse.json({
      success: true,
      message: 'Yurt kaydı başarıyla oluşturuldu! Şimdi giriş yapabilirsiniz.',
      data: {
        organization: {
          id: result.organization.id,
          name: result.organization.name,
          slug: result.organization.slug
        },
        adminUser: {
          id: result.adminUser.id,
          email: result.adminUser.email,
          name: result.adminUser.name
        }
      }
    })

  } catch (error) {
    console.error('Registration error:', error)
    
    // Provide more specific error messages based on error type
    let errorMessage = 'Kayıt işlemi sırasında hata oluştu'
    
    if (error instanceof Error) { // This check is good practice
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
      
      // Check for specific database errors (Prisma-specific error handling is even better)
      if (error.message.includes('P2002')) {
        errorMessage = 'Bu email veya yurt kodu zaten kullanımda'
      } else if (error.message.includes('connection')) {
        errorMessage = 'Veritabanı bağlantı hatası'
      } else if (error.message.includes('timeout')) {
        errorMessage = 'İşlem zaman aşımına uğradı, lütfen tekrar deneyin'
      }
    }
    
    return NextResponse.json({
      success: false,
      message: errorMessage,
      debug: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : 'Unknown error' : undefined
    }, { status: 500 })
  }
}