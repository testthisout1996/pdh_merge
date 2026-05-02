import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Printer, X, Search, Loader2, FileText } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { medications, getMedicationUrl, type Medication } from "@/data/medications";

declare global {
  interface Window {
    PDFLib: {
      PDFDocument: {
        load: (buffer: ArrayBuffer) => Promise<PDFDocumentType>;
        create: () => Promise<PDFDocumentType>;
      };
    };
  }
}

interface PDFDocumentType {
  copyPages: (doc: PDFDocumentType, indices: number[]) => Promise<PageType[]>;
  getPageIndices: () => number[];
  addPage: (page: PageType) => void;
  save: () => Promise<Uint8Array>;
}

interface PageType {
  ref: unknown;
}

const MAX_MEDS = 10;

export default function PilPrinter() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Medication[]>([]);
  const [suggestions, setSuggestions] = useState<Medication[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [merging, setMerging] = useState(false);
  const [pdfLibLoaded, setPdfLibLoaded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js";
    script.onload = () => setPdfLibLoaded(true);
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleInput = (value: string) => {
    setQuery(value);
    if (!value.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const filtered = medications.filter(
      (m) =>
        m.name.toLowerCase().startsWith(value.toLowerCase()) &&
        !selected.find((s) => s.key === m.key)
    );
    setSuggestions(filtered);
    setShowSuggestions(true);
  };

  const addMedication = (med: Medication) => {
    if (selected.length >= MAX_MEDS) return;
    if (!selected.find((s) => s.key === med.key)) {
      setSelected((prev) => [...prev, med]);
    }
    setQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const removeMedication = (key: string) => {
    setSelected((prev) => prev.filter((s) => s.key !== key));
  };

  const clearAll = () => {
    setSelected([]);
    setQuery("");
    setSuggestions([]);
  };

  const handleMerge = async () => {
    if (selected.length === 0) return;
    if (!pdfLibLoaded || !window.PDFLib) {
      alert("PDF library is still loading. Please try again in a moment.");
      return;
    }
    setMerging(true);
    try {
      const pdfDocs = [];
      const errors: string[] = [];
      for (const med of selected) {
        try {
          const url = getMedicationUrl(med.key);
          const resp = await fetch(url);
          const buf = await resp.arrayBuffer();
          const doc = await window.PDFLib.PDFDocument.load(buf);
          pdfDocs.push(doc);
        } catch {
          errors.push(med.name);
        }
      }
      if (errors.length > 0) {
        alert(`Failed to load: ${errors.join(", ")}. Please try again.`);
        setMerging(false);
        return;
      }
      const merged = await window.PDFLib.PDFDocument.create();
      for (const doc of pdfDocs) {
        const pages = await merged.copyPages(doc, doc.getPageIndices());
        pages.forEach((p) => merged.addPage(p));
      }
      const bytes = await merged.save();
      const blob = new Blob([bytes], { type: "application/pdf" });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank");
      setTimeout(() => URL.revokeObjectURL(blobUrl), 30000);
    } catch {
      alert("An error occurred while merging. Please try again.");
    } finally {
      setMerging(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background selection:bg-primary/20">
      <Navbar />

      <main className="flex-1 container max-w-3xl mx-auto px-4 md:px-6 pt-32 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-md bg-primary/10 text-primary mb-5">
              <Printer className="w-8 h-8" />
            </div>
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-[11px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full mb-4">
              <FileText size={11} />
              MHRA Licensed Patient Information Leaflets
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
              PIL Printer
            </h1>
            <p className="text-muted-foreground text-base max-w-lg mx-auto">
              Search for medications, build your list, then merge all leaflets
              into a single print-ready PDF.
            </p>
          </div>

          <div className="bg-white rounded-md shadow-sm border border-border/60 overflow-visible">
            <div className="p-6 border-b border-border/40">
              <label className="block text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-3">
                Search Medications
              </label>
              <div className="relative">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                />
                <Input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => handleInput(e.target.value)}
                  onFocus={() => query && setShowSuggestions(true)}
                  placeholder="Start typing a medication name..."
                  className="pl-9 rounded-md"
                  autoComplete="off"
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div
                    ref={suggestionsRef}
                    className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-border rounded-md shadow-lg overflow-hidden max-h-56 overflow-y-auto"
                  >
                    {suggestions.map((med) => (
                      <button
                        key={med.key}
                        onMouseDown={() => addMedication(med)}
                        className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-primary/5 hover:text-primary transition-colors border-b border-border/30 last:border-0"
                      >
                        {med.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {selected.length >= MAX_MEDS && (
                <p className="mt-2 text-xs text-primary font-medium">
                  Maximum of {MAX_MEDS} medications reached.
                </p>
              )}
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <label className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                  Selected Medications
                  {selected.length > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                      {selected.length}
                    </span>
                  )}
                </label>
                {selected.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="text-xs text-muted-foreground hover:text-destructive transition-colors font-medium"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {selected.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <FileText
                    size={32}
                    className="mx-auto mb-2 opacity-30"
                  />
                  <p className="text-sm">No medications selected yet</p>
                  <p className="text-xs mt-1">
                    Search above to add medications
                  </p>
                </div>
              ) : (
                <ul className="space-y-2 mb-5">
                  {selected.map((med, i) => (
                    <li
                      key={med.key}
                      className="flex items-center justify-between gap-3 bg-muted/40 rounded-md px-4 py-3 group hover:bg-primary/5 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                          {i + 1}
                        </span>
                        <a
                          href={getMedicationUrl(med.key)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-foreground group-hover:text-primary font-medium truncate hover:underline underline-offset-2 transition-colors"
                        >
                          {med.name}
                        </a>
                      </div>
                      <button
                        onClick={() => removeMedication(med.key)}
                        className="flex-shrink-0 text-muted-foreground/50 hover:text-destructive transition-colors"
                        aria-label="Remove"
                      >
                        <X size={15} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <Button
                onClick={handleMerge}
                disabled={selected.length === 0 || merging}
                className="w-full rounded-md gap-2"
              >
                {merging ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Merging PDFs...
                  </>
                ) : (
                  <>
                    <Printer size={15} />
                    Merge &amp; Open for Printing
                  </>
                )}
              </Button>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-5">
            PDFs sourced from the MHRA (Medicines and Healthcare products
            Regulatory Agency)
          </p>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
