import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authenticateApiKey } from "@/lib/auth-service";
import { appendAuditLog } from "@/lib/audit-service";
import { signJitToken } from "@/lib/crypto";
import { ensureDatabaseSeeded } from "@/lib/db-seed";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const auth = await authenticateApiKey(authHeader);
    if (!auth.authenticated) {
      return NextResponse.json(
        { error: "Unauthorized", message: auth.error },
        { status: auth.status }
      );
    }

    const body = await req.json();
    const { userId, userEmail, integration, scope, durationHours, reason } = body;

    if (!integration || !scope) {
      return NextResponse.json(
        { error: "Bad Request", message: "Fields 'integration' and 'scope' are required." },
        { status: 400 }
      );
    }

    await ensureDatabaseSeeded();

    // Look up target user
    let user = null;
    if (userId) {
      user = await db.user.findFirst({
        where: { id: userId, orgId: auth.orgId },
      });
    } else if (userEmail) {
      user = await db.user.findFirst({
        where: { email: userEmail.toLowerCase().trim(), orgId: auth.orgId },
      });
    }

    if (!user) {
      return NextResponse.json(
        { error: "User Not Found", message: "Target user for JIT access grant does not exist." },
        { status: 404 }
      );
    }

    const hours = Math.max(1, Math.min(24, Number(durationHours) || 4));
    const now = new Date();
    const expiresAt = new Date(now.getTime() + hours * 60 * 60 * 1000);

    // Create grant in database
    const grant = await db.jitGrant.create({
      data: {
        orgId: auth.orgId!,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        integration,
        scope,
        reason: reason || "Emergency break-glass procedure",
        durationHours: hours,
        status: "ACTIVE",
        grantedAt: now,
        expiresAt,
      },
    });

    // Generate cryptographic HMAC-SHA256 signed token
    const signedToken = signJitToken({
      gid: grant.id,
      sub: user.id,
      org: auth.orgId!,
      tgt: integration,
      scp: scope,
      exp: Math.floor(expiresAt.getTime() / 1000),
    });

    await db.jitGrant.update({
      where: { id: grant.id },
      data: { signedToken },
    });

    // Record high-severity security event in cryptographic audit ledger
    await appendAuditLog({
      orgId: auth.orgId!,
      actor: `api-key:${auth.apiKey.prefix}`,
      action: "jit.grant.elevated_access_issued",
      resource: `${integration}:${scope}`,
      severity: "warning",
      metadata: {
        grantId: grant.id,
        targetUser: user.email,
        integration,
        scope,
        durationHours: hours,
        expiresAt: expiresAt.toISOString(),
        reason: grant.reason,
      },
    });

    return NextResponse.json(
      {
        success: true,
        grant: {
          id: grant.id,
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          integration,
          scope,
          reason: grant.reason,
          grantedAt: now.toISOString(),
          expiresAt: expiresAt.toISOString(),
          durationHours: hours,
          status: "ACTIVE",
          signedToken,
        },
        message: `Issued Just-In-Time elevated access token valid for ${hours} hours.`,
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: "Internal Error", message: err.message },
      { status: 500 }
    );
  }
}
