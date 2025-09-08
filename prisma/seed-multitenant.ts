import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Type assertion for the new role (memory: role type casting requirement)
const ORGANIZATION_ADMIN = 'ORGANIZATION_ADMIN' as UserRole

// Note: TypeScript LSP might show organizationId errors until restart
// But the code works correctly at runtime after prisma generate

async function main() {
  console.log('🏢 Starting multi-tenant database seeding...')

  try {
    // Clean existing data first
    await prisma.participation.deleteMany()
    await prisma.pointAdjustment.deleteMany()
    await prisma.activity.deleteMany()
    await prisma.student.deleteMany()
    await prisma.teacherProgram.deleteMany()
    await prisma.program.deleteMany()
    await prisma.user.deleteMany()
    await prisma.organization.deleteMany()

    console.log('🧹 Cleaned existing data')

    const hashedPassword = await bcrypt.hash('123456', 10)
    
    // Create Organization 1: Ankara Erkek Öğrenci Yurdu
    const org1 = await prisma.organization.create({
      data: {
        name: 'Ankara Erkek Öğrenci Yurdu',
        slug: 'ankara-erkek-yurdu',
        address: 'Çankaya, Ankara',
        phone: '+90 312 123 4567',
        email: 'info@ankaraerkek.edu.tr',
        isActive: true
      }
    })

    // Create Organization 2: İstanbul Kız Öğrenci Yurdu
    const org2 = await prisma.organization.create({
      data: {
        name: 'İstanbul Kız Öğrenci Yurdu',
        slug: 'istanbul-kiz-yurdu',
        address: 'Beşiktaş, İstanbul',
        phone: '+90 212 987 6543',
        email: 'info@istanbulkiz.edu.tr',
        isActive: true
      }
    })

    console.log('✅ Organizations created:', org1.name, 'and', org2.name)

    // Create users for Organization 1
    const user1Org1 = await prisma.user.create({
      data: {
        email: 'admin@ankaraerkek.edu.tr',
        passwordHash: hashedPassword,
        name: 'Mehmet Yılmaz',
        role: ORGANIZATION_ADMIN,
        organizationId: org1.id,
        isActive: true
      }
    })

    const teacher1Org1 = await prisma.user.create({
      data: {
        email: 'ogretmen1@ankaraerkek.edu.tr',
        passwordHash: hashedPassword,
        name: 'Ahmet Demir',
        role: 'TEACHER',
        organizationId: org1.id,
        isActive: true
      }
    })

    // Create users for Organization 2
    const user1Org2 = await prisma.user.create({
      data: {
        email: 'admin@istanbulkiz.edu.tr',
        passwordHash: hashedPassword,
        name: 'Ayşe Kaya',
        role: ORGANIZATION_ADMIN,
        organizationId: org2.id,
        isActive: true
      }
    })

    const teacher1Org2 = await prisma.user.create({
      data: {
        email: 'ogretmen1@istanbulkiz.edu.tr',
        passwordHash: hashedPassword,
        name: 'Zeynep Özkan',
        role: 'TEACHER',
        organizationId: org2.id,
        isActive: true
      }
    })

    console.log('✅ Users created for both organizations')

    // Create programs for Organization 1
    const program1Org1 = await prisma.program.create({
      data: {
        name: '2024-2025 Güz Dönemi',
        description: 'Ankara Erkek Yurdu Güz Dönemi Programı',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-01-31'),
        organizationId: org1.id,
        createdById: user1Org1.id,
        isActive: true
      }
    })

    // Create programs for Organization 2
    const program1Org2 = await prisma.program.create({
      data: {
        name: '2024-2025 Güz Dönemi',
        description: 'İstanbul Kız Yurdu Güz Dönemi Programı',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-01-31'),
        organizationId: org2.id,
        createdById: user1Org2.id,
        isActive: true
      }
    })

    console.log('✅ Programs created for both organizations')

    // Create teacher-program relationships
    await prisma.teacherProgram.create({
      data: {
        userId: teacher1Org1.id,
        programId: program1Org1.id
      }
    })

    await prisma.teacherProgram.create({
      data: {
        userId: teacher1Org2.id,
        programId: program1Org2.id
      }
    })

    // Create students for Organization 1 (Ankara)
    const studentsOrg1 = [
      {
        studentNumber: 'ANK2024001',
        name: 'Ali Veli',
        class: '10-A',
        organizationId: org1.id,
        programId: program1Org1.id,
        totalPoints: 850
      },
      {
        studentNumber: 'ANK2024002',
        name: 'Mustafa Çelik',
        class: '10-A',
        organizationId: org1.id,
        programId: program1Org1.id,
        totalPoints: 920
      },
      {
        studentNumber: 'ANK2024003',
        name: 'Emre Kara',
        class: '11-B',
        organizationId: org1.id,
        programId: program1Org1.id,
        totalPoints: 1150
      }
    ]

    // Create students for Organization 2 (İstanbul)
    const studentsOrg2 = [
      {
        studentNumber: 'IST2024001',
        name: 'Elif Yılmaz',
        class: '10-A',
        organizationId: org2.id,
        programId: program1Org2.id,
        totalPoints: 1250
      },
      {
        studentNumber: 'IST2024002',
        name: 'Ayşe Demir',
        class: '10-B',
        organizationId: org2.id,
        programId: program1Org2.id,
        totalPoints: 980
      },
      {
        studentNumber: 'IST2024003',
        name: 'Fatma Özkan',
        class: '11-A',
        organizationId: org2.id,
        programId: program1Org2.id,
        totalPoints: 1380
      }
    ]

    for (const student of studentsOrg1) {
      await prisma.student.create({ data: student })
    }

    for (const student of studentsOrg2) {
      await prisma.student.create({ data: student })
    }

    console.log('✅ Students created for both organizations')

    // Create activities for Organization 1
    const activity1Org1 = await prisma.activity.create({
      data: {
        title: 'Sabah Namazı',
        description: 'Cemaatle sabah namazı kılma',
        activityDate: new Date(),
        startTime: new Date('2024-09-08T05:30:00'),
        endTime: new Date('2024-09-08T06:00:00'),
        points: 30,
        organizationId: org1.id,
        programId: program1Org1.id,
        createdById: teacher1Org1.id,
        isRecurring: true,
        recurrenceType: 'DAILY'
      }
    })

    // Create activities for Organization 2
    const activity1Org2 = await prisma.activity.create({
      data: {
        title: 'Sabah Sporu',
        description: 'Sabah jimnastik ve egzersiz',
        activityDate: new Date(),
        startTime: new Date('2024-09-08T06:30:00'),
        endTime: new Date('2024-09-08T07:30:00'),
        points: 25,
        organizationId: org2.id,
        programId: program1Org2.id,
        createdById: teacher1Org2.id,
        isRecurring: true,
        recurrenceType: 'DAILY'
      }
    })

    console.log('✅ Activities created for both organizations')

    console.log('🎉 Multi-tenant database seeding completed successfully!')
    console.log('')
    console.log('🏢 Organization 1 - Ankara Erkek Öğrenci Yurdu:')
    console.log('   👤 Admin: admin@ankaraerkek.edu.tr / 123456')
    console.log('   👨‍🏫 Teacher: ogretmen1@ankaraerkek.edu.tr / 123456')
    console.log('   📊 Students: 3 students with ARDN points')
    console.log('')
    console.log('🏢 Organization 2 - İstanbul Kız Öğrenci Yurdu:')
    console.log('   👤 Admin: admin@istanbulkiz.edu.tr / 123456')
    console.log('   👩‍🏫 Teacher: ogretmen1@istanbulkiz.edu.tr / 123456')
    console.log('   📊 Students: 3 students with ARDN points')
    
  } catch (error) {
    console.error('❌ Error during multi-tenant seeding:', error)
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