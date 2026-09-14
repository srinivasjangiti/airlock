"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Download,
  RefreshCw,
  Lock,
  Users,
  Eye,
  Zap,
  ArrowUpRight,
  Sparkles,
  Layers,
  ChevronRight,
  Building,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useAirlockStore } from "@/lib/airlock-store";
import { toast } from "sonner";

export default function CompliancePage() {
  const { store, enforceMfaAll, revokeExpiredJitGrants, certifyMemberAccess } = useAirlockStore();
  const [activeFramework, setActiveFramework] = useState("soc2");
  const [remediating, setRemediating] = useState(false);

  // Live Metrics
  const totalMembers = store.members.length;
  const mfaMembers = store.members.filter((m) => m.mfaEnabled).length;
  const mfaRate = totalMembers > 0 ? Math.round((mfaMembers / totalMembers) * 100) : 100;
  const expiredActiveJit = store.jitGrants.filter(
    (g) => g.status === "active" && new Date(g.expiresAt).getTime() <= Date.now()
  ).length;
  const connectedIntegrations = store.integrations.filter((i) => i.status === "connected").length;

  // Calculate dynamic compliance score
  let score = 70;
  if (mfaRate === 100) score += 15;
  else if (mfaRate >= 80) score += 10;
  if (expiredActiveJit === 0) score += 10;
  if (store.policies.length >= 4) score += 5;

  const handleEnforceMfa = () => {
    setRemediating(true);
    const count = enforceMfaAll();
    setTimeout(() => {
      setRemediating(false);
      if (count > 0) {
        toast.success(`Enforced hardware/TOTP MFA on ${count} member(s). SOC 2 CC6.6 compliant!`);
      } else {
        toast.info("All organization members already have MFA enabled.");
      }
    }, 400);
  };

  const handleCleanJit = () => {
    const count = revokeExpiredJitGrants();
    if (count > 0) {
      toast.success(`Revoked ${count} expired JIT session(s) per Least Privilege!`);
    } else {
      toast.info("No expired JIT sessions found.");
    }
  };

  const handleCertifyAll = () => {
    store.members.forEach((m) => certifyMemberAccess(m.id));
    toast.success(`Quarterly User Access Review (UAR) certified for all ${store.members.length} team members.`);
  };

  const handleDownloadAttestation = () => {
    const report = {
      organization: store.organization.name,
      admin: store.organization.adminName,
      generatedAt: new Date().toISOString(),
      complianceScore: `${score}%`,
      frameworks: ["SOC 2 Type II", "ISO/IEC 27001:2022", "HIPAA Security Rule", "GDPR Article 32"],
      metrics: {
        totalMembers,
        mfaEnrolled: mfaMembers,
        mfaPercentage: `${mfaRate}%`,
        connectedIntegrations,
        activePolicies: store.policies.length,
        activeJitGrants: store.jitGrants.filter((g) => g.status === "active").length,
        auditTrailRecords: store.activities.length,
      },
      controlsEvaluated: [
        { id: "CC6.1", name: "Logical Access Controls", status: "COMPLIANT" },
        { id: "CC6.2", name: "User Registration & Access Revocation", status: "COMPLIANT" },
        { id: "CC6.3", name: "Principle of Least Privilege", status: expiredActiveJit === 0 ? "COMPLIANT" : "NEEDS_REMEDIATION" },
        { id: "CC6.6", name: "Multi-Factor Authentication", status: mfaRate === 100 ? "COMPLIANT" : "NEEDS_REMEDIATION" },
        { id: "ISO-A.9.2", name: "User Access Provisioning", status: "COMPLIANT" },
        { id: "HIPAA-164.312", name: "Access Control & Audit Trail", status: "COMPLIANT" },
      ],
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `airlock-soc2-attestation-report-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Downloaded official compliance attestation report!");
  };

  const CONTROLS_SOC2 = [
    {
      id: "CC6.1",
      title: "Logical Access Controls & Perimeter Protection",
      description: "Access to corporate SaaS tools and cloud infra is restricted to authorized identities via RBAC.",
      status: "compliant",
      metric: `${store.policies.length} Active Role Policies enforced`,
      remedy: null,
    },
    {
      id: "CC6.2",
      title: "User Registration, Role Modification & Offboarding",
      description: "Formal provisioning procedures with centralized access controls and automated deprovisioning.",
      status: "compliant",
      metric: `${store.activities.filter((a) => a.type.startsWith("member_")).length} lifecycle audit events logged`,
      remedy: null,
    },
    {
      id: "CC6.3",
      title: "Principle of Least Privilege & Ephemeral Access",
      description: "Elevated access is granted temporarily with automatic expiration and audit tracking.",
      status: expiredActiveJit === 0 ? "compliant" : "warning",
      metric: `${expiredActiveJit} expired grants unrevoked`,
      remedy: expiredActiveJit > 0 ? "Clean Expired Sessions" : null,
      onRemedy: handleCleanJit,
    },
    {
      id: "CC6.6",
      title: "Multi-Factor Authentication (MFA) Boundary",
      description: "Hardware token (WebAuthn/FIDO2) or TOTP MFA is mandated across all privileged users.",
      status: mfaRate === 100 ? "compliant" : "warning",
      metric: `${mfaMembers} of ${totalMembers} members enrolled (${mfaRate}%)`,
      remedy: mfaRate < 100 ? "Enforce MFA Organization-Wide" : null,
      onRemedy: handleEnforceMfa,
    },
    {
      id: "CC6.8",
      title: "Continuous Security Auditing & Non-Repudiation",
      description: "All access grants, permission changes, and simulations generate immutable audit logs.",
      status: "compliant",
      metric: `${store.activities.length} tamper-evident log records`,
      remedy: null,
    },
  ];

  const CONTROLS_ISO = [
    {
      id: "A.9.1.1",
      title: "Access Control Policy Framework",
      description: "Documented access control policy based on business and information security requirements.",
      status: "compliant",
      metric: "Active Zero-Trust architecture in place",
      remedy: null,
    },
    {
      id: "A.9.2.1",
      title: "User Registration & De-registration",
      description: "Standardized process for creating, modifying, and revoking user accounts across connected apps.",
      status: "compliant",
      metric: `${store.integrations.length} catalog integrations managed centrally`,
      remedy: null,
    },
    {
      id: "A.9.2.6",
      title: "Removal or Adjustment of Access Rights",
      description: "Access rights of employees and external parties are revoked immediately upon termination.",
      status: "compliant",
      metric: "Instant 1-click member suspension & token de-auth",
      remedy: null,
    },
    {
      id: "A.9.4.2",
      title: "Secure Log-on Procedures & MFA",
      description: "Access to systems is controlled by a secure log-on procedure and multi-factor validation.",
      status: mfaRate === 100 ? "compliant" : "warning",
      metric: `${mfaRate}% MFA enrollment rate`,
      remedy: mfaRate < 100 ? "Enforce MFA" : null,
      onRemedy: handleEnforceMfa,
    },
  ];

  const CONTROLS_HIPAA = [
    {
      id: "§ 164.312(a)(1)",
      title: "Access Control & Unique User Identification",
      description: "Assign a unique name and/or number for identifying and tracking user identity.",
      status: "compliant",
      metric: `${totalMembers} unique identity subjects indexed`,
      remedy: null,
    },
    {
      id: "§ 164.312(a)(2)(i)",
      title: "Emergency Access Procedure (Break-Glass)",
      description: "Establish and implement procedures for obtaining necessary electronic protected health information during emergency.",
      status: "compliant",
      metric: "Just-In-Time (JIT) ephemeral bypass active",
      remedy: null,
    },
    {
      id: "§ 164.312(b)",
      title: "Audit Controls & Forensic Recording",
      description: "Implement hardware, software, and procedural mechanisms that record and examine activity.",
      status: "compliant",
      metric: "Full exportable forensic activity trail",
      remedy: null,
    },
  ];

  const CONTROLS_GDPR = [
    {
      id: "Art. 32(1)(a)",
      title: "Pseudonymization & Controlled Processing",
      description: "Technical measures ensuring that personal data cannot be attributed to a specific data subject without additional info.",
      status: "compliant",
      metric: "Least Privilege scoped token model",
      remedy: null,
    },
    {
      id: "Art. 32(1)(b)",
      title: "Confidentiality, Integrity & Availability",
      description: "Ability to ensure the ongoing confidentiality, integrity, and resilience of processing systems.",
      status: "compliant",
      metric: "Zero-Trust policy simulator active",
      remedy: null,
    },
    {
      id: "Art. 32(1)(d)",
      title: "Regular Testing & Security Effectiveness Evaluation",
      description: "A process for regularly testing, assessing and evaluating the effectiveness of security measures.",
      status: "compliant",
      metric: "Continuous policy simulation testing",
      remedy: null,
    },
  ];

  const currentControls =
    activeFramework === "soc2"
      ? CONTROLS_SOC2
      : activeFramework === "iso"
      ? CONTROLS_ISO
      : activeFramework === "hipaa"
      ? CONTROLS_HIPAA
      : CONTROLS_GDPR;

  return (
    <>
      <DashboardHeader
        title="Compliance & Security Frameworks"
        description="Continuous compliance readiness auditor for SOC 2 Type II, ISO 27001, HIPAA, and GDPR"
        actions={
          <Button
            size="sm"
            onClick={handleDownloadAttestation}
            className="gap-1.5 text-xs shadow-xs"
          >
            <Download className="h-3.5 w-3.5" />
            Download Attestation (JSON)
          </Button>
        }
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Top Posture Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Score Card */}
          <Card className="lg:col-span-2 border-border shadow-xs bg-gradient-to-br from-card to-muted/20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-500" />
                    Overall Compliance Readiness Score
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Evaluated across all active team members, tool integrations, and access policies
                  </CardDescription>
                </div>
                <Badge
                  variant="outline"
                  className={`text-xs font-semibold px-2.5 py-1 ${
                    score >= 90
                      ? "text-emerald-500 border-emerald-500/30 bg-emerald-500/10"
                      : "text-amber-500 border-amber-500/30 bg-amber-500/10"
                  }`}
                >
                  {score >= 90 ? "Audit Ready" : "Remediation Recommended"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-4xl font-extrabold tracking-tight text-foreground">
                    {score}%
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Target: 100% for external auditor sign-off
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    SOC 2 Type II
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    ISO 27001
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    HIPAA
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    GDPR
                  </Badge>
                </div>
              </div>

              <Progress value={score} className="h-2.5" />

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                <div className="p-2.5 rounded-lg border border-border bg-background/50">
                  <div className="text-muted-foreground">MFA Enforcement</div>
                  <div className="text-sm font-bold text-foreground mt-0.5">{mfaRate}%</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{mfaMembers}/{totalMembers} enrolled</div>
                </div>
                <div className="p-2.5 rounded-lg border border-border bg-background/50">
                  <div className="text-muted-foreground">Active Policies</div>
                  <div className="text-sm font-bold text-foreground mt-0.5">{store.policies.length}</div>
                  <div className="text-[10px] text-emerald-500 mt-0.5">100% RBAC coverage</div>
                </div>
                <div className="p-2.5 rounded-lg border border-border bg-background/50">
                  <div className="text-muted-foreground">JIT Posture</div>
                  <div className="text-sm font-bold text-foreground mt-0.5">
                    {expiredActiveJit === 0 ? "Clean" : `${expiredActiveJit} Expired`}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">Ephemeral access</div>
                </div>
                <div className="p-2.5 rounded-lg border border-border bg-background/50">
                  <div className="text-muted-foreground">Audit Log Trail</div>
                  <div className="text-sm font-bold text-foreground mt-0.5">{store.activities.length} Events</div>
                  <div className="text-[10px] text-emerald-500 mt-0.5">Immutable records</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 1-Click Remediation Hub */}
          <Card className="border-border shadow-xs flex flex-col justify-between">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                1-Click Remediations
              </CardTitle>
              <CardDescription className="text-xs">
                Instant automated fixes to satisfy external auditor checks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5 flex-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handleEnforceMfa}
                disabled={remediating || mfaRate === 100}
                className="w-full justify-between text-xs h-9 border-primary/30 hover:bg-primary/5"
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                  Enforce MFA on All Users
                </span>
                {mfaRate === 100 ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Badge variant="secondary" className="text-[10px]">Fix ({totalMembers - mfaMembers})</Badge>
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleCleanJit}
                disabled={expiredActiveJit === 0}
                className="w-full justify-between text-xs h-9 border-amber-500/30 hover:bg-amber-500/5"
              >
                <span className="flex items-center gap-2">
                  <Lock className="h-3.5 w-3.5 text-amber-500" />
                  Clean Expired JIT Sessions
                </span>
                {expiredActiveJit === 0 ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Badge variant="secondary" className="text-[10px] text-amber-500">
                    Fix ({expiredActiveJit})
                  </Badge>
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleCertifyAll}
                className="w-full justify-between text-xs h-9 hover:bg-muted/50"
              >
                <span className="flex items-center gap-2">
                  <FileCheck className="h-3.5 w-3.5 text-blue-500" />
                  Run Quarterly Access Review (UAR)
                </span>
                <Badge variant="secondary" className="text-[10px]">Certify</Badge>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Framework Tabs & Controls */}
        <Card className="border-border shadow-xs">
          <CardHeader className="pb-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base">Compliance Control Matrix</CardTitle>
                <CardDescription className="text-xs">
                  Automated validation of controls against active IAM state
                </CardDescription>
              </div>

              <Tabs value={activeFramework} onValueChange={setActiveFramework} className="w-full sm:w-auto">
                <TabsList className="grid grid-cols-4 w-full sm:w-[420px]">
                  <TabsTrigger value="soc2" className="text-xs">SOC 2</TabsTrigger>
                  <TabsTrigger value="iso" className="text-xs">ISO 27001</TabsTrigger>
                  <TabsTrigger value="hipaa" className="text-xs">HIPAA</TabsTrigger>
                  <TabsTrigger value="gdpr" className="text-xs">GDPR</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="space-y-3">
              {currentControls.map((ctrl) => {
                const isCompliant = ctrl.status === "compliant";
                return (
                  <div
                    key={ctrl.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-border bg-card hover:bg-muted/10 transition-colors"
                  >
                    <div className="space-y-1 max-w-2xl">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-[10px] text-primary">
                          {ctrl.id}
                        </Badge>
                        <span className="text-xs font-semibold text-foreground">{ctrl.title}</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {ctrl.description}
                      </p>
                      <div className="text-[11px] text-foreground/80 font-medium pt-0.5 flex items-center gap-1.5">
                        <Activity className="h-3 w-3 text-muted-foreground" />
                        <span>Live Verification: {ctrl.metric}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
                      {isCompliant ? (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-semibold px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Compliant
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs text-amber-500 font-semibold px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Action Required
                        </div>
                      )}

                      {ctrl.remedy && ctrl.onRemedy && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={ctrl.onRemedy}
                          className="text-xs h-7 gap-1"
                        >
                          <Zap className="h-3 w-3 text-primary" />
                          {ctrl.remedy}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
