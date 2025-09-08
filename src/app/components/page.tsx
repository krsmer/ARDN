'use client'

import React, { useState } from 'react'
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Input,
  Avatar,
  Header,
  TabNavigation,
  BottomNavigation,
} from '../../components/ui'

export default function ComponentsDemo() {
  const [activeTab, setActiveTab] = useState('overview')

  const navigationItems = [
    { href: '/programs', icon: 'calendar_month', label: 'Programlar', active: false },
    { href: '/students', icon: 'groups', label: 'Öğrenciler', active: true },
    { href: '/activities', icon: 'local_activity', label: 'Aktiviteler', active: false },
    { href: '/reports', icon: 'bar_chart', label: 'Raporlar', active: false },
    { href: '/settings', icon: 'settings', label: 'Ayarlar', active: false },
  ]

  const tabItems = [
    { id: 'overview', label: 'Genel Bakış', active: activeTab === 'overview' },
    { id: 'details', label: 'Detaylar', active: activeTab === 'details' },
    { id: 'settings', label: 'Ayarlar', active: activeTab === 'settings' },
  ]

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header 
        title="UI Bileşenleri Demo" 
        onBack={() => window.history.back()}
      />
      
      <div className="p-4 space-y-8">
        {/* Buttons Section */}
        <Card>
          <CardHeader>
            <CardTitle>Butonlar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3 flex-wrap">
              <Button>Varsayılan</Button>
              <Button variant="secondary">İkincil</Button>
              <Button variant="ghost">Gölge</Button>
              <Button variant="outline">Çerçeveli</Button>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Button size="sm">Küçük</Button>
              <Button>Normal</Button>
              <Button size="lg">Büyük</Button>
            </div>
          </CardContent>
        </Card>

        {/* Inputs Section */}
        <Card>
          <CardHeader>
            <CardTitle>Giriş Alanları</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input 
              placeholder="Normal giriş alanı" 
            />
            <Input 
              placeholder="E-posta"
              icon="mail"
            />
            <Input 
              placeholder="Şifre"
              type="password"
              icon="lock"
            />
          </CardContent>
        </Card>

        {/* Avatar Section */}
        <Card>
          <CardHeader>
            <CardTitle>Avatar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3 items-center">
              <Avatar size="sm" fallback="AY" />
              <Avatar size="md" fallback="AK" />
              <Avatar size="lg" fallback="MD" />
            </div>
          </CardContent>
        </Card>

        {/* Navigation Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Navigasyon</CardTitle>
          </CardHeader>
          <CardContent>
            <TabNavigation 
              items={tabItems}
              onTabChange={setActiveTab}
            />
          </CardContent>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation items={navigationItems} />
    </div>
  )
}
