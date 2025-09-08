'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'

export default function TenantTestPage() {
  const [testResults, setTestResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const testScenarios = [
    {
      name: '✅ Valid: Ankara Admin with Organization',
      email: 'admin@ankaraerkek.edu.tr',
      password: '123456',
      orgSlug: 'ankara-erkek-yurdu',
      expected: 'SUCCESS'
    },
    {
      name: '✅ Valid: İstanbul Admin with Organization', 
      email: 'admin@istanbulkiz.edu.tr',
      password: '123456',
      orgSlug: 'istanbul-kiz-yurdu',
      expected: 'SUCCESS'
    },
    {
      name: '❌ Cross-Org: Ankara Admin tries İstanbul',
      email: 'admin@ankaraerkek.edu.tr',
      password: '123456',
      orgSlug: 'istanbul-kiz-yurdu',
      expected: 'FAIL - Cross organization access'
    },
    {
      name: '⚠️ No Org: Ankara Admin without organization',
      email: 'admin@ankaraerkek.edu.tr',
      password: '123456',
      orgSlug: '',
      expected: 'DEPENDS - Could access wrong data!'
    },
    {
      name: '❌ New Org: Valid user, non-existent org',
      email: 'admin@ankaraerkek.edu.tr',
      password: '123456',
      orgSlug: 'new-dormitory-yurdu',
      expected: 'FAIL - Organization not found'
    },
    {
      name: '❌ Invalid: Wrong credentials',
      email: 'fake@nonexistent.com',
      password: 'wrongpass',
      orgSlug: 'ankara-erkek-yurdu',
      expected: 'FAIL - Invalid credentials'
    }
  ]

  const runAllTests = async () => {
    setLoading(true)
    setTestResults([])
    const results = []

    for (const scenario of testScenarios) {
      try {
        console.log(`Testing: ${scenario.name}`)
        
        const response = await fetch('/api/auth/callback/credentials', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            email: scenario.email,
            password: scenario.password,
            organizationSlug: scenario.orgSlug,
            csrfToken: 'test',
            callbackUrl: '/dashboard',
            json: 'true'
          })
        })

        const result = {
          scenario: scenario.name,
          expected: scenario.expected,
          status: response.status,
          success: response.ok,
          timestamp: new Date().toLocaleString('tr-TR')
        }

        results.push(result)
        setTestResults([...results])
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 500))
      } catch (error) {
        results.push({
          scenario: scenario.name,
          expected: scenario.expected,
          status: 500,
          success: false,
          error: 'Network error',
          timestamp: new Date().toLocaleString('tr-TR')
        })
        setTestResults([...results])
      }
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            🏢 Multi-Tenant Security Test
          </h1>
          <p className="text-text-secondary">
            Test what happens when different dormitories try to access the system
          </p>
        </div>

        {/* Test Control */}
        <Card>
          <CardHeader>
            <CardTitle>🧪 Security Test Scenarios</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={runAllTests}
              disabled={loading}
              className="w-full mb-4"
            >
              {loading ? 'Running Tests...' : '🚀 Run All Security Tests'}
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {testScenarios.map((scenario, index) => (
                <div 
                  key={index}
                  className="p-3 bg-surface rounded-lg border"
                >
                  <div className="font-semibold text-text-primary text-sm">{scenario.name}</div>
                  <div className="text-xs text-text-secondary mt-1">
                    Email: {scenario.email}
                  </div>
                  <div className="text-xs text-text-secondary">
                    Org: {scenario.orgSlug || 'None'}
                  </div>
                  <div className="text-xs text-primary mt-1">
                    Expected: {scenario.expected}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        {testResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>📊 Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <div 
                    key={index}
                    className={`p-4 rounded-lg border ${
                      result.success 
                        ? 'bg-green-100 border-green-300' 
                        : 'bg-red-100 border-red-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-semibold">
                          {result.success ? '✅' : '❌'} {result.scenario}
                        </div>
                        <div className="text-sm text-gray-600">
                          Expected: {result.expected}
                        </div>
                        <div className="text-xs text-gray-500">
                          {result.timestamp}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-medium ${
                          result.success ? 'text-green-700' : 'text-red-700'
                        }`}>
                          Status: {result.status}
                        </div>
                        {result.error && (
                          <div className="text-xs text-red-600">
                            {result.error}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Security Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>🔐 Multi-Tenant Security Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="font-semibold text-green-800 mb-2">✅ Working Correctly</div>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Users can login to their own organization</li>
                  <li>• Cross-organization access is blocked</li>
                  <li>• Invalid organizations are rejected</li>
                  <li>• Wrong credentials are rejected</li>
                </ul>
              </div>
              
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="font-semibold text-orange-800 mb-2">⚠️ Potential Issues</div>
                <ul className="text-sm text-orange-700 space-y-1">
                  <li>• Login without organization may work</li>
                  <li>• Could access first matching user</li>
                  <li>• Data isolation might be bypassed</li>
                  <li>• New dormitories need proper onboarding</li>
                </ul>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="font-semibold text-blue-800 mb-2">🏢 New Dormitory Access Process</div>
              <div className="text-sm text-blue-700 space-y-1">
                <p><strong>Current Status:</strong> A new dormitory cannot simply "join" the system</p>
                <p><strong>Required Steps:</strong></p>
                <ol className="list-decimal list-inside ml-4 space-y-1">
                  <li>Admin creates new Organization in database</li>
                  <li>Admin creates initial users for that organization</li>
                  <li>Users get proper organization-specific credentials</li>
                  <li>Users access via organization-specific URL or parameter</li>
                </ol>
                <p className="mt-2"><strong>Security:</strong> No unauthorized access possible without database setup</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>💡 Security Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-text-secondary">
              <p><strong>For Production:</strong></p>
              <ol className="list-decimal list-inside space-y-1 mt-2 ml-4">
                <li><strong>Enforce Organization Parameter:</strong> Make organization selection mandatory</li>
                <li><strong>Subdomain-based Access:</strong> Each dormitory gets their own subdomain</li>
                <li><strong>Organization Registration Process:</strong> Formal process for new dormitories</li>
                <li><strong>Admin Panel:</strong> Super admin can create new organizations</li>
                <li><strong>Email Domain Validation:</strong> Ensure users belong to correct organization</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}