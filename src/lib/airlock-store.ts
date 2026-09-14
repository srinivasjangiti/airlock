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
  | "security_alert"
  | "bulk_import"
  | "audit_export"
  | "api_key_created"
  | "api_key_revoked"
  | "compliance_remediation"
  | "access_certified";

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
    id: "mem-1",
    name: "Srinivas Jangiti",
    email: "srinivasajan.work@gmail.com",
    role: "Admin",
    status: "active",
    department: "Executive & Core Arch",
    integrations: ["GitHub", "Slack", "AWS", "Google Workspace", "Datadog", "Jira"],
    mfaEnabled: true,
    lastActive: "Just now",
    joinedAt: "2026-01-10",
  },
  {
    id: "mem-2",
    name: "Aarav Mehta",
    email: "aarav.mehta@acmecorp.internal",
    role: "DevOps",
    status: "active",
    department: "Platform Engineering",
    integrations: ["GitHub", "AWS", "Slack", "Datadog"],
    mfaEnabled: true,
    lastActive: "12m ago",
    joinedAt: "2026-01-15",
  },
  {
    id: "mem-3",
    name: "Elena Rostova",
    email: "elena.r@acmecorp.internal",
    role: "SecOps",
    status: "active",
    department: "Information Security",
    integrations: ["GitHub", "AWS", "Slack", "Google Workspace", "Datadog"],
    mfaEnabled: true,
    lastActive: "25m ago",
    joinedAt: "2026-01-18",
  },
  {
    id: "mem-4",
    name: "Marcus Brody",
    email: "m.brody@acmecorp.internal",
    role: "Developer",
    status: "active",
    department: "Backend Engineering",
    integrations: ["GitHub", "Slack", "Jira"],
    mfaEnabled: true,
    lastActive: "1h ago",
    joinedAt: "2026-01-20",
  },
  {
    id: "mem-5",
    name: "Sofia Chen",
    email: "sofia.chen@acmecorp.internal",
    role: "Designer",
    status: "active",
    department: "Product Design",
    integrations: ["Figma", "Slack", "Notion"],
    mfaEnabled: false,
    lastActive: "3h ago",
    joinedAt: "2026-02-01",
  },
  {
    id: "mem-6",
    name: "Kavita Rao",
    email: "kavita.rao@acmecorp.internal",
    role: "Product",
    status: "active",
    department: "Product Management",
    integrations: ["Jira", "Slack", "Notion", "Google Workspace"],
    mfaEnabled: true,
    lastActive: "5h ago",
    joinedAt: "2026-02-05",
  },
  {
    id: "mem-7",
    name: "Liam O'Connor",
    email: "liam.oc@acmecorp.internal",
    role: "Developer",
    status: "invited",
    department: "Frontend Engineering",
    integrations: ["GitHub", "Slack"],
    mfaEnabled: false,
    lastActive: "Pending Invite",
    joinedAt: "2026-03-01",
  },
  {
    id: "mem-8",
    name: "Chloe Dupont",
    email: "chloe.d@acmecorp.internal",
    role: "Finance",
    status: "active",
    department: "Financial Operations",
    integrations: ["Google Workspace", "Slack"],
    mfaEnabled: true,
    lastActive: "Yesterday",
    joinedAt: "2026-02-14",
  },
  {
    id: "mem-9",
    name: "Devon Vance",
    email: "devon.v@contractors.internal",
    role: "Developer",
    status: "suspended",
    department: "Contract Engineering",
    integrations: ["GitHub"],
    mfaEnabled: false,
    lastActive: "3d ago",
    joinedAt: "2026-01-25",
  },
];

