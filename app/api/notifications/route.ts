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
    
    const notifications = await prisma.notification.findMany({
      where: {
        userId: payload!.userId,
        OR: [
          {
            AND: [
              { type: "CONNECTION_REQUEST" },
              { read: false }
            ]
          },
          {
            AND: [
              { type: "CONNECTION_ACCEPTED" },
              { read: false }
            ]
          }
        ]
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Mark CONNECTION_ACCEPTED notifications as read immediately
    const acceptedNotifications = notifications.filter(n => n.type === "CONNECTION_ACCEPTED");
    if (acceptedNotifications.length > 0) {
      await prisma.notification.updateMany({
        where: {
          id: {
            in: acceptedNotifications.map(n => n.id)
          }
        },
        data: {
          read: true
        }
      });
    }

    return NextResponse.json({ notifications: [] });  // When error occurs or no notifications found
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie");
    const token = cookieHeader?.split(";")
      .find((c) => c.trim().startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    verifyToken(token);
    const body = await request.json();

    const notification = await prisma.notification.create({
      data: body,
    });

    return NextResponse.json({ notification });
  } catch (error) {
    console.error("Failed to create notification:", error);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
} 