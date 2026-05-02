import { Router } from "express";
import { requireRole } from "../middlewares/auth";
import { loadSettings, saveSettings } from "../lib/settings";
import { loadUsers } from "../lib/store";

const router = Router();

/* ── Public: settings read (frontend needs this on load) ── */
router.get("/settings", (_req, res) => {
  res.json(loadSettings());
});

/* ── Superadmin: update settings ── */
router.patch("/settings", requireRole("superadmin"), (req, res) => {
  const current = loadSettings();
  const body = req.body as Partial<{ idleTimeoutSeconds: number; disabledFeatures: string[] }>;

  if (body.idleTimeoutSeconds !== undefined) {
    const v = Number(body.idleTimeoutSeconds);
    if (!Number.isNaN(v)) current.idleTimeoutSeconds = Math.max(15, Math.min(3600, v));
  }
  if (Array.isArray(body.disabledFeatures)) {
    current.disabledFeatures = body.disabledFeatures;
  }

  saveSettings(current);
  res.json(current);
});

/* ── Superadmin: log out every session except the caller's ── */
router.post("/admin/logout-all", requireRole("superadmin"), (req, res) => {
  const store = req.sessionStore as any;
  const currentSid = req.sessionID;
  const users = loadUsers();

  if (typeof store.all !== "function") {
    res.status(500).json({ error: "Session store does not support listing sessions" });
    return;
  }

  store.all((err: any, sessions: Record<string, any>) => {
    if (err) {
      res.status(500).json({ error: "Could not list sessions" });
      return;
    }

    const toDestroy = Object.entries(sessions || {})
      .filter(([sid, data]) => {
        if (sid === currentSid) return false;
        const userId = (data as any)?.userId;
        const user = users.find((u) => u.id === userId);
        return !user || user.role !== "superadmin";
      })
      .map(([sid]) => sid);

    if (toDestroy.length === 0) {
      res.json({ ok: true, loggedOut: 0 });
      return;
    }

    let done = 0;
    let loggedOut = 0;
    toDestroy.forEach((sid) => {
      store.destroy(sid, (destroyErr: any) => {
        if (!destroyErr) loggedOut++;
        done++;
        if (done === toDestroy.length) res.json({ ok: true, loggedOut });
      });
    });
  });
});

export default router;
