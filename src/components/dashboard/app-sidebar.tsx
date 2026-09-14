"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Puzzle,
  ShieldCheck,
  Activity,
  Settings,
  Shield,
  ChevronDown,
  Building2,
  LogOut,
  ExternalLink,
  Code2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAirlockStore } from "@/lib/airlock-store";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/members", icon: Users, label: "Members Directory" },
  { href: "/integrations", icon: Puzzle, label: "Tool Integrations" },
  { href: "/access", icon: ShieldCheck, label: "Access & Simulator" },
  { href: "/activity", icon: Activity, label: "Audit Activity Log" },
];

const bottomItems = [
  { href: "/settings", icon: Settings, label: "Settings & Creator" },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { store } = useAirlockStore();

  const orgName = store.organization.name;
  const plan = store.organization.plan;
  const userName = store.organization.adminName;
  const userEmail = store.organization.adminEmail;

  function handleSignOut() {
    router.push("/");
  }

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Header / Org switcher */}
      <div className="flex h-16 items-center border-b border-sidebar-border px-4">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex w-full items-center gap-2.5 rounded-md p-1.5 hover:bg-sidebar-accent transition-colors outline-none cursor-pointer">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary shadow-xs">
              <Shield className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="text-sm font-semibold truncate text-sidebar-foreground">{orgName}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {plan}
              </div>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start">
            <DropdownMenuLabel>Active Organization</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 font-medium">
              <Building2 className="h-4 w-4 text-primary" />
              {orgName}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/" className="gap-2 cursor-pointer">
                <ExternalLink className="h-4 w-4" />
                Public Landing Page
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Nav items */}
      <ScrollArea className="flex-1 px-3 py-3">
        <div className="px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          IAM Navigation
        </div>
        <nav className="space-y-1 mt-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : "")} />
                <span className="flex-1 truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <Separator className="my-3" />

        <div className="px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          Configuration
        </div>
        <nav className="space-y-1 mt-1">
          {bottomItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                    : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Creator Callout Badge in Sidebar */}
        <div className="mt-8 rounded-lg border border-sidebar-border bg-sidebar-accent/30 p-3 text-xs">
          <div className="flex items-center gap-2 mb-1">
            <Code2 className="h-3.5 w-3.5 text-primary" />
            <span className="font-semibold text-foreground">Srinivas Jangiti</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Enterprise IAM & Zero-Trust Governance Architecture.
          </p>
          <a
            href="https://github.com/srinivasjangiti"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
          >
            GitHub Profile <ExternalLink className="h-2.5 w-2.5" />
          </a>
        </div>
      </ScrollArea>

      {/* User footer */}
      <div className="border-t border-sidebar-border p-3">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex w-full items-center gap-3 rounded-md px-2.5 py-2 hover:bg-sidebar-accent transition-colors outline-none cursor-pointer">
            <Avatar className="h-8 w-8 ring-1 ring-primary/20">
              <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
                SJ
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-left min-w-0">
              <div className="text-sm font-semibold truncate text-sidebar-foreground">{userName}</div>
              <div className="text-xs text-muted-foreground truncate">{userEmail}</div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start" side="top">
            <DropdownMenuLabel className="font-normal">
              <div className="font-semibold">{userName}</div>
              <div className="text-xs text-muted-foreground">{userEmail}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings" className="gap-2 cursor-pointer">
                <Settings className="h-4 w-4" />
                Settings & Credits
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href="https://github.com/srinivasjangiti" target="_blank" rel="noreferrer" className="gap-2 cursor-pointer">
                <ExternalLink className="h-4 w-4" />
                Creator GitHub
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 text-destructive focus:text-destructive cursor-pointer"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              Back to Home
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
