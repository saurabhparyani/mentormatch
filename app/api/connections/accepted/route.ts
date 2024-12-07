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
            status: "ACCEPTED"
          },
          {
            toUserId: payload!.userId,
            status: "ACCEPTED"
          }
        ]
      },
      include: {
        fromUser: {
          select: {
            id: true,
            name: true,
            role: true
          }
        },
        toUser: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      }
    });


    const transformedConnections = connections.map(conn => ({
      id: conn.id,
      user: conn.fromUserId === payload!.userId ? conn.toUser : conn.fromUser,
      createdAt: conn.createdAt
    }));

    return NextResponse.json({ connections: transformedConnections });
  } catch (error) {
    console.error("Failed to fetch connections:", error);
    return NextResponse.json(
      { error: "Failed to fetch connections" },
      { status: 500 }
    );
  }
} 