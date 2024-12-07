import { NextResponse } from "next/server";
import prisma from "@/prisma/db";
import { verifyToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie");
    const token = cookieHeader?.split(";")
      .find(c => c.trim().startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    const body = await request.json();
    const { toUserId } = body;

    // Get sender's name
    const sender = await prisma.user.findUnique({
      where: { id: payload!.userId },
      select: { name: true }
    });

    const connection = await prisma.connection.create({
      data: {
        fromUserId: payload!.userId,
        toUserId: toUserId,
        status: "PENDING",
      },
    });

    // Create notification for the recipient with sender's name
    await prisma.notification.create({
      data: {
        userId: toUserId,
        type: "CONNECTION_REQUEST",
        message: `${sender!.name} sent you a connection request`,
        connectionId: connection.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to create connection request:", error);
    return NextResponse.json(
      { error: "Failed to create connection request" },
      { status: 500 }
    );
  }
} 