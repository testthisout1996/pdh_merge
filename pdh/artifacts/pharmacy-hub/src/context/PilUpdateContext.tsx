import * as React from "react";
import { parseNameAndBrand, buildSearchQuery, pickBestResult, extractParenthetical } from "@/lib/pilUtils";

export interface MedicationItem {
  id: string;
  raw: string;
  searchTerm: string;
  brand: string;
  status: "pending" | "checking" | "unchanged" | "searching" | "found" | "not_found" | "error";
  documentUrl?: string;
  productName?: string;
  plNumber?: string[];
  title?: string;
  jsKey?: string;
  originalUrl?: string;
  existingFullUrl?: string;
  defaultedToGeneric?: boolean;
}

export interface SearchApiResult {
  results: Array<{
    documentUrl: string;
    productName: string;
    plNumber: string[];
    title: string;
    fileName?: string;
  }>;
  totalCount: number;
}

export type InputFormat = "text" | "json" | "js";

function joinUrlParts(base: string, pathPart: string): string {
  const trimmedBase = base.trim();
  const trimmedPath = pathPart.trim();
  if (/^https?:\/\//i.test(trimmedPath)) return trimmedPath;
  if (!trimmedBase) return trimmedPath;
  return `${trimmedBase.replace(/\/+$/, "")}/${trimmedPath.replace(/^\/+/, "")}`;
}

function normalizePilUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  try {
    const parsed = new URL(url.trim());
    const pathname = decodeURIComponent(parsed.pathname).replace(/\/+$/, "");
    return `${parsed.origin.toLowerCase()}${pathname}`;
  } catch {
    return url.trim().replace(/\/+$/, "");
  }
}

function getPilDocumentKey(url: string | undefined): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (!trimmed) return undefined;
  try {
    const parsed = new URL(trimmed);
    const parts = decodeURIComponent(parsed.pathname).split("/").map(p => p.trim()).filter(Boolean);
    return parts.at(-1)?.toLowerCase();
  } catch {
    const pathOnly = trimmed.split(/[?#]/)[0];
    const parts = decodeURIComponent(pathOnly).split("/").map(p => p.trim()).filter(Boolean);
    return parts.at(-1)?.toLowerCase();
  }
}

function isSamePilUrl(a: string | undefined, b: string | undefined): boolean {
  const na = normalizePilUrl(a);
  const nb = normalizePilUrl(b);
  if (na && nb && na === nb) return true;
  const ka = getPilDocumentKey(a);
  const kb = getPilDocumentKey(b);
  return !!ka && ka.length > 8 && ka === kb;
}

function matchesExistingPilDocument(
  newUrl: string | undefined,
  item: Pick<MedicationItem, "existingFullUrl" | "originalUrl">,
): boolean {
  return isSamePilUrl(newUrl, item.existingFullUrl) || isSamePilUrl(newUrl, item.originalUrl);
}

function parseTextFormat(text: string): Pick<MedicationItem, "raw" | "searchTerm" | "brand" | "existingFullUrl">[] {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const results: Pick<MedicationItem, "raw" | "searchTerm" | "brand" | "existingFullUrl">[] = [];
  for (const line of lines) {
    if (line.startsWith("#") || line.startsWith("//")) continue;
    const pipeIdx = line.indexOf(" | ");
    const namePart = pipeIdx !== -1 ? line.slice(0, pipeIdx).trim() : line;
    const existingFullUrl = pipeIdx !== -1 ? line.slice(pipeIdx + 3).trim() || undefined : undefined;
    const { searchTerm, brand } = parseNameAndBrand(namePart);
    results.push({ raw: namePart, searchTerm, brand, existingFullUrl });
  }
  return results;
}

interface JsonMedication { name?: string; medication?: string; brand?: string; type?: string; searchTerm?: string }

function parseJsonFormat(text: string): Pick<MedicationItem, "raw" | "searchTerm" | "brand">[] | null {
  try {
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) return null;
    return (parsed as JsonMedication[]).map((item) => {
      const name = item.name ?? item.medication ?? item.searchTerm ?? "";
      const brand = item.brand ?? item.type ?? "GENERIC";
      return { raw: JSON.stringify(item), searchTerm: name, brand };
    });
  } catch { return null; }
}

interface JsParsedItem {
  jsKey: string;
  raw: string;
  searchTerm: string;
  brand: string;
  originalUrl: string;
  existingFullUrl?: string;
}

