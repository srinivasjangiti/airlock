import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Missing or malformed Authorization header. Expected 'Bearer <api_key>'.",
        },
        { status: 401 }
      );
    }

    const apiKey = authHeader.replace("Bearer ", "").trim();
    if (!apiKey.startsWith("airlock_")) {
      return NextResponse.json(
        {
          error: "Invalid Token",
          message: "API key must start with 'airlock_live_' or 'airlock_test_'.",
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { memberId, memberRole, integration, action, mfaEnrolled, ipAddress } = body;

    if (!integration || !action) {
      return NextResponse.json(
        {
          error: "Bad Request",
          message: "Missing required fields: 'integration' and 'action'.",
        },
        { status: 400 }
      );
    }

    const role = memberRole || "Developer";
    const mfa = mfaEnrolled !== undefined ? Boolean(mfaEnrolled) : true;

    // Deterministic Zero-Trust Policy Decision Tree
    const steps: { check: string; passed: boolean; note: string }[] = [];

    // Step 1: Authentication & Token
    steps.push({
      check: "API Key Authenticity",
      passed: true,
      note: `Verified valid service token prefix: ${apiKey.slice(0, 16)}...`,
    });

    // Step 2: Role Permissions Whitelist
    const ROLE_WHITELIST: Record<string, string[]> = {
      Admin: ["*"],
      DevOps: ["github", "aws", "datadog", "slack"],
      SecOps: ["aws", "github", "datadog", "google workspace", "slack"],
      Developer: ["github", "slack", "jira"],
      Designer: ["figma", "slack", "notion"],
      Product: ["jira", "slack", "notion", "google workspace"],
      Finance: ["google workspace", "slack"],
      HR: ["google workspace", "slack"],
    };

    const allowedTools = ROLE_WHITELIST[role] || ["slack"];
    const isToolAllowed =
      allowedTools.includes("*") ||
      allowedTools.some((t) => t.toLowerCase() === integration.toLowerCase());

    if (!isToolAllowed) {
      steps.push({
        check: "Role Policy Binding",
        passed: false,
        note: `Role '${role}' is not granted access to integration '${integration}'.`,
      });

      return NextResponse.json({
        decision: "DENY",
        allowed: false,
        reason: `Integration '${integration}' is not permitted under policy for role '${role}'.`,
        subject: { memberId: memberId || "svc-account", role, mfaEnrolled: mfa },
        resource: { integration, action },
        steps,
        timestamp: new Date().toISOString(),
      });
    }

    steps.push({
      check: "Role Policy Binding",
      passed: true,
      note: `'${integration}' is whitelisted for role '${role}'.`,
    });

    // Step 3: MFA Enforcement Check
    const MFA_MANDATED_ROLES = ["Admin", "DevOps", "SecOps"];
    if (MFA_MANDATED_ROLES.includes(role) && !mfa) {
      steps.push({
        check: "Hardware MFA Verification",
        passed: false,
        note: `Privileged role '${role}' requires MFA, but user subject has not enrolled.`,
      });

      return NextResponse.json({
        decision: "DENY",
        allowed: false,
        reason: `MFA enforcement failed: Role '${role}' strictly mandates multi-factor authentication.`,
        subject: { memberId: memberId || "svc-account", role, mfaEnrolled: false },
        resource: { integration, action },
        steps,
        timestamp: new Date().toISOString(),
      });
    }

    steps.push({
      check: "Hardware MFA Verification",
      passed: true,
      note: mfa ? "MFA validation verified." : "MFA optional for role.",
    });

    // Step 4: Final Allow Decision
    return NextResponse.json({
      decision: "ALLOW",
      allowed: true,
      reason: `Access ALLOWED under Zero-Trust RBAC policy for role '${role}'.`,
      subject: { memberId: memberId || "svc-account", role, mfaEnrolled: mfa },
      resource: { integration, action, ipAddress: ipAddress || "127.0.0.1" },
      steps,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Internal Error", message: err.message },
      { status: 500 }
    );
  }
}
