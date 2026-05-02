import { Link } from "wouter";
import { motion } from "framer-motion";
import { Pill, ArrowLeft, CheckCircle2, Clock } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function PrednisoloneCalculatorComingSoon() {
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
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-md bg-primary/10 text-primary mb-6">
              <Pill className="w-10 h-10" />
            </div>
            <div className="inline-block bg-accent/20 text-accent-foreground text-[11px] font-bold uppercase tracking-widest py-1 px-3 rounded-full mb-3">
              Coming Soon
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
              Prednisolone Reducing Regimen Calculator
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Generate tapering schedules quickly and accurately — designed for
              dispensary teams managing steroid reduction plans.
            </p>
          </div>

          <Card className="border-border/60 shadow-sm rounded-md">
            <CardContent className="p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-base font-semibold text-foreground mb-3">
                  What's coming
                </h2>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground/85">
                      Automatic tapering schedule generation from starting dose
                      to target, with configurable step-down intervals.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground/85">
                      Supports multiple standard reduction protocols — weekly,
                      fortnightly and monthly step-downs.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground/85">
                      Printable patient-facing schedule with dosing dates and
                      tablet counts per stage.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">
                      Saved templates for common regimens used in your pharmacy.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="border-t border-border pt-5 flex flex-col sm:flex-row gap-3">
                <Link href="/" className="flex-1">
                  <Button
                    variant="outline"
                    className="w-full rounded-md gap-2"
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
