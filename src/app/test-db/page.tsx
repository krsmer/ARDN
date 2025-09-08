'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'

interface DatabaseData {
  users: { count: number; data: any[] }
  programs: { count: number; data: any[] }
  students: { count: number; data: any[] }
  activities: { count: number; data: any[] }
}

export default function DatabaseTestPage() {
  const [data, setData] = useState<DatabaseData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/data')
      const result = await response.json()
      
      if (result.status === 'success') {
        setData(result.data)
      } else {
        setError(result.message || 'Veri alınırken hata oluştu')
      }
    } catch (err) {
      setError('Bağlantı hatası')
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-text-primary">
            📊 Database Test Sayfası
          </h1>
          <Button onClick={fetchData} disabled={loading}>
            {loading ? 'Yükleniyor...' : '🔄 Yenile'}
          </Button>
        </div>

        {error && (
          <Card className="border-red-500">
            <CardContent className="p-4">
              <div className="text-red-600">❌ Hata: {error}</div>
            </CardContent>
          </Card>
        )}

        {data && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Users */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  👨‍🏫 Kullanıcılar ({data.users.count})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.users.data.length === 0 ? (
                  <p className="text-text-secondary">Henüz kullanıcı yok</p>
                ) : (
                  data.users.data.map((user: any) => (
                    <div key={user.id} className="p-3 bg-surface rounded-lg">
                      <div className="font-semibold text-text-primary">{user.name}</div>
                      <div className="text-sm text-text-secondary">{user.email}</div>
                      <div className="text-xs text-primary">{user.role}</div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Programs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📚 Programlar ({data.programs.count})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.programs.data.length === 0 ? (
                  <p className="text-text-secondary">Henüz program yok</p>
                ) : (
                  data.programs.data.map((program: any) => (
                    <div key={program.id} className="p-3 bg-surface rounded-lg">
                      <div className="font-semibold text-text-primary">{program.name}</div>
                      {program.description && (
                        <div className="text-sm text-text-secondary">{program.description}</div>
                      )}
                      <div className="text-xs text-primary">
                        {new Date(program.startDate).toLocaleDateString()} - {new Date(program.endDate).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Students */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  👨‍🎓 Öğrenciler ({data.students.count})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.students.data.length === 0 ? (
                  <p className="text-text-secondary">Henüz öğrenci yok</p>
                ) : (
                  data.students.data.map((student: any) => (
                    <div key={student.id} className="p-3 bg-surface rounded-lg">
                      <div className="font-semibold text-text-primary">{student.name}</div>
                      <div className="text-sm text-text-secondary">
                        {student.studentNumber} • {student.class}
                      </div>
                      <div className="text-xs text-primary">
                        {student.totalPoints} ARDN Puan
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Activities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🏃‍♂️ Aktiviteler ({data.activities.count})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.activities.data.length === 0 ? (
                  <p className="text-text-secondary">Henüz aktivite yok</p>
                ) : (
                  data.activities.data.map((activity: any) => (
                    <div key={activity.id} className="p-3 bg-surface rounded-lg">
                      <div className="font-semibold text-text-primary">{activity.title}</div>
                      {activity.description && (
                        <div className="text-sm text-text-secondary">{activity.description}</div>
                      )}
                      <div className="text-xs text-primary">
                        {activity.points} Puan • {new Date(activity.activityDate).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        )}

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>🧪 Test Rehberi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-text-secondary">
              <p><strong>✅ Database çalışıyor!</strong> Yukarıda Prisma Studio'da eklediğiniz veriler görünüyor.</p>
              <br />
              <p><strong>Nasıl test edersiniz:</strong></p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Prisma Studio'da yeni veri ekleyin (http://localhost:5555)</li>
                <li>Bu sayfada "🔄 Yenile" butonuna tıklayın</li>
                <li>Yeni verilerinizi burada görün</li>
                <li>Login sayfasında eklediğiniz kullanıcı ile giriş yapmayı deneyin</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}