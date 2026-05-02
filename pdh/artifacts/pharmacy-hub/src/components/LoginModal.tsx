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

  const canClose = true;

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
            {/* Header bar — pharmacy image background, PDH logo left, title right */}
            <div className="relative overflow-hidden h-20 flex items-center px-5 gap-4">
              {/* Pharmacy background image */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: "url(/pharmacy-bg.jpg)",
                  backgroundSize: "cover",
                  backgroundPosition: "center 35%",
                }}
                aria-hidden="true"
              />
              {/* Dark gradient overlay so text stays legible */}
              <div
                className="absolute inset-0 bg-gradient-to-r from-[hsl(260,40%,15%)]/80 via-[hsl(260,40%,15%)]/65 to-[hsl(260,40%,15%)]/50"
                aria-hidden="true"
              />

              {/* Title */}
              <div className="relative z-10 flex-1 min-w-0">
                <p className="text-[11px] font-bold tracking-widest uppercase text-white/60 mb-0.5">
                  Pharmacy Dispensing Hub
                </p>
                <p className="text-xl font-bold text-white leading-tight">
                  Login
                </p>
              </div>

              {/* Close button — only when not triggered by a protected route */}
              {canClose && (
                <button
                  type="button"
                  onClick={closeLoginModal}
                  className="relative z-10 shrink-0 w-7 h-7 rounded-md bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-colors"
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

              <div className="mt-4 space-y-3">
                <p className="text-center text-xs text-muted-foreground">
                  Don't have a PIN?{" "}
                  <span className="text-foreground/60">Contact your administrator.</span>
                </p>
                <div className="border-t border-border/40" />
                <p className="text-center text-xs text-muted-foreground">
                  Forgotten PIN?{" "}
                  <span className="text-foreground/60">Contact a Senior Member to reset.</span>
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
