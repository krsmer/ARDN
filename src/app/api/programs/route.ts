import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/route'
import prisma from '../../../lib/prisma'

// GET /api/programs - Fetch all programs for the user's organization
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.organizationId) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 })
    }

    // Fetch programs for the user's organization with counts
    const programs = await prisma.program.findMany({
      where: {
        organizationId: session.user.organizationId
      },
      include: {
        _count: {
          select: {
            students: true,
            activities: true
          }
        }
      },
      orderBy: [
        { isActive: 'desc' },
        { startDate: 'desc' }
      ]
    })

    // Transform the data to include counts
    const transformedPrograms = programs.map(program => ({
      id: program.id,
      name: program.name,
      description: program.description,
      startDate: program.startDate.toISOString(),
      endDate: program.endDate.toISOString(),
      isActive: program.isActive,
      studentCount: program._count.students,
      activityCount: program._count.activities,
      createdAt: program.createdAt.toISOString(),
    }))

    return NextResponse.json({
      success: true,
      programs: transformedPrograms
    })

  } catch (error) {
    console.error('Error fetching programs:', error)
    return NextResponse.json({
      success: false,
      message: 'Programlar yüklenirken hata oluştu'
    }, { status: 500 })
  }
}

// POST /api/programs - Create a new program
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.organizationId || !session?.user?.id) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, startDate, endDate } = body

    // Validate required fields
    if (!name || !startDate || !endDate) {
      return NextResponse.json({
        success: false,
        message: 'Program adı, başlangıç ve bitiş tarihleri gereklidir'
      }, { status: 400 })
    }

    // Validate date logic
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    if (start >= end) {
      return NextResponse.json({
        success: false,
        message: 'Bitiş tarihi başlangıç tarihinden sonra olmalıdır'
      }, { status: 400 })
    }

    // Check for duplicate program names within the organization
    const existingProgram = await prisma.program.findFirst({
      where: {
        name: name.trim(),
        organizationId: session.user.organizationId
      }
    })

    if (existingProgram) {
      return NextResponse.json({
        success: false,
        message: 'Bu program adı zaten kullanımda'
      }, { status: 409 })
    }

    // Create the program
    const program = await prisma.program.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        startDate: start,
        endDate: end,
        organizationId: session.user.organizationId,
        createdById: session.user.id,
        isActive: true
      },
      include: {
        _count: {
          select: {
            students: true,
            activities: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Program başarıyla oluşturuldu',
      program: {
        id: program.id,
        name: program.name,
        description: program.description,
        startDate: program.startDate.toISOString(),
        endDate: program.endDate.toISOString(),
        isActive: program.isActive,
        studentCount: program._count.students,
        activityCount: program._count.activities,
        createdAt: program.createdAt.toISOString(),
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating program:', error)
    return NextResponse.json({
      success: false,
      message: 'Program oluşturulurken hata oluştu'
    }, { status: 500 })
  }
}

// PUT /api/programs - Update an existing program
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.organizationId) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 })
    }

    const body = await request.json()
    const { id, name, description, startDate, endDate, isActive } = body

    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'Program ID gereklidir'
      }, { status: 400 })
    }

    // Verify the program belongs to the user's organization
    const existingProgram = await prisma.program.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId
      }
    })

    if (!existingProgram) {
      return NextResponse.json({
        success: false,
        message: 'Program bulunamadı'
      }, { status: 404 })
    }

    // Validate dates if provided
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      
      if (start >= end) {
        return NextResponse.json({
          success: false,
          message: 'Bitiş tarihi başlangıç tarihinden sonra olmalıdır'
        }, { status: 400 })
      }
    }

    // Update the program
    const updatedProgram = await prisma.program.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(isActive !== undefined && { isActive })
      },
      include: {
        _count: {
          select: {
            students: true,
            activities: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Program başarıyla güncellendi',
      program: {
        id: updatedProgram.id,
        name: updatedProgram.name,
        description: updatedProgram.description,
        startDate: updatedProgram.startDate.toISOString(),
        endDate: updatedProgram.endDate.toISOString(),
        isActive: updatedProgram.isActive,
        studentCount: updatedProgram._count.students,
        activityCount: updatedProgram._count.activities,
        createdAt: updatedProgram.createdAt.toISOString(),
      }
    })

  } catch (error) {
    console.error('Error updating program:', error)
    return NextResponse.json({
      success: false,
      message: 'Program güncellenirken hata oluştu'
    }, { status: 500 })
  }
}