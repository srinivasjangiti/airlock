"use client";

import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { Shield, KeyRound, ArrowRight, Building2, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { hasClerkPublishableKey } from "@/lib/clerk-config";

export default function SignUpPage() {
  if (hasClerkPublishableKey) {
    return <SignUp />;
  }

  return (
    <div className="flex min-h-[85vh] items-center justify-center p-4">
      <Card className="max-w-md w-full border-border shadow-2xl bg-card">
        <CardHeader className="text-center space-y-2 pb-4">
          <div className="mx-auto h-12 w-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-md">
            <Building2 className="h-6 w-6" />
          </div>
          <div className="flex items-center justify-center gap-2 pt-1">
            <CardTitle className="text-xl font-bold tracking-tight">Organization Provisioning</CardTitle>
            <Badge variant="outline" className="text-[10px] uppercase tracking-wider text-primary border-primary/30 py-0.5">
              Enterprise Access
            </Badge>
          </div>
          <CardDescription className="text-xs text-muted-foreground leading-relaxed">
            Tenant provisioning for AirLock Zero-Trust IAM is managed by the organization administrator.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="p-3.5 rounded-lg border border-border bg-muted/20 text-xs space-y-2 text-left">
            <div className="font-semibold text-foreground flex items-center gap-1.5">
              <UserCheck className="h-4 w-4 text-emerald-500" />
              Primary Administrator Active
            </div>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              AirLock Technologies is configured with administrative root privileges assigned to <strong>Srinivas Jangiti</strong>. New team members and identity brokers are provisioned directly via SCIM 2.0 or the Administrator Console.
            </p>
          </div>

          <Button asChild className="w-full gap-2 shadow-sm h-9 text-xs font-medium">
            <Link href="/sign-in">
              <KeyRound className="h-3.5 w-3.5" />
              Sign In with Master Administrator Key
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>

          <div className="pt-2 border-t border-border text-center">
            <Link href="/" className="text-[11px] text-muted-foreground hover:text-foreground hover:underline">
              Return to AirLock Homepage
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
