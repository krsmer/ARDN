import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '../../../../lib/prisma'

export async function GET() {
  try {
    // Check if the test user exists
    const testEmail = 'admin@ankaraerkek.edu.tr'
    
    const user = await prisma.user.findFirst({
      where: { email: testEmail },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found in database',
        email: testEmail
      })
    }

    // Test password verification
    const isValidPassword = await bcrypt.compare('123456', user.passwordHash)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        organization: user.organization,
        passwordValid: isValidPassword
      },
      debug: {
        passwordHashLength: user.passwordHash.length,
        passwordHashPreview: user.passwordHash.substring(0, 10) + '...'
      }
    })
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json({
      success: false,
      message: 'Database error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}