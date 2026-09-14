"use client";

import { useState } from "react";
import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield, KeyRound, Mail, ArrowRight, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { hasClerkPublishableKey } from "@/lib/clerk-config";
import { toast } from "sonner";

export default function SignInPage() {
  if (hasClerkPublishableKey) {
    return <SignIn />;
  }

  return <EnterpriseSignInForm />;
}

function EnterpriseSignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect_url") || "/dashboard";

  const [email, setEmail] = useState("srinivasajan.work@gmail.com");
  const [passwordOrKey, setPasswordOrKey] = useState("ak_live_airlock_master_admin_key_2026");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, passwordOrKey }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Authentication failed.");
      }

      toast.success(`Welcome back, ${data.user?.name || "Administrator"}!`);
      router.push(redirectUrl);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Invalid administrative credentials.");
      toast.error(err.message || "Failed to authenticate.");
    } finally {
      setLoading(false);
    }
  }

  function handleAutoFillAdmin() {
    setEmail("srinivasajan.work@gmail.com");
    setPasswordOrKey("ak_live_airlock_master_admin_key_2026");
    setError(null);
  }

  return (
    <div className="flex min-h-[85vh] items-center justify-center p-4">
      <Card className="max-w-md w-full border-border shadow-2xl bg-card">
        <CardHeader className="text-center space-y-2 pb-4">
          <div className="mx-auto h-12 w-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-md">
            <Shield className="h-6 w-6" />
          </div>
          <div className="flex items-center justify-center gap-2 pt-1">
            <CardTitle className="text-xl font-bold tracking-tight">AirLock Enterprise</CardTitle>
            <Badge variant="outline" className="text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10 py-0.5">
              Zero-Trust IAM
            </Badge>
          </div>
          <CardDescription className="text-xs text-muted-foreground leading-relaxed">
            Enterprise Identity & Access Management Governance Console. Authenticate via administrator key or SAML/SSO token.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/10 text-xs flex items-start gap-2.5 text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3.5">
            <div className="space-y-1.5 text-left">
              <Label htmlFor="email" className="text-xs font-semibold text-foreground">
                Corporate Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@airlock.io"
                  className="pl-9 h-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <div className="flex items-center justify-between">
                <Label htmlFor="key" className="text-xs font-semibold text-foreground">
                  Administrative Access Token / Master Key
                </Label>
                <button
                  type="button"
                  onClick={handleAutoFillAdmin}
                  className="text-[11px] text-primary hover:underline font-medium"
                >
                  Fill Default Admin Key
                </button>
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  id="key"
                  type="password"
                  required
                  value={passwordOrKey}
                  onChange={(e) => setPasswordOrKey(e.target.value)}
                  placeholder="ak_live_..."
                  className="pl-9 h-9 text-xs font-mono"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" disabled={loading} className="w-full gap-2 shadow-sm h-9 text-xs font-medium">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Authenticating Session...
                  </>
                ) : (
                  <>
                    Sign In to Console
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </Button>
            </div>
          </form>

          <div className="pt-3 border-t border-border space-y-2">
            <div className="rounded-lg border border-border bg-muted/20 p-2.5 text-left text-[11px] space-y-1">
              <div className="font-semibold text-foreground flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                Default Primary Administrator
              </div>
              <div className="text-muted-foreground font-mono text-[10px]">
                Principal: srinivasajan.work@gmail.com
              </div>
              <div className="text-muted-foreground font-mono text-[10px] truncate">
                Token: ak_live_airlock_master_admin_key_2026
              </div>
            </div>

            <div className="text-center">
              <Link href="/" className="text-[11px] text-muted-foreground hover:text-foreground hover:underline">
                Return to AirLock Homepage
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
