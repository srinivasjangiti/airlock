"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import {
  Building2,
  Shield,
  Save,
  Copy,
  CheckCircle2,
  Trash2,
  Download,
  Github,
  Linkedin,
  Youtube,
  Mail,
  Phone,
  ExternalLink,
  Code2,
  Lock,
  Clock,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAirlockStore } from "@/lib/airlock-store";
import { toast } from "sonner";

const SOCIAL_LINKS = [
  { name: "GitHub", handle: "@srinivasjangiti", url: "https://github.com/srinivasjangiti", icon: Github },
  { name: "LinkedIn", handle: "in/srinivasajan", url: "https://www.linkedin.com/in/srinivasajan/", icon: Linkedin },
  { name: "X (Twitter)", handle: "@sriwanders", url: "https://x.com/sriwanders", icon: ExternalLink },
  { name: "Substack", handle: "@sriwanders", url: "https://substack.com/@sriwanders", icon: ExternalLink },
  { name: "Medium", handle: "@sriwanders", url: "https://medium.com/@sriwanders", icon: ExternalLink },
  { name: "YouTube", handle: "@srinivasjan", url: "https://www.youtube.com/@srinivasjan", icon: Youtube },
  { name: "LeetCode", handle: "srinivasaj", url: "https://leetcode.com/u/srinivasaj/", icon: Code2 },
];

