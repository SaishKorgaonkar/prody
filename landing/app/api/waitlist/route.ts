import { NextResponse } from "next/server";
import { isValidEmail, saveWaitlistSignup } from "@/lib/waitlist";

export async function POST(request: Request) {
  let body: { email?: string; source?: string; role?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = body.email?.trim() ?? "";
  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 }
    );
  }

  const result = await saveWaitlistSignup({
    email,
    source: body.source,
    role: body.role,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status }
    );
  }

  return NextResponse.json({ ok: true });
}
