'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Header, BottomNavigation } from '../../components/ui/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card'

interface Activity {
  id: string
  title: string
  description?: string
  activityDate: string
  startTime: string
  endTime?: string
  points: number
  maxParticipants?: number
  programId: string
  programName?: string
  isRecurring: boolean
  recurrenceType?: string
  isActive: boolean
  participantCount?: number
  createdAt: string
}

interface Program {
  id: string
  name: string
  isActive: boolean
}

export default function ActivitiesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activities, setActivities] = useState<Activity[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showParticipationModal, setShowParticipationModal] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [selectedProgram, setSelectedProgram] = useState('all')
  const [showGroupDetailsModal, setShowGroupDetailsModal] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<any>(null)
  
  const navigationItems = [
    { href: '/dashboard', icon: 'dashboard', label: 'Ana Sayfa', active: false },
    { href: '/programs', icon: 'calendar_month', label: 'Programlar', active: false },
    { href: '/students', icon: 'groups', label: 'Öğrenciler', active: false },
    { href: '/activities', icon: 'local_activity', label: 'Aktiviteler', active: true },
    { href: '/reports', icon: 'bar_chart', label: 'Raporlar', active: false },
  ]

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchActivities()
      fetchPrograms()
    }
  }, [session])

  const fetchActivities = async () => {
    try {
      const response = await fetch('/api/activities')
      if (response.ok) {
        const data = await response.json()
        setActivities(data.activities || [])
      }
    } catch (error) {
      console.error('Error fetching activities:', error)
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

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (activity.description && activity.description.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesProgram = selectedProgram === 'all' || activity.programId === selectedProgram
    
    return matchesSearch && matchesProgram && activity.isActive
  })

  // Group recurring activities for better UX
  const groupedActivities = React.useMemo(() => {
    const groups = new Map()
    
    filteredActivities.forEach(activity => {
      if (activity.isRecurring) {
        const groupKey = `${activity.title}-${activity.programId}-${activity.points}-${activity.recurrenceType}`
        
        if (groups.has(groupKey)) {
          const existing = groups.get(groupKey)
          existing.groupedCount += 1
          existing.totalParticipants += (activity.participantCount || 0)
          
          // Keep the most recent activity date
          if (new Date(activity.activityDate) > new Date(existing.activityDate)) {
            existing.activityDate = activity.activityDate
            existing.startTime = activity.startTime
            existing.endTime = activity.endTime
          }
          
          // Track individual activities for detail view
          existing.individualActivities.push(activity)
        } else {
          groups.set(groupKey, {
            ...activity,
            isGroup: true,
            groupedCount: 1,
            totalParticipants: activity.participantCount || 0,
            individualActivities: [activity]
          })
        }
      } else {
        // Non-recurring activities shown individually
        const singleKey = `single-${activity.id}`
        groups.set(singleKey, {
          ...activity,
          isGroup: false,
          groupedCount: 1,
          totalParticipants: activity.participantCount || 0
        })
      }
    })
    
    return Array.from(groups.values()).sort((a, b) => {
      // Sort by recurrence status, then by date
      if (a.isRecurring && !b.isRecurring) return -1
      if (!a.isRecurring && b.isRecurring) return 1
      return new Date(b.activityDate).getTime() - new Date(a.activityDate).getTime()
    })
  }, [filteredActivities])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR')
  }

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const getActivityStatus = (activity: Activity) => {
    const now = new Date()
    const activityDate = new Date(activity.activityDate)
    const startTime = new Date(activity.startTime)
    const endTime = activity.endTime ? new Date(activity.endTime) : null
    
    if (activityDate < now) {
      if (endTime && endTime < now) {
        return { label: 'Tamamlandı', color: 'bg-green-100 text-green-800' }
      } else if (startTime < now) {
        return { label: 'Devam Ediyor', color: 'bg-blue-100 text-blue-800' }
      }
    }
    
    return { label: 'Bekliyor', color: 'bg-yellow-100 text-yellow-800' }
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
        title="Aktiviteler"
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
              placeholder="Aktivite ara..."
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

        {/* Activities List */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : groupedActivities.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <span className="material-symbols-outlined text-4xl text-text-secondary mb-4 block">
                local_activity
              </span>
              <h3 className="text-lg font-medium text-text-primary mb-2">
                {searchTerm || selectedProgram !== 'all' ? 'Aktivite bulunamadı' : 'Henüz aktivite yok'}
              </h3>
              <p className="text-text-secondary mb-4">
                {searchTerm || selectedProgram !== 'all' 
                  ? 'Arama kriterlerinizi değiştirip tekrar deneyin.' 
                  : 'İlk aktivitenizi oluşturmak için + butonuna tıklayın.'}
              </p>
              {!searchTerm && selectedProgram === 'all' && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="px-4 py-2 bg-primary text-background rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Aktivite Oluştur
                </button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {groupedActivities.map((activity) => {
              const status = getActivityStatus(activity)
              return (
                <Card 
                  key={activity.isGroup ? `group-${activity.title}-${activity.programId}` : activity.id} 
                  className={`hover:shadow-md transition-shadow ${
                    activity.isGroup ? 'cursor-pointer' : ''
                  }`}
                  onClick={() => {
                    if (activity.isGroup) {
                      setSelectedGroup(activity)
                      setShowGroupDetailsModal(true)
                    }
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-text-primary">{activity.title}</h3>
                          
                          {/* Status badge */}
                          <span className={`px-2 py-1 text-xs rounded-full ${status.color}`}>
                            {status.label}
                          </span>
                          
                          {/* Group indicator */}
                          {activity.isGroup && (
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                              <span className="material-symbols-outlined text-xs mr-1">repeat</span>
                              {activity.groupedCount} oturum
                            </span>
                          )}
                          
                          {/* Recurring indicator for individual view */}
                          {activity.isRecurring && !activity.isGroup && (
                            <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                              Tekrarlı
                            </span>
                          )}
                        </div>
                        
                        {activity.description && (
                          <p className="text-sm text-text-secondary mb-3 line-clamp-2">
                            {activity.description}
                          </p>
                        )}
                      </div>
                      
                      <button className="p-2 hover:bg-surface rounded-full transition-colors">
                        <span className="material-symbols-outlined text-text-secondary">
                          more_vert
                        </span>
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs text-text-secondary mb-3">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">event</span>
                        {activity.isGroup 
                          ? `Son: ${formatDate(activity.activityDate)}`
                          : formatDate(activity.activityDate)
                        }
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">schedule</span>
                        {formatTime(activity.startTime)}
                        {activity.endTime && ` - ${formatTime(activity.endTime)}`}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">calendar_month</span>
                        {activity.programName}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">groups</span>
                        {activity.isGroup
                          ? `${activity.totalParticipants} toplam`
                          : `${activity.participantCount || 0}${activity.maxParticipants ? ` / ${activity.maxParticipants}` : ''}`
                        } katılımcı
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm text-primary">stars</span>
                        <span className="font-semibold text-primary">
                          {activity.points} ARDN
                          {activity.isGroup && (
                            <span className="text-xs text-text-secondary ml-1">
                              / oturum
                            </span>
                          )}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button 
                          className="px-3 py-1 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm flex items-center gap-1"
                          onClick={(e) => {
                            e.stopPropagation()
                            if (activity.isGroup) {
                              setSelectedGroup(activity)
                              setShowGroupDetailsModal(true)
                            } else {
                              setSelectedActivity(activity)
                              setShowParticipationModal(true)
                            }
                          }}
                        >
                          <span className="material-symbols-outlined text-xs">
                            {activity.isGroup ? 'visibility' : 'group_add'}
                          </span>
                          {activity.isGroup ? `Tüm ${activity.title}` : 'Katılım İşle'}
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Statistics */}
        {!loading && groupedActivities.length > 0 && (
          <Card className="mt-4">
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-text-primary">
                    {groupedActivities.length}
                  </div>
                  <div className="text-xs text-text-secondary">
                    Aktivite Grubu
                  </div>
                </div>
                <div>
                  <div className="text-lg font-bold text-primary">
                    {Math.round(groupedActivities.reduce((sum, activity) => sum + activity.points, 0) / groupedActivities.length) || 0}
                  </div>
                  <div className="text-xs text-text-secondary">Ortalama Puan</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-green-600">
                    {groupedActivities.reduce((sum, activity) => {
                      return sum + (activity.isGroup ? activity.points * activity.groupedCount : activity.points)
                    }, 0)}
                  </div>
                  <div className="text-xs text-text-secondary">Toplam Puan</div>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-border text-center">
                <div className="text-sm text-text-secondary">
                  <span className="inline-flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">info</span>
                    Tekrarlı aktiviteler gruplandırılarak gösterilir. Detaylar için kartlara tıklayın.
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Activity Modal */}
      {showCreateForm && (
        <CreateActivityModal 
          programs={programs.filter(p => p.isActive)}
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            setShowCreateForm(false)
            fetchActivities()
          }}
        />
      )}

      {/* Participation Modal */}
      {showParticipationModal && selectedActivity && (
        <ParticipationModal 
          activity={selectedActivity}
          onClose={() => {
            setShowParticipationModal(false)
            setSelectedActivity(null)
          }}
          onSuccess={() => {
            setShowParticipationModal(false)
            setSelectedActivity(null)
            fetchActivities()
          }}
        />
      )}

      {/* Group Details Modal */}
      {showGroupDetailsModal && selectedGroup && (
        <GroupDetailsModal 
          group={selectedGroup}
          onClose={() => {
            setShowGroupDetailsModal(false)
            setSelectedGroup(null)
          }}
          onSelectActivity={(activity) => {
            setSelectedActivity(activity)
            setShowParticipationModal(true)
            setShowGroupDetailsModal(false)
          }}
        />
      )}

      <BottomNavigation items={navigationItems} />
    </div>
  )
}

// Create Activity Modal Component
interface CreateActivityModalProps {
  programs: Program[]
  onClose: () => void
  onSuccess: () => void
}

function CreateActivityModal({ programs, onClose, onSuccess }: CreateActivityModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    activityDate: '',
    startTime: '',
    endTime: '',
    points: '',
    maxParticipants: '',
    programId: '',
    isRecurring: false,
    recurrenceType: 'WEEKLY',
    recurrenceEndDate: '', // New field for recurring end date
    autoIncludeAllStudents: false, // New field for auto-including all students
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Reset errors
    setErrors({})
    
    // Validate form
    const newErrors: Record<string, string> = {}
    
    if (!formData.title.trim()) {
      newErrors.title = 'Aktivite başlığı gerekli'
    }
    
    if (!formData.activityDate) {
      newErrors.activityDate = 'Aktivite tarihi gerekli'
    }
    
    if (!formData.startTime) {
      newErrors.startTime = 'Başlangıç saati gerekli'
    }
    
    if (!formData.points) {
      newErrors.points = 'ARDN puanı gerekli'
    } else {
      const points = parseInt(formData.points)
      if (isNaN(points) || points < 1 || points > 100) {
        newErrors.points = 'ARDN puanı 1-100 arasında olmalı'
      }
    }
    
    if (!formData.programId) {
      newErrors.programId = 'Program seçimi gerekli'
    }
    
    if (formData.endTime && formData.startTime) {
      if (formData.endTime <= formData.startTime) {
        newErrors.endTime = 'Bitiş saati başlangıç saatinden sonra olmalı'
      }
    }
    
    if (formData.maxParticipants) {
      const maxParticipants = parseInt(formData.maxParticipants)
      if (isNaN(maxParticipants) || maxParticipants < 1) {
        newErrors.maxParticipants = 'Maksimum katılımcı sayısı pozitif bir sayı olmalı'
      }
    }
    
    // Validate recurring activity end date
    if (formData.isRecurring && !formData.recurrenceEndDate) {
      newErrors.recurrenceEndDate = 'Tekrarlı aktivite için bitiş tarihi gerekli'
    }
    
    if (formData.isRecurring && formData.recurrenceEndDate && formData.activityDate) {
      if (new Date(formData.recurrenceEndDate) <= new Date(formData.activityDate)) {
        newErrors.recurrenceEndDate = 'Tekrar bitiş tarihi başlangıç tarihinden sonra olmalı'
      }
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    setLoading(true)
    
    try {
      // Combine date and time for API
      const activityDateTime = new Date(`${formData.activityDate}T${formData.startTime}`)
      const startDateTime = new Date(`${formData.activityDate}T${formData.startTime}`)
      const endDateTime = formData.endTime ? new Date(`${formData.activityDate}T${formData.endTime}`) : null

      const requestData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        activityDate: activityDateTime.toISOString(),
        startTime: startDateTime.toISOString(),
        endTime: endDateTime ? endDateTime.toISOString() : null,
        points: parseInt(formData.points),
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
        programId: formData.programId,
        isRecurring: formData.isRecurring,
        recurrenceType: formData.isRecurring ? formData.recurrenceType : null,
        recurrenceEndDate: formData.isRecurring ? formData.recurrenceEndDate : null,
        autoIncludeAllStudents: formData.autoIncludeAllStudents,
      }
      
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })
      
      if (response.ok) {
        onSuccess()
      } else {
        const errorData = await response.json()
        setErrors({ general: errorData.message || 'Aktivite oluşturulamadı' })
      }
    } catch (error) {
      setErrors({ general: 'Bir hata oluştu' })
    } finally {
      setLoading(false)
    }
  }

  // Set default date to today
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    setFormData(prev => ({ ...prev, activityDate: today }))
  }, [])

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-text-primary">Yeni Aktivite</h2>
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
              <label className="block text-sm font-medium text-text-primary mb-2">
                Aktivite Başlığı *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={`w-full text-gray-700 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.title ? 'border-red-300' : 'border-border'
                }`}
                placeholder="örn: Matematik Etüdü"
              />
              {errors.title && (
                <p className="text-sm text-red-600 mt-1">{errors.title}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Açıklama
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 text-gray-700 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
                placeholder="Aktivite hakkında detaylar..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Program *
              </label>
              <select
                value={formData.programId}
                onChange={(e) => setFormData({ ...formData, programId: e.target.value })}
                className={`w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.programId ? 'border-red-300' : 'border-border'
                }`}
              >
                <option value="">Program seçin</option>
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
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block  text-sm font-medium text-text-primary mb-2">
                  ARDN Puanı *
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                  className={`w-full px-3 text-gray-700 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.points ? 'border-red-300' : 'border-border'
                  }`}
                  placeholder="20"
                />
                {errors.points && (
                  <p className="text-sm text-red-600 mt-1">{errors.points}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Max Katılımcı
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.maxParticipants}
                  onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                  className={`w-full px-3 text-gray-700 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.maxParticipants ? 'border-red-300' : 'border-border'
                  }`}
                  placeholder="Sınırsız"
                />
                {errors.maxParticipants && (
                  <p className="text-sm text-red-600 mt-1">{errors.maxParticipants}</p>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Aktivite Tarihi *
              </label>
              <input
                type="date"
                value={formData.activityDate}
                onChange={(e) => setFormData({ ...formData, activityDate: e.target.value })}
                className={`w-full px-3 text-gray-700 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.activityDate ? 'border-red-300' : 'border-border'
                }`}
              />
              {errors.activityDate && (
                <p className="text-sm text-red-600 mt-1">{errors.activityDate}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Başlangıç Saati *
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className={`w-full px-3 text-gray-700 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.startTime ? 'border-red-300' : 'border-border'
                  }`}
                />
                {errors.startTime && (
                  <p className="text-sm text-red-600 mt-1">{errors.startTime}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Bitiş Saati
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className={`w-full px-3 text-gray-700 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.endTime ? 'border-red-300' : 'border-border'
                  }`}
                />
                {errors.endTime && (
                  <p className="text-sm text-red-600 mt-1">{errors.endTime}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isRecurring"
                checked={formData.isRecurring}
                onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
              />
              <label htmlFor="isRecurring" className="text-sm text-text-primary">
                Tekrarlı aktivite
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="autoIncludeAllStudents"
                checked={formData.autoIncludeAllStudents}
                onChange={(e) => setFormData({ ...formData, autoIncludeAllStudents: e.target.checked })}
                className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
              />
              <label htmlFor="autoIncludeAllStudents" className="text-sm text-text-primary">
                Tüm öğrencileri otomatik dahil et
              </label>
            </div>
            
            {formData.autoIncludeAllStudents && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  ℹ️ Bu seçenek işaretlenirse, aktivite oluşturulduktan sonra seçilen programdaki tüm aktif öğrenciler otomatik olarak bu aktiviteye dahil edilecek ve ARDN puanları hesaplanacaktır.
                </p>
              </div>
            )}

            {formData.isRecurring && (
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Tekrar Türü
                </label>
                <select
                  value={formData.recurrenceType}
                  onChange={(e) => setFormData({ ...formData, recurrenceType: e.target.value })}
                  className="w-full text-gray-700 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="DAILY">Günlük</option>
                  <option value="WEEKLY">Haftalık</option>
                  <option value="MONTHLY">Aylık</option>
                </select>
              </div>
            )}

            {formData.isRecurring && (
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Tekrar Bitiş Tarihi *
                </label>
                <input
                  type="date"
                  value={formData.recurrenceEndDate}
                  onChange={(e) => setFormData({ ...formData, recurrenceEndDate: e.target.value })}
                  className={`w-full text-gray-700 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.recurrenceEndDate ? 'border-red-300' : 'border-border'
                  }`}
                />
                {errors.recurrenceEndDate && (
                  <p className="text-sm text-red-600 mt-1">{errors.recurrenceEndDate}</p>
                )}
                <p className="text-xs text-text-secondary mt-1">
                  Bu tarihe kadar tekrarlı aktiviteler oluşturulacak
                </p>
              </div>
            )}
            
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
                {loading ? 'Oluşturuluyor...' : 'Aktivite Oluştur'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// Participation Modal Component
interface ParticipationModalProps {
  activity: Activity
  onClose: () => void
  onSuccess: () => void
}

function ParticipationModal({ activity, onClose, onSuccess }: ParticipationModalProps) {
  const [students, setStudents] = useState<any[]>([])
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set())
  const [existingParticipations, setExistingParticipations] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students')
      if (response.ok) {
        const data = await response.json()
        // Filter students by the activity's program
        const programStudents = data.students.filter((student: any) => 
          student.programId === activity.programId && student.isActive
        )
        setStudents(programStudents)
        
        // Fetch existing participations for this activity
        const participationResponse = await fetch(`/api/participation?activityId=${activity.id}`)
        if (participationResponse.ok) {
          const participationData = await participationResponse.json()
          const existingParticipations = new Set<string>(
            participationData.participations.map((p: any) => p.studentId)
          )
          setExistingParticipations(existingParticipations)
        }
      }
    } catch (error) {
      console.error('Error fetching students:', error)
    }
  }

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentNumber.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Separate students by participation status
  const availableStudents = filteredStudents.filter(student => !existingParticipations.has(student.id))
  const participatedStudents = filteredStudents.filter(student => existingParticipations.has(student.id))

  const handleSelectAll = () => {
    const availableStudentIds = new Set(availableStudents.map(student => student.id))
    setSelectedStudents(availableStudentIds)
  }

  const handleDeselectAll = () => {
    setSelectedStudents(new Set())
  }

  const handleStudentToggle = (studentId: string) => {
    const newSelected = new Set(selectedStudents)
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId)
    } else {
      newSelected.add(studentId)
    }
    setSelectedStudents(newSelected)
  }

  const handleSubmit = async () => {
    if (selectedStudents.size === 0) {
      alert('En az bir öğrenci seçmelisiniz')
      return
    }

    // Check if any selected student already participated
    const alreadyParticipated = Array.from(selectedStudents).filter(studentId => 
      existingParticipations.has(studentId)
    )
    
    if (alreadyParticipated.length > 0) {
      alert(`Seçtiğiniz öğrencilerden bazıları zaten katılım kayıtlı. Lütfen sadece katılım verilmemiş öğrencileri seçin.`)
      return
    }

    setLoading(true)

    try {
      const promises = Array.from(selectedStudents).map(async (studentId) => {
        const response = await fetch('/api/participation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            studentId,
            activityId: activity.id,
            pointsEarned: activity.points,
            isLate: false
          }),
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Katılım kaydedilemedi')
        }
        
        return response.json()
      })

      const results = await Promise.allSettled(promises)
      const successful = results.filter(result => result.status === 'fulfilled').length
      const failed = results.filter(result => result.status === 'rejected')
      
      if (failed.length > 0) {
        console.error('Some participations failed:', failed)
        alert(`${successful} öğrenci başarıyla kaydedildi. ${failed.length} öğrenci kaydedilemedi.`)
      }
      
      if (successful > 0) {
        onSuccess()
      }
    } catch (error) {
      console.error('Error recording participation:', error)
      alert('Katılım kaydedilirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-text-primary">Katılım İşle</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-surface rounded-full transition-colors"
            >
              <span className="material-symbols-outlined text-text-secondary">close</span>
            </button>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium text-text-primary">{activity.title}</h3>
            <div className="flex items-center gap-4 text-sm text-text-secondary">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">stars</span>
                {activity.points} ARDN
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">event</span>
                {new Date(activity.activityDate).toLocaleDateString('tr-TR')}
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-2">
              Bu aktiviteye katılan öğrencileri seçerek ARDN puanlarını otomatik olarak hesaplarınız.
            </p>
          </div>

          <div className="mt-4 space-y-3">
            <input
              type="text"
              placeholder="Öğrenci ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-gray-700 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            
            {availableStudents.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={handleSelectAll}
                  className="px-3 py-1 text-xs bg-primary text-background rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Tümünü Seç ({availableStudents.length})
                </button>
                <button
                  onClick={handleDeselectAll}
                  className="px-3 py-1 text-xs border border-border text-text-secondary rounded-lg hover:bg-surface transition-colors"
                >
                  Seçimi Temizle
                </button>
              </div>
            )}
            
            {/* Warning for existing participations */}
            {participatedStudents.length > 0 && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-2 text-orange-700">
                  <span className="material-symbols-outlined text-sm">warning</span>
                  <span className="text-sm font-medium">Zaten Katılım Kayıtlı</span>
                </div>
                <p className="text-xs text-orange-600 mt-1">
                  {participatedStudents.length} öğrenci bu aktiviteye zaten katıldı olarak işaretlenmiş. Tekrar katılım kaydı yapılamaz.
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {filteredStudents.length === 0 ? (
            <div className="text-center py-8 text-text-secondary">
              <span className="material-symbols-outlined text-4xl mb-2 block">groups</span>
              Bu programda öğrenci bulunamadı
            </div>
          ) : (
            <div className="space-y-4">
              {/* Available Students */}
              {availableStudents.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-text-primary mb-2">
                    Katılım Verilebilir ({availableStudents.length})
                  </h4>
                  <div className="space-y-2">
                    {availableStudents.map((student) => (
                      <div
                        key={student.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedStudents.has(student.id)
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:bg-surface'
                        }`}
                        onClick={() => handleStudentToggle(student.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden flex-shrink-0">
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
                          <div className="flex-1">
                            <div className="font-medium text-text-primary">{student.name}</div>
                            <div className="text-sm text-text-secondary">
                              {student.studentNumber} • {student.class} • {student.totalPoints} ARDN
                            </div>
                          </div>
                          {selectedStudents.has(student.id) && (
                            <span className="material-symbols-outlined text-primary">
                              check_circle
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Already Participated Students */}
              {participatedStudents.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-orange-700 mb-2">
                    Zaten Katılım Kayıtlı ({participatedStudents.length})
                  </h4>
                  <div className="space-y-2">
                    {participatedStudents.map((student) => (
                      <div
                        key={student.id}
                        className="p-3 border border-orange-200 bg-orange-50 rounded-lg opacity-75 cursor-not-allowed"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-orange-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {student.photoUrl ? (
                              <img 
                                src={student.photoUrl} 
                                alt={student.name}
                                className="w-full h-full object-cover grayscale"
                              />
                            ) : (
                              <span className="material-symbols-outlined text-orange-600">
                                person
                              </span>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-orange-800">{student.name}</div>
                            <div className="text-sm text-orange-600">
                              {student.studentNumber} • {student.class} • {student.totalPoints} ARDN
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-orange-600">
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            <span className="text-xs font-medium">Katıldı</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-text-secondary">
              <span className="font-medium">{selectedStudents.size} öğrenci seçildi</span>
              {availableStudents.length > 0 && (
                <span className="block text-xs mt-1">
                  {availableStudents.length} öğrenci mevcut
                </span>
              )}
              {participatedStudents.length > 0 && (
                <span className="block text-xs mt-1 text-orange-600">
                  {participatedStudents.length} öğrenci zaten katıldı
                </span>
              )}
            </div>
            <span className="text-sm font-medium text-primary">
              Toplam: {selectedStudents.size * activity.points} ARDN
            </span>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-lg text-text-secondary hover:bg-surface transition-colors"
              disabled={loading}
            >
              İptal
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || selectedStudents.size === 0}
              className="flex-1 px-4 py-2 bg-primary text-background rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Kaydediliyor...' : `Katılım Kaydet (${selectedStudents.size})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Group Details Modal Component
interface GroupDetailsModalProps {
  group: any
  onClose: () => void
  onSelectActivity: (activity: Activity) => void
}

function GroupDetailsModal({ group, onClose, onSelectActivity }: GroupDetailsModalProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR')
  }

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const getActivityStatus = (activity: Activity) => {
    const now = new Date()
    const activityDate = new Date(activity.activityDate)
    const startTime = new Date(activity.startTime)
    const endTime = activity.endTime ? new Date(activity.endTime) : null
    
    if (activityDate < now) {
      if (endTime && endTime < now) {
        return { label: 'Tamamlandı', color: 'bg-green-100 text-green-800' }
      } else if (startTime < now) {
        return { label: 'Devam Ediyor', color: 'bg-blue-100 text-blue-800' }
      }
    }
    
    return { label: 'Bekliyor', color: 'bg-yellow-100 text-yellow-800' }
  }

  // Sort individual activities by date (oldest first)
  const sortedActivities = group.individualActivities.sort((a: Activity, b: Activity) => 
    new Date(a.activityDate).getTime() - new Date(b.activityDate).getTime()
  )

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-text-primary">{group.title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-surface rounded-full transition-colors"
            >
              <span className="material-symbols-outlined text-text-secondary">close</span>
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm text-text-secondary">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">repeat</span>
              {group.groupedCount} oturum
            </div>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">schedule</span>
              {formatTime(group.startTime)}
              {group.endTime && ` - ${formatTime(group.endTime)}`}
            </div>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">calendar_month</span>
              {group.programName}
            </div>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">groups</span>
              {group.totalParticipants} toplam katılımcı
            </div>
          </div>
          
          <div className="mt-4 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm text-primary">stars</span>
            <span className="font-semibold text-primary">{group.points} ARDN / oturum</span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-lg font-medium text-text-primary mb-4">Tüm Oturumlar</h3>
          
          <div className="space-y-3">
            {sortedActivities.map((activity: Activity) => {
              const status = getActivityStatus(activity)
              const isToday = new Date(activity.activityDate).toDateString() === new Date().toDateString()
              
              return (
                <div
                  key={activity.id}
                  className={`p-4 border rounded-lg transition-colors ${
                    isToday 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:bg-surface'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-text-primary">
                          {formatDate(activity.activityDate)}
                        </span>
                        {isToday && (
                          <span className="px-2 py-1 text-xs bg-primary text-background rounded-full">
                            Bugün
                          </span>
                        )}
                        <span className={`px-2 py-1 text-xs rounded-full ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      
                      <div className="text-sm text-text-secondary">
                        {activity.participantCount || 0} katılımcı
                        {activity.maxParticipants && ` / ${activity.maxParticipants} max`}
                      </div>
                    </div>
                    
                    <button 
                      className="px-3 py-1 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm flex items-center gap-1"
                      onClick={() => onSelectActivity(activity)}
                    >
                      <span className="material-symbols-outlined text-xs">group_add</span>
                      Katılım İşle
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        
        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between text-sm text-text-secondary">
            <span>Toplam {group.groupedCount} oturum</span>
            <span>Toplam {group.totalParticipants} katılım</span>
          </div>
        </div>
      </div>
    </div>
  )
}
