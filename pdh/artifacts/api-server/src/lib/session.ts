import type { RequestHandler } from "express";
import session from "express-session";

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

export const sessionMiddleware: RequestHandler = session({
  secret: process.env.SESSION_SECRET ?? "pdh-session-secret-dev-2024",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    maxAge: 8 * 60 * 60 * 1000,
    sameSite: "lax",
  },
});
