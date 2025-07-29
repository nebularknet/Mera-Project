import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const preferredRegion = "iad1";

export async function GET() {
  console.log("Health check endpoint called");
  return NextResponse.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    runtime: "nodejs",
    region: "iad1"
  });
} 