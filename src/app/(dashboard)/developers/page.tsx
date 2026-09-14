"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import {
  KeyRound,
  Terminal,
  Copy,
  Check,
  Plus,
  Trash2,
  Play,
  Webhook,
  Code2,
  FileCode,
  Sparkles,
  ShieldCheck,
  Clock,
  Layers,
  Send,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useAirlockStore, MemberRole } from "@/lib/airlock-store";
import { toast } from "sonner";

const AVAILABLE_SCOPES = [
  { id: "iam:read", label: "iam:read", desc: "Query members directory and policies" },
  { id: "iam:write", label: "iam:write", desc: "Provision, update, or suspend team members" },
  { id: "access:evaluate", label: "access:evaluate", desc: "Simulate RBAC/ABAC authorization checks" },
  { id: "jit:create", label: "jit:create", desc: "Issue ephemeral break-glass JIT access tokens" },
  { id: "audit:export", label: "audit:export", desc: "Stream immutable security audit logs to SIEM" },
];

export default function DevelopersPage() {
  const { store, createApiKey, revokeApiKey, simulateAccess } = useAirlockStore();

  // Create Key State
  const [newKeyOpen, setNewKeyOpen] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [keyRole, setKeyRole] = useState<MemberRole>("DevOps");
  const [selectedScopes, setSelectedScopes] = useState<string[]>(["iam:read", "access:evaluate"]);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // API Sandbox State
  const [activeEndpoint, setActiveEndpoint] = useState<"evaluate" | "jit" | "members" | "audit">("evaluate");
  const [codeLang, setCodeLang] = useState<"curl" | "typescript" | "python" | "go">("curl");
  const [sandboxMemberId, setSandboxMemberId] = useState(store.members[0]?.id || "");
  const [sandboxIntegration, setSandboxIntegration] = useState("AWS");
  const [sandboxAction, setSandboxAction] = useState("aws:execute-production-migration");

  const [simulatedResponse, setSimulatedResponse] = useState<string | null>(null);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseLatency, setResponseLatency] = useState<number | null>(null);
  const [loadingReq, setLoadingReq] = useState(false);

  // Webhook Simulator State
  const [webhookEvent, setWebhookEvent] = useState<string>("jit.granted");
  const [webhookUrl, setWebhookUrl] = useState<string>("https://api.acme.corp/webhooks/airlock");
  const [webhookSending, setWebhookSending] = useState(false);
  const [webhookSuccess, setWebhookSuccess] = useState<boolean | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    toast.success("API Key copied to clipboard!");
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleCreateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName) return;
    const newKey = createApiKey({
      name: keyName,
      scopes: selectedScopes,
      role: keyRole,
    });
    setNewKeyOpen(false);
    setKeyName("");
    toast.success(`Created API Key: ${newKey.name}`);
  };

  const handleRevokeKey = (id: string, name: string) => {
    revokeApiKey(id);
    toast.error(`Revoked API Key: ${name}`);
  };

  const handleRunRequest = async () => {
    setLoadingReq(true);
    setSimulatedResponse(null);
    setResponseStatus(null);
    setResponseLatency(null);

    const startTime = performance.now();
    const activeKey = "ak_live_airlock_master_admin_key_2026";

    try {
      let endpoint = "/api/v1/access/evaluate";
      let method = "POST";
      let payload: any = null;

      if (activeEndpoint === "evaluate") {
        endpoint = "/api/v1/access/evaluate";
        method = "POST";
        const targetMember = store.members.find((m) => m.id === sandboxMemberId);
        payload = {
          memberId: sandboxMemberId,
          memberRole: targetMember?.role || "Developer",
          integration: sandboxIntegration,
          action: sandboxAction,
          mfaEnrolled: targetMember?.mfaEnabled ?? true,
        };
      } else if (activeEndpoint === "jit") {
        endpoint = "/api/v1/jit/grant";
        method = "POST";
        payload = {
          memberId: sandboxMemberId,
          integration: sandboxIntegration,
          scope: "Temporary Break-Glass Production Access",
          durationHours: 4,
          reason: "Emergency hotfix investigation",
        };
      } else if (activeEndpoint === "members") {
        endpoint = "/api/v1/members";
        method = "GET";
      } else {
        endpoint = "/api/v1/audit/logs";
        method = "GET";
      }

      const res = await fetch(endpoint, {
        method,
        headers: {
          Authorization: `Bearer ${activeKey}`,
          "Content-Type": "application/json",
        },
        body: payload ? JSON.stringify(payload) : undefined,
      });

      const latency = Math.round(performance.now() - startTime);
      setResponseLatency(latency);
      setResponseStatus(res.status);

      const json = await res.json();
      setSimulatedResponse(JSON.stringify(json, null, 2));

      if (res.ok) {
        toast.success(`Server returned HTTP ${res.status} OK in ${latency}ms!`);
      } else {
        toast.error(`HTTP ${res.status}: ${json.message || "Request failed"}`);
      }
    } catch (err: any) {
      setSimulatedResponse(JSON.stringify({ error: err.message }, null, 2));
      toast.error(`Fetch error: ${err.message}`);
    } finally {
      setLoadingReq(false);
    }
  };

  const handleDispatchWebhook = () => {
    setWebhookSending(true);
    setWebhookSuccess(null);
    setTimeout(() => {
      setWebhookSending(false);
      setWebhookSuccess(true);
      toast.success(`Webhook delivered to ${webhookUrl} (HTTP 200 OK)`);
    }, 600);
  };

  // Dynamic code snippets
  const getCodeSnippet = () => {
    if (codeLang === "curl") {
      if (activeEndpoint === "evaluate") {
        return `curl -X POST https://api.airlock.io/v1/access/evaluate \\
  -H "Authorization: Bearer ak_live_airlock_master_admin_key_2026" \\
  -H "Content-Type: application/json" \\
  -d '{
    "memberId": "${sandboxMemberId}",
    "integration": "${sandboxIntegration}",
    "action": "${sandboxAction}"
  }'`;
      } else if (activeEndpoint === "jit") {
        return `curl -X POST https://api.airlock.io/v1/jit/grant \\
  -H "Authorization: Bearer ak_live_airlock_master_admin_key_2026" \\
  -H "Content-Type: application/json" \\
  -d '{
    "memberId": "${sandboxMemberId}",
    "integration": "${sandboxIntegration}",
    "durationHours": 4,
    "reason": "Production hotfix triage INC-901"
  }'`;
      } else if (activeEndpoint === "members") {
        return `curl -X GET https://api.airlock.io/v1/members \\
  -H "Authorization: Bearer ak_live_airlock_master_admin_key_2026"`;
      } else {
        return `curl -X GET https://api.airlock.io/v1/audit/logs?limit=100 \\
  -H "Authorization: Bearer ak_live_airlock_master_admin_key_2026"`;
      }
    }

    if (codeLang === "typescript") {
      return `import { AirlockClient } from "@airlock/sdk";

const airlock = new AirlockClient({
  apiKey: process.env.AIRLOCK_API_KEY!,
});

${
  activeEndpoint === "evaluate"
    ? `const decision = await airlock.access.evaluate({
  memberId: "${sandboxMemberId}",
  integration: "${sandboxIntegration}",
  action: "${sandboxAction}",
});

console.log(decision.allowed ? "ACCESS GRANTED" : "ACCESS BLOCKED", decision.reason);`
    : activeEndpoint === "jit"
    ? `const grant = await airlock.jit.create({
  memberId: "${sandboxMemberId}",
  integration: "${sandboxIntegration}",
  durationHours: 4,
  reason: "Emergency DB Schema Migration",
});`
    : `const members = await airlock.members.list();
console.log(members);`
}`;
    }

    if (codeLang === "python") {
      return `import requests

headers = {
    "Authorization": "Bearer airlock_live_tf_9f83a8...b741",
    "Content-Type": "application/json"
}

${
  activeEndpoint === "evaluate"
    ? `payload = {
    "memberId": "${sandboxMemberId}",
    "integration": "${sandboxIntegration}",
    "action": "${sandboxAction}"
}
response = requests.post("https://api.airlock.io/v1/access/evaluate", json=payload, headers=headers)
print(response.json())`
    : `response = requests.get("https://api.airlock.io/v1/members", headers=headers)
print(response.json())`
}`;
    }

    return `package main

import (
    "bytes"
    "fmt"
    "net/http"
)

func main() {
    client := &http.Client{}
    req, _ := http.NewRequest("POST", "https://api.airlock.io/v1/access/evaluate", bytes.NewBuffer([]byte("{}")))
    req.Header.Set("Authorization", "Bearer airlock_live_tf_9f83a8...b741")
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()
    fmt.Println("Status:", resp.Status)
}`;
  };

  return (
    <>
      <DashboardHeader
        title="Developer API & Webhooks Studio"
        description="Automate IAM provisioning, evaluate zero-trust policies, and issue break-glass tokens programmatically"
        actions={
          <Button
            size="sm"
            onClick={() => setNewKeyOpen(true)}
            className="gap-1.5 text-xs shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            Generate Scoped API Key
          </Button>
        }
      />

      <div className="flex-1 p-6 space-y-6">
        {/* API Keys Table Card */}
        <Card className="border-border shadow-xs">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-primary" />
                  Active API Authentication Keys
                </CardTitle>
                <CardDescription className="text-xs">
                  Bearer tokens used by CI/CD, Terraform providers, and internal microservices
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs">
                {(store.apiKeys || []).filter((k) => k.status === "active").length} Active Keys
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="text-xs font-semibold">Key Identifier</TableHead>
                    <TableHead className="text-xs font-semibold">Token Preview</TableHead>
                    <TableHead className="text-xs font-semibold">Role & Scopes</TableHead>
                    <TableHead className="text-xs font-semibold">Last Used</TableHead>
                    <TableHead className="text-xs font-semibold">Status</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(store.apiKeys || []).map((apiKey) => {
                    const isRevoked = apiKey.status === "revoked";
                    return (
                      <TableRow key={apiKey.id} className={isRevoked ? "opacity-50" : ""}>
                        <TableCell className="text-xs font-semibold">
                          <div>{apiKey.name}</div>
                          <div className="text-[10px] font-mono text-muted-foreground">{apiKey.keyPrefix}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="text-xs font-mono bg-muted/60 px-2 py-0.5 rounded border border-border">
                              {apiKey.maskedKey}
                            </code>
                            {!isRevoked && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleCopy(apiKey.maskedKey, apiKey.id)}
                              >
                                {copiedKeyId === apiKey.id ? (
                                  <Check className="h-3 w-3 text-emerald-500" />
                                ) : (
                                  <Copy className="h-3 w-3 text-muted-foreground" />
                                )}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap items-center gap-1 max-w-xs">
                            <Badge variant="outline" className="text-[10px] py-0 h-4 font-normal">
                              {apiKey.role}
                            </Badge>
                            {apiKey.scopes.map((s) => (
                              <Badge key={s} variant="secondary" className="text-[10px] py-0 h-4 font-mono">
                                {s}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {apiKey.lastUsed}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={isRevoked ? "destructive" : "default"}
                            className="text-[10px] py-0 h-4"
                          >
                            {apiKey.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {!isRevoked && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRevokeKey(apiKey.id, apiKey.name)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10 text-xs h-7 gap-1"
                            >
                              <Trash2 className="h-3 w-3" />
                              Revoke
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Interactive API Sandbox & Code Generator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls & Code Generator */}
          <Card className="lg:col-span-7 border-border shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-primary" />
                    Interactive API Sandbox
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Test live endpoint evaluation and copy production SDK code
                  </CardDescription>
                </div>

                <div className="flex items-center gap-2">
                  <Select
                    value={activeEndpoint}
                    onValueChange={(val) => setActiveEndpoint(val as any)}
                  >
                    <SelectTrigger className="h-8 text-xs w-48 font-mono">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="evaluate">POST /v1/access/evaluate</SelectItem>
                      <SelectItem value="jit">POST /v1/jit/grant</SelectItem>
                      <SelectItem value="members">GET /v1/members</SelectItem>
                      <SelectItem value="audit">GET /v1/audit/logs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Parameter Controls for Evaluate */}
              {activeEndpoint === "evaluate" && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-lg border border-border bg-muted/20 text-xs">
                  <div>
                    <Label className="text-[11px]">Member Subject</Label>
                    <Select value={sandboxMemberId} onValueChange={setSandboxMemberId}>
                      <SelectTrigger className="h-8 text-xs mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {store.members.map((m) => (
                          <SelectItem key={m.id} value={m.id} className="text-xs">
                            {m.name} ({m.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-[11px]">Target Integration</Label>
                    <Select value={sandboxIntegration} onValueChange={setSandboxIntegration}>
                      <SelectTrigger className="h-8 text-xs mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {store.integrations.map((i) => (
                          <SelectItem key={i.id} value={i.name} className="text-xs">
                            {i.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-[11px]">Action Scope</Label>
                    <Input
                      value={sandboxAction}
                      onChange={(e) => setSandboxAction(e.target.value)}
                      className="h-8 text-xs mt-1 font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Code Snippet Tabs */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Client Code Snippet
                  </span>
                  <div className="flex items-center gap-1 bg-muted rounded-md p-0.5">
                    {(["curl", "typescript", "python", "go"] as const).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setCodeLang(lang)}
                        className={`px-2 py-0.5 text-[11px] font-medium rounded transition-colors ${
                          codeLang === lang
                            ? "bg-background text-foreground shadow-xs font-semibold"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {lang === "curl" ? "cURL" : lang === "typescript" ? "TypeScript" : lang === "python" ? "Python" : "Go"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative rounded-lg border border-border bg-card p-3 font-mono text-xs overflow-x-auto text-foreground">
                  <pre className="text-foreground/90 whitespace-pre">{getCodeSnippet()}</pre>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-2 right-2 h-7 w-7"
                    onClick={() => {
                      navigator.clipboard.writeText(getCodeSnippet());
                      toast.success("Code snippet copied!");
                    }}
                  >
                    <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </div>
              </div>

              {/* Send Button */}
              <div className="flex justify-end">
                <Button
                  onClick={handleRunRequest}
                  disabled={loadingReq}
                  className="gap-2 text-xs shadow-xs"
                >
                  <Play className={`h-3.5 w-3.5 ${loadingReq ? "animate-spin" : ""}`} />
                  {loadingReq ? "Executing Request..." : "Run Test Request"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Response Payload Viewer */}
          <Card className="lg:col-span-5 border-border shadow-xs flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-primary" />
                  Live API Response
                </CardTitle>
                {responseStatus && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs font-mono text-emerald-500 border-emerald-500/30">
                      HTTP {responseStatus} OK
                    </Badge>
                    <Badge variant="secondary" className="text-xs font-mono">
                      {responseLatency}ms
                    </Badge>
                  </div>
                )}
              </div>
              <CardDescription className="text-xs">
                Real-time JSON payload received from the policy engine
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {simulatedResponse ? (
                <div className="rounded-lg border border-border bg-muted/40 p-3 font-mono text-xs overflow-y-auto max-h-[360px] flex-1 text-foreground">
                  <pre className="text-emerald-500/90 whitespace-pre-wrap">{simulatedResponse}</pre>
                </div>
              ) : (
                <div className="flex-1 border border-dashed border-border rounded-lg flex flex-col items-center justify-center p-6 text-center text-xs text-muted-foreground min-h-[200px]">
                  <Terminal className="h-8 w-8 text-muted-foreground/50 mb-2" />
                  <span>Click &quot;Run Test Request&quot; to inspect response headers and JSON body</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Webhooks Dispatcher Section */}
        <Card className="border-border shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Webhook className="h-4 w-4 text-primary" />
              Event Webhook Simulator
            </CardTitle>
            <CardDescription className="text-xs">
              Configure downstream HTTP notification callbacks for automated SIEM ingestion or Slack alerts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label className="text-xs">Target Event</Label>
                <Select value={webhookEvent} onValueChange={setWebhookEvent}>
                  <SelectTrigger className="h-9 text-xs mt-1.5 font-mono">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member.provisioned">member.provisioned</SelectItem>
                    <SelectItem value="jit.granted">jit.granted</SelectItem>
                    <SelectItem value="policy.violation">policy.violation</SelectItem>
                    <SelectItem value="mfa.enforced">mfa.enforced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs">Destination Webhook URL</Label>
                <div className="flex items-center gap-2 mt-1.5">
                  <Input
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="h-9 text-xs font-mono"
                    placeholder="https://..."
                  />
                  <Button
                    onClick={handleDispatchWebhook}
                    disabled={webhookSending}
                    className="text-xs h-9 gap-1.5 shrink-0"
                  >
                    <Send className={`h-3.5 w-3.5 ${webhookSending ? "animate-pulse" : ""}`} />
                    {webhookSending ? "Sending..." : "Test Dispatch"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Generate API Key Dialog */}
      <Dialog open={newKeyOpen} onOpenChange={setNewKeyOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <KeyRound className="h-4 w-4 text-primary" />
              Generate Scoped API Key
            </DialogTitle>
            <DialogDescription className="text-xs">
              Create an authentication secret with least privilege permissions
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateKey} className="space-y-4 pt-2">
            <div>
              <Label className="text-xs">Key Name / Description</Label>
              <Input
                placeholder="e.g. GitHub Actions CI Deployer"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                required
                className="mt-1 h-9 text-xs"
              />
            </div>

            <div>
              <Label className="text-xs">Bound Role Policy</Label>
              <Select value={keyRole} onValueChange={(val) => setKeyRole(val as MemberRole)}>
                <SelectTrigger className="mt-1 h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="DevOps">DevOps</SelectItem>
                  <SelectItem value="SecOps">SecOps</SelectItem>
                  <SelectItem value="Developer">Developer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs mb-2 block">Allowed API Scopes</Label>
              <div className="space-y-2 border border-border rounded-lg p-3 bg-muted/20">
                {AVAILABLE_SCOPES.map((scope) => {
                  const checked = selectedScopes.includes(scope.id);
                  return (
                    <div key={scope.id} className="flex items-start gap-2.5">
                      <Checkbox
                        id={scope.id}
                        checked={checked}
                        onCheckedChange={(c) => {
                          if (c) setSelectedScopes([...selectedScopes, scope.id]);
                          else setSelectedScopes(selectedScopes.filter((s) => s !== scope.id));
                        }}
                        className="mt-0.5"
                      />
                      <label htmlFor={scope.id} className="text-xs leading-none cursor-pointer">
                        <span className="font-mono font-semibold text-foreground">{scope.label}</span>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{scope.desc}</p>
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setNewKeyOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" className="text-xs">
                Generate Key
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
