import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ConversationPanel from '@/components/ConversationPanel';

export default async function ConversationsPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ leadId?: string }> 
}) {
  const session = await getServerSession(authOptions);
  const { leadId: activeLeadId } = await searchParams;

  if (!session?.user?.tenantId) {
    redirect("/login");
  }

  const leads = await prisma.lead.findMany({
    where: { tenantId: session.user.tenantId },
    include: {
      messages: { orderBy: { createdAt: 'asc' } },
      product: true,
      checkoutEvents: true
    },
    orderBy: { updatedAt: 'desc' }
  });

  const activeLead = activeLeadId 
    ? leads.find(l => l.id === activeLeadId) || leads[0] 
    : leads[0];

  return(
    <div className="flex h-[calc(100vh-64px)] bg-[#0B0F19]">
      {/* LEFT PANEL */}
      <div className="w-80 border-r border-[#1e293b] bg-[#121826] flex flex-col hidden md:flex shrink-0">
        <div className="p-4 border-b border-[#1e293b]">
          <h2 className="text-lg font-bold text-white">Conversations</h2>
          <input type="text" placeholder="Search leads..." className="w-full mt-3 bg-[#0B0F19] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {leads.map(lead => (
            <a 
              key={lead.id} 
              href={`/dashboard/conversations?leadId=${lead.id}`}
              className={`block p-4 border-b border-[#1e293b] cursor-pointer transition ${lead.id === activeLead?.id ? 'bg-[#1e293b] border-l-2 border-l-indigo-500' : 'hover:bg-[#1e293b]/50 border-l-2 border-l-transparent'}`}
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold text-sm text-white truncate pr-2">{lead.name || lead.phone}</span>
                <span className="text-[10px] text-slate-500 shrink-0">
                  {lead.messages.length > 0 ? new Date(lead.messages[lead.messages.length - 1].createdAt).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}) : ''}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 truncate">
                {lead.messages.length > 0 ? lead.messages[lead.messages.length - 1].content : 'No messages'}
              </p>
            </a>
          ))}
        </div>
      </div>

      {activeLead ? (
        <ConversationPanel lead={activeLead} />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 bg-[#0B0F19]">
           <svg className="w-12 h-12 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
           <p>No active conversation selected.</p>
        </div>
      )}
    </div>
  );
}
