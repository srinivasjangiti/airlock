import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { hasClerkPublishableKey, clerkPublishableKey } from "@/lib/clerk-config";
import "./globals.css";

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "AirLock — Identity & Access Management (IAM) Governance",
  description:
    "AirLock empowers modern engineering teams to manage SaaS tool access, enforce automated RBAC & ABAC policies, issue Just-In-Time access grants, and audit security events from a unified dashboard.",
  keywords: ["IAM", "Identity Access Management", "RBAC", "SSO", "Team Access", "JIT Access", "SaaS Security", "Srinivas Jangiti"],
  authors: [{ name: "Srinivas Jangiti", url: "https://github.com/srinivasjangiti" }],
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = (
    <>
      {children}
      <Toaster richColors position="bottom-right" />
    </>
  );

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${notoSans.variable} antialiased min-h-screen bg-background text-foreground`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {hasClerkPublishableKey && clerkPublishableKey ? (
            <ClerkProvider publishableKey={clerkPublishableKey}>
              {content}
            </ClerkProvider>
          ) : (
            content
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
