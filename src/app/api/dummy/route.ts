import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ 
    message: "Dummy serverless function",
    timestamp: new Date().toISOString(),
    status: "ok"
  });
}

export async function POST() {
  return NextResponse.json({ 
    message: "Dummy POST endpoint",
    timestamp: new Date().toISOString(),
    status: "ok"
  });
} 