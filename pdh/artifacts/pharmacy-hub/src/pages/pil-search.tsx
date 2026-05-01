import * as React from "react";
import { motion } from "framer-motion";
import {
  Search,
  FileText,
  Download,
  Building2,
  Activity,
  Info,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  Tag,
} from "lucide-react";
import {
  useSearchMhraPil,
  getSearchMhraPilQueryKey,
} from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import UpdateTab from "@/components/pil/UpdateTab";
import {
  parseNameAndBrand,
  buildSearchQuery,
  classifyPilResult,
} from "@/lib/pilUtils";
import heroImage from "@assets/asian-client-navigates-pharmacy-shelves-full-drugs-vitamins-re_1777572824357.jpg";

const PAGE_SIZE = 10;

function formatBytes(bytes?: number) {
  if (!bytes) return "Unknown size";
  const units = ["B", "KB", "MB", "GB"];
  let l = 0,
    n = bytes;
  while (n >= 1024 && ++l) n = n / 1024;
  return n.toFixed(n < 10 && l > 0 ? 1 : 0) + " " + units[l];
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function PilSearchHero({
  activeTab,
  onTabChange,
  pilToolsRef,
}: {
  activeTab: string;
  onTabChange: (tab: string) => void;
  pilToolsRef?: React.RefObject<HTMLParagraphElement | null>;
}) {
  return (
    <div className="relative w-full overflow-hidden" style={{ height: "531px" }}>
      <img
        src={heroImage}
        alt="Pharmacy interior with staff and customers"
        className="absolute inset-0 w-full h-full object-cover object-center"
        style={{ filter: "saturate(0.9)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#2c1b3d]/85 via-[#2c1b3d]/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#2c1b3d]/50 via-transparent to-transparent" />
      {/* Fade-out to page background at the bottom — subtle and gradual */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-b from-transparent to-background/40 pointer-events-none" />

      <div className="relative z-10 h-full flex flex-col justify-end px-6 md:px-10 pb-10 pt-24 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        >
          <p
            ref={pilToolsRef}
            className="text-white/70 text-xs font-bold uppercase tracking-widest mb-2"
          >
            PIL Tools
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-3 tracking-tight">
            Patient Information Leaflets
          </h1>
          <p className="text-white/80 text-sm md:text-base max-w-xl leading-relaxed mb-6">
            Search the official MHRA database for verified Patient Information
            Leaflets for medications licensed in the UK. Accepts medication
            names, active substances, or PL numbers.
          </p>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => onTabChange("search")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-semibold transition-all duration-200 ${
                activeTab === "search"
                  ? "bg-white text-[#2c1b3d] shadow-md"
                  : "bg-white/15 text-white border border-white/30 hover:bg-white/25"
              }`}
            >
              <Search className="w-4 h-4" />
              Search
            </button>
            <button
              onClick={() => onTabChange("update")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-semibold transition-all duration-200 ${
                activeTab === "update"
                  ? "bg-white text-[#2c1b3d] shadow-md"
                  : "bg-white/15 text-white border border-white/30 hover:bg-white/25"
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              Bulk Update
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function SearchTab() {
  const [searchInput, setSearchInput] = React.useState("");
  const [submittedQuery, setSubmittedQuery] = React.useState("");
  const [submittedBrand, setSubmittedBrand] = React.useState("GENERIC");
  const [page, setPage] = React.useState(1);

  const { data, isLoading, isError } = useSearchMhraPil(
    { q: submittedQuery, page, pageSize: PAGE_SIZE },
    {
      query: {
        enabled: !!submittedQuery,
        queryKey: getSearchMhraPilQueryKey({
          q: submittedQuery,
          page,
          pageSize: PAGE_SIZE,
        }),
      },
    },
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = searchInput.trim();
    if (!raw) return;
    const { searchTerm, brand } = parseNameAndBrand(raw);
    const query = buildSearchQuery(searchTerm, brand);
    setSubmittedQuery(query);
    setSubmittedBrand(brand);
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-8">
      <section className="space-y-4">
        <Card className="shadow-sm border-border/60 overflow-hidden rounded-md">
          <div className="bg-muted/30 px-5 py-3 border-b border-border/60 flex items-center gap-2">
            <Info className="w-4 h-4 text-primary shrink-0" />
            <span className="text-sm font-medium text-foreground">
              Search by medication name, active substance or PL number
            </span>
          </div>
          <CardContent className="p-5">
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="e.g. Aspirin 75mg Tablets, Paracetamol, 17509/0024..."
                  className="pl-10 h-11 text-sm border-border bg-background"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  data-testid="input-search"
                />
              </div>
              <Button
                type="submit"
                className="h-11 px-6 font-medium shadow-sm rounded-md"
                disabled={!searchInput.trim() || isLoading}
                data-testid="button-submit-search"
              >
                {isLoading ? "Searching..." : "Search"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>

      <section className="flex-1 flex flex-col gap-4">
        {!submittedQuery && !isLoading && (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Search className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1.5">
              Ready to search
            </h3>
            <p className="text-muted-foreground text-sm max-w-md">
              Enter a medication name, active substance, or PL number to find
              official Patient Information Leaflets.
            </p>
          </div>
        )}

        {isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-5 w-44" />
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden rounded-md">
                <CardContent className="p-5 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-56" />
                      <Skeleton className="h-4 w-80" />
                    </div>
                    <Skeleton className="h-9 w-24" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-28" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {isError && (
          <Card className="border-destructive/20 bg-destructive/5 shadow-sm rounded-md">
            <CardContent className="p-5 flex items-start gap-4">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-destructive mb-0.5">
                  Error retrieving results
                </h3>
                <p className="text-sm text-foreground/80">
                  There was a problem connecting to the MHRA database. Please
                  try again.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {data && !isLoading && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-semibold text-foreground">
                  Results
                </h3>
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary rounded-full px-2.5 text-xs"
                >
                  {data.totalCount.toLocaleString()} found
                </Badge>
                {submittedBrand !== "GENERIC" && (
                  <Badge
                    variant="outline"
                    className="border-secondary/40 text-secondary-foreground bg-secondary/15 text-xs gap-1"
                  >
                    <Tag className="w-3 h-3" />
                    Brand: {submittedBrand}
                  </Badge>
                )}
                {submittedBrand === "GENERIC" && submittedQuery && (
                  <Badge
                    variant="outline"
                    className="border-primary/30 text-primary bg-primary/10 text-xs gap-1"
                  >
                    <Tag className="w-3 h-3" />
                    Generic
                  </Badge>
                )}
              </div>
              {data.query && (
                <span className="text-sm text-muted-foreground">
                  for{" "}
                  <span className="font-medium text-foreground">
                    "{data.query}"
                  </span>
                </span>
              )}
            </div>

            {data.results.length === 0 ? (
              <Card className="border-dashed bg-muted/20 rounded-md">
                <CardContent className="flex flex-col items-center justify-center py-14 text-center px-4">
                  <AlertCircle className="w-10 h-10 text-muted-foreground/40 mb-3" />
                  <h3 className="text-base font-medium text-foreground mb-1.5">
                    No documents found
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    No Patient Information Leaflets matched your search. Try a
                    different name, active substance, or PL number.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {data.results.map((doc, index) => {
                  const classification = classifyPilResult(
                    {
                      documentUrl: doc.documentUrl,
                      productName: doc.productName,
                      plNumber: doc.plNumber ?? [],
                      title: doc.title,
                      fileName: doc.fileName,
                    },
                    submittedBrand !== "GENERIC" ? submittedBrand : undefined,
                  );
                  return (
                    <Card
                      key={`${doc.documentUrl}-${index}`}
                      className="group hover:shadow-md transition-shadow duration-200 border-border/80 overflow-hidden rounded-md"
                      data-testid={`card-result-${index}`}
                    >
                      <CardContent className="p-0">
                        <div className="flex flex-col sm:flex-row">
                          <div className="p-5 flex-1 flex flex-col gap-3">
                            <div>
                              <div className="flex items-start justify-between gap-3 mb-0.5">
                                <h4 className="text-base font-semibold text-primary leading-tight">
                                  {doc.productName}
                                </h4>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  {classification === "branded" && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs border-secondary/40 text-secondary-foreground bg-secondary/15"
                                    >
                                      Brand
                                    </Badge>
                                  )}
                                  {classification === "generic" && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs border-primary/30 text-primary bg-primary/10"
                                    >
                                      Generic
                                    </Badge>
                                  )}
                                  {doc.territory && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {doc.territory}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <p className="text-foreground/75 text-sm">
                                {doc.title}
                              </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2.5 gap-x-6 text-sm">
                              {doc.substanceName &&
                                doc.substanceName.length > 0 && (
                                  <div className="flex items-start gap-2">
                                    <Activity className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                                    <div>
                                      <span className="text-muted-foreground block text-xs">
                                        Active Substances
                                      </span>
                                      <span className="font-medium text-sm">
                                        {doc.substanceName.join(", ")}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              {doc.plNumber && doc.plNumber.length > 0 && (
                                <div className="flex items-start gap-2">
                                  <Building2 className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                                  <div>
                                    <span className="text-muted-foreground block text-xs">
                                      PL Number(s)
                                    </span>
                                    <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded text-foreground">
                                      {doc.plNumber.join(", ")}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="border-t sm:border-t-0 sm:border-l border-border bg-muted/10 p-5 sm:w-48 flex flex-col justify-center items-center text-center gap-3">
                            <div className="space-y-1">
                              <FileText className="w-7 h-7 text-primary mx-auto opacity-80 group-hover:opacity-100 transition-opacity" />
                              <div className="text-xs font-semibold text-foreground uppercase tracking-wider">
                                {doc.docType}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {formatBytes(doc.fileSize)}
                                {doc.created && (
                                  <span> · {formatDate(doc.created)}</span>
                                )}
                              </div>
                            </div>
                            <Button
                              asChild
                              className="w-full shadow-sm rounded-md"
                              variant="default"
                              size="sm"
                            >
                              <a
                                href={doc.documentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                data-testid={`link-document-${index}`}
                              >
                                <Download className="w-3.5 h-3.5 mr-1.5" />
                                View PDF
                              </a>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {data.totalCount > PAGE_SIZE && (
                  <div className="flex items-center justify-between pt-4 border-t mt-4">
                    <div className="text-sm text-muted-foreground">
                      Showing{" "}
                      <span className="font-medium text-foreground">
                        {(page - 1) * PAGE_SIZE + 1}
                      </span>
                      –
                      <span className="font-medium text-foreground">
                        {Math.min(page * PAGE_SIZE, data.totalCount)}
                      </span>{" "}
                      of{" "}
                      <span className="font-medium text-foreground">
                        {data.totalCount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-md"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        data-testid="button-prev-page"
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Previous
                      </Button>
                      <span className="text-sm font-medium px-3 py-1 bg-muted rounded-md border text-foreground">
                        {page} / {Math.ceil(data.totalCount / PAGE_SIZE)}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-md"
                        onClick={() => setPage((p) => p + 1)}
                        disabled={
                          page >= Math.ceil(data.totalCount / PAGE_SIZE)
                        }
                        data-testid="button-next-page"
                      >
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

const NAVBAR_TOP_GAP = 16; // pt-4 spacing above the navbar box when not scrolled
const NAVBAR_BAR_H = 64;  // h-16 navbar bar height
const NAVBAR_BOTTOM = NAVBAR_TOP_GAP + NAVBAR_BAR_H; // = 80px from viewport top
const GAP = NAVBAR_TOP_GAP; // lock gap matches the navbar's own top spacing (16px)
const LOCK_TARGET_Y = NAVBAR_BOTTOM + GAP; // PIL TOOLS locks at this viewport Y = 96px
const HERO_H = 531;    // hero section height (425 × 1.25)

export default function PilSearch() {
  const [activeTab, setActiveTab] = React.useState("search");

  const pageRef = React.useRef<HTMLDivElement>(null);
  const heroWrapperRef = React.useRef<HTMLDivElement>(null);
  const spacerRef = React.useRef<HTMLDivElement>(null);
  const pilToolsRef = React.useRef<HTMLParagraphElement>(null);
  const lockAtRef = React.useRef<number>(0);
  const heroFixedTopRef = React.useRef<number>(0);
  const isLockedRef = React.useRef<boolean>(false);

  React.useEffect(() => {
    const page = pageRef.current;
    const heroEl = heroWrapperRef.current;
    const spacerEl = spacerRef.current;
    if (!page || !heroEl || !spacerEl) return;

    const onScroll = () => {
      const scrollTop = page.scrollTop;
      const pilEl = pilToolsRef.current;

      // While unlocked: recalculate lock threshold every frame so it reflects
      // the element's true settled position after the mount animation finishes.
      if (!isLockedRef.current && pilEl) {
        const rect = pilEl.getBoundingClientRect();
        const pilToolsDomY = rect.top + scrollTop;
        lockAtRef.current = pilToolsDomY - LOCK_TARGET_Y;
        heroFixedTopRef.current = -lockAtRef.current;
      }

      const shouldLock = lockAtRef.current > 0 && scrollTop >= lockAtRef.current;

      // Only act on a change — and write directly to the DOM so both the hero
      // position and spacer height update atomically in the same paint frame,
      // eliminating the jitter caused by React re-renders.
      if (shouldLock !== isLockedRef.current) {
        isLockedRef.current = shouldLock;
        if (shouldLock) {
          heroEl.style.position = "fixed";
          heroEl.style.top = `${heroFixedTopRef.current}px`;
          heroEl.style.left = "0";
          heroEl.style.right = "0";
          heroEl.style.zIndex = "30";
          spacerEl.style.height = `${HERO_H}px`;
        } else {
          heroEl.style.position = "";
          heroEl.style.top = "";
          heroEl.style.left = "";
          heroEl.style.right = "";
          heroEl.style.zIndex = "";
          spacerEl.style.height = "0px";
        }
      }
    };

    page.addEventListener("scroll", onScroll, { passive: true });
    return () => page.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      ref={pageRef}
      className="h-[100dvh] overflow-y-auto bg-background selection:bg-primary/20"
    >
      <Navbar />

      <div>
        <div ref={heroWrapperRef}>
          <PilSearchHero
            pilToolsRef={pilToolsRef}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        {/* Spacer — height driven imperatively so it updates in the same frame as the hero lock */}
        <div ref={spacerRef} style={{ height: 0 }} />

        <main className="flex-1 container max-w-6xl mx-auto px-4 md:px-6 pt-10 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsContent value="search" className="focus-visible:outline-none">
                <SearchTab />
              </TabsContent>
              <TabsContent value="update" className="focus-visible:outline-none">
                <UpdateTab />
              </TabsContent>
            </Tabs>
          </motion.div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
