import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '../../../../lib/prisma'

interface RegisterRequest {
  // Organization info
  organizationName: string
  organizationSlug: string
  organizationAddress?: string
  organizationPhone?: string
  organizationEmail?: string
  
  // Admin user info
  adminName: string
  adminEmail: string
  adminPassword: string
}

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json()
    const {
      organizationName,
      organizationSlug,
      organizationAddress,
      organizationPhone,
      organizationEmail,
      adminName,
      adminEmail,
      adminPassword
    } = body

    // Validate required fields
    if (!organizationName || !organizationSlug || !adminName || !adminEmail || !adminPassword) {
      return NextResponse.json({
        success: false,
        message: 'Tüm zorunlu alanları doldurun'
      }, { status: 400 })
    }

    // Validate organization slug format (URL-friendly)
    const slugRegex = /^[a-z0-9-]+$/
    if (!slugRegex.test(organizationSlug)) {
      return NextResponse.json({
        success: false,
        message: 'Yurt kodu sadece küçük harf, rakam ve tire içerebilir'
      }, { status: 400 })
    }

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

    // Validate password strength
    if (adminPassword.length < 6) {
      return NextResponse.json({
        success: false,
        message: 'Şifre en az 6 karakter olmalıdır'
      }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10)

    // Create organization and admin user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create organization
      const organization = await tx.organization.create({
        data: {
          name: organizationName,
          slug: organizationSlug,
          address: organizationAddress,
          phone: organizationPhone,
          email: organizationEmail,
          isActive: true
        }
      })

      // Create admin user
      const adminUser = await tx.user.create({
        data: {
          email: adminEmail,
          passwordHash: hashedPassword,
          name: adminName,
          role: 'ORGANIZATION_ADMIN',
          organizationId: organization.id,
          isActive: true
        }
      })

      // Create default program for the organization
      const defaultProgram = await tx.program.create({
        data: {
          name: '2024-2025 Akademik Yılı',
          description: `${organizationName} için varsayılan ARDN puan takip programı`,
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
    
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
      
      // Check for specific database errors
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