"use client";

import { useEffect, useState } from "react";

export type MemberRole =
  | "Admin"
  | "Developer"
  | "SecOps"
  | "DevOps"
  | "Designer"
  | "Product"
  | "Finance"
  | "HR";

export type MemberStatus = "active" | "invited" | "suspended";

export type Member = {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  status: MemberStatus;
  department: string;
  integrations: string[];
  mfaEnabled: boolean;
  lastActive: string;
  joinedAt: string;
};

export type IntegrationStatus = "connected" | "disconnected" | "syncing" | "error";

export type Integration = {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "Development" | "Collaboration" | "Cloud & Infrastructure" | "Security & Monitoring" | "Productivity";
  status: IntegrationStatus;
  membersCount: number;
  lastSync: string;
  features: string[];
  connectionType?: "live" | "sandbox";
  credentials?: {
    token?: string;
    orgOrTeam?: string;
    webhookUrl?: string;
    region?: string;
    lastVerifiedAt?: string;
  };
  liveData?: {
    remoteOrgName?: string;
    remoteMemberCount?: number;
    authenticatedUser?: string;
  };
  config?: {
    orgOrTeam?: string;
    syncInterval?: string;
    autoProvision?: boolean;
  };
};

export type AccessPolicy = {
  id: string;
  name: string;
  description: string;
  role: MemberRole;
  allowedIntegrations: string[];
  permissions: string[];
  isDefault: boolean;
  mfaRequired: boolean;
  ipRestriction: boolean;
};

export type TimeLimitedGrant = {
  id: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  integration: string;
  scope: string;
  reason: string;
  grantedAt: string;
  expiresAt: string;
  status: "active" | "expired" | "revoked";
  approvedBy: string;
};

export type ActivityType =
  | "member_invited"
  | "member_suspended"
  | "member_removed"
  | "role_changed"
  | "integration_connected"
  | "integration_disconnected"
  | "jit_grant_issued"
  | "jit_grant_revoked"
  | "policy_created"
  | "policy_updated"
  | "policy_simulation"
  | "policy_evaluated"
  | "access_denied"
  | "security_alert"
  | "bulk_import"
  | "audit_export"
  | "api_key_created"
  | "api_key_revoked"
  | "compliance_remediation"
  | "access_certified"
  | "ledger_genesis"
  | "genesis";

export type Activity = {
  id: string;
  type: ActivityType;
  actor: string;
  actorEmail: string;
  target: string;
  description: string;
  timestamp: string;
  integration?: string;
  ipAddress?: string;
  severity: "info" | "warning" | "critical" | "success";
};

export type ApiKey = {
  id: string;
  name: string;
  keyPrefix: string;
  maskedKey: string;
  scopes: string[];
  role: MemberRole;
  createdAt: string;
  lastUsed: string;
  status: "active" | "revoked";
};

export type AirlockStoreData = {
  organization: {
    name: string;
    slug: string;
    plan: string;
    industry: string;
    adminName: string;
    adminEmail: string;
  };
  members: Member[];
  integrations: Integration[];
  policies: AccessPolicy[];
  jitGrants: TimeLimitedGrant[];
  activities: Activity[];
  apiKeys: ApiKey[];
};

const INITIAL_MEMBERS: Member[] = [
  {
    id: "mem-admin",
    name: "Srinivas Jangiti",
    email: "srinivasajan.work@gmail.com",
    role: "Admin",
    status: "active",
    department: "Executive & Core Arch",
    integrations: [],
    mfaEnabled: true,
    lastActive: "Active Now",
    joinedAt: "2026-01-01",
  },
];

