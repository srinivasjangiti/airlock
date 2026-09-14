import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authenticateApiKey } from "@/lib/auth-service";
import { verifyAuditChain, GENESIS_HASH } from "@/lib/crypto";
import { ensureDatabaseSeeded } from "@/lib/db-seed";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const auth = await authenticateApiKey(authHeader);
  if (!auth.authenticated) {
    return NextResponse.json(
      { error: "Unauthorized", message: auth.error },
      { status: auth.status }
    );
  }

  const { searchParams } = new URL(req.url);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 50));

  await ensureDatabaseSeeded();

  const logs = await db.auditLog.findMany({
    where: { orgId: auth.orgId },
    orderBy: { sequence: "desc" },
    take: limit,
  });

  // Re-sort ascending to verify the mathematical hash chain
  const chainLogs = [...logs].sort((a, b) => a.sequence - b.sequence);
  const integrity = verifyAuditChain(chainLogs);

  const latestBlock = logs[0];

  return NextResponse.json({
    success: true,
    totalRecords: logs.length,
    stream: logs.map((log) => ({
      id: log.id,
      sequence: log.sequence,
      previousHash: log.previousHash,
      currentHash: log.currentHash,
      actor: log.actor,
      action: log.action,
      resource: log.resource,
      severity: log.severity,
      metadata: log.metadata ? JSON.parse(log.metadata) : null,
      timestamp: log.timestamp.toISOString(),
    })),
    cryptographicLedger: {
      framework: "SOC 2 Type II / ISO 27001 Tamper-Evident Ledger",
      genesisHash: GENESIS_HASH,
      headHash: latestBlock ? latestBlock.currentHash : GENESIS_HASH,
      headSequence: latestBlock ? latestBlock.sequence : 0,
      chainIntegrityVerified: integrity.valid,
      chainBlocksInspected: integrity.totalBlocks,
      status: integrity.valid ? "MATHEMATICALLY_VERIFIED" : "INTEGRITY_COMPROMISED",
    },
    timestamp: new Date().toISOString(),
  });
}
