import { NextResponse } from 'next/server'
import prisma from '../../../lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    // Test database connection
    const userCount = await prisma.user.count()
    
    return NextResponse.json({ 
      status: 'success', 
      message: 'Database bağlantısı başarılı', 
      userCount 
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ 
      status: 'error', 
      message: 'Database bağlantısı başarısız',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST() {
  try {
    // Create test data
    const hashedPassword = await bcrypt.hash('123456', 10)
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'ogretmen@test.com' }
    })
    
    if (existingUser) {
      return NextResponse.json({ 
        status: 'info', 
        message: 'Test verisi zaten mevcut',
        user: { id: existingUser.id, email: existingUser.email, name: existingUser.name }
      })
    }
    
    // Create test user
    const testUser = await prisma.user.create({
      data: {
        email: 'ogretmen@test.com',
        passwordHash: hashedPassword,
        name: 'Test Öğretmen',
        role: 'TEACHER',
        isActive: true
      }
    })

    // Create test program
    const testProgram = await prisma.program.create({
      data: {
        name: '2024-2025 Güz Dönemi',
        description: 'Test akademik yıl programı',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-06-15'),
        isActive: true,
        createdById: testUser.id
      }
    })

    // Create teacher-program relationship
    await prisma.teacherProgram.create({
      data: {
        userId: testUser.id,
        programId: testProgram.id
      }
    })

    // Create test students
    const students = await Promise.all([
      prisma.student.create({
        data: {
          studentNumber: '2024001',
          name: 'Ahmet Yılmaz',
          class: '10-A',
          programId: testProgram.id,
          totalPoints: 1250
        }
      }),
      prisma.student.create({
        data: {
          studentNumber: '2024002',
          name: 'Ayşe Kaya',
          class: '10-A',
          programId: testProgram.id,
          totalPoints: 1150
        }
      }),
      prisma.student.create({
        data: {
          studentNumber: '2024003',
          name: 'Mehmet Demir',
          class: '10-B',
          programId: testProgram.id,
          totalPoints: 980
        }
      })
    ])

    // Create test activity
    const testActivity = await prisma.activity.create({
      data: {
        title: 'Sabah Namazı',
        description: 'Cemaatle sabah namazı kılma',
        activityDate: new Date(),
        startTime: new Date('2024-09-08T05:30:00'),
        endTime: new Date('2024-09-08T06:00:00'),
        points: 30,
        programId: testProgram.id,
        createdById: testUser.id,
        isRecurring: true,
        recurrenceType: 'DAILY'
      }
    })

    return NextResponse.json({ 
      status: 'success', 
      message: 'Test verisi başarıyla oluşturuldu',
      data: {
        user: { id: testUser.id, email: testUser.email, name: testUser.name },
        program: { id: testProgram.id, name: testProgram.name },
        studentsCount: students.length,
        activity: { id: testActivity.id, title: testActivity.title }
      }
    })
  } catch (error) {
    console.error('Data creation error:', error)
    return NextResponse.json({ 
      status: 'error', 
      message: 'Veri oluşturma hatası',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}