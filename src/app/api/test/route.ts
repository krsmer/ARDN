import { NextResponse } from 'next/server'
import prisma from '../../../lib/prisma'

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect()
    
    // Try a simple query
    const organizationCount = await prisma.organization.count()
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: {
        organizationCount,
        env: {
          hasDatabaseUrl: !!process.env.DATABASE_URL,
          hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
          hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
          nodeEnv: process.env.NODE_ENV
        }
      }
    })
  } catch (error) {
    console.error('Database connection test failed:', error)
    return NextResponse.json({
      success: false,
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      env: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
        nodeEnv: process.env.NODE_ENV
      }
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}