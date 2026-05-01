import * as React from "react";
import { useLocation } from "wouter";
import { Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

export default function Login() {
  const { login, user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [pin, setPin] = React.useState("");
  const [showPin, setShowPin] = React.useState(false);
  const [error, setError] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const reactId = React.useId();
  const maskId = `login-pdh-mask-${reactId.replace(/[:]/g, "")}`;

  React.useEffect(() => {
    if (!loading && user) {
      setLocation(user.role === "admin" || user.role === "superadmin" ? "/admin" : "/");
    }
  }, [user, loading, setLocation]);

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

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 8);
    setPin(val);
    if (error) setError("");
  };

  const pinDisplay = pin
    ? (showPin ? pin : "•".repeat(pin.length))
    : "";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[hsl(270,20%,98%)] px-4">
      {/* Decorative background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-secondary/10 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative mb-4">
            <div className="w-16 h-16 rounded-2xl bg-white border border-border/40 shadow-lg flex items-center justify-center overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 64 64" aria-hidden="true">
                <defs>
                  <mask id={maskId} maskUnits="userSpaceOnUse">
                    <rect x="0" y="0" width="64" height="64" fill="white" />
                    <text
                      x="50%"
                      y="50%"
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="black"
                      style={{ fontFamily: "var(--font-anton)", fontSize: "22px", letterSpacing: "-0.02em" }}
                    >
                      PDH
                    </text>
                  </mask>
                </defs>
                <rect x="0" y="0" width="64" height="64" fill="hsl(var(--primary))" mask={`url(#${maskId})`} />
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="none"
                  stroke="white"
                  strokeWidth="0.6"
                  style={{ fontFamily: "var(--font-anton)", fontSize: "22px", letterSpacing: "-0.02em" }}
                >
                  PDH
                </text>
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight" style={{ fontFamily: "var(--font-serif)" }}>
            Pharmacy Dispensing Hub
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Enter your PIN to continue</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-border/40 rounded-2xl shadow-xl shadow-black/5 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
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
                  onChange={handlePinChange}
                  placeholder="4–8 digit PIN"
                  autoFocus
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

              {/* PIN dots visual */}
              {pin.length > 0 && (
                <div className="flex items-center justify-center gap-2 mt-3">
                  {Array.from({ length: pin.length }).map((_, i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-primary animate-[scale-in_0.1s_ease-out]"
                    />
                  ))}
                </div>
              )}

              {error && (
                <p className="text-destructive text-xs font-medium mt-2 flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-destructive inline-block" />
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

          <p className="text-center text-xs text-muted-foreground mt-6">
            Don't have a PIN? Contact your administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
