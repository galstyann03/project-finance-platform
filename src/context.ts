import type { Request } from "express";
import { verifyToken } from "./utils/jwt.js";
import { prisma } from "./utils/prisma.js";

export interface AuthUser {
  id: number;
  email: string;
}

export interface GraphQLContext {
  user: AuthUser | null;
}

export async function buildContext({
  req,
}: {
  req: Request;
}): Promise<GraphQLContext> {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return { user: null };
  }

  const token = header.slice("Bearer ".length);
  try {
    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true },
    });
    return { user: user ?? null };
  } catch {
    return { user: null };
  }
}
