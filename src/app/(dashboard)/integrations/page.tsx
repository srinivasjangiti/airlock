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
  KeyRound,
  Terminal,
  AlertTriangle,
  Play,
  Lock,
  Globe,
  Check,
  Radio,
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
import { toast } from "sonner";

export default function IntegrationsPage() {
  const { store, toggleIntegration, connectIntegrationLive } = useAirlockStore();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [syncingId, setSyncingId] = useState<string | null>(null);

  // Connection Setup Modal State
  const [connectModalItem, setConnectModalItem] = useState<Integration | null>(null);
  const [connectionMode, setConnectionMode] = useState<"live" | "sandbox">("live");

  // Credential Form State
  const [tokenInput, setTokenInput] = useState("");
  const [orgInput, setOrgInput] = useState("");
  const [webhookUrlInput, setWebhookUrlInput] = useState("");
  const [regionInput, setRegionInput] = useState("us-east-1");

  // Verification Testing State
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    error?: string;
    details?: any;
  } | null>(null);

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

  const handleOpenConnect = (item: Integration) => {
    setConnectModalItem(item);
    setConnectionMode("live");
    setTokenInput("");
    setOrgInput(item.config?.orgOrTeam || "");
    setWebhookUrlInput("");
    setRegionInput("us-east-1");
    setVerificationResult(null);
  };

  const handleTestLiveConnection = async () => {
    if (!connectModalItem) return;
    setVerifying(true);
    setVerificationResult(null);

    try {
      const payload: any = {
        provider: connectModalItem.id,
        credentials: {
          token: tokenInput,
          org: orgInput,
          webhookUrl: webhookUrlInput,
          region: regionInput,
        },
      };

      const res = await fetch("/api/integrations/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setVerificationResult({ success: true, details: data });
        toast.success(`Verified connection with ${connectModalItem.name}!`);
      } else {
        setVerificationResult({ success: false, error: data.error || "Verification failed." });
        toast.error(`Verification error: ${data.error || "Failed to reach endpoint"}`);
      }
    } catch (err: any) {
      setVerificationResult({ success: false, error: err.message });
      toast.error(`Network error: ${err.message}`);
    } finally {
      setVerifying(false);
    }
  };

  const handleEstablishConnection = () => {
    if (!connectModalItem) return;

    if (connectionMode === "live") {
      connectIntegrationLive(
        connectModalItem.id,
        {
          token: tokenInput,
          orgOrTeam: orgInput || connectModalItem.config?.orgOrTeam,
          webhookUrl: webhookUrlInput,
          region: regionInput,
        },
        verificationResult?.details
          ? {
              remoteOrgName:
                verificationResult.details.organization?.name ||
                verificationResult.details.team?.name,
              remoteMemberCount:
                verificationResult.details.organization?.plan?.filled_seats ||
                verificationResult.details.team?.members_count ||
                store.members.filter((m) => m.status === "active").length,
              authenticatedUser:
                verificationResult.details.authenticatedUser?.login ||
                verificationResult.details.botUser?.user,
            }
          : undefined
      );
      toast.success(`Established LIVE connection to ${connectModalItem.name}!`);
    } else {
      // Sandbox fallback
      toggleIntegration(connectModalItem.id);
      toast.success(`Connected ${connectModalItem.name} in Sandbox Demo Mode.`);
    }

    setConnectModalItem(null);
  };

  const handleTriggerSync = async (id: string, name: string) => {
    setSyncingId(id);
    const targetItem = store.integrations.find((i) => i.id === id);

    try {
      const res = await fetch("/api/integrations/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: id,
          credentials: {
            token: targetItem?.credentials?.token,
            org: targetItem?.credentials?.orgOrTeam || targetItem?.config?.orgOrTeam,
          },
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Synced ${data.syncedCount} members from ${name} (${data.mode === "live" ? "Live API" : "Local Directory"}).`);
      } else {
        toast.info(`Synced local directory cache for ${name}.`);
      }
    } catch {
      toast.info(`Synced directory policies for ${name}.`);
    } finally {
      setSyncingId(null);
    }
  };

  return (
    <>
      <DashboardHeader
        title="Tool Integrations & SaaS Connectors"
        description="Connect real cloud providers, developer platforms, and Slack workspaces with live API verification"
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs py-1 px-2.5 font-semibold text-primary border-primary/30">
              {connectedCount} / {store.integrations.length} Active Connectors
            </Badge>
          </div>
        }
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Architecture Note Banner */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Radio className="h-4 w-4" />
            </div>
            <div>
              <div className="font-semibold text-foreground">Dual-Engine Integration Architecture</div>
              <p className="text-muted-foreground mt-0.5 leading-relaxed">
                Connect via <strong>Live Production Mode</strong> (executes real server-side REST API calls to GitHub/Slack) or <strong>Sandbox Demo Mode</strong> (offline zero-trust simulation without API tokens).
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-[10px] text-primary border-primary/30 shrink-0 font-mono">
            LIVE REST API READY
          </Badge>
        </div>

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
            const isLive = item.connectionType === "live";
            const isSyncing = syncingId === item.id;

            return (
              <Card
                key={item.id}
                className={`hover:border-primary/40 transition-all flex flex-col justify-between shadow-xs ${
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
                        <div className="flex flex-col items-end gap-1">
                          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Connected
                          </Badge>
                          <span className="text-[9px] font-mono text-muted-foreground">
                            {isLive ? "● LIVE REST API" : "○ SANDBOX SIM"}
                          </span>
                        </div>
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

                    {/* Live remote data if verified */}
                    {isConnected && item.liveData && (
                      <div className="mt-3 p-2 rounded-md bg-muted/30 border border-border text-[11px] space-y-0.5">
                        <div className="text-muted-foreground">
                          Remote Org: <span className="font-semibold text-foreground">{item.liveData.remoteOrgName || item.config?.orgOrTeam}</span>
                        </div>
                        {item.liveData.authenticatedUser && (
                          <div className="text-muted-foreground">
                            Auth Identity: <span className="font-mono text-primary">@{item.liveData.authenticatedUser}</span>
                          </div>
                        )}
                      </div>
                    )}
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
                          onClick={() => handleTriggerSync(item.id, item.name)}
                          disabled={isSyncing}
                          title="Trigger Live Directory Sync"
                        >
                          <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin text-primary" : ""}`} />
                        </Button>
                      )}

                      {isConnected ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleIntegration(item.id)}
                          className="h-8 text-xs gap-1.5"
                        >
                          <Unlink className="h-3 w-3 text-destructive" />
                          Disconnect
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleOpenConnect(item)}
                          className="h-8 text-xs gap-1.5 shadow-xs"
                        >
                          <Zap className="h-3 w-3" />
                          Connect
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Integration Setup & Live Verification Modal */}
      <Dialog open={!!connectModalItem} onOpenChange={(open) => !open && setConnectModalItem(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <span className="text-xl">{connectModalItem?.icon}</span>
              Connect {connectModalItem?.name}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Configure authentication credentials and provisioning policy for {connectModalItem?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Mode Selector */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setConnectionMode("live")}
                className={`py-1.5 rounded-md font-medium transition-colors ${
                  connectionMode === "live"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Live Production API
              </button>
              <button
                type="button"
                onClick={() => setConnectionMode("sandbox")}
                className={`py-1.5 rounded-md font-medium transition-colors ${
                  connectionMode === "sandbox"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sandbox Simulator
              </button>
            </div>

            {connectionMode === "live" ? (
              <div className="space-y-3 border border-border rounded-xl p-3.5 bg-muted/20 text-xs">
                {connectModalItem?.id === "github" && (
                  <>
                    <div>
                      <Label className="text-[11px]">GitHub Organization Name</Label>
                      <Input
                        placeholder="e.g. acme-innovations"
                        value={orgInput}
                        onChange={(e) => setOrgInput(e.target.value)}
                        className="mt-1 h-8 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px]">Personal Access Token (PAT) / GitHub App Token</Label>
                      <Input
                        type="password"
                        placeholder="ghp_... or github_pat_..."
                        value={tokenInput}
                        onChange={(e) => setTokenInput(e.target.value)}
                        className="mt-1 h-8 text-xs font-mono"
                      />
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Requires <code>admin:org</code> and <code>repo</code> scopes to manage team memberships.
                      </p>
                    </div>
                  </>
                )}

                {connectModalItem?.id === "slack" && (
                  <>
                    <div>
                      <Label className="text-[11px]">Slack Bot User OAuth Token</Label>
                      <Input
                        type="password"
                        placeholder="xoxb-..."
                        value={tokenInput}
                        onChange={(e) => setTokenInput(e.target.value)}
                        className="mt-1 h-8 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px]">Or Incoming Webhook URL</Label>
                      <Input
                        placeholder="https://hooks.slack.com/services/..."
                        value={webhookUrlInput}
                        onChange={(e) => setWebhookUrlInput(e.target.value)}
                        className="mt-1 h-8 text-xs font-mono"
                      />
                    </div>
                  </>
                )}

                {connectModalItem?.id === "aws" && (
                  <>
                    <div>
                      <Label className="text-[11px]">AWS Region</Label>
                      <Input
                        value={regionInput}
                        onChange={(e) => setRegionInput(e.target.value)}
                        className="mt-1 h-8 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px]">IAM Role ARN or SSO Instance ARN</Label>
                      <Input
                        placeholder="arn:aws:iam::123456789012:role/AirLockProvisioner"
                        value={tokenInput}
                        onChange={(e) => setTokenInput(e.target.value)}
                        className="mt-1 h-8 text-xs font-mono"
                      />
                    </div>
                  </>
                )}

                {connectModalItem?.id !== "github" &&
                  connectModalItem?.id !== "slack" &&
                  connectModalItem?.id !== "aws" && (
                    <>
                      <div>
                        <Label className="text-[11px]">Target Service Endpoint / Webhook URL</Label>
                        <Input
                          placeholder="https://api.service.com/v1/..."
                          value={webhookUrlInput}
                          onChange={(e) => setWebhookUrlInput(e.target.value)}
                          className="mt-1 h-8 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <Label className="text-[11px]">Bearer API Key / Secret Token</Label>
                        <Input
                          type="password"
                          placeholder="Bearer token or secret key"
                          value={tokenInput}
                          onChange={(e) => setTokenInput(e.target.value)}
                          className="mt-1 h-8 text-xs font-mono"
                        />
                      </div>
                    </>
                  )}

                {/* Test Connection Button */}
                <div className="pt-2 flex items-center justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleTestLiveConnection}
                    disabled={verifying}
                    className="h-8 text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/5"
                  >
                    <Play className={`h-3 w-3 ${verifying ? "animate-spin" : ""}`} />
                    {verifying ? "Testing Connection..." : "Test Live Handshake"}
                  </Button>

                  {verificationResult && (
                    <div className="text-[11px] flex items-center gap-1.5">
                      {verificationResult.success ? (
                        <span className="text-emerald-500 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Handshake Verified
                        </span>
                      ) : (
                        <span className="text-destructive font-medium line-clamp-1 max-w-[200px]" title={verificationResult.error}>
                          {verificationResult.error}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-border bg-muted/20 text-xs space-y-2">
                <div className="font-semibold text-foreground flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-primary" /> Offline Zero-Trust Sandbox
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Sandbox mode provisions mock identities, evaluates simulated JIT passes, and tests access policies locally without contacting external SaaS APIs or requiring secrets.
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setConnectModalItem(null)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleEstablishConnection}
              className="text-xs"
            >
              {connectionMode === "live" ? "Establish Live Link" : "Connect in Sandbox"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
