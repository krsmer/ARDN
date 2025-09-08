'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'

export default function DebugAuthPage() {
  const [debugResult, setDebugResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const checkUser = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/debug/user')
      const data = await response.json()
      setDebugResult(data)
    } catch (error) {
      setDebugResult({ error: 'Failed to fetch debug info' })
    }
    setLoading(false)
  }

  useEffect(() => {
    checkUser()
  }, [])

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            🔍 Authentication Debug Center
          </h1>
          <p className="text-text-secondary">
            Debug information for NextAuth.js authentication issues
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>🧪 User Database Check</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={checkUser}
              disabled={loading}
              className="mb-4"
            >
              {loading ? 'Checking...' : '🔄 Check User in Database'}
            </Button>

            {debugResult && (
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${debugResult.success ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'}`}>
                  <div className="font-semibold">
                    {debugResult.success ? '✅ User Found' : '❌ User Not Found'}
                  </div>
                  <div className="text-sm mt-2">
                    <strong>Email:</strong> admin@ankaraerkek.edu.tr
                  </div>
                </div>

                {debugResult.user && (
                  <div className="p-4 bg-blue-100 border border-blue-300 rounded-lg">
                    <div className="font-semibold text-blue-800">User Details:</div>
                    <div className="text-sm text-blue-700 space-y-1">
                      <div>👤 Name: {debugResult.user.name}</div>
                      <div>📧 Email: {debugResult.user.email}</div>
                      <div>🎭 Role: {debugResult.user.role}</div>
                      <div>✅ Active: {debugResult.user.isActive ? 'Yes' : 'No'}</div>
                      <div>🔑 Password Valid: {debugResult.user.passwordValid ? 'Yes' : 'No'}</div>
                      <div>🏢 Organization: {debugResult.user.organization.name} ({debugResult.user.organization.slug})</div>
                    </div>
                  </div>
                )}

                {debugResult.debug && (
                  <div className="p-4 bg-gray-100 border border-gray-300 rounded-lg">
                    <div className="font-semibold text-gray-800">Debug Info:</div>
                    <div className="text-sm text-gray-700 space-y-1">
                      <div>Password Hash Length: {debugResult.debug.passwordHashLength}</div>
                      <div>Password Hash Preview: {debugResult.debug.passwordHashPreview}</div>
                    </div>
                  </div>
                )}

                {debugResult.error && (
                  <div className="p-4 bg-red-100 border border-red-300 rounded-lg">
                    <div className="font-semibold text-red-800">Error:</div>
                    <div className="text-sm text-red-700">{debugResult.error || debugResult.message}</div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📋 Debugging Steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-text-secondary">
              <p><strong>If you're getting "Geçersiz email veya şifre" error:</strong></p>
              <ol className="list-decimal list-inside space-y-1 mt-2 ml-4">
                <li>Check if user exists in database (above)</li>
                <li>Verify password hash is valid</li>
                <li>Check if organization slug is correct</li>
                <li>Look at server console logs for detailed debug info</li>
                <li>Make sure database has the seeded data</li>
              </ol>
              
              <p className="mt-4"><strong>Common issues:</strong></p>
              <ul className="list-disc list-inside space-y-1 mt-2 ml-4">
                <li>Database not seeded properly</li>
                <li>Password hash not generated correctly</li>
                <li>Organization slug mismatch</li>
                <li>User account is inactive</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🛠️ Quick Fixes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={() => window.open('/login?org=ankara-erkek-yurdu', '_blank')}
                variant="outline"
              >
                🔗 Try Login with Organization
              </Button>
              
              <Button 
                onClick={() => window.open('/login', '_blank')}
                variant="outline"
              >
                🔗 Try Login without Organization
              </Button>
            </div>
            
            <div className="text-sm text-text-secondary mt-4">
              <strong>Note:</strong> Check the browser console and server terminal for detailed debug logs during login attempts.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}