"use client";

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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useAirlockStore } from "@/lib/airlock-store";

export default function DashboardPage() {
  const { store } = useAirlockStore();

  const totalMembers = store.members.length;
  const activeMembers = store.members.filter((m) => m.status === "active").length;
  const activeIntegrations = store.integrations.filter((i) => i.status === "connected").length;
  const activeJitGrants = store.jitGrants.filter((g) => g.status === "active").length;
  const securityEventsCount = store.activities.length;

  const adminFirstName = store.organization.adminName.split(" ")[0] || "there";

  const STATS = [
    {
      title: "Team Members",
      value: totalMembers.toString(),
      sub: `${activeMembers} active · ${totalMembers - activeMembers} pending/suspended`,
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
      sub: "Time-limited elevated access sessions",
      icon: Clock,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      href: "/access",
    },
    {
      title: "Security & Audit Events",
      value: securityEventsCount.toString(),
      sub: "Monitored policy events & access logs",
      icon: Activity,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      href: "/activity",
    },
  ];

  const SETUP_STEPS = [
    {
      step: 1,
      title: "Explore Connected Tools",
      description: "Manage GitHub, Slack, AWS, and Google Workspace provisioning policies.",
      cta: "Configure Integrations",
      href: "/integrations",
      icon: Puzzle,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Simulate Access & JIT Grants",
      step: 2,
      description: "Test permission evaluation (ALLOW/DENY) and grant temporary break-glass access.",
      cta: "Open Policy Simulator",
      href: "/access",
      icon: ShieldCheck,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      step: 3,
      title: "Manage Members & CSV Import",
      description: "Onboard new team members individually or in bulk via comma-separated files.",
      cta: "View Directory",
      href: "/members",
      icon: UserPlus,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
    },
  ];

  return (
    <>
      <DashboardHeader
        title="Organization Overview"
        description={`Welcome back, ${adminFirstName}. All zero-trust access policies are actively enforced.`}
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" asChild className="hidden sm:inline-flex gap-1.5">
              <Link href="/access">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                Policy Simulator
              </Link>
            </Button>
            <Button size="sm" asChild className="gap-1.5 shadow-sm">
              <Link href="/members">
                <UserPlus className="h-4 w-4" />
                Invite Member
              </Link>
            </Button>
          </div>
        }
      />

      <div className="flex-1 p-6 space-y-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.title} href={stat.href} className="group block">
                <Card className="hover:border-primary/40 transition-colors h-full">
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

        {/* Quick Launchpad */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground">Governance Launchpad</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Core workflows to manage identity lifecycle, temporary grants, and compliance.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SETUP_STEPS.map((s) => {
              const Icon = s.icon;
              return (
                <Card key={s.step} className="group hover:border-primary/40 transition-colors flex flex-col justify-between">
                  <CardContent className="p-6 flex flex-col gap-4 h-full">
                    <div className="flex items-start justify-between">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${s.bg}`}>
                        <Icon className={`h-5 w-5 ${s.color}`} />
                      </div>
                      <span className="text-[11px] font-semibold text-muted-foreground bg-muted rounded-full px-2.5 py-0.5">
                        Feature {s.step}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm mb-1">{s.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{s.description}</p>
                    </div>
                    <Button variant="outline" size="sm" className="gap-1.5 w-full group-hover:border-primary/40" asChild>
                      <Link href={s.href}>
                        {s.cta}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Two-Column Grid: Active JIT Sessions & Live Security Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active JIT Temporary Grants Card */}
          <Card>
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
                <div className="py-8 text-center text-xs text-muted-foreground">
                  No active JIT grants. Use the Access page to issue temporary grants.
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
          <Card>
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
