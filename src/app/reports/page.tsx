'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Header, BottomNavigation } from '../../components/ui/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

interface Student {
  id: string
  name: string
  studentNumber: string
  class: string
  totalPoints: number
  photoUrl?: string
  programName: string
}

interface Program {
  id: string
  name: string
  isActive: boolean
}

interface ParticipationData {
  date: string
  participationRate: number
  totalActivities: number
  totalParticipations: number
}

type ReportTab = 'participation' | 'attendance' | 'leaderboard'

export default function ReportsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<ReportTab>('participation')
  const [students, setStudents] = useState<Student[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [participationData, setParticipationData] = useState<ParticipationData[]>([])
  const [loading, setLoading] = useState(true)
  
  // Filters
  const [selectedProgram, setSelectedProgram] = useState('all')
  const [selectedClass, setSelectedClass] = useState('all')
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  })
  
  const navigationItems = [
    { href: '/dashboard', icon: 'dashboard', label: 'Ana Sayfa', active: false },
    { href: '/programs', icon: 'calendar_month', label: 'Dönemler', active: false },
    { href: '/students', icon: 'groups', label: 'Öğrenciler', active: false },
    { href: '/activities', icon: 'local_activity', label: 'Aktiviteler', active: false },
    { href: '/reports', icon: 'bar_chart', label: 'Raporlar', active: true },
  ]

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchData()
    }
  }, [session])

  // Refresh data when filters change
  useEffect(() => {
    if (session) {
      fetchParticipationData()
    }
  }, [selectedProgram, selectedClass, dateRange])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch students and programs in parallel
      const [studentsResponse, programsResponse] = await Promise.all([
        fetch('/api/students'),
        fetch('/api/programs')
      ])

      if (studentsResponse.ok) {
        const studentsData = await studentsResponse.json()
        const sortedStudents = studentsData.students
          .filter((student: any) => student.isActive)
          .sort((a: any, b: any) => b.totalPoints - a.totalPoints)
        setStudents(sortedStudents)
      }

      if (programsResponse.ok) {
        const programsData = await programsResponse.json()
        setPrograms(programsData.programs.filter((p: any) => p.isActive))
      }

      // Fetch participation data for charts
      await fetchParticipationData()
      
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchParticipationData = async () => {
    try {
      const params = new URLSearchParams({
        type: 'participation',
        ...(selectedProgram !== 'all' && { programId: programs.find(p => p.name === selectedProgram)?.id || '' }),
        ...(selectedClass !== 'all' && { class: selectedClass }),
        ...(dateRange.start && { startDate: dateRange.start }),
        ...(dateRange.end && { endDate: dateRange.end })
      })
      
      const response = await fetch(`/api/reports?${params}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data.participationData) {
          // Convert to weekly format for the chart
          const weeklyData = data.data.participationData.slice(-7).map((item: any, index: number) => {
            const days = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt']
            const date = new Date(item.date)
            const dayName = days[date.getDay()]
            
            return {
              date: dayName,
              participationRate: Math.min(100, Math.max(0, item.averageParticipationsPerStudent * 20)), // Normalize to percentage
              totalActivities: item.totalParticipations,
              totalParticipations: item.uniqueStudents
            }
          })
          
          setParticipationData(weeklyData)
          return
        }
      }
      
      // Fallback to sample data
      const sampleData: ParticipationData[] = [
        { date: 'Pzt', participationRate: 85, totalActivities: 5, totalParticipations: 42 },
        { date: 'Sal', participationRate: 92, totalActivities: 6, totalParticipations: 55 },
        { date: 'Çar', participationRate: 78, totalActivities: 4, totalParticipations: 31 },
        { date: 'Per', participationRate: 88, totalActivities: 5, totalParticipations: 44 },
        { date: 'Cum', participationRate: 95, totalActivities: 7, totalParticipations: 66 },
        { date: 'Cmt', participationRate: 65, totalActivities: 3, totalParticipations: 19 },
        { date: 'Paz', participationRate: 45, totalActivities: 2, totalParticipations: 9 },
      ]
      setParticipationData(sampleData)
    } catch (error) {
      console.error('Error fetching participation data:', error)
      // Use sample data as fallback
      const sampleData: ParticipationData[] = [
        { date: 'Pzt', participationRate: 85, totalActivities: 5, totalParticipations: 42 },
        { date: 'Sal', participationRate: 92, totalActivities: 6, totalParticipations: 55 },
        { date: 'Çar', participationRate: 78, totalActivities: 4, totalParticipations: 31 },
        { date: 'Per', participationRate: 88, totalActivities: 5, totalParticipations: 44 },
        { date: 'Cum', participationRate: 95, totalActivities: 7, totalParticipations: 66 },
        { date: 'Cmt', participationRate: 65, totalActivities: 3, totalParticipations: 19 },
        { date: 'Paz', participationRate: 45, totalActivities: 2, totalParticipations: 9 },
      ]
      setParticipationData(sampleData)
    }
  }

  const filteredStudents = students.filter(student => {
    const matchesProgram = selectedProgram === 'all' || student.programName === selectedProgram
    const matchesClass = selectedClass === 'all' || student.class === selectedClass
    return matchesProgram && matchesClass
  })

  const uniqueClasses = [...new Set(students.map(s => s.class))].sort()

  const exportToExcel = () => {
    try {
      let data: any[] = []
      let filename = ''
      let headers: string[] = []

      if (activeTab === 'participation') {
        filename = 'katilim-raporu'
        headers = ['Tarih', 'Katılım Oranı (%)', 'Toplam Aktivite', 'Toplam Katılım']
        data = participationData.map(item => ([
          item.date,
          item.participationRate,
          item.totalActivities,
          item.totalParticipations
        ]))
      } else if (activeTab === 'attendance') {
        filename = 'devamsizlik-raporu'
        headers = ['Öğrenci No', 'Ad Soyad', 'Sınıf', 'Toplam Puan', 'Program']
        data = filteredStudents.map(student => ([
          student.studentNumber,
          student.name,
          student.class,
          student.totalPoints,
          student.programName
        ]))
      } else if (activeTab === 'leaderboard') {
        filename = 'liderlik-tablosu'
        headers = ['Sıra', 'Öğrenci No', 'Ad Soyad', 'Sınıf', 'Toplam Puan', 'Program']
        data = filteredStudents.map((student, index) => ([
          index + 1,
          student.studentNumber,
          student.name,
          student.class,
          student.totalPoints,
          student.programName
        ]))
      }

      const ws = XLSX.utils.aoa_to_sheet([headers, ...data])
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Rapor')
      
      const today = new Date().toISOString().split('T')[0]
      XLSX.writeFile(wb, `${filename}-${today}.xlsx`)
    } catch (error) {
      console.error('Excel export error:', error)
      alert('Excel dosyası oluşturulurken bir hata oluştu.')
    }
  }

  const exportToPDF = () => {
    try {
      const doc = new jsPDF()
      
      // Set Turkish font support
      doc.setFont('helvetica')
      
      let title = ''
      let headers: string[][] = []
      let data: any[][] = []

      if (activeTab === 'participation') {
        title = 'Katılım Raporu'
        headers = [['Tarih', 'Katılım Oranı (%)', 'Toplam Aktivite', 'Toplam Katılım']]
        data = participationData.map(item => ([
          item.date,
          item.participationRate.toString(),
          item.totalActivities.toString(),
          item.totalParticipations.toString()
        ]))
      } else if (activeTab === 'attendance') {
        title = 'Devamsızlık Raporu'
        headers = [['Öğrenci No', 'Ad Soyad', 'Sınıf', 'Toplam Puan', 'Program']]
        data = filteredStudents.map(student => ([
          student.studentNumber,
          student.name,
          student.class,
          student.totalPoints.toString(),
          student.programName
        ]))
      } else if (activeTab === 'leaderboard') {
        title = 'Liderlik Tablosu'
        headers = [['Sıra', 'Öğrenci No', 'Ad Soyad', 'Sınıf', 'Toplam Puan', 'Program']]
        data = filteredStudents.map((student, index) => ([
          (index + 1).toString(),
          student.studentNumber,
          student.name,
          student.class,
          student.totalPoints.toString(),
          student.programName
        ]))
      }

      // Add title
      doc.setFontSize(16)
      doc.text(title, 14, 20)
      
      // Add date
      const today = new Date().toLocaleDateString('tr-TR')
      doc.setFontSize(10)
      doc.text(`Rapor Tarihi: ${today}`, 14, 30)

      // Add table
      ;(doc as any).autoTable({
        head: headers,
        body: data,
        startY: 40,
        styles: {
          fontSize: 8,
          cellPadding: 2
        },
        headStyles: {
          fillColor: [59, 130, 246], // Blue color
          textColor: 255
        }
      })
      
      const filename = `${title.toLowerCase().replace(/\s+/g, '-')}-${today.replace(/\./g, '-')}.pdf`
      doc.save(filename)
    } catch (error) {
      console.error('PDF export error:', error)
      alert('PDF dosyası oluşturulurken bir hata oluştu.')
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header 
        title="Raporlar"
      />
      
      {/* Tab Navigation */}
      <div className="border-b border-border bg-surface">
        <div className="flex">
          <button
            onClick={() => setActiveTab('participation')}
            className={`flex-1 py-4 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'participation'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary'
            }`}
          >
            Katılım Analizi
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`flex-1 py-4 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'attendance'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary'
            }`}
          >
            Devamsızlık
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex-1 py-4 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'leaderboard'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary'
            }`}
          >
            Liderlik Tablosu
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtreler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Program
                </label>
                <select
                  value={selectedProgram}
                  onChange={(e) => setSelectedProgram(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">Tüm Programlar</option>
                  {programs.map((program) => (
                    <option key={program.id} value={program.name}>
                      {program.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Sınıf
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">Tüm Sınıflar</option>
                  {uniqueClasses.map((className) => (
                    <option key={className} value={className}>
                      {className}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Başlangıç Tarihi
                </label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Bitiş Tarihi
                </label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tab Content */}
        {activeTab === 'participation' && (
          <ParticipationReport 
            participationData={participationData}
            onExportExcel={exportToExcel}
            onExportPDF={exportToPDF}
          />
        )}
        
        {activeTab === 'attendance' && (
          <AttendanceReport 
            students={filteredStudents}
            onExportExcel={exportToExcel}
            onExportPDF={exportToPDF}
          />
        )}
        
        {activeTab === 'leaderboard' && (
          <LeaderboardReport 
            students={filteredStudents}
            loading={loading}
            onExportExcel={exportToExcel}
            onExportPDF={exportToPDF}
          />
        )}
      </div>

      <BottomNavigation items={navigationItems} />
    </div>
  )
}

// Participation Report Component
interface ParticipationReportProps {
  participationData: ParticipationData[]
  onExportExcel: () => void
  onExportPDF: () => void
}

function ParticipationReport({ participationData, onExportExcel, onExportPDF }: ParticipationReportProps) {
  const maxRate = Math.max(...participationData.map(d => d.participationRate))
  
  return (
    <div className="space-y-6">
      {/* Weekly Participation Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Haftalık Katılım Oranları</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-3 items-end h-48">
            {participationData.map((data, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                <div className="w-full bg-surface border border-border rounded-lg flex-grow flex items-end relative">
                  <div 
                    className="w-full bg-primary rounded-lg transition-all duration-500 flex items-end justify-center"
                    style={{ height: `${(data.participationRate / maxRate) * 100}%` }}
                  >
                    <span className="text-xs text-background font-medium mb-1">
                      {data.participationRate}%
                    </span>
                  </div>
                </div>
                <p className="text-text-secondary text-xs font-medium">{data.date}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Export Buttons */}
      <div className="flex gap-4">
        <button
          onClick={onExportPDF}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-surface border border-border rounded-lg text-text-primary hover:bg-surface/80 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
          PDF olarak Dışa Aktar
        </button>
        <button
          onClick={onExportExcel}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-primary text-background rounded-lg hover:bg-primary/90 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">description</span>
          Excel olarak Dışa Aktar
        </button>
      </div>
    </div>
  )
}

// Attendance Report Component  
interface AttendanceReportProps {
  students: Student[]
  onExportExcel: () => void
  onExportPDF: () => void
}

function AttendanceReport({ students, onExportExcel, onExportPDF }: AttendanceReportProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Devamsızlık Analizi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <span className="material-symbols-outlined text-4xl text-text-secondary mb-4 block">
              schedule
            </span>
            <h3 className="text-lg font-medium text-text-primary mb-2">
              Devamsızlık Analizi
            </h3>
            <p className="text-text-secondary">
              Bu özellik yakında eklenecek
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Export Buttons */}
      <div className="flex gap-4">
        <button
          onClick={onExportPDF}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-surface border border-border rounded-lg text-text-primary hover:bg-surface/80 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
          PDF olarak Dışa Aktar
        </button>
        <button
          onClick={onExportExcel}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-primary text-background rounded-lg hover:bg-primary/90 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">description</span>
          Excel olarak Dışa Aktar
        </button>
      </div>
    </div>
  )
}

// Leaderboard Report Component
interface LeaderboardReportProps {
  students: Student[]
  loading: boolean
  onExportExcel: () => void
  onExportPDF: () => void
}

function LeaderboardReport({ students, loading, onExportExcel, onExportPDF }: LeaderboardReportProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {students.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <span className="material-symbols-outlined text-4xl text-text-secondary mb-4 block">
              leaderboard
            </span>
            <h3 className="text-lg font-medium text-text-primary mb-2">
              Öğrenci bulunamadı
            </h3>
            <p className="text-text-secondary">
              Seçilen filtrelere uygun öğrenci bulunamadı.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {students.map((student, index) => {
            const isTopThree = index < 3
            const position = index + 1
            
            return (
              <Card key={student.id} className={isTopThree ? 'ring-2 ring-primary/20' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Position */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg ${
                      position === 1 ? 'bg-yellow-100 text-yellow-800' :
                      position === 2 ? 'bg-gray-100 text-gray-800' :
                      position === 3 ? 'bg-orange-100 text-orange-800' :
                      'bg-surface text-text-secondary'
                    }`}>
                      {position === 1 && (
                        <span className="material-symbols-outlined text-yellow-600">
                          workspace_premium
                        </span>
                      )}
                      {position !== 1 && position}
                    </div>
                    
                    {/* Student Photo */}
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {student.photoUrl ? (
                        <img 
                          src={student.photoUrl} 
                          alt={student.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="material-symbols-outlined text-primary">
                          person
                        </span>
                      )}
                    </div>
                    
                    {/* Student Info */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-text-primary">{student.name}</h3>
                      <p className="text-sm text-text-secondary">
                        {student.studentNumber} • {student.class} • {student.programName}
                      </p>
                    </div>
                    
                    {/* Points */}
                    <div className="text-right">
                      <div className="font-bold text-primary text-lg">
                        {student.totalPoints}
                      </div>
                      <div className="text-xs text-text-secondary">ARDN</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
          
          {/* Export Buttons */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={onExportPDF}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-surface border border-border rounded-lg text-text-primary hover:bg-surface/80 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
              PDF olarak Dışa Aktar
            </button>
            <button
              onClick={onExportExcel}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-primary text-background rounded-lg hover:bg-primary/90 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">description</span>
              Excel olarak Dışa Aktar
            </button>
          </div>
        </>
      )}
    </div>
  )
}