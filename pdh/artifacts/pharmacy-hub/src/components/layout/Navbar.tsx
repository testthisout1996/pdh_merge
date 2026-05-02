import * as React from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  ChevronDown,
  Printer,
  Calculator,
  FileText,
  ArrowRight,
  ArrowUp,
  Pill,
  Search,
  LogOut,
  ShieldCheck,
  User,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@assets/pil-hero.webp";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { useAuth } from "@/context/AuthContext";

export type ActiveSection = "hero" | "tools" | "faq" | "status" | "report";

interface NavbarProps {
  /**
   * The currently active section. Optional — when omitted (e.g. on tool pages
   * that aren't the Home page) the Navbar derives the active state from the
   * URL.
   */
  active?: ActiveSection;
  /**
   * Called when the user clicks a section link. Optional — when omitted, the
   * Navbar will navigate to `/?section=<key>` so Home renders the right
   * section.
   */
  onNavigate?: (section: ActiveSection) => void;
  /**
   * Optional scroll container to listen to instead of window. Use this when
   * the page uses a custom overflow-y-auto container (e.g. PIL Search).
   */
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
}

function getActiveFromLocation(loc: string): ActiveSection {
  if (loc.startsWith("/tools/pils") || loc.startsWith("/tools/")) return "tools";
  return "hero";
}

function Logo({ onGoHome }: { onGoHome: () => void }) {
  return (
    <button
      type="button"
      onClick={onGoHome}
      className="relative flex items-center group shrink-0 text-left"
      aria-label="Pharmacy Dispensing Hub home"
    >
      {/* Invisible placeholder so the button reserves the same layout space
          as the visible PDH cutout drawn by the navbar SVG. */}
      <span
        aria-hidden="true"
        className="leading-none tracking-tight select-none invisible"
        style={{ fontFamily: "var(--font-anton)", fontSize: "48px" }}
      >
        PDH
      </span>
      <div
        className="absolute left-full top-0 bottom-0 flex items-stretch gap-2 pl-3 pointer-events-none opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-out"
        aria-hidden="true"
      >
        <span className="w-px bg-foreground/70 self-stretch" />
        <span className="flex flex-col justify-center text-foreground text-[0.95rem] font-semibold leading-[1.15] tracking-tight whitespace-nowrap">
          <span>Pharmacy</span>
          <span>Dispensing Hub</span>
        </span>
      </div>
    </button>
  );
}

