import { Router } from "express";
import { loadUsers } from "../lib/store";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.post("/auth/login", (req, res) => {
  const { pin } = req.body as { pin?: string };
  if (!pin || typeof pin !== "string") {
    res.status(400).json({ error: "PIN is required" });
    return;
  }
  const users = loadUsers();
  const user = users.find((u) => u.pin === pin.trim());
  if (!user) {
    res.status(401).json({ error: "Invalid PIN. Please try again." });
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

export default router;
