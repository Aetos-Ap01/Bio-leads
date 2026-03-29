import { prisma } from '@/lib/prisma';

export default async function LeadsPage() {
  const leads = await prisma.lead.findMany({
    include: {
      product: true,
      messages: { orderBy: { createdAt: 'desc' }, take: 1 }
    },
    orderBy: { createdAt: 'desc' }
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'NEW_LEAD': return 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20';
      case 'DIAGNOSIS': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'OFFER_SENT': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'CHECKOUT_CLICKED': return 'bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20';
      case 'PURCHASE_COMPLETED': return 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20';
      case 'MANUAL': return 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Leads Database</h1>
          <p className="text-slate-400 mt-1 text-sm">Managing {leads.length} contacts automatically</p>
        </div>
        <button className="bg-[#6366F1] hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg text-sm font-bold tracking-wide transition shadow-[0_0_15px_rgba(99,102,241,0.3)]">
          + Add Lead Manual
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {leads.map(lead => (
          <div key={lead.id} className="bg-[#121826] border border-[#1e293b] rounded-xl p-6 hover:border-slate-700 transition flex flex-col shadow-lg shadow-black/20">
            <div className="flex justify-between items-start mb-5">
              <div>
                <h2 className="text-xl font-bold text-white">{lead.name || 'Unknown Prospect'}</h2>
                <p className="text-sm text-slate-400 font-mono mt-1 opacity-80">{lead.phone}</p>
              </div>
              <span className={`px-2.5 py-1 text-[10px] uppercase tracking-widest font-black rounded border ${getStatusStyle(lead.status)}`}>
                {lead.status.replace('_', ' ')}
              </span>
            </div>
            
            <div className="flex-1 space-y-3 mt-2">
              <div className="bg-[#0B0F19] rounded-lg p-3.5 border border-[#1e293b]">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1.5">Product Associated</p>
                <p className="text-sm text-slate-200 font-medium truncate">{lead.product?.name || 'None'}</p>
              </div>

              <div className="bg-[#0B0F19] rounded-lg p-3.5 border border-[#1e293b]">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Last Message Snippet</p>
                <p className="text-sm text-slate-300 italic truncate opacity-90">
                  {lead.messages[0] ? `"${lead.messages[0].content}"` : 'No interactions yet.'}
                </p>
                <p className="text-[11px] text-slate-500 mt-3 text-right font-mono">
                  {lead.messages[0] ? new Date(lead.messages[0].createdAt).toLocaleString('pt-BR') : '-'}
                </p>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-[#1e293b] flex gap-3">
               <button className="flex-1 bg-[#1e293b] hover:bg-slate-700 text-white py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition">
                 Open Chat History
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
