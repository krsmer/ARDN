import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'
import prisma from '../../../lib/prisma'

// Helper function to generate recurring activity dates
function generateRecurringDates(startDate: Date, endDate: Date, recurrenceType: string): Date[] {
  const dates: Date[] = []
  const current = new Date(startDate)
  
  while (current <= endDate) {
    dates.push(new Date(current))
    
    switch (recurrenceType) {
      case 'DAILY':
        current.setDate(current.getDate() + 1)
        break
      case 'WEEKLY':
        current.setDate(current.getDate() + 7)
        break
      case 'MONTHLY':
        current.setMonth(current.getMonth() + 1)
        break
      default:
        return dates // Only return the original date if type is unknown
    }
  }
  
  return dates
}

// Helper function to auto-include all students in an activity
async function autoIncludeStudentsInActivity(activityId: string, programId: string, organizationId: string, userId: string, activityPoints: number) {
  try {
    // Get all active students from the same program and organization
    const students = await prisma.student.findMany({
      where: {
        programId: programId,
        organizationId: organizationId,
        isActive: true
      }
    })

    if (students.length === 0) {
      return { success: true, message: 'No students found to include', studentsIncluded: 0 }
    }

    // Create participation records for all students
    const participations = await prisma.$transaction(
      students.map(student => 
        prisma.participation.create({
          data: {
            studentId: student.id,
            activityId: activityId,
            participatedAt: new Date(),
            pointsEarned: activityPoints,
            isLate: false,
            recordedById: userId
          }
        })
      )
    )

    // Update all students' total points
    await prisma.$transaction(
      students.map(student => 
        prisma.student.update({
          where: { id: student.id },
          data: {
            totalPoints: {
              increment: activityPoints
            }
          }
        })
      )
    )

    return { 
      success: true, 
      message: `${students.length} öğrenci otomatik olarak aktiviteye dahil edildi`, 
      studentsIncluded: students.length,
      totalPointsAwarded: students.length * activityPoints
    }
  } catch (error) {
    console.error('Error auto-including students:', error)
    return { success: false, message: 'Students could not be auto-included', error }
  }
}

// GET /api/activities - Fetch all activities for the user's organization
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.organizationId) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 })
    }

    // Fetch activities for the user's organization with program info and participation count
    const activities = await prisma.activity.findMany({
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
        },
        _count: {
          select: {
            participations: true
          }
        }
      },
      orderBy: [
        { isActive: 'desc' },
        { activityDate: 'desc' }
      ]
    })

    // Transform the data
    const transformedActivities = activities.map(activity => ({
      id: activity.id,
      title: activity.title,
      description: activity.description,
      activityDate: activity.activityDate.toISOString(),
      startTime: activity.startTime.toISOString(),
      endTime: activity.endTime ? activity.endTime.toISOString() : null,
      points: activity.points,
      maxParticipants: activity.maxParticipants,
      programId: activity.programId,
      programName: activity.program.name,
      isRecurring: activity.isRecurring,
      recurrenceType: activity.recurrenceType,
      isActive: activity.isActive,
      participantCount: activity._count.participations,
      createdAt: activity.createdAt.toISOString(),
    }))

    return NextResponse.json({
      success: true,
      activities: transformedActivities
    })

  } catch (error) {
    console.error('Error fetching activities:', error)
    return NextResponse.json({
      success: false,
      message: 'Aktiviteler yüklenirken hata oluştu'
    }, { status: 500 })
  }
}

