import { NextResponse } from "next/server";
import { Server as SocketServer } from "socket.io";
import { verifyToken } from "@/lib/auth";

let io: SocketServer;

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
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    if (!io) {
        io = new SocketServer({
            path: "/api/socket",
            addTrailingSlash: false,
            transports: ['websocket']
          });

      io.on("connection", (socket) => {
        socket.on("join", (userId) => {
          socket.join(userId);
        });
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 