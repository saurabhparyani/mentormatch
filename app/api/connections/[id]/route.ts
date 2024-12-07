import { NextResponse } from "next/server";
import prisma from "@/prisma/db";
import { verifyToken } from "@/lib/auth";
import { type NextRequest } from "next/server";

interface RouteParams {
  id: string;
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<RouteParams> }
) {
  try {
    const cookieHeader = request.headers.get("cookie");
    const token = cookieHeader?.split(";")
      .find((c) => c.trim().startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { status } = await request.json();
    const { id: connectionId } = await context.params;

    const existingConnection = await prisma.connection.findUnique({
      where: { id: connectionId },
      include: {
        fromUser: true,
        toUser: true,
      },
    });

    if (!existingConnection) {
      return NextResponse.json({ error: "Connection not found" }, { status: 404 });
    }

    const connection = await prisma.connection.update({
      where: {
        id: connectionId,
      },
      data: {
        status,
      },
      include: {
        fromUser: true,
        toUser: true,
      },
    });

    return NextResponse.json({ 
      connection,
      fromUserId: connection.fromUserId,
      toUserId: connection.toUserId
    });
  } catch (error) {
    console.error("Failed to update connection:", error);
    return NextResponse.json(
      { error: "Failed to update connection" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<RouteParams> }
) {
  try {
    const cookieHeader = request.headers.get("cookie");
    const token = cookieHeader?.split(";")
      .find((c) => c.trim().startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { id: connectionId } = await context.params;

    const connection = await prisma.connection.findFirst({
      where: {
        id: connectionId,
        OR: [
          { fromUserId: payload.userId },
          { toUserId: payload.userId }
        ]
      }
    });

    if (!connection) {
      return NextResponse.json(
        { error: "Connection not found" },
        { status: 404 }
      );
    }

    await prisma.connection.delete({
      where: {
        id: connectionId
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete connection:", error);
    return NextResponse.json(
      { error: "Failed to delete connection" },
      { status: 500 }
    );
  }
}

