import type { DefaultSession, DefaultUser } from 'next-auth'
import type { JWT, DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
      organizationId: string
      organization: {
        id: string
        name: string
        slug: string
      }
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    role: string
    organizationId: string
    organization: {
      id: string
      name: string
      slug: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    role: string
    organizationId: string
    organization: {
      id: string
      name: string
      slug: string
    }
  }
}