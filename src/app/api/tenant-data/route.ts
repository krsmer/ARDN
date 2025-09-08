import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../lib/prisma'
import { getTenantContext } from '../../../lib/tenant'

export async function GET(request: NextRequest) {
  try {
    // Get tenant context
    const tenantContext = await getTenantContext(request)
    
    if (!tenantContext) {
      return NextResponse.json({
        status: 'error',
        message: 'Organization not found. Please specify organization via subdomain or ?org= parameter'
      }, { status: 400 })
    }

    const { organizationId, organizationSlug } = tenantContext

    // Get organization info
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        id: true,
        name: true,
        slug: true,
        address: true,
        phone: true,
        email: true
      }
    })

    // Get organization-specific data
    const users = await prisma.user.findMany({
      where: { organizationId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true
      }
    })
    
    const programs = await prisma.program.findMany({
      where: { organizationId },
      select: {
        id: true,
        name: true,
        description: true,
        startDate: true,
        endDate: true,
        isActive: true
      }
    })
    
    const students = await prisma.student.findMany({
      where: { organizationId },
      select: {
        id: true,
        studentNumber: true,
        name: true,
        class: true,
        totalPoints: true,
        isActive: true
      },
      orderBy: { totalPoints: 'desc' }
    })
    
    const activities = await prisma.activity.findMany({
      where: { organizationId },
      select: {
        id: true,
        title: true,
        description: true,
        points: true,
        activityDate: true,
        isActive: true
      }
    })

    return NextResponse.json({
      status: 'success',
      message: `${organization?.name} verisi başarıyla alındı`,
      tenant: {
        organization,
        organizationSlug
      },
      data: {
        users: {
          count: users.length,
          data: users
        },
        programs: {
          count: programs.length,
          data: programs
        },
        students: {
          count: students.length,
          data: students
        },
        activities: {
          count: activities.length,
          data: activities
        }
      }
    })
  } catch (error) {
    console.error('Tenant data error:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Tenant verisi alınırken hata oluştu',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}