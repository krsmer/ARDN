'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Header, BottomNavigation } from '../../components/ui/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card'

interface Program {
  id: string
  name: string
  description?: string
  startDate: string
  endDate: string
  isActive: boolean
  studentCount?: number
  activityCount?: number
  createdAt: string
}

export default function ProgramsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [programToDelete, setProgramToDelete] = useState<Program | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  
  const navigationItems = [
    { href: '/dashboard', icon: 'dashboard', label: 'Ana Sayfa', active: false },
    { href: '/programs', icon: 'calendar_month', label: 'Dönemler', active: true },
    { href: '/students', icon: 'groups', label: 'Öğrenciler', active: false },
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
      fetchPrograms()
    }
  }, [session])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenMenuId(null)
    }
    
    if (openMenuId) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [openMenuId])

  const fetchPrograms = async () => {
    try {
      const response = await fetch('/api/programs')
      if (response.ok) {
        const data = await response.json()
        setPrograms(data.programs || [])
      }
    } catch (error) {
      console.error('Error fetching programs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProgram = async (program: Program) => {
    try {
      const response = await fetch(`/api/programs?id=${program.id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setPrograms(programs.filter(p => p.id !== program.id))
        setShowDeleteModal(false)
        setProgramToDelete(null)
      } else {
        const errorData = await response.json()
        alert(errorData.message || 'Dönem silinemedi')
      }
    } catch (error) {
      alert('Bir hata oluştu')
    }
  }

  const filteredPrograms = programs.filter(program =>
    program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (program.description && program.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

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
        title="Dönemler"
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
      
      <div className="p-4 space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Dönem ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <span className="material-symbols-outlined absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary">
            search
          </span>
        </div>

        {/* Programs List */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredPrograms.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <span className="material-symbols-outlined text-4xl text-text-secondary mb-4 block">
                calendar_month
              </span>
              <h3 className="text-lg font-medium text-text-primary mb-2">
                {searchTerm ? 'Dönem bulunamadı' : 'Henüz dönem yok'}
              </h3>
              <p className="text-text-secondary mb-4">
                {searchTerm ? 'Arama kriterlerinizi değiştirip tekrar deneyin.' : 'İlk döneminizi oluşturmak için + butonuna tıklayın.'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="px-4 py-2 bg-primary text-background rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Dönem Oluştur
                </button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredPrograms.map((program) => (
              <Card key={program.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-text-primary">{program.name}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          program.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {program.isActive ? 'Aktif' : 'Pasif'}
                        </span>
                      </div>
                      
                      {program.description && (
                        <p className="text-sm text-text-secondary mb-3">{program.description}</p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-text-secondary">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">event</span>
                          {new Date(program.startDate).toLocaleDateString('tr-TR')} - {new Date(program.endDate).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-2 text-xs text-text-secondary">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">groups</span>
                          {program.studentCount || 0} öğrenci
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">local_activity</span>
                          {program.activityCount || 0} aktivite
                        </span>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          setOpenMenuId(openMenuId === program.id ? null : program.id)
                        }}
                        className="p-2 hover:bg-surface rounded-full transition-colors"
                      >
                        <span className="material-symbols-outlined text-text-secondary">
                          more_vert
                        </span>
                      </button>
                      
                      {openMenuId === program.id && (
                        <div className="absolute right-0 top-full mt-1 bg-surface border border-border rounded-lg shadow-lg z-10 min-w-[120px]">
                          <button
                            onClick={() => {
                              setProgramToDelete(program)
                              setShowDeleteModal(true)
                              setOpenMenuId(null)
                            }}
                            className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                            Sil
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Program Modal */}
      {showCreateForm && (
        <CreateProgramModal 
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            setShowCreateForm(false)
            fetchPrograms()
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && programToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg w-full max-w-md p-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-red-600">warning</span>
              </div>
              
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Dönemi Sil
              </h3>
              
              <p className="text-text-secondary mb-6">
                <strong>{programToDelete.name}</strong> dönemini silmek istediğinizden emin misiniz?
                <br /><br />
                Bu işlem geri alınamaz ve döneme ait tüm öğrenciler ve aktiviteler de silinecektir.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setProgramToDelete(null)
                  }}
                  className="flex-1 px-4 py-2 border border-border rounded-lg text-text-secondary hover:bg-surface transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={() => handleDeleteProgram(programToDelete)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Sil
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNavigation items={navigationItems} />
    </div>
  )
}

// Create Program Modal Component
interface CreateProgramModalProps {
  onClose: () => void
  onSuccess: () => void
}

function CreateProgramModal({ onClose, onSuccess }: CreateProgramModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Reset errors
    setErrors({})
    
    // Validate form
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Dönem adı gerekli'
    }
    
    if (!formData.startDate) {
      newErrors.startDate = 'Başlangıç tarihi gerekli'
    }
    
    if (!formData.endDate) {
      newErrors.endDate = 'Bitiş tarihi gerekli'
    }
    
    if (formData.startDate && formData.endDate) {
      if (new Date(formData.startDate) >= new Date(formData.endDate)) {
        newErrors.endDate = 'Bitiş tarihi başlangıç tarihinden sonra olmalı'
      }
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    setLoading(true)
    
    try {
      const response = await fetch('/api/programs', {
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
        setErrors({ general: errorData.message || 'Dönem oluşturulamadı' })
      }
    } catch (error) {
      setErrors({ general: 'Bir hata oluştu' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-text-primary">Yeni Dönem</h2>
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
            
            <div>
              <label className=" text-sm font-medium text-text-primary mb-2">
                Dönem Adı *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full text-gray-700  px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.name ? 'border-red-300' : 'border-border'
                }`}
                placeholder="örn: 2024-2025 Güz Dönemi"
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">{errors.name}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Açıklama
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full text-gray-700 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
                placeholder="Dönem hakkında kısa açıklama..."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Başlangıç Tarihi *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className={`w-full px-3 text-gray-700 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.startDate ? 'border-red-300' : 'border-border'
                  }`}
                />
                {errors.startDate && (
                  <p className="text-sm text-red-600 mt-1">{errors.startDate}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Bitiş Tarihi *
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className={`w-full px-3 text-gray-700 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.endDate ? 'border-red-300' : 'border-border'
                  }`}
                />
                {errors.endDate && (
                  <p className="text-sm text-red-600 mt-1">{errors.endDate}</p>
                )}
              </div>
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
                {loading ? 'Oluşturuluyor...' : 'Dönem Oluştur'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}