const INITIAL_INTEGRATIONS: Integration[] = [
  {
    id: "github",
    name: "GitHub",
    description: "Manage organization teams, repository access, write permissions, and automated offboarding.",
    icon: "🐙",
    category: "Development",
    status: "disconnected",
    membersCount: 0,
    lastSync: "Never",
    features: ["Org membership", "Team management", "Repo push rules", "SSH key provisioning"],
  },
  {
    id: "slack",
    name: "Slack",
    description: "Auto-provision channels, guest passes, enterprise workspaces, and group mentions.",
    icon: "💬",
    category: "Collaboration",
    status: "disconnected",
    membersCount: 0,
    lastSync: "Never",
    features: ["Channel auto-join", "Guest expiration", "Group assignments", "Instant de-auth"],
  },
  {
    id: "aws",
    name: "AWS IAM Identity Center",
    description: "Federated SSO, multi-account privilege provisioning, and ephemeral session policies.",
    icon: "☁️",
    category: "Cloud & Infrastructure",
    status: "disconnected",
    membersCount: 0,
    lastSync: "Never",
    features: ["Permission sets", "Multi-account access", "CLI token rotation", "Break-glass audit"],
  },
  {
    id: "google",
    name: "Google Workspace",
    description: "Provision corporate email addresses, shared drive vaults, and calendar permissions.",
    icon: "🔵",
    category: "Productivity",
    status: "disconnected",
    membersCount: 0,
    lastSync: "Never",
    features: ["Drive permissions", "Google Groups sync", "OU placement", "MFA enforcement"],
  },
  {
    id: "jira",
    name: "Jira Software",
    description: "Role-based project issue tracking, board viewing, and sprint administration.",
    icon: "📋",
    category: "Productivity",
    status: "disconnected",
    membersCount: 0,
    lastSync: "Never",
    features: ["Project access", "Issue workflow roles", "Security schemes", "API integration"],
  },
  {
    id: "datadog",
    name: "Datadog",
    description: "Monitoring dashboards, APM telemetry access, alerting triggers, and log access tiers.",
    icon: "🐶",
    category: "Security & Monitoring",
    status: "disconnected",
    membersCount: 0,
    lastSync: "Never",
    features: ["Dashboard viewer", "Log explorer access", "Incident commander", "Monitor creation"],
  },
  {
    id: "figma",
    name: "Figma",
    description: "Design workspace seat management, file libraries, and client review access.",
    icon: "🎨",
    category: "Collaboration",
    status: "disconnected",
    membersCount: 0,
    lastSync: "Never",
    features: ["Editor licenses", "Team libraries", "View-only seats", "Draft protection"],
  },
  {
    id: "notion",
    name: "Notion",
    description: "Enterprise knowledge base, private engineering docs, and team wikis.",
    icon: "📝",
    category: "Productivity",
    status: "disconnected",
    membersCount: 0,
    lastSync: "Never",
    features: ["Workspace member", "Page permissions", "Guest spaces", "Audit export"],
  },
];

const INITIAL_POLICIES: AccessPolicy[] = [
  {
    id: "pol-admin",
    name: "Full Organization Administrator",
    description: "Unrestricted administrative privileges across all connected corporate SaaS tools and cloud infra.",
    role: "Admin",
    allowedIntegrations: ["GitHub", "Slack", "AWS", "Google Workspace", "Datadog", "Jira", "Figma", "Notion"],
    permissions: ["*:*", "iam:manage", "billing:edit", "audit:export"],
    isDefault: false,
    mfaRequired: true,
    ipRestriction: false,
  },
  {
    id: "pol-devops",
    name: "DevOps & Infrastructure Lead",
    description: "Direct provisioning for cloud clusters, monitoring pipelines, GitHub org repos, and DevOps alerts.",
    role: "DevOps",
    allowedIntegrations: ["GitHub", "AWS", "Datadog", "Slack"],
    permissions: ["aws:operator", "github:repo-admin", "datadog:full", "slack:ops-channels"],
    isDefault: false,
    mfaRequired: true,
    ipRestriction: true,
  },
  {
    id: "pol-developer",
    name: "Standard Core Engineer",
    description: "Day-to-day code push, pull request reviews, project board updates, and team collaboration.",
    role: "Developer",
    allowedIntegrations: ["GitHub", "Slack", "Jira"],
    permissions: ["github:push", "github:pull", "jira:contribute", "slack:standard"],
    isDefault: true,
    mfaRequired: false,
    ipRestriction: false,
  },
  {
    id: "pol-secops",
    name: "Security Operations & Compliance",
    description: "Comprehensive read-only monitoring, audit log exploration, threat detection, and policy inspection.",
    role: "SecOps",
    allowedIntegrations: ["AWS", "GitHub", "Datadog", "Google Workspace", "Slack"],
    permissions: ["audit:view", "security:inspect", "iam:simulate", "logs:query"],
    isDefault: false,
    mfaRequired: true,
    ipRestriction: true,
  },
];

const INITIAL_JIT_GRANTS: TimeLimitedGrant[] = [];

