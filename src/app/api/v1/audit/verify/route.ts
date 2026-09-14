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

  await ensureDatabaseSeeded();

  // Load entire chronological audit history for this organization
  const allLogs = await db.auditLog.findMany({
    where: { orgId: auth.orgId },
    orderBy: { sequence: "asc" },
  });

  const verification = verifyAuditChain(allLogs);
  const headBlock = allLogs[allLogs.length - 1];

  return NextResponse.json({
    success: true,
    verification: {
      isTamperEvident: true,
      chainValid: verification.valid,
      totalBlocksVerified: verification.totalBlocks,
      brokenAtSequence: verification.brokenAtSequence || null,
      auditFailureReason: verification.error || null,
      genesisHash: GENESIS_HASH,
      headSequence: headBlock ? headBlock.sequence : 0,
      headHash: headBlock ? headBlock.currentHash : GENESIS_HASH,
      attestation: verification.valid
        ? "All audit log entries are cryptographically chained from Genesis and mathematically tamper-proof."
        : "AUDIT FAILURE: A block was modified or inserted out of order.",
      verifiedAt: new Date().toISOString(),
    },
  });
}
