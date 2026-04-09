import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { id, password } = await request.json();
  const adminId = process.env.ADMIN_ID;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (id === adminId && password === adminPassword) {
    return NextResponse.json({ success: true });
  } else {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
