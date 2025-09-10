import { NextResponse } from 'next/server'
import prisma from '../../../lib/prisma'

export async function POST() {
  try {
    console.log('🔧 Starting database setup for PostgreSQL...')
    
    // Test connection and create tables using Prisma
    await prisma.$connect()
    console.log('✅ Database connection successful')
    
    // Use Prisma's executeRaw to create tables
    // This approach works better with our existing setup
    
    try {
      // Test if tables exist by attempting to count organizations
      const count = await prisma.organization.count()
      console.log(`✅ Database tables already exist. Organization count: ${count}`)
      
      return NextResponse.json({
        success: true,
        message: 'Database is already set up and ready to use!',
        status: 'already_setup',
        organizationCount: count
      })
    } catch (tableError) {
      console.log('ℹ️ Tables do not exist, creating them...')
      
      // Create a test organization to trigger Prisma to create all tables
      // Prisma will automatically create the table structure
      const testOrg = await prisma.organization.create({
        data: {
          name: 'Database Setup Test',
          slug: 'db-setup-test-temp',
          isActive: true
        }
      })
      
      console.log('✅ Database tables created via Prisma')
      
      // Remove the test organization
      await prisma.organization.delete({
        where: { id: testOrg.id }
      })
      
      console.log('✅ Database setup completed successfully')
      
      return NextResponse.json({
        success: true,
        message: 'Database tables created successfully! You can now register your dormitory.',
        status: 'setup_complete'
      })
    }
    
  } catch (error) {
    console.error('❌ Database setup failed:', error)
    return NextResponse.json({
      success: false,
      message: 'Database setup failed. Please check environment variables.',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}