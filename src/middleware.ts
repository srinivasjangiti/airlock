import { NextResponse } from 'next/server'
import type { NextRequest, NextFetchEvent } from 'next/server'
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Robust detection of valid Clerk keys
const hasClerkKeys =
  Boolean(process.env.CLERK_SECRET_KEY) &&
  Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
  (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith('pk_test_') ||
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith('pk_live_')) &&
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.includes('example') &&
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.includes('placeholder') &&
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.includes('your_') &&
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.includes('ZXhhbXBsZQ') &&
  !process.env.CLERK_SECRET_KEY?.includes('example') &&
  !process.env.CLERK_SECRET_KEY?.includes('placeholder') &&
  !process.env.CLERK_SECRET_KEY?.includes('your_');

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/members(.*)',
  '/integrations(.*)',
  '/access(.*)',
  '/compliance(.*)',
  '/developers(.*)',
  '/activity(.*)',
  '/settings(.*)',
])

const isAuthRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)'])

// Only instantiate clerkMiddleware if valid keys exist
let clerkHandler: any = null
if (hasClerkKeys) {
  try {
    clerkHandler = clerkMiddleware(async (auth, request) => {
      const { userId } = await auth()

      // Redirect signed-in users away from auth pages to dashboard
      if (userId && isAuthRoute(request)) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }

      // Protect dashboard routes — redirect unauthenticated users to sign-in
      if (!userId && isProtectedRoute(request)) {
        return NextResponse.redirect(new URL('/sign-in', request.url))
      }
    })
  } catch (e) {
    console.warn('Failed to initialize clerkMiddleware:', e)
    clerkHandler = null
  }
}

export default function middleware(request: NextRequest, event: NextFetchEvent) {
  // 1. If Clerk is configured and handler initialized, run Clerk middleware safely
  if (hasClerkKeys && clerkHandler) {
    try {
      return clerkHandler(request, event)
    } catch (err) {
      console.warn('Clerk middleware error caught:', err)
      return NextResponse.next()
    }
  }

  // 2. Enterprise Session Cookie Verification (for Standalone / Self-Hosted / On-Prem Deployments)
  const sessionCookie = request.cookies.get('airlock_session')?.value
  const isAuthenticated = Boolean(sessionCookie)

  // Protect dashboard routes — redirect unauthenticated visitors to enterprise login
  if (!isAuthenticated && isProtectedRoute(request)) {
    const signInUrl = new URL('/sign-in', request.url)
    signInUrl.searchParams.set('redirect_url', request.nextUrl.pathname)
    return NextResponse.redirect(signInUrl)
  }

  // Redirect signed-in users away from auth pages to dashboard
  if (isAuthenticated && isAuthRoute(request)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
