import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  try {
    // Clean existing data first
    await prisma.participation.deleteMany()
    await prisma.pointAdjustment.deleteMany()
    await prisma.activity.deleteMany()
    await prisma.student.deleteMany()
    await prisma.teacherProgram.deleteMany()
    await prisma.program.deleteMany()
    await prisma.user.deleteMany()

    console.log('🧹 Cleaned existing data')

    // Create a test teacher user
    const hashedPassword = await bcrypt.hash('123456', 10)
    
    const testUser = await prisma.user.create({
      data: {
        email: 'ogretmen@test.com',
        passwordHash: hashedPassword,
        name: 'Test Öğretmen',
        role: 'TEACHER',
        isActive: true,
        organizationId: testOrg.id
      }
    })

    console.log('✅ Test user created:', testUser.email)

    // Create a test program
    const testProgram = await prisma.program.create({
      data: {
        name: '2024-2025 Güz Dönemi',
        description: 'Test academic year program',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-06-15'),
        isActive: true,
        organizationId: testOrg.id,
        createdById: testUser.id
      }
    })

    console.log('✅ Test program created:', testProgram.name)

    // Create teacher-program relationship
    await prisma.teacherProgram.create({
      data: {
        userId: testUser.id,
        programId: testProgram.id
      }
    })


    // Create test students
    const students = [
      {
        studentNumber: '2024001',
        name: 'Ahmet Yılmaz',
        class: '10-A',
        programId: testProgram.id
      },
      {
        studentNumber: '2024002',
        name: 'Ayşe Kaya',
        class: '10-A',
        programId: testProgram.id
      },
      {
        studentNumber: '2024003',
        name: 'Mehmet Demir',
        class: '10-B',
        programId: testProgram.id
      }
    ]

    for (const student of students) {
      await prisma.student.create({
        data: {
          ...student,
          organizationId: testOrg.id
        }
      })
    }

    // Create test activity
    const testActivity = await prisma.activity.create({
      data: {
        title: 'Sabah Namazı',
        description: 'Cemaatle sabah namazı',
        activityDate: new Date(),
        startTime: new Date('2024-09-08T05:30:00'),
        endTime: new Date('2024-09-08T06:00:00'),
        points: 30, // 30 ARDN points
        programId: testProgram.id,
        organizationId: testOrg.id,
        createdById: testUser.id,
        isRecurring: true,
        recurrenceType: 'DAILY'
      }
    })

    console.log('✅ Test activity created:', testActivity.title)
    console.log('🎉 Database seeding completed successfully!')
    
  } catch (error) {
    console.error('❌ Error during seeding:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })