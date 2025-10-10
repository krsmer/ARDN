import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/route'
import prisma from '../../../lib/prisma'

// POST /api/participation - Record student participation in an activity
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.organizationId || !session?.user?.id) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 })
    }

    const { studentId, activityId, pointsEarned, isLate = false, notes } = await request.json()

    if (!studentId || !activityId) {
      return NextResponse.json({
        success: false,
        message: 'Öğrenci ID ve Aktivite ID gereklidir'
      }, { status: 400 })
    }

    // Verify student belongs to organization
    const student = await prisma.student.findFirst({
      where: {
        id: studentId,
        organizationId: session.user.organizationId
      }
    })

    if (!student) {
      return NextResponse.json({
        success: false,
        message: 'Öğrenci bulunamadı'
      }, { status: 404 })
    }

    // Verify activity belongs to organization
    const activity = await prisma.activity.findFirst({
      where: {
        id: activityId,
        organizationId: session.user.organizationId
      }
    })

    if (!activity) {
      return NextResponse.json({
        success: false,
        message: 'Aktivite bulunamadı'
      }, { status: 404 })
    }

    // Check if participation already exists BEFORE checking activity time
    const existingParticipation = await prisma.participation.findUnique({
      where: {
        studentId_activityId: {
          studentId,
          activityId
        }
      }
    })

    if (existingParticipation) {
      return NextResponse.json({
        success: false,
        message: 'Bu öğrenci zaten bu aktiviteye katıldı olarak işaretlendi'
      }, { status: 409 })
    }

    // --- YENİ KONTROL: Aktivitenin süresi dolmuş mu? ---
    const now = new Date();
    // Prisma'dan gelen `startTime` ve `endTime` zaten Date nesneleridir.
    // Eğer bitiş saati belirtilmemişse, başlangıç saatinden 3 saat sonrasını varsayalım.
    const activityEndTime = activity.endTime 
      ? activity.endTime 
      : new Date(activity.startTime.getTime() + 3 * 60 * 60 * 1000);

    if (now > activityEndTime) {
      return NextResponse.json({ 
        success: false, 
        message: 'Bu aktivitenin süresi dolduğu için katılım kaydedilemez.' 
      }, { status: 400 });
    }
    // --- YENİ KONTROL SONU ---

    // Calculate points - use provided points or activity default
    let earnedPoints = pointsEarned !== undefined ? pointsEarned : activity.points
    
    // Apply late penalty if necessary (e.g., 20% reduction for being late)
    if (isLate && earnedPoints > 0) {
      earnedPoints = Math.max(1, Math.floor(earnedPoints * 0.8))
    }

    // Ensure points are never negative (ARDN system requirement)
    earnedPoints = Math.max(0, earnedPoints)

    // Create participation record and update student points in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create participation record
      const participation = await tx.participation.create({
        data: {
          studentId,
          activityId,
          participatedAt: new Date(),
          pointsEarned: earnedPoints,
          isLate,
          notes: notes || null,
          recordedById: session.user.id
        },
        include: {
          student: {
            select: {
              name: true,
              studentNumber: true,
              totalPoints: true
            }
          },
          activity: {
            select: {
              title: true,
              points: true
            }
          }
        }
      })

      // Update student's total points
      const updatedStudent = await tx.student.update({
        where: { id: studentId },
        data: {
          totalPoints: {
            increment: earnedPoints
          }
        },
        select: {
          totalPoints: true
        }
      })

      return { participation, newTotalPoints: updatedStudent.totalPoints }
    })

    return NextResponse.json({
      success: true,
      message: 'Katılım başarıyla kaydedildi',
      participation: result.participation,
      pointsEarned: earnedPoints,
      oldTotalPoints: result.participation.student.totalPoints,
      newTotalPoints: result.newTotalPoints
    })

  } catch (error) {
    console.error('Error recording participation:', error)
    return NextResponse.json({
      success: false,
      message: 'Katılım kaydedilirken hata oluştu'
    }, { status: 500 })
  }
}

// GET /api/participation - Get participation records for organization
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.organizationId) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const activityId = searchParams.get('activityId')
    const programId = searchParams.get('programId')

    // Build where clause with organization filter
    const whereClause: Record<string, unknown> = {
      student: {
        organizationId: session.user.organizationId
      }
    }
    
    if (studentId) whereClause.studentId = studentId
    if (activityId) whereClause.activityId = activityId
    if (programId) {
      whereClause.activity = {
        programId: programId
      }
    }

    const participations = await prisma.participation.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            studentNumber: true,
            class: true,
            photoUrl: true,
            totalPoints: true
          }
        },
        activity: {
          select: {
            id: true,
            title: true,
            points: true,
            activityDate: true,
            program: {
              select: {
                name: true
              }
            }
          }
        },
        recordedBy: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        participatedAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      participations
    })

  } catch (error) {
    console.error('Error fetching participation records:', error)
    return NextResponse.json({
      success: false,
      message: 'Katılım kayıtları yüklenirken hata oluştu'
    }, { status: 500 })
  }
}

// DELETE /api/participation - Remove a participation record
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
    const participationId = searchParams.get('id')

    if (!participationId) {
      return NextResponse.json({
        success: false,
        message: 'Katılım ID gereklidir'
      }, { status: 400 })
    }

    // Get participation with organization verification
    const participation = await prisma.participation.findFirst({
      where: {
        id: participationId,
        student: {
          organizationId: session.user.organizationId
        }
      },
      include: {
        student: true
      }
    })

    if (!participation) {
      return NextResponse.json({
        success: false,
        message: 'Katılım kaydı bulunamadı'
      }, { status: 404 })
    }

    // Remove participation and adjust student points in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete participation record
      await tx.participation.delete({
        where: { id: participationId }
      })

      // Subtract points from student's total
      await tx.student.update({
        where: { id: participation.studentId },
        data: {
          totalPoints: {
            decrement: participation.pointsEarned
          }
        }
      })

      // Ensure total points never go below 0 (ARDN system requirement)
      const updatedStudent = await tx.student.findUnique({
        where: { id: participation.studentId },
        select: { totalPoints: true }
      })

      if (updatedStudent && updatedStudent.totalPoints < 0) {
        await tx.student.update({
          where: { id: participation.studentId },
          data: { totalPoints: 0 }
        })
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Katılım kaydı başarıyla silindi'
    })

  } catch (error) {
    console.error('Error deleting participation:', error)
    return NextResponse.json({
      success: false,
      message: 'Katılım kaydı silinirken hata oluştu'
    }, { status: 500 })
  }
}