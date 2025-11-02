import { NextResponse } from 'next/server'
import prisma from '../../../lib/prisma'

export async function GET() {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({
      success: false,
      message: 'Test endpoint disabled in production'
    }, { status: 404 })
  }

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
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Database connection test failed:', error)
    return NextResponse.json({
      success: false,
      message: 'Database connection failed'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}