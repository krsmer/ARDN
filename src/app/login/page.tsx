'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Card, CardContent } from '../../components/ui/card'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const registered = searchParams.get('registered') // Check if coming from registration
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [credentialsLoaded, setCredentialsLoaded] = useState(false)

  // Load remembered credentials on component mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail')
    
    if (rememberedEmail) {
      setEmail(rememberedEmail)
      setRememberMe(true)
      setCredentialsLoaded(true)
      
      // Show a subtle message that credentials were loaded
      setTimeout(() => {
        console.log('✅ Kaydedilmiş giriş bilgileri yüklendi')
      }, 500)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    // Basic validation
    if (!email || !email.includes('@')) {
      setError('Lütfen geçerli bir email adresi giriniz.')
      setIsLoading(false)
      return
    }
    
    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.')
      setIsLoading(false)
      return
    }
    
    try {
      // Handle remember me functionality
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email)
      } else {
        localStorage.removeItem('rememberedEmail')
      }
      
      const result = await signIn('credentials', {
        email,
        password,
        rememberMe,
        redirect: false,
      })
      
      if (result?.error) {
        setError('Geçersiz email veya şifre')
      } else if (result?.ok) {
        // Redirect to dashboard on successful login
        router.push('/dashboard')
      }
    } catch (err) {
      setError('Bağlantı hatası. Lütfen tekrar deneyin.')
    }
    
    setIsLoading(false)
  }

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
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Öğrenci Takip Sistemi
          </h1>
          <p className="text-text-secondary">
            ARDN Puan Sistemli Yurt Uygulaması
          </p>
        </div>

        {/* Login Form */}
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Success message for registration */}
              {registered && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-green-500 text-sm">
                    ✅ Kayıt başarılı! Şimdi giriş yapabilirsiniz.
                  </p>
                </div>
              )}
              
              {/* Credentials loaded message */}
              {credentialsLoaded && (
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-blue-500 text-sm">
                     Kaydedilmiş giriş bilgileri yüklendi. Giriş yapabilirsiniz.
                  </p>
                </div>
              )}
              
              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-500 text-sm">❌ {error}</p>
                </div>
              )}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-text-primary">
                  E-posta Adresi
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ornek@okul.edu.tr"
                  icon="mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-text-primary">
                  Şifre
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  icon="lock"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary focus:ring-2"
                  />
                  <span className="ml-2 text-sm text-text-secondary">
                    Beni hatırla
                  </span>
                </label>
                <button 
                  type="button"
                  onClick={() => {
                    // Simple forgot password implementation
                    const userEmail = email || prompt('Lütfen email adresinizi giriniz:')
                    if (userEmail) {
                      alert(`📧 Şifre sıfırlama talimatları ${userEmail} adresine gönderildi.\n\n🗺️ Henüz sistem geliştirme aşamasında olduğu için gerçek email gönderilmemektedir.`)
                    }
                  }}
                  className="text-sm text-primary hover:underline"
                >
                  Şifremi unuttum
                </button>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                    Giriş yapılıyor...
                  </div>
                ) : (
                  'Giriş Yap'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Register Section */}
        <Card className="mt-4">
          <CardContent className="p-6 text-center">
            <p className="text-text-secondary mb-4">
              Yurdunuz henüz sisteme kayıtlı değil mi?
            </p>
            <Button 
              onClick={() => router.push('/register')}
              variant="outline"
              className="w-full"
            >
               Yeni Yurt Kaydı Oluştur
            </Button>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-text-secondary">
            © 2025 Öğrenci Yurt Takip Sistemi. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Yükleniyor...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}