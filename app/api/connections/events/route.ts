import { NextResponse } from "next/server";

export async function GET() {
  const response = new NextResponse();

  response.headers.set("Content-Type", "text/event-stream");
  response.headers.set("Cache-Control", "no-cache");
  response.headers.set("Connection", "keep-alive");

  return response;
} 