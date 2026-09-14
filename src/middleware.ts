import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

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

export default clerkMiddleware(async (auth, request) => {
  // If Clerk is not configured with a valid secret key, enable zero-friction Sandbox / Demo Mode
  if (!process.env.CLERK_SECRET_KEY) {
    return NextResponse.next()
  }

  try {
    const { userId } = await auth()

    // Redirect signed-in users away from auth pages to dashboard
    if (userId && isAuthRoute(request)) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Protect dashboard routes — redirect unauthenticated users to sign-in
    if (!userId && isProtectedRoute(request)) {
      return NextResponse.redirect(new URL('/sign-in', request.url))
    }
  } catch {
    // If Clerk evaluation fails due to unconfigured keys, allow access
    return NextResponse.next()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
