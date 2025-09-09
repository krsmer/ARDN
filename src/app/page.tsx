'use client'

import { useRouter } from 'next/navigation'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'

export default function Home() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-2xl text-background">
              school
            </span>
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            ARDN Öğrenci Takip Sistemi
          </h1>
          <p className="text-text-secondary">
            Yurt Yönetimi & Puan Sistemi
          </p>
        </div>

        {/* Main Actions */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Button 
                onClick={() => router.push('/register')}
                className="w-full h-12"
              >
                 Yeni Yurt Kaydı Oluştur
              </Button>
              <Button 
                onClick={() => router.push('/login')}
                variant="outline"
                className="w-full h-12"
              >
                 Mevcut Yurt Girişi
              </Button>
            </div>
            
            <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700 text-center">
                 Yurdunuz sisteme kayıtlı değilse önce kayıt oluşturun!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-text-secondary">
            © 2025 ARDN Öğrenci Yurt Takip Sistemi. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </div>
  )
}
