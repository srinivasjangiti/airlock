import { db } from "./db";
import { GENESIS_HASH, computeAuditHash } from "./crypto";
import { ensureDatabaseSeeded } from "./db-seed";

export async function appendAuditLog(params: {
  orgId: string;
  actor: string;
  action: string;
  resource: string;
  severity?: "info" | "warning" | "critical" | "success";
  metadata?: any;
}) {
  await ensureDatabaseSeeded();

  // Find latest block in the organization
  const latestBlock = await db.auditLog.findFirst({
    where: { orgId: params.orgId },
    orderBy: { sequence: "desc" },
  });

  const nextSequence = latestBlock ? latestBlock.sequence + 1 : 1;
  const previousHash = latestBlock ? latestBlock.currentHash : GENESIS_HASH;
  const timestamp = new Date();
  const metaStr = params.metadata ? JSON.stringify(params.metadata) : null;

  const currentHash = computeAuditHash({
    previousHash,
    sequence: nextSequence,
    timestamp: timestamp.toISOString(),
    actor: params.actor,
    action: params.action,
    resource: params.resource,
    metadata: metaStr,
  });

  return await db.auditLog.create({
    data: {
      orgId: params.orgId,
      sequence: nextSequence,
      previousHash,
      currentHash,
      actor: params.actor,
      action: params.action,
      resource: params.resource,
      severity: params.severity || "info",
      metadata: metaStr,
      timestamp,
    },
  });
}
