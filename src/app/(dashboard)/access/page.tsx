"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import {
  Plus,
  Shield,
  Clock,
  Users,
  Unlock,
  Trash2,
  Settings,
  AlertTriangle,
  Play,
  CheckCircle2,
  XCircle,
  Sparkles,
  Lock,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useAirlockStore, MemberRole, AccessPolicy } from "@/lib/airlock-store";

export default function AccessPage() {
  const { store, addPolicy, createJitGrant, revokeJitGrant, simulateAccess } = useAirlockStore();

  const [activeTab, setActiveTab] = useState("simulator");

  // Policy Creation Dialog
  const [newPolicyOpen, setNewPolicyOpen] = useState(false);
  const [policyName, setPolicyName] = useState("");
  const [policyDesc, setPolicyDesc] = useState("");
  const [policyRole, setPolicyRole] = useState<MemberRole>("Developer");
  const [policyTools, setPolicyTools] = useState<string[]>(["GitHub", "Slack"]);
  const [policyMfa, setPolicyMfa] = useState(true);

  // JIT Grant Dialog
  const [jitOpen, setJitOpen] = useState(false);
  const [jitMemberId, setJitMemberId] = useState(store.members[0]?.id || "");
  const [jitIntegration, setJitIntegration] = useState("AWS");
  const [jitScope, setJitScope] = useState("Production Database Schema Replay");
  const [jitReason, setJitReason] = useState("Resolving incident INC-8493 latency spike");
  const [jitHours, setJitHours] = useState(4);

  // Simulator State
  const [simMemberId, setSimMemberId] = useState(store.members[0]?.id || "");
  const [simIntegration, setSimIntegration] = useState("AWS");
  const [simAction, setSimAction] = useState("aws:execute-production-migration");
  const [simResult, setSimResult] = useState<{
    allowed: boolean;
    reason: string;
    steps?: { check: string; passed: boolean; note: string }[];
  } | null>(null);

  function handleRunSimulation() {
    const res = simulateAccess(simMemberId, simIntegration, simAction);
    setSimResult(res);
  }

  function handleCreatePolicySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!policyName) return;
    addPolicy({
      name: policyName,
      description: policyDesc || "Custom security access policy",
      role: policyRole,
      allowedIntegrations: policyTools,
      permissions: [`${policyRole.toLowerCase()}:standard`],
      isDefault: false,
      mfaRequired: policyMfa,
      ipRestriction: false,
    });
    setNewPolicyOpen(false);
    setPolicyName("");
    setPolicyDesc("");
  }

  function handleCreateJitSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!jitMemberId || !jitScope) return;
    createJitGrant(jitMemberId, jitIntegration, jitScope, jitHours, jitReason);
    setJitOpen(false);
    setActiveTab("jit");
  }

  const activeGrants = store.jitGrants.filter(
    (g) => g.status === "active" && new Date(g.expiresAt).getTime() > Date.now()
  );

  return (
    <>
      <DashboardHeader
        title="Access Control & Policy Engine"
        description="Enforce Role-Based Access (RBAC), issue ephemeral Just-In-Time (JIT) grants, and simulate policy decisions"
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setJitOpen(true)}
              className="gap-1.5 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/5"
            >
              <Clock className="h-3.5 w-3.5" />
              Issue JIT Grant
            </Button>
            <Button size="sm" onClick={() => setNewPolicyOpen(true)} className="gap-1.5 shadow-sm">
              <Plus className="h-3.5 w-3.5" />
              New Policy
            </Button>
          </div>
        }
      />

      <div className="flex-1 p-6 space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="h-10">
            <TabsTrigger value="simulator" className="gap-2 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              IAM Policy Simulator
            </TabsTrigger>
            <TabsTrigger value="policies" className="gap-2 text-xs">
              <Shield className="h-3.5 w-3.5" />
              Role Policies ({store.policies.length})
            </TabsTrigger>
            <TabsTrigger value="jit" className="gap-2 text-xs">
              <Clock className="h-3.5 w-3.5" />
              Just-In-Time Grants ({activeGrants.length} Active)
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: IAM Policy Simulator */}
          <TabsContent value="simulator" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Simulator Input Panel */}
              <Card className="lg:col-span-1">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Simulate Permission Request
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Test how AirLock evaluates access against active RBAC rules, JIT session tokens, and MFA policies.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Select Team Member</Label>
                    <Select value={simMemberId} onValueChange={setSimMemberId}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Choose a member" />
                      </SelectTrigger>
                      <SelectContent>
                        {store.members.map((m) => (
                          <SelectItem key={m.id} value={m.id} className="text-xs">
                            {m.name} ({m.role} · {m.status})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Target Tool / Resource</Label>
                    <Select value={simIntegration} onValueChange={setSimIntegration}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Choose tool" />
                      </SelectTrigger>
                      <SelectContent>
                        {store.integrations.map((tool) => (
                          <SelectItem key={tool.id} value={tool.name} className="text-xs">
                            {tool.icon} {tool.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Requested Privilege / Action</Label>
                    <Input
                      value={simAction}
                      onChange={(e) => setSimAction(e.target.value)}
                      placeholder="e.g. aws:deploy-production"
                      className="h-9 text-xs font-mono"
                    />
                  </div>

                  <Button onClick={handleRunSimulation} className="w-full gap-2 shadow-sm mt-2">
                    <Play className="h-3.5 w-3.5 fill-current" />
                    Evaluate Policy Engine
                  </Button>
                </CardContent>
              </Card>

              {/* Simulator Decision Report */}
              <Card className="lg:col-span-2">
                <CardHeader className="pb-4 border-b border-border">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>Evaluation Decision Output</span>
                    {simResult && (
                      <Badge
                        className={`text-xs px-3 py-1 font-bold ${
                          simResult.allowed
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                            : "bg-destructive/15 text-destructive border-destructive/30"
                        }`}
                      >
                        {simResult.allowed ? "ACCESS ALLOWED" : "ACCESS BLOCKED"}
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Real-time execution trace across zero-trust policy assertions
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {!simResult ? (
                    <div className="py-16 text-center space-y-3">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Shield className="h-6 w-6" />
                      </div>
                      <div className="text-sm font-semibold text-foreground">Ready to simulate</div>
                      <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                        Pick an identity and target resource on the left, then run the simulation to view the complete zero-trust evaluation trace.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div
                        className={`rounded-xl p-4 border flex items-start gap-3 ${
                          simResult.allowed
                            ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-800 dark:text-emerald-300"
                            : "bg-destructive/5 border-destructive/20 text-destructive"
                        }`}
                      >
                        {simResult.allowed ? (
                          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                        ) : (
                          <XCircle className="h-5 w-5 shrink-0 text-destructive mt-0.5" />
                        )}
                        <div>
                          <div className="font-bold text-sm mb-0.5">
                            Decision: {simResult.allowed ? "Granted" : "Denied"}
                          </div>
                          <p className="text-xs leading-relaxed">{simResult.reason}</p>
                        </div>
                      </div>

                      {/* Decision Trace Steps */}
                      <div className="space-y-2.5">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Zero-Trust Verification Stages
                        </span>
                        <div className="space-y-2">
                          {simResult.steps?.map((step, idx) => (
                            <div
                              key={idx}
                              className="rounded-lg border border-border p-3 flex items-start justify-between text-xs bg-muted/20"
                            >
                              <div className="flex items-start gap-2.5">
                                {step.passed ? (
                                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                                )}
                                <div>
                                  <span className="font-semibold text-foreground">{step.check}</span>
                                  <p className="text-[11px] text-muted-foreground mt-0.5">{step.note}</p>
                                </div>
                              </div>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                  step.passed
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                    : "bg-destructive/10 text-destructive"
                                }`}
                              >
                                {step.passed ? "PASSED" : "DENIED"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab 2: Role Policies */}
          <TabsContent value="policies" className="space-y-4">
            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead>POLICY NAME</TableHead>
                    <TableHead>ASSIGNED ROLE</TableHead>
                    <TableHead>PERMITTED TOOLS</TableHead>
                    <TableHead>MFA MANDATORY</TableHead>
                    <TableHead className="text-right">TYPE</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {store.policies.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="font-semibold text-xs text-foreground">{p.name}</div>
                        <div className="text-[11px] text-muted-foreground max-w-sm truncate">{p.description}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs font-medium">
                          {p.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {p.allowedIntegrations.map((tool) => (
                            <span
                              key={tool}
                              className="text-[10px] bg-muted px-1.5 py-0.5 rounded border border-border text-muted-foreground"
                            >
                              {tool}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {p.mfaRequired ? (
                          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px]">
                            Enforced
                          </Badge>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">Optional</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {p.isDefault ? (
                          <Badge variant="secondary" className="text-[10px]">Default</Badge>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">Custom</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Tab 3: Just-In-Time Grants */}
          <TabsContent value="jit" className="space-y-4">
            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead>BENEFICIARY</TableHead>
                    <TableHead>TOOL & SCOPE</TableHead>
                    <TableHead>BUSINESS JUSTIFICATION</TableHead>
                    <TableHead>EXPIRATION</TableHead>
                    <TableHead>STATUS</TableHead>
                    <TableHead className="text-right">ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {store.jitGrants.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-28 text-center text-xs text-muted-foreground">
                        No JIT grants active or recorded.
                      </TableCell>
                    </TableRow>
                  ) : (
                    store.jitGrants.map((grant) => {
                      const isExpired =
                        grant.status === "expired" ||
                        new Date(grant.expiresAt).getTime() < Date.now();

                      return (
                        <TableRow key={grant.id}>
                          <TableCell>
                            <div className="font-semibold text-xs text-foreground">{grant.memberName}</div>
                            <div className="text-[11px] text-muted-foreground">{grant.memberEmail}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <Badge variant="outline" className="text-xs font-bold text-primary">
                                {grant.integration}
                              </Badge>
                            </div>
                            <div className="text-[11px] text-foreground font-mono mt-0.5">{grant.scope}</div>
                          </TableCell>
                          <TableCell>
                            <p className="text-xs text-muted-foreground max-w-xs truncate" title={grant.reason}>
                              {grant.reason}
                            </p>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs font-mono">{new Date(grant.expiresAt).toLocaleTimeString()}</div>
                            <div className="text-[10px] text-muted-foreground">
                              {new Date(grant.expiresAt).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            {isExpired ? (
                              <Badge variant="outline" className="text-[10px] text-muted-foreground">
                                Expired
                              </Badge>
                            ) : grant.status === "revoked" ? (
                              <Badge variant="outline" className="text-[10px] text-destructive border-destructive/30">
                                Revoked
                              </Badge>
                            ) : (
                              <Badge className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                Active JIT
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {grant.status === "active" && !isExpired && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => revokeJitGrant(grant.id)}
                              >
                                Revoke Now
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* New Policy Dialog */}
      <Dialog open={newPolicyOpen} onOpenChange={setNewPolicyOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Create Access Policy</DialogTitle>
            <DialogDescription>
              Define zero-trust RBAC permissions governing tool provisioning.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreatePolicySubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Policy Name</Label>
              <Input
                required
                placeholder="e.g. SRE Lead Infrastructure Policy"
                value={policyName}
                onChange={(e) => setPolicyName(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Description</Label>
              <Textarea
                rows={2}
                placeholder="Details of permitted access and scope..."
                value={policyDesc}
                onChange={(e) => setPolicyDesc(e.target.value)}
                className="text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Applicable Role</Label>
              <Select value={policyRole} onValueChange={(val) => setPolicyRole(val as MemberRole)}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Admin", "Developer", "SecOps", "DevOps", "Designer", "Product", "Finance", "HR"].map(
                    (role) => (
                      <SelectItem key={role} value={role} className="text-xs">
                        {role}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <Label className="text-xs">Mandatory Hardware / TOTP MFA</Label>
              <Switch checked={policyMfa} onCheckedChange={setPolicyMfa} />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setNewPolicyOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Save Policy
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Issue JIT Grant Dialog */}
      <Dialog open={jitOpen} onOpenChange={setJitOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              Issue Just-In-Time (JIT) Elevated Grant
            </DialogTitle>
            <DialogDescription>
              Grant temporary, time-bound elevated access with automatic expiration.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateJitSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Target Beneficiary</Label>
              <Select value={jitMemberId} onValueChange={setJitMemberId}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Choose a member" />
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

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Tool</Label>
                <Select value={jitIntegration} onValueChange={setJitIntegration}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {store.integrations.map((tool) => (
                      <SelectItem key={tool.id} value={tool.name} className="text-xs">
                        {tool.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Duration (Hours)</Label>
                <Select value={jitHours.toString()} onValueChange={(v) => setJitHours(Number(v))}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1" className="text-xs">1 Hour</SelectItem>
                    <SelectItem value="4" className="text-xs">4 Hours</SelectItem>
                    <SelectItem value="8" className="text-xs">8 Hours</SelectItem>
                    <SelectItem value="24" className="text-xs">24 Hours</SelectItem>
                    <SelectItem value="168" className="text-xs">7 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Privileged Scope</Label>
              <Input
                required
                placeholder="e.g. AWS Production Cluster Write (us-east-1)"
                value={jitScope}
                onChange={(e) => setJitScope(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Business Reason / Incident Ticket</Label>
              <Input
                required
                placeholder="e.g. Hotfix deployment for incident INC-8492"
                value={jitReason}
                onChange={(e) => setJitReason(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setJitOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="gap-1.5 shadow-sm">
                <Lock className="h-3.5 w-3.5" />
                Issue Grant
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
