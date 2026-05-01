import * as React from "react";
import { Link } from "wouter";
import {
  Users,
  Plus,
  Trash2,
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  Eye,
  EyeOff,
  RefreshCw,
  UserCog,
  Crown,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Role = "superadmin" | "admin" | "basic";

interface UserRow {
  id: string;
  name: string;
  role: Role;
}

function roleBadge(role: Role) {
  if (role === "superadmin")
    return (
      <Badge className="bg-[hsl(260,40%,25%)]/10 text-[hsl(260,40%,25%)] border-[hsl(260,40%,25%)]/20 gap-1">
        <Crown className="w-3 h-3" /> Super Admin
      </Badge>
    );
  if (role === "admin")
    return (
      <Badge className="bg-primary/10 text-primary border-primary/20 gap-1">
        <ShieldCheck className="w-3 h-3" /> Admin
      </Badge>
    );
  return (
    <Badge variant="outline" className="text-muted-foreground gap-1">
      <UserCog className="w-3 h-3" /> Basic
    </Badge>
  );
}

function PinInput({
  value,
  onChange,
  placeholder,
  autoFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const [show, setShow] = React.useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        inputMode="numeric"
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 8))}
        placeholder={placeholder ?? "4–8 digit PIN"}
        className="w-full pr-10 py-2 px-3 rounded-lg border border-border bg-muted/20 text-sm font-mono tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        tabIndex={-1}
      >
        {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}

