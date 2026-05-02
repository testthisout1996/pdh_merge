import * as React from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar, type ActiveSection } from "@/components/layout/Navbar";
import ServiceStatusTab, {
  type ServiceStatusTabHandle,
} from "@/components/pil/ServiceStatusTab";
import statusHeroImage from "@assets/service-status-hero.webp";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Printer,
  Calculator,
  FileText,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertTriangle,
  Send,
  ArrowLeft,
  Pause,
  Play,
  RefreshCw,
  Activity,
  Layers,
  Key,
  Loader2,
} from "lucide-react";
const HERO_VIDEOS = [
  `${import.meta.env.BASE_URL}media/hero-bg.mp4`,
  `${import.meta.env.BASE_URL}media/hero-bg-2.mp4`,
  `${import.meta.env.BASE_URL}media/hero-bg-3.mp4`,
];
const HERO_SWITCH_MS = 6000;
const HERO_FADE_MS = 900;
const HERO_PLAYBACK_RATE = 0.64;
import html5Logo from "@/assets/logos/html5.svg";
import css3Logo from "@/assets/logos/css3.svg";
import jsLogo from "@/assets/logos/javascript.svg";
import blenderLogo from "@/assets/logos/blender.svg";
import replitLogo from "@/assets/logos/replit.svg";
import mongodbLogo from "@/assets/logos/mongodb.svg";

const sectionVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

function getInitialSection(): ActiveSection {
  if (typeof window === "undefined") return "hero";
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("section");
  if (raw === "tools" || raw === "faq" || raw === "status" || raw === "report") {
    return raw;
  }
  return "hero";
}

