import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    // Allow access to protected routes only if user is authenticated
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Protect dashboard and other authenticated routes
        if (req.nextUrl.pathname.startsWith('/dashboard')) {
          return !!token
        }
        
        // Allow access to public routes
        return true
      }
    }
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/programs/:path*', 
    '/students/:path*',
    '/activities/:path*',
    '/reports/:path*'
  ]
}