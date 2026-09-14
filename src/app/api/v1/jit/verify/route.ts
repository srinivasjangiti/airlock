import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyJitToken } from "@/lib/crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { valid: false, error: "Missing required 'token' parameter in request body." },
        { status: 400 }
      );
    }

    // Cryptographic signature & expiry check
    const verification = verifyJitToken(token);
    if (!verification.valid || !verification.payload) {
      return NextResponse.json(
        {
          valid: false,
          error: verification.error || "Invalid cryptographic token signature.",
        },
        { status: 401 }
      );
    }

    const { gid } = verification.payload;

    // Check database state
    const grant = await db.jitGrant.findUnique({
      where: { id: gid },
      include: { organization: true, user: true },
    });

    if (!grant) {
      return NextResponse.json(
        { valid: false, error: "JIT grant not found in database." },
        { status: 404 }
      );
    }

    if (grant.status !== "ACTIVE") {
      return NextResponse.json(
        {
          valid: false,
          error: `Grant is no longer active. Current status: '${grant.status}'.`,
          grantStatus: grant.status,
        },
        { status: 403 }
      );
    }

    if (grant.expiresAt < new Date()) {
      // Mark as expired in DB
      await db.jitGrant.update({
        where: { id: grant.id },
        data: { status: "EXPIRED", revokedAt: new Date() },
      });

      return NextResponse.json(
        {
          valid: false,
          error: "Grant has expired.",
          grantStatus: "EXPIRED",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      valid: true,
      grant: {
        id: grant.id,
        user: {
          id: grant.user.id,
          name: grant.user.name,
          email: grant.user.email,
        },
        integration: grant.integration,
        scope: grant.scope,
        status: grant.status,
        expiresAt: grant.expiresAt.toISOString(),
      },
      tokenPayload: verification.payload,
      verifiedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { valid: false, error: `Internal error: ${err.message}` },
      { status: 500 }
    );
  }
}
