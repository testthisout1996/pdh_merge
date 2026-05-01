import * as React from "react";
import { useLocation } from "wouter";
import { Lock, Eye, EyeOff, ShieldCheck, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

export function LoginModal() {
  const { loginModalOpen, closeLoginModal, login, postLoginPath, user } = useAuth();
  const [, setLocation] = useLocation();
  const [pin, setPin] = React.useState("");
  const [showPin, setShowPin] = React.useState(false);
  const [error, setError] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const reactId = React.useId();
  const maskId = `modal-pdh-mask-${reactId.replace(/[:]/g, "")}`;

  React.useEffect(() => {
    if (loginModalOpen) {
      setPin("");
      setError("");
      setShowPin(false);
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [loginModalOpen]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && loginModalOpen && !postLoginPath) {
        closeLoginModal();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [loginModalOpen, closeLoginModal, postLoginPath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) {
      setError("Please enter your PIN.");
      return;
    }
    setSubmitting(true);
    setError("");
    const result = await login(pin.trim());
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      setPin("");
      inputRef.current?.focus();
    }
  };

  React.useEffect(() => {
    if (user && loginModalOpen) {
      closeLoginModal();
      if (postLoginPath && postLoginPath !== "/login") {
        setLocation(postLoginPath);
      } else if (user.role === "admin" || user.role === "superadmin") {
        setLocation("/profile");
      }
    }
  }, [user, loginModalOpen, postLoginPath, closeLoginModal, setLocation]);

  const canClose = !postLoginPath;

  return (
    <AnimatePresence>
      {loginModalOpen && (
        <motion.div
          key="login-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/55"
          onClick={canClose ? closeLoginModal : undefined}
        >
          {/* Modal card — matches navbar aesthetic exactly */}
          <motion.div
            key="login-modal-card"
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 6 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm overflow-hidden rounded-md border border-border/30 shadow-md bg-white"
          >
            {/* Header bar — PDH logo left, title right, same look as navbar */}
            <div className="relative overflow-hidden h-16 flex items-center px-5 gap-4 border-b border-border/20">
              {/* SVG background — white fill with PDH punched through (same technique as navbar) */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                aria-hidden="true"
              >
                <defs>
                  <mask id={maskId} maskUnits="userSpaceOnUse">
                    <rect x="0" y="0" width="100%" height="100%" fill="white" />
                    <text
                      x="20"
                      y="50%"
                      dominantBaseline="central"
                      fill="black"
                      style={{
                        fontFamily: "var(--font-anton)",
                        fontSize: "48px",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      PDH
                    </text>
                  </mask>
                </defs>
                {/* White panel with PDH cutout */}
                <rect
                  x="0"
                  y="0"
                  width="100%"
                  height="100%"
                  fill="white"
                  mask={`url(#${maskId})`}
                />
                {/* Thin outline on the PDH text so it stays legible */}
                <text
                  x="20"
                  y="50%"
                  dominantBaseline="central"
                  fill="none"
                  stroke="rgba(44,27,61,0.45)"
                  strokeWidth="0.8"
                  style={{
                    fontFamily: "var(--font-anton)",
                    fontSize: "48px",
                    letterSpacing: "-0.02em",
                  }}
                >
                  PDH
                </text>
              </svg>

              {/* Invisible spacer that matches the PDH text width so content flows to its right */}
              <div className="relative z-10 shrink-0 w-[72px]" aria-hidden="true" />

              {/* Title + subtitle to the right of the logo */}
              <div className="relative z-10 flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground leading-tight truncate">
                  Pharmacy Dispensing Hub
                </p>
                <p className="text-[11px] text-muted-foreground">Staff access</p>
              </div>

              {/* Close button — only when not triggered by a protected route */}
              {canClose && (
                <button
                  type="button"
                  onClick={closeLoginModal}
                  className="relative z-10 shrink-0 w-7 h-7 rounded-md bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
                  aria-label="Close"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Body */}
            <div className="px-6 py-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold tracking-widest uppercase text-muted-foreground mb-2">
                    Access PIN
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      ref={inputRef}
                      type={showPin ? "text" : "password"}
                      inputMode="numeric"
                      autoComplete="current-password"
                      value={pin}
                      onChange={(e) => {
                        setPin(e.target.value.replace(/\D/g, "").slice(0, 8));
                        if (error) setError("");
                      }}
                      placeholder="4–8 digit PIN"
                      className={`w-full pl-10 pr-12 py-2.5 rounded-md border text-center text-base tracking-[0.3em] font-mono transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                        error
                          ? "border-destructive bg-destructive/5 focus:ring-destructive/20"
                          : "border-border bg-muted/30 focus:border-primary/50"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                      aria-label={showPin ? "Hide PIN" : "Show PIN"}
                    >
                      {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* PIN entry dots */}
                  {pin.length > 0 && (
                    <div className="flex items-center justify-center gap-1.5 mt-3">
                      {Array.from({ length: pin.length }).map((_, i) => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary" />
                      ))}
                    </div>
                  )}

                  {error && (
                    <p className="text-destructive text-xs font-medium mt-2 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-destructive inline-block shrink-0" />
                      {error}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={submitting || pin.length < 4}
                  className="w-full h-10 rounded-md font-semibold text-sm tracking-wide gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  {submitting ? "Checking…" : "Unlock"}
                </Button>
              </form>

              <p className="text-center text-xs text-muted-foreground mt-4">
                Don't have a PIN?{" "}
                <span className="text-foreground/60">Contact your administrator.</span>
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
