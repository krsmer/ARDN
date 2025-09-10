import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/route'
import prisma from '../../../lib/prisma'

// GET /api/reports - Get aggregated report data
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
    const reportType = searchParams.get('type') || 'summary'
    const programId = searchParams.get('programId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const studentClass = searchParams.get('class')

    // Build base where clause for organization filtering
    const baseWhere = {
      organizationId: session.user.organizationId
    }

    // Add program filter if specified
    const programFilter = programId ? { programId } : {}

    // Add date range filter if specified
    const dateFilter: any = {}
    if (startDate) {
      dateFilter.gte = new Date(startDate)
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate)
    }

    switch (reportType) {
      case 'participation': {
        // Get participation data aggregated by date
        const participations = await prisma.participation.findMany({
          where: {
            student: baseWhere,
            activity: {
              ...programFilter,
              ...(Object.keys(dateFilter).length > 0 && { activityDate: dateFilter })
            }
          },
          include: {
            activity: {
              select: {
                activityDate: true,
                programId: true
              }
            },
            student: {
              select: {
                class: true
              }
            }
          }
        })

        // Filter by class if specified
        const filteredParticipations = studentClass
          ? participations.filter((p: any) => p.student.class === studentClass)
          : participations

        // Group by date and calculate participation rates
        const participationByDate: { [key: string]: { total: number, unique: Set<string> } } = {}
        
        filteredParticipations.forEach((participation: any) => {
          const date = participation.activity.activityDate.toISOString().split('T')[0]
          if (!participationByDate[date]) {
            participationByDate[date] = { total: 0, unique: new Set() }
          }
          participationByDate[date].total += 1
          participationByDate[date].unique.add(participation.studentId)
        })

        const participationData = Object.entries(participationByDate).map(([date, data]) => ({
          date,
          totalParticipations: data.total,
          uniqueStudents: data.unique.size,
          averageParticipationsPerStudent: data.unique.size > 0 ? data.total / data.unique.size : 0
        }))

        return NextResponse.json({
          success: true,
          data: {
            type: 'participation',
            participationData: participationData.sort((a, b) => a.date.localeCompare(b.date))
          }
        })
      }

      case 'leaderboard': {
        // Get students with their total points, ordered by points descending
        const students = await prisma.student.findMany({
          where: {
            ...baseWhere,
            isActive: true,
            ...(programId && { programId }),
            ...(studentClass && { class: studentClass })
          },
          include: {
            program: {
              select: {
                name: true
              }
            },
            participations: {
              select: {
                pointsEarned: true,
                participatedAt: true
              },
              ...(Object.keys(dateFilter).length > 0 && {
                where: {
                  participatedAt: dateFilter
                }
              })
            }
          },
          orderBy: {
            totalPoints: 'desc'
          }
        })

        const leaderboardData = students.map((student: any, index: number) => ({
          rank: index + 1,
          id: student.id,
          name: student.name,
          studentNumber: student.studentNumber,
          class: student.class,
          photoUrl: student.photoUrl,
          totalPoints: student.totalPoints,
          programName: student.program.name,
          recentParticipations: student.participations.length,
          pointsInPeriod: student.participations.reduce((sum: number, p: any) => sum + p.pointsEarned, 0)
        }))

        return NextResponse.json({
          success: true,
          data: {
            type: 'leaderboard',
            students: leaderboardData
          }
        })
      }

      case 'activity-summary': {
        // Get activity statistics
        const activities = await prisma.activity.findMany({
          where: {
            ...baseWhere,
            ...programFilter,
            ...(Object.keys(dateFilter).length > 0 && { activityDate: dateFilter })
          },
          include: {
            participations: true,
            program: {
              select: {
                name: true
              }
            }
          }
        })

        const activitySummary = activities.map((activity: any) => ({
          id: activity.id,
          title: activity.title,
          date: activity.activityDate.toISOString().split('T')[0],
          programName: activity.program.name,
          totalParticipants: activity.participations.length,
          maxParticipants: activity.maxParticipants,
          participationRate: activity.maxParticipants 
            ? (activity.participations.length / activity.maxParticipants) * 100 
            : null,
          pointsAwarded: activity.participations.reduce((sum: number, p: any) => sum + p.pointsEarned, 0),
          averagePoints: activity.participations.length > 0
            ? activity.participations.reduce((sum: number, p: any) => sum + p.pointsEarned, 0) / activity.participations.length
            : 0
        }))

        return NextResponse.json({
          success: true,
          data: {
            type: 'activity-summary',
            activities: activitySummary
          }
        })
      }

      case 'summary':
      default: {
        // Get overall summary statistics
        const [
          totalStudents,
          totalActivities,
          totalParticipations,
          totalPointsAwarded,
          activePrograms
        ] = await Promise.all([
          prisma.student.count({
            where: { ...baseWhere, isActive: true }
          }),
          prisma.activity.count({
            where: { ...baseWhere, isActive: true }
          }),
          prisma.participation.count({
            where: {
              student: baseWhere
            }
          }),
          prisma.participation.aggregate({
            where: {
              student: baseWhere
            },
            _sum: {
              pointsEarned: true
            }
          }),
          prisma.program.count({
            where: { ...baseWhere, isActive: true }
          })
        ])

        // Get top performers
        const topStudents = await prisma.student.findMany({
          where: {
            ...baseWhere,
            isActive: true
          },
          select: {
            id: true,
            name: true,
            totalPoints: true,
            class: true,
            program: {
              select: {
                name: true
              }
            }
          },
          orderBy: {
            totalPoints: 'desc'
          },
          take: 5
        })

        return NextResponse.json({
          success: true,
          data: {
            type: 'summary',
            summary: {
              totalStudents,
              totalActivities,
              totalParticipations,
              totalPointsAwarded: totalPointsAwarded._sum.pointsEarned || 0,
              activePrograms,
              averagePointsPerStudent: totalStudents > 0 
                ? (totalPointsAwarded._sum.pointsEarned || 0) / totalStudents 
                : 0,
              averageParticipationsPerActivity: totalActivities > 0
                ? totalParticipations / totalActivities
                : 0
            },
            topStudents: topStudents.map((student: any, index: number) => ({
              rank: index + 1,
              ...student,
              programName: student.program.name
            }))
          }
        })
      }
    }

  } catch (error) {
    console.error('Error generating reports:', error)
    return NextResponse.json({
      success: false,
      message: 'Rapor oluşturulurken hata oluştu'
    }, { status: 500 })
  }
}