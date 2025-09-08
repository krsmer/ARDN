'use client'

import React from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Header, BottomNavigation } from '../../components/ui/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  
  const navigationItems = [
    { href: '/dashboard', icon: 'dashboard', label: 'Ana Sayfa', active: true },
    { href: '/programs', icon: 'calendar_month', label: 'Programlar', active: false },
    { href: '/students', icon: 'groups', label: 'Öğrenciler', active: false },
    { href: '/activities', icon: 'local_activity', label: 'Aktiviteler', active: false },
    { href: '/reports', icon: 'bar_chart', label: 'Raporlar', active: false },
  ]

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
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-secondary">Giriş yapılmamış. Yönlendiriliyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header 
        title="Dashboard"
        action={
          <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface transition-colors"
          >
            <span className="material-symbols-outlined text-text-primary">
              logout
            </span>
          </button>
        }
      />
      
      <div className="p-4 space-y-6">
        {/* Welcome Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-background">
                  person
                </span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-text-primary">
                  Hoşgeldiniz, {session.user.name}!
                </h2>
                <p className="text-text-secondary">
                  {session.user.organization.name} - {session.user.role}
                </p>
                <p className="text-sm text-primary">
                  {session.user.email}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-text-secondary">
                Toplam Öğrenci
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-text-primary">156</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-text-secondary">
                Aktif Program
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-text-primary">8</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Son Aktiviteler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-surface rounded-lg">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-sm text-primary">
                  local_activity
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-text-primary">
                  Spor Turnuvası başladı
                </p>
                <p className="text-xs text-text-secondary">2 saat önce</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-surface rounded-lg">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-sm text-primary">
                  person_add
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-text-primary">
                  Yeni öğrenci kaydedildi
                </p>
                <p className="text-xs text-text-secondary">5 saat önce</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation items={navigationItems} />
    </div>
  )
}