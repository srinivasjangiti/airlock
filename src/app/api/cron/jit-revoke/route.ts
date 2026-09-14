import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { appendAuditLog } from "@/lib/audit-service";
import { ensureDatabaseSeeded } from "@/lib/db-seed";

export async function POST(req: NextRequest) {
  try {
    await ensureDatabaseSeeded();

    const now = new Date();

    // Query active grants whose expiration timestamp has passed
    const expiredGrants = await db.jitGrant.findMany({
      where: {
        status: "ACTIVE",
        expiresAt: { lte: now },
      },
      include: { organization: true, user: true },
    });

    const results = [];

    for (const grant of expiredGrants) {
      // 1. Update database record
      await db.jitGrant.update({
        where: { id: grant.id },
        data: {
          status: "EXPIRED",
          revokedAt: now,
        },
      });

      // 2. Append immutable audit log block
      await appendAuditLog({
        orgId: grant.orgId,
        actor: "system:revocation-worker",
        action: "jit.grant.auto_revoked",
        resource: `${grant.integration}:${grant.scope}`,
        severity: "info",
        metadata: {
          grantId: grant.id,
          userEmail: grant.userEmail,
          integration: grant.integration,
          scope: grant.scope,
          expiredAt: grant.expiresAt.toISOString(),
          revokedAt: now.toISOString(),
        },
      });

      results.push({
        grantId: grant.id,
        user: grant.userEmail,
        integration: grant.integration,
        scope: grant.scope,
        status: "EXPIRED",
      });
    }

    return NextResponse.json({
      success: true,
      revokedCount: results.length,
      revokedGrants: results,
      executedAt: now.toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

// Allow GET for simple health check or manual cron runner
export async function GET(req: NextRequest) {
  return POST(req);
}
