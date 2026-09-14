/**
 * AirLock - Clerk Configuration & Capability Detection
 * 
 * Verifies whether valid Clerk credentials are provided in the current environment.
 * When not present (or using dummy placeholder strings), AirLock functions seamlessly
 * in offline zero-friction Sandbox Demo mode without triggering client/server errors.
 */

export const hasClerkPublishableKey = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.startsWith("pk_test_") ||
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.startsWith("pk_live_")) &&
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes("example") &&
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes("placeholder") &&
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes("your_") &&
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes("ZXhhbXBsZQ")
);

export const clerkPublishableKey = hasClerkPublishableKey
  ? process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  : undefined;
