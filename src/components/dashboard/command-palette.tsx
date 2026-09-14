"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  Users,
  Puzzle,
  ShieldCheck,
  ShieldAlert,
  Terminal,
  Activity,
  Settings,
  Sparkles,
  Lock,
  RefreshCw,
  Moon,
  Sun,
  Laptop,
  CheckCircle2,
  ExternalLink,
  Zap,
  Clock,
  KeyRound,
  Shield,
  X,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "next-themes";
import { useAirlockStore } from "@/lib/airlock-store";
import { toast } from "sonner";

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const router = useRouter();
  const { setTheme, theme } = useTheme();
  const { store, enforceMfaAll, revokeExpiredJitGrants, resetToDemo } = useAirlockStore();

  // Listen for Cmd+K / Ctrl+K
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    const handleCustomOpen = () => setOpen(true);

    document.addEventListener("keydown", down);
    window.addEventListener("open-command-palette", handleCustomOpen);

    return () => {
      document.removeEventListener("keydown", down);
      window.removeEventListener("open-command-palette", handleCustomOpen);
    };
  }, []);

  const handleSelect = (callback: () => void) => {
    setOpen(false);
    setQuery("");
    callback();
  };

  const q = query.toLowerCase().trim();

  // Filtered Navigation
  const navItems = [
    { label: "Dashboard Overview", href: "/dashboard", icon: LayoutDashboard, category: "Navigation" },
    { label: "Members Directory", href: "/members", icon: Users, category: "Navigation" },
    { label: "Tool Integrations", href: "/integrations", icon: Puzzle, category: "Navigation" },
    { label: "Access Policies & JIT Simulator", href: "/access", icon: ShieldCheck, category: "Navigation" },
    { label: "Compliance & SOC 2 Readiness", href: "/compliance", icon: ShieldAlert, category: "Navigation" },
    { label: "Developer API & Webhooks", href: "/developers", icon: Terminal, category: "Navigation" },
    { label: "Audit Activity Log", href: "/activity", icon: Activity, category: "Navigation" },
    { label: "Settings & Creator Credits", href: "/settings", icon: Settings, category: "Navigation" },
  ].filter((item) => item.label.toLowerCase().includes(q));

  // Filtered Members
  const memberMatches = store.members
    .filter((m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.role.toLowerCase().includes(q))
    .slice(0, 4);

  // Filtered Integrations
  const integrationMatches = store.integrations
    .filter((i) => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q))
    .slice(0, 4);

  // Actions
  const actionItems = [
    {
      label: "Simulate Access Policy (ALLOW / DENY test)",
      icon: Zap,
      action: () => router.push("/access"),
      badge: "Simulator",
    },
    {
      label: "Issue Just-In-Time (JIT) Elevated Access",
      icon: Clock,
      action: () => router.push("/access"),
      badge: "Break-Glass",
    },
    {
      label: "Enforce MFA on Non-Compliant Users (1-Click Remediation)",
      icon: ShieldCheck,
      action: () => {
        const count = enforceMfaAll();
        if (count > 0) {
          toast.success(`Enforced hardware/TOTP MFA on ${count} member(s). SOC 2 CC6.6 compliant!`);
        } else {
          toast.info("All organization members already have MFA enrolled!");
        }
      },
      badge: "SOC 2",
    },
    {
      label: "Clean Expired JIT Access Grants",
      icon: Lock,
      action: () => {
        const count = revokeExpiredJitGrants();
        if (count > 0) {
          toast.success(`Revoked ${count} expired JIT session(s) per Least Privilege!`);
        } else {
          toast.info("No expired active grants found in registry.");
        }
      },
      badge: "Governance",
    },
    {
      label: "Toggle Dark / Light Theme",
      icon: theme === "dark" ? Sun : Moon,
      action: () => {
        const nextTheme = theme === "dark" ? "light" : "dark";
        setTheme(nextTheme);
        toast.info(`Switched to ${nextTheme} theme`);
      },
      badge: "Theme",
    },
    {
      label: "Reset Sample Enterprise Sandbox Data",
      icon: RefreshCw,
      action: () => {
        resetToDemo();
        toast.success("Reset demo state to default enterprise sandbox!");
      },
      badge: "Reset",
    },
  ].filter((item) => item.label.toLowerCase().includes(q) || item.badge.toLowerCase().includes(q));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0 max-w-2xl overflow-hidden border border-border bg-card shadow-2xl rounded-2xl gap-0">
        {/* Search Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border bg-muted/20">
          <Search className="h-5 w-5 text-primary shrink-0" />
          <input
            type="text"
            placeholder="Type a command, search members, tools, policies..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm placeholder:text-muted-foreground outline-none text-foreground font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-muted-foreground hover:text-foreground text-xs p-1"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <Badge variant="outline" className="text-[10px] uppercase font-mono px-1.5 py-0.5 shrink-0 text-muted-foreground">
            ESC
          </Badge>
        </div>

        {/* Scrollable Command Body */}
        <div className="max-h-[60vh] overflow-y-auto p-2 space-y-4">
          {/* Quick Actions */}
          {actionItems.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-primary" /> Quick Actions & Remediation
              </div>
              <div className="space-y-0.5 mt-1">
                {actionItems.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelect(item.action)}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer group text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-muted group-hover:bg-primary/20 text-foreground group-hover:text-primary transition-colors">
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <span>{item.label}</span>
                      </div>
                      <Badge variant="secondary" className="text-[10px] font-normal group-hover:border-primary/30">
                        {item.badge}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation Items */}
          {navItems.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Pages & Hubs
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-1">
                {navItems.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelect(() => router.push(item.href))}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-foreground hover:bg-sidebar-accent hover:text-primary transition-colors cursor-pointer text-left"
                    >
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Members */}
          {memberMatches.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                <span>Team Members ({memberMatches.length})</span>
                <span className="text-[10px] font-normal text-muted-foreground">Jump to directory</span>
              </div>
              <div className="space-y-1 mt-1">
                {memberMatches.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => handleSelect(() => router.push("/members"))}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs text-foreground hover:bg-sidebar-accent transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-[10px]">
                        {m.name.charAt(0)}
                      </div>
                      <div className="truncate">
                        <span className="font-semibold">{m.name}</span>
                        <span className="text-muted-foreground ml-2 text-[11px]">{m.email}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline" className="text-[10px] py-0 h-4">
                        {m.role}
                      </Badge>
                      {m.mfaEnabled ? (
                        <span className="text-[10px] text-emerald-500 font-medium flex items-center gap-0.5">
                          <CheckCircle2 className="h-2.5 w-2.5" /> MFA
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-500 font-medium">No MFA</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Integrations */}
          {integrationMatches.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Tools & Integrations
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-1">
                {integrationMatches.map((i) => (
                  <button
                    key={i.id}
                    onClick={() => handleSelect(() => router.push("/integrations"))}
                    className="flex items-center justify-between rounded-lg px-3 py-2 text-xs text-foreground hover:bg-sidebar-accent transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{i.icon}</span>
                      <span className="font-semibold">{i.name}</span>
                    </div>
                    <Badge
                      variant={i.status === "connected" ? "default" : "outline"}
                      className="text-[10px] py-0 h-4"
                    >
                      {i.status}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          )}

          {actionItems.length === 0 && navItems.length === 0 && memberMatches.length === 0 && (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No matching commands, members, or integrations found for &quot;{query}&quot;.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-4 py-2 bg-muted/40 flex items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="font-mono bg-card px-1.5 py-0.5 rounded border border-border">↑↓</kbd> navigate
            </span>
            <span>
              <kbd className="font-mono bg-card px-1.5 py-0.5 rounded border border-border">↵</kbd> select
            </span>
          </div>
          <div className="flex items-center gap-1 font-medium text-foreground">
            <Shield className="h-3 w-3 text-primary" /> AirLock Zero-Trust IAM
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
