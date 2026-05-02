import { Router } from "express";
import { randomUUID } from "crypto";
import { loadUsers, saveUsers, type Role } from "../lib/store";
import { requireAuth, requireRole } from "../middlewares/auth";

const router = Router();

router.get("/users", requireRole("admin", "superadmin"), (req, res) => {
  const users = loadUsers();
  res.json(users.map((u) => ({ id: u.id, name: u.name, username: u.username, role: u.role })));
});

router.post("/users", requireRole("admin", "superadmin"), (req, res) => {
  const { name, username, pin } = req.body as { name?: string; username?: string; pin?: string };
  if (!name || !username || !pin) {
    res.status(400).json({ error: "Name, username and PIN are required" });
    return;
  }
  if (!/^[a-zA-Z]{2,8}$/.test(username)) {
    res.status(400).json({ error: "Username must be 2–8 letters only" });
    return;
  }
  if (!/^\d{4,8}$/.test(pin)) {
    res.status(400).json({ error: "PIN must be 4–8 digits" });
    return;
  }
  const users = loadUsers();
  if (users.some((u) => u.username.toLowerCase() === username.trim().toLowerCase())) {
    res.status(400).json({ error: "Username already taken" });
    return;
  }
  const newUser = {
    id: randomUUID(),
    name: name.trim(),
    username: username.trim().toLowerCase(),
    pin,
    role: "basic" as Role,
  };
  users.push(newUser);
  saveUsers(users);
  res.status(201).json({ id: newUser.id, name: newUser.name, username: newUser.username, role: newUser.role });
});

router.delete("/users/:id", requireRole("admin", "superadmin"), (req, res) => {
  const { id } = req.params;
  const users = loadUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  const target = users[idx];
  const requesting = users.find((u) => u.id === req.session.userId);
  if (target.id === req.session.userId) {
    res.status(403).json({ error: "You cannot delete your own account" });
    return;
  }
  if (requesting?.role === "admin" && (target.role === "superadmin" || target.role === "admin")) {
    res.status(403).json({ error: "Admins can only delete basic user accounts" });
    return;
  }
  users.splice(idx, 1);
  saveUsers(users);
  res.json({ ok: true });
});

router.patch("/users/:id/pin", requireAuth, (req, res) => {
  const { id } = req.params;
  const { pin, confirmPin } = req.body as { pin?: string; confirmPin?: string };
  if (!pin || !confirmPin) {
    res.status(400).json({ error: "PIN and confirmation are required" });
    return;
  }
  if (pin !== confirmPin) {
    res.status(400).json({ error: "PINs do not match" });
    return;
  }
  if (!/^\d{4,8}$/.test(pin)) {
    res.status(400).json({ error: "PIN must be 4–8 digits" });
    return;
  }
  const users = loadUsers();
  const requesting = users.find((u) => u.id === req.session.userId);
  const target = users.find((u) => u.id === id);
  if (!target) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  const isSelf = id === req.session.userId;
  if (!isSelf) {
    if (!requesting || (requesting.role !== "admin" && requesting.role !== "superadmin")) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    if (requesting.role === "admin" && (target.role === "superadmin" || target.role === "admin")) {
      res.status(403).json({ error: "Admins can only reset PINs for basic users" });
      return;
    }
  }
  target.pin = pin;
  saveUsers(users);
  res.json({ ok: true });
});

router.patch("/users/:id/role", requireRole("superadmin"), (req, res) => {
  const { id } = req.params;
  const { role } = req.body as { role?: string };
  if (!role || !["superadmin", "admin", "basic"].includes(role)) {
    res.status(400).json({ error: "Role must be 'superadmin', 'admin' or 'basic'" });
    return;
  }
  const users = loadUsers();
  const target = users.find((u) => u.id === id);
  if (!target) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  if (target.id === req.session.userId) {
    res.status(403).json({ error: "You cannot change your own role" });
    return;
  }
  target.role = role as Role;
  saveUsers(users);
  res.json({ ok: true });
});

export default router;
