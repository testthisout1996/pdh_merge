import { CheckCircle, AlertCircle, Clock } from 'lucide-react';

const services = [
  {
    name: 'PDF Merge Engine',
    description: 'Core functionality for combining patient leaflets into a single PDF.',
    status: 'operational' as const,
  },
  {
    name: 'MHRA Document Proxy',
    description: 'Fetches patient information leaflets from the MHRA document store.',
    status: 'operational' as const,
  },
  {
    name: 'Leaflet Database',
    description: 'Medication search index and leaflet metadata.',
    status: 'operational' as const,
  },
];

const incidents: { date: string; title: string; description: string; resolved: boolean }[] = [
  {
    date: '12 Apr 2026',
    title: 'Intermittent PDF Load Failures',
    description: 'Some users experienced timeouts when loading leaflets for specific medications. Root cause identified as temporary MHRA proxy congestion. No data was lost.',
    resolved: true,
  },
];

const statusConfig = {
  operational: { label: 'Operational', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', Icon: CheckCircle },
  degraded: { label: 'Degraded', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', Icon: Clock },
  outage: { label: 'Outage', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', Icon: AlertCircle },
};

export default function ServiceStatus() {
  const allOperational = services.every(s => s.status === 'operational');

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Service Status</h2>
          <p className="text-slate-500">Current status of all PIL Printer components.</p>
        </div>

        <div className={`flex items-center gap-3 rounded-2xl px-5 py-4 mb-8 border ${allOperational ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
          {allOperational ? (
            <CheckCircle size={22} className="text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle size={22} className="text-amber-600 flex-shrink-0" />
          )}
          <div>
            <p className={`font-semibold text-sm ${allOperational ? 'text-emerald-800' : 'text-amber-800'}`}>
              {allOperational ? 'All systems operational' : 'Some systems affected'}
            </p>
            <p className={`text-xs mt-0.5 ${allOperational ? 'text-emerald-600' : 'text-amber-600'}`}>
              Last checked: {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800 text-sm uppercase tracking-widest">Components</h3>
          </div>
          <ul className="divide-y divide-slate-100">
            {services.map(service => {
              const cfg = statusConfig[service.status];
              return (
                <li key={service.name} className="flex items-center justify-between gap-4 px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{service.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{service.description}</p>
                  </div>
                  <span className={`flex-shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
                    <cfg.Icon size={11} />
                    {cfg.label}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800 text-sm uppercase tracking-widest">Recent Incidents</h3>
          </div>
          {incidents.length === 0 ? (
            <div className="px-6 py-10 text-center text-slate-400 text-sm">No recent incidents.</div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {incidents.map((inc, i) => (
                <li key={i} className="px-6 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{inc.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{inc.date}</p>
                      <p className="text-xs text-slate-500 mt-2">{inc.description}</p>
                    </div>
                    {inc.resolved && (
                      <span className="flex-shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                        Resolved
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