export default function Admin() {
  const { user, logout, refresh } = useAuth();
  const isSuperAdmin = user?.role === "superadmin";
  const isAdmin = user?.role === "admin" || isSuperAdmin;

  const [users, setUsers] = React.useState<UserRow[]>([]);
  const [loadingUsers, setLoadingUsers] = React.useState(true);
  const [showPins, setShowPins] = React.useState(false);
  const [pins, setPins] = React.useState<Record<string, string>>({});

  const [newName, setNewName] = React.useState("");
  const [newPin, setNewPin] = React.useState("");
  const [addError, setAddError] = React.useState("");
  const [addSuccess, setAddSuccess] = React.useState("");
  const [adding, setAdding] = React.useState(false);

  const [deleteTarget, setDeleteTarget] = React.useState<UserRow | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const [resetTarget, setResetTarget] = React.useState<UserRow | null>(null);
  const [resetPin, setResetPin] = React.useState("");
  const [resetConfirm, setResetConfirm] = React.useState("");
  const [resetError, setResetError] = React.useState("");
  const [resetting, setResetting] = React.useState(false);

  const [roleTarget, setRoleTarget] = React.useState<UserRow | null>(null);
  const [roleValue, setRoleValue] = React.useState<"admin" | "basic">("basic");
  const [roleError, setRoleError] = React.useState("");
  const [savingRole, setSavingRole] = React.useState(false);

  const [adminPin, setAdminPin] = React.useState("");
  const [adminPinConfirm, setAdminPinConfirm] = React.useState("");
  const [adminPinError, setAdminPinError] = React.useState("");
  const [adminPinSuccess, setAdminPinSuccess] = React.useState("");
  const [savingAdminPin, setSavingAdminPin] = React.useState(false);

  const [myPin, setMyPin] = React.useState("");
  const [myPinConfirm, setMyPinConfirm] = React.useState("");
  const [myPinError, setMyPinError] = React.useState("");
  const [myPinSuccess, setMyPinSuccess] = React.useState("");
  const [savingMyPin, setSavingMyPin] = React.useState(false);

  const fetchUsers = React.useCallback(async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch("/api/users", { credentials: "include" });
      if (res.ok) {
        const data: UserRow[] = await res.json();
        setUsers(data);
      }
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError("");
    setAddSuccess("");
    if (!newName.trim() || !newPin) {
      setAddError("Name and PIN are required.");
      return;
    }
    if (!/^\d{4,8}$/.test(newPin)) {
      setAddError("PIN must be 4–8 digits.");
      return;
    }
    setAdding(true);
    const res = await fetch("/api/users", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), pin: newPin }),
    });
    const data = await res.json();
    setAdding(false);
    if (!res.ok) {
      setAddError(data.error ?? "Failed to add user.");
    } else {
      setAddSuccess(`User "${data.name}" added.`);
      setNewName("");
      setNewPin("");
      fetchUsers();
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await fetch(`/api/users/${deleteTarget.id}`, {
      method: "DELETE",
      credentials: "include",
    });
    setDeleting(false);
    setDeleteTarget(null);
    if (res.ok) fetchUsers();
  };

  const handleResetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");
    if (!resetPin || !resetConfirm) {
      setResetError("Both fields are required.");
      return;
    }
    if (resetPin !== resetConfirm) {
      setResetError("PINs do not match.");
      return;
    }
    if (!/^\d{4,8}$/.test(resetPin)) {
      setResetError("PIN must be 4–8 digits.");
      return;
    }
    setResetting(true);
    const res = await fetch(`/api/users/${resetTarget!.id}/pin`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin: resetPin, confirmPin: resetConfirm }),
    });
    const data = await res.json();
    setResetting(false);
    if (!res.ok) {
      setResetError(data.error ?? "Failed to reset PIN.");
    } else {
      setResetTarget(null);
      setResetPin("");
      setResetConfirm("");
    }
  };

  const handleRoleChange = async () => {
    if (!roleTarget) return;
    setRoleError("");
    setSavingRole(true);
    const res = await fetch(`/api/users/${roleTarget.id}/role`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: roleValue }),
    });
    const data = await res.json();
    setSavingRole(false);
    if (!res.ok) {
      setRoleError(data.error ?? "Failed to update role.");
    } else {
      setRoleTarget(null);
      fetchUsers();
    }
  };

  const handleAdminPinUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminPinError("");
    setAdminPinSuccess("");
    if (!adminPin || !adminPinConfirm) {
      setAdminPinError("Both fields are required.");
      return;
    }
    if (adminPin !== adminPinConfirm) {
      setAdminPinError("PINs do not match.");
      return;
    }
    if (!/^\d{4,8}$/.test(adminPin)) {
      setAdminPinError("PIN must be 4–8 digits.");
      return;
    }
    const adminUser = users.find((u) => u.role === "admin");
    if (!adminUser) {
      setAdminPinError("No admin account found.");
      return;
    }
    setSavingAdminPin(true);
    const res = await fetch(`/api/users/${adminUser.id}/pin`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin: adminPin, confirmPin: adminPinConfirm }),
    });
    const data = await res.json();
    setSavingAdminPin(false);
    if (!res.ok) {
      setAdminPinError(data.error ?? "Failed.");
    } else {
      setAdminPinSuccess("Admin PIN updated successfully.");
      setAdminPin("");
      setAdminPinConfirm("");
    }
  };

  const handleMyPinUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMyPinError("");
    setMyPinSuccess("");
    if (!myPin || !myPinConfirm) {
      setMyPinError("Both fields are required.");
      return;
    }
    if (myPin !== myPinConfirm) {
      setMyPinError("PINs do not match.");
      return;
    }
    if (!/^\d{4,8}$/.test(myPin)) {
      setMyPinError("PIN must be 4–8 digits.");
      return;
    }
    setSavingMyPin(true);
    const res = await fetch(`/api/users/${user!.id}/pin`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin: myPin, confirmPin: myPinConfirm }),
    });
    const data = await res.json();
    setSavingMyPin(false);
    if (!res.ok) {
      setMyPinError(data.error ?? "Failed.");
    } else {
      setMyPinSuccess("Your PIN has been updated.");
      setMyPin("");
      setMyPinConfirm("");
      refresh();
    }
  };

  const staffMembers = users.filter((u) => u.role !== "superadmin");

  return (
    <div className="min-h-screen bg-[hsl(270,20%,98%)]">
      {/* Header */}
      <div className="bg-white border-b border-border/50 sticky top-0 z-10 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/">
              <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Hub
              </button>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-foreground hidden sm:block">{user?.name}</span>
            <Button size="sm" variant="outline" onClick={logout} className="gap-1.5 text-xs">
              Sign out
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Title */}
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase text-primary mb-3 bg-primary/8 px-3 py-1.5 rounded-full">
            {isSuperAdmin ? (
              <>
                <Crown className="w-3.5 h-3.5" /> Super Administrator
              </>
            ) : (
              <>
                <ShieldAlert className="w-3.5 h-3.5" /> Administrator
              </>
            )}
          </div>
          <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: "var(--font-serif)" }}>
            User Management
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Create and manage staff PINs and roles.</p>
        </div>

        {/* Add New User */}
        {isAdmin && (
          <div className="bg-white border border-border/40 rounded-2xl p-6 shadow-sm">
            <h2 className="text-[11px] font-bold tracking-widest uppercase text-muted-foreground flex items-center gap-2 mb-4">
              <Plus className="w-3.5 h-3.5" /> Add New User
            </h2>
            <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
              <Input
                value={newName}
                onChange={(e) => { setNewName(e.target.value); setAddError(""); setAddSuccess(""); }}
                placeholder="Staff name (e.g. Jane Doe)"
                className="flex-1"
              />
              <div className="w-full sm:w-44">
                <PinInput value={newPin} onChange={(v) => { setNewPin(v); setAddError(""); setAddSuccess(""); }} placeholder="4–8 digit PIN" />
              </div>
              <Button type="submit" disabled={adding} className="gap-1.5 shrink-0">
                <Plus className="w-4 h-4" />
                {adding ? "Adding…" : "Add"}
              </Button>
            </form>
            {addError && <p className="text-destructive text-xs mt-2">{addError}</p>}
            {addSuccess && <p className="text-emerald-600 text-xs mt-2 font-medium">{addSuccess}</p>}
          </div>
        )}

        {/* Staff Members */}
        <div className="bg-white border border-border/40 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[11px] font-bold tracking-widest uppercase text-muted-foreground flex items-center gap-2">
              <Users className="w-3.5 h-3.5" /> Staff Members
              {!loadingUsers && (
                <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                  {staffMembers.length}
                </span>
              )}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPins((v) => !v)}
                className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPins ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {showPins ? "Hide PINs" : "Show PINs"}
              </button>
              <button onClick={fetchUsers} className="text-muted-foreground hover:text-foreground transition-colors" title="Refresh">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {loadingUsers ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          ) : staffMembers.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">No staff members yet.</p>
          ) : (
            <div className="divide-y divide-border/50">
              {staffMembers.map((u) => {
                const canDelete = isSuperAdmin || (isAdmin && u.role === "basic" && u.id !== user?.id);
                const canResetPin = isSuperAdmin || (isAdmin && u.role === "basic");
                const canChangeRole = isSuperAdmin && u.role !== "superadmin";
                return (
                  <div key={u.id} className="flex items-center gap-3 py-3 group">
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-semibold text-sm uppercase">
                      {u.name.charAt(0)}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-foreground">{u.name}</span>
                        {roleBadge(u.role)}
                      </div>
                      {showPins && pins[u.id] && (
                        <span className="text-xs text-muted-foreground font-mono">PIN: {pins[u.id]}</span>
                      )}
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {canChangeRole && (
                        <button
                          onClick={() => {
                            setRoleTarget(u);
                            setRoleValue(u.role === "admin" ? "basic" : "admin");
                            setRoleError("");
                          }}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-[hsl(260,40%,25%)] hover:bg-[hsl(260,40%,25%)]/10 transition-colors"
                          title="Change role"
                        >
                          <ShieldCheck className="w-4 h-4" />
                        </button>
                      )}
                      {canResetPin && (
                        <button
                          onClick={() => {
                            setResetTarget(u);
                            setResetPin("");
                            setResetConfirm("");
                            setResetError("");
                          }}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                          title="Reset PIN"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => setDeleteTarget(u)}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Change My PIN */}
        <div className="bg-white border border-border/40 rounded-2xl p-6 shadow-sm">
          <h2 className="text-[11px] font-bold tracking-widest uppercase text-muted-foreground flex items-center gap-2 mb-4">
            <KeyRound className="w-3.5 h-3.5" /> Change My PIN
          </h2>
          <p className="text-xs text-muted-foreground mb-4">Update your own access PIN.</p>
          <form onSubmit={handleMyPinUpdate} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <PinInput value={myPin} onChange={(v) => { setMyPin(v); setMyPinError(""); setMyPinSuccess(""); }} placeholder="New PIN (4–8 digits)" autoFocus={false} />
              <PinInput value={myPinConfirm} onChange={(v) => { setMyPinConfirm(v); setMyPinError(""); setMyPinSuccess(""); }} placeholder="Confirm new PIN" />
            </div>
            {myPinError && <p className="text-destructive text-xs">{myPinError}</p>}
            {myPinSuccess && <p className="text-emerald-600 text-xs font-medium">{myPinSuccess}</p>}
            <Button type="submit" disabled={savingMyPin} size="sm" className="gap-1.5">
              <KeyRound className="w-3.5 h-3.5" />
              {savingMyPin ? "Saving…" : "Update My PIN"}
            </Button>
          </form>
        </div>

        {/* Change Admin PIN — superadmin only */}
        {isSuperAdmin && (
          <div className="bg-white border border-border/40 rounded-2xl p-6 shadow-sm">
            <h2 className="text-[11px] font-bold tracking-widest uppercase text-muted-foreground flex items-center gap-2 mb-1">
              <KeyRound className="w-3.5 h-3.5" /> Change Admin PIN
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
              Default admin PIN is <strong>9999</strong>. Change it on first use.
            </p>
            <form onSubmit={handleAdminPinUpdate} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <PinInput value={adminPin} onChange={(v) => { setAdminPin(v); setAdminPinError(""); setAdminPinSuccess(""); }} placeholder="New admin PIN (4–8 digits)" />
                <PinInput value={adminPinConfirm} onChange={(v) => { setAdminPinConfirm(v); setAdminPinError(""); setAdminPinSuccess(""); }} placeholder="Confirm new PIN" />
              </div>
              {adminPinError && <p className="text-destructive text-xs">{adminPinError}</p>}
              {adminPinSuccess && <p className="text-emerald-600 text-xs font-medium">{adminPinSuccess}</p>}
              <Button type="submit" disabled={savingAdminPin} size="sm" className="gap-1.5">
                <KeyRound className="w-3.5 h-3.5" />
                {savingAdminPin ? "Saving…" : "Update Admin PIN"}
              </Button>
            </form>
          </div>
        )}

        <div className="flex justify-end pb-4">
          <Button variant="outline" onClick={logout} className="gap-2 text-sm">
            Sign out
          </Button>
        </div>
      </div>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete user?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset PIN Dialog */}
      <Dialog
        open={!!resetTarget}
        onOpenChange={(o) => {
          if (!o) { setResetTarget(null); setResetPin(""); setResetConfirm(""); setResetError(""); }
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Reset PIN for {resetTarget?.name}</DialogTitle>
            <DialogDescription>Enter a new 4–8 digit PIN and confirm it.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleResetPin} className="space-y-3 mt-2">
            <PinInput value={resetPin} onChange={(v) => { setResetPin(v); setResetError(""); }} placeholder="New PIN (4–8 digits)" autoFocus />
            <PinInput value={resetConfirm} onChange={(v) => { setResetConfirm(v); setResetError(""); }} placeholder="Confirm PIN" />
            {resetError && <p className="text-destructive text-xs">{resetError}</p>}
            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setResetTarget(null)}>Cancel</Button>
              <Button type="submit" disabled={resetting}>
                {resetting ? "Saving…" : "Save PIN"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Change Role Dialog */}
      <Dialog open={!!roleTarget} onOpenChange={(o) => !o && setRoleTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Change role for {roleTarget?.name}</DialogTitle>
            <DialogDescription>Select the new role for this user.</DialogDescription>
          </DialogHeader>
          <div className="mt-2 space-y-3">
            <Select value={roleValue} onValueChange={(v) => setRoleValue(v as "admin" | "basic")}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="basic">Basic</SelectItem>
              </SelectContent>
            </Select>
            {roleError && <p className="text-destructive text-xs">{roleError}</p>}
          </div>
          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => setRoleTarget(null)}>Cancel</Button>
            <Button onClick={handleRoleChange} disabled={savingRole}>
              {savingRole ? "Saving…" : "Save Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
