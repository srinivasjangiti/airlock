import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authenticateApiKey } from "@/lib/auth-service";
import { appendAuditLog } from "@/lib/audit-service";
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
  const role = searchParams.get("role");
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 50));

  await ensureDatabaseSeeded();

  const whereClause: any = { orgId: auth.orgId };
  if (role) {
    whereClause.role = { equals: role };
  }

  const total = await db.user.count({ where: whereClause });
  const members = await db.user.findMany({
    where: whereClause,
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    success: true,
    total,
    members: members.map((m) => ({
      id: m.id,
      name: m.name,
      email: m.email,
      role: m.role,
      status: m.status,
      department: m.department,
      mfaEnabled: m.mfaEnabled,
      lastActive: m.lastActiveAt?.toISOString() || null,
      joinedAt: m.createdAt.toISOString(),
    })),
    timestamp: new Date().toISOString(),
  });
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const auth = await authenticateApiKey(authHeader);
  if (!auth.authenticated) {
    return NextResponse.json(
      { error: "Unauthorized", message: auth.error },
      { status: auth.status }
    );
  }

  try {
    const body = await req.json();
    const { name, email, role, department, mfaEnabled } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Bad Request", message: "Both 'name' and 'email' are required." },
        { status: 400 }
      );
    }

    await ensureDatabaseSeeded();

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Conflict", message: `User with email '${email}' already exists.` },
        { status: 409 }
      );
    }

    const newMember = await db.user.create({
      data: {
        orgId: auth.orgId!,
        name: name.trim(),
        email: normalizedEmail,
        role: role || "Developer",
        department: department || "Engineering",
        status: "active",
        mfaEnabled: Boolean(mfaEnabled),
      },
    });

    // Record audit event in database
    await appendAuditLog({
      orgId: auth.orgId!,
      actor: `api-key:${auth.apiKey.prefix}`,
      action: "member.created",
      resource: `user:${newMember.id}`,
      severity: "info",
      metadata: {
        email: newMember.email,
        name: newMember.name,
        role: newMember.role,
        department: newMember.department,
      },
    });

    return NextResponse.json(
      {
        success: true,
        member: {
          id: newMember.id,
          name: newMember.name,
          email: newMember.email,
          role: newMember.role,
          status: newMember.status,
          department: newMember.department,
          mfaEnabled: newMember.mfaEnabled,
          joinedAt: newMember.createdAt.toISOString(),
        },
        message: `Provisioned member '${newMember.name}' (${newMember.email}).`,
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
