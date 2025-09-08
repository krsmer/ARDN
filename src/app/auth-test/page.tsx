'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'

export default function AuthTestPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [orgSlug, setOrgSlug] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

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

  const testLogin = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          organizationSlug: orgSlug || undefined
        }),
      })
      
      const data = await response.json()
      setResult({
        status: response.status,
        success: data.success,
        message: data.message,
        user: data.user || null,
        timestamp: new Date().toLocaleString('tr-TR')
      })
    } catch (err) {
      setResult({
        status: 500,
        success: false,
        message: 'Bağlantı hatası',
        error: err,
        timestamp: new Date().toLocaleString('tr-TR')
      })
    }

    setLoading(false)
  }

  const testLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST'
      })
      const data = await response.json()
      setResult({
        status: response.status,
        success: data.success,
        message: data.message,
        timestamp: new Date().toLocaleString('tr-TR')
      })
    } catch (err) {
      setResult({
        status: 500,
        success: false,
        message: 'Çıkış hatası',
        timestamp: new Date().toLocaleString('tr-TR')
      })
    }
  }

  const fillTestCredential = (cred: any) => {
    setEmail(cred.email)
    setPassword(cred.password)
    setOrgSlug(cred.org)
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            🔐 Authentication Test Center
          </h1>
          <p className="text-text-secondary">
            Test the secure login system with real database validation
          </p>
        </div>

        {/* Test Valid Credentials */}
        <Card>
          <CardHeader>
            <CardTitle>✅ Valid Test Credentials</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {testCredentials.map((cred, index) => (
                <div 
                  key={index}
                  className="p-4 bg-surface rounded-lg border cursor-pointer hover:bg-primary/5 transition-colors"
                  onClick={() => fillTestCredential(cred)}
                >
                  <div className="font-semibold text-text-primary">{cred.name}</div>
                  <div className="text-sm text-text-secondary">{cred.email}</div>
                  <div className="text-xs text-primary">{cred.role}</div>
                  <div className="text-xs text-text-secondary">🏢 {cred.org}</div>
                  <div className="text-xs text-text-secondary mt-1">Password: {cred.password}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Login Test Form */}
        <Card>
          <CardHeader>
            <CardTitle>🧪 Login Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="test@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Organization (Optional)
                </label>
                <Input
                  type="text"
                  placeholder="ankara-erkek-yurdu"
                  value={orgSlug}
                  onChange={(e) => setOrgSlug(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button 
                onClick={testLogin}
                disabled={loading || !email || !password}
                className="flex-1"
              >
                {loading ? 'Testing...' : '🔑 Test Login'}
              </Button>
              
              <Button 
                onClick={testLogout}
                variant="outline"
              >
                🚪 Test Logout
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        {result && (
          <Card>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                {result.success ? '✅' : '❌'} Test Result
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className={`p-4 rounded-lg ${result.success ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'}`}>
                  <div className="font-semibold">Status: {result.status}</div>
                  <div>Message: {result.message}</div>
                  <div className="text-sm text-gray-600">Time: {result.timestamp}</div>
                </div>
                
                {result.user && (
                  <div className="p-4 bg-blue-100 border border-blue-300 rounded-lg">
                    <div className="font-semibold text-blue-800">Authenticated User:</div>
                    <div className="text-sm">
                      <div>👤 Name: {result.user.name}</div>
                      <div>📧 Email: {result.user.email}</div>
                      <div>🎭 Role: {result.user.role}</div>
                      <div>🏢 Organization: {result.user.organization.name} ({result.user.organization.slug})</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Test Invalid Credentials */}
        <Card>
          <CardHeader>
            <CardTitle>❌ Test Invalid Scenarios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={() => {
                  setEmail('invalid@test.com')
                  setPassword('wrongpassword')
                  setOrgSlug('')
                }}
                variant="outline"
              >
                🚫 Non-existent User
              </Button>
              
              <Button 
                onClick={() => {
                  setEmail('admin@ankaraerkek.edu.tr')
                  setPassword('wrongpassword')
                  setOrgSlug('ankara-erkek-yurdu')
                }}
                variant="outline"
              >
                🔑 Wrong Password
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info */}
        <Card>
          <CardHeader>
            <CardTitle>ℹ️ How Secure Authentication Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-text-secondary">
              <p><strong>🔒 Security Features:</strong></p>
              <ul className="list-disc list-inside space-y-1 mt-2 ml-4">
                <li>Real database credential validation</li>
                <li>bcrypt password hashing</li>
                <li>JWT tokens with 24-hour expiry</li>
                <li>HttpOnly cookies for token storage</li>
                <li>Organization-based multi-tenancy</li>
                <li>User status checking (active/inactive)</li>
              </ul>
              
              <p className="mt-4"><strong>✅ Behavior:</strong></p>
              <ul className="list-disc list-inside space-y-1 mt-2 ml-4">
                <li>Valid credentials → Login success + Dashboard redirect</li>
                <li>Invalid credentials → Clear error message</li>
                <li>No random email/password acceptance</li>
                <li>Organization-specific user isolation</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}