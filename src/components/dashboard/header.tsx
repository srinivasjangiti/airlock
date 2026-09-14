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
import { CommandPalette } from "@/components/dashboard/command-palette";
import { useAirlockStore } from "@/lib/airlock-store";
import { useState } from "react";

interface DashboardHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function DashboardHeader({ title, description, actions }: DashboardHeaderProps) {
  const { store } = useAirlockStore();

  const recentNotifications = store.activities.slice(0, 4);

  return (
    <>
      <CommandPalette />
      <header className="flex h-16 items-center justify-between border-b border-border px-6 bg-background/95 backdrop-blur-sm sticky top-0 z-30">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg font-bold tracking-tight">{title}</h1>
            <Badge variant="outline" className="text-[10px] uppercase font-semibold text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10 hidden sm:inline-flex">
              Zero-Trust: Enforced
            </Badge>
          </div>
          {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Quick Search & Command Palette trigger */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.dispatchEvent(new CustomEvent("open-command-palette"))}
            className="h-8 gap-2 text-xs border-border bg-muted/40 text-muted-foreground hover:text-foreground hidden md:inline-flex px-2.5 rounded-lg"
          >
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="hidden lg:inline">Search or command...</span>
            <kbd className="pointer-events-none inline-flex h-4 select-none items-center gap-0.5 rounded border border-border bg-card px-1 font-mono text-[9px] font-medium text-muted-foreground">
              ⌘K
            </kbd>
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
    </>
  );
}
