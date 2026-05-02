import path from "path";
import fs from "fs";
import type { RequestHandler } from "express";
import session from "express-session";
import FileStore from "session-file-store";

const FileStoreSession = FileStore(session);

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

const SESSION_DIR = path.join(process.cwd(), "data", "sessions");
if (!fs.existsSync(SESSION_DIR)) {
  fs.mkdirSync(SESSION_DIR, { recursive: true });
}

export const sessionMiddleware: RequestHandler = session({
  store: new FileStoreSession({
    path: SESSION_DIR,
    ttl: 8 * 60 * 60,
    retries: 1,
    logFn: () => {},
  }),
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
