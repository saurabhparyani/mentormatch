import { NextResponse } from "next/server";
import prisma from "@/prisma/db";
import { verifyToken } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie");
    const token = cookieHeader?.split(";")
      .find((c) => c.trim().startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    
    const connections = await prisma.connection.findMany({
      where: {
        OR: [
          {
            fromUserId: payload!.userId,
            OR: [
              { status: "PENDING" },
              { status: "ACCEPTED" }
            ]
          },
          {
            toUserId: payload!.userId,
            OR: [
              { status: "PENDING" },
              { status: "ACCEPTED" }
            ]
          }
        ]
      },
    });

    return NextResponse.json({ 
      connections: connections.map(conn => ({
        userId: conn.fromUserId === payload!.userId ? conn.toUserId : conn.fromUserId,
        status: conn.status
      }))
    });
  } catch (error) {
    console.error("Failed to fetch connections:", error);
    return NextResponse.json(
      { error: "Failed to fetch connections" },
      { status: 500 }
    );
  }
} 