export default function Home() {
  const [active, setActive] = React.useState<ActiveSection>(getInitialSection);
  const [, setLocation] = useLocation();

  const handleNavigate = React.useCallback((section: ActiveSection) => {
    setActive(section);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      // Strip any ?section=… so refreshing the page lands on the same section
      // without re-triggering an animation flash on the next visit.
      if (window.location.search) {
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
  }, []);

  // Keep the active state in sync if the user clicks an in-page nav link that
  // changes the URL (e.g. via wouter `setLocation`). Wouter listens to
  // popstate, so this is just a defensive sync on mount.
  React.useEffect(() => {
    setActive(getInitialSection());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  void setLocation;

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background selection:bg-primary/20">
      <Navbar active={active} onNavigate={handleNavigate} />

      <main className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {active === "hero" && (
            <motion.div
              key="hero"
              variants={sectionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 flex flex-col"
            >
              <HeroSection onExplore={() => handleNavigate("tools")} />
            </motion.div>
          )}

          {active === "tools" && (
            <motion.div
              key="tools"
              variants={sectionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="pt-28"
            >
              <ToolsSection />
            </motion.div>
          )}

          {active === "faq" && (
            <motion.div
              key="faq"
              variants={sectionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="pt-28"
            >
              <FAQSection />
            </motion.div>
          )}

          {active === "status" && (
            <motion.div
              key="status"
              variants={sectionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <StatusSection />
            </motion.div>
          )}

          {active === "report" && (
            <motion.div
              key="report"
              variants={sectionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="pt-28"
            >
              <ReportSection onBack={() => handleNavigate("hero")} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {active !== "hero" && <Footer />}
    </div>
  );
}

/* ─────────────────────────── HERO ─────────────────────────── */

function Typewriter({
  phrases,
  typeSpeed = 70,
  deleteSpeed = 35,
  pauseAfterTyping = 1400,
  pauseAfterDeleting = 300,
}: {
  phrases: string[];
  typeSpeed?: number;
  deleteSpeed?: number;
  pauseAfterTyping?: number;
  pauseAfterDeleting?: number;
}) {
  const [index, setIndex] = React.useState(0);
  const [text, setText] = React.useState("");
  const [phase, setPhase] = React.useState<"typing" | "pausing" | "deleting">(
    "typing",
  );

  React.useEffect(() => {
    const current = phrases[index];
    let timeout: ReturnType<typeof setTimeout>;

    if (phase === "typing") {
      if (text.length < current.length) {
        timeout = setTimeout(
          () => setText(current.slice(0, text.length + 1)),
          typeSpeed,
        );
      } else {
        timeout = setTimeout(() => setPhase("deleting"), pauseAfterTyping);
      }
    } else if (phase === "deleting") {
      if (text.length > 0) {
        timeout = setTimeout(
          () => setText(current.slice(0, text.length - 1)),
          deleteSpeed,
        );
      } else {
        timeout = setTimeout(() => {
          setIndex((i) => (i + 1) % phrases.length);
          setPhase("typing");
        }, pauseAfterDeleting);
      }
    }

    return () => clearTimeout(timeout);
  }, [
    text,
    phase,
    index,
    phrases,
    typeSpeed,
    deleteSpeed,
    pauseAfterTyping,
    pauseAfterDeleting,
  ]);

  const widest = phrases.reduce((a, b) => (a.length >= b.length ? a : b), "");

  return (
    <span className="relative inline-block align-baseline whitespace-nowrap text-left">
      <span
        className="invisible italic font-light"
        style={{ fontFamily: "'Bodoni MT', 'Bodoni Moda', 'Didot', serif" }}
        aria-hidden="true"
      >
        {widest}
      </span>
      <span
        className="absolute inset-y-0 left-0 italic font-light text-white/95"
        style={{ fontFamily: "'Bodoni MT', 'Bodoni Moda', 'Didot', serif" }}
      >
        {text}
        <span
          className="inline-block w-[2px] h-[1em] align-[-0.15em] ml-0.5 bg-white/80 animate-pulse not-italic font-normal"
          style={{ fontFamily: "inherit" }}
          aria-hidden="true"
        />
      </span>
    </span>
  );
}

function HeroVideoCarousel({ isPaused }: { isPaused: boolean }) {
  const [activeIdx, setActiveIdx] = React.useState(0);
  const refs = React.useRef<(HTMLVideoElement | null)[]>([]);

  React.useEffect(() => {
    if (isPaused) return;
    const id = setInterval(() => {
      setActiveIdx((i) => (i + 1) % HERO_VIDEOS.length);
    }, HERO_SWITCH_MS);
    return () => clearInterval(id);
  }, [isPaused]);

  React.useEffect(() => {
    const incoming = refs.current[activeIdx];
    if (incoming) {
      incoming.playbackRate = HERO_PLAYBACK_RATE;
      const remaining =
        (incoming.duration || Infinity) - incoming.currentTime;
      if (
        Number.isFinite(incoming.duration) &&
        remaining < HERO_SWITCH_MS / 1000
      ) {
        incoming.currentTime = 0;
      }
      if (!isPaused) incoming.play().catch(() => {});
    }
    // Defer pausing the outgoing videos until after the crossfade completes,
    // so the frozen frame is never visible behind the fade.
    const t = setTimeout(() => {
      refs.current.forEach((v, i) => {
        if (v && i !== activeIdx) v.pause();
      });
    }, HERO_FADE_MS);
    return () => clearTimeout(t);
  }, [activeIdx, isPaused]);

  React.useEffect(() => {
    const active = refs.current[activeIdx];
    if (!active) return;
    if (isPaused) {
      active.pause();
    } else {
      active.play().catch(() => {});
    }
  }, [isPaused, activeIdx]);

  return (
    <>
      {HERO_VIDEOS.map((src, i) => (
        <video
          key={src}
          ref={(el) => {
            refs.current[i] = el;
          }}
          src={src}
          autoPlay={i === 0}
          loop
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover scale-[1.04]"
          style={{
            opacity: i === activeIdx ? 1 : 0,
            transition: `opacity ${HERO_FADE_MS}ms ease-in-out`,
          }}
        />
      ))}
    </>
  );
}

function HeroSection({ onExplore }: { onExplore: () => void }) {
  const [isPaused, setIsPaused] = React.useState(false);
  return (
    <section
      id="hero"
      className="relative h-[100dvh] flex flex-col justify-center overflow-hidden"
    >
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ filter: "blur(2.5px) saturate(1.05)" }}
        >
          <HeroVideoCarousel isPaused={isPaused} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-[#2c1b3d]/90 mix-blend-multiply" />
        <div className="absolute inset-0 bg-[#2c1b3d]/40" />
        <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]" />
      </div>

      <div className="container max-w-6xl mx-auto px-4 relative z-10 flex-1 flex flex-col justify-center pt-24 pb-6 min-h-0">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-white leading-[1.05] mb-4"
          >
            <span
              className="block uppercase tracking-tight text-5xl md:text-7xl lg:text-[6.5rem]"
              style={{ fontFamily: "var(--font-anton)" }}
            >
              Dispensing made
            </span>
            <span className="block italic font-light text-3xl md:text-5xl lg:text-6xl mt-1 text-white/95">
              seamless and smarter
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-base md:text-lg text-white mb-6 leading-relaxed max-w-3xl mx-auto"
          >
            Streamlining everyday tasks by bringing essential tools into one
            fast, intuitive workspace, helping staff work more efficiently and
            with greater confidence. Improving pharmacy workflows using tools
            such as{" "}
            <Typewriter
              phrases={[
                "Patient Information Leaflet Printer",
                "Prednisolone Reducing Regimen Calculator",
                "To-Follow Slip Generator",
              ]}
            />
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <Button
              size="lg"
              className="rounded-md h-12 pl-2 pr-6 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white text-[hsl(260_40%_25%)] hover:bg-white/90 group"
              onClick={onExplore}
            >
              <div className="w-9 h-9 rounded-sm bg-primary/10 flex items-center justify-center mr-3 group-hover:bg-primary/20 transition-colors">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-bold tracking-wide">
                Explore the toolkit
              </span>
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Video play/pause control */}
      <div className="relative z-10 w-full px-4 md:px-8 pb-3 flex justify-end shrink-0">
        <button
          type="button"
          onClick={() => setIsPaused((p) => !p)}
          aria-label={isPaused ? "Play background video" : "Pause background video"}
          aria-pressed={isPaused}
          className="group flex items-center gap-2 rounded-md bg-white hover:bg-white/95 border border-border/30 shadow-sm text-foreground pl-2 pr-3 py-1.5 text-[11px] font-semibold tracking-widest uppercase transition-all duration-200"
        >
          <span className="w-6 h-6 rounded-sm bg-primary/10 text-primary group-hover:bg-primary/20 flex items-center justify-center transition-colors">
            {isPaused ? (
              <Play className="w-3 h-3 fill-current" />
            ) : (
              <Pause className="w-3 h-3 fill-current" />
            )}
          </span>
          <span>{isPaused ? "Play" : "Pause"}</span>
        </button>
      </div>

      {/* Logo Strip with side fades */}
      <div className="relative z-10 w-full pb-5 pt-3 border-t border-white/10 bg-gradient-to-t from-[#2c1b3d]/80 to-transparent shrink-0">
        <div className="container max-w-6xl mx-auto px-4">
          <p className="text-center text-[10px] font-bold tracking-widest uppercase text-white/60 mb-3">
            Built with
          </p>

          <div
            className="marquee-container relative overflow-hidden"
            style={{
              WebkitMaskImage:
                "linear-gradient(to right, transparent 0%, black 18%, black 82%, transparent 100%)",
              maskImage:
                "linear-gradient(to right, transparent 0%, black 18%, black 82%, transparent 100%)",
            }}
          >
            <div className="marquee-track flex gap-16 md:gap-24 items-center whitespace-nowrap px-8 w-max">
              {[0, 1].map((set) => (
                <React.Fragment key={set}>
                  <div className="marquee-item group flex items-center gap-3 text-white/80 cursor-default">
                    <img
                      src={html5Logo}
                      alt="HTML5"
                      className="w-8 h-8 transition-all duration-300 grayscale brightness-[2] opacity-80 group-hover:grayscale-0 group-hover:brightness-100 group-hover:opacity-100"
                    />
                    <span className="font-semibold tracking-wider">HTML5</span>
                  </div>
                  <div className="marquee-item group flex items-center gap-3 text-white/80 cursor-default">
                    <img
                      src={css3Logo}
                      alt="CSS3"
                      className="w-8 h-8 transition-all duration-300 grayscale brightness-[2] opacity-80 group-hover:grayscale-0 group-hover:brightness-100 group-hover:opacity-100"
                    />
                    <span className="font-semibold tracking-wider">CSS3</span>
                  </div>
                  <div className="marquee-item group flex items-center gap-3 text-white/80 cursor-default">
                    <img
                      src={jsLogo}
                      alt="JavaScript"
                      className="w-8 h-8 transition-all duration-300 grayscale brightness-[2] opacity-80 group-hover:grayscale-0 group-hover:brightness-100 group-hover:opacity-100"
                    />
                    <span className="font-semibold tracking-wider">
                      JavaScript
                    </span>
                  </div>
                  <div className="marquee-item group flex items-center gap-3 text-white/80 cursor-default">
                    <img
                      src={blenderLogo}
                      alt="Blender"
                      className="w-8 h-8 transition-all duration-300 grayscale brightness-[2] opacity-80 group-hover:grayscale-0 group-hover:brightness-100 group-hover:opacity-100"
                    />
                    <span className="font-semibold tracking-wider">Blender</span>
                  </div>
                  <div className="marquee-item group flex items-center gap-3 text-white/80 cursor-default">
                    <img
                      src={replitLogo}
                      alt="Replit"
                      className="w-8 h-8 transition-all duration-300 grayscale brightness-[2] opacity-80 group-hover:grayscale-0 group-hover:brightness-100 group-hover:opacity-100"
                    />
                    <span className="font-semibold tracking-wider">Replit</span>
                  </div>
                  <div className="marquee-item group flex items-center gap-3 text-white/80 cursor-default">
                    <img
                      src={mongodbLogo}
                      alt="MongoDB"
                      className="w-8 h-8 transition-all duration-300 grayscale brightness-[2] opacity-80 group-hover:grayscale-0 group-hover:brightness-100 group-hover:opacity-100"
                    />
                    <span className="font-semibold tracking-wider">MongoDB</span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── TOOLS ─────────────────────────── */

function ToolsSection() {
  return (
    <section id="tools" className="py-20 bg-background">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
            Dispensary Tools
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need to handle complex dispensing tasks in seconds,
            not minutes.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.05 }}
          >
            <Card className="h-full border-border/50 shadow-sm hover:shadow-xl transition-all duration-300 bg-white flex flex-col group overflow-hidden">
              <div className="h-2 w-full bg-gradient-to-r from-primary/40 to-primary" />
              <CardHeader>
                <div className="w-14 h-14 rounded-md bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Printer className="w-7 h-7" />
                </div>
                <CardTitle className="text-xl">PIL Printer</CardTitle>
                <CardDescription className="text-base pt-2">
                  Combine and print multiple Patient Information Leaflets in one
                  go.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 text-sm text-muted-foreground space-y-3">
                <p>
                  Access a curated list of common medications found in MCAs /
                  Nomads / Dosette boxes.
                </p>
                <ul className="space-y-2 pt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" /> Eliminates
                    one-at-a-time printing
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" /> Always
                    up-to-date leaflets
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link href="/tools/pils/pil-search" className="w-full">
                  <Button className="w-full rounded-md shadow-sm group-hover:bg-primary/90">
                    Launch Tool
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <Card className="h-full border-border/50 shadow-sm hover:shadow-xl transition-all duration-300 bg-white flex flex-col group overflow-hidden">
              <div className="h-2 w-full bg-gradient-to-r from-secondary/40 to-secondary" />
              <CardHeader>
                <div className="w-14 h-14 rounded-md bg-secondary/15 text-secondary-foreground flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Calculator className="w-7 h-7" />
                </div>
                <CardTitle className="text-xl">
                  Prednisolone Calculator
                </CardTitle>
                <CardDescription className="text-base pt-2">
                  Calculate complex tapering regimens instantly without the
                  mental math.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 text-sm text-muted-foreground space-y-3">
                <p>
                  Pick which strengths to use and output total tablets per
                  strength.
                </p>
                <ul className="space-y-2 pt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-secondary-foreground" />{" "}
                    Generates dispensing labels
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-secondary-foreground" />{" "}
                    Printable calendar for patients
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link href="/tools/prednisolone-calculator" className="w-full">
                  <Button
                    variant="secondary"
                    className="w-full rounded-md shadow-sm text-white bg-secondary group-hover:bg-secondary/90"
                  >
                    Launch Tool
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            <Card className="h-full border-border/50 shadow-sm bg-muted/30 flex flex-col relative overflow-hidden grayscale-[30%] opacity-90">
              <div className="absolute -right-12 top-6 bg-accent text-accent-foreground text-xs font-bold uppercase tracking-widest py-1 px-12 rotate-45 shadow-sm">
                Coming Soon
              </div>
              <div className="h-2 w-full bg-muted-foreground/20" />
              <CardHeader>
                <div className="w-14 h-14 rounded-md bg-background flex items-center justify-center mb-4 text-muted-foreground border border-border">
                  <FileText className="w-7 h-7" />
                </div>
                <CardTitle className="text-xl text-muted-foreground">
                  To-Follow Slips
                </CardTitle>
                <CardDescription className="text-base pt-2">
                  Generate owed-medication slips and ditch the physical
                  ordering book.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 text-sm text-muted-foreground space-y-3">
                <p>
                  Capture patient details and reasons, save owed items to a
                  database.
                </p>
                <ul className="space-y-2 pt-2">
                  <li className="flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Emails purchasing team
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Digital audit trail
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  disabled
                  variant="outline"
                  className="w-full rounded-md bg-background/50"
                >
                  Coming Soon
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── FAQ ─────────────────────────── */

function FAQSection() {
  return (
    <section id="faq" className="py-20 bg-background">
      <div className="container max-w-3xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground text-lg">
            Everything you need to know about using Pharmacy Hub in your
            dispensary.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-md p-6 md:p-8 shadow-sm border border-border/50"
        >
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-base font-semibold">
                Who is this hub for?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                Pharmacy Hub is designed specifically for UK community pharmacy
                staff—pharmacists, pharmacy technicians, dispensers, and
                assistants—who want to streamline repetitive administrative
                tasks and spend more time focused on patient care.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-base font-semibold">
                Do I need to install anything?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                No. Pharmacy Hub is entirely web-based. You can access it from
                any browser on any device in the pharmacy. We recommend
                bookmarking the page or setting it as your homepage on the
                dispensary computers.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-base font-semibold">
                How does the PIL printer save time?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                Historically, printing PILs for MDS/Dosette box patients meant
                searching for and printing each leaflet one at a time. Our tool
                lets you select multiple medications from a curated list and
                print them all in a single batch, turning a 5-minute job into a
                30-second one.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger className="text-base font-semibold">
                Is patient data stored?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                For currently active tools (PIL Printer and Prednisolone
                Calculator), no patient-identifiable data is stored on our
                servers. All processing happens locally in your browser to
                maintain strict patient confidentiality. The upcoming To-Follow
                slip generator will use secure, encrypted databases compliant
                with NHS data standards.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger className="text-base font-semibold">
                How are dispensing labels formatted in the calculator?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                The Prednisolone Calculator generates standard text formats that
                you can easily copy and paste into your PMR system (like
                ProScript or Titan). It formats the complex reducing directions
                clearly to prevent patient confusion.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-6">
              <AccordionTrigger className="text-base font-semibold">
                When will the To-Follow Slip Generator launch?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                We are currently beta testing the To-Follow tool with a small
                group of pharmacies to ensure the email integrations with
                purchasing teams are robust. We expect to roll it out to all
                users next quarter.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-7" className="border-b-0">
              <AccordionTrigger className="text-base font-semibold">
                Can I suggest a new tool?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                Absolutely. The hub was built by pharmacy staff, for pharmacy
                staff. If you have a repetitive task that you think could be
                automated or simplified, please reach out to the development
                team.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}

/* ─────────────────────────── STATUS ─────────────────────────── */

const ST_NAVBAR_TOP_GAP = 16;
const ST_NAVBAR_BAR_H = 64;
const ST_NAVBAR_BOTTOM = ST_NAVBAR_TOP_GAP + ST_NAVBAR_BAR_H; // 80px
const ST_GAP = 4;
const ST_LOCK_TARGET_Y = ST_NAVBAR_BOTTOM + ST_GAP; // 84px
const ST_HERO_H = 531;
const ST_BLUR_MAX = 10;
const ST_PARALLAX = 0.2;

function StatusSection() {
  const serviceStatusRef = React.useRef<ServiceStatusTabHandle>(null);
  const heroWrapperRef = React.useRef<HTMLDivElement>(null);
  const spacerRef = React.useRef<HTMLDivElement>(null);
  const buttonsRef = React.useRef<HTMLDivElement>(null);
  const heroImgRef = React.useRef<HTMLImageElement>(null);
  const blurLayerRef = React.useRef<HTMLDivElement>(null);
  const lockAtRef = React.useRef<number>(0);
  const heroFixedTopRef = React.useRef<number>(0);
  const isLockedRef = React.useRef<boolean>(false);
  const [activeBtn, setActiveBtn] = React.useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const scrollToSection = React.useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const lock = lockAtRef.current;
    const heroFixed = heroFixedTopRef.current;
    const heroBottomViewport = heroFixed + ST_HERO_H;
    const elDocY = el.getBoundingClientRect().top + window.scrollY;
    const targetViewportY = heroBottomViewport + 16;
    const targetScroll =
      lock > 0
        ? Math.max(lock, elDocY - targetViewportY)
        : Math.max(0, elDocY - ST_HERO_H - 16);
    window.scrollTo({ top: targetScroll, behavior: "smooth" });
  }, []);

  const handleRefreshAll = React.useCallback(() => {
    setIsRefreshing(true);
    serviceStatusRef.current?.refreshAll();
    setTimeout(() => setIsRefreshing(false), 1500);
  }, []);

  React.useEffect(() => {
    const heroEl = heroWrapperRef.current;
    const spacerEl = spacerRef.current;
    if (!heroEl || !spacerEl) return;

    const onScroll = () => {
      const scrollTop = window.scrollY;
      const btnEl = buttonsRef.current;
      const imgEl = heroImgRef.current;

      if (!isLockedRef.current && btnEl) {
        const rect = btnEl.getBoundingClientRect();
        const btnsDomY = rect.top + scrollTop;
        lockAtRef.current = btnsDomY - ST_LOCK_TARGET_Y;
        heroFixedTopRef.current = -lockAtRef.current;
      }

      const shouldLock =
        lockAtRef.current > 0 && scrollTop >= lockAtRef.current;

      if (imgEl) {
        const shift = Math.min(
          scrollTop,
          lockAtRef.current > 0 ? lockAtRef.current : scrollTop,
        );
        imgEl.style.transform = `translateY(${shift * ST_PARALLAX}px)`;
      }

      const blurEl = blurLayerRef.current;
      if (blurEl) {
        const progress =
          lockAtRef.current > 0
            ? Math.min(1, scrollTop / lockAtRef.current)
            : 0;
        const blurPx = (progress * ST_BLUR_MAX).toFixed(2);
        blurEl.style.backdropFilter = `blur(${blurPx}px)`;
        (
          blurEl.style as CSSStyleDeclaration & {
            webkitBackdropFilter: string;
          }
        ).webkitBackdropFilter = `blur(${blurPx}px)`;
        blurEl.style.opacity = String(progress);
      }

      if (shouldLock !== isLockedRef.current) {
        isLockedRef.current = shouldLock;
        if (shouldLock) {
          heroEl.style.position = "fixed";
          heroEl.style.top = `${heroFixedTopRef.current}px`;
          heroEl.style.left = "0";
          heroEl.style.right = "0";
          heroEl.style.zIndex = "30";
          spacerEl.style.height = `${ST_HERO_H}px`;
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

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section id="status" className="bg-background">
      {/* Blur overlay — above hero (z-30), below navbar (z-50) */}
      <div
        ref={blurLayerRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: `${ST_NAVBAR_BOTTOM}px`,
          zIndex: 40,
          pointerEvents: "none",
          opacity: 0,
          backdropFilter: "blur(0px)",
          WebkitBackdropFilter: "blur(0px)",
          maskImage:
            "linear-gradient(to bottom, black 0%, black 60%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, black 0%, black 60%, transparent 100%)",
        } as React.CSSProperties}
      />

      {/* Hero wrapper — becomes position:fixed when scroll locks */}
      <div ref={heroWrapperRef}>
        <div
          className="relative w-full overflow-hidden"
          style={{ height: `${ST_HERO_H}px` }}
        >
          <img
            ref={heroImgRef}
            src={statusHeroImage}
            alt="Pharmacist helping a patient in a pharmacy"
            className="absolute w-full object-cover object-center"
            style={{
              filter: "saturate(0.9)",
              height: "130%",
              top: "-15%",
              willChange: "transform",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#2c1b3d]/85 via-[#2c1b3d]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2c1b3d]/50 via-transparent to-transparent" />

          <div className="relative z-10 h-full flex flex-col justify-end px-6 md:px-10 pb-10 pt-24 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.55,
                ease: [0.16, 1, 0.3, 1],
                delay: 0.1,
              }}
            >
              <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-2">
                System Health
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-3 tracking-tight">
                Service Status
              </h2>
              <p className="text-white/80 text-sm md:text-base max-w-xl leading-relaxed mb-6">
                Monitor the live operational health of the Pharmacy Dispensing
                Hub and all its connected services. View real-time availability
                of the PIL search tools, MHRA data feeds, and the PDH web
                application — all in one place. Status checks run automatically
                on page load and can be refreshed at any time.
              </p>

              <div
                ref={buttonsRef}
                className="flex items-center gap-3 flex-wrap"
              >
                <button
                  onClick={handleRefreshAll}
                  disabled={isRefreshing}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-semibold transition-all duration-200 bg-white/15 text-white border border-white/30 hover:bg-white/25 disabled:opacity-60"
                >
                  {isRefreshing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  Refresh All
                </button>
                <button
                  onClick={() => {
                    setActiveBtn("all-systems");
                    scrollToSection("status-all-systems");
                  }}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-semibold transition-all duration-200 ${
                    activeBtn === "all-systems"
                      ? "bg-white text-[#2c1b3d] shadow-md"
                      : "bg-white/15 text-white border border-white/30 hover:bg-white/25"
                  }`}
                >
                  <Activity className="w-4 h-4" />
                  All Systems
                </button>
                <button
                  onClick={() => {
                    setActiveBtn("tools");
                    scrollToSection("status-tools");
                  }}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-semibold transition-all duration-200 ${
                    activeBtn === "tools"
                      ? "bg-white text-[#2c1b3d] shadow-md"
                      : "bg-white/15 text-white border border-white/30 hover:bg-white/25"
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  Tools
                </button>
                <button
                  onClick={() => {
                    setActiveBtn("status-key");
                    scrollToSection("status-key");
                  }}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-semibold transition-all duration-200 ${
                    activeBtn === "status-key"
                      ? "bg-white text-[#2c1b3d] shadow-md"
                      : "bg-white/15 text-white border border-white/30 hover:bg-white/25"
                  }`}
                >
                  <Key className="w-4 h-4" />
                  Status Key
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Spacer — height driven imperatively in the same paint frame as the lock */}
      <div ref={spacerRef} style={{ height: 0 }} />

      {/* Status content */}
      <div className="container max-w-4xl mx-auto px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <ServiceStatusTab ref={serviceStatusRef} />
        </motion.div>
      </div>
    </section>
  );
}

/* ─────────────────────────── REPORT AN ISSUE ─────────────────────────── */

function ReportSection({ onBack }: { onBack: () => void }) {
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="report" className="py-20 bg-background">
      <div className="container max-w-2xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <button
            onClick={onBack}
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to home
          </button>

          <div className="text-center mb-10">
            <div className="inline-flex w-14 h-14 rounded-md bg-primary/10 text-primary items-center justify-center mb-4">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
              Report an Issue
            </h2>
            <p className="text-muted-foreground text-lg">
              Spotted a bug, broken leaflet, or have a feature request? Let us
              know and the team will pick it up.
            </p>
          </div>

          {submitted ? (
            <Card className="border-border/50 shadow-sm bg-white">
              <CardContent className="flex flex-col items-center text-center gap-4 py-12">
                <div className="w-14 h-14 rounded-full bg-[#10B981]/10 text-[#10B981] flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">
                    Thanks — your report is in.
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    The team will review it and get back to you if we need more
                    detail.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="rounded-full mt-2"
                  onClick={onBack}
                >
                  Back to home
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border/50 shadow-sm bg-white">
              <CardContent className="p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Your name</Label>
                      <Input
                        id="name"
                        placeholder="e.g. Sarah Khan"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pharmacy">Pharmacy</Label>
                      <Input
                        id="pharmacy"
                        placeholder="e.g. High Street Pharmacy"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tool">Which tool is affected?</Label>
                    <Select defaultValue="hub">
                      <SelectTrigger id="tool">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hub">
                          Pharmacy Hub (general)
                        </SelectItem>
                        <SelectItem value="pil">PIL Printer</SelectItem>
                        <SelectItem value="pred">
                          Prednisolone Calculator
                        </SelectItem>
                        <SelectItem value="tofollow">
                          To-Follow Slip Generator
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="severity">Severity</Label>
                    <Select defaultValue="minor">
                      <SelectTrigger id="severity">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minor">
                          Minor — small annoyance
                        </SelectItem>
                        <SelectItem value="moderate">
                          Moderate — slows me down
                        </SelectItem>
                        <SelectItem value="critical">
                          Critical — blocks dispensing
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">What happened?</Label>
                    <Textarea
                      id="description"
                      rows={5}
                      placeholder="Describe the issue, what you expected, and any steps to reproduce it…"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full rounded-full bg-[hsl(260_40%_25%)] hover:bg-[hsl(260_40%_20%)] text-white"
                  >
                    <Send className="w-4 h-4 mr-2" /> Submit Report
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </section>
  );
}