function parseJsFormat(text: string): JsParsedItem[] | null {
  if (!text.includes("EndPoint +") && !text.includes("EndPoint+")) return null;
  const stripped = text.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
  const endPointMatch = text.match(/EndPoint\s*=\s*['"]([^'"]+)['"]/);
  const endPoint = endPointMatch ? endPointMatch[1].replace(/\/$/, "") : "";
  const entryPattern = /(\bmed\d+)\s*:\s*\{[^}]*?name\s*:\s*'([^']+)'[^}]*?url\s*:\s*EndPoint\s*\+?\s*'([^']+)'[^}]*?\}/gs;
  const items: JsParsedItem[] = [];
  let match: RegExpExecArray | null;
  while ((match = entryPattern.exec(stripped)) !== null) {
    const jsKey = match[1];
    const rawName = match[2];
    const originalUrl = match[3];
    const { searchTerm, brand } = parseNameAndBrand(rawName);
    const existingFullUrl = endPoint ? joinUrlParts(endPoint, originalUrl) : undefined;
    items.push({ jsKey, raw: rawName, searchTerm, brand, originalUrl, existingFullUrl });
  }
  return items.length > 0 ? items : null;
}

export function detectFormat(text: string): InputFormat {
  const trimmed = text.trim();
  if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
    try { JSON.parse(trimmed); return "json"; } catch {/* fall through */}
  }
  if (trimmed.includes("EndPoint +") || trimmed.includes("EndPoint+")) return "js";
  return "text";
}

function parseInput(
  text: string,
  format: InputFormat,
): Pick<MedicationItem, "raw" | "searchTerm" | "brand" | "jsKey" | "originalUrl" | "existingFullUrl">[] {
  if (format === "js") {
    const jsItems = parseJsFormat(text);
    if (jsItems) return jsItems;
  }
  if (format === "json") {
    const jsonItems = parseJsonFormat(text);
    if (jsonItems) return jsonItems;
  }
  return parseTextFormat(text);
}

export function reconstructJsOutput(originalText: string, items: MedicationItem[]): string {
  let result = originalText;
  for (const item of items) {
    if (item.originalUrl && item.documentUrl && item.status === "found") {
      result = result.split(item.originalUrl).join(item.documentUrl);
    }
  }
  return result;
}

