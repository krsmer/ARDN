'use client'

import React from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'

export default function NextAuthTestPage() {
  const { data: session, status } = useSession()

  const testCredentials = [
    {
      org: 'ankara-erkek-yurdu',
      email: 'admin@ankaraerkek.edu.tr',
      password: '123456',
      role: 'ORGANIZATION_ADMIN',
      name: 'Mehmet Yılmaz'
    },
    {
      org: 'ankara-erkek-yurdu', 
      email: 'ogretmen1@ankaraerkek.edu.tr',
      password: '123456',
      role: 'TEACHER',
      name: 'Ahmet Demir'
    },
    {
      org: 'istanbul-kiz-yurdu',
      email: 'admin@istanbulkiz.edu.tr', 
      password: '123456',
      role: 'ORGANIZATION_ADMIN',
      name: 'Ayşe Kaya'
    },
    {
      org: 'istanbul-kiz-yurdu',
      email: 'ogretmen1@istanbulkiz.edu.tr',
      password: '123456', 
      role: 'TEACHER',
      name: 'Zeynep Özkan'
    }
  ]

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">NextAuth session loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            🔐 NextAuth.js Authentication System
          </h1>
          <p className="text-text-secondary">
            Production-ready authentication as specified in project requirements
          </p>
        </div>

        {/* Session Status */}
        <Card>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${session ? 'text-green-600' : 'text-orange-600'}`}>
              {session ? '✅ Authenticated' : '🔓 Not Authenticated'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {session ? (
              <div className="space-y-3">
                <div className="p-4 bg-green-100 border border-green-300 rounded-lg">
                  <div className="font-semibold text-green-800">Current Session:</div>
                  <div className="text-sm text-green-700">
                    <div>👤 Name: {session.user.name}</div>
                    <div>📧 Email: {session.user.email}</div>
                    <div>🎭 Role: {session.user.role}</div>
                    <div>🏢 Organization: {session.user.organization.name} ({session.user.organization.slug})</div>
                    <div>🆔 User ID: {session.user.id}</div>
                  </div>
                </div>
                <Button 
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  variant="outline"
                  className="w-full"
                >
                  🚪 Sign Out
                </Button>
              </div>
            ) : (
              <div className="p-4 bg-orange-100 border border-orange-300 rounded-lg">
                <div className="text-orange-800">
                  No active session. Please login through the login page.
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* NextAuth.js Features */}
        <Card>
          <CardHeader>
            <CardTitle>🎯 NextAuth.js Features Implemented</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-text-secondary">
              <p><strong>✅ Production Features:</strong></p>
              <ul className="list-disc list-inside space-y-1 mt-2 ml-4">
                <li>NextAuth.js v4 with Prisma Adapter</li>
                <li>JWT session strategy for scalability</li>
                <li>Credentials provider with bcrypt validation</li>
                <li>Custom session callbacks for multi-tenant data</li>
                <li>Middleware-based route protection</li>
                <li>Secure password verification</li>
                <li>Organization-aware authentication</li>
                <li>Type-safe session management</li>
              </ul>
              
              <p className="mt-4"><strong>🔒 Security Benefits vs Custom Auth:</strong></p>
              <ul className="list-disc list-inside space-y-1 mt-2 ml-4">
                <li>Industry-standard security practices</li>
                <li>Built-in CSRF protection</li>
                <li>Secure cookie handling</li>
                <li>Session encryption</li>
                <li>Automatic token rotation</li>
                <li>XSS protection</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Test Credentials */}
        <Card>
          <CardHeader>
            <CardTitle>🧪 Test with Real Credentials</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {testCredentials.map((cred, index) => (
                <div 
                  key={index}
                  className="p-4 bg-surface rounded-lg border"
                >
                  <div className="font-semibold text-text-primary">{cred.name}</div>
                  <div className="text-sm text-text-secondary">{cred.email}</div>
                  <div className="text-xs text-primary">{cred.role}</div>
                  <div className="text-xs text-text-secondary">🏢 {cred.org}</div>
                  <div className="text-xs text-text-secondary">Password: {cred.password}</div>
                </div>
              ))}
            </div>
            <Button 
              onClick={() => window.open('/login', '_blank')}
              className="w-full"
            >
              🔗 Test Login with NextAuth.js
            </Button>
          </CardContent>
        </Card>

        {/* Architecture Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>⚖️ Custom Auth vs NextAuth.js</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="font-semibold text-red-800 mb-2">❌ Custom Auth (Previous)</div>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Manual JWT implementation</li>
                  <li>• Custom cookie handling</li>
                  <li>• Manual security measures</li>
                  <li>• Custom session management</li>
                  <li>• Higher maintenance overhead</li>
                  <li>• Potential security gaps</li>
                </ul>
              </div>
              
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="font-semibold text-green-800 mb-2">✅ NextAuth.js (Current)</div>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Industry-standard library</li>
                  <li>• Built-in security features</li>
                  <li>• Prisma adapter integration</li>
                  <li>• Type-safe sessions</li>
                  <li>• Community maintained</li>
                  <li>• Production-ready</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}