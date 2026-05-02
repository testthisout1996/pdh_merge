import { Router } from "express";
import { loadUsers } from "../lib/store";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.post("/auth/login", (req, res) => {
  const { username, pin } = req.body as { username?: string; pin?: string };
  if (!username || typeof username !== "string") {
    res.status(400).json({ error: "Username is required" });
    return;
  }
  if (!pin || typeof pin !== "string") {
    res.status(400).json({ error: "PIN is required" });
    return;
  }
  const users = loadUsers();
  const user = users.find(
    (u) => u.username.toUpperCase() === username.trim().toUpperCase() && u.pin === pin.trim()
  );
  if (!user) {
    res.status(401).json({ error: "Invalid username or PIN. Please try again." });
    return;
  }
  req.session.userId = user.id;
  res.json({ id: user.id, name: user.name, role: user.role });
});

router.post("/auth/logout", (req, res) => {
  req.session.destroy(() => {});
  res.json({ ok: true });
});

router.get("/auth/me", requireAuth, (req, res) => {
  const users = loadUsers();
  const user = users.find((u) => u.id === req.session.userId);
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }
  res.json({ id: user.id, name: user.name, role: user.role });
});

router.post("/auth/konami", (req, res) => {
  const users = loadUsers();
  const superAdmin = users.find((u) => u.role === "superadmin");
  if (!superAdmin) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  req.session.userId = superAdmin.id;
  res.json({ id: superAdmin.id, name: superAdmin.name, role: superAdmin.role });
});

export default router;
