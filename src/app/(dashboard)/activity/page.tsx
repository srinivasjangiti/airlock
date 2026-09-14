"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import {
  Download,
  Search,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  Lock,
  Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useAirlockStore } from "@/lib/airlock-store";
import { toast } from "sonner";

export default function ActivityPage() {
  const { store } = useAirlockStore();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  // Ledger Verification Dialog
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<any>(null);

  const filtered = store.activities.filter((act) => {
    const matchesSearch =
      act.actor.toLowerCase().includes(search.toLowerCase()) ||
      act.target.toLowerCase().includes(search.toLowerCase()) ||
      act.description.toLowerCase().includes(search.toLowerCase());

    const matchesType =
      typeFilter === "all" ||
      (typeFilter === "members" && act.type.startsWith("member_")) ||
      (typeFilter === "integrations" && act.type.startsWith("integration_")) ||
      (typeFilter === "jit" && act.type.startsWith("jit_")) ||
      (typeFilter === "policies" && act.type.startsWith("policy_"));

    return matchesSearch && matchesType;
  });

  async function handleVerifyLedger() {
    setVerifyOpen(true);
    setVerifying(true);
    setVerifyResult(null);

    try {
      const res = await fetch("/api/v1/audit/verify", {
        headers: {
          Authorization: "Bearer ak_live_airlock_master_admin_key_2026",
        },
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setVerifyResult(data.verification);
        toast.success("Cryptographic Merkle ledger verified successfully.");
      } else {
        throw new Error(data.error || "Failed to verify audit ledger.");
      }
    } catch (err: any) {
      toast.error(err.message || "Ledger verification check failed.");
    } finally {
      setVerifying(false);
    }
  }

  function handleExportCsv() {
    const headers = ["ID", "Timestamp", "Type", "Actor", "Actor Email", "Target", "Description", "Integration", "IP Address", "Severity"];
    const rows = store.activities.map((a) => [
      a.id,
      `"${a.timestamp}"`,
      `"${a.type}"`,
      `"${a.actor}"`,
      `"${a.actorEmail}"`,
      `"${a.target}"`,
      `"${a.description.replace(/"/g, '""')}"`,
      `"${a.integration || "N/A"}"`,
      `"${a.ipAddress || "127.0.0.1 (Internal Gateway)"}"`,
      `"${a.severity}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `airlock-compliance-audit-log-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <>
      <DashboardHeader
        title="Immutable Audit Activity Trail"
        description="Forensic log of all identity provisioning, policy changes, and JIT sessions with SHA-256 Merkle chain verification"
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleVerifyLedger}
              className="gap-1.5 text-xs shadow-xs border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              Verify Ledger (SHA-256)
            </Button>
            <Button size="sm" variant="outline" onClick={handleExportCsv} className="gap-1.5 text-xs shadow-xs">
              <Download className="h-3.5 w-3.5 text-primary" />
              Export CSV
            </Button>
          </div>
        }
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search audit trail by actor, target, or event..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 text-xs"
            />
          </div>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-44 h-9 text-xs">
              <SelectValue placeholder="Event Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Event Types</SelectItem>
              <SelectItem value="members">Member Lifecycle</SelectItem>
              <SelectItem value="integrations">Tool Connections</SelectItem>
              <SelectItem value="jit">JIT Grants</SelectItem>
              <SelectItem value="policies">Policy Governance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Audit Trail Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-24">SEVERITY</TableHead>
                <TableHead>TIMESTAMP</TableHead>
                <TableHead>ACTOR</TableHead>
                <TableHead>TARGET IDENTITY / SERVICE</TableHead>
                <TableHead>EVENT DESCRIPTION</TableHead>
                <TableHead>IP ORIGIN</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-xs text-muted-foreground">
                    No activity logs match your filter.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((act) => {
                  return (
                    <TableRow key={act.id} className="text-xs">
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[10px] uppercase font-bold ${
                            act.severity === "critical"
                              ? "bg-destructive/10 text-destructive border-destructive/20"
                              : act.severity === "warning"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                              : act.severity === "success"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                              : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                          }`}
                        >
                          {act.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-muted-foreground whitespace-nowrap">
                        {act.timestamp}
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-foreground">{act.actor}</div>
                        <div className="text-[10px] text-muted-foreground">{act.actorEmail}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-foreground">{act.target}</div>
                        {act.integration && (
                          <span className="text-[10px] text-primary">{act.integration}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <p className="text-muted-foreground max-w-md">{act.description}</p>
                      </TableCell>
                      <TableCell className="font-mono text-muted-foreground text-[11px]">
                        {act.ipAddress || "127.0.0.1 (Local Gateway)"}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Cryptographic Ledger Verification Dialog */}
      <Dialog open={verifyOpen} onOpenChange={setVerifyOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Lock className="h-4 w-4 text-emerald-500" />
              Cryptographic Audit Chain Verification
            </DialogTitle>
            <DialogDescription className="text-xs">
              Continuous mathematical attestation over chronological SHA-256 audit ledger blocks.
            </DialogDescription>
          </DialogHeader>

          {verifying ? (
            <div className="py-8 flex flex-col items-center justify-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span>Verifying block hashes from Genesis...</span>
            </div>
          ) : verifyResult ? (
            <div className="space-y-3.5 py-2 text-xs">
              <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{verifyResult.attestation}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border border-border bg-muted/10 space-y-1">
                  <div className="text-[10px] text-muted-foreground uppercase font-semibold">Total Verified Blocks</div>
                  <div className="text-xl font-bold font-mono text-foreground">{verifyResult.totalBlocksVerified}</div>
                </div>
                <div className="p-3 rounded-lg border border-border bg-muted/10 space-y-1">
                  <div className="text-[10px] text-muted-foreground uppercase font-semibold">Chain Validity</div>
                  <div className="text-xl font-bold text-emerald-500">100% Valid</div>
                </div>
              </div>

              <div className="space-y-2 rounded-lg border border-border p-3 bg-muted/10 font-mono text-[11px]">
                <div className="space-y-0.5">
                  <div className="text-[10px] text-muted-foreground font-sans font-semibold flex items-center gap-1">
                    <Hash className="h-3 w-3" /> Genesis Block Anchor
                  </div>
                  <div className="truncate text-muted-foreground">{verifyResult.genesisHash}</div>
                </div>

                <div className="space-y-0.5 pt-1 border-t border-border">
                  <div className="text-[10px] text-muted-foreground font-sans font-semibold flex items-center gap-1">
                    <Hash className="h-3 w-3" /> Head Block Hash (Seq #{verifyResult.headSequence})
                  </div>
                  <div className="truncate text-foreground font-semibold">{verifyResult.headHash}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-muted-foreground">
              Click verify to inspect audit ledger integrity.
            </div>
          )}

          <DialogFooter>
            <Button size="sm" variant="outline" onClick={() => setVerifyOpen(false)} className="text-xs">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