const INITIAL_INTEGRATIONS: Integration[] = [
  {
    id: "github",
    name: "GitHub",
    description: "Manage organization teams, repository access, write permissions, and automated offboarding.",
    icon: "🐙",
    category: "Development",
    status: "connected",
    membersCount: 6,
    lastSync: "2 mins ago",
    features: ["Org membership", "Team management", "Repo push rules", "SSH key provisioning"],
    config: { orgOrTeam: "acme-corp-org", syncInterval: "Every 15 mins", autoProvision: true },
  },
  {
    id: "slack",
    name: "Slack",
    description: "Auto-provision channels, guest passes, enterprise workspaces, and group mentions.",
    icon: "💬",
    category: "Collaboration",
    status: "connected",
    membersCount: 8,
    lastSync: "5 mins ago",
    features: ["Channel auto-join", "Guest expiration", "Group assignments", "Instant de-auth"],
    config: { orgOrTeam: "acmeworkspace.slack.com", syncInterval: "Real-time webhook", autoProvision: true },
  },
  {
    id: "aws",
    name: "AWS IAM Identity Center",
    description: "Federated SSO, multi-account privilege provisioning, and ephemeral session policies.",
    icon: "☁️",
    category: "Cloud & Infrastructure",
    status: "connected",
    membersCount: 3,
    lastSync: "10 mins ago",
    features: ["Permission sets", "Multi-account access", "CLI token rotation", "Break-glass audit"],
    config: { orgOrTeam: "aws-acme-global", syncInterval: "Hourly", autoProvision: false },
  },
  {
    id: "google",
    name: "Google Workspace",
    description: "Provision corporate email addresses, shared drive vaults, and calendar permissions.",
    icon: "🔵",
    category: "Productivity",
    status: "connected",
    membersCount: 5,
    lastSync: "30 mins ago",
    features: ["Drive permissions", "Google Groups sync", "OU placement", "MFA enforcement"],
    config: { orgOrTeam: "acmecorp.internal", syncInterval: "Daily", autoProvision: true },
  },
  {
    id: "jira",
    name: "Jira Software",
    description: "Role-based project issue tracking, board viewing, and sprint administration.",
    icon: "📋",
    category: "Productivity",
    status: "connected",
    membersCount: 4,
    lastSync: "1 hour ago",
    features: ["Project access", "Issue workflow roles", "Security schemes", "API integration"],
  },
  {
    id: "datadog",
    name: "Datadog",
    description: "Monitoring dashboards, APM telemetry access, alerting triggers, and log access tiers.",
    icon: "🐶",
    category: "Security & Monitoring",
    status: "connected",
    membersCount: 3,
    lastSync: "2 hours ago",
    features: ["Dashboard viewer", "Log explorer access", "Incident commander", "Monitor creation"],
  },
  {
    id: "figma",
    name: "Figma",
    description: "Design workspace seat management, file libraries, and client review access.",
    icon: "🎨",
    category: "Collaboration",
    status: "connected",
    membersCount: 2,
    lastSync: "3 hours ago",
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
    mfaRequired: true,
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
  {
    id: "pol-designer",
    name: "Product Design & Creative",
    description: "Design file editing, prototype testing, and design-system updates.",
    role: "Designer",
    allowedIntegrations: ["Figma", "Slack", "Notion"],
    permissions: ["figma:editor", "slack:standard", "notion:collaborator"],
    isDefault: false,
    mfaRequired: false,
    ipRestriction: false,
  },
];

const INITIAL_JIT_GRANTS: TimeLimitedGrant[] = [
  {
    id: "jit-101",
    memberId: "mem-4",
    memberName: "Marcus Brody",
    memberEmail: "m.brody@acmecorp.internal",
    integration: "AWS",
    scope: "Production Read-Only Cluster Logs (us-east-1)",
    reason: "Hotfix root-cause analysis for Checkout Service latency spike (INC-4029)",
    grantedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    status: "active",
    approvedBy: "Srinivas Jangiti",
  },
  {
    id: "jit-102",
    memberId: "mem-2",
    memberName: "Aarav Mehta",
    memberEmail: "aarav.mehta@acmecorp.internal",
    integration: "GitHub",
    scope: "Force-Push Bypass & Branch Unprotect (core-banking-api)",
    reason: "Disaster recovery replay script following upstream provider schema drift",
    grantedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
    status: "active",
    approvedBy: "Srinivas Jangiti",
  },
  {
    id: "jit-103",
    memberId: "mem-5",
    memberName: "Sofia Chen",
    memberEmail: "sofia.chen@acmecorp.internal",
    integration: "Google Workspace",
    scope: "Access to Q3 Brand Strategy Confidential Vault",
    reason: "Final design asset handoff for corporate keynote presentation",
    grantedAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: "expired",
    approvedBy: "Srinivas Jangiti",
  },
];

const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: "act-1",
    type: "jit_grant_issued",
    actor: "Srinivas Jangiti",
    actorEmail: "srinivasajan.work@gmail.com",
    target: "Marcus Brody",
    description: "Approved JIT access grant for AWS (Production Read-Only Logs) with 4-hour expiry.",
    timestamp: "45 mins ago",
    integration: "AWS",
    ipAddress: "157.34.82.11",
    severity: "warning",
  },
  {
    id: "act-2",
    type: "integration_connected",
    actor: "Srinivas Jangiti",
    actorEmail: "srinivasajan.work@gmail.com",
    target: "Datadog APM",
    description: "Successfully configured Datadog telemetry sync and log inspector permissions.",
    timestamp: "2 hours ago",
    integration: "Datadog",
    ipAddress: "157.34.82.11",
    severity: "success",
  },
  {
    id: "act-3",
    type: "member_suspended",
    actor: "Elena Rostova",
    actorEmail: "elena.r@acmecorp.internal",
    target: "Devon Vance",
    description: "Suspended contractor account and automatically revoked all active GitHub repo seats.",
    timestamp: "Yesterday",
    integration: "GitHub",
    ipAddress: "192.0.2.45",
    severity: "critical",
  },
  {
    id: "act-4",
    type: "role_changed",
    actor: "Srinivas Jangiti",
    actorEmail: "srinivasajan.work@gmail.com",
    target: "Aarav Mehta",
    description: "Promoted Aarav Mehta to DevOps Lead policy with AWS identity center privileges.",
    timestamp: "Yesterday",
    integration: "AWS",
    ipAddress: "157.34.82.11",
    severity: "info",
  },
  {
    id: "act-5",
    type: "bulk_import",
    actor: "Srinivas Jangiti",
    actorEmail: "srinivasajan.work@gmail.com",
    target: "4 Team Members",
    description: "Imported engineering batch from CSV template with automated Slack & GitHub invites.",
    timestamp: "3 days ago",
    ipAddress: "157.34.82.11",
    severity: "success",
  },
];

