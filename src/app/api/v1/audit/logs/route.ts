import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Unauthorized", message: "Missing Authorization Bearer token." },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get("limit")) || 50;

  const logs = [
    {
      id: "act-1",
      type: "jit_grant_issued",
      actor: "Srinivas Jangiti",
      target: "Marcus Brody",
      integration: "AWS",
      severity: "warning",
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    },
    {
      id: "act-2",
      type: "integration_connected",
      actor: "Srinivas Jangiti",
      target: "Datadog APM",
      integration: "Datadog",
      severity: "success",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "act-3",
      type: "member_suspended",
      actor: "Elena Rostova",
      target: "Devon Vance",
      integration: "GitHub",
      severity: "critical",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  return NextResponse.json({
    success: true,
    totalRecords: logs.length,
    stream: logs.slice(0, limit),
    compliance: {
      frameworks: ["SOC 2 Type II", "ISO 27001", "HIPAA"],
      tamperEvident: true,
      sha256Digest: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    },
    timestamp: new Date().toISOString(),
  });
}
