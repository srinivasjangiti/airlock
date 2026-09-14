import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authenticateApiKey } from "@/lib/auth-service";
import { appendAuditLog } from "@/lib/audit-service";
import { ensureDatabaseSeeded } from "@/lib/db-seed";

function formatScimUser(user: any) {
  const nameParts = user.name ? user.name.split(" ") : ["", ""];
  const givenName = nameParts[0] || "";
  const familyName = nameParts.slice(1).join(" ") || "";

  return {
    schemas: ["urn:ietf:params:scim:schemas:core:2.0:User"],
    id: user.id,
    userName: user.email,
    name: {
      formatted: user.name,
      givenName,
      familyName,
    },
    emails: [
      {
        value: user.email,
        type: "work",
        primary: true,
      },
    ],
    active: user.status === "active",
    department: user.department,
    userType: user.role,
    meta: {
      resourceType: "User",
      created: user.createdAt.toISOString(),
      lastModified: user.updatedAt.toISOString(),
      location: `/api/scim/v2/Users/${user.id}`,
    },
  };
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const auth = await authenticateApiKey(authHeader);
  if (!auth.authenticated) {
    return NextResponse.json(
      {
        schemas: ["urn:ietf:params:scim:api:messages:2.0:Error"],
        status: auth.status.toString(),
        detail: auth.error,
      },
      { status: auth.status, headers: { "Content-Type": "application/scim+json" } }
    );
  }

  const { searchParams } = new URL(req.url);
  const startIndex = Math.max(1, parseInt(searchParams.get("startIndex") || "1", 10));
  const count = Math.min(100, Math.max(1, parseInt(searchParams.get("count") || "20", 10)));
  const filter = searchParams.get("filter");

  await ensureDatabaseSeeded();

  let whereClause: any = { orgId: auth.orgId };

  if (filter) {
    // Parse SCIM filter e.g. userName eq "user@example.com"
    const match = filter.match(/userName\s+eq\s+["']?([^"']+)["']?/i);
    if (match && match[1]) {
      whereClause.email = match[1].trim();
    }
  }

  const totalResults = await db.user.count({ where: whereClause });
  const users = await db.user.findMany({
    where: whereClause,
    skip: startIndex - 1,
    take: count,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    {
      schemas: ["urn:ietf:params:scim:api:messages:2.0:ListResponse"],
      totalResults,
      startIndex,
      itemsPerPage: users.length,
      Resources: users.map(formatScimUser),
    },
    { status: 200, headers: { "Content-Type": "application/scim+json" } }
  );
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const auth = await authenticateApiKey(authHeader);
  if (!auth.authenticated) {
    return NextResponse.json(
      {
        schemas: ["urn:ietf:params:scim:api:messages:2.0:Error"],
        status: auth.status.toString(),
        detail: auth.error,
      },
      { status: auth.status, headers: { "Content-Type": "application/scim+json" } }
    );
  }

  try {
    const body = await req.json();
    const userName = body.userName || body.emails?.[0]?.value;

    if (!userName) {
      return NextResponse.json(
        {
          schemas: ["urn:ietf:params:scim:api:messages:2.0:Error"],
          scimType: "invalidValue",
          detail: "Missing required 'userName' or 'emails' attribute.",
          status: "400",
        },
        { status: 400, headers: { "Content-Type": "application/scim+json" } }
      );
    }

    const existing = await db.user.findUnique({
      where: { email: userName.toLowerCase().trim() },
    });

    if (existing) {
      return NextResponse.json(
        {
          schemas: ["urn:ietf:params:scim:api:messages:2.0:Error"],
          scimType: "uniqueness",
          detail: `User with email '${userName}' already exists.`,
          status: "409",
        },
        { status: 409, headers: { "Content-Type": "application/scim+json" } }
      );
    }

    const displayName =
      body.displayName ||
      body.name?.formatted ||
      [body.name?.givenName, body.name?.familyName].filter(Boolean).join(" ") ||
      userName.split("@")[0];

    const newUser = await db.user.create({
      data: {
        orgId: auth.orgId!,
        email: userName.toLowerCase().trim(),
        name: displayName,
        role: body.userType || "Developer",
        department: body.department || "Engineering",
        status: body.active === false ? "suspended" : "active",
        mfaEnabled: false,
      },
    });

    // Append cryptographic audit log
    await appendAuditLog({
      orgId: auth.orgId!,
      actor: `scim:api-key:${auth.apiKey.prefix}`,
      action: "user.scim_provisioned",
      resource: `user:${newUser.id}`,
      severity: "success",
      metadata: {
        email: newUser.email,
        name: newUser.name,
        department: newUser.department,
        status: newUser.status,
      },
    });

    const scimUser = formatScimUser(newUser);

    return NextResponse.json(scimUser, {
      status: 201,
      headers: {
        "Content-Type": "application/scim+json",
        Location: `/api/scim/v2/Users/${newUser.id}`,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        schemas: ["urn:ietf:params:scim:api:messages:2.0:Error"],
        detail: err.message,
        status: "500",
      },
      { status: 500, headers: { "Content-Type": "application/scim+json" } }
    );
  }
}
