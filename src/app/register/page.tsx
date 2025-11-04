'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Card, CardContent } from '../../components/ui/card'

export default function RegisterPage() {
  const router = useRouter()
  
  // Organization info
  const [organizationName, setOrganizationName] = useState('')
  const [organizationSlug, setOrganizationSlug] = useState('')
  const [organizationAddress, setOrganizationAddress] = useState('')
  const [organizationPhone, setOrganizationPhone] = useState('')
  
  // Admin user info
  const [adminName, setAdminName] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [adminPasswordConfirm, setAdminPasswordConfirm] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Auto-generate slug from organization name
  const handleOrganizationNameChange = (name: string) => {
    setOrganizationName(name)
    
    // Generate URL-friendly slug
    const slug = name
      .toLowerCase()
      .replace(/ş/g, 's')
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/ı/g, 'i')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
    
    setOrganizationSlug(slug)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')
    
    // Client-side validation
    if (adminPassword !== adminPasswordConfirm) {
      setError('Şifreler eşleşmiyor. Lütfen tekrar kontrol edin.')
      setIsLoading(false)
      return
    }
    
    if (adminPassword.length < 8) {
      setError('Şifre en az 8 karakter olmalıdır.')
      setIsLoading(false)
      return
    }
    
    if (!acceptTerms) {
      setError('Devam etmek için kullanım koşullarını kabul etmelisiniz.')
      setIsLoading(false)
      return
    }
    
        // Ensure slug is generated from organization name
        if (!organizationSlug || organizationSlug.trim() === '') {
          setError('Kurum adı geçerli değil. Lütfen geçerli bir kurum adı girin.')
          setIsLoading(false)
          return
        }    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organizationName,
          organizationSlug,
          organizationAddress,
          organizationPhone,
          adminName,
          adminEmail,
          adminPassword
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSuccess(data.message)
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push('/login?registered=true')
        }, 1800)
      } else {
        setError(data.message)
      }
    } catch (err) {
      setError('Bağlantı hatası. Lütfen tekrar deneyin.')
    }
    
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-2xl text-background">
              school
            </span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Kurum Kaydı Oluştur
          </h1>
          <p className="text-text-secondary">
            ARDN Puan Sistemli Kurum Uygulamasına kayıt olun
          </p>
        </div>

        {/* Registration Form */}
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Success Message */}
              {success && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-green-500 text-sm">✅ {success}</p>
                </div>
              )}
              
              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-500 text-sm">❌ {error}</p>
                </div>
              )}

              {/* Organization Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-text-primary border-b border-border pb-2">
                   Kurum Bilgileri
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label htmlFor="orgName" className="block text-sm font-medium text-text-primary mb-2">
                      Kurum Adı *
                    </label>
                    <Input
                      id="orgName"
                      type="text"
                      placeholder="Örnek: Ankara Erkek Öğrenci Yurdu"
                      value={organizationName}
                      onChange={(e) => handleOrganizationNameChange(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="orgPhone" className="block text-sm font-medium text-text-primary mb-2">
                      Telefon
                    </label>
                    <Input
                      id="orgPhone"
                      type="tel"
                      placeholder="+90 312 123 4567"
                      value={organizationPhone}
                      onChange={(e) => setOrganizationPhone(e.target.value)}
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label htmlFor="orgAddress" className="block text-sm font-medium text-text-primary mb-2">
                      Adres
                    </label>
                    <Input
                      id="orgAddress"
                      type="text"
                      placeholder="Çankaya, Ankara"
                      value={organizationAddress}
                      onChange={(e) => setOrganizationAddress(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Admin User Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-text-primary border-b border-border pb-2">
                   Yönetici Hesabı
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="adminName" className="block text-sm font-medium text-text-primary mb-2">
                      Adınız Soyadınız *
                    </label>
                    <Input
                      id="adminName"
                      type="text"
                      placeholder="Mehmet Yılmaz"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="adminEmail" className="block text-sm font-medium text-text-primary mb-2">
                      Email Adresiniz *
                    </label>
                    <Input
                      id="adminEmail"
                      type="email"
                      placeholder="mehmet@yurt.edu.tr"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="adminPassword" className="block text-sm font-medium text-text-primary mb-2">
                      Şifre * (en az 8 karakter)
                    </label>
                    <Input
                      id="adminPassword"
                      type="password"
                      placeholder="••••••••"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="adminPasswordConfirm" className="block text-sm font-medium text-text-primary mb-2">
                      Şifre Tekrar * (Şifrenizi doğrulayın)
                    </label>
                    <Input
                      id="adminPasswordConfirm"
                      type="password"
                      placeholder="••••••••"
                      value={adminPasswordConfirm}
                      onChange={(e) => setAdminPasswordConfirm(e.target.value)}
                      required
                      minLength={8}
                      className={adminPassword && adminPasswordConfirm && adminPassword !== adminPasswordConfirm ? 'border-red-500' : ''}
                    />
                    {adminPassword && adminPasswordConfirm && adminPassword !== adminPasswordConfirm && (
                      <p className="text-red-500 text-xs mt-1">
                        ⚠️ Şifreler eşleşmiyor
                      </p>
                    )}
                    {adminPassword && adminPasswordConfirm && adminPassword === adminPasswordConfirm && (
                      <p className="text-green-500 text-xs mt-1">
                        ✅ Şifreler eşleşiyor
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start gap-3 p-4 bg-surface rounded-lg">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-1 rounded border-border text-primary focus:ring-primary focus:ring-2"
                  required
                />
                <label htmlFor="acceptTerms" className="text-sm text-text-secondary cursor-pointer">
                  <span className="text-text-primary font-medium">Kullanım Koşullarını kabul ediyorum.</span>
                  <br />
                  Kayıt olarak ARDN Öğrenci Takip Sistemi’nin kullanım koşullarını, 
                  gizlilik politikasını ve veri işleme yöntemlerini kabul etmiş olursunuz.
                </label>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || !organizationName || !adminName || !adminEmail || !adminPassword || !adminPasswordConfirm || !acceptTerms || adminPassword !== adminPasswordConfirm}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                    Kurum kaydı oluşturuluyor...
                  </div>
                ) : (
                  ' Kurum Kaydı Oluştur'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-text-secondary mb-2">
            Zaten hesabınız var mı?{' '}
            <button 
              onClick={() => router.push('/login')}
              className="text-primary hover:underline"
            >
              Giriş Yap
            </button>
          </p>
          <p className="text-xs text-text-secondary">
            © 2025 ARDN Öğrenci Kurum Takip Sistemi. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </div>
  )
}
