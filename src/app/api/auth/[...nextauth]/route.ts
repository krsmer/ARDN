import NextAuth from 'next-auth'
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import prisma from '../../../../lib/prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        organizationSlug: { label: 'Organization', type: 'text' }
      },
      async authorize(credentials) {
        console.log('🔐 NextAuth authorize called with:', {
          email: credentials?.email,
          organizationSlug: credentials?.organizationSlug,
          hasPassword: !!credentials?.password
        })
        
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing email or password')
          return null
        }

        // Build where clause for user lookup
        const whereClause: any = { email: credentials.email }
        
        // Organization specification is OPTIONAL for simplified login
        // We'll find the user's organization from their account
        if (credentials.organizationSlug) {
          console.log('🏢 Looking up organization:', credentials.organizationSlug)
          const organization = await prisma.organization.findUnique({
            where: { slug: credentials.organizationSlug },
            select: { id: true }
          })
          
          if (!organization) {
            console.log('❌ Organization not found:', credentials.organizationSlug)
            return null // Organization not found
          }
          
          whereClause.organizationId = organization.id
          console.log('✅ Organization found:', organization.id)
        }

        console.log('🔍 Searching for user with where clause:', whereClause)

        // Find user with organization data
        const user = await prisma.user.findFirst({
          where: whereClause,
          include: {
            organization: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        })

        console.log('👤 User found:', user ? {
          id: user.id,
          email: user.email,
          name: user.name,
          isActive: user.isActive,
          organization: user.organization.name
        } : 'No user found')

        if (!user) {
          console.log('❌ User not found in database')
          return null
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        )

        console.log('🔑 Password validation:', isValidPassword)

        if (!isValidPassword) {
          console.log('❌ Invalid password')
          return null
        }

        // Check if user is active
        if (!user.isActive) {
          console.log('❌ User is not active')
          return null
        }

        console.log('✅ Authentication successful')
        
        // Return user object for NextAuth
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          organizationId: user.organizationId,
          organization: user.organization
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    // Default session expires in 24 hours
    maxAge: 24 * 60 * 60, // 24 hours
    // Extended session for "remember me" (30 days)
    // This will be dynamically adjusted in JWT callback
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Include custom fields in JWT token
      if (user) {
        token.role = user.role
        token.organizationId = user.organizationId
        token.organization = user.organization
        
        // Check if "remember me" was used (can be detected from login page)
        // For now, we'll use a longer expiration by default and let localStorage handle persistence
        token.rememberMe = true // This could be passed from the login form in the future
      }
      
      // Set token expiration based on remember me preference
      if (token.rememberMe) {
        // 30 days for remember me
        token.exp = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60)
      }
      
      return token
    },
    async session({ session, token }) {
      // Include custom fields in session
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.organizationId = token.organizationId as string
        session.user.organization = token.organization as any
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/login'
  },
  secret: process.env.NEXTAUTH_SECRET
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }