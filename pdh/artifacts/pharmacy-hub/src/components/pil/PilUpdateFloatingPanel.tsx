import * as React from "react";
import { createPortal } from "react-dom";
import {
  CheckCircle,
  XCircle,
  Loader2,
  Pause,
  Play,
  X,
  ChevronUp,
  ChevronDown,
  PauseCircle,
  PlayCircle,
  RefreshCw,
  ArrowUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePilUpdate } from "@/context/PilUpdateContext";

export function PilUpdateFloatingPanel() {
  const {
    showFloating,
    panelMinimized,
    setPanelMinimized,
    setPanelDismissed,
    isRunning,
    isPaused,
    isStopped,
    isDone,
    processed,
    total,
    handleStop,
    handlePause,
    handleResume,
    handleStart,
    handleResumeAfterStop,
    notFoundIndices,
    notFoundNavIdx,
    navigateToNotFound,
    hasPrevNotFound,
    hasNextNotFound,
    scrollToTop,
  } = usePilUpdate();

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !showFloating) return null;

  return createPortal(
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 items-end">
      {panelMinimized ? (
        <button
          onClick={() => setPanelMinimized(false)}
          title="Expand panel"
          className="bg-background border border-border rounded-xl shadow-lg p-2.5 flex items-center justify-center hover:bg-muted transition-colors"
        >
          {isRunning && !isPaused ? (
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          ) : isPaused ? (
            <PauseCircle className="w-5 h-5 text-amber-500" />
          ) : isStopped ? (
            <XCircle className="w-5 h-5 text-destructive" />
          ) : (
            <CheckCircle className="w-5 h-5 text-green-600" />
          )}
          <ChevronUp className="w-3.5 h-3.5 text-muted-foreground ml-1" />
        </button>
      ) : (
        <div className="bg-background border border-border rounded-xl shadow-lg p-3 flex flex-col gap-2 min-w-[190px]">
          <div className="flex items-center justify-between gap-2 px-1 pb-2 border-b border-border mb-1">
            <div className="flex items-center gap-2 min-w-0">
              {isRunning ? (
                isPaused ? (
                  <PauseCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                ) : (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary shrink-0" />
                )
              ) : isStopped ? (
                <XCircle className="w-3.5 h-3.5 text-destructive shrink-0" />
              ) : (
                <CheckCircle className="w-3.5 h-3.5 text-green-600 shrink-0" />
              )}
              <span className="text-xs font-semibold text-foreground truncate">
                {isRunning
                  ? isPaused
                    ? `Paused ${processed + 1}/${total}`
                    : `Checking ${processed + 1}/${total}`
                  : isStopped
                    ? `Stopped ${processed}/${total}`
                    : "Complete"}
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setPanelMinimized(true)}
                title="Minimise panel"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPanelDismissed(true)}
                title="Dismiss panel"
                className="text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {isRunning && (
            <div className="flex gap-1.5 justify-center">
              <Button
                onClick={handleStop}
                size="icon"
                title="Stop"
                className="border-0 bg-destructive hover:bg-destructive/90 text-white h-8 w-8 shrink-0"
              >
                <X className="w-5 h-5" strokeWidth={3.5} />
              </Button>
              {!isPaused ? (
                <Button onClick={handlePause} size="icon" title="Pause" className="border-0 h-8 w-8 shrink-0">
                  <Pause className="w-4 h-4" fill="currentColor" />
                </Button>
              ) : (
                <Button
                  onClick={handleResume}
                  size="icon"
                  title="Resume"
                  className="border-0 bg-green-600 hover:bg-green-700 text-white h-8 w-8 shrink-0"
                >
                  <Play className="w-4 h-4" fill="currentColor" />
                </Button>
              )}
              <Button
                onClick={() => void handleStart()}
                size="icon"
                title="Re-run"
                className="border-0 bg-slate-200 hover:bg-slate-300 text-slate-700 h-8 w-8 shrink-0"
              >
                <RefreshCw className="w-4 h-4" strokeWidth={2.5} />
              </Button>
            </div>
          )}
          {isStopped && (
            <Button
              onClick={() => void handleResumeAfterStop()}
              size="sm"
              className="border-0 gap-2 w-full justify-center bg-primary/10 hover:bg-primary/20 text-primary"
            >
              <PlayCircle className="w-4 h-4" />
              Resume from {processed}
            </Button>
          )}
          {(isDone || isStopped) && (
            <Button
              onClick={() => void handleStart()}
              size="sm"
              className="border-0 gap-2 w-full justify-center bg-slate-200 hover:bg-slate-300 text-slate-700"
            >
              <RefreshCw className="w-4 h-4" strokeWidth={2.5} />
              Re-run
            </Button>
          )}

          {notFoundIndices.length > 0 && (
            <>
              <div className="text-xs text-destructive font-semibold px-1 text-center">
                {notFoundIndices.length} not found — {notFoundNavIdx + 1} / {notFoundIndices.length}
              </div>
              <Button
                onClick={() => navigateToNotFound(hasPrevNotFound ? notFoundNavIdx - 1 : 0)}
                size="sm"
                className="border-0 gap-2 w-full justify-center"
              >
                <ChevronUp className="w-4 h-4" />
                {hasPrevNotFound ? "Previous" : "Go To First"}
              </Button>
              <Button
                onClick={() => navigateToNotFound(hasNextNotFound ? notFoundNavIdx + 1 : notFoundNavIdx)}
                size="sm"
                className="border-0 gap-2 w-full justify-center"
                disabled={!hasNextNotFound}
              >
                <ChevronDown className="w-4 h-4" />
                Next not found
              </Button>
            </>
          )}

          <Button
            onClick={scrollToTop}
            size="sm"
            className="border-0 gap-2 w-full justify-center bg-teal-600 hover:bg-teal-700 text-white"
          >
            <ArrowUp className="w-4 h-4" />
            Back to top
          </Button>
        </div>
      )}
    </div>,
    document.body,
  );
}
