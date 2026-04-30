import * as React from "react";
import { Link } from "wouter";
import { Cross, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white border-t border-border pt-16 pb-8">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div className="flex flex-col gap-3">
            <Link href="/" className="flex items-center gap-2 group inline-flex w-fit">
              <div className="w-8 h-8 rounded-md bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-sm">
                <Cross className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-semibold text-lg tracking-tight text-foreground">
                Pharmacy Hub
              </span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-sm">
              The modern dispensary command-center. Speed up your workflow so you can spend more time with patients.
            </p>
          </div>

          <div className="flex gap-8 text-sm">
            <div className="flex flex-col gap-3">
              <span className="font-semibold">Tools</span>
              <Link href="/tools/pil-printer" className="text-muted-foreground hover:text-primary transition-colors">PIL Printer</Link>
              <Link href="/tools/prednisolone-calculator" className="text-muted-foreground hover:text-primary transition-colors">Prednisolone Calculator</Link>
              <span className="text-muted-foreground/50 cursor-not-allowed">To-Follow Slips</span>
            </div>
            <div className="flex flex-col gap-3">
              <span className="font-semibold">Resources</span>
              <button onClick={() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' })} className="text-muted-foreground hover:text-primary transition-colors text-left">FAQ</button>
              <button onClick={() => document.getElementById('status')?.scrollIntoView({ behavior: 'smooth' })} className="text-muted-foreground hover:text-primary transition-colors text-left">Service Status</button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div>
            &copy; {new Date().getFullYear()} Pharmacy Hub. All rights reserved.
          </div>
          <div className="flex items-center gap-1">
            Built with <Heart className="w-3 h-3 text-primary fill-primary" /> for community pharmacy.
          </div>
        </div>
      </div>
    </footer>
  );
}
