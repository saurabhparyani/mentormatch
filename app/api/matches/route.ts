import { NextResponse } from "next/server";
import prisma from "@/prisma/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    
    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const connections = await prisma.connection.findMany({
      where: {
        OR: [
          { fromUserId: userId, status: "ACCEPTED" },
          { toUserId: userId, status: "ACCEPTED" }
        ],
      },
      select: {
        fromUserId: true,
        toUserId: true,
      },
    });

    const connectedUserIds = new Set(
      connections.flatMap(conn => [conn.fromUserId, conn.toUserId])
    );
    connectedUserIds.delete(userId);

    const potentialMatches = await prisma.user.findMany({
      where: {
        role: user.role === "MENTOR" ? "MENTEE" : "MENTOR",
        NOT: { 
          id: {
            in: Array.from(connectedUserIds)
          }
        },
      },
    });

    const matches = potentialMatches.map((match) => {
      const commonSkills = match.skills.filter((skill) =>
        user.interests.includes(skill)
      );
      const commonInterests = match.interests.filter((interest) =>
        user.interests.includes(interest)
      );
      
      const matchScore = 
        (commonSkills.length * 20) + 
        (commonInterests.length * 10);

      return {
        id: match.id,
        name: match.name,
        role: match.role,
        matchScore: Math.min(matchScore, 100),
      };
    });

    matches.sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json({ matches });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to fetch matches" },
      { status: 500 }
    );
  }
} 