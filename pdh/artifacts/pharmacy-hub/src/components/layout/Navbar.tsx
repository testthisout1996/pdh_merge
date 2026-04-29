import * as React from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import heroBg from "@/assets/hero-bg.png";
import {
  Cross,
  Menu,
  ChevronDown,
  Printer,
  Calculator,
  FileText,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";

export type ActiveSection = "hero" | "tools" | "faq" | "status" | "report";

interface NavbarProps {
  active: ActiveSection;
  onNavigate: (section: ActiveSection) => void;
}

function Logo({ onNavigate }: { onNavigate: (section: ActiveSection) => void }) {
  return (
    <button
      type="button"
      onClick={() => onNavigate("hero")}
      className="relative flex items-center group shrink-0 text-left"
      aria-label="Pharmacy Dispensing Hub home"
    >
      <span
        className="text-4xl md:text-5xl leading-none tracking-tight select-none"
        style={{
          fontFamily: "var(--font-anton)",
          backgroundImage: `url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          WebkitTextFillColor: "transparent",
        }}
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

export function Navbar({ active, onNavigate }: NavbarProps) {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.div
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
      className="fixed top-4 left-0 right-0 z-50 px-4 md:px-6 pointer-events-none flex justify-center"
    >
      <header
        className={`pointer-events-auto w-full max-w-6xl rounded-md border bg-white transition-all duration-300 ${
          scrolled
            ? "border-border/60 shadow-md shadow-black/5"
            : "border-border/30 shadow-sm"
        }`}
      >
        <div className="grid grid-cols-[1fr_auto_1fr] items-center h-16 px-4 md:px-6 gap-4">
          <div className="justify-self-start">
            <Logo onNavigate={onNavigate} />
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8 shrink-0 justify-self-center">
            <NavLink
              label="HOME"
              isActive={active === "hero"}
              onClick={() => onNavigate("hero")}
            />

            <DropdownMenu>
              <DropdownMenuTrigger
                className={`flex items-center gap-1.5 text-[12px] font-semibold tracking-widest uppercase transition-colors focus:outline-none ${
                  active === "tools"
                    ? "text-primary"
                    : "text-foreground/80 hover:text-primary"
                }`}
              >
                TOOLS <ChevronDown className="w-3.5 h-3.5 opacity-50" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="center"
                className="w-[300px] rounded-2xl p-2 shadow-xl border-border/50 bg-white/95 backdrop-blur-xl"
              >
                <DropdownMenuItem
                  onClick={() => onNavigate("tools")}
                  className="rounded-xl p-3 cursor-pointer gap-4 focus:bg-primary/5 transition-colors group"
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

                <Link href="/tools/pil-printer">
                  <DropdownMenuItem className="rounded-xl p-3 cursor-pointer gap-4 focus:bg-primary/5 transition-colors group mt-1">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Printer className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-foreground">
                        Patient Information Leaflet Printer
                      </div>
                    </div>
                  </DropdownMenuItem>
                </Link>

                <Link href="/tools/prednisolone-calculator">
                  <DropdownMenuItem className="rounded-xl p-3 cursor-pointer gap-4 focus:bg-secondary/10 mt-1 transition-colors group">
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
                  className="rounded-xl p-3 gap-4 mt-1 opacity-60 cursor-not-allowed"
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
              </DropdownMenuContent>
            </DropdownMenu>

            <NavLink
              label="FAQ"
              isActive={active === "faq"}
              onClick={() => onNavigate("faq")}
            />
            <NavLink
              label="SERVICE STATUS"
              isActive={active === "status"}
              onClick={() => onNavigate("status")}
            />
          </nav>

          {/* Right Cluster */}
          <div className="hidden md:flex items-center gap-3 shrink-0 justify-self-end">
            <button
              type="button"
              disabled
              aria-disabled="true"
              title="Reporting is currently unavailable"
              className="flex items-center gap-3 bg-[hsl(260_40%_25%)] text-white pl-5 pr-1.5 py-1.5 rounded-md text-xs font-bold tracking-wider opacity-50 cursor-not-allowed"
            >
              REPORT AN ISSUE
              <div className="w-7 h-7 rounded-sm bg-white/80 text-[hsl(260_40%_25%)] flex items-center justify-center shrink-0">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>
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
                  <Logo onNavigate={onNavigate} />
                </div>
                <div className="flex flex-col gap-2 p-4 overflow-y-auto flex-1">
                  <SheetClose asChild>
                    <button
                      onClick={() => onNavigate("hero")}
                      className="text-left text-[13px] tracking-widest font-semibold p-4 rounded-xl hover:bg-muted transition-colors uppercase"
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
                          onClick={() => onNavigate("tools")}
                          className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted text-left transition-colors"
                        >
                          <div className="w-10 h-10 rounded-full bg-muted text-foreground flex items-center justify-center shrink-0">
                            <ArrowRight className="w-4 h-4" />
                          </div>
                          <span className="font-semibold text-sm">
                            All Tools Overview
                          </span>
                        </button>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          href="/tools/pil-printer"
                          className="flex items-center gap-4 p-3 rounded-xl hover:bg-primary/5 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <Printer className="w-4 h-4" />
                          </div>
                          <span className="font-semibold text-sm">
                            PIL Printer
                          </span>
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          href="/tools/prednisolone-calculator"
                          className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/10 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-full bg-secondary/20 text-secondary-foreground flex items-center justify-center shrink-0">
                            <Calculator className="w-4 h-4" />
                          </div>
                          <span className="font-semibold text-sm">
                            Prednisolone Calculator
                          </span>
                        </Link>
                      </SheetClose>
                      <div className="flex items-center gap-4 p-3 rounded-xl opacity-60 grayscale">
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
                      onClick={() => onNavigate("faq")}
                      className="text-left text-[13px] tracking-widest font-semibold p-4 rounded-xl hover:bg-muted transition-colors uppercase"
                    >
                      FAQ
                    </button>
                  </SheetClose>
                  <SheetClose asChild>
                    <button
                      onClick={() => onNavigate("status")}
                      className="text-left text-[13px] tracking-widest font-semibold p-4 rounded-xl hover:bg-muted transition-colors uppercase"
                    >
                      Service Status
                    </button>
                  </SheetClose>
                </div>
                <div className="p-4 mt-auto border-t border-border/50">
                  <button
                    type="button"
                    disabled
                    aria-disabled="true"
                    title="Reporting is currently unavailable"
                    className="flex w-full items-center justify-between bg-[hsl(260_40%_25%)] text-white pl-6 pr-2 py-2 rounded-md text-sm font-bold tracking-wider opacity-50 cursor-not-allowed"
                  >
                    <span className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      REPORT AN ISSUE
                    </span>
                    <div className="w-8 h-8 rounded-sm bg-white/80 text-[hsl(260_40%_25%)] flex items-center justify-center shrink-0">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </motion.div>
  );
}
