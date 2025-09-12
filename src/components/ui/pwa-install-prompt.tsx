'use client'

import React, { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

interface PWAInstallPromptProps {
  onInstall?: () => void
  onDismiss?: () => void
}

export default function PWAInstallPrompt({ onInstall, onDismiss }: PWAInstallPromptProps = {}) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isInWebAppiOS = (window.navigator as any).standalone === true
    const isAndroidInstalled = document.referrer.includes('android-app://')
    
    if (isStandalone || isInWebAppiOS || isAndroidInstalled) {
      setIsInstalled(true)
      return
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      const beforeInstallPromptEvent = e as BeforeInstallPromptEvent
      setDeferredPrompt(beforeInstallPromptEvent)
      
      // Show the install prompt after a short delay
      setTimeout(() => {
        setShowInstallPrompt(true)
      }, 2000)
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowInstallPrompt(false)
      setDeferredPrompt(null)
      onInstall?.()
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [onInstall])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const choiceResult = await deferredPrompt.userChoice
      
      if (choiceResult.outcome === 'accepted') {
        setShowInstallPrompt(false)
        setDeferredPrompt(null)
        onInstall?.()
      }
    } catch (error) {
      console.error('Install prompt error:', error)
    }
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    onDismiss?.()
    
    // Hide for this session
    sessionStorage.setItem('pwa-install-dismissed', 'true')
  }

  // Don't show if already installed or dismissed this session
  if (isInstalled || !showInstallPrompt || !deferredPrompt) {
    return null
  }

  // Check if dismissed this session
  if (sessionStorage.getItem('pwa-install-dismissed')) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-border shadow-lg">
      <div className="max-w-md mx-auto p-4">
        <div className="flex items-center gap-3">
          {/* App Icon */}
          <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-primary text-2xl">
              school
            </span>
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-text-primary text-sm">
              ARDN Uygulamasını İndir
            </h3>
            <p className="text-text-secondary text-xs">
              Ana ekrandan hızlı erişim için yükle
            </p>
          </div>
          
          {/* Actions */}
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={handleDismiss}
              className="px-3 py-2 text-text-secondary text-sm hover:text-text-primary transition-colors"
            >
              Daha Sonra
            </button>
            <button
              onClick={handleInstallClick}
              className="px-4 py-2 bg-primary text-background text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              İndir
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}