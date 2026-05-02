import * as React from "react";

const TIMEOUT_MS = 60_000;

export function useInactivityTimer(
  active: boolean,
  onTimeout: () => void
): { progress: number; secondsLeft: number } {
  const [progress, setProgress] = React.useState(1);
  const deadlineRef = React.useRef(Date.now() + TIMEOUT_MS);
  const firedRef = React.useRef(false);
  const onTimeoutRef = React.useRef(onTimeout);
  onTimeoutRef.current = onTimeout;

  React.useEffect(() => {
    if (!active) {
      setProgress(1);
      firedRef.current = false;
      return;
    }

    deadlineRef.current = Date.now() + TIMEOUT_MS;
    firedRef.current = false;

    const handleActivity = () => {
      deadlineRef.current = Date.now() + TIMEOUT_MS;
      firedRef.current = false;
    };

    const events = ["click", "keydown", "touchstart"] as const;
    events.forEach((e) => window.addEventListener(e, handleActivity, { passive: true }));

    const interval = setInterval(() => {
      const remaining = deadlineRef.current - Date.now();
      const p = Math.max(0, Math.min(1, remaining / TIMEOUT_MS));
      setProgress(p);
      if (remaining <= 0 && !firedRef.current) {
        firedRef.current = true;
        onTimeoutRef.current();
      }
    }, 200);

    return () => {
      events.forEach((e) => window.removeEventListener(e, handleActivity));
      clearInterval(interval);
    };
  }, [active]);

  return { progress, secondsLeft: Math.ceil(progress * (TIMEOUT_MS / 1000)) };
}