// POST /api/activities - Create a new activity
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
    const { 
      title, 
      description, 
      activityDate, 
      startTime, 
      endTime, 
      points, 
      maxParticipants, 
      programId,
      isRecurring,
      recurrenceType,
      recurrenceEndDate, // New field for when recurring should stop
      autoIncludeAllStudents // New field for auto-including all students
    } = body

    // Validate required fields
    if (!title || !activityDate || !startTime || !points || !programId) {
      return NextResponse.json({
        success: false,
        message: 'Başlık, tarih, saat, puan ve dönem seçimi gereklidir'
      }, { status: 400 })
    }

    // Validate points range (1-100 as per ARDN system)
    if (points < 1 || points > 100) {
      return NextResponse.json({
        success: false,
        message: 'ARDN puanı 1-100 arasında olmalıdır'
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

    // Validate date/time logic
    const activityDateTime = new Date(activityDate)
    const startDateTime = new Date(startTime)
    const endDateTime = endTime ? new Date(endTime) : null

    if (endDateTime && endDateTime <= startDateTime) {
      return NextResponse.json({
        success: false,
        message: 'Bitiş saati başlangıç saatinden sonra olmalıdır'
      }, { status: 400 })
    }

    // Validate max participants
    if (maxParticipants && maxParticipants < 1) {
      return NextResponse.json({
        success: false,
        message: 'Maksimum katılımcı sayısı pozitif bir sayı olmalıdır'
      }, { status: 400 })
    }

    // Create the activity(ies)
    if (isRecurring && recurrenceType && recurrenceEndDate) {
      // Generate all dates for recurring activities
      const activityDates = generateRecurringDates(
        new Date(activityDate),
        new Date(recurrenceEndDate),
        recurrenceType
      )
      
      // Create multiple activities in a transaction
      const activities = await prisma.$transaction(
        activityDates.map(date => {
          // Calculate start and end times for this specific date
          const dayStart = new Date(startTime)
          const dayEnd = endTime ? new Date(endTime) : null
          
          const activityStart = new Date(date)
          activityStart.setHours(dayStart.getHours(), dayStart.getMinutes(), 0, 0)
          
          const activityEnd = dayEnd ? new Date(date) : null
          if (activityEnd && dayEnd) {
            activityEnd.setHours(dayEnd.getHours(), dayEnd.getMinutes(), 0, 0)
          }
          
          return prisma.activity.create({
            data: {
              title: title.trim(),
              description: description?.trim() || null,
              activityDate: date,
              startTime: activityStart,
              endTime: activityEnd,
              points: parseInt(points),
              maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
              programId,
              organizationId: session.user.organizationId,
              createdById: session.user.id,
              isRecurring: true,
              recurrenceType,
              isActive: true
            }
          })
        })
      )
      
      // Handle auto-inclusion of students if requested
      const autoInclusionResults = []
      if (autoIncludeAllStudents) {
        for (const activity of activities) {
          const inclusionResult = await autoIncludeStudentsInActivity(
            activity.id,
            programId,
            session.user.organizationId,
            session.user.id,
            parseInt(points)
          )
          autoInclusionResults.push({
            activityId: activity.id,
            activityDate: activity.activityDate.toISOString(),
            ...inclusionResult
          })
        }
      }
      
      return NextResponse.json({
        success: true,
        message: `${activities.length} tekrarlı aktivite başarıyla oluşturuldu${
          autoIncludeAllStudents ? ' ve tüm öğrenciler otomatik dahil edildi' : ''
        }`,
        activitiesCreated: activities.length,
        autoInclusionResults,
        activities: activities.map(activity => ({
          id: activity.id,
          title: activity.title,
          activityDate: activity.activityDate.toISOString(),
          isRecurring: activity.isRecurring,
          recurrenceType: activity.recurrenceType
        }))
      }, { status: 201 })
    } else {
      // Create single activity
      const activity = await prisma.activity.create({
        data: {
          title: title.trim(),
          description: description?.trim() || null,
          activityDate: activityDateTime,
          startTime: startDateTime,
          endTime: endDateTime,
          points: parseInt(points),
          maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
          programId,
          organizationId: session.user.organizationId,
          createdById: session.user.id,
          isRecurring: Boolean(isRecurring),
          recurrenceType: isRecurring ? recurrenceType : null,
          isActive: true
        },
        include: {
          program: {
            select: {
              id: true,
              name: true,
              isActive: true
            }
          },
          _count: {
            select: {
              participations: true
            }
          }
        }
      })

      // Handle auto-inclusion of students if requested
      let autoInclusionResult = null
      if (autoIncludeAllStudents) {
        autoInclusionResult = await autoIncludeStudentsInActivity(
          activity.id,
          programId,
          session.user.organizationId,
          session.user.id,
          parseInt(points)
        )
      }

      return NextResponse.json({
        success: true,
        message: `Aktivite başarıyla oluşturuldu${
          autoIncludeAllStudents && autoInclusionResult?.success 
            ? ` ve ${autoInclusionResult.studentsIncluded} öğrenci otomatik dahil edildi` 
            : ''
        }`,
        activity: {
          id: activity.id,
          title: activity.title,
          description: activity.description,
          activityDate: activity.activityDate.toISOString(),
          startTime: activity.startTime.toISOString(),
          endTime: activity.endTime ? activity.endTime.toISOString() : null,
          points: activity.points,
          maxParticipants: activity.maxParticipants,
          programId: activity.programId,
          programName: activity.program.name,
          isRecurring: activity.isRecurring,
          recurrenceType: activity.recurrenceType,
          isActive: activity.isActive,
          participantCount: activity._count.participations + (autoInclusionResult?.studentsIncluded || 0),
          createdAt: activity.createdAt.toISOString(),
        },
        autoInclusionResult
      }, { status: 201 })
    }

  } catch (error) {
    console.error('Error creating activity:', error)
    return NextResponse.json({
      success: false,
      message: 'Aktivite oluşturulurken hata oluştu'
    }, { status: 500 })
  }
}

// PUT /api/activities - Update an existing activity
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
    const { 
      id, 
      title, 
      description, 
      activityDate, 
      startTime, 
      endTime, 
      points, 
      maxParticipants,
      isActive,
      isRecurring,
      recurrenceType
    } = body

    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'Aktivite ID gereklidir'
      }, { status: 400 })
    }

    // Verify the activity belongs to the user's organization
    const existingActivity = await prisma.activity.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId
      }
    })

    if (!existingActivity) {
      return NextResponse.json({
        success: false,
        message: 'Aktivite bulunamadı'
      }, { status: 404 })
    }

    // Validate points if provided
    if (points && (points < 1 || points > 100)) {
      return NextResponse.json({
        success: false,
        message: 'ARDN puanı 1-100 arasında olmalıdır'
      }, { status: 400 })
    }

    // Validate date/time logic if provided
    if (startTime && endTime) {
      const startDateTime = new Date(startTime)
      const endDateTime = new Date(endTime)
      
      if (endDateTime <= startDateTime) {
        return NextResponse.json({
          success: false,
          message: 'Bitiş saati başlangıç saatinden sonra olmalıdır'
        }, { status: 400 })
      }
    }

    // Update the activity
    const updatedActivity = await prisma.activity.update({
      where: { id },
      data: {
        ...(title && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(activityDate && { activityDate: new Date(activityDate) }),
        ...(startTime && { startTime: new Date(startTime) }),
        ...(endTime !== undefined && { endTime: endTime ? new Date(endTime) : null }),
        ...(points && { points: parseInt(points) }),
        ...(maxParticipants !== undefined && { maxParticipants: maxParticipants ? parseInt(maxParticipants) : null }),
        ...(isActive !== undefined && { isActive }),
        ...(isRecurring !== undefined && { isRecurring: Boolean(isRecurring) }),
        ...(recurrenceType !== undefined && { recurrenceType: isRecurring ? recurrenceType : null })
      },
      include: {
        program: {
          select: {
            id: true,
            name: true,
            isActive: true
          }
        },
        _count: {
          select: {
            participations: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Aktivite başarıyla güncellendi',
      activity: {
        id: updatedActivity.id,
        title: updatedActivity.title,
        description: updatedActivity.description,
        activityDate: updatedActivity.activityDate.toISOString(),
        startTime: updatedActivity.startTime.toISOString(),
        endTime: updatedActivity.endTime ? updatedActivity.endTime.toISOString() : null,
        points: updatedActivity.points,
        maxParticipants: updatedActivity.maxParticipants,
        programId: updatedActivity.programId,
        programName: updatedActivity.program.name,
        isRecurring: updatedActivity.isRecurring,
        recurrenceType: updatedActivity.recurrenceType,
        isActive: updatedActivity.isActive,
        participantCount: updatedActivity._count.participations,
        createdAt: updatedActivity.createdAt.toISOString(),
      }
    })

  } catch (error) {
    console.error('Error updating activity:', error)
    return NextResponse.json({
      success: false,
      message: 'Aktivite güncellenirken hata oluştu'
    }, { status: 500 })
  }
}

// DELETE /api/activities - Soft delete an activity
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
    const activityId = searchParams.get('id')

    if (!activityId) {
      return NextResponse.json({
        success: false,
        message: 'Aktivite ID gereklidir'
      }, { status: 400 })
    }

    // Verify the activity belongs to the user's organization
    const existingActivity = await prisma.activity.findFirst({
      where: {
        id: activityId,
        organizationId: session.user.organizationId
      }
    })

    if (!existingActivity) {
      return NextResponse.json({
        success: false,
        message: 'Aktivite bulunamadı'
      }, { status: 404 })
    }

    // Soft delete - set isActive to false instead of actual deletion
    await prisma.activity.update({
      where: { id: activityId },
      data: { isActive: false }
    })

    return NextResponse.json({
      success: true,
      message: 'Aktivite başarıyla kaldırıldı'
    })

  } catch (error) {
    console.error('Error deleting activity:', error)
    return NextResponse.json({
      success: false,
      message: 'Aktivite silinirken hata oluştu'
    }, { status: 500 })
  }
}