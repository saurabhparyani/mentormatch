import { NextResponse } from "next/server";
import prisma from "@/prisma/db";
import { verifyToken } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    // Get token from cookie
    const cookieHeader = request.headers.get("cookie");
    const token = cookieHeader?.split(";")
      .find(c => c.trim().startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify token
    const payload = verifyToken(token);

    // Fetch all users except the current user
    const users = await prisma.user.findMany({
      where: {
        NOT: {
          id: payload!.userId,
        },
      },
      select: {
        id: true,
        name: true,
        role: true,
        skills: true,
        interests: true,
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
} 