async function fetchResults(query: string, pageSize = 10): Promise<SearchApiResult["results"]> {
  const params = new URLSearchParams({ q: query, pageSize: String(pageSize) });
  const res = await fetch(`/api/mhra/search?${params}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json() as SearchApiResult;
  return data.results;
}

async function tryParentheticalFallback(
  searchTerm: string,
): Promise<{ best: SearchApiResult["results"][0] | undefined; all: SearchApiResult["results"] }> {
  const paren = extractParenthetical(searchTerm);
  if (!paren) return { best: undefined, all: [] };
  const altResults = await fetchResults(paren, 15);
  const altBest = pickBestResult(altResults, "GENERIC", searchTerm, {
    coreWordsOverride: paren,
    softNumbers: true,
  });
  return { best: altBest, all: altResults };
}

async function searchForPil(
  searchTerm: string,
  brand: string,
): Promise<{ best: SearchApiResult["results"][0] | undefined; all: SearchApiResult["results"]; defaultedToGeneric: boolean }> {
  if (brand === "GENERIC") {
    const results = await fetchResults(searchTerm, 15);
    const best = pickBestResult(results, brand, searchTerm);
    if (best) return { best, all: results, defaultedToGeneric: false };
    const fb = await tryParentheticalFallback(searchTerm);
    if (fb.best) return { best: fb.best, all: fb.all, defaultedToGeneric: false };
    return { best: undefined, all: results, defaultedToGeneric: false };
  }

  const brandDoseQuery = buildSearchQuery(searchTerm, brand);
  const drugName = searchTerm.split(/\s+/)[0] ?? searchTerm;
  const drugBrandQuery = `${drugName} ${brand}`;
  const brandOnlyQuery = brand;

  const [doseResults, drugBrandResults, brandOnlyResults] = await Promise.all([
    fetchResults(brandDoseQuery, 10),
    fetchResults(drugBrandQuery, 10),
    fetchResults(brandOnlyQuery, 10),
  ]);

  const seen = new Set<string>();
  const combined: SearchApiResult["results"] = [];
  for (const r of [...drugBrandResults, ...doseResults, ...brandOnlyResults]) {
    if (!seen.has(r.documentUrl)) {
      seen.add(r.documentUrl);
      combined.push(r);
    }
  }

  const best = pickBestResult(combined, brand, searchTerm);
  if (best) return { best, all: combined, defaultedToGeneric: false };

  const genericResults = await fetchResults(searchTerm, 15);
  const genericBest = pickBestResult(genericResults, "GENERIC", searchTerm);
  if (genericBest) return { best: genericBest, all: genericResults, defaultedToGeneric: true };

  const fb = await tryParentheticalFallback(searchTerm);
  if (fb.best) return { best: fb.best, all: fb.all, defaultedToGeneric: true };

  return { best: undefined, all: genericResults, defaultedToGeneric: false };
}

interface PilUpdateContextValue {
  // input
  inputText: string;
  setInputText: (v: string) => void;
  inputFormat: InputFormat;
  jsOriginalText: string;

  // run state
  items: MedicationItem[];
  isRunning: boolean;
  isPaused: boolean;
  processed: number;
  total: number;
  found: number;
  unchanged: number;
  notFound: number;
  progressPct: number;
  isDone: boolean;
  isStopped: boolean;
  updatedJs: string;

  // navigation / panel
  notFoundIndices: number[];
  notFoundNavIdx: number;
  navigateToNotFound: (navIdx: number) => void;
  hasPrevNotFound: boolean;
  hasNextNotFound: boolean;
  scrollToTop: () => void;

  // panel controls
  panelMinimized: boolean;
  setPanelMinimized: (v: boolean) => void;
  panelDismissed: boolean;
  setPanelDismissed: (v: boolean) => void;
  controlsInView: boolean;
  setControlsInView: (v: boolean) => void;
  showFloating: boolean;

  // actions
  handleStart: () => Promise<void>;
  handleResumeAfterStop: () => Promise<void>;
  handleStop: () => void;
  handlePause: () => void;
  handleResume: () => void;
  handleExportTxt: () => void;
  handleExportJson: () => void;
  handleExportJs: () => void;
  resetAll: () => void;
}

const PilUpdateContext = React.createContext<PilUpdateContextValue | null>(null);

function downloadText(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function PilUpdateProvider({ children }: { children: React.ReactNode }) {
  const [inputText, setInputText] = React.useState("");
  const [items, setItems] = React.useState<MedicationItem[]>([]);
  const [isRunning, setIsRunning] = React.useState(false);
  const [processed, setProcessed] = React.useState(0);
  const [inputFormat, setInputFormat] = React.useState<InputFormat>("text");
  const [jsOriginalText, setJsOriginalText] = React.useState("");
  const abortRef = React.useRef(false);
  const isPausedRef = React.useRef(false);
  const [isPaused, setIsPaused] = React.useState(false);
  const [notFoundNavIdx, setNotFoundNavIdx] = React.useState(0);
  const [panelMinimized, setPanelMinimized] = React.useState(false);
  const [panelDismissed, setPanelDismissed] = React.useState(false);
  const [controlsInView, setControlsInView] = React.useState(false);

  const waitIfPaused = React.useCallback(
    () =>
      new Promise<void>((resolve) => {
        const check = () => {
          if (!isPausedRef.current) resolve();
          else setTimeout(check, 100);
        };
        check();
      }),
    [],
  );

  const runLoop = React.useCallback(
    async (initialItems: MedicationItem[], startFrom: number) => {
      for (let i = startFrom; i < initialItems.length; i++) {
        await waitIfPaused();
        if (abortRef.current) break;

        const item = initialItems[i];
        setItems((prev) =>
          prev.map((cur, idx) => (idx === i ? { ...cur, status: "searching" } : cur)),
        );

        try {
          const { best, defaultedToGeneric } = await searchForPil(item.searchTerm, item.brand);
          if (best) {
            const isUnchanged = matchesExistingPilDocument(best.documentUrl, item);
            setItems((prev) =>
              prev.map((cur, idx) =>
                idx === i
                  ? {
                      ...cur,
                      status: isUnchanged ? "unchanged" : "found",
                      documentUrl: best.documentUrl,
                      productName: best.productName,
                      plNumber: best.plNumber,
                      title: best.title,
                      defaultedToGeneric,
                    }
                  : cur,
              ),
            );
          } else {
            setItems((prev) =>
              prev.map((cur, idx) => (idx === i ? { ...cur, status: "not_found" } : cur)),
            );
          }
        } catch {
          setItems((prev) =>
            prev.map((cur, idx) => (idx === i ? { ...cur, status: "error" } : cur)),
          );
        }

        setProcessed(i + 1);

        if (i < initialItems.length - 1) {
          await new Promise((r) => setTimeout(r, 150));
        }
      }
    },
    [waitIfPaused],
  );

  const handleStart = React.useCallback(async () => {
    if (!inputText.trim()) return;
    const fmt = detectFormat(inputText);
    setInputFormat(fmt);
    if (fmt === "js") setJsOriginalText(inputText);
    else setJsOriginalText("");

    const parsed = parseInput(inputText, fmt);
    if (parsed.length === 0) return;

    const initialItems: MedicationItem[] = parsed.map((p, i) => ({
      id: `${i}-${p.searchTerm}`,
      ...p,
      status: "pending",
    }));

    setItems(initialItems);
    setIsRunning(true);
    setProcessed(0);
    setNotFoundNavIdx(0);
    setPanelDismissed(false);
    setPanelMinimized(false);
    abortRef.current = false;
    isPausedRef.current = false;
    setIsPaused(false);

    await runLoop(initialItems, 0);
    setIsRunning(false);
  }, [inputText, runLoop]);

  const handleResumeAfterStop = React.useCallback(async () => {
    if (!items.length || isRunning) return;
    const startFrom = processed;
    setIsRunning(true);
    setPanelDismissed(false);
    abortRef.current = false;
    isPausedRef.current = false;
    setIsPaused(false);
    await runLoop(items, startFrom);
    setIsRunning(false);
  }, [items, isRunning, processed, runLoop]);

  const handleStop = React.useCallback(() => {
    abortRef.current = true;
    isPausedRef.current = false;
    setIsPaused(false);
  }, []);

  const handlePause = React.useCallback(() => {
    isPausedRef.current = true;
    setIsPaused(true);
  }, []);

  const handleResume = React.useCallback(() => {
    isPausedRef.current = false;
    setIsPaused(false);
  }, []);

  const handleExportTxt = React.useCallback(() => {
    const lines = items.map((item) => {
      const brandTag = item.brand === "GENERIC" ? "[GENERIC]" : `[${item.brand}]`;
      const url = item.documentUrl ?? "NOT FOUND";
      return `${item.searchTerm} ${brandTag} | ${url}`;
    });
    downloadText(lines.join("\n"), "pil-links-updated.txt", "text/plain");
  }, [items]);

  const handleExportJson = React.useCallback(() => {
    const data = items.map((item) => ({
      medication: item.searchTerm,
      brand: item.brand,
      status: item.status,
      documentUrl: item.documentUrl ?? null,
      productName: item.productName ?? null,
      plNumber: item.plNumber ?? [],
    }));
    downloadText(JSON.stringify(data, null, 2), "pil-links-updated.json", "application/json");
  }, [items]);

  const handleExportJs = React.useCallback(() => {
    const updated = reconstructJsOutput(jsOriginalText, items);
    downloadText(updated, "medicationNames-updated.js", "text/javascript");
  }, [jsOriginalText, items]);

  const resetAll = React.useCallback(() => {
    abortRef.current = true;
    isPausedRef.current = false;
    setIsPaused(false);
    setIsRunning(false);
    setItems([]);
    setProcessed(0);
    setInputText("");
    setJsOriginalText("");
    setInputFormat("text");
    setNotFoundNavIdx(0);
    setPanelDismissed(false);
    setPanelMinimized(false);
  }, []);

  const found = items.filter((i) => i.status === "found").length;
  const unchanged = items.filter((i) => i.status === "unchanged").length;
  const notFound = items.filter((i) => i.status === "not_found" || i.status === "error").length;
  const total = items.length;
  const progressPct = total > 0 ? Math.round((processed / total) * 100) : 0;
  const isDone = !isRunning && total > 0 && processed === total;
  const isStopped = !isRunning && items.length > 0 && !isDone;
  const updatedJs = isDone && inputFormat === "js" ? reconstructJsOutput(jsOriginalText, items) : "";

  const notFoundIndices = items
    .map((item, idx) => (item.status === "not_found" || item.status === "error" ? idx : -1))
    .filter((idx) => idx !== -1);

  const navigateToNotFound = React.useCallback(
    (navIdx: number) => {
      const rowIdx = notFoundIndices[navIdx];
      if (rowIdx === undefined) return;
      document.getElementById(`med-row-${rowIdx}`)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      setNotFoundNavIdx(navIdx);
    },
    [notFoundIndices],
  );

  const hasPrevNotFound = notFoundNavIdx > 0;
  const hasNextNotFound = notFoundNavIdx < notFoundIndices.length - 1;
  const scrollToTop = React.useCallback(
    () => window.scrollTo({ top: 0, behavior: "smooth" }),
    [],
  );

  const showFloating = !controlsInView && items.length > 0 && !panelDismissed;

  const value: PilUpdateContextValue = {
    inputText,
    setInputText,
    inputFormat,
    jsOriginalText,
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
    scrollToTop,
    panelMinimized,
    setPanelMinimized,
    panelDismissed,
    setPanelDismissed,
    controlsInView,
    setControlsInView,
    showFloating,
    handleStart,
    handleResumeAfterStop,
    handleStop,
    handlePause,
    handleResume,
    handleExportTxt,
    handleExportJson,
    handleExportJs,
    resetAll,
  };

  return <PilUpdateContext.Provider value={value}>{children}</PilUpdateContext.Provider>;
}

export function usePilUpdate(): PilUpdateContextValue {
  const ctx = React.useContext(PilUpdateContext);
  if (!ctx) throw new Error("usePilUpdate must be used inside <PilUpdateProvider>");
  return ctx;
}
