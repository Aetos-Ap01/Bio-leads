"use client";

interface DayData { label: string; leads: number; purchases: number; }

export default function MetricsChart({ days }: { days: DayData[] }) {
  const maxVal = Math.max(...days.map(d => Math.max(d.leads, d.purchases)), 1);

  return (
    <div className="bg-[#121826] border border-[#1e293b] rounded-xl p-8 shadow-xl mb-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Últimos 7 Dias</h2>
        <div className="flex items-center gap-5 text-xs font-bold uppercase tracking-widest">
          <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-indigo-500 inline-block"></span>Leads</span>
          <span className="flex items-center gap-2 text-green-400"><span className="w-3 h-3 rounded-sm bg-green-500 inline-block"></span>Compras</span>
        </div>
      </div>

      <div className="flex items-end gap-3 h-40">
        {days.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="flex items-end gap-1 w-full" style={{ height: '120px' }}>
              {/* Leads bar */}
              <div
                className="flex-1 bg-indigo-500/80 hover:bg-indigo-400 transition-all rounded-t-sm relative group"
                style={{ height: `${(d.leads / maxVal) * 100}%`, minHeight: d.leads > 0 ? '4px' : '0' }}
              >
                {d.leads > 0 && (
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-indigo-300 font-bold opacity-0 group-hover:opacity-100 transition">{d.leads}</span>
                )}
              </div>
              {/* Purchases bar */}
              <div
                className="flex-1 bg-green-500/80 hover:bg-green-400 transition-all rounded-t-sm relative group"
                style={{ height: `${(d.purchases / maxVal) * 100}%`, minHeight: d.purchases > 0 ? '4px' : '0' }}
              >
                {d.purchases > 0 && (
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-green-300 font-bold opacity-0 group-hover:opacity-100 transition">{d.purchases}</span>
                )}
              </div>
            </div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide text-center">{d.label}</span>
          </div>
        ))}
      </div>

      {days.every(d => d.leads === 0 && d.purchases === 0) && (
        <div className="text-center text-slate-600 text-sm mt-2">Sem dados ainda — conecte o WhatsApp e comece a capturar leads</div>
      )}
    </div>
  );
}
