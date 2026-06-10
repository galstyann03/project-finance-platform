import "dotenv/config";

export const config = {
  port: Number(process.env.PORT) || 4000,
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN ?? "1d",
  },
};