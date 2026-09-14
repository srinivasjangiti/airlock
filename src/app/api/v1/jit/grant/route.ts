import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Missing Authorization Bearer token." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { memberId, integration, scope, durationHours, reason } = body;

    if (!integration || !scope) {
      return NextResponse.json(
        { error: "Bad Request", message: "Fields 'integration' and 'scope' are required." },
        { status: 400 }
      );
    }

    const hours = Number(durationHours) || 4;
    const now = Date.now();
    const expiresAt = new Date(now + hours * 60 * 60 * 1000).toISOString();
    const grantId = `jit-${Date.now()}`;

    // Generate ephemeral token payload
    const tokenPayload = Buffer.from(
      JSON.stringify({
        gid: grantId,
        sub: memberId || "svc-break-glass",
        tgt: integration,
        scp: scope,
        exp: Math.floor((now + hours * 60 * 60 * 1000) / 1000),
        iss: "airlock-iam",
      })
    ).toString("base64url");

    const ephemeralToken = `airlock_jit_${tokenPayload}`;

    return NextResponse.json({
      success: true,
      grant: {
        id: grantId,
        memberId: memberId || "svc-break-glass",
        integration,
        scope,
        reason: reason || "Emergency break-glass procedure",
        grantedAt: new Date(now).toISOString(),
        expiresAt,
        durationHours: hours,
        status: "active",
        ephemeralToken,
      },
      message: `Issued Just-In-Time elevated access token valid for ${hours} hours.`,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Internal Error", message: err.message },
      { status: 500 }
    );
  }
}
