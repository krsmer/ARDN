import { NextRequest } from 'next/server'
import prisma from './prisma'
// import jwt from 'jsonwebtoken' // Will add JWT later

export interface TenantContext {
  organizationId: string
  organizationSlug: string
  userId?: string
  userRole?: string
}

// Get organization context from various sources
export async function getTenantContext(request: NextRequest): Promise<TenantContext | null> {
  try {
    // Method 1: From subdomain (e.g., ankara-erkek-yurdu.localhost:3000)
    const host = request.headers.get('host') || ''
    const subdomain = host.split('.')[0]
    
    if (subdomain && subdomain !== 'localhost' && subdomain !== '127') {
      const org = await prisma.organization.findUnique({
        where: { slug: subdomain },
        select: { id: true, slug: true }
      })
      
      if (org) {
        return {
          organizationId: org.id,
          organizationSlug: org.slug
        }
      }
    }

    // Method 2: From query parameter (?org=ankara-erkek-yurdu)
    const { searchParams } = new URL(request.url)
    const orgSlug = searchParams.get('org')
    
    if (orgSlug) {
      const org = await prisma.organization.findUnique({
        where: { slug: orgSlug },
        select: { id: true, slug: true }
      })
      
      if (org) {
        return {
          organizationId: org.id,
          organizationSlug: org.slug
        }
      }
    }

    // Method 3: From authorization header/session (TODO: implement JWT)
    /*
    const authHeader = request.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret-here') as any
        if (decoded.organizationId) {
          const org = await prisma.organization.findUnique({
            where: { id: decoded.organizationId },
            select: { id: true, slug: true }
          })
          
          if (org) {
            return {
              organizationId: org.id,
              organizationSlug: org.slug,
              userId: decoded.userId,
              userRole: decoded.role
            }
          }
        }
      } catch (error) {
        console.log('Invalid JWT token')
      }
    }
    */

    return null
  } catch (error) {
    console.error('Error getting tenant context:', error)
    return null
  }
}

// Middleware to ensure tenant-aware queries
export function withTenant<T>(data: T, organizationId: string): T & { organizationId: string } {
  return {
    ...data,
    organizationId
  }
}