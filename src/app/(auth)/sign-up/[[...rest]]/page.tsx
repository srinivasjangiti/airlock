"use client";

import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { Shield, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { hasClerkPublishableKey } from "@/lib/clerk-config";

export default function SignUpPage() {
  if (hasClerkPublishableKey) {
    return <SignUp />;
  }

  // Graceful Zero-Friction Sandbox Fallback
  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <Card className="max-w-md w-full border-border shadow-xl bg-card">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-xs">
            <Shield className="h-6 w-6" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <CardTitle className="text-xl font-bold">Create Organization Account</CardTitle>
            <Badge variant="outline" className="text-[10px] uppercase text-primary border-primary/30">
              Sandbox Active
            </Badge>
          </div>
          <CardDescription className="text-xs">
            AirLock is pre-configured with sample enterprise IAM policies, connectors, and audit logs ready to explore.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 rounded-lg border border-border bg-muted/30 text-xs space-y-1">
            <div className="font-semibold text-foreground">Pre-Loaded Organization</div>
            <div className="text-muted-foreground">Tenant: Acme Innovations Ltd.</div>
            <div className="text-muted-foreground">Admin: Srinivas Jangiti</div>
            <div className="text-muted-foreground">Connectors: 8 SaaS tools ready</div>
          </div>

          <Button asChild className="w-full gap-2 shadow-sm">
            <Link href="/dashboard">
              <Sparkles className="h-4 w-4" />
              Launch Interactive Sandbox
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>

          <div className="pt-2 border-t border-border text-center">
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Want multi-tenant enterprise authentication? Add your <code>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> and <code>CLERK_SECRET_KEY</code> to <code>.env.local</code>.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