function NavLink({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative text-[12px] font-semibold tracking-widest uppercase transition-colors ${
        isActive ? "text-primary" : "text-foreground/80 hover:text-primary"
      }`}
    >
      {label}
      {isActive && (
        <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-primary" />
      )}
    </button>
  );
}

export function Navbar({ active: activeProp, onNavigate, scrollContainerRef }: NavbarProps) {
  const [scrolled, setScrolled] = React.useState(false);
  const [showScrollTop, setShowScrollTop] = React.useState(false);
  const [location, setLocation] = useLocation();
  const [toolsOpen, setToolsOpen] = React.useState(false);
  const closeTimerRef = React.useRef<number | null>(null);
  const reactId = React.useId();
  const navbarMaskId = `navbar-pdh-mask-${reactId.replace(/[:]/g, "")}`;
  const { user, logout, openLoginModal } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "superadmin";
  const isSuperAdmin = user?.role === "superadmin";

  React.useEffect(() => {
    const container = scrollContainerRef?.current ?? null;
    if (container) {
      const handleScroll = () => {
        const st = container.scrollTop;
        const nearBottom = st + container.clientHeight >= container.scrollHeight - 150;
        setScrolled(st > 20);
        setShowScrollTop(st > window.innerHeight * 2 || nearBottom);
      };
      container.addEventListener("scroll", handleScroll, { passive: true });
      return () => container.removeEventListener("scroll", handleScroll);
    } else {
      const handleScroll = () => {
        const sy = window.scrollY;
        const nearBottom = sy + window.innerHeight >= document.body.scrollHeight - 150;
        setScrolled(sy > 20);
        setShowScrollTop(sy > window.innerHeight * 2 || nearBottom);
      };
      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [scrollContainerRef]);

  const handleScrollTop = React.useCallback(() => {
    const container = scrollContainerRef?.current ?? null;
    if (container) {
      container.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [scrollContainerRef]);

  const cancelToolsClose = React.useCallback(() => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const openTools = React.useCallback(() => {
    cancelToolsClose();
    setToolsOpen(true);
  }, [cancelToolsClose]);

  const scheduleToolsClose = React.useCallback(() => {
    cancelToolsClose();
    closeTimerRef.current = window.setTimeout(() => {
      setToolsOpen(false);
      closeTimerRef.current = null;
    }, 140);
  }, [cancelToolsClose]);

  React.useEffect(() => () => cancelToolsClose(), [cancelToolsClose]);

  const active: ActiveSection = activeProp ?? getActiveFromLocation(location);

  const handleNavigate = React.useCallback(
    (section: ActiveSection) => {
      if (onNavigate) {
        onNavigate(section);
        return;
      }
      // Cross-page navigation: send the user back to Home with the desired
      // section. Home reads ?section=… to set its active section.
      if (section === "hero") {
        setLocation("/");
      } else {
        setLocation(`/?section=${section}`);
      }
    },
    [onNavigate, setLocation],
  );

  return (
    <>
      <AnimatePresence>
        {toolsOpen && (
          <motion.div
            key="navbar-dim-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="fixed inset-0 z-40 bg-black/55 pointer-events-none"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
    <motion.div
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
      className="fixed top-0 left-0 right-0 z-50 pointer-events-none"
    >
      <div
        className={`flex justify-center transition-all duration-300 ease-out ${
          scrolled ? "px-0 pt-0" : "px-4 md:px-6 pt-4"
        }`}
      >
        <header
          className={`pointer-events-auto relative w-full overflow-hidden transition-all duration-300 ease-out ${
            scrolled
              ? "max-w-none rounded-none border-x-0 border-t-0 border-b border-border/60 shadow-md shadow-black/5"
              : "max-w-6xl rounded-md border border-border/30 shadow-sm"
          }`}
        >
          {/* Navbar background painted as an SVG so the PDH logo is a true
              transparent cutout through the white bar. */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            aria-hidden="true"
          >
            <defs>
              <mask id={navbarMaskId} maskUnits="userSpaceOnUse">
                <rect x="0" y="0" width="100%" height="100%" fill="white" />
                <text
                  x="24"
                  y="50%"
                  dominantBaseline="central"
                  fill="black"
                  style={{
                    fontFamily: "var(--font-anton)",
                    fontSize: "48px",
                    letterSpacing: "-0.02em",
                  }}
                >
                  PDH
                </text>
              </mask>
            </defs>
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="white"
              mask={`url(#${navbarMaskId})`}
            />
            {/* Thin outline drawn on top of the cutout so the PDH letters
                remain legible regardless of what shows through. */}
            <text
              x="24"
              y="50%"
              dominantBaseline="central"
              fill="none"
              stroke="rgba(44, 27, 61, 0.55)"
              strokeWidth="1"
              style={{
                fontFamily: "var(--font-anton)",
                fontSize: "48px",
                letterSpacing: "-0.02em",
              }}
            >
              PDH
            </text>
          </svg>
        <div className="relative z-10 grid grid-cols-[1fr_auto_1fr] items-center h-16 px-6 gap-4">
          <div className="justify-self-start">
            <Logo onGoHome={() => handleNavigate("hero")} />
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8 shrink-0 justify-self-center">
            <NavLink
              label="HOME"
              isActive={active === "hero"}
              onClick={() => handleNavigate("hero")}
            />

            <DropdownMenu open={toolsOpen} onOpenChange={setToolsOpen}>
              <DropdownMenuTrigger
                onMouseEnter={openTools}
                onMouseLeave={scheduleToolsClose}
                onFocus={openTools}
                onBlur={scheduleToolsClose}
                className={`flex items-center gap-1.5 py-5 text-[12px] font-semibold tracking-widest uppercase transition-colors focus:outline-none ${
                  active === "tools" ? "text-primary" : "text-foreground/80 hover:text-primary"
                }`}
              >
                TOOLS <ChevronDown className="w-3.5 h-3.5 opacity-50" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="center"
                sideOffset={scrolled ? 8 : 12}
                onMouseEnter={openTools}
                onMouseLeave={scheduleToolsClose}
                onCloseAutoFocus={(e) => e.preventDefault()}
                className="w-[320px] rounded-md p-0 shadow-xl border border-border/50 bg-white relative overflow-hidden"
              >
                <div className="p-2">
                <DropdownMenuItem
                  onClick={() => handleNavigate("tools")}
                  className="rounded-md p-3 cursor-pointer gap-4 focus:bg-primary/5 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Printer className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-foreground">
                      All Dispensary Tools
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      View the full toolkit
                    </div>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="rounded-md p-3 cursor-pointer gap-4 focus:bg-primary/5 data-[state=open]:bg-primary/5 transition-colors group mt-1 [&>svg]:hidden">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Pill className="w-5 h-5" />
                    </div>
                    <div className="flex-1 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-sm text-foreground">PILs</div>
                        <div className="text-[11px] text-muted-foreground">
                          Patient Information Leaflets
                        </div>
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 -rotate-90 opacity-50" />
                    </div>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent
                      sideOffset={12}
                      className="w-[280px] rounded-md p-2 shadow-xl border border-border/50 bg-white"
                    >
                      <Link href="/tools/pils/pil-printer">
                        <DropdownMenuItem className="rounded-md p-3 cursor-pointer gap-4 focus:bg-primary/5 transition-colors group">
                          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            <Printer className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-sm text-foreground flex items-center gap-2">
                              PIL Printer
                              <span className="text-[9px] font-bold uppercase tracking-wider bg-accent/20 text-accent-foreground px-1.5 py-0.5 rounded-sm">
                                Coming Soon
                              </span>
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              Batch print MDS leaflets
                            </div>
                          </div>
                        </DropdownMenuItem>
                      </Link>
                      <Link href="/tools/pils/pil-search">
                        <DropdownMenuItem className="rounded-md p-3 cursor-pointer gap-4 focus:bg-primary/5 transition-colors group mt-1">
                          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            <Search className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-sm text-foreground">
                              PIL Search
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              Find official MHRA leaflets
                            </div>
                          </div>
                        </DropdownMenuItem>
                      </Link>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>

                <Link href="/tools/prednisolone-calculator">
                  <DropdownMenuItem className="rounded-md p-3 cursor-pointer gap-4 focus:bg-secondary/10 mt-1 transition-colors group">
                    <div className="w-10 h-10 rounded-full bg-secondary/20 text-secondary-foreground flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Calculator className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-foreground">
                        Prednisolone Reducing Regimen Calculator
                      </div>
                    </div>
                  </DropdownMenuItem>
                </Link>

                <DropdownMenuItem
                  disabled
                  className="rounded-md p-3 gap-4 mt-1 opacity-60 cursor-not-allowed"
                >
                  <div className="w-10 h-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-foreground flex items-center gap-2">
                      To-Follow Slip Generator
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-accent/20 text-accent-foreground px-1.5 py-0.5 rounded-sm">
                        Coming Soon
                      </span>
                    </div>
                  </div>
                </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <NavLink
              label="FAQ"
              isActive={active === "faq"}
              onClick={() => handleNavigate("faq")}
            />
            <NavLink
              label="SERVICE STATUS"
              isActive={active === "status"}
              onClick={() => handleNavigate("status")}
            />
          </nav>

          {/* Right Cluster */}
          <div className="hidden md:flex items-center gap-2 shrink-0 justify-self-end">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-muted/60 transition-colors text-sm font-semibold text-foreground/80 hover:text-foreground focus:outline-none">
                    <div className="w-7 h-7 rounded-full bg-primary/15 text-primary flex items-center justify-center text-[11px] font-bold uppercase shrink-0">
                      {isSuperAdmin ? <Crown className="w-3.5 h-3.5" /> : isAdmin ? <ShieldCheck className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                    </div>
                    <span className="max-w-[120px] truncate">{user.name}</span>
                    <ChevronDown className="w-3 h-3 opacity-50 shrink-0" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={scrolled ? 8 : 12}
                  className="w-52 rounded-md p-1.5 shadow-xl border border-border/50 bg-white"
                >
                  <div className="px-2.5 py-2 mb-1 border-b border-border/50">
                    <p className="font-semibold text-sm text-foreground truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user.role === "superadmin" ? "Super Admin" : user.role}</p>
                  </div>
                  <Link href="/profile">
                    <DropdownMenuItem className="rounded-md gap-2 cursor-pointer px-2.5 py-2 mt-0.5 text-sm focus:bg-primary/5 transition-colors">
                      <User className="w-4 h-4 text-primary/70" />
                      Profile &amp; Settings
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator className="my-1" />
                  <DropdownMenuItem
                    onClick={() => logout().then(() => setLocation("/"))}
                    className="rounded-md gap-2 cursor-pointer px-2.5 py-2 text-sm text-destructive focus:text-destructive focus:bg-destructive/5 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="text-xs gap-1.5"
                onClick={() => openLoginModal()}
              >
                Sign in
              </Button>
            )}
          </div>

          {/* Mobile Nav */}
          <div className="lg:hidden flex items-center gap-2 justify-self-end md:col-start-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-md w-10 h-10 hover:bg-muted"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[300px] sm:w-[350px] p-0 flex flex-col"
              >
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <div className="p-6 border-b border-border/50">
                  <Logo onGoHome={() => handleNavigate("hero")} />
                </div>
                <div className="flex flex-col gap-2 p-4 overflow-y-auto flex-1">
                  <SheetClose asChild>
                    <button
                      onClick={() => handleNavigate("hero")}
                      className="text-left text-[13px] tracking-widest font-semibold p-4 rounded-md hover:bg-muted transition-colors uppercase"
                    >
                      Home
                    </button>
                  </SheetClose>

                  <div className="space-y-1">
                    <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest px-4 py-2">
                      Tools
                    </div>
                    <div className="flex flex-col gap-1">
                      <SheetClose asChild>
                        <button
                          onClick={() => handleNavigate("tools")}
                          className="flex items-center gap-4 p-3 rounded-md hover:bg-muted text-left transition-colors"
                        >
                          <div className="w-10 h-10 rounded-full bg-muted text-foreground flex items-center justify-center shrink-0">
                            <ArrowRight className="w-4 h-4" />
                          </div>
                          <span className="font-semibold text-sm">
                            All Tools Overview
                          </span>
                        </button>
                      </SheetClose>

                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-4 pt-3 pb-1 flex items-center gap-1.5">
                        <Pill className="w-3 h-3" /> PILs
                      </div>
                      <SheetClose asChild>
                        <Link
                          href="/tools/pils/pil-printer"
                          className="flex items-center gap-4 p-3 rounded-md hover:bg-primary/5 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <Printer className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm flex items-center gap-2">
                              PIL Printer
                              <span className="text-[9px] font-bold uppercase tracking-wider bg-accent/20 text-accent-foreground px-1.5 py-0.5 rounded-sm">
                                Soon
                              </span>
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              Batch print MDS leaflets
                            </span>
                          </div>
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          href="/tools/pils/pil-search"
                          className="flex items-center gap-4 p-3 rounded-md hover:bg-primary/5 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <Search className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm">PIL Search</span>
                            <span className="text-[10px] text-muted-foreground">
                              Find MHRA leaflets
                            </span>
                          </div>
                        </Link>
                      </SheetClose>

                      <SheetClose asChild>
                        <Link
                          href="/tools/prednisolone-calculator"
                          className="flex items-center gap-4 p-3 rounded-md hover:bg-secondary/10 transition-colors mt-2"
                        >
                          <div className="w-10 h-10 rounded-full bg-secondary/20 text-secondary-foreground flex items-center justify-center shrink-0">
                            <Calculator className="w-4 h-4" />
                          </div>
                          <span className="font-semibold text-sm">
                            Prednisolone Calculator
                          </span>
                        </Link>
                      </SheetClose>
                      <div className="flex items-center gap-4 p-3 rounded-md opacity-60 grayscale">
                        <div className="w-10 h-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm">
                            To-Follow Slips
                          </span>
                          <span className="text-[10px] text-accent-foreground font-bold uppercase tracking-wider">
                            Coming Soon
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <SheetClose asChild>
                    <button
                      onClick={() => handleNavigate("faq")}
                      className="text-left text-[13px] tracking-widest font-semibold p-4 rounded-md hover:bg-muted transition-colors uppercase"
                    >
                      FAQ
                    </button>
                  </SheetClose>
                  <SheetClose asChild>
                    <button
                      onClick={() => handleNavigate("status")}
                      className="text-left text-[13px] tracking-widest font-semibold p-4 rounded-md hover:bg-muted transition-colors uppercase"
                    >
                      Service Status
                    </button>
                  </SheetClose>
                </div>
                <div className="p-4 mt-auto border-t border-border/50 space-y-2">
                  {user ? (
                    <>
                      <div className="flex items-center gap-3 px-2 py-2 rounded-md bg-muted/40">
                        <div className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0">
                          {isSuperAdmin ? <Crown className="w-3.5 h-3.5" /> : isAdmin ? <ShieldCheck className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{user.role === "superadmin" ? "Super Admin" : user.role}</p>
                        </div>
                      </div>
                      <SheetClose asChild>
                        <Link href="/profile">
                          <button className="flex w-full items-center gap-2 px-3 py-2.5 rounded-md hover:bg-primary/5 text-sm font-semibold text-foreground transition-colors">
                            <User className="w-4 h-4 text-primary" />
                            Profile &amp; Settings
                          </button>
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <button
                          onClick={() => logout().then(() => setLocation("/"))}
                          className="flex w-full items-center gap-2 px-3 py-2.5 rounded-md hover:bg-destructive/10 text-sm font-semibold text-destructive transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign out
                        </button>
                      </SheetClose>
                    </>
                  ) : (
                    <SheetClose asChild>
                      <button
                        onClick={() => openLoginModal()}
                        className="flex w-full items-center justify-center gap-2 px-3 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-semibold transition-colors hover:bg-primary/90"
                      >
                        Sign in
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </SheetClose>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        </header>
      </div>
    </motion.div>

      {/* ── Back to Top ── */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            key="back-to-top"
            initial={{ opacity: 0, scale: 0.85, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            onClick={handleScrollTop}
            aria-label="Back to top"
            style={{
              backgroundImage: `linear-gradient(rgba(44,27,61,0.72), rgba(44,27,61,0.72)), url(${heroImage})`,
              backgroundSize: "auto",
              backgroundPosition: "center",
            }}
            className="fixed bottom-6 right-6 z-50 w-11 h-11 rounded-md flex items-center justify-center border border-white/30 text-white hover:brightness-110 transition-[filter] duration-200 shadow-md cursor-pointer"
          >
            <ArrowUp className="w-5 h-5 text-white" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
