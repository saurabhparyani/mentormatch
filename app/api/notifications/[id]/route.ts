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
    const body = await request.json();
    const { id } = await context.params;

    const notification = await prisma.notification.update({
      where: {
        id: id,
        userId: payload!.userId,
      },
      data: {
        read: body.read,
      },
    });

    return NextResponse.json({ notification });
  } catch (error) {
    console.error("Failed to update notification:", error);
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    );
  }
}

