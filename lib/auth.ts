import { hash, compare } from "bcryptjs";
import { sign, verify } from "jsonwebtoken";
import type { UserToken } from "@/types/user";

const JWT_SECRET = 'your-super-secret-key';

export async function hashPassword(password: string) {
  return await hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return await compare(password, hashedPassword);
}

export function generateToken(payload: UserToken) {
  return sign(payload, JWT_SECRET);
}

export function verifyToken(token: string) {
  try {
    return verify(token, JWT_SECRET) as UserToken;
  } catch {
    return null;
  }
}