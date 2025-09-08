import { NextResponse } from 'next/server'
import prisma from '../../../lib/prisma'

export async function GET() {
  try {
    // Get all data from database
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true
      }
    })
    
    const programs = await prisma.program.findMany({
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
      select: {
        id: true,
        studentNumber: true,
        name: true,
        class: true,
        totalPoints: true,
        isActive: true
      }
    })
    
    const activities = await prisma.activity.findMany({
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
      message: 'Tüm veriler başarıyla alındı',
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
    console.error('Database error:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Veri alınırken hata oluştu',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}