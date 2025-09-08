import { NextResponse } from 'next/server'
import prisma from '../../../lib/prisma'

export async function POST(request: Request) {
  try {
    const { studentId, activityId, points } = await request.json()
    
    // Get student and activity info
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { name: true, totalPoints: true }
    })
    
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      select: { title: true, points: true }
    })
    
    if (!student || !activity) {
      return NextResponse.json({
        status: 'error',
        message: 'Öğrenci veya aktivite bulunamadı'
      }, { status: 404 })
    }
    
    // Create participation record
    const participation = await prisma.participation.create({
      data: {
        studentId,
        activityId,
        participatedAt: new Date(),
        pointsEarned: points || activity.points,
        recordedById: 'cmfb13t920000ewv8heoy7dtw' // Default teacher ID
      }
    })
    
    // Update student's total points
    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: {
        totalPoints: student.totalPoints + (points || activity.points)
      }
    })
    
    return NextResponse.json({
      status: 'success',
      message: 'Katılım kaydedildi ve ARDN puanı eklendi',
      data: {
        student: {
          name: student.name,
          oldPoints: student.totalPoints,
          newPoints: updatedStudent.totalPoints,
          earnedPoints: points || activity.points
        },
        activity: {
          title: activity.title,
          points: activity.points
        },
        participation: {
          id: participation.id,
          participatedAt: participation.participatedAt
        }
      }
    })
  } catch (error) {
    console.error('Participation error:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Katılım kaydedilirken hata oluştu',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Get participation history with student and activity details
    const participations = await prisma.participation.findMany({
      include: {
        student: {
          select: {
            name: true,
            studentNumber: true,
            class: true,
            totalPoints: true
          }
        },
        activity: {
          select: {
            title: true,
            points: true,
            activityDate: true
          }
        }
      },
      orderBy: {
        participatedAt: 'desc'
      }
    })
    
    return NextResponse.json({
      status: 'success',
      message: 'Katılım geçmişi alındı',
      data: participations
    })
  } catch (error) {
    console.error('Get participations error:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Katılım geçmişi alınırken hata oluştu',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}