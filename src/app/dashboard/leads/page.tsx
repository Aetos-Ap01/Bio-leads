import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AddLeadButton, LeadCardActions } from "@/components/LeadActions";

export default async function LeadsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.tenantId) {
    redirect("/login");
  }

  const [leads, products] = await Promise.all([
    prisma.lead.findMany({
      where: { tenantId: session.user.tenantId },
      include: {
        product: true,
        messages: { orderBy: { createdAt: 'desc' }, take: 1 }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.product.findMany({
      where: { tenantId: session.user.tenantId },
      select: { id: true, name: true },
    }),
  ]);

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
        <AddLeadButton products={products} />
      </div>

      {leads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-20 h-20 rounded-full bg-indigo-500/10 flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-indigo-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No leads yet</h3>
          <p className="text-slate-400 text-sm text-center max-w-sm">Leads will appear here when contacts message your WhatsApp bot, or you can add them manually.</p>
        </div>
      ) : (
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
              
              <LeadCardActions
                lead={{
                  id: lead.id,
                  name: lead.name,
                  phone: lead.phone,
                  status: lead.status,
                  productId: lead.productId,
                }}
                products={products}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
