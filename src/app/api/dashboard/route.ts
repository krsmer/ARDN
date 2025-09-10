import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/route'
import prisma from '../../../lib/prisma'

// GET /api/dashboard - Fetch dashboard statistics and recent activities
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.organizationId) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 })
    }

    // Fetch dashboard statistics in parallel for better performance
    const [
      totalStudents,
      activePrograms,
      totalActivities,
      recentActivities,
      totalPoints
    ] = await Promise.all([
      // Total students count
      prisma.student.count({
        where: {
          organizationId: session.user.organizationId,
          isActive: true
        }
      }),

      // Active programs count
      prisma.program.count({
        where: {
          organizationId: session.user.organizationId,
          isActive: true
        }
      }),

      // Total activities count
      prisma.activity.count({
        where: {
          organizationId: session.user.organizationId,
          isActive: true
        }
      }),

      // Recent activities (last 3)
      prisma.activity.findMany({
        where: {
          organizationId: session.user.organizationId,
          isActive: true
        },
        include: {
          program: {
            select: {
              name: true
            }
          },
          _count: {
            select: {
              participations: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 3
      }),

      // Total ARDN points awarded across all students
      prisma.student.aggregate({
        where: {
          organizationId: session.user.organizationId,
          isActive: true
        },
        _sum: {
          totalPoints: true
        }
      })
    ])

    // Transform recent activities for display
    const transformedRecentActivities = recentActivities.map(activity => {
      // Calculate time relative to the activity's scheduled start time, not creation time
      const activityStartTime = new Date(activity.activityDate)
      activityStartTime.setHours(
        activity.startTime.getHours(),
        activity.startTime.getMinutes(),
        0,
        0
      )
      
      const timeDiff = Date.now() - activityStartTime.getTime()
      const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60))
      const daysAgo = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
      
      let timeAgo = ''
      if (timeDiff < 0) {
        // Activity is in the future
        const futureHours = Math.floor(Math.abs(timeDiff) / (1000 * 60 * 60))
        const futureDays = Math.floor(Math.abs(timeDiff) / (1000 * 60 * 60 * 24))
        
        if (futureDays > 0) {
          timeAgo = `${futureDays} gün sonra`
        } else if (futureHours > 0) {
          timeAgo = `${futureHours} saat sonra`
        } else {
          const futureMinutes = Math.floor(Math.abs(timeDiff) / (1000 * 60))
          timeAgo = futureMinutes > 0 ? `${futureMinutes} dakika sonra` : 'Şimdi'
        }
      } else {
        // Activity is in the past
        if (daysAgo > 0) {
          timeAgo = `${daysAgo} gün önce`
        } else if (hoursAgo > 0) {
          timeAgo = `${hoursAgo} saat önce`
        } else {
          const minutesAgo = Math.floor(timeDiff / (1000 * 60))
          timeAgo = minutesAgo > 0 ? `${minutesAgo} dakika önce` : 'Az önce'
        }
      }

      return {
        id: activity.id,
        title: activity.title,
        programName: activity.program.name,
        participantCount: activity._count.participations,
        activityDate: activity.activityDate.toISOString(),
        timeAgo,
        isRecurring: activity.isRecurring,
        points: activity.points
      }
    })

    const statistics = {
      totalStudents,
      activePrograms,
      totalActivities,
      totalPoints: totalPoints._sum.totalPoints || 0,
      recentActivities: transformedRecentActivities
    }

    return NextResponse.json({
      success: true,
      statistics
    })

  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json({
      success: false,
      message: 'Dashboard verileri yüklenirken hata oluştu'
    }, { status: 500 })
  }
}