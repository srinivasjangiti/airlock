"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import {
  Users,
  Puzzle,
  Clock,
  Activity,
  ArrowRight,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  Zap,
  ExternalLink,
  CheckCircle2,
  Lock,
  Terminal,
  AlertTriangle,
  X,
  FileCheck,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { useAirlockStore } from "@/lib/airlock-store";
import { toast } from "sonner";

export default function DashboardPage() {
  const { store, enforceMfaAll } = useAirlockStore();
  const [alertDismissed, setAlertDismissed] = useState(false);

  const totalMembers = store.members.length;
  const activeMembers = store.members.filter((m) => m.status === "active").length;
  const mfaCount = store.members.filter((m) => m.mfaEnabled).length;
  const mfaPercentage = totalMembers > 0 ? Math.round((mfaCount / totalMembers) * 100) : 100;
  const activeIntegrations = store.integrations.filter((i) => i.status === "connected").length;
  const activeJitGrants = store.jitGrants.filter((g) => g.status === "active").length;
  const securityEventsCount = store.activities.length;
  const activeApiKeys = (store.apiKeys || []).filter((k) => k.status === "active").length;

  const adminFirstName = store.organization.adminName.split(" ")[0] || "there";

  // Role Breakdown
  const roleCounts: Record<string, number> = {};
  store.members.forEach((m) => {
    roleCounts[m.role] = (roleCounts[m.role] || 0) + 1;
  });

  const STATS = [
    {
      title: "Team Members",
      value: totalMembers.toString(),
      sub: `${activeMembers} active · ${mfaPercentage}% MFA enrolled`,
      icon: Users,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
      href: "/members",
    },
    {
      title: "Active Integrations",
      value: activeIntegrations.toString(),
      sub: `${store.integrations.length} total catalog connections`,
      icon: Puzzle,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      href: "/integrations",
    },
    {
      title: "JIT Active Grants",
      value: activeJitGrants.toString(),
      sub: "Time-limited ephemeral access sessions",
      icon: Clock,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      href: "/access",
    },
    {
      title: "Security & Audit Events",
      value: securityEventsCount.toString(),
      sub: "Immutable tamper-evident activity log",
      icon: Activity,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      href: "/activity",
    },
  ];

  // Dynamic evaluation stats
  const evaluationActivities = store.activities.filter(
    (a) => a.type === "policy_evaluated" || a.type === "access_denied"
  );
  const totalEvaluations = evaluationActivities.length;
  const allowedEvaluations = evaluationActivities.filter((a) => a.type === "policy_evaluated").length;
  const blockedEvaluations = evaluationActivities.filter((a) => a.type === "access_denied").length;

  const flaggedActivity = store.activities.find(
    (a) => a.severity === "warning" || a.severity === "critical" || a.type === "access_denied"
  );

  return (
    <>
      <DashboardHeader
        title="Organization Overview"
        description={`Welcome back, ${adminFirstName}. All zero-trust access policies are actively enforced.`}
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" asChild className="hidden sm:inline-flex gap-1.5 text-xs">
              <Link href="/access">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                Policy Simulator
              </Link>
            </Button>
            <Button size="sm" asChild className="gap-1.5 shadow-sm text-xs">
              <Link href="/members">
                <UserPlus className="h-3.5 w-3.5" />
                Invite Member
              </Link>
            </Button>
          </div>
        }
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Threat Detection & Zero-Trust Posture Banner */}
        {!alertDismissed && (
          flaggedActivity ? (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs transition-all">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2 font-semibold text-foreground">
                    <span>Security Incident Flagged by Policy Engine</span>
                    <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-600 dark:text-amber-400 py-0 uppercase">
                      {flaggedActivity.severity || "Warning"}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mt-0.5 leading-relaxed">
                    {flaggedActivity.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs border-amber-500/30 hover:bg-amber-500/20"
                  asChild
                >
                  <Link href="/activity">Inspect Audit Trail</Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setAlertDismissed(true);
                    toast.info("Security alert acknowledged.");
                  }}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs transition-all">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2 font-semibold text-foreground">
                    <span>Zero-Trust Perimeter Active & Cryptographically Enforced</span>
                    <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-600 dark:text-emerald-400 py-0">
                      All Systems Nominal
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mt-0.5 leading-relaxed">
                    Least-privilege RBAC/ABAC enforcement is operational across <strong>{store.organization.name}</strong>. Zero anomalous access attempts detected.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs border-emerald-500/30 hover:bg-emerald-500/10 text-foreground"
                  asChild
                >
                  <Link href="/activity">Inspect Audit Ledger</Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setAlertDismissed(true);
                  }}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )
        )}

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.title} href={stat.href} className="group block">
                <Card className="hover:border-primary/40 transition-colors h-full shadow-xs">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${stat.bg}`}>
                        <Icon className={`h-4 w-4 ${stat.color}`} />
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <div className="text-2xl font-bold mb-0.5 tracking-tight">{stat.value}</div>
                    <div className="text-xs font-semibold text-foreground">{stat.title}</div>
                    <div className="text-[11px] mt-1 text-muted-foreground">{stat.sub}</div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Analytics Grid: Real-Time Access Telemetry & Role Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Access Requests & Telemetry Card */}
          <Card className="lg:col-span-8 border-border shadow-xs">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Real-Time Access Telemetry & Evaluations
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Live RBAC/ABAC policy decisions across SaaS applications
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <span className="h-2 w-2 rounded-full bg-primary" /> {allowedEvaluations} Allowed
                  </span>
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <span className="h-2 w-2 rounded-full bg-destructive" /> {blockedEvaluations} Blocked
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {totalEvaluations === 0 ? (
                <div className="h-44 w-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-border rounded-lg bg-muted/5">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center mb-2.5">
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                  <h4 className="text-xs font-semibold text-foreground">No Access Telemetry Recorded Yet</h4>
                  <p className="text-[11px] text-muted-foreground max-w-sm mt-0.5 mb-3">
                    Zero-trust access evaluations, policy approvals, and denials will be graphed here dynamically as users or API tokens evaluate access permissions.
                  </p>
                  <Button size="sm" variant="outline" asChild className="h-7 text-xs gap-1.5 border-primary/30 hover:bg-primary/10">
                    <Link href="/access">
                      <Sparkles className="h-3 w-3 text-primary" />
                      Launch Policy Simulator
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3 mb-2">
                    <div className="rounded-lg border border-border p-3 bg-muted/10">
                      <div className="text-[10px] text-muted-foreground">Total Evaluations</div>
                      <div className="text-lg font-bold">{totalEvaluations}</div>
                    </div>
                    <div className="rounded-lg border border-primary/20 p-3 bg-primary/5">
                      <div className="text-[10px] text-primary">Granted Access</div>
                      <div className="text-lg font-bold text-primary">{allowedEvaluations}</div>
                    </div>
                    <div className="rounded-lg border border-destructive/20 p-3 bg-destructive/5">
                      <div className="text-[10px] text-destructive">Blocked Denials</div>
                      <div className="text-lg font-bold text-destructive">{blockedEvaluations}</div>
                    </div>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                    {evaluationActivities.slice(0, 4).map((evalAct) => (
                      <div key={evalAct.id} className="flex items-center justify-between text-xs p-2 rounded border border-border bg-muted/20">
                        <div className="flex items-center gap-2 truncate">
                          <Badge variant={evalAct.type === "policy_evaluated" ? "default" : "destructive"} className="text-[10px] py-0">
                            {evalAct.type === "policy_evaluated" ? "ALLOWED" : "BLOCKED"}
                          </Badge>
                          <span className="font-medium truncate">{evalAct.target}</span>
                          <span className="text-muted-foreground text-[11px] truncate">({evalAct.actor})</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground shrink-0">{evalAct.timestamp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Department & Role Breakdown */}
          <Card className="lg:col-span-4 border-border shadow-xs flex flex-col justify-between">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Privilege Distribution
              </CardTitle>
              <CardDescription className="text-xs">
                RBAC role allocation across {totalMembers} team members
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 flex-1 flex flex-col justify-center">
              {Object.entries(roleCounts).slice(0, 5).map(([role, count]) => {
                const pct = Math.round((count / totalMembers) * 100);
                return (
                  <div key={role} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground">{role}</span>
                      <span className="text-muted-foreground font-mono text-[11px]">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Quick Hub Cards: Compliance & Developer API */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/compliance" className="group block">
            <Card className="hover:border-primary/40 transition-colors shadow-xs h-full bg-gradient-to-r from-card via-card to-emerald-500/5">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">Compliance & SOC 2 Readiness</span>
                      <Badge variant="outline" className="text-[10px] text-emerald-500 border-emerald-500/30">
                        94% Score
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Auditor-ready continuous verification for SOC 2 Type II, ISO 27001, and HIPAA.
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0 ml-2" />
              </CardContent>
            </Card>
          </Link>

          <Link href="/developers" className="group block">
            <Card className="hover:border-primary/40 transition-colors shadow-xs h-full bg-gradient-to-r from-card via-card to-primary/5">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Terminal className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">Developer API & Webhooks</span>
                      <Badge variant="outline" className="text-[10px]">
                        {activeApiKeys} Active Keys
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Programmatic IAM evaluation, CI/CD tokens, and Terraform provider integration.
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0 ml-2" />
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Two-Column Grid: Active JIT Sessions & Live Security Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active JIT Temporary Grants Card */}
          <Card className="shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-500" />
                  Active Just-In-Time (JIT) Grants
                </CardTitle>
                <CardDescription className="text-xs">
                  Temporary elevated permissions auto-expiring in real-time
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/access" className="gap-1 text-xs">
                  Manage JIT
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {store.jitGrants.length === 0 ? (
                <div className="py-7 text-center flex flex-col items-center justify-center border border-dashed border-border rounded-lg bg-muted/5 p-5">
                  <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center mb-2">
                    <Clock className="h-4 w-4 text-amber-500" />
                  </div>
                  <div className="text-xs font-semibold text-foreground">No Active JIT Grants</div>
                  <p className="text-[11px] text-muted-foreground max-w-xs mt-0.5 mb-3">
                    Zero standing privileges currently elevated. All access strictly adheres to baseline least privilege.
                  </p>
                  <Button size="sm" variant="outline" asChild className="h-7 text-xs gap-1.5 border-amber-500/30 hover:bg-amber-500/10 text-foreground">
                    <Link href="/access">
                      <Zap className="h-3 w-3 text-amber-500" />
                      Issue Ephemeral Grant
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {store.jitGrants.slice(0, 3).map((grant) => {
                    const isExpired = grant.status === "expired" || new Date(grant.expiresAt).getTime() < Date.now();
                    return (
                      <div
                        key={grant.id}
                        className="rounded-lg border border-border p-3 flex items-center justify-between text-xs bg-muted/20"
                      >
                        <div className="space-y-1 min-w-0 flex-1 pr-3">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground truncate">{grant.memberName}</span>
                            <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-normal">
                              {grant.integration}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground truncate">{grant.scope}</p>
                        </div>
                        <div className="text-right shrink-0">
                          {isExpired ? (
                            <Badge variant="outline" className="text-muted-foreground bg-muted text-[10px]">
                              Expired
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px]">
                              Active
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Real-time Activity Feed Card */}
          <Card className="shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  Live Audit Activity Stream
                </CardTitle>
                <CardDescription className="text-xs">
                  Latest security and provisioning events across connected tools
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/activity" className="gap-1 text-xs">
                  Full log
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {store.activities.slice(0, 4).map((act) => (
                  <div key={act.id} className="flex items-start gap-3 text-xs pb-2.5 border-b border-border last:border-0">
                    <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-foreground truncate">{act.target}</span>
                        <span className="text-[10px] text-muted-foreground shrink-0">{act.timestamp}</span>
                      </div>
                      <p className="text-muted-foreground line-clamp-1 mt-0.5">{act.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
