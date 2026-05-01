import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

export type Role = "superadmin" | "admin" | "basic";

export interface User {
  id: string;
  name: string;
  pin: string;
  role: Role;
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
    { id: randomUUID(), name: "Super Admin", pin: "1111", role: "superadmin" },
    { id: randomUUID(), name: "Administrator", pin: "9999", role: "admin" },
  ];
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
    return JSON.parse(raw) as User[];
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
