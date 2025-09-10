import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/route'
import prisma from '../../../lib/prisma'

// GET /api/students - Fetch all students for the user's organization
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.organizationId) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 })
    }

    // Fetch students for the user's organization with program info
    const students = await prisma.student.findMany({
      where: {
        organizationId: session.user.organizationId
      },
      include: {
        program: {
          select: {
            id: true,
            name: true,
            isActive: true
          }
        }
      },
      orderBy: [
        { isActive: 'desc' },
        { name: 'asc' }
      ]
    })

    // Transform the data
    const transformedStudents = students.map(student => ({
      id: student.id,
      studentNumber: student.studentNumber,
      name: student.name,
      class: student.class,
      programId: student.programId,
      programName: student.program.name,
      photoUrl: student.photoUrl,
      totalPoints: student.totalPoints,
      isActive: student.isActive,
      createdAt: student.createdAt.toISOString(),
    }))

    return NextResponse.json({
      success: true,
      students: transformedStudents
    })

  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json({
      success: false,
      message: 'Öğrenciler yüklenirken hata oluştu'
    }, { status: 500 })
  }
}

// POST /api/students - Create a new student
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
    const { name, studentNumber, class: studentClass, programId, photoUrl } = body

    // Validate required fields
    if (!name || !studentNumber || !studentClass || !programId) {
      return NextResponse.json({
        success: false,
        message: 'Öğrenci adı, numarası, sınıfı ve dönem seçimi gereklidir'
      }, { status: 400 })
    }

    // Verify the program belongs to the user's organization
    const program = await prisma.program.findFirst({
      where: {
        id: programId,
        organizationId: session.user.organizationId
      }
    })

    if (!program) {
      return NextResponse.json({
        success: false,
        message: 'Seçilen dönem bulunamadı'
      }, { status: 404 })
    }

    // Check for duplicate student number within the organization
    const existingStudent = await prisma.student.findFirst({
      where: {
        studentNumber: studentNumber.trim(),
        organizationId: session.user.organizationId
      }
    })

    if (existingStudent) {
      return NextResponse.json({
        success: false,
        message: 'Bu öğrenci numarası zaten kullanımda'
      }, { status: 409 })
    }

    // Create the student
    const student = await prisma.student.create({
      data: {
        name: name.trim(),
        studentNumber: studentNumber.trim(),
        class: studentClass.trim(),
        programId,
        organizationId: session.user.organizationId,
        photoUrl: photoUrl?.trim() || null,
        totalPoints: 0,
        isActive: true
      },
      include: {
        program: {
          select: {
            id: true,
            name: true,
            isActive: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Öğrenci başarıyla eklendi',
      student: {
        id: student.id,
        studentNumber: student.studentNumber,
        name: student.name,
        class: student.class,
        programId: student.programId,
        programName: student.program.name,
        photoUrl: student.photoUrl,
        totalPoints: student.totalPoints,
        isActive: student.isActive,
        createdAt: student.createdAt.toISOString(),
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating student:', error)
    return NextResponse.json({
      success: false,
      message: 'Öğrenci eklenirken hata oluştu'
    }, { status: 500 })
  }
}

// PUT /api/students - Update an existing student
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
    const { id, name, studentNumber, class: studentClass, programId, photoUrl, isActive } = body

    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'Öğrenci ID gereklidir'
      }, { status: 400 })
    }

    // Verify the student belongs to the user's organization
    const existingStudent = await prisma.student.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId
      }
    })

    if (!existingStudent) {
      return NextResponse.json({
        success: false,
        message: 'Öğrenci bulunamadı'
      }, { status: 404 })
    }

    // If student number is being changed, check for duplicates
    if (studentNumber && studentNumber !== existingStudent.studentNumber) {
      const duplicateStudent = await prisma.student.findFirst({
        where: {
          studentNumber: studentNumber.trim(),
          organizationId: session.user.organizationId,
          id: { not: id }
        }
      })

      if (duplicateStudent) {
        return NextResponse.json({
          success: false,
          message: 'Bu öğrenci numarası zaten kullanımda'
        }, { status: 409 })
      }
    }

    // If program is being changed, verify it belongs to the organization
    if (programId && programId !== existingStudent.programId) {
      const program = await prisma.program.findFirst({
        where: {
          id: programId,
          organizationId: session.user.organizationId
        }
      })

      if (!program) {
        return NextResponse.json({
          success: false,
          message: 'Seçilen dönem bulunamadı'
        }, { status: 404 })
      }
    }

    // Update the student
    const updatedStudent = await prisma.student.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(studentNumber && { studentNumber: studentNumber.trim() }),
        ...(studentClass && { class: studentClass.trim() }),
        ...(programId && { programId }),
        ...(photoUrl !== undefined && { photoUrl: photoUrl?.trim() || null }),
        ...(isActive !== undefined && { isActive })
      },
      include: {
        program: {
          select: {
            id: true,
            name: true,
            isActive: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Öğrenci bilgileri güncellendi',
      student: {
        id: updatedStudent.id,
        studentNumber: updatedStudent.studentNumber,
        name: updatedStudent.name,
        class: updatedStudent.class,
        programId: updatedStudent.programId,
        programName: updatedStudent.program.name,
        photoUrl: updatedStudent.photoUrl,
        totalPoints: updatedStudent.totalPoints,
        isActive: updatedStudent.isActive,
        createdAt: updatedStudent.createdAt.toISOString(),
      }
    })

  } catch (error) {
    console.error('Error updating student:', error)
    return NextResponse.json({
      success: false,
      message: 'Öğrenci güncellenirken hata oluştu'
    }, { status: 500 })
  }
}

// DELETE /api/students - Soft delete a student
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.organizationId) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('id')

    if (!studentId) {
      return NextResponse.json({
        success: false,
        message: 'Öğrenci ID gereklidir'
      }, { status: 400 })
    }

    // Verify the student belongs to the user's organization
    const existingStudent = await prisma.student.findFirst({
      where: {
        id: studentId,
        organizationId: session.user.organizationId
      }
    })

    if (!existingStudent) {
      return NextResponse.json({
        success: false,
        message: 'Öğrenci bulunamadı'
      }, { status: 404 })
    }

    // Soft delete - set isActive to false instead of actual deletion
    await prisma.student.update({
      where: { id: studentId },
      data: { isActive: false }
    })

    return NextResponse.json({
      success: true,
      message: 'Öğrenci başarıyla kaldırıldı'
    })

  } catch (error) {
    console.error('Error deleting student:', error)
    return NextResponse.json({
      success: false,
      message: 'Öğrenci silinirken hata oluştu'
    }, { status: 500 })
  }
}