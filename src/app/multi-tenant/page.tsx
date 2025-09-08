'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'

interface Organization {
  id: string
  name: string
  slug: string
  address?: string
  phone?: string
  email?: string
}

interface TenantData {
  status: string
  message: string
  tenant: {
    organization: Organization
    organizationSlug: string
  }
  data: {
    users: { count: number; data: any[] }
    programs: { count: number; data: any[] }
    students: { count: number; data: any[] }
    activities: { count: number; data: any[] }
  }
}

export default function MultiTenantTestPage() {
  const [organizations] = useState<Organization[]>([
    {
      id: '1',
      name: 'Ankara Erkek Öğrenci Yurdu',
      slug: 'ankara-erkek-yurdu',
      address: 'Çankaya, Ankara',
      phone: '+90 312 123 4567',
      email: 'info@ankaraerkek.edu.tr'
    },
    {
      id: '2',
      name: 'İstanbul Kız Öğrenci Yurdu',
      slug: 'istanbul-kiz-yurdu',
      address: 'Beşiktaş, İstanbul',
      phone: '+90 212 987 6543',
      email: 'info@istanbulkiz.edu.tr'
    }
  ])
  
  const [selectedOrg, setSelectedOrg] = useState<string>('')
  const [tenantData, setTenantData] = useState<TenantData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTenantData = async (orgSlug: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/tenant-data?org=${orgSlug}`)
      const result = await response.json()
      
      if (result.status === 'success') {
        setTenantData(result)
      } else {
        setError(result.message || 'Veri alınırken hata oluştu')
      }
    } catch (err) {
      setError('Bağlantı hatası')
      console.error('Fetch error:', err)
    }
    
    setLoading(false)
  }

  const handleOrgSelect = (orgSlug: string) => {
    setSelectedOrg(orgSlug)
    fetchTenantData(orgSlug)
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-text-primary mb-2">
            🏢 Multi-Tenant ARDN Sistemi
          </h1>
          <p className="text-lg text-text-secondary">
            Her yurt kendi verilerini bağımsız olarak yönetebilir
          </p>
        </div>

        {/* Organization Selector */}
        <Card>
          <CardHeader>
            <CardTitle>🏛️ Yurt Seçimi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {organizations.map((org) => (
                <Card 
                  key={org.slug} 
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedOrg === org.slug ? 'ring-2 ring-primary bg-primary/5' : ''
                  }`}
                  onClick={() => handleOrgSelect(org.slug)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-background text-xl">
                          domain
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-text-primary">{org.name}</h3>
                        <p className="text-sm text-text-secondary">{org.address}</p>
                        <p className="text-xs text-primary">{org.phone}</p>
                      </div>
                      {selectedOrg === org.slug && (
                        <div className="text-primary">
                          <span className="material-symbols-outlined">check_circle</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-text-secondary">Yurt verisi yükleniyor...</p>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card className="border-red-500">
            <CardContent className="p-4">
              <div className="text-red-600">❌ Hata: {error}</div>
            </CardContent>
          </Card>
        )}

        {/* Tenant Data Display */}
        {tenantData && !loading && (
          <div className="space-y-6">
            {/* Organization Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🏛️ {tenantData.tenant.organization.name}
                  <span className="text-sm font-normal text-text-secondary">
                    ({tenantData.tenant.organizationSlug})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {tenantData.tenant.organization.address && (
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">location_on</span>
                      <span className="text-text-secondary">{tenantData.tenant.organization.address}</span>
                    </div>
                  )}
                  {tenantData.tenant.organization.phone && (
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">phone</span>
                      <span className="text-text-secondary">{tenantData.tenant.organization.phone}</span>
                    </div>
                  )}
                  {tenantData.tenant.organization.email && (
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">mail</span>
                      <span className="text-text-secondary">{tenantData.tenant.organization.email}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Data Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{tenantData.data.users.count}</div>
                  <div className="text-sm text-text-secondary">Kullanıcı</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{tenantData.data.programs.count}</div>
                  <div className="text-sm text-text-secondary">Program</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{tenantData.data.students.count}</div>
                  <div className="text-sm text-text-secondary">Öğrenci</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{tenantData.data.activities.count}</div>
                  <div className="text-sm text-text-secondary">Aktivite</div>
                </CardContent>
              </Card>
            </div>

            {/* Students Leaderboard */}
            <Card>
              <CardHeader>
                <CardTitle>🏆 ARDN Liderlik Tablosu</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {tenantData.data.students.data.map((student: any, index: number) => (
                  <div key={student.id} className={`p-3 rounded-lg flex items-center gap-3 ${
                    index === 0 ? 'bg-yellow-100 border border-yellow-300' :
                    index === 1 ? 'bg-gray-100 border border-gray-300' :
                    index === 2 ? 'bg-orange-100 border border-orange-300' :
                    'bg-surface'
                  }`}>
                    <div className="text-xl">
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
                ))}
              </CardContent>
            </Card>

            {/* Login Test */}
            <Card>
              <CardHeader>
                <CardTitle>🔐 Test Kullanıcıları</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tenantData.data.users.data.map((user: any) => (
                    <div key={user.id} className="p-3 bg-surface rounded-lg flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-text-primary">{user.name}</div>
                        <div className="text-sm text-text-secondary">{user.email}</div>
                        <div className="text-xs text-primary">{user.role}</div>
                      </div>
                      <div className="text-xs text-text-secondary">
                        Şifre: 123456
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Button 
                    onClick={() => window.open('/login?org=' + selectedOrg, '_blank')}
                    className="w-full"
                  >
                    🔗 Bu Yurt için Giriş Yap
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Info */}
        <Card>
          <CardHeader>
            <CardTitle>ℹ️ Multi-Tenant Nasıl Çalışır?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-text-secondary">
              <p><strong>🏢 Organizasyon İzolasyonu:</strong></p>
              <ul className="list-disc list-inside space-y-1 mt-2 ml-4">
                <li>Her yurt kendi verilerini görür (kullanıcılar, öğrenciler, aktiviteler)</li>
                <li>Yurtlar birbirlerinin verilerine erişemez</li>
                <li>Her yurdun kendi admin ve öğretmenleri var</li>
                <li>ARDN puanları yurt bazında hesaplanır</li>
              </ul>
              
              <p className="mt-4"><strong>🔗 Erişim Yöntemleri:</strong></p>
              <ul className="list-disc list-inside space-y-1 mt-2 ml-4">
                <li>URL parametresi: <code>/login?org=ankara-erkek-yurdu</code></li>
                <li>Subdomain: <code>ankara-erkek-yurdu.domain.com</code></li>
                <li>JWT token içinde organizasyon bilgisi</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}