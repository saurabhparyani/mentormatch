import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth";
import prisma from "@/prisma/db";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["MENTOR", "MENTEE"]),
  skills: z.string(),
  interests: z.string(),
  bio: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(data.password);
    const skills = data.skills.split(",").map((s) => s.trim());
    const interests = data.interests.split(",").map((i) => i.trim());

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role,
        skills,
        interests,
        bio: data.bio,
      },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Invalid request data" },
      { status: 400 }
    );
  }
} 