import { NextRequest, NextResponse } from "next/server";

const DEFAULT_MEMBERS = [
  {
    id: "mem-1",
    name: "Srinivas Jangiti",
    email: "srinivasajan.work@gmail.com",
    role: "Admin",
    status: "active",
    department: "Executive & Core Arch",
    integrations: ["GitHub", "Slack", "AWS", "Google Workspace", "Datadog", "Jira"],
    mfaEnabled: true,
  },
  {
    id: "mem-2",
    name: "Aarav Mehta",
    email: "aarav.mehta@acmecorp.internal",
    role: "DevOps",
    status: "active",
    department: "Platform Engineering",
    integrations: ["GitHub", "AWS", "Slack", "Datadog"],
    mfaEnabled: true,
  },
  {
    id: "mem-3",
    name: "Elena Rostova",
    email: "elena.r@acmecorp.internal",
    role: "SecOps",
    status: "active",
    department: "Information Security",
    integrations: ["GitHub", "AWS", "Slack", "Google Workspace", "Datadog"],
    mfaEnabled: true,
  },
  {
    id: "mem-4",
    name: "Marcus Brody",
    email: "m.brody@acmecorp.internal",
    role: "Developer",
    status: "active",
    department: "Backend Engineering",
    integrations: ["GitHub", "Slack", "Jira"],
    mfaEnabled: true,
  },
];

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Unauthorized", message: "Missing Authorization Bearer token." },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role");
  const limit = Number(searchParams.get("limit")) || 20;

  let list = DEFAULT_MEMBERS;
  if (role) {
    list = list.filter((m) => m.role.toLowerCase() === role.toLowerCase());
  }

  return NextResponse.json({
    success: true,
    total: list.length,
    members: list.slice(0, limit),
    timestamp: new Date().toISOString(),
  });
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Unauthorized", message: "Missing Authorization Bearer token." },
      { status: 401 }
    );
  }

  const body = await req.json();
  const { name, email, role, department, integrations } = body;

  if (!name || !email) {
    return NextResponse.json(
      { error: "Bad Request", message: "Name and email are required." },
      { status: 400 }
    );
  }

  const newMember = {
    id: `mem-${Date.now()}`,
    name,
    email,
    role: role || "Developer",
    status: "active",
    department: department || "Engineering",
    integrations: integrations || ["Slack", "GitHub"],
    mfaEnabled: false,
    createdAt: new Date().toISOString(),
  };

  return NextResponse.json({
    success: true,
    member: newMember,
    message: `Provisioned new member '${name}' (${email}).`,
    timestamp: new Date().toISOString(),
  });
}
