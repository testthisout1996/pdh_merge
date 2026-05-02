import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

export type Role = "superadmin" | "admin" | "basic";

export interface User {
  id: string;
  name: string;
  username: string;
  pin: string;
  role: Role;
  lastLogin?: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "users.json");

function ensureDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function initStore(): User[] {
  return [
    { id: randomUUID(), name: "Super Admin", username: "ADMIN", pin: "1111", role: "superadmin" },
    { id: randomUUID(), name: "Administrator", username: "ADMN", pin: "9999", role: "admin" },
  ];
}

function deriveUsername(name: string, index: number): string {
  const base = name.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 8);
  return base.length >= 2 ? base : `USR${index}`;
}

export function loadUsers(): User[] {
  ensureDir();
  if (!fs.existsSync(DATA_FILE)) {
    const users = initStore();
    saveUsers(users);
    return users;
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const users = JSON.parse(raw) as User[];
    let dirty = false;
    users.forEach((u, i) => {
      if (!u.username) {
        u.username = deriveUsername(u.name, i);
        dirty = true;
      } else {
        const upper = u.username.toUpperCase();
        if (u.username !== upper) {
          u.username = upper;
          dirty = true;
        }
      }
    });
    if (dirty) saveUsers(users);
    return users;
  } catch {
    const users = initStore();
    saveUsers(users);
    return users;
  }
}

export function saveUsers(users: User[]): void {
  ensureDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2), "utf-8");
}
