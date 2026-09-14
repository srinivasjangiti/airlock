"use client";

import { useState, useRef } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import {
  Search,
  UserPlus,
  Upload,
  MoreHorizontal,
  Shield,
  Trash2,
  Mail,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  FileSpreadsheet,
  AlertTriangle,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAirlockStore, Member, MemberRole, MemberStatus } from "@/lib/airlock-store";

const ALL_ROLES: MemberRole[] = [
  "Admin",
  "Developer",
  "SecOps",
  "DevOps",
  "Designer",
  "Product",
  "Finance",
  "HR",
];

const AVAILABLE_INTEGRATIONS = ["GitHub", "Slack", "AWS", "Google Workspace", "Datadog", "Jira", "Figma", "Notion"];

export default function MembersPage() {
  const { store, addMember, removeMember, toggleMemberStatus, bulkImportMembers } = useAirlockStore();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [csvOpen, setCsvOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);

  // Single invite form state
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<MemberRole>("Developer");
  const [newDept, setNewDept] = useState("Engineering");
  const [newIntegrations, setNewIntegrations] = useState<string[]>(["GitHub", "Slack"]);
  const [newMfa, setNewMfa] = useState(true);

  // CSV bulk import state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [csvText, setCsvText] = useState("");
  const [csvParsed, setCsvParsed] = useState<Omit<Member, "id" | "lastActive" | "joinedAt">[]>([]);
  const [csvError, setCsvError] = useState("");

  const filtered = store.members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.department.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const allSelected = filtered.length > 0 && filtered.every((m) => selected.includes(m.id));

  function toggleAll() {
    if (allSelected) {
      setSelected([]);
    } else {
      setSelected(filtered.map((m) => m.id));
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function handleInviteSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newEmail) return;
    const name = newName.trim() || newEmail.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

    addMember({
      name,
      email: newEmail.trim(),
      role: newRole,
      status: "active",
      department: newDept,
      integrations: newIntegrations,
      mfaEnabled: newMfa,
    });

    setInviteOpen(false);
    setNewName("");
    setNewEmail("");
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvText(content);
      parseCsv(content);
    };
    reader.readAsText(file);
  }

  function parseCsv(raw: string) {
    try {
      setCsvError("");
      const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      if (lines.length === 0) {
        setCsvParsed([]);
        return;
      }

      // Check if header exists
      const startIndex = lines[0].toLowerCase().includes("email") ? 1 : 0;
      const parsed: Omit<Member, "id" | "lastActive" | "joinedAt">[] = [];

      for (let i = startIndex; i < lines.length; i++) {
        const parts = lines[i].split(",").map((p) => p.trim().replace(/^["']|["']$/g, ""));
        if (parts.length >= 2) {
          const name = parts[0] || parts[1].split("@")[0];
          const email = parts[1];
          const role = (ALL_ROLES.includes(parts[2] as MemberRole) ? parts[2] : "Developer") as MemberRole;
          const department = parts[3] || "Engineering";
          const integrations = parts[4] ? parts[4].split(";").map((s) => s.trim()) : ["Slack", "GitHub"];

          parsed.push({
            name,
            email,
            role,
            status: "active",
            department,
            integrations,
            mfaEnabled: true,
          });
        }
      }

      if (parsed.length === 0) {
        setCsvError("No valid rows found in CSV. Format required: Name,Email,Role,Department,Integrations");
      }
      setCsvParsed(parsed);
    } catch {
      setCsvError("Failed to parse CSV file. Please check line formatting.");
    }
  }

  function handleConfirmCsvImport() {
    if (csvParsed.length === 0) return;
    bulkImportMembers(csvParsed);
    setCsvOpen(false);
    setCsvParsed([]);
    setCsvText("");
  }

  function handleBulkRemove() {
    selected.forEach((id) => removeMember(id));
    setSelected([]);
    setRemoveDialogOpen(false);
  }

  return (
    <>
      <DashboardHeader
        title="Members & Identity Directory"
        description="Provision accounts, enforce MFA, manage role delegations, and control tool access"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCsvOpen(true)}
              className="gap-1.5 border-dashed"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              CSV Bulk Import
            </Button>
            <Button size="sm" onClick={() => setInviteOpen(true)} className="gap-1.5 shadow-sm">
              <UserPlus className="h-4 w-4" />
              Invite Member
            </Button>
          </div>
        }
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-2.5 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-80">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, department..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-9 text-xs"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36 h-9 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="invited">Invited</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions if rows are selected */}
          {selected.length > 0 && (
            <div className="flex items-center gap-2 text-xs bg-muted/60 px-3 py-1.5 rounded-lg border border-border">
              <span className="font-semibold text-foreground">{selected.length} selected</span>
              <Button
                variant="destructive"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={() => setRemoveDialogOpen(true)}
              >
                <Trash2 className="h-3 w-3" />
                Offboard Selected
              </Button>
            </div>
          )}
        </div>

        {/* Members Directory Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={toggleAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead>MEMBER</TableHead>
                <TableHead>ROLE & DEPT</TableHead>
                <TableHead>STATUS</TableHead>
                <TableHead>MFA</TableHead>
                <TableHead>PROVISIONED TOOLS</TableHead>
                <TableHead className="text-right">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-xs text-muted-foreground">
                    No members match your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((member) => {
                  const isChecked = selected.includes(member.id);
                  return (
                    <TableRow key={member.id} className={isChecked ? "bg-muted/30" : ""}>
                      <TableCell>
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => toggleOne(member.id)}
                          aria-label={`Select ${member.name}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 ring-1 ring-border">
                            <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                              {member.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-xs text-foreground">{member.name}</div>
                            <div className="text-[11px] text-muted-foreground">{member.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs font-medium text-foreground">{member.role}</div>
                        <div className="text-[11px] text-muted-foreground">{member.department}</div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[10px] capitalize font-medium ${
                            member.status === "active"
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : member.status === "invited"
                              ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                              : "bg-destructive/10 text-destructive border-destructive/20"
                          }`}
                        >
                          {member.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {member.mfaEnabled ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                            <CheckCircle2 className="h-3 w-3" /> Enrolled
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-amber-500 font-medium">
                            <AlertTriangle className="h-3 w-3" /> Missing
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {member.integrations.map((tool) => (
                            <span
                              key={tool}
                              className="text-[10px] bg-muted px-1.5 py-0.5 rounded border border-border text-muted-foreground"
                            >
                              {tool}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 text-xs">
                            <DropdownMenuLabel>Member Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                toggleMemberStatus(
                                  member.id,
                                  member.status === "active" ? "suspended" : "active"
                                )
                              }
                            >
                              {member.status === "active" ? "Suspend Access" : "Reactivate Access"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => {
                                setMemberToRemove(member.id);
                                setRemoveDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                              Offboard & Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Single Member Invite Dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Provision a new enterprise identity and grant tool access based on role policies.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleInviteSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Full Name</Label>
              <Input
                placeholder="e.g. Rachel Adams"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Work Email Address</Label>
              <Input
                type="email"
                required
                placeholder="rachel@acmecorp.internal"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Security Role</Label>
                <Select value={newRole} onValueChange={(val) => setNewRole(val as MemberRole)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_ROLES.map((role) => (
                      <SelectItem key={role} value={role} className="text-xs">
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Department</Label>
                <Input
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  placeholder="e.g. Infrastructure"
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <Label className="text-xs">Auto-Provisioned SaaS Tools</Label>
              <div className="grid grid-cols-2 gap-2 border border-border rounded-lg p-2.5 bg-muted/20">
                {AVAILABLE_INTEGRATIONS.map((tool) => (
                  <label key={tool} className="flex items-center gap-2 text-xs cursor-pointer">
                    <Checkbox
                      checked={newIntegrations.includes(tool)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setNewIntegrations((prev) => [...prev, tool]);
                        } else {
                          setNewIntegrations((prev) => prev.filter((t) => t !== tool));
                        }
                      }}
                    />
                    <span>{tool}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div className="space-y-0.5">
                <Label className="text-xs">Enforce Hardware / TOTP MFA</Label>
                <p className="text-[11px] text-muted-foreground">Mandatory for high-privilege access</p>
              </div>
              <Switch checked={newMfa} onCheckedChange={setNewMfa} />
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" size="sm" onClick={() => setInviteOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="gap-1.5 shadow-sm">
                <UserPlus className="h-3.5 w-3.5" />
                Send Invitation
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* CSV Bulk Import Dialog */}
      <Dialog open={csvOpen} onOpenChange={setCsvOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
              CSV Bulk Member Onboarding
            </DialogTitle>
            <DialogDescription>
              Upload or paste a comma-separated CSV with columns:
              <br />
              <code className="text-xs font-mono bg-muted px-1 py-0.5 rounded text-foreground">
                Name,Email,Role,Department,Integrations
              </code>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="gap-1.5 text-xs"
              >
                <Upload className="h-3.5 w-3.5" />
                Choose CSV File
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={handleFileUpload}
              />
              <span className="text-xs text-muted-foreground">or paste CSV raw text below:</span>
            </div>

            <Textarea
              rows={4}
              placeholder={`Sarah Connor,sarah@acmecorp.internal,SecOps,Security,AWS;Datadog\nKyle Reese,kyle@acmecorp.internal,Developer,Engineering,GitHub;Slack`}
              value={csvText}
              onChange={(e) => {
                setCsvText(e.target.value);
                parseCsv(e.target.value);
              }}
              className="font-mono text-xs"
            />

            {csvError && <p className="text-xs text-destructive font-medium">{csvError}</p>}

            {csvParsed.length > 0 && (
              <div className="border border-border rounded-lg p-3 bg-muted/20 max-h-36 overflow-y-auto space-y-1.5">
                <span className="text-xs font-semibold text-foreground">
                  Ready to import {csvParsed.length} member(s):
                </span>
                {csvParsed.map((p, idx) => (
                  <div key={idx} className="text-[11px] flex justify-between text-muted-foreground">
                    <span className="font-medium text-foreground">{p.name} ({p.email})</span>
                    <span>{p.role} · {p.department}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={() => setCsvOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={csvParsed.length === 0}
              onClick={handleConfirmCsvImport}
              className="gap-1.5 shadow-sm"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Import {csvParsed.length} Members
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Offboard Member Confirmation Alert */}
      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Offboarding & Deprovisioning</AlertDialogTitle>
            <AlertDialogDescription>
              This will revoke all active integration tokens, delete role policies, and terminate access sessions. An immutable record will be appended to the compliance audit log.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setMemberToRemove(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (memberToRemove) {
                  removeMember(memberToRemove);
                  setMemberToRemove(null);
                  setRemoveDialogOpen(false);
                } else if (selected.length > 0) {
                  handleBulkRemove();
                }
              }}
            >
              Confirm Deprovision
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