const INITIAL_API_KEYS: ApiKey[] = [
  {
    id: "key-1",
    name: "Production Terraform IAM Provider",
    keyPrefix: "airlock_live_tf",
    maskedKey: "airlock_live_tf_9f83a8...b741",
    scopes: ["iam:read", "iam:write", "access:evaluate"],
    role: "DevOps",
    createdAt: "2026-02-10",
    lastUsed: "5 mins ago",
    status: "active",
  },
  {
    id: "key-2",
    name: "SecOps SIEM Audit Log Shipper (Datadog)",
    keyPrefix: "airlock_live_siem",
    maskedKey: "airlock_live_siem_41c0ea...99e2",
    scopes: ["audit:export", "logs:query"],
    role: "SecOps",
    createdAt: "2026-02-18",
    lastUsed: "Just now",
    status: "active",
  },
  {
    id: "key-3",
    name: "Slack Break-Glass Bot Dispatcher",
    keyPrefix: "airlock_live_bot",
    maskedKey: "airlock_live_bot_73da1f...28f0",
    scopes: ["jit:create", "access:evaluate"],
    role: "Admin",
    createdAt: "2026-03-01",
    lastUsed: "45 mins ago",
    status: "active",
  },
];

const STORAGE_KEY = "airlock_enterprise_store_v1";

export function getInitialStore(): AirlockStoreData {
  return {
    organization: {
      name: "Acme Innovations Ltd.",
      slug: "acme-innovations",
      plan: "Enterprise Scale",
      industry: "Cybersecurity & Cloud Infrastructure",
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
      steps.push({
        check: "MFA Enforcement",
        passed: false,
        note: `Policy "${matchedPolicy.name}" strictly mandates Multi-Factor Authentication (MFA), but ${member.name} has not enrolled.`,
      });
      return {
        allowed: false,
        reason: "Access blocked: MFA is required by security policy but not enrolled by user.",
        matchedPolicy,
        steps,
      };
    }
    steps.push({
      check: "MFA Enforcement",
      passed: true,
      note: member.mfaEnabled ? "Hardware/TOTP MFA requirement satisfied." : "MFA optional under this policy.",
    });

    return {
      allowed: true,
      reason: `Access ALLOWED under policy "${matchedPolicy.name}" for role ${member.role}.`,
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
