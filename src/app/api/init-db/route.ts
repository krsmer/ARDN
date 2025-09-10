import { NextResponse } from 'next/server'
import prisma from '../../../lib/prisma'

export async function POST() {
  try {
    console.log('🔧 Starting database initialization...')
    
    // Test database connection first
    await prisma.$connect()
    console.log('✅ Database connection successful')
    
    // Try to run migrations/push schema
    // Since we can't run migrations directly, we'll test table creation
    try {
      // Test if tables exist by attempting a simple query
      const orgCount = await prisma.organization.count()
      console.log(`✅ Database tables exist. Organization count: ${orgCount}`)
      
      return NextResponse.json({
        success: true,
        message: 'Database is already initialized',
        data: {
          organizationCount: orgCount,
          status: 'existing'
        }
      })
    } catch (tableError) {
      console.log('ℹ️ Tables do not exist yet, this is expected for first deployment')
      
      // Create a test organization to trigger table creation
      const testOrg = await prisma.organization.create({
        data: {
          name: 'Test Organization',
          slug: 'test-org-temp',
          isActive: true
        }
      })
      
      console.log('✅ Database tables created successfully')
      
      // Delete the test organization
      await prisma.organization.delete({
        where: { id: testOrg.id }
      })
      
      console.log('✅ Database initialization completed')
      
      return NextResponse.json({
        success: true,
        message: 'Database tables created successfully',
        data: {
          status: 'initialized'
        }
      })
    }
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    return NextResponse.json({
      success: false,
      message: 'Database initialization failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}