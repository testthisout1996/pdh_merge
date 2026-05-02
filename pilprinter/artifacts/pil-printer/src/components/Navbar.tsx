import { useState } from 'react';
import { useLocation } from 'wouter';
import { FileText, Menu, X, AlertCircle } from 'lucide-react';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Service Status', href: '/service-status' },
  { label: 'FAQs', href: '/faq' },
];

export default function Navbar() {
  const [location, navigate] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const go = (href: string) => {
    navigate(href);
    setMobileOpen(false);
  };

  return (
    <nav className="fixed top-0 inset-x-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <button
          onClick={() => go('/')}
          className="flex items-center gap-2.5 group select-none"
        >
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
            <FileText size={15} className="text-amber-400" />
          </div>
          <span className="font-bold text-slate-900 text-sm leading-tight">
            <span className="text-amber-500 font-mono">PIL</span>
            <span className="text-slate-400 font-mono">|</span> Printer
          </span>
        </button>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(link => (
            <button
              key={link.href}
              onClick={() => go(link.href)}
              className={`px-3.5 py-2 text-sm rounded-lg font-medium transition-colors ${
                location === link.href
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {link.label}
            </button>
          ))}
          <a
            href="mailto:report@pilprinter.local"
            className="ml-2 inline-flex items-center gap-1.5 px-3.5 py-2 text-sm rounded-lg font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors"
          >
            <AlertCircle size={13} />
            Report An Issue
          </a>
        </div>

        <button
          onClick={() => setMobileOpen(v => !v)}
          className="md:hidden p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-50"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 flex flex-col gap-1">
          {navLinks.map(link => (
            <button
              key={link.href}
              onClick={() => go(link.href)}
              className={`text-left px-3.5 py-2.5 text-sm rounded-lg font-medium transition-colors ${
                location === link.href
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {link.label}
            </button>
          ))}
          <a
            href="mailto:report@pilprinter.local"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-sm rounded-lg font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors"
          >
            <AlertCircle size={13} />
            Report An Issue
          </a>
        </div>
      )}
    </nav>
  );
}
