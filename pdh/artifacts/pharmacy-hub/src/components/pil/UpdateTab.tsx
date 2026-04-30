import * as React from "react";
import {
  Upload,
  ClipboardPaste,
  Play,
  Pause,
  X,
  Download,
  CheckCircle,
  XCircle,
  Loader2,
  FileText,
  RefreshCw,
  Copy,
  Check,
  ChevronRight,
  PauseCircle,
  PlayCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { usePilUpdate } from "@/context/PilUpdateContext";

const EXAMPLE_TEXT = `Aspirin 75mg Gastro-Resistant Tablets [GENERIC]
Aspirin 75mg Tablets [GENERIC]
Paracetamol 500mg Tablets [GENERIC]
Ibuprofen 400mg Tablets [GENERIC]
Amoxicillin 500mg Capsules [GENERIC]
Atorvastatin 20mg Tablets [GENERIC]`;

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = React.useState(false);
  const handleCopy = () => {
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded text-xs"
      title={label ?? "Copy"}
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
      {label && <span>{copied ? "Copied!" : label}</span>}
    </button>
  );
}

export default function UpdateTab() {
  const {
    inputText,
    setInputText,
    inputFormat,
    items,
    isRunning,
    isPaused,
    processed,
    total,
    found,
    unchanged,
    notFound,
    progressPct,
    isDone,
    isStopped,
    updatedJs,
    notFoundIndices,
    notFoundNavIdx,
    navigateToNotFound,
    hasPrevNotFound,
    hasNextNotFound,
    handleStart,
    handleResumeAfterStop,
    handleStop,
    handlePause,
    handleResume,
    handleExportTxt,
    handleExportJson,
    handleExportJs,
    setControlsInView,
  } = usePilUpdate();

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const controlsRef = React.useRef<HTMLDivElement>(null);

  // Track whether the in-page controls are visible. When the UpdateTab
  // unmounts (e.g. user navigates away), reset to false so the floating
  // panel can show.
  React.useEffect(() => {
    const el = controlsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setControlsInView(entry.isIntersecting),
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      setControlsInView(false);
    };
  }, [setControlsInView]);

  const handleFileUpload = React.useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setInputText(text);
    };
    reader.readAsText(file);
  }, [setInputText]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground tracking-tight mb-1">Update PIL Links</h2>
        <p className="text-muted-foreground text-sm">
          Paste or upload your medication list to retrieve the latest Patient Information Leaflet links from MHRA.
          Accepts plain text (one per line), JSON arrays, or a{" "}
          <code className="bg-muted px-1 py-0.5 rounded font-mono text-xs">medicationNames.js</code> file.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <ClipboardPaste className="w-4 h-4 text-primary" />
              Paste your list
            </CardTitle>
            <CardDescription className="text-xs">
              Accepts plain text (<code className="bg-muted px-1 font-mono">Medication Name [GENERIC]</code>),
              optionally with existing URLs (<code className="bg-muted px-1 font-mono">Medication Name [GENERIC] | https://...</code>) to detect unchanged links,
              or paste your full <code className="bg-muted px-1 font-mono">medicationNames.js</code> file — format is detected automatically.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <Textarea
              className="min-h-[180px] font-mono text-xs resize-none border-border bg-background"
              placeholder={EXAMPLE_TEXT}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              data-testid="textarea-medication-list"
              disabled={isRunning}
            />
            <button
              className="text-xs text-muted-foreground hover:text-foreground mt-2 underline"
              onClick={() => setInputText(EXAMPLE_TEXT)}
              disabled={isRunning}
            >
              Load example
            </button>
          </CardContent>
        </Card>

        <Card
          className="border-border/80 shadow-sm border-dashed"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Upload className="w-4 h-4 text-primary" />
              Upload file
            </CardTitle>
            <CardDescription className="text-xs">
              Accepts .txt, .js, or .json files. Drag and drop or click to browse.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="flex flex-col items-center justify-center gap-3 py-8 border-2 border-dashed border-border rounded-md bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileText className="w-10 h-10 text-muted-foreground/50" />
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">Drop file here</p>
                <p className="text-xs text-muted-foreground mt-1">or click to browse (.txt, .js, .json)</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".txt,.js,.json,text/plain,text/javascript,application/javascript,application/json"
                onChange={handleFileChange}
                data-testid="input-file-upload"
                disabled={isRunning}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div ref={controlsRef} className="flex flex-wrap items-center gap-3">
        {!isRunning ? (
          <>
            <Button
              onClick={() => void handleStart()}
              disabled={!inputText.trim() || isRunning}
              className="gap-2 shadow-sm"
              data-testid="button-start-update"
            >
              <Play className="w-4 h-4" />
              Check &amp; Update Links
            </Button>
            {isStopped && (
              <Button
                onClick={() => void handleResumeAfterStop()}
                variant="outline"
                className="gap-2 border-primary/40 text-primary"
                data-testid="button-resume-after-stop"
              >
                <PlayCircle className="w-4 h-4" />
                Resume from {processed}
              </Button>
            )}
          </>
        ) : (
          <>
            <Button
              onClick={handleStop}
              variant="outline"
              className="gap-2"
              data-testid="button-stop-update"
            >
              <XCircle className="w-4 h-4" />
              Stop
            </Button>
            {!isPaused ? (
              <Button
                onClick={handlePause}
                variant="outline"
                className="gap-2"
                data-testid="button-pause-update"
              >
                <PauseCircle className="w-4 h-4" />
                Pause
              </Button>
            ) : (
              <Button
                onClick={handleResume}
                variant="outline"
                className="gap-2 border-primary/40 text-primary"
                data-testid="button-resume-update"
              >
                <PlayCircle className="w-4 h-4" />
                Resume
              </Button>
            )}
          </>
        )}

        {isDone && (
          <>
            <Button
              onClick={() => void handleStart()}
              variant="outline"
              className="gap-2"
              data-testid="button-rerun-update"
            >
              <RefreshCw className="w-4 h-4" />
              Re-run
            </Button>
            {inputFormat === "js" && (
              <Button
                onClick={handleExportJs}
                variant="outline"
                className="gap-2"
                data-testid="button-export-js"
              >
                <Download className="w-4 h-4" />
                Export .js
              </Button>
            )}
            <Button
              onClick={handleExportTxt}
              variant="outline"
              className="gap-2"
              data-testid="button-export-txt"
            >
              <Download className="w-4 h-4" />
              Export .txt
            </Button>
            <Button
              onClick={handleExportJson}
              variant="outline"
              className="gap-2"
              data-testid="button-export-json"
            >
              <Download className="w-4 h-4" />
              Export .json
            </Button>
          </>
        )}
      </div>

      {(isRunning || isDone) && notFoundIndices.length > 0 && (
        <Card className="border-destructive/30 bg-destructive/5 shadow-sm">
          <CardContent className="p-3 flex items-center gap-3 flex-wrap">
            <span className="text-sm font-semibold text-destructive flex items-center gap-1.5">
              <XCircle className="w-4 h-4" />
              Medications not found: {notFoundIndices.length}
            </span>
            <div className="flex items-center gap-2 ml-auto">
              <Button
                onClick={() => navigateToNotFound(0)}
                variant="outline"
                size="sm"
                className="gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10"
              >
                <ChevronRight className="w-3.5 h-3.5" />
                Jump to First
              </Button>
              <Button
                onClick={() => navigateToNotFound(hasPrevNotFound ? notFoundNavIdx - 1 : 0)}
                variant="outline"
                size="sm"
                className="gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10"
                disabled={!hasPrevNotFound}
              >
                ← Previous
              </Button>
              <Button
                onClick={() => navigateToNotFound(hasNextNotFound ? notFoundNavIdx + 1 : notFoundNavIdx)}
                variant="outline"
                size="sm"
                className="gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10"
                disabled={!hasNextNotFound}
              >
                Next →
              </Button>
              <span className="text-xs text-muted-foreground tabular-nums">
                {notFoundNavIdx + 1} / {notFoundIndices.length}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {(isRunning || isDone) && total > 0 && (
        <Card className="border-border/80 shadow-sm">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground font-medium">
                {isRunning ? (
                  isPaused ? (
                    <span className="flex items-center gap-2">
                      <PauseCircle className="w-4 h-4 text-amber-500" />
                      Paused at {processed + 1} of {total}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      Checking {processed + 1} of {total}...
                    </span>
                  )
                ) : (
                  "Complete"
                )}
              </span>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-green-700">
                  <CheckCircle className="w-3.5 h-3.5" />
                  {found} updated
                </span>
                {unchanged > 0 && (
                  <span className="flex items-center gap-1 text-blue-600">
                    <CheckCircle className="w-3.5 h-3.5" />
                    {unchanged} unchanged
                  </span>
                )}
                <span className="flex items-center gap-1 text-destructive">
                  <XCircle className="w-3.5 h-3.5" />
                  {notFound} not found
                </span>
              </div>
            </div>
            <Progress value={progressPct} className="h-2" />
          </CardContent>
        </Card>
      )}

      {isDone && inputFormat === "js" && updatedJs && (
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Updated JS Output</CardTitle>
              <CopyButton text={updatedJs} label="Copy all" />
            </div>
            <CardDescription className="text-xs">
              Same format as your input — only the URLs have been updated. Commented-out entries are preserved unchanged.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <Textarea
              className="min-h-[240px] font-mono text-xs resize-y border-border bg-muted/30"
              value={updatedJs}
              readOnly
            />
          </CardContent>
        </Card>
      )}

      {items.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-foreground">Results</h3>
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm table-fixed">
                <colgroup>
                  <col className="w-10" />
                  {inputFormat === "js" && <col className="w-20" />}
                  <col className="w-72" />
                  <col className="w-32" />
                  <col className="w-28" />
                  <col />
                </colgroup>
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="text-left px-4 py-3 font-semibold text-foreground/80 text-xs uppercase tracking-wider">#</th>
                    {inputFormat === "js" && (
                      <th className="text-left px-4 py-3 font-semibold text-foreground/80 text-xs uppercase tracking-wider">Key</th>
                    )}
                    <th className="text-left px-4 py-3 font-semibold text-foreground/80 text-xs uppercase tracking-wider">Medication</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground/80 text-xs uppercase tracking-wider">Type</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground/80 text-xs uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground/80 text-xs uppercase tracking-wider">PIL Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {items.map((item, idx) => {
                    const isNotFound = item.status === "not_found" || item.status === "error";
                    return (
                      <tr
                        key={item.id}
                        id={`med-row-${idx}`}
                        className={`transition-colors ${
                          isNotFound
                            ? "bg-red-100 hover:bg-red-200"
                            : item.defaultedToGeneric
                              ? "bg-orange-200 hover:bg-orange-300"
                              : "hover:bg-muted/20"
                        }`}
                        data-testid={`row-medication-${idx}`}
                      >
                        <td className="px-4 py-3 text-muted-foreground text-xs">{idx + 1}</td>
                        {inputFormat === "js" && (
                          <td className="px-4 py-3 text-muted-foreground text-xs font-mono">{item.jsKey}</td>
                        )}
                        <td className="px-4 py-3">
                          <div className="font-medium text-foreground leading-tight">{item.searchTerm}</div>
                          {item.productName && item.productName !== item.searchTerm.toUpperCase() && (
                            <div className="text-xs text-muted-foreground mt-0.5">{item.productName}</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant="outline"
                            className={`text-xs whitespace-normal break-words inline-block max-w-full ${
                              item.brand === "GENERIC"
                                ? "border-blue-200 text-blue-700 bg-blue-50"
                                : "border-purple-200 text-purple-700 bg-purple-50"
                            }`}
                          >
                            {item.brand === "GENERIC" ? "Generic" : item.brand}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          {item.status === "pending" && (
                            <span className="text-xs text-muted-foreground">Waiting</span>
                          )}
                          {item.status === "checking" && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              Verifying
                            </span>
                          )}
                          {item.status === "unchanged" && (
                            <span className="flex items-center gap-1 text-xs text-blue-600 font-medium">
                              <CheckCircle className="w-3.5 h-3.5" />
                              URL valid
                            </span>
                          )}
                          {item.status === "searching" && (
                            <span className="flex items-center gap-1 text-xs text-primary">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              Searching
                            </span>
                          )}
                          {item.status === "found" && (
                            <span className="flex items-center gap-1 text-xs text-green-700 font-medium">
                              <CheckCircle className="w-3.5 h-3.5" />
                              Updated
                            </span>
                          )}
                          {item.status === "not_found" && (
                            <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                              <XCircle className="w-3.5 h-3.5" />
                              Not found
                            </span>
                          )}
                          {item.status === "error" && (
                            <span className="flex items-center gap-1 text-xs text-destructive font-medium">
                              <XCircle className="w-3.5 h-3.5" />
                              Error
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {item.documentUrl ? (
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-2">
                                <a
                                  href={item.documentUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:text-primary/80 underline text-xs font-mono truncate max-w-xs block"
                                  title={item.documentUrl}
                                  data-testid={`link-pil-${idx}`}
                                >
                                  {item.documentUrl.split("/").pop()}
                                </a>
                                <CopyButton text={item.documentUrl} />
                              </div>
                              {item.defaultedToGeneric && (
                                <span className="text-xs text-muted-foreground italic">
                                  (Defaulted to GENERIC Leaflet)
                                </span>
                              )}
                            </div>
                          ) : item.status !== "pending" && item.status !== "searching" ? (
                            <span className="text-xs text-muted-foreground italic">No PIL found</span>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
