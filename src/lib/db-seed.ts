import { db } from "./db";
import { GENESIS_HASH, computeAuditHash, hashApiKey } from "./crypto";

export async function ensureDatabaseSeeded() {
  // 1. Ensure Organization (Atomic upsert by unique domain)
  const org = await db.organization.upsert({
    where: { domain: "airlock.io" },
    update: {},
    create: {
      name: "AirLock Technologies",
      domain: "airlock.io",
      plan: "Enterprise",
    },
  });

  // 2. Ensure Primary Organization Administrator (Zero Mock Users)
  let adminUser = await db.user.findFirst({ where: { orgId: org.id, role: "Admin" } });

  if (!adminUser) {
    adminUser = await db.user.upsert({
      where: { email: "srinivasajan.work@gmail.com" },
      update: { orgId: org.id, role: "Admin", mfaEnabled: true },
      create: {
        orgId: org.id,
        name: "Srinivas Jangiti",
        email: "srinivasajan.work@gmail.com",
        role: "Admin",
        department: "Executive & Core Arch",
        status: "active",
        mfaEnabled: true,
        lastActiveAt: new Date(),
      },
    });
  }

  // 3. Ensure Standard Access Policies
  const policyCount = await db.accessPolicy.count({ where: { orgId: org.id } });
  if (policyCount === 0) {
    await db.accessPolicy.createMany({
      data: [
        {
          orgId: org.id,
          name: "Admin Omnipotent Access",
          description: "Full administrative capabilities across all connected enterprise tools.",
          role: "Admin",
          resource: "*",
          allowedActions: JSON.stringify(["*"]),
          isDefault: true,
          mfaRequired: true,
          ipRestriction: false,
        },
        {
          orgId: org.id,
          name: "DevOps Cloud & Infrastructure Policy",
          description: "Grants infrastructure read/write to AWS, Datadog, GitHub, and Slack.",
          role: "DevOps",
          resource: "aws,github,datadog,slack",
          allowedActions: JSON.stringify(["read", "write", "deploy"]),
          isDefault: true,
          mfaRequired: true,
          ipRestriction: false,
        },
        {
          orgId: org.id,
          name: "SecOps Audit & Cloud Visibility Policy",
          description: "Security operations policy with read access across all cloud infrastructure and logs.",
          role: "SecOps",
          resource: "aws,github,datadog,google_workspace,slack",
          allowedActions: JSON.stringify(["read", "audit", "investigate"]),
          isDefault: true,
          mfaRequired: true,
          ipRestriction: true,
        },
        {
          orgId: org.id,
          name: "Engineering Standard Development Policy",
          description: "Standard developer access to source code repositories and collaboration tools.",
          role: "Developer",
          resource: "github,slack,jira",
          allowedActions: JSON.stringify(["read", "pull", "push"]),
          isDefault: true,
          mfaRequired: false,
          ipRestriction: false,
        },
      ],
    });
  }

  // 4. Ensure Master API Key (Raw key: "ak_live_airlock_master_admin_key_2026")
  const rawKey = "ak_live_airlock_master_admin_key_2026";
  const keyHash = hashApiKey(rawKey);
  const existingKey = await db.apiKey.findUnique({ where: { keyHash } });
  if (!existingKey) {
    await db.apiKey.create({
      data: {
        orgId: org.id,
        name: "Default Enterprise Admin Key",
        keyHash,
        prefix: "ak_live_airloc",
        scopes: "read,write,admin",
        lastUsedAt: new Date(),
      },
    });
  }

  // 5. Ensure Audit Ledger Genesis Block
  const genesisBlock = await db.auditLog.findFirst({
    where: { orgId: org.id, sequence: 1 },
  });

  if (!genesisBlock) {
    const genesisTimestamp = new Date("2026-09-01T00:00:00Z").toISOString();
    const genesisHash = computeAuditHash({
      previousHash: GENESIS_HASH,
      sequence: 1,
      timestamp: genesisTimestamp,
      actor: "system",
      action: "ledger.genesis",
      resource: "airlock:merkle-chain",
      metadata: JSON.stringify({ version: "2.0", standard: "SOC 2 Type II" }),
    });

    await db.auditLog.create({
      data: {
        orgId: org.id,
        sequence: 1,
        previousHash: GENESIS_HASH,
        currentHash: genesisHash,
        actor: "system",
        action: "ledger.genesis",
        resource: "airlock:merkle-chain",
        severity: "info",
        metadata: JSON.stringify({ version: "2.0", standard: "SOC 2 Type II" }),
        timestamp: new Date(genesisTimestamp),
      },
    });
  }

  return org;
}
