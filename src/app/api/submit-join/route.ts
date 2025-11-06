import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const res = await fetch(process.env.GOOGLE_SCRIPT_WEBHOOK!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    return new NextResponse(text, { status: res.status });
  } catch (err) {
    console.error("Error forwarding to Google Script:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
