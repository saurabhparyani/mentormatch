import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });
  
  // Remove the token cookie
  response.cookies.delete("token");
  
  return response;
} 