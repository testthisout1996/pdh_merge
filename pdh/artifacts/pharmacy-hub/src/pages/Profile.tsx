import * as React from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  Users,
  Plus,
  Trash2,
  KeyRound,
  ShieldCheck,
  ArrowLeft,
  LogOut,
  Eye,
  EyeOff,
  RefreshCw,
  UserCog,
  Crown,
  User,
  Pencil,
  Search,
} from "lucide-react";
import profileHeroImg from "@assets/profile-hero.webp";
import { useAuth } from "@/context/AuthContext";
import { useInactivityTimer } from "@/hooks/useInactivityTimer";
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
  username: string;
  role: Role;
}

function roleBadge(role: Role) {
  if (role === "superadmin")
    return (
      <Badge className="bg-[hsl(260,40%,25%)]/10 text-[hsl(260,40%,25%)] border-[hsl(260,40%,25%)]/20 gap-1 text-xs">
        <Crown className="w-3 h-3" /> Super Admin
      </Badge>
    );
  if (role === "admin")
    return (
      <Badge className="bg-primary/10 text-primary border-primary/20 gap-1 text-xs">
        <ShieldCheck className="w-3 h-3" /> Admin
      </Badge>
    );
  return (
    <Badge variant="outline" className="text-muted-foreground gap-1 text-xs">
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
        className="w-full pr-10 py-2 px-3 rounded-md border border-border bg-muted/20 text-sm font-mono tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
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

function Section({
  icon,
  title,
  action,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-border/40 rounded-md p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-5">
        <h2 className="text-[11px] font-bold tracking-widest uppercase text-muted-foreground flex items-center gap-2 shrink-0">
          {icon} {title}
        </h2>
        {action && <div className="flex-1 min-w-0">{action}</div>}
      </div>
      {children}
    </div>
  );
}

export default function Profile() {
  const { user, logout, refresh } = useAuth();
  const [, setLocation] = useLocation();
  const isSuperAdmin = user?.role === "superadmin";
  const isAdmin = user?.role === "admin" || isSuperAdmin;

  // Navbar widen state — same threshold as the main site Navbar (scrollTop > 20)
  const [scrolled, setScrolled] = React.useState(false);
  const reactId = React.useId();
  const navbarMaskId = `profile-navbar-mask-${reactId.replace(/[:]/g, "")}`;

  // PIL-Search-style scroll system
  const NAVBAR_TOP_GAP = 16;
  const NAVBAR_BAR_H  = 64;
  const NAVBAR_BOTTOM = NAVBAR_TOP_GAP + NAVBAR_BAR_H; // 80px
  const GAP           = 4;
  const LOCK_TARGET_Y = NAVBAR_BOTTOM + GAP;           // 84px
  const HERO_H        = 531;
  const BLUR_MAX      = 10;
  const PARALLAX      = 0.2;

  const pageRef          = React.useRef<HTMLDivElement>(null);
  const heroWrapperRef   = React.useRef<HTMLDivElement>(null);
  const spacerRef        = React.useRef<HTMLDivElement>(null);
  const blurLayerRef     = React.useRef<HTMLDivElement>(null);
  const heroImgRef       = React.useRef<HTMLImageElement>(null);
  const badgeSentinelRef = React.useRef<HTMLDivElement>(null);
  const lockAtRef        = React.useRef<number>(0);
  const heroFixedTopRef  = React.useRef<number>(0);
  const isLockedRef      = React.useRef<boolean>(false);

  // Section refs for smooth-scroll buttons
  const pinSectionRef      = React.useRef<HTMLDivElement>(null);
  const addUserSectionRef  = React.useRef<HTMLDivElement>(null);
  const staffSectionRef    = React.useRef<HTMLDivElement>(null);

  const scrollToSection = React.useCallback((ref: React.RefObject<HTMLDivElement | null>) => {
    const page = pageRef.current;
    const el   = ref.current;
    if (!page || !el) return;
    // getBoundingClientRect gives position relative to viewport; page.getBoundingClientRect().top
    // accounts for any viewport offset, so we can compute the exact scrollTop target.
    const elTop   = el.getBoundingClientRect().top;
    const pageTop = page.getBoundingClientRect().top;
    const target  = page.scrollTop + (elTop - pageTop) - NAVBAR_BAR_H;
    page.scrollTo({ top: target, behavior: "smooth" });
  }, []);

  React.useEffect(() => {
    const page    = pageRef.current;
    const heroEl  = heroWrapperRef.current;
    const spacerEl = spacerRef.current;
    if (!page || !heroEl || !spacerEl) return;

    const onScroll = () => {
      const scrollTop = page.scrollTop;
      const sentinelEl = badgeSentinelRef.current;
      const imgEl      = heroImgRef.current;

      // Recalculate lock threshold every frame while unlocked (sentinel-based, not buttons-based)
      if (!isLockedRef.current && sentinelEl) {
        const rect      = sentinelEl.getBoundingClientRect();
        const domY      = rect.top + scrollTop;
        lockAtRef.current      = Math.max(0, domY - LOCK_TARGET_Y);
        heroFixedTopRef.current = -lockAtRef.current;
      }

      const shouldLock = lockAtRef.current > 0 && scrollTop >= lockAtRef.current;

      // Parallax — freeze at lockAt when locked
      if (imgEl) {
        const shift = Math.min(scrollTop, lockAtRef.current > 0 ? lockAtRef.current : scrollTop);
        imgEl.style.transform = `translateY(${shift * PARALLAX}px)`;
      }

      // Blur overlay ramps 0 → BLUR_MAX as scroll approaches lockAt
      const blurEl = blurLayerRef.current;
      if (blurEl) {
        const p      = lockAtRef.current > 0 ? Math.min(1, scrollTop / lockAtRef.current) : 0;
        const blurPx = (p * BLUR_MAX).toFixed(2);
        blurEl.style.backdropFilter = `blur(${blurPx}px)`;
        (blurEl.style as CSSStyleDeclaration & { webkitBackdropFilter: string }).webkitBackdropFilter = `blur(${blurPx}px)`;
        blurEl.style.opacity = String(p);
      }

      // Lock / unlock the hero imperatively (same-frame DOM write to avoid jitter)
      if (shouldLock !== isLockedRef.current) {
        isLockedRef.current = shouldLock;
        if (shouldLock) {
          heroEl.style.position = "fixed";
          heroEl.style.top      = `${heroFixedTopRef.current}px`;
          heroEl.style.left     = "0";
          heroEl.style.right    = "0";
          heroEl.style.zIndex   = "30";
          spacerEl.style.height = `${HERO_H}px`;
        } else {
          heroEl.style.position = "";
          heroEl.style.top      = "";
          heroEl.style.left     = "";
          heroEl.style.right    = "";
          heroEl.style.zIndex   = "";
          spacerEl.style.height = "0px";
        }
      }

      // Navbar widen — same threshold as the main site Navbar
      setScrolled(scrollTop > 20);
    };

    page.addEventListener("scroll", onScroll, { passive: true });
    return () => page.removeEventListener("scroll", onScroll);
  }, []);

  const { progress, secondsLeft } = useInactivityTimer(!!user, () => {
    logout().then(() => setLocation("/"));
  });
  const ringCircumference = 2 * Math.PI * 14;
  const ringColor =
    progress > 0.25 ? "hsl(260,40%,40%)" : progress > 0.083 ? "#f59e0b" : "#ef4444";

  const [users, setUsers] = React.useState<UserRow[]>([]);
  const [loadingUsers, setLoadingUsers] = React.useState(false);

  const [newName, setNewName] = React.useState("");
  const [newUsername, setNewUsername] = React.useState("");
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
  const [roleValue, setRoleValue] = React.useState<Role>("basic");
  const [roleError, setRoleError] = React.useState("");
  const [savingRole, setSavingRole] = React.useState(false);

  const [usernameTarget, setUsernameTarget] = React.useState<UserRow | null>(null);
  const [usernameValue, setUsernameValue] = React.useState("");
  const [usernameError, setUsernameError] = React.useState("");
  const [savingUsername, setSavingUsername] = React.useState(false);

  const [staffSearch, setStaffSearch] = React.useState("");

  const [myPin, setMyPin] = React.useState("");
  const [myPinConfirm, setMyPinConfirm] = React.useState("");
  const [myPinError, setMyPinError] = React.useState("");
  const [myPinSuccess, setMyPinSuccess] = React.useState("");
  const [savingMyPin, setSavingMyPin] = React.useState(false);

  const fetchUsers = React.useCallback(async () => {
    if (!isAdmin) return;
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
  }, [isAdmin]);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(""); setAddSuccess("");
    if (!newName.trim() || !newUsername.trim() || !newPin) {
      setAddError("Name, username and PIN are required.");
      return;
    }
    if (!/^[a-zA-Z]{2,8}$/.test(newUsername)) {
      setAddError("Username must be 2–8 letters only.");
      return;
    }
    if (!/^\d{4,8}$/.test(newPin)) {
      setAddError("PIN must be 4–8 digits.");
      return;
    }
    setAdding(true);
    const res = await fetch("/api/users", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), username: newUsername.trim(), pin: newPin }),
    });
    const data = await res.json();
    setAdding(false);
    if (!res.ok) { setAddError(data.error ?? "Failed to add user."); }
    else {
      setAddSuccess(`User "${data.name}" (@${data.username}) added.`);
      setNewName(""); setNewUsername(""); setNewPin("");
      fetchUsers();
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    await fetch(`/api/users/${deleteTarget.id}`, { method: "DELETE", credentials: "include" });
    setDeleting(false);
    setDeleteTarget(null);
    fetchUsers();
  };

  const handleResetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");
    if (!resetPin || !resetConfirm) { setResetError("Both fields are required."); return; }
    if (resetPin !== resetConfirm) { setResetError("PINs do not match."); return; }
    if (!/^\d{4,8}$/.test(resetPin)) { setResetError("PIN must be 4–8 digits."); return; }
    setResetting(true);
    const res = await fetch(`/api/users/${resetTarget!.id}/pin`, {
      method: "PATCH", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin: resetPin, confirmPin: resetConfirm }),
    });
    const data = await res.json();
    setResetting(false);
    if (!res.ok) { setResetError(data.error ?? "Failed."); }
    else { setResetTarget(null); setResetPin(""); setResetConfirm(""); }
  };

  const handleRoleChange = async () => {
    if (!roleTarget) return;
    setRoleError(""); setSavingRole(true);
    const res = await fetch(`/api/users/${roleTarget.id}/role`, {
      method: "PATCH", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: roleValue }),
    });
    const data = await res.json();
    setSavingRole(false);
    if (!res.ok) { setRoleError(data.error ?? "Failed."); }
    else { setRoleTarget(null); fetchUsers(); }
  };

  const handleUsernameChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setUsernameError("");
    if (!usernameValue.trim()) { setUsernameError("Username is required."); return; }
    if (!/^[a-zA-Z]{2,8}$/.test(usernameValue)) { setUsernameError("Username must be 2–8 letters only."); return; }
    setSavingUsername(true);
    const res = await fetch(`/api/users/${usernameTarget!.id}/username`, {
      method: "PATCH", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: usernameValue.trim() }),
    });
    const data = await res.json();
    setSavingUsername(false);
    if (!res.ok) { setUsernameError(data.error ?? "Failed."); }
    else { setUsernameTarget(null); setUsernameValue(""); fetchUsers(); }
  };

  const handleMyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMyPinError(""); setMyPinSuccess("");
    if (!myPin || !myPinConfirm) { setMyPinError("Both fields are required."); return; }
    if (myPin !== myPinConfirm) { setMyPinError("PINs do not match."); return; }
    if (!/^\d{4,8}$/.test(myPin)) { setMyPinError("PIN must be 4–8 digits."); return; }
    setSavingMyPin(true);
    const res = await fetch(`/api/users/${user!.id}/pin`, {
      method: "PATCH", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin: myPin, confirmPin: myPinConfirm }),
    });
    const data = await res.json();
    setSavingMyPin(false);
    if (!res.ok) { setMyPinError(data.error ?? "Failed."); }
    else { setMyPinSuccess("Your PIN has been updated."); setMyPin(""); setMyPinConfirm(""); refresh(); }
  };

  const staffMembers = (
    isSuperAdmin
      ? users.filter((u) => u.id !== user?.id)
      : users.filter((u) => u.role !== "superadmin" && u.id !== user?.id)
  )
    .sort((a, b) => a.name.localeCompare(b.name))
    .filter((u) =>
      staffSearch.trim() === "" ||
      u.name.toLowerCase().includes(staffSearch.trim().toLowerCase())
    );

  return (
    <div ref={pageRef} className="h-[100dvh] overflow-y-auto bg-[hsl(270,20%,98%)] selection:bg-primary/20">
      {/* Custom Profile navbar — same floating→full-width widen as main site (scrollTop > 20) */}
      <motion.div
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        className="fixed top-0 left-0 right-0 z-50 pointer-events-none"
      >
        <div
          className={`flex justify-center transition-all duration-300 ease-out ${
            scrolled ? "px-0 pt-0" : "px-4 md:px-6 pt-4"
          }`}
        >
          <header
            className={`pointer-events-auto relative w-full overflow-hidden transition-all duration-300 ease-out ${
              scrolled
                ? "max-w-none rounded-none border-x-0 border-t-0 border-b border-border/60 shadow-md shadow-black/5"
                : "max-w-6xl rounded-md border border-border/30 shadow-sm"
            }`}
          >
            {/* SVG background with PDH cutout */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
              <defs>
                <mask id={navbarMaskId} maskUnits="userSpaceOnUse">
                  <rect x="0" y="0" width="100%" height="100%" fill="white" />
                  <text
                    x="24" y="50%" dominantBaseline="central" fill="black"
                    style={{ fontFamily: "var(--font-anton)", fontSize: "48px", letterSpacing: "-0.02em" }}
                  >PDH</text>
                </mask>
              </defs>
              <rect x="0" y="0" width="100%" height="100%" fill="white" mask={`url(#${navbarMaskId})`} />
              <text
                x="24" y="50%" dominantBaseline="central" fill="none"
                stroke="rgba(44,27,61,0.55)" strokeWidth="1"
                style={{ fontFamily: "var(--font-anton)", fontSize: "48px", letterSpacing: "-0.02em" }}
              >PDH</text>
            </svg>

            <div className="relative z-10 grid grid-cols-[1fr_auto_1fr] items-center h-16 px-6 gap-4">
              {/* Left: PDH hover-reveal */}
              <div>
                <button
                  type="button"
                  onClick={() => setLocation("/")}
                  className="relative flex items-center group shrink-0 text-left"
                  aria-label="Pharmacy Dispensing Hub home"
                >
                  <span
                    aria-hidden="true"
                    className="leading-none tracking-tight select-none invisible"
                    style={{ fontFamily: "var(--font-anton)", fontSize: "48px" }}
                  >PDH</span>
                  <div
                    className="absolute left-full top-0 bottom-0 flex items-stretch gap-2 pl-3 pointer-events-none opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-out"
                    aria-hidden="true"
                  >
                    <span className="w-px bg-foreground/70 self-stretch" />
                    <span className="flex flex-col justify-center text-foreground text-[0.95rem] font-semibold leading-[1.15] tracking-tight whitespace-nowrap">
                      <span>Pharmacy</span>
                      <span>Dispensing Hub</span>
                    </span>
                  </div>
                </button>
              </div>

              {/* Centre: page label */}
              <span className="text-[11px] font-bold tracking-widest uppercase text-muted-foreground">
                Profile &amp; Settings
              </span>

              {/* Right: Back to Hub | divider | countdown ring | name | Sign out */}
              <div className="justify-self-end flex items-center gap-4">
                <button
                  onClick={() => setLocation("/")}
                  className="flex items-center gap-1.5 text-sm font-semibold text-foreground/70 hover:text-foreground transition-colors hidden sm:flex"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Hub
                </button>
                <div className="w-px h-5 bg-border/50 hidden sm:block" />
                <div className="relative shrink-0 w-8 h-8" title={`Auto sign-out in ${secondsLeft}s`}>
                  <svg width="32" height="32" className="absolute inset-0" style={{ transform: "rotate(-90deg)" }} aria-hidden="true">
                    <circle cx="16" cy="16" r="14" fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth="2" />
                    <circle
                      cx="16" cy="16" r="14" fill="none"
                      stroke={ringColor} strokeWidth="2"
                      strokeDasharray={ringCircumference}
                      strokeDashoffset={ringCircumference * (1 - progress)}
                      strokeLinecap="round"
                      style={{ transition: "stroke-dashoffset 0.2s linear, stroke 0.4s ease" }}
                    />
                  </svg>
                  <div className="absolute inset-[3px] rounded-full bg-primary/15 text-primary flex items-center justify-center">
                    {isSuperAdmin ? <Crown className="w-3 h-3" /> : isAdmin ? <ShieldCheck className="w-3 h-3" /> : <User className="w-3 h-3" />}
                  </div>
                </div>
                <span className="text-sm font-semibold text-foreground/80 hidden sm:block">{user?.name}</span>
                <button
                  onClick={() => logout().then(() => setLocation("/"))}
                  className="flex items-center gap-1.5 text-sm font-semibold text-foreground/70 hover:text-destructive transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign out</span>
                </button>
              </div>
            </div>
          </header>
        </div>
      </motion.div>

      {/* Blur overlay — same as PIL Search: sits above hero (z-30) below navbar (z-50), ramps with scroll */}
      <div
        ref={blurLayerRef}
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0,
          height: `${NAVBAR_BOTTOM}px`,
          zIndex: 40,
          pointerEvents: "none",
          opacity: 0,
          backdropFilter: "blur(0px)",
          WebkitBackdropFilter: "blur(0px)",
          maskImage: "linear-gradient(to bottom, black 0%, black 60%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 60%, transparent 100%)",
        } as React.CSSProperties}
      />

      {/* Hero wrapper — locked to fixed imperatively by the scroll handler */}
      <div ref={heroWrapperRef}>
      {/* Hero section — matches PIL Search hero (531px) */}
      <div className="relative w-full overflow-hidden" style={{ height: "531px" }}>
        <img
          ref={heroImgRef}
          src={profileHeroImg}
          alt="Pharmacy setting"
          className="absolute w-full object-cover object-center"
          style={{ filter: "saturate(0.9)", height: "130%", top: "-15%", willChange: "transform" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#2c1b3d]/85 via-[#2c1b3d]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2c1b3d]/50 via-transparent to-transparent" />

        <div className="relative z-10 h-full flex flex-col justify-end px-6 md:px-10 pb-10 pt-24 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            className="flex flex-col gap-5"
          >
            {/* Role badge + title + description */}
            <div>
              {/* Sentinel: navbar locks when this hits the top of the viewport */}
              <div ref={badgeSentinelRef} className="h-px w-full" aria-hidden="true" />
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase bg-white/15 text-white border border-white/25 px-3 py-1.5 rounded-full mb-3">
                {isSuperAdmin ? <Crown className="w-3.5 h-3.5" /> : isAdmin ? <ShieldCheck className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                {isSuperAdmin ? "Super Administrator" : isAdmin ? "Administrator" : "Profile"}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-2 tracking-tight">
                Profile &amp; Settings
              </h1>
              <p className="text-white/80 text-sm md:text-base leading-relaxed">
                Manage your account and {isAdmin ? "your team" : "PIN"} settings.
              </p>
            </div>

            {/* Card + buttons share a w-fit wrapper so card width = buttons row width */}
            <div className="w-fit max-w-full flex flex-col gap-5">
            {/* My Account card — white background */}
            <div className="bg-white rounded-md px-5 py-4 shadow-lg flex flex-col gap-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                My Account
              </p>

              {/* Two-column: left = identity, right = permissions */}
              <div className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-0">
                {/* LEFT — avatar + name + role */}
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-full bg-primary/15 text-primary flex items-center justify-center text-base font-bold uppercase shrink-0">
                    {user?.name.charAt(0)}
                  </div>
                  <div className="min-w-0 pt-0.5">
                    <p className="font-semibold text-foreground text-sm truncate">{user?.name}</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 rounded-full px-2 py-0.5">
                        {isSuperAdmin ? <Crown className="w-2.5 h-2.5" /> : isAdmin ? <ShieldCheck className="w-2.5 h-2.5" /> : <UserCog className="w-2.5 h-2.5" />}
                        {isSuperAdmin ? "Super Admin" : isAdmin ? "Admin" : "Basic"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* RIGHT — permissions */}
                <div className="flex flex-col gap-1.5 border-l border-border/30 pl-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Permissions
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {(isSuperAdmin ? [
                      "Full system access",
                      "Manage all users",
                      "Reset all PINs",
                      "Assign roles",
                      "Add / remove users",
                      "PIL Search",
                    ] : isAdmin ? [
                      "Manage basic users",
                      "Reset basic PINs",
                      "Add basic users",
                      "PIL Search",
                    ] : [
                      "Change own PIN",
                      "PIL Printer",
                      "Prednisolone Calc",
                    ]).map((perm) => (
                      <span
                        key={perm}
                        className="inline-flex items-center text-[10px] font-semibold tracking-wide text-foreground/70 bg-muted/60 border border-border/50 rounded-md px-2 py-0.5"
                      >
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Faint divider */}
              <div className="border-t border-border/40 -mx-5" />

              {/* Last login */}
              <div className="flex items-center gap-1.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground shrink-0">
                  Last login
                </p>
                <span className="text-[10px] text-foreground/60 font-medium">
                  {user?.lastLogin
                    ? new Date(user.lastLogin).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                    : "This session"}
                </span>
              </div>
            </div>

            {/* Role-gated quick-jump buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => scrollToSection(pinSectionRef)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-semibold bg-white/15 text-white border border-white/30 hover:bg-white/25 transition-all duration-200"
              >
                <KeyRound className="w-4 h-4" /> Change PIN
              </button>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => scrollToSection(addUserSectionRef)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-semibold bg-white/15 text-white border border-white/30 hover:bg-white/25 transition-all duration-200"
                >
                  <Plus className="w-4 h-4" /> Add User
                </button>
              )}
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => scrollToSection(staffSectionRef)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-semibold bg-white/15 text-white border border-white/30 hover:bg-white/25 transition-all duration-200"
                >
                  <Users className="w-4 h-4" /> Staff Members
                </button>
              )}
            </div>
            </div>{/* end w-fit card+buttons wrapper */}
          </motion.div>
        </div>
      </div>
      </div>{/* end heroWrapperRef */}

      {/* Spacer — height driven imperatively so it updates in the same frame as the hero lock */}
      <div ref={spacerRef} style={{ height: 0 }} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-8 space-y-6">
        {/* Change my PIN */}
        <div ref={pinSectionRef}>
        <Section icon={<KeyRound className="w-3.5 h-3.5" />} title="Change My PIN">
          <form onSubmit={handleMyPin} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <PinInput value={myPin} onChange={(v) => { setMyPin(v); setMyPinError(""); setMyPinSuccess(""); }} placeholder="New PIN (4–8 digits)" />
              <PinInput value={myPinConfirm} onChange={(v) => { setMyPinConfirm(v); setMyPinError(""); setMyPinSuccess(""); }} placeholder="Confirm new PIN" />
            </div>
            {myPinError && <p className="text-destructive text-xs">{myPinError}</p>}
            {myPinSuccess && <p className="text-emerald-600 text-xs font-medium">{myPinSuccess}</p>}
            <Button type="submit" disabled={savingMyPin} size="sm" className="gap-1.5">
              <KeyRound className="w-3.5 h-3.5" />
              {savingMyPin ? "Saving…" : "Update PIN"}
            </Button>
          </form>
        </Section>
        </div>

        {/* Admin+: Add new user */}
        {isAdmin && (
          <div ref={addUserSectionRef}>
          <Section icon={<Plus className="w-3.5 h-3.5" />} title="Add New User">
            <form onSubmit={handleAdd} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  value={newName}
                  onChange={(e) => { setNewName(e.target.value); setAddError(""); setAddSuccess(""); }}
                  placeholder="Full name (e.g. Jane Doe)"
                  className="flex-1"
                />
                <Input
                  value={newUsername}
                  onChange={(e) => {
                    setNewUsername(e.target.value.replace(/[^a-zA-Z]/g, "").slice(0, 8).toUpperCase());
                    setAddError(""); setAddSuccess("");
                  }}
                  placeholder="USERNAME"
                  className="w-full sm:w-36 font-mono tracking-widest uppercase"
                  autoCapitalize="characters"
                  spellCheck={false}
                />
                <div className="w-full sm:w-44">
                  <PinInput value={newPin} onChange={(v) => { setNewPin(v); setAddError(""); setAddSuccess(""); }} placeholder="4–8 digit PIN" />
                </div>
                <Button type="submit" disabled={adding} className="gap-1.5 shrink-0">
                  <Plus className="w-4 h-4" /> {adding ? "Adding…" : "Add"}
                </Button>
              </div>
            </form>
            {addError && <p className="text-destructive text-xs mt-2">{addError}</p>}
            {addSuccess && <p className="text-emerald-600 text-xs mt-2 font-medium">{addSuccess}</p>}
          </Section>
          </div>
        )}

        {/* Admin+: Staff members list */}
        {isAdmin && (
          <div ref={staffSectionRef}>
          <Section
            icon={<Users className="w-3.5 h-3.5" />}
            title="Staff Members"
            action={
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={staffSearch}
                  onChange={(e) => setStaffSearch(e.target.value)}
                  placeholder="Search by name…"
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-border bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-colors"
                />
              </div>
            }
          >
            <div className="flex items-center justify-between mb-4 -mt-1">
              <span className="text-xs text-muted-foreground">
                {staffSearch.trim()
                  ? `${staffMembers.length} result${staffMembers.length !== 1 ? "s" : ""}`
                  : `${staffMembers.length} member${staffMembers.length !== 1 ? "s" : ""}`}
              </span>
              <button onClick={fetchUsers} className="text-muted-foreground hover:text-foreground transition-colors" title="Refresh">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {loadingUsers ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              </div>
            ) : staffMembers.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">
                {staffSearch.trim() ? `No members match "${staffSearch}".` : "No other members yet."}
              </p>
            ) : (
              <div className="divide-y divide-border/50">
                {staffMembers.map((u) => {
                  const canDelete = isSuperAdmin || (isAdmin && u.role === "basic" && u.id !== user?.id);
                  const canResetPin = isSuperAdmin || (isAdmin && u.role === "basic");
                  const canChangeRole = isSuperAdmin;
                  const canEditUsername = isSuperAdmin || (isAdmin && u.role === "basic");
                  return (
                    <div key={u.id} className="flex items-center gap-3 py-3 group">
                      <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-semibold text-sm uppercase">
                        {u.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-foreground">{u.name}</span>
                          {roleBadge(u.role)}
                        </div>
                        <span className="text-xs text-muted-foreground font-mono tracking-widest">@{u.username}</span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {canEditUsername && (
                          <button
                            onClick={() => { setUsernameTarget(u); setUsernameValue(u.username); setUsernameError(""); }}
                            className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                            title="Edit username"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        )}
                        {canChangeRole && (
                          <button
                            onClick={() => {
                              setRoleTarget(u);
                              setRoleValue(u.role === "superadmin" ? "admin" : u.role === "admin" ? "basic" : "admin");
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
                            onClick={() => { setResetTarget(u); setResetPin(""); setResetConfirm(""); setResetError(""); }}
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
          </Section>
          </div>
        )}

      </div>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete user?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.name}</strong>{" "}
              (@{deleteTarget?.username})? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>{deleting ? "Deleting…" : "Delete"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset PIN Dialog */}
      <Dialog open={!!resetTarget} onOpenChange={(o) => { if (!o) { setResetTarget(null); setResetPin(""); setResetConfirm(""); setResetError(""); } }}>
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
              <Button type="submit" disabled={resetting}>{resetting ? "Saving…" : "Save PIN"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Username Dialog */}
      <Dialog open={!!usernameTarget} onOpenChange={(o) => { if (!o) { setUsernameTarget(null); setUsernameValue(""); setUsernameError(""); } }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit username for {usernameTarget?.name}</DialogTitle>
            <DialogDescription>Enter a new username (2–8 letters). It will be stored in capitals.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUsernameChange} className="space-y-3 mt-2">
            <Input
              value={usernameValue}
              onChange={(e) => {
                setUsernameValue(e.target.value.replace(/[^a-zA-Z]/g, "").slice(0, 8).toUpperCase());
                setUsernameError("");
              }}
              placeholder="NEW USERNAME"
              className="font-mono tracking-widest uppercase text-center"
              autoCapitalize="characters"
              spellCheck={false}
              autoFocus
            />
            {usernameError && <p className="text-destructive text-xs">{usernameError}</p>}
            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setUsernameTarget(null)}>Cancel</Button>
              <Button type="submit" disabled={savingUsername}>{savingUsername ? "Saving…" : "Save Username"}</Button>
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
            <Select value={roleValue} onValueChange={(v) => setRoleValue(v as Role)}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="superadmin">Super Admin</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="basic">Basic</SelectItem>
              </SelectContent>
            </Select>
            {roleError && <p className="text-destructive text-xs">{roleError}</p>}
          </div>
          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => setRoleTarget(null)}>Cancel</Button>
            <Button onClick={handleRoleChange} disabled={savingRole}>{savingRole ? "Saving…" : "Save Role"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