export default function SettingsPage() {
  const { store, enforceMfaAll, clearToClean } = useAirlockStore();

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [orgName, setOrgName] = useState(store.organization.name);
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [mfaEnforced, setMfaEnforced] = useState(true);
  const [auditRetention, setAuditRetention] = useState("365");

  function copyText(field: string, val: string) {
    navigator.clipboard.writeText(val);
    setCopiedField(field);
    toast.success(`Copied ${field} to clipboard.`);
    setTimeout(() => setCopiedField(null), 2000);
  }

  function handleSaveOrg() {
    toast.success("Organization profile configuration saved successfully.");
  }

  function handleSaveSecurity() {
    if (mfaEnforced) {
      enforceMfaAll();
    }
    toast.success("Enterprise security policies updated and actively enforced.");
  }

  function handleExportBackup() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(store, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `airlock-enterprise-backup-${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success("Exported cryptographic audit ledger & configuration snapshot.");
  }

  function handleResetWorkspace() {
    if (confirm("Are you sure you want to reset workspace cache to baseline clean state? All unsaved in-memory sessions will be purged.")) {
      clearToClean();
      toast.success("Workspace cache reset to authenticated clean baseline.");
    }
  }

  return (
    <>
      <DashboardHeader
        title="Enterprise Security & Organization Settings"
        description="Manage organization identity, zero-trust policies, audit ledger retention, and system maintainer attribution"
      />

      <div className="flex-1 p-6 space-y-6">
        <Tabs defaultValue="organization" className="space-y-6">
          <TabsList className="h-10">
            <TabsTrigger value="organization" className="gap-2 text-xs font-semibold">
              <Building2 className="h-3.5 w-3.5 text-primary" />
              Organization Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2 text-xs font-semibold">
              <Shield className="h-3.5 w-3.5 text-emerald-500" />
              Security & Governance
            </TabsTrigger>
            <TabsTrigger value="creator" className="gap-2 text-xs font-semibold">
              <Code2 className="h-3.5 w-3.5 text-primary" />
              Lead Architect & Credits
            </TabsTrigger>
            <TabsTrigger value="danger" className="gap-2 text-xs font-semibold text-destructive">
              <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
              Danger Zone
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Organization Profile */}
          <TabsContent value="organization" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Organization Profile & Identity Namespace</CardTitle>
                <CardDescription className="text-xs">
                  Zero-trust identity tenant boundaries and corporate domain configuration.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Organization Name</Label>
                    <Input
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Tenant Slug / Domain</Label>
                    <div className="flex items-center">
                      <span className="inline-flex items-center px-3 h-9 rounded-l-md border border-r-0 border-input bg-muted text-xs text-muted-foreground">
                        airlock.io/
                      </span>
                      <Input
                        className="rounded-l-none h-9 text-xs font-mono"
                        defaultValue={store.organization.slug}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Subscription Tier</Label>
                    <Input defaultValue={store.organization.plan} disabled className="h-9 text-xs bg-muted font-medium" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Industry Classification</Label>
                    <Input defaultValue={store.organization.industry} className="h-9 text-xs" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Primary Security Officer (Admin)</Label>
                    <Input defaultValue={store.organization.adminName} disabled className="h-9 text-xs bg-muted" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Administrative Email Address</Label>
                    <Input defaultValue={store.organization.adminEmail} disabled className="h-9 text-xs bg-muted" />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button onClick={handleSaveOrg} size="sm" className="gap-1.5 text-xs">
                    <Save className="h-3.5 w-3.5" /> Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Security & Governance Policies */}
          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Zero-Trust & Compliance Policies</CardTitle>
                <CardDescription className="text-xs">
                  Global enforcement rules applied across all connected SaaS tools and access evaluations.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center justify-between p-3.5 rounded-lg border border-border bg-muted/10">
                  <div className="space-y-0.5 max-w-lg">
                    <div className="text-xs font-semibold text-foreground flex items-center gap-2">
                      <Lock className="h-3.5 w-3.5 text-primary" />
                      Mandatory Multi-Factor Authentication (MFA)
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Require hardware FIDO2 keys or TOTP authenticators for all accounts before granting access to critical infrastructure (AWS, GitHub, Datadog).
                    </p>
                  </div>
                  <Switch checked={mfaEnforced} onCheckedChange={setMfaEnforced} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Session Inactivity Timeout (Minutes)</Label>
                    <Select value={sessionTimeout} onValueChange={setSessionTimeout}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 Minutes (Strict SOC 2)</SelectItem>
                        <SelectItem value="30">30 Minutes (Standard Enterprise)</SelectItem>
                        <SelectItem value="60">60 Minutes (Standard)</SelectItem>
                        <SelectItem value="480">8 Hours (Full Shift)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Cryptographic Audit Ledger Retention</Label>
                    <Select value={auditRetention} onValueChange={setAuditRetention}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="90">90 Days (Minimum)</SelectItem>
                        <SelectItem value="365">1 Year (SOC 2 Type II)</SelectItem>
                        <SelectItem value="1095">3 Years (ISO 27001 / HIPAA)</SelectItem>
                        <SelectItem value="2555">7 Years (Financial Grade)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button onClick={handleSaveSecurity} size="sm" className="gap-1.5 text-xs">
                    <Save className="h-3.5 w-3.5" /> Apply Security Policies
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Creator & Engineering Credits */}
          <TabsContent value="creator" className="space-y-6">
            <Card className="border-primary/30 shadow-xs">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                        Lead Architect & Maintainer
                      </span>
                    </div>
                    <CardTitle className="text-xl font-bold">Srinivas Jangiti</CardTitle>
                  </div>
                  <Badge variant="outline" className="text-xs font-mono border-primary/40 text-primary">
                    Production Architecture
                  </Badge>
                </div>
                <CardDescription className="text-xs leading-relaxed mt-2">
                  Systems Architect & Engineer specializing in Zero-Trust Governance, Distributed Identity Lifecycle (SCIM 2.0 / SAML), Cryptographic Audit Chains, and Enterprise Cloud Infrastructure.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Contact Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
                    <div className="flex items-center gap-2.5">
                      <Mail className="h-4 w-4 text-primary" />
                      <div>
                        <div className="text-[11px] text-muted-foreground">Work Email</div>
                        <div className="text-xs font-semibold text-foreground">srinivasajan.work@gmail.com</div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => copyText("email", "srinivasajan.work@gmail.com")}
                      title="Copy email"
                    >
                      {copiedField === "email" ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
                    <div className="flex items-center gap-2.5">
                      <Phone className="h-4 w-4 text-primary" />
                      <div>
                        <div className="text-[11px] text-muted-foreground">Mobile Contact</div>
                        <div className="text-xs font-semibold text-foreground">+91 8767505121</div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => copyText("phone", "+918767505121")}
                      title="Copy phone"
                    >
                      {copiedField === "phone" ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Social Channels Directory */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    Verified Digital Footprint & Developer Profiles
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {SOCIAL_LINKS.map((item) => {
                      const Icon = item.icon;
                      return (
                        <a
                          key={item.name}
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:border-primary/50 hover:bg-muted/30 transition-all text-xs group"
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className="h-4 w-4 text-primary" />
                            <div>
                              <div className="font-semibold text-foreground">{item.name}</div>
                              <div className="text-[11px] text-muted-foreground">{item.handle}</div>
                            </div>
                          </div>
                          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 4: Danger Zone */}
          <TabsContent value="danger" className="space-y-4">
            <Card className="border-destructive/30">
              <CardHeader>
                <CardTitle className="text-base text-destructive flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" /> Danger Zone & Disaster Recovery
                </CardTitle>
                <CardDescription className="text-xs">
                  Irreversible administrative actions for backup generation and workspace cache purge.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-lg border border-border bg-muted/10">
                  <div>
                    <div className="text-xs font-semibold text-foreground">Download Cryptographic Backup</div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Export full JSON dump of organization directory, policies, and Merkle ledger logs for external compliance archival.
                    </p>
                  </div>
                  <Button onClick={handleExportBackup} variant="outline" size="sm" className="text-xs gap-1.5 shrink-0">
                    <Download className="h-3.5 w-3.5 text-primary" /> Export JSON
                  </Button>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-lg border border-destructive/20 bg-destructive/5">
                  <div>
                    <div className="text-xs font-semibold text-destructive">Reset Workspace Session Cache</div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Purges local ephemeral cache and re-synchronizes with server database baseline.
                    </p>
                  </div>
                  <Button onClick={handleResetWorkspace} variant="destructive" size="sm" className="text-xs gap-1.5 shrink-0">
                    <RotateCcw className="h-3.5 w-3.5" /> Reset Cache
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
