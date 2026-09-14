"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import {
  CreditCard,
  Key,
  Save,
  Plus,
  Copy,
  CheckCircle2,
  Trash2,
  RefreshCw,
  Download,
  Github,
  Linkedin,
  Youtube,
  Mail,
  Phone,
  ExternalLink,
  Code2,
  Shield,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAirlockStore } from "@/lib/airlock-store";

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
  const { store, resetToDemo, clearToClean } = useAirlockStore();

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [resetStatus, setResetStatus] = useState<string | null>(null);

  function copyText(field: string, val: string) {
    navigator.clipboard.writeText(val);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }

  function handleReset() {
    resetToDemo();
    setResetStatus("Workspace successfully reset with sample enterprise data!");
    setTimeout(() => setResetStatus(null), 3000);
  }

  function handleClear() {
    clearToClean();
    setResetStatus("Workspace cleared to clean slate.");
    setTimeout(() => setResetStatus(null), 3000);
  }

  function handleExportBackup() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(store, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `airlock-store-backup-${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  return (
    <>
      <DashboardHeader
        title="Settings & Engineering Showcase"
        description="Configure organization profile, system preferences, data sandbox, and creator attribution"
      />

      <div className="flex-1 p-6 space-y-6">
        <Tabs defaultValue="creator" className="space-y-6">
          <TabsList className="h-10">
            <TabsTrigger value="creator" className="gap-2 text-xs font-semibold">
              <Code2 className="h-3.5 w-3.5 text-primary" />
              Creator & Credits
            </TabsTrigger>
            <TabsTrigger value="organization" className="gap-2 text-xs">
              <Building2 className="h-3.5 w-3.5" />
              Organization
            </TabsTrigger>
            <TabsTrigger value="data" className="gap-2 text-xs">
              <RefreshCw className="h-3.5 w-3.5" />
              Sandbox & Data
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Creator & Engineering Credits */}
          <TabsContent value="creator" className="space-y-6">
            <Card className="border-primary/30">
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
                    Open Source • MIT
                  </Badge>
                </div>
                <CardDescription className="text-xs leading-relaxed mt-2">
                  Software Engineer & Systems Architect specializing in Zero-Trust Security, Enterprise Identity Governance (IAM), full-stack platforms, and distributed developer infrastructure.
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
                    Verified Digital Footprint & Profiles
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

          {/* Tab 2: Organization Profile */}
          <TabsContent value="organization" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Organization Profile</CardTitle>
                <CardDescription className="text-xs">
                  Identity tenant details and domain namespace configuration.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Organization Name</Label>
                    <Input defaultValue={store.organization.name} className="h-9 text-xs" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Organization Slug</Label>
                    <div className="flex items-center">
                      <span className="inline-flex items-center px-3 h-9 rounded-l-md border border-r-0 border-input bg-muted text-xs text-muted-foreground">
                        airlock.app/
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
                    <Label className="text-xs">Active Subscription Plan</Label>
                    <Input defaultValue={store.organization.plan} disabled className="h-9 text-xs bg-muted" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Industry Classification</Label>
                    <Input defaultValue={store.organization.industry} className="h-9 text-xs" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Sandbox & Data Controls */}
          <TabsContent value="data" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Sandbox & Store Controls</CardTitle>
                <CardDescription className="text-xs">
                  Manage the client-side reactive store, seed realistic enterprise demo data, or export backups.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {resetStatus && (
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    {resetStatus}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    className="h-auto p-4 flex flex-col items-start gap-1 border-primary/30 hover:bg-primary/5 text-left"
                  >
                    <div className="flex items-center gap-2 font-semibold text-xs text-foreground">
                      <RefreshCw className="h-3.5 w-3.5 text-primary" />
                      Reset Demo Data
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Re-seed with 12+ enterprise members, 8 tools, policies, and JIT sessions.
                    </p>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleExportBackup}
                    className="h-auto p-4 flex flex-col items-start gap-1 text-left"
                  >
                    <div className="flex items-center gap-2 font-semibold text-xs text-foreground">
                      <Download className="h-3.5 w-3.5 text-primary" />
                      Export JSON Backup
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Download full snapshot of members, connectors, and audit events.
                    </p>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleClear}
                    className="h-auto p-4 flex flex-col items-start gap-1 border-destructive/30 hover:bg-destructive/5 text-left"
                  >
                    <div className="flex items-center gap-2 font-semibold text-xs text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                      Clean Slate
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Wipe all simulated data and start with an empty organization.
                    </p>
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
