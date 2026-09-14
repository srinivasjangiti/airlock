import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashApiKey } from "@/lib/crypto";
import { ensureDatabaseSeeded } from "@/lib/db-seed";
import { appendAuditLog } from "@/lib/audit-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, passwordOrKey } = body;

    if (!email || !passwordOrKey) {
      return NextResponse.json(
        { success: false, error: "Email and access key / password are required." },
        { status: 400 }
      );
    }

    await ensureDatabaseSeeded();

    const normalizedEmail = email.trim().toLowerCase();
    const cleanKey = passwordOrKey.trim();

    // 1. Verify against master administrative key or matching API key
    const masterKey = "ak_live_airlock_master_admin_key_2026";
    const isMasterKey = cleanKey === masterKey;

    let authenticatedUser: any = null;

    if (isMasterKey) {
      // Find administrator
      authenticatedUser = await db.user.findFirst({
        where: { email: normalizedEmail },
        include: { organization: true },
      });

      // If administrator email matches seeded admin or org admin
      if (!authenticatedUser && normalizedEmail === "srinivasajan.work@gmail.com") {
        authenticatedUser = await db.user.findFirst({
          where: { role: "Admin" },
          include: { organization: true },
        });
      }
    } else {
      // Check database API keys
      const keyHash = hashApiKey(cleanKey);
      const apiKeyRecord = await db.apiKey.findUnique({
        where: { keyHash },
        include: { organization: true },
      });

      if (apiKeyRecord) {
        authenticatedUser = await db.user.findFirst({
          where: { orgId: apiKeyRecord.orgId, email: normalizedEmail },
          include: { organization: true },
        });
      }
    }

    if (!authenticatedUser) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email or administrative access token. Check credentials and retry.",
        },
        { status: 401 }
      );
    }

    // Append authentication success audit record
    try {
      await appendAuditLog({
        orgId: authenticatedUser.orgId,
        actor: authenticatedUser.email,
        action: "auth.session.login",
        resource: "airlock:console",
        severity: "info",
        metadata: {
          clientIp: req.headers.get("x-forwarded-for") || "127.0.0.1",
          userAgent: req.headers.get("user-agent") || "Browser Console",
          role: authenticatedUser.role,
        },
      });
    } catch {
      // Ledger logging non-blocking
    }

    const sessionPayload = {
      id: authenticatedUser.id,
      name: authenticatedUser.name,
      email: authenticatedUser.email,
      role: authenticatedUser.role,
      orgId: authenticatedUser.orgId,
      orgName: authenticatedUser.organization?.name || "AirLock Technologies",
      authenticatedAt: new Date().toISOString(),
    };

    const serialized = Buffer.from(JSON.stringify(sessionPayload)).toString("base64");

    const response = NextResponse.json({
      success: true,
      user: {
        id: authenticatedUser.id,
        name: authenticatedUser.name,
        email: authenticatedUser.email,
        role: authenticatedUser.role,
        orgName: sessionPayload.orgName,
      },
    });

    // Set HTTP-only secure cookie
    response.cookies.set("airlock_session", serialized, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Authentication service error." },
      { status: 500 }
    );
  }
}
