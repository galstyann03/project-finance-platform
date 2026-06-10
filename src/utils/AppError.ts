import { GraphQLError } from "graphql";

export type ErrorCode =
  | "BAD_USER_INPUT"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT";


export class AppError extends GraphQLError {
  constructor(message: string, code: ErrorCode) {
    super(message, { extensions: { code } });
  }
}

export const badInput = (msg: string) => new AppError(msg, "BAD_USER_INPUT");
export const unauthenticated = (msg = "Not authenticated") =>
  new AppError(msg, "UNAUTHENTICATED");
export const forbidden = (msg = "Not allowed") => new AppError(msg, "FORBIDDEN");
export const notFound = (msg = "Not found") => new AppError(msg, "NOT_FOUND");
export const conflict = (msg: string) => new AppError(msg, "CONFLICT");
