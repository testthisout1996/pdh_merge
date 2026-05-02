import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'What is the PIL Printer?',
    a: 'The Patient Information Leaflet (PIL) Printer is a tool that lets healthcare professionals or patients search for MHRA-licensed medication leaflets, select multiple medications, and merge all their information leaflets into a single PDF ready for printing.',
  },
  {
    q: 'Where do the leaflets come from?',
    a: 'All leaflets are sourced directly from the Medicines and Healthcare products Regulatory Agency (MHRA), the UK government body responsible for licensing medicines. The leaflets are the officially approved patient information documents.',
  },
  {
    q: 'How many medications can I add at once?',
    a: 'You can add up to 10 medications per merged PDF. If you need more, you can merge a first batch, then start a new session for the remaining medications.',
  },
  {
    q: 'Can I view a single leaflet without merging?',
    a: 'Yes. After adding a medication to your list, click on its name — it will open the individual leaflet in a new tab so you can preview it before merging.',
  },
  {
    q: 'Why is a medication I searched for not appearing?',
    a: 'The medication database is updated periodically. If a medication is missing it may not yet have an MHRA-licensed PIL available, or the leaflet has not been added to the database. You can report missing medications using the "Report An Issue" link in the navigation.',
  },
  {
    q: 'The PDF failed to load — what should I do?',
    a: 'PDF loading relies on an external proxy service that fetches documents from MHRA servers. Occasional failures can happen due to network issues. Try removing the affected medication and re-adding it, then attempt to merge again. If the problem persists, check the Service Status page.',
  },
  {
    q: 'Is this tool suitable for clinical use?',
    a: 'The leaflets provided are the official MHRA-licensed patient information documents, identical to those included in medication packaging. However, this tool should be used as a supplementary aid only. Always follow local clinical governance policies and professional judgement.',
  },
  {
    q: 'Are my searches stored or tracked?',
    a: 'No. All processing happens locally in your browser. No medication searches, selections, or usage data are sent to any server. Your session data is discarded when you close the page.',
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Frequently Asked Questions</h2>
          <p className="text-slate-500">Everything you need to know about using the PIL Printer.</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {faqs.map((faq, i) => (
            <div key={i} className="border-b border-slate-100 last:border-0">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left hover:bg-slate-50 transition-colors"
              >
                <span className="text-sm font-medium text-slate-800">{faq.q}</span>
                <ChevronDown
                  size={16}
                  className={`flex-shrink-0 text-slate-400 transition-transform duration-200 ${open === i ? 'rotate-180' : ''}`}
                />
              </button>
              {open === i && (
                <div className="px-6 pb-5 text-sm text-slate-500 leading-relaxed border-t border-slate-50 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 bg-amber-50 border border-amber-200 rounded-2xl px-6 py-5">
          <p className="text-sm font-semibold text-amber-800 mb-1">Still have a question?</p>
          <p className="text-xs text-amber-600">
            If your question isn't answered here, please use the{' '}
            <span className="font-semibold">Report An Issue</span> link in the navigation bar.
          </p>
        </div>
      </div>
    </div>
  );
}
