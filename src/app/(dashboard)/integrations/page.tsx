"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import {
  Plus,
  CheckCircle2,
  Settings,
  Users,
  RefreshCw,
  ExternalLink,
  Unlink,
  Zap,
  Shield,
  Layers,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAirlockStore, Integration } from "@/lib/airlock-store";

export default function IntegrationsPage() {
  const { store, toggleIntegration } = useAirlockStore();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeConfigIntegration, setActiveConfigIntegration] = useState<Integration | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const categories = [
    "all",
    "Development",
    "Collaboration",
    "Cloud & Infrastructure",
    "Security & Monitoring",
    "Productivity",
  ];

  const filtered = store.integrations.filter((item) => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const connectedCount = store.integrations.filter((i) => i.status === "connected").length;

  function handleSync(id: string) {
    setSyncingId(id);
    setTimeout(() => {
      setSyncingId(null);
    }, 1000);
  }

  return (
    <>
      <DashboardHeader
        title="Tool Integrations & SaaS Connectors"
        description="Connect identity providers, developer tools, and cloud platforms for automated access governance"
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs py-1 px-2.5 font-semibold text-primary border-primary/30">
              {connectedCount} / {store.integrations.length} Active Connectors
            </Badge>
          </div>
        }
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Search and Category Tabs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search connectors by name or service..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 text-xs"
            />
          </div>

          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full sm:w-auto">
            <TabsList className="h-9">
              {categories.map((cat) => (
                <TabsTrigger key={cat} value={cat} className="text-xs capitalize">
                  {cat === "all" ? "All Tools" : cat}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Integration Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((item) => {
            const isConnected = item.status === "connected";
            const isSyncing = syncingId === item.id;

            return (
              <Card
                key={item.id}
                className={`hover:border-primary/40 transition-all flex flex-col justify-between ${
                  isConnected ? "border-primary/20 bg-card" : "opacity-90 bg-card/60"
                }`}
              >
                <CardContent className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Top Row: Icon & Status */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl flex items-center justify-center h-12 w-12 rounded-xl bg-muted/60 border border-border">
                          {item.icon}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-foreground">{item.name}</h3>
                          <span className="text-[11px] text-muted-foreground">{item.category}</span>
                        </div>
                      </div>

                      {isConnected ? (
                        <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Connected
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground text-[10px]">
                          Disconnected
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {item.description}
                    </p>

                    {/* Features Badges */}
                    <div className="flex flex-wrap gap-1 mt-3">
                      {item.features.slice(0, 3).map((f) => (
                        <span
                          key={f}
                          className="text-[10px] bg-muted/80 text-muted-foreground px-2 py-0.5 rounded border border-border/50"
                        >
                          {f}
                        </span>
                      ))}
                      {item.features.length > 3 && (
                        <span className="text-[10px] text-muted-foreground/80 px-1 py-0.5">
                          +{item.features.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bottom Stats & Actions */}
                  <div className="pt-4 border-t border-border mt-4 flex items-center justify-between">
                    <div className="text-[11px] text-muted-foreground">
                      {isConnected ? (
                        <span className="flex items-center gap-1.5 font-medium text-foreground">
                          <Users className="h-3.5 w-3.5 text-primary" />
                          {item.membersCount} active provisioned
                        </span>
                      ) : (
                        <span>Ready to link</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {isConnected && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => handleSync(item.id)}
                          title="Trigger Directory Sync"
                        >
                          <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin text-primary" : ""}`} />
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant={isConnected ? "outline" : "default"}
                        onClick={() => toggleIntegration(item.id)}
                        className="h-8 text-xs gap-1.5"
                      >
                        {isConnected ? (
                          <>
                            <Unlink className="h-3 w-3 text-destructive" />
                            Disconnect
                          </>
                        ) : (
                          <>
                            <Zap className="h-3 w-3" />
                            Connect
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
}
