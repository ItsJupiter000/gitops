import { NextResponse } from "next/server";
import os from "os";

export async function GET() {
  return NextResponse.json({
    pod: os.hostname(),        // Returns the Kubernetes pod name
    timestamp: new Date().toISOString(),
  });
}
