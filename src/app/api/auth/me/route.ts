import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const sessionCookie = req.cookies.get("airlock_session")?.value;

  if (!sessionCookie) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  try {
    const raw = Buffer.from(sessionCookie, "base64").toString("utf-8");
    const session = JSON.parse(raw);
    return NextResponse.json({ authenticated: true, user: session });
  } catch {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }
}
