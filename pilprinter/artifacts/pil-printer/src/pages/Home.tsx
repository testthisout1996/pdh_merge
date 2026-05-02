import { useState, useRef, useEffect } from 'react';
import { medications, getMedicationUrl, type Medication } from '@/data/medications';
import { Printer, X, Search, Loader2, FileText, ChevronDown } from 'lucide-react';

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

export default function Home() {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Medication[]>([]);
  const [suggestions, setSuggestions] = useState<Medication[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [merging, setMerging] = useState(false);
  const [pdfLibLoaded, setPdfLibLoaded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js';
    script.onload = () => setPdfLibLoaded(true);
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleInput = (value: string) => {
    setQuery(value);
    if (!value.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const filtered = medications.filter(
      m => m.name.toLowerCase().startsWith(value.toLowerCase()) &&
           !selected.find(s => s.key === m.key)
    );
    setSuggestions(filtered);
    setShowSuggestions(true);
  };

  const addMedication = (med: Medication) => {
    if (selected.length >= MAX_MEDS) {
      alert(`You can add a maximum of ${MAX_MEDS} medications.`);
      return;
    }
    if (!selected.find(s => s.key === med.key)) {
      setSelected(prev => [...prev, med]);
    }
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const removeMedication = (key: string) => {
    setSelected(prev => prev.filter(s => s.key !== key));
  };

  const clearAll = () => {
    setSelected([]);
    setQuery('');
    setSuggestions([]);
  };

  const handleMerge = async () => {
    if (selected.length === 0) return;
    if (!pdfLibLoaded || !window.PDFLib) {
      alert('PDF library is still loading. Please try again.');
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
        alert(`Failed to load: ${errors.join(', ')}. Please try again.`);
        setMerging(false);
        return;
      }
      const merged = await window.PDFLib.PDFDocument.create();
      for (const doc of pdfDocs) {
        const pages = await merged.copyPages(doc, doc.getPageIndices());
        pages.forEach(p => merged.addPage(p));
      }
      const bytes = await merged.save();
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
      setTimeout(() => URL.revokeObjectURL(blobUrl), 30000);
    } catch (err) {
      alert('An error occurred while merging. Please try again.');
    } finally {
      setMerging(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="pt-32 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-10 text-center">
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold tracking-widest uppercase px-3 py-1.5 rounded-full mb-5">
              <FileText size={12} />
              MHRA Licensed Patient Information Leaflets
            </div>
            <h1 className="text-4xl font-bold text-slate-900 leading-tight mb-3">
              Find & Print Patient<br />Information Leaflets
            </h1>
            <p className="text-slate-500 text-base max-w-lg mx-auto">
              Search for medications, build your list, then merge all leaflets into a single print-ready PDF.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-visible">
            <div className="p-6 border-b border-slate-100">
              <label className="block text-xs font-semibold tracking-widest uppercase text-slate-400 mb-3">
                Search Medications
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Search size={16} />
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={e => handleInput(e.target.value)}
                  onFocus={() => query && setShowSuggestions(true)}
                  placeholder="Start typing a medication name..."
                  className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                  autoComplete="off"
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div
                    ref={suggestionsRef}
                    className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden max-h-56 overflow-y-auto"
                  >
                    {suggestions.map(med => (
                      <button
                        key={med.key}
                        onMouseDown={() => addMedication(med)}
                        className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-amber-50 hover:text-amber-800 transition-colors border-b border-slate-50 last:border-0"
                      >
                        {med.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {selected.length >= MAX_MEDS && (
                <p className="mt-2 text-xs text-amber-600 font-medium">Maximum of {MAX_MEDS} medications reached.</p>
              )}
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <label className="text-xs font-semibold tracking-widest uppercase text-slate-400">
                  Selected Medications
                  {selected.length > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                      {selected.length}
                    </span>
                  )}
                </label>
                {selected.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="text-xs text-slate-400 hover:text-red-500 transition-colors font-medium"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {selected.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <FileText size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No medications selected yet</p>
                  <p className="text-xs mt-1">Search above to add medications</p>
                </div>
              ) : (
                <ul className="space-y-2 mb-5">
                  {selected.map((med, i) => (
                    <li
                      key={med.key}
                      className="flex items-center justify-between gap-3 bg-slate-50 rounded-xl px-4 py-3 group hover:bg-amber-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center">
                          {i + 1}
                        </span>
                        <a
                          href={getMedicationUrl(med.key)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-slate-700 group-hover:text-amber-800 font-medium truncate hover:underline underline-offset-2 transition-colors"
                        >
                          {med.name}
                        </a>
                      </div>
                      <button
                        onClick={() => removeMedication(med.key)}
                        className="flex-shrink-0 text-slate-300 hover:text-red-400 transition-colors"
                        aria-label="Remove"
                      >
                        <X size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <button
                onClick={handleMerge}
                disabled={selected.length === 0 || merging}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl font-semibold text-sm transition-all
                  bg-slate-900 text-white hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900"
              >
                {merging ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Merging PDFs...
                  </>
                ) : (
                  <>
                    <Printer size={16} />
                    Merge & Open for Printing
                  </>
                )}
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 mt-5">
            PDFs sourced from the MHRA (Medicines and Healthcare products Regulatory Agency)
          </p>
        </div>
      </section>
    </div>
  );
}
