"use client";

import { Bell, Search, RefreshCw, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAirlockStore } from "@/lib/airlock-store";
import { useState } from "react";

interface DashboardHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function DashboardHeader({ title, description, actions }: DashboardHeaderProps) {
  const { store, resetToDemo, clearToClean } = useAirlockStore();
  const [resetting, setResetting] = useState(false);

  const handleResetDemo = () => {
    setResetting(true);
    resetToDemo();
    setTimeout(() => setResetting(false), 500);
  };

  const recentNotifications = store.activities.slice(0, 4);

  return (
    <header className="flex h-16 items-center justify-between border-b border-border px-6 bg-background/95 backdrop-blur-sm sticky top-0 z-30">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-lg font-bold tracking-tight">{title}</h1>
          <Badge variant="outline" className="text-[10px] uppercase font-semibold text-primary border-primary/30 hidden sm:inline-flex">
            Sandbox Active
          </Badge>
        </div>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Quick Demo Data Seed / Reset */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleResetDemo}
          disabled={resetting}
          title="Reset sample enterprise data"
          className="text-xs h-8 gap-1.5 border-primary/30 hover:bg-primary/5 text-muted-foreground hover:text-foreground hidden lg:inline-flex"
        >
          <RefreshCw className={`h-3 w-3 ${resetting ? "animate-spin text-primary" : ""}`} />
          {resetting ? "Resetting..." : "Reset Demo Data"}
        </Button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-8 w-8">
              <Bell className="h-4 w-4" />
              {recentNotifications.length > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-[10px] flex items-center justify-center rounded-full bg-primary text-primary-foreground">
                  {recentNotifications.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 sm:w-96">
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-sm font-semibold">Security Audit Events</span>
              <span className="text-[11px] text-muted-foreground">{recentNotifications.length} recent</span>
            </div>
            <DropdownMenuSeparator />
            {recentNotifications.map((act) => (
              <DropdownMenuItem key={act.id} className="flex flex-col items-start gap-1 py-2.5 px-3">
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-semibold truncate max-w-[200px]">{act.target}</span>
                  <span className="text-[10px] text-muted-foreground">{act.timestamp}</span>
                </div>
                <span className="text-xs text-muted-foreground line-clamp-2">{act.description}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Custom actions passed from page */}
        {actions}
      </div>
    </header>
  );
}
