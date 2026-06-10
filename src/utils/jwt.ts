import jwt from "jsonwebtoken";
import { config } from "../configs/config.js";

export interface JwtPayload {
  userId: number;
}

function getSecret(): string {
  if (!config.jwt.secret) {
    throw new Error("JWT_SECRET is not set in environment");
  }
  return config.jwt.secret;
}

export function signToken(payload: JwtPayload): string {
  const options: jwt.SignOptions = {
    expiresIn: config.jwt.expiresIn as jwt.SignOptions["expiresIn"],
  };
  return jwt.sign(payload, getSecret(), options);
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, getSecret()) as JwtPayload;
}
