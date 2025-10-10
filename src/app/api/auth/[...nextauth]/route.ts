import NextAuth from 'next-auth'
import type { NextAuthOptions } from 'next-auth'
import { User } from '@prisma/client'
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
        organizationSlug: { label: 'Organization', type: 'text' },
        rememberMe: { label: 'Remember Me', type: 'checkbox' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('E-posta ve şifre gereklidir.')
        }

        // Build where clause for user lookup
        const whereClause: {
          email: string
          organizationId?: string
        } = { email: credentials.email }

        // Organization specification is OPTIONAL for simplified login
        // We'll find the user's organization from their account
        if (credentials.organizationSlug) {
          const organization = await prisma.organization.findUnique({
            where: { slug: credentials.organizationSlug },
            select: { id: true }
          })
          
          if (!organization) {
            // Hata mesajını daha genel tutarak güvenlik artırılır.
            throw new Error('Geçersiz giriş bilgileri.')
          }
          
          whereClause.organizationId = organization.id
        }

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

        if (!user) {
          throw new Error('Geçersiz giriş bilgileri.')
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.passwordHash!
        )

        if (!isValidPassword) {
          throw new Error('Geçersiz giriş bilgileri.')
        }

        // Check if user is active
        if (!user.isActive) {
          throw new Error('Hesabınız aktif değil. Lütfen yönetici ile iletişime geçin.')
        }
        
        // Return user object for NextAuth
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          organizationId: user.organizationId,
          organization: user.organization,
          rememberMe: credentials.rememberMe === 'true'
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    // Default session expires in 24 hours
    maxAge: 24 * 60 * 60, // 1 gün
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Include custom fields in JWT token
      if (user) {
        const u = user as User & {
          organization: { id: string; name: string; slug: string };
          rememberMe?: boolean; // Giriş formundan bu bilgiyi almalıyız.
        }
        token.role = u.role
        token.organizationId = u.organizationId
        token.organization = u.organization
        token.rememberMe = u.rememberMe ?? false;
      }

      // Oturum süresini "Beni Hatırla" seçeneğine göre ayarla
      if (token.rememberMe) {
        token.exp = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60; // 30 gün
      }

      return token
    },
    async session({ session, token }) {
      // Include custom fields in session
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as 'ADMIN' | 'USER'
        session.user.organizationId = token.organizationId as string 
        session.user.organization = token.organization as { id: string; name: string; slug: string } 
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