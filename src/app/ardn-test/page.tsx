'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'

interface Student {
  id: string
  name: string
  studentNumber: string
  class: string
  totalPoints: number
}

interface Activity {
  id: string
  title: string
  points: number
  activityDate: string
}

interface Participation {
  id: string
  participatedAt: string
  pointsEarned: number
  student: {
    name: string
    studentNumber: string
    class: string
    totalPoints: number
  }
  activity: {
    title: string
    points: number
    activityDate: string
  }
}

export default function ARDNTestPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [participations, setParticipations] = useState<Participation[]>([])
  const [selectedStudent, setSelectedStudent] = useState('')
  const [selectedActivity, setSelectedActivity] = useState('')
  const [customPoints, setCustomPoints] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const fetchData = async () => {
    try {
      const response = await fetch('/api/data')
      const result = await response.json()
      
      if (result.status === 'success') {
        setStudents(result.data.students.data)
        setActivities(result.data.activities.data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const fetchParticipations = async () => {
    try {
      const response = await fetch('/api/participation')
      const result = await response.json()
      
      if (result.status === 'success') {
        setParticipations(result.data)
      }
    } catch (error) {
      console.error('Error fetching participations:', error)
    }
  }

  const addParticipation = async () => {
    if (!selectedStudent || !selectedActivity) {
      setMessage('❌ Lütfen öğrenci ve aktivite seçin')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/participation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: selectedStudent,
          activityId: selectedActivity,
          points: customPoints ? parseInt(customPoints) : undefined
        })
      })

      const result = await response.json()
      
      if (result.status === 'success') {
        setMessage(`✅ ${result.message}`)
        setSelectedStudent('')
        setSelectedActivity('')
        setCustomPoints('')
        fetchData()
        fetchParticipations()
      } else {
        setMessage(`❌ ${result.message}`)
      }
    } catch (error) {
      setMessage('❌ Bağlantı hatası')
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchData()
    fetchParticipations()
  }, [])

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-text-primary">
            🏆 ARDN Puan Sistemi Test
          </h1>
          <Button onClick={() => { fetchData(); fetchParticipations() }}>
            🔄 Yenile
          </Button>
        </div>

        {/* Add Participation */}
        <Card>
          <CardHeader>
            <CardTitle>➕ Yeni Katılım Ekle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Öğrenci Seç
                </label>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full p-2 rounded-lg border border-border bg-surface text-text-primary"
                >
                  <option value="">Öğrenci seçin...</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name} ({student.studentNumber}) - {student.totalPoints} ARDN
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Aktivite Seç
                </label>
                <select
                  value={selectedActivity}
                  onChange={(e) => setSelectedActivity(e.target.value)}
                  className="w-full p-2 rounded-lg border border-border bg-surface text-text-primary"
                >
                  <option value="">Aktivite seçin...</option>
                  {activities.map((activity) => (
                    <option key={activity.id} value={activity.id}>
                      {activity.title} ({activity.points} ARDN)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Özel Puan (Opsiyonel)
                </label>
                <Input
                  type="number"
                  placeholder="Varsayılan puan kullanılacak"
                  value={customPoints}
                  onChange={(e) => setCustomPoints(e.target.value)}
                />
              </div>
            </div>

            <Button
              onClick={addParticipation}
              disabled={loading || !selectedStudent || !selectedActivity}
              className="w-full"
            >
              {loading ? 'Kaydediliyor...' : '✅ Katılımı Kaydet'}
            </Button>

            {message && (
              <div className={`p-3 rounded-lg ${message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {message}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Students Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle>🏆 ARDN Liderlik Tablosu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {students
                .sort((a, b) => b.totalPoints - a.totalPoints)
                .map((student, index) => (
                  <div key={student.id} className={`p-3 rounded-lg flex items-center gap-3 ${
                    index === 0 ? 'bg-yellow-100 border border-yellow-300' :
                    index === 1 ? 'bg-gray-100 border border-gray-300' :
                    index === 2 ? 'bg-orange-100 border border-orange-300' :
                    'bg-surface'
                  }`}>
                    <div className="text-2xl">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-text-primary">{student.name}</div>
                      <div className="text-sm text-text-secondary">
                        {student.studentNumber} • {student.class}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">{student.totalPoints}</div>
                      <div className="text-xs text-text-secondary">ARDN Puan</div>
                    </div>
                  </div>
                ))
              }
            </CardContent>
          </Card>

          {/* Recent Participations */}
          <Card>
            <CardHeader>
              <CardTitle>📊 Son Katılımlar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {participations.length === 0 ? (
                <p className="text-text-secondary">Henüz katılım kaydı yok</p>
              ) : (
                participations.slice(0, 10).map((participation) => (
                  <div key={participation.id} className="p-3 bg-surface rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-text-primary">
                          {participation.student.name}
                        </div>
                        <div className="text-sm text-text-secondary">
                          {participation.activity.title}
                        </div>
                        <div className="text-xs text-text-secondary">
                          {new Date(participation.participatedAt).toLocaleString('tr-TR')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">
                          +{participation.pointsEarned}
                        </div>
                        <div className="text-xs text-text-secondary">ARDN</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}