import Link from "next/link";
import { ArrowRight, Play, Users, Shield, Zap, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-primary/10 rounded-full blur-3xl opacity-70" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
        {/* Badge */}
        <div className="mb-6 flex justify-center">
          <Badge variant="outline" className="gap-1.5 rounded-full px-4 py-1.5 text-xs border-primary/30 text-primary bg-primary/5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse inline-block" />
            AirLock v2.0 Enterprise IAM • Next-Gen Governance
          </Badge>
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-[1.1]">
          Control Who Gets In,{" "}
          <span className="bg-gradient-to-r from-primary via-indigo-500 to-sky-500 bg-clip-text text-transparent">
            What They Access
          </span>
          {" "}& When
        </h1>

        {/* Sub-headline */}
        <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          AirLock empowers engineering & security leaders to automate team onboarding, enforce role-based access across GitHub, AWS, and Slack, and issue Just-In-Time access grants — all from a single pane of glass.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="xl" asChild className="group shadow-lg shadow-primary/20">
            <Link href="/dashboard">
              <Sparkles className="h-4 w-4 mr-1 text-primary-foreground" />
              Explore Interactive Sandbox
              <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button size="xl" variant="outline" asChild className="group">
            <Link href="#how-it-works">
              <Play className="h-4 w-4 mr-1.5" />
              See How It Works
            </Link>
          </Button>
        </div>

        {/* Trust signals */}
        <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span>500+ teams secured</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span>Zero-Trust Architecture</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <span>Automated JIT Grants</span>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="mt-16 relative mx-auto max-w-5xl">
          <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-indigo-500/10 to-primary/20 rounded-2xl blur-xl opacity-70" />
          <div className="relative rounded-xl border border-border bg-card overflow-hidden shadow-2xl">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 bg-muted/60 px-4 py-3 border-b border-border">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-destructive/70" />
                <div className="h-3 w-3 rounded-full bg-amber-400/70" />
                <div className="h-3 w-3 rounded-full bg-emerald-400/70" />
              </div>
              <div className="flex-1 mx-4 flex justify-center">
                <div className="bg-background rounded-md px-4 py-1 text-xs text-muted-foreground border border-border w-72 text-center font-mono">
                  airlock.app/dashboard
                </div>
              </div>
            </div>
            {/* App Preview */}
            <DashboardPreview />
          </div>
        </div>
      </div>
    </section>
  );
}

function DashboardPreview() {
  return (
    <div className="flex h-[420px] bg-background text-left">
      {/* Sidebar */}
      <div className="w-56 border-r border-border bg-sidebar flex flex-col p-3 gap-1">
        <div className="flex items-center gap-2 px-2 py-3 mb-2">
          <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
            <Shield className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-sm">Acme AirLock</span>
        </div>
        {["Dashboard", "Members", "Integrations", "Access Control", "Activity", "Settings"].map(
          (item, i) => (
            <div
              key={item}
              className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-xs ${
                i === 0
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <div className="h-3.5 w-3.5 rounded-sm bg-current opacity-40" />
              {item}
            </div>
          )
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-hidden">
        <div className="text-sm font-semibold mb-4">Enterprise Governance Overview</div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[
            { label: "Enforcement Kernel", value: "Active", change: "RBAC & ABAC Real-Time" },
            { label: "Identity Sync", value: "SCIM 2.0", change: "RFC 7644 Compliant" },
            { label: "Access Model", value: "Zero-Trust", change: "Ephemeral Just-In-Time" },
            { label: "Audit Ledger", value: "Tamper-Proof", change: "SHA-256 Chained Blocks" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-lg border border-border bg-card p-3">
              <div className="text-[10px] text-muted-foreground mb-1">{stat.label}</div>
              <div className="text-xl font-bold">{stat.value}</div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">{stat.change}</div>
            </div>
          ))}
        </div>

        {/* Table Preview */}
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="bg-muted/30 px-3 py-2 text-[10px] font-medium text-muted-foreground flex gap-6">
            <span className="w-36">SYSTEM PRINCIPAL</span>
            <span className="w-28">AUTHORITY</span>
            <span className="w-24">STATUS</span>
            <span>ENFORCED PROTOCOLS</span>
          </div>
          {[
            { name: "Srinivas Jangiti", role: "Primary Admin", status: "verified", tools: "GitHub • AWS • Slack • Google Workspace" },
            { name: "SCIM Sync Daemon", role: "Directory Broker", status: "active", tools: "RFC 7643/7644 Sync • Automated Lifecycle" },
            { name: "JIT Ephemeral Enforcer", role: "Access Broker", status: "active", tools: "Time-Bound Revocation • Least-Privilege" },
            { name: "Audit Integrity Engine", role: "Cryptographic Node", status: "verified", tools: "SHA-256 Merkle Chain • Tamper-Evident Ledger" },
          ].map((row) => (
            <div key={row.name} className="flex gap-6 items-center px-3 py-2.5 border-t border-border hover:bg-muted/20 text-[11px]">
              <span className="w-36 font-medium truncate">{row.name}</span>
              <span className="w-28 text-muted-foreground">{row.role}</span>
              <span className="w-24">
                <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded px-1.5 py-0.5 text-[10px] font-medium">
                  {row.status}
                </span>
              </span>
              <span className="text-muted-foreground truncate">{row.tools}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