const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: "act-genesis",
    type: "ledger_genesis",
    actor: "System",
    actorEmail: "system@airlock.io",
    target: "Cryptographic Merkle Ledger",
    description: "AirLock cryptographic audit ledger initialized at Genesis block.",
    timestamp: "Genesis",
    integration: "AirLock",
    ipAddress: "127.0.0.1",
    severity: "info",
  },
];

const INITIAL_API_KEYS: ApiKey[] = [
  {
    id: "key-master",
    name: "Default Enterprise Admin Key",
    keyPrefix: "ak_live_airloc",
    maskedKey: "ak_live_airlock_master_admin_key_2026",
    scopes: ["iam:read", "iam:write", "access:evaluate", "jit:create", "audit:export"],
    role: "Admin",
    createdAt: "2026-01-01",
    lastUsed: "Active",
    status: "active",
  },
];

const STORAGE_KEY = "airlock_authentic_store_v2";

export function getInitialStore(): AirlockStoreData {
  return {
    organization: {
      name: "AirLock Technologies",
      slug: "airlock-technologies",
      plan: "Enterprise",
      industry: "Identity & Access Management Governance",
      adminName: "Srinivas Jangiti",
      adminEmail: "srinivasajan.work@gmail.com",
    },
    members: INITIAL_MEMBERS,
    integrations: INITIAL_INTEGRATIONS,
    policies: INITIAL_POLICIES,
    jitGrants: INITIAL_JIT_GRANTS,
    activities: INITIAL_ACTIVITIES,
    apiKeys: INITIAL_API_KEYS,
  };
}

export function loadStore(): AirlockStoreData {
  if (typeof window === "undefined") return getInitialStore();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialStore();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw) as AirlockStoreData;
    if (!parsed.apiKeys || !Array.isArray(parsed.apiKeys) || parsed.apiKeys.length === 0) {
      parsed.apiKeys = INITIAL_API_KEYS;
    }
    return parsed;
  } catch (err) {
    console.error("Failed to parse Airlock store from localStorage:", err);
    return getInitialStore();
  }
}

export function saveStore(data: AirlockStoreData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent("airlock-store-update"));
  } catch (err) {
    console.error("Failed to save Airlock store:", err);
  }
}

export function resetStoreToDemo(): AirlockStoreData {
  const initial = getInitialStore();
  saveStore(initial);
  return initial;
}

export function clearStoreToClean(): AirlockStoreData {
  const clean: AirlockStoreData = {
    organization: {
      name: "New Organization",
      slug: "new-org",
      plan: "Starter",
      industry: "Technology",
      adminName: "Srinivas Jangiti",
      adminEmail: "srinivasajan.work@gmail.com",
    },
    members: [INITIAL_MEMBERS[0]], // preserve Srinivas Jangiti as the primary admin
    integrations: INITIAL_INTEGRATIONS.map((i) => ({ ...i, status: "disconnected", membersCount: 0 })),
    policies: INITIAL_POLICIES,
    jitGrants: [],
    activities: [
      {
        id: "act-clean",
        type: "security_alert",
        actor: "Srinivas Jangiti",
        actorEmail: "srinivasajan.work@gmail.com",
        target: "System",
        description: "Workspace initialized in clean state.",
        timestamp: "Just now",
        severity: "info",
      },
    ],
    apiKeys: [],
  };
  saveStore(clean);
  return clean;
}

