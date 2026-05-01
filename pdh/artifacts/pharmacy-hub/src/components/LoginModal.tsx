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
          transition={{ duration: 0.22 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          onClick={canClose ? closeLoginModal : undefined}
        >
          {/* Background image */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "url(/pharmacy-bg.jpg)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            aria-hidden="true"
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-[hsl(260,40%,15%)]/70 backdrop-blur-[2px]" aria-hidden="true" />

          {/* Modal card — styled to match the navbar aesthetic */}
          <motion.div
            key="login-modal-card"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-white/20 shadow-2xl shadow-black/40"
          >
            {/* Image strip at top of card */}
            <div className="relative h-36 overflow-hidden">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: "url(/pharmacy-bg.jpg)",
                  backgroundSize: "cover",
                  backgroundPosition: "center 30%",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[hsl(260,40%,15%)]/30 to-[hsl(260,40%,15%)]/70" />

              {/* PDH Logo — same SVG cutout style as the navbar */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <div className="relative w-[72px] h-[72px] overflow-hidden rounded-xl border border-white/20 shadow-lg">
                  <svg className="w-full h-full" viewBox="0 0 72 72" aria-hidden="true">
                    <defs>
                      <mask id={maskId} maskUnits="userSpaceOnUse">
                        <rect x="0" y="0" width="72" height="72" fill="white" />
                        <text
                          x="50%"
                          y="50%"
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill="black"
                          style={{ fontFamily: "var(--font-anton)", fontSize: "26px", letterSpacing: "-0.02em" }}
                        >
                          PDH
                        </text>
                      </mask>
                    </defs>
                    <rect x="0" y="0" width="72" height="72" fill="white" mask={`url(#${maskId})`} />
                    <text
                      x="50%"
                      y="50%"
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="none"
                      stroke="rgba(44,27,61,0.55)"
                      strokeWidth="0.8"
                      style={{ fontFamily: "var(--font-anton)", fontSize: "26px", letterSpacing: "-0.02em" }}
                    >
                      PDH
                    </text>
                  </svg>
                </div>
              </div>

              {/* Close button — only when not from a protected route */}
              {canClose && (
                <button
                  type="button"
                  onClick={closeLoginModal}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/30 text-white hover:bg-black/50 flex items-center justify-center transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Card body — white, matching navbar radius + border feel */}
            <div className="bg-white px-8 py-7">
              <div className="text-center mb-6">
                <h2
                  className="text-xl font-bold text-foreground tracking-tight"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  Pharmacy Dispensing Hub
                </h2>
                <p className="text-xs text-muted-foreground mt-1">Enter your PIN to continue</p>
              </div>

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
                      className={`w-full pl-10 pr-12 py-3 rounded-xl border text-center text-lg tracking-[0.3em] font-mono transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 ${
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

                  {/* PIN dots */}
                  {pin.length > 0 && (
                    <div className="flex items-center justify-center gap-1.5 mt-3">
                      {Array.from({ length: pin.length }).map((_, i) => (
                        <div key={i} className="w-2 h-2 rounded-full bg-primary" />
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
                  className="w-full h-11 rounded-xl font-semibold text-sm tracking-wide gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  {submitting ? "Checking…" : "Unlock"}
                </Button>
              </form>

              <p className="text-center text-xs text-muted-foreground mt-5">
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
