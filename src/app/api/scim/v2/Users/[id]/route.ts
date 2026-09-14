import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authenticateApiKey } from "@/lib/auth-service";
import { appendAuditLog } from "@/lib/audit-service";

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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

  const user = await db.user.findFirst({
    where: { id, orgId: auth.orgId },
  });

  if (!user) {
    return NextResponse.json(
      {
        schemas: ["urn:ietf:params:scim:api:messages:2.0:Error"],
        status: "404",
        detail: `User with ID '${id}' not found.`,
      },
      { status: 404, headers: { "Content-Type": "application/scim+json" } }
    );
  }

  return NextResponse.json(formatScimUser(user), {
    status: 200,
    headers: { "Content-Type": "application/scim+json" },
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

  const user = await db.user.findFirst({
    where: { id, orgId: auth.orgId },
  });

  if (!user) {
    return NextResponse.json(
      {
        schemas: ["urn:ietf:params:scim:api:messages:2.0:Error"],
        status: "404",
        detail: `User with ID '${id}' not found.`,
      },
      { status: 404, headers: { "Content-Type": "application/scim+json" } }
    );
  }

  try {
    const body = await req.json();
    const operations = body.Operations || [];

    const updates: any = {};
    for (const op of operations) {
      const path = (op.path || "").toLowerCase();
      const value = op.value;

      if (path === "active") {
        updates.status = value === false ? "suspended" : "active";
      } else if (path === "department") {
        updates.department = String(value);
      } else if (path === "usertype" || path === "role") {
        updates.role = String(value);
      } else if (typeof value === "object" && value !== null) {
        if ("active" in value) {
          updates.status = value.active === false ? "suspended" : "active";
        }
        if ("department" in value) {
          updates.department = String(value.department);
        }
      }
    }

    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: updates,
    });

    // Record audit event
    await appendAuditLog({
      orgId: auth.orgId!,
      actor: `scim:api-key:${auth.apiKey.prefix}`,
      action: updates.status === "suspended" ? "user.scim_deprovisioned" : "user.scim_updated",
      resource: `user:${updatedUser.id}`,
      severity: updates.status === "suspended" ? "warning" : "info",
      metadata: updates,
    });

    return NextResponse.json(formatScimUser(updatedUser), {
      status: 200,
      headers: { "Content-Type": "application/scim+json" },
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

  const user = await db.user.findFirst({
    where: { id, orgId: auth.orgId },
  });

  if (!user) {
    return NextResponse.json(
      {
        schemas: ["urn:ietf:params:scim:api:messages:2.0:Error"],
        status: "404",
        detail: `User with ID '${id}' not found.`,
      },
      { status: 404, headers: { "Content-Type": "application/scim+json" } }
    );
  }

  await db.user.delete({ where: { id: user.id } });

  await appendAuditLog({
    orgId: auth.orgId!,
    actor: `scim:api-key:${auth.apiKey.prefix}`,
    action: "user.scim_deleted",
    resource: `user:${user.id}`,
    severity: "critical",
    metadata: { deletedEmail: user.email, deletedName: user.name },
  });

  return new NextResponse(null, { status: 204 });
}