// React hook to access and update store reactively across components
export function useAirlockStore() {
  const [store, setStore] = useState<AirlockStoreData>(getInitialStore);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setStore(loadStore());

    const handleUpdate = () => {
      setStore(loadStore());
    };

    window.addEventListener("airlock-store-update", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("airlock-store-update", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  // Helper actions
  const addMember = (newMember: Omit<Member, "id" | "lastActive" | "joinedAt">) => {
    const member: Member = {
      ...newMember,
      id: `mem-${Date.now()}`,
      lastActive: "Invited just now",
      joinedAt: new Date().toISOString().split("T")[0],
    };
    const updatedActivities: Activity = {
      id: `act-${Date.now()}`,
      type: "member_invited",
      actor: store.organization.adminName,
      actorEmail: store.organization.adminEmail,
      target: member.name,
      description: `Invited ${member.name} (${member.email}) with ${member.role} role.`,
      timestamp: "Just now",
      severity: "info",
    };
    const updated = {
      ...store,
      members: [member, ...store.members],
      activities: [updatedActivities, ...store.activities],
    };
    saveStore(updated);
  };

  const removeMember = (id: string) => {
    const target = store.members.find((m) => m.id === id);
    if (!target) return;
    const updatedActivities: Activity = {
      id: `act-${Date.now()}`,
      type: "member_removed",
      actor: store.organization.adminName,
      actorEmail: store.organization.adminEmail,
      target: target.name,
      description: `Offboarded ${target.name} and revoked all access keys.`,
      timestamp: "Just now",
      severity: "critical",
    };
    const updated = {
      ...store,
      members: store.members.filter((m) => m.id !== id),
      activities: [updatedActivities, ...store.activities],
    };
    saveStore(updated);
  };

  const toggleMemberStatus = (id: string, newStatus: MemberStatus) => {
    const target = store.members.find((m) => m.id === id);
    if (!target) return;
    const updatedActivities: Activity = {
      id: `act-${Date.now()}`,
      type: newStatus === "suspended" ? "member_suspended" : "role_changed",
      actor: store.organization.adminName,
      actorEmail: store.organization.adminEmail,
      target: target.name,
      description: `Updated status for ${target.name} to '${newStatus}'.`,
      timestamp: "Just now",
      severity: newStatus === "suspended" ? "warning" : "info",
    };
    const updated = {
      ...store,
      members: store.members.map((m) => (m.id === id ? { ...m, status: newStatus } : m)),
      activities: [updatedActivities, ...store.activities],
    };
    saveStore(updated);
  };

  const toggleIntegration = (integrationId: string) => {
    const item = store.integrations.find((i) => i.id === integrationId);
    if (!item) return;
    const nextStatus: IntegrationStatus = item.status === "connected" ? "disconnected" : "connected";
    const nextMembers = nextStatus === "connected" ? Math.max(1, store.members.filter((m) => m.status === "active").length) : 0;

    const activity: Activity = {
      id: `act-${Date.now()}`,
      type: nextStatus === "connected" ? "integration_connected" : "integration_disconnected",
      actor: store.organization.adminName,
      actorEmail: store.organization.adminEmail,
      target: item.name,
      description: nextStatus === "connected" ? `Connected ${item.name} and synced active directory.` : `Disconnected ${item.name} integration.`,
      timestamp: "Just now",
      integration: item.name,
      severity: nextStatus === "connected" ? "success" : "warning",
    };

    const updated = {
      ...store,
      integrations: store.integrations.map((i) =>
        i.id === integrationId
          ? {
              ...i,
              status: nextStatus,
              membersCount: nextMembers,
              lastSync: nextStatus === "connected" ? "Just now" : i.lastSync,
            }
          : i
      ),
      activities: [activity, ...store.activities],
    };
    saveStore(updated);
  };

  const connectIntegrationLive = (
    integrationId: string,
    credentials: { token?: string; orgOrTeam?: string; webhookUrl?: string; region?: string },
    liveData?: { remoteOrgName?: string; remoteMemberCount?: number; authenticatedUser?: string }
  ) => {
    const item = store.integrations.find((i) => i.id === integrationId);
    if (!item) return;

    const activity: Activity = {
      id: `act-${Date.now()}`,
      type: "integration_connected",
      actor: store.organization.adminName,
      actorEmail: store.organization.adminEmail,
      target: item.name,
      description: `Authenticated and linked live production connector for ${item.name} (${liveData?.remoteOrgName || credentials.orgOrTeam || "verified"}).`,
      timestamp: "Just now",
      integration: item.name,
      severity: "success",
    };

    const updated = {
      ...store,
      integrations: store.integrations.map((i) =>
        i.id === integrationId
          ? {
              ...i,
              status: "connected" as const,
              connectionType: "live" as const,
              credentials: {
                ...credentials,
                token: credentials.token ? `${credentials.token.slice(0, 4)}...${credentials.token.slice(-4)}` : undefined,
                lastVerifiedAt: new Date().toISOString(),
              },
              liveData,
              membersCount: liveData?.remoteMemberCount || i.membersCount || 1,
              lastSync: "Just now (Live)",
            }
          : i
      ),
      activities: [activity, ...store.activities],
    };
    saveStore(updated);
  };

  const createJitGrant = (
    memberId: string,
    integration: string,
    scope: string,
    durationHours: number,
    reason: string
  ) => {
    const member = store.members.find((m) => m.id === memberId);
    if (!member) return;

    const now = new Date();
    const expires = new Date(now.getTime() + durationHours * 60 * 60 * 1000);

    const grant: TimeLimitedGrant = {
      id: `jit-${Date.now()}`,
      memberId: member.id,
      memberName: member.name,
      memberEmail: member.email,
      integration,
      scope,
      reason,
      grantedAt: now.toISOString(),
      expiresAt: expires.toISOString(),
      status: "active",
      approvedBy: store.organization.adminName,
    };

    const activity: Activity = {
      id: `act-${Date.now()}`,
      type: "jit_grant_issued",
      actor: store.organization.adminName,
      actorEmail: store.organization.adminEmail,
      target: member.name,
      description: `Issued JIT elevated access for ${integration} (${scope}) for ${durationHours}h.`,
      timestamp: "Just now",
      integration,
      severity: "warning",
    };

    const updated = {
      ...store,
      jitGrants: [grant, ...store.jitGrants],
      activities: [activity, ...store.activities],
    };
    saveStore(updated);
  };

  const revokeJitGrant = (grantId: string) => {
    const grant = store.jitGrants.find((g) => g.id === grantId);
    if (!grant) return;

    const activity: Activity = {
      id: `act-${Date.now()}`,
      type: "jit_grant_revoked",
      actor: store.organization.adminName,
      actorEmail: store.organization.adminEmail,
      target: grant.memberName,
      description: `Revoked JIT access grant for ${grant.integration} (${grant.scope}) ahead of expiry.`,
      timestamp: "Just now",
      integration: grant.integration,
      severity: "info",
    };

    const updated = {
      ...store,
      jitGrants: store.jitGrants.map((g) => (g.id === grantId ? { ...g, status: "revoked" as const } : g)),
      activities: [activity, ...store.activities],
    };
    saveStore(updated);
  };

  const addPolicy = (policy: Omit<AccessPolicy, "id">) => {
    const newPolicy: AccessPolicy = {
      ...policy,
      id: `pol-${Date.now()}`,
    };
    const activity: Activity = {
      id: `act-${Date.now()}`,
      type: "policy_created",
      actor: store.organization.adminName,
      actorEmail: store.organization.adminEmail,
      target: newPolicy.name,
      description: `Created new access policy: "${newPolicy.name}" for role ${newPolicy.role}.`,
      timestamp: "Just now",
      severity: "success",
    };
    const updated = {
      ...store,
      policies: [...store.policies, newPolicy],
      activities: [activity, ...store.activities],
    };
    saveStore(updated);
  };

  const bulkImportMembers = (newMembers: Omit<Member, "id" | "lastActive" | "joinedAt">[]) => {
    const createdMembers: Member[] = newMembers.map((m, idx) => ({
      ...m,
      id: `mem-${Date.now()}-${idx}`,
      lastActive: "Invited just now",
      joinedAt: new Date().toISOString().split("T")[0],
    }));

    const activity: Activity = {
      id: `act-${Date.now()}`,
      type: "bulk_import",
      actor: store.organization.adminName,
      actorEmail: store.organization.adminEmail,
      target: `${createdMembers.length} Members`,
      description: `Bulk imported ${createdMembers.length} members via CSV.`,
      timestamp: "Just now",
      severity: "success",
    };

    const updated = {
      ...store,
      members: [...createdMembers, ...store.members],
      activities: [activity, ...store.activities],
    };
    saveStore(updated);
  };

  // Real-time Policy Evaluation Simulator
  const simulateAccess = (memberId: string, integrationName: string, actionRequired: string) => {
    const member = store.members.find((m) => m.id === memberId);
    if (!member) {
      return {
        allowed: false,
        reason: "Member not found in organization directory.",
        steps: [{ check: "Identity Lookup", passed: false, note: "User does not exist" }],
      };
    }

    const steps: { check: string; passed: boolean; note: string }[] = [];

    // 1. Account Status
    if (member.status !== "active") {
      steps.push({
        check: "Account Status",
        passed: false,
        note: `Account is '${member.status}'. Inactive accounts are denied all access.`,
      });
      return { allowed: false, reason: `Account is ${member.status}.`, steps };
    }
    steps.push({ check: "Account Status", passed: true, note: "Account is active and verified." });

    // 2. JIT Check
    const activeJit = store.jitGrants.find(
      (g) =>
        g.memberId === member.id &&
        g.integration.toLowerCase() === integrationName.toLowerCase() &&
        g.status === "active" &&
        new Date(g.expiresAt).getTime() > Date.now()
    );

    if (activeJit) {
      steps.push({
        check: "Just-In-Time (JIT) Elevated Bypass",
        passed: true,
        note: `Active JIT grant found: "${activeJit.scope}". Expires at ${new Date(activeJit.expiresAt).toLocaleTimeString()}.`,
      });
      return {
        allowed: true,
        reason: `Granted via active Just-In-Time (JIT) ephemeral bypass approved by ${activeJit.approvedBy}.`,
        activeJit,
        steps,
      };
    }
    steps.push({ check: "Just-In-Time (JIT) Evaluation", passed: false, note: "No active JIT grant. Evaluating standard RBAC policies..." });

    // 3. Role Policy Evaluation
    const matchedPolicy = store.policies.find((p) => p.role === member.role);
    if (!matchedPolicy) {
      steps.push({ check: "RBAC Role Policy", passed: false, note: `No active policy defined for role '${member.role}'.` });
      return { allowed: false, reason: `No RBAC policy matches role ${member.role}.`, steps };
    }

    const toolAllowed = matchedPolicy.allowedIntegrations.some(
      (i) => i.toLowerCase() === integrationName.toLowerCase()
    );

    if (!toolAllowed) {
      steps.push({
        check: "Tool Whitelist",
        passed: false,
        note: `Policy "${matchedPolicy.name}" does not permit access to ${integrationName}.`,
      });
      return {
        allowed: false,
        reason: `Integration ${integrationName} is not permitted for role ${member.role}.`,
        matchedPolicy,
        steps,
      };
    }
    steps.push({
      check: "Tool Whitelist",
      passed: true,
      note: `${integrationName} is explicitly whitelisted in policy "${matchedPolicy.name}".`,
    });

    // 4. MFA Policy Check
    if (matchedPolicy.mfaRequired && !member.mfaEnabled) {
      const reason = "Access blocked: MFA is required by security policy but not enrolled by user.";
      steps.push({
        check: "MFA Enforcement",
        passed: false,
        note: `Policy "${matchedPolicy.name}" strictly mandates Multi-Factor Authentication (MFA), but ${member.name} has not enrolled.`,
      });
      const activity: Activity = {
        id: `act-${Date.now()}`,
        type: "access_denied",
        actor: member.name,
        actorEmail: member.email,
        target: integrationName,
        description: `Access DENIED to ${integrationName} for ${member.name} (${member.role}): MFA required but not enrolled.`,
        timestamp: "Just now",
        integration: integrationName,
        severity: "warning",
      };
      saveStore({
        ...store,
        activities: [activity, ...store.activities],
      });
      return {
        allowed: false,
        reason,
        matchedPolicy,
        steps,
      };
    }
    steps.push({
      check: "MFA Enforcement",
      passed: true,
      note: member.mfaEnabled ? "Hardware/TOTP MFA requirement satisfied." : "MFA optional under this policy.",
    });

    const allowedReason = `Access ALLOWED under policy "${matchedPolicy.name}" for role ${member.role}.`;
    const activity: Activity = {
      id: `act-${Date.now()}`,
      type: "policy_evaluated",
      actor: member.name,
      actorEmail: member.email,
      target: integrationName,
      description: `Access GRANTED to ${integrationName} for ${member.name} (${member.role}) under policy "${matchedPolicy.name}".`,
      timestamp: "Just now",
      integration: integrationName,
      severity: "info",
    };
    saveStore({
      ...store,
      activities: [activity, ...store.activities],
    });

    return {
      allowed: true,
      reason: allowedReason,
      matchedPolicy,
      steps,
    };
  };

  const createApiKey = (params: { name: string; scopes: string[]; role: MemberRole }) => {
    const randomHex = Math.random().toString(36).substring(2, 8) + Math.random().toString(36).substring(2, 8);
    const prefix = "airlock_live_" + params.name.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 8);
    const newKey: ApiKey = {
      id: `key-${Date.now()}`,
      name: params.name,
      keyPrefix: prefix,
      maskedKey: `${prefix}_${randomHex.slice(0, 4)}...${randomHex.slice(-4)}`,
      scopes: params.scopes,
      role: params.role,
      createdAt: new Date().toISOString().split("T")[0],
      lastUsed: "Never",
      status: "active",
    };

    const activity: Activity = {
      id: `act-${Date.now()}`,
      type: "api_key_created",
      actor: store.organization.adminName,
      actorEmail: store.organization.adminEmail,
      target: params.name,
      description: `Generated new scoped API key: "${params.name}" (${params.scopes.join(", ")}).`,
      timestamp: "Just now",
      severity: "warning",
    };

    const updated = {
      ...store,
      apiKeys: [newKey, ...(store.apiKeys || [])],
      activities: [activity, ...store.activities],
    };
    saveStore(updated);
    return newKey;
  };

  const revokeApiKey = (keyId: string) => {
    const targetKey = (store.apiKeys || []).find((k) => k.id === keyId);
    if (!targetKey) return;

    const activity: Activity = {
      id: `act-${Date.now()}`,
      type: "api_key_revoked",
      actor: store.organization.adminName,
      actorEmail: store.organization.adminEmail,
      target: targetKey.name,
      description: `Revoked API key: "${targetKey.name}" (${targetKey.keyPrefix}). Key access terminated immediately.`,
      timestamp: "Just now",
      severity: "critical",
    };

    const updated = {
      ...store,
      apiKeys: (store.apiKeys || []).map((k) => (k.id === keyId ? { ...k, status: "revoked" as const } : k)),
      activities: [activity, ...store.activities],
    };
    saveStore(updated);
  };

  const enforceMfaAll = () => {
    const nonMfaMembers = store.members.filter((m) => !m.mfaEnabled);
    if (nonMfaMembers.length === 0) return 0;

    const activity: Activity = {
      id: `act-${Date.now()}`,
      type: "compliance_remediation",
      actor: store.organization.adminName,
      actorEmail: store.organization.adminEmail,
      target: "Organization Directory",
      description: `Enforced mandatory hardware/TOTP MFA on ${nonMfaMembers.length} non-compliant member(s) to meet SOC 2 CC6.6 & ISO 27001 requirements.`,
      timestamp: "Just now",
      severity: "success",
    };

    const updated = {
      ...store,
      members: store.members.map((m) => ({ ...m, mfaEnabled: true })),
      activities: [activity, ...store.activities],
    };
    saveStore(updated);
    return nonMfaMembers.length;
  };

  const revokeExpiredJitGrants = () => {
    const now = Date.now();
    const toRevoke = store.jitGrants.filter(
      (g) => g.status === "active" && new Date(g.expiresAt).getTime() <= now
    );
    if (toRevoke.length === 0) return 0;

    const activity: Activity = {
      id: `act-${Date.now()}`,
      type: "compliance_remediation",
      actor: "Automated Governance Worker",
      actorEmail: "governance@airlock.internal",
      target: `${toRevoke.length} Expired Grants`,
      description: `Automated cleanup: Marked ${toRevoke.length} expired JIT session(s) as revoked per Principle of Least Privilege.`,
      timestamp: "Just now",
      severity: "info",
    };

    const updated = {
      ...store,
      jitGrants: store.jitGrants.map((g) =>
        g.status === "active" && new Date(g.expiresAt).getTime() <= now
          ? { ...g, status: "expired" as const }
          : g
      ),
      activities: [activity, ...store.activities],
    };
    saveStore(updated);
    return toRevoke.length;
  };

  const certifyMemberAccess = (memberId: string) => {
    const member = store.members.find((m) => m.id === memberId);
    if (!member) return;

    const activity: Activity = {
      id: `act-${Date.now()}`,
      type: "access_certified",
      actor: store.organization.adminName,
      actorEmail: store.organization.adminEmail,
      target: member.name,
      description: `Certified quarterly user access review (UAR) for ${member.name} (${member.role}, ${member.department}). Privileges validated.`,
      timestamp: "Just now",
      severity: "success",
    };

    const updated = {
      ...store,
      activities: [activity, ...store.activities],
    };
    saveStore(updated);
  };

  const resetStoreToDemo = () => {
    const initial = getInitialStore();
    saveStore(initial);
  };

  const clearStoreToClean = () => {
    const clean = getInitialStore();
    saveStore(clean);
  };

  return {
    store,
    isMounted,
    addMember,
    removeMember,
    toggleMemberStatus,
    toggleIntegration,
    connectIntegrationLive,
    createJitGrant,
    revokeJitGrant,
    addPolicy,
    bulkImportMembers,
    simulateAccess,
    createApiKey,
    revokeApiKey,
    enforceMfaAll,
    revokeExpiredJitGrants,
    certifyMemberAccess,
    resetToDemo: resetStoreToDemo,
    clearToClean: clearStoreToClean,
  };
}
