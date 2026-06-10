import type { GraphQLContext, AuthUser } from "../context.js";
import { unauthenticated } from "./AppError.js";

export function requireUser(ctx: GraphQLContext): AuthUser {
  if (!ctx.user) {
    throw unauthenticated();
  }
  return ctx.user;
}
