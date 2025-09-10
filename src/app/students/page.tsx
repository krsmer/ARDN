'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Header, BottomNavigation } from '../../components/ui/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card'

interface Student {
  id: string
  studentNumber: string
  name: string
  class: string
  programId: string
  programName?: string
  photoUrl?: string
  totalPoints: number
  isActive: boolean
  createdAt: string
}

interface Program {
  id: string
  name: string
  isActive: boolean
}

export default function StudentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [students, setStudents] = useState<Student[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProgram, setSelectedProgram] = useState<string>('all')
  
  const navigationItems = [
    { href: '/dashboard', icon: 'dashboard', label: 'Ana Sayfa', active: false },
    { href: '/programs', icon: 'calendar_month', label: 'Dönemler', active: false },
    { href: '/students', icon: 'groups', label: 'Öğrenciler', active: true },
    { href: '/activities', icon: 'local_activity', label: 'Aktiviteler', active: false },
    { href: '/reports', icon: 'bar_chart', label: 'Raporlar', active: false },
  ]

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchStudents()
      fetchPrograms()
    }
  }, [session])

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students')
      if (response.ok) {
        const data = await response.json()
        setStudents(data.students || [])
      }
    } catch (error) {
      console.error('Error fetching students:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPrograms = async () => {
    try {
      const response = await fetch('/api/programs')
      if (response.ok) {
        const data = await response.json()
        setPrograms(data.programs || [])
      }
    } catch (error) {
      console.error('Error fetching programs:', error)
    }
  }

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.studentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.class.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesProgram = selectedProgram === 'all' || student.programId === selectedProgram
    
    return matchesSearch && matchesProgram && student.isActive
  })

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
        title="Öğrenciler"
        action={
          <button 
            onClick={() => setShowCreateForm(true)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-background hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">
              add
            </span>
          </button>
        }
      />
      
      <div className="p-4 space-y-4">
        {/* Search and Filter Bar */}
        <div className="space-y-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Öğrenci ara (isim, numara, sınıf)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <span className="material-symbols-outlined absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary">
              search
            </span>
          </div>

          <select
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
            className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">Tüm Programlar</option>
            {programs.filter(p => p.isActive).map((program) => (
              <option key={program.id} value={program.id}>
                {program.name}
              </option>
            ))}
          </select>
        </div>

        {/* Students List */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredStudents.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <span className="material-symbols-outlined text-4xl text-text-secondary mb-4 block">
                groups
              </span>
              <h3 className="text-lg font-medium text-text-primary mb-2">
                {searchTerm || selectedProgram !== 'all' ? 'Öğrenci bulunamadı' : 'Henüz öğrenci yok'}
              </h3>
              <p className="text-text-secondary mb-4">
                {searchTerm || selectedProgram !== 'all' 
                  ? 'Arama kriterlerinizi değiştirip tekrar deneyin.' 
                  : 'İlk öğrencinizi eklemek için + butonuna tıklayın.'}
              </p>
              {!searchTerm && selectedProgram === 'all' && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="px-4 py-2 bg-primary text-background rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Öğrenci Ekle
                </button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredStudents.map((student) => (
              <Card key={student.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Student Photo */}
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {student.photoUrl ? (
                        <img 
                          src={student.photoUrl} 
                          alt={student.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="material-symbols-outlined text-primary text-lg">
                          person
                        </span>
                      )}
                    </div>

                    {/* Student Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-text-primary truncate">{student.name}</h3>
                        <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded">
                          {student.class}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-text-secondary">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">badge</span>
                          {student.studentNumber}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">calendar_month</span>
                          {student.programName}
                        </span>
                      </div>
                    </div>

                    {/* ARDN Points */}
                    <div className="text-right flex-shrink-0">
                      <div className="text-lg font-bold text-primary">
                        {student.totalPoints}
                      </div>
                      <div className="text-xs text-text-secondary">
                        ARDN
                      </div>
                    </div>

                    {/* Action Menu */}
                    <button className="p-2 hover:bg-surface rounded-full transition-colors flex-shrink-0">
                      <span className="material-symbols-outlined text-text-secondary">
                        more_vert
                      </span>
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Statistics */}
        {!loading && filteredStudents.length > 0 && (
          <Card className="mt-4">
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-text-primary">{filteredStudents.length}</div>
                  <div className="text-xs text-text-secondary">Toplam Öğrenci</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-primary">
                    {Math.round(filteredStudents.reduce((sum, student) => sum + student.totalPoints, 0) / filteredStudents.length) || 0}
                  </div>
                  <div className="text-xs text-text-secondary">Ortalama Puan</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-green-600">
                    {Math.max(...filteredStudents.map(s => s.totalPoints), 0)}
                  </div>
                  <div className="text-xs text-text-secondary">En Yüksek Puan</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Student Modal */}
      {showCreateForm && (
        <CreateStudentModal 
          programs={programs.filter(p => p.isActive)}
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            setShowCreateForm(false)
            fetchStudents()
          }}
        />
      )}

      <BottomNavigation items={navigationItems} />
    </div>
  )
}

// Create Student Modal Component
interface CreateStudentModalProps {
  programs: Program[]
  onClose: () => void
  onSuccess: () => void
}

function CreateStudentModal({ programs, onClose, onSuccess }: CreateStudentModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    studentNumber: '',
    class: '',
    programId: '',
    photoUrl: '',
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [photoPreview, setPhotoPreview] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Reset errors
    setErrors({})
    
    // Validate form
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Öğrenci adı gerekli'
    }
    
    if (!formData.studentNumber.trim()) {
      newErrors.studentNumber = 'Öğrenci numarası gerekli'
    }
    
    if (!formData.class.trim()) {
      newErrors.class = 'Sınıf bilgisi gerekli'
    }
    
    if (!formData.programId) {
      newErrors.programId = 'Program seçimi gerekli'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    setLoading(true)
    
    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      if (response.ok) {
        onSuccess()
      } else {
        const errorData = await response.json()
        setErrors({ general: errorData.message || 'Öğrenci eklenemedi' })
      }
    } catch (error) {
      setErrors({ general: 'Bir hata oluştu' })
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoUrlChange = (url: string) => {
    setFormData({ ...formData, photoUrl: url })
    setPhotoPreview(url)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-text-primary">Yeni Öğrenci</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-surface rounded-full transition-colors"
            >
              <span className="material-symbols-outlined text-text-secondary">close</span>
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}

            {/* Photo Upload Section */}
            <div className="text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-3 overflow-hidden">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-primary text-2xl">person</span>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Fotoğraf URL'si
                </label>
                <input
                  type="url"
                  value={formData.photoUrl}
                  onChange={(e) => handlePhotoUrlChange(e.target.value)}
                  className="w-full text-gray-700 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="https://example.com/photo.jpg"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Öğrenci Adı *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-3 text-gray-700 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.name ? 'border-red-300' : 'border-border'
                }`}
                placeholder="örn: Ahmet Yılmaz"
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">{errors.name}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Öğrenci Numarası *
              </label>
              <input
                type="text"
                value={formData.studentNumber}
                onChange={(e) => setFormData({ ...formData, studentNumber: e.target.value })}
                className={`w-full px-3 text-gray-700 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.studentNumber ? 'border-red-300' : 'border-border'
                }`}
                placeholder="örn: 2024001"
              />
              {errors.studentNumber && (
                <p className="text-sm text-red-600 mt-1">{errors.studentNumber}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Sınıf *
              </label>
              <input
                type="text"
                value={formData.class}
                onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                className={`w-full px-3 text-gray-700 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.class ? 'border-red-300' : 'border-border'
                }`}
                placeholder="örn: 12-A"
              />
              {errors.class && (
                <p className="text-sm text-red-600 mt-1">{errors.class}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Dönem *
              </label>
              <select
                value={formData.programId}
                onChange={(e) => setFormData({ ...formData, programId: e.target.value })}
                className={`w-full px-3 text-gray-700 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.programId ? 'border-red-300' : 'border-border'
                }`}
              >
                <option value="">Dönem seçin</option>
                {programs.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.name}
                  </option>
                ))}
              </select>
              {errors.programId && (
                <p className="text-sm text-red-600 mt-1">{errors.programId}</p>
              )}
            </div>
            
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-border rounded-lg text-text-secondary hover:bg-surface transition-colors"
                disabled={loading}
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-primary text-background rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loading ? 'Ekleniyor...' : 'Öğrenci Ekle'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}