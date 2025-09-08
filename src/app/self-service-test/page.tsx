'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'

export default function SelfServiceTestPage() {
  const [testResults, setTestResults] = useState<any[]>([])

  const testScenarios = [
    {
      name: '🏢 Yeni Yurt Kaydı',
      description: 'Yeni bir yurt kendini sisteme kaydediyor',
      action: () => window.open('/register', '_blank'),
      expected: 'Yurt bilgilerini girip admin hesabı oluşturabilmeli'
    },
    {
      name: '🔑 Basit Giriş (Instagram tarzı)',
      description: 'Sadece email/şifre ile giriş',
      action: () => window.open('/login', '_blank'),
      expected: 'Yurt seçimi olmadan, sadece email/şifre ile giriş'
    },
    {
      name: '📊 Otomatik Dashboard Yönlendirme',
      description: 'Giriş yapan kullanıcı kendi yurdunun dashboardına gidiyor',
      action: () => window.open('/dashboard', '_blank'),
      expected: 'Kullanıcının organizasyonuna özel dashboard'
    },
    {
      name: '🧪 Mevcut Test Kullanıcıları',
      description: 'Önceki test kullanıcıları hala çalışıyor mu?',
      action: () => alert('Test: admin@ankaraerkek.edu.tr / 123456'),
      expected: 'Eski kullanıcılar hala giriş yapabilmeli'
    }
  ]

  const existingUsers = [
    {
      org: 'Ankara Erkek Öğrenci Yurdu',
      email: 'admin@ankaraerkek.edu.tr',
      password: '123456',
      role: 'ORGANIZATION_ADMIN'
    },
    {
      org: 'Ankara Erkek Öğrenci Yurdu',
      email: 'ogretmen1@ankaraerkek.edu.tr', 
      password: '123456',
      role: 'TEACHER'
    },
    {
      org: 'İstanbul Kız Öğrenci Yurdu',
      email: 'admin@istanbulkiz.edu.tr',
      password: '123456',
      role: 'ORGANIZATION_ADMIN'
    }
  ]

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            🚀 Self-Service Registration System
          </h1>
          <p className="text-text-secondary">
            Instagram/Twitter tarzı basit kayıt ve giriş sistemi
          </p>
        </div>

        {/* New System Features */}
        <Card>
          <CardHeader>
            <CardTitle>✨ Yeni Sistem Özellikleri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="font-semibold text-green-800 mb-2">✅ Self-Service Registration</div>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Yurtlar kendileri sisteme kayıt olabilir</li>
                  <li>• Otomatik organizasyon oluşturma</li>
                  <li>• Otomatik admin hesabı yaratma</li>
                  <li>• Varsayılan ARDN programı kurulumu</li>
                </ul>
              </div>
              
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="font-semibold text-blue-800 mb-2">🔑 Simplified Login</div>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Sadece email/şifre ile giriş</li>
                  <li>• Yurt seçimi gereksiz</li>
                  <li>• Otomatik organizasyon tespiti</li>
                  <li>• Instagram/Twitter benzeri UX</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Scenarios */}
        <Card>
          <CardHeader>
            <CardTitle>🧪 Test Senaryoları</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {testScenarios.map((scenario, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-3">
                    <div>
                      <div className="font-semibold text-text-primary">{scenario.name}</div>
                      <div className="text-sm text-text-secondary">{scenario.description}</div>
                    </div>
                    <Button 
                      onClick={scenario.action}
                      className="w-full"
                      size="sm"
                    >
                      Test Et
                    </Button>
                    <div className="text-xs text-primary">
                      Beklenen: {scenario.expected}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Existing Test Users */}
        <Card>
          <CardHeader>
            <CardTitle>👥 Mevcut Test Kullanıcıları</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {existingUsers.map((user, index) => (
                <div key={index} className="p-4 bg-surface rounded-lg border">
                  <div className="space-y-2">
                    <div className="font-semibold text-text-primary">{user.org}</div>
                    <div className="text-sm text-text-secondary">Email: {user.email}</div>
                    <div className="text-sm text-text-secondary">Şifre: {user.password}</div>
                    <div className="text-xs text-primary">{user.role}</div>
                    <Button 
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        navigator.clipboard.writeText(`${user.email}\n${user.password}`)
                        alert('Email ve şifre kopyalandı!')
                      }}
                    >
                      📋 Kopyala
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Registration Flow */}
        <Card>
          <CardHeader>
            <CardTitle>📋 Kayıt İşlem Akışı</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                <div className="text-2xl mb-2">1️⃣</div>
                <div className="font-semibold text-blue-800">Kayıt Ol</div>
                <div className="text-sm text-blue-700">Yurt bilgilerini gir</div>
              </div>
              
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                <div className="text-2xl mb-2">2️⃣</div>
                <div className="font-semibold text-green-800">Otomatik Kurulum</div>
                <div className="text-sm text-green-700">Sistem hazırlanır</div>
              </div>
              
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                <div className="text-2xl mb-2">3️⃣</div>
                <div className="font-semibold text-yellow-800">Giriş Yap</div>
                <div className="text-sm text-yellow-700">Email/şifre ile gir</div>
              </div>
              
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg text-center">
                <div className="text-2xl mb-2">4️⃣</div>
                <div className="font-semibold text-purple-800">ARDN Sistemi</div>
                <div className="text-sm text-purple-700">Kullanmaya başla</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>⚖️ Eski vs Yeni Sistem</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="font-semibold text-red-800 mb-2">❌ Eski Sistem</div>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Admin manuel yurt oluşturması gerekli</li>
                  <li>• Yurt seçimi dropdown gerekli</li>
                  <li>• Karmaşık kayıt süreci</li>
                  <li>• Teknik bilgi gerektiriyor</li>
                </ul>
              </div>
              
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="font-semibold text-green-800 mb-2">✅ Yeni Sistem</div>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Yurtlar kendileri kayıt olabiliyor</li>
                  <li>• Basit email/şifre girişi</li>
                  <li>• Instagram/Twitter benzeri UX</li>
                  <li>• Hiç teknik bilgi gerektirmiyor</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}