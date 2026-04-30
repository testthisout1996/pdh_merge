import { Link } from "wouter";
import { motion } from "framer-motion";
import { Printer, ArrowLeft, Search, CheckCircle2, Clock } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function PilPrinterComingSoon() {
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
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary/10 text-primary mb-6">
              <Printer className="w-10 h-10" />
            </div>
            <div className="inline-block bg-accent/20 text-accent-foreground text-[11px] font-bold uppercase tracking-widest py-1 px-3 rounded-full mb-3">
              Coming Soon
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
              PIL Printer
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Combine and print multiple Patient Information Leaflets in one
              go — built for MCAs, Nomads and Dosette boxes.
            </p>
          </div>

          <Card className="border-border/60 shadow-sm rounded-2xl">
            <CardContent className="p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-base font-semibold text-foreground mb-3">
                  What's coming
                </h2>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground/85">
                      Curated, always-current list of common dosette
                      medications.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground/85">
                      One-click bulk printing of merged PILs — no more
                      one-at-a-time.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground/85">
                      Auto-resolves the latest leaflets via the MHRA database.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">
                      Saved templates per patient for repeat dispenses.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="border-t border-border pt-5 flex flex-col sm:flex-row gap-3">
                <Link href="/tools/pils/pil-search" className="flex-1">
                  <Button className="w-full rounded-xl gap-2">
                    <Search className="w-4 h-4" />
                    Use PIL Search instead
                  </Button>
                </Link>
                <Link href="/" className="flex-1">
                  <Button
                    variant="outline"
                    className="w-full rounded-xl gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
