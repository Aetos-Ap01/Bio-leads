import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ConversationsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.tenantId) {
    redirect("/login");
  }

  const leads = await prisma.lead.findMany({
    where: { tenantId: session.user.tenantId },
    include: {
      messages: { orderBy: { createdAt: 'asc' } },
      product: true
    },
    orderBy: { updatedAt: 'desc' }
  });

  const activeLead = leads[0];

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
            <div key={lead.id} className={`p-4 border-b border-[#1e293b] cursor-pointer transition ${lead.id === activeLead?.id ? 'bg-[#1e293b] border-l-2 border-l-indigo-500' : 'hover:bg-[#1e293b]/50 border-l-2 border-l-transparent'}`}>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-sm text-white truncate pr-2">{lead.name || lead.phone}</span>
                <span className="text-[10px] text-slate-500 shrink-0">
                  {lead.messages.length > 0 ? new Date(lead.messages[lead.messages.length - 1].createdAt).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}) : ''}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 truncate">
                {lead.messages.length > 0 ? lead.messages[lead.messages.length - 1].content : 'No messages'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CENTER PANEL */}
      <div className="flex-1 flex flex-col bg-[#0B0F19] relative min-w-0">
        {activeLead ? (
          <>
            <div className="h-16 px-6 border-b border-[#1e293b] flex items-center justify-between bg-[#121826] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold shrink-0">
                  {activeLead.name ? activeLead.name[0] : 'U'}
                </div>
                <div className="truncate">
                  <h3 className="font-bold text-white text-sm truncate">{activeLead.name || 'Unknown Prospect'}</h3>
                  <p className="text-xs text-slate-400 font-mono truncate">{activeLead.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-[#0B0F19] px-3 py-1.5 rounded-full border border-[#1e293b]">
                <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_#22C55E]"></span>
                <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">Online</span>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar">
              {activeLead.messages.map(msg => (
                 <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                   {msg.role === 'user' && (
                     <div className="w-8 h-8 rounded-full bg-slate-700 mr-3 shrink-0 mt-auto hidden md:block border border-[#1e293b]"></div>
                   )}
                   <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-5 py-3.5 text-sm shadow-md ${msg.role === 'user' ? 'bg-[#1e293b] text-slate-200 border border-slate-700 rounded-bl-sm' : 'bg-indigo-600 text-white rounded-br-sm'}`}>
                     <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                     <div className={`text-[10px] mt-2 font-mono flex ${msg.role === 'user' ? 'justify-start text-slate-500' : 'justify-end text-indigo-300'}`}>
                       {new Date(msg.createdAt).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                     </div>
                   </div>
                 </div>
              ))}
            </div>
            
            <div className="p-4 bg-[#121826] border-t border-[#1e293b] shrink-0">
              <div className="flex gap-3">
                <button className="p-3 text-slate-400 hover:text-white bg-[#0B0F19] border border-[#1e293b] rounded-lg transition shrink-0">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                </button>
                <input type="text" placeholder={activeLead.status === 'MANUAL' ? "Type a message to " + activeLead.phone : "Bot is handling this. Switch to MANUAL to type."} disabled={activeLead.status !== 'MANUAL'} className="flex-1 bg-[#0B0F19] border border-[#1e293b] rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed" />
                <button disabled={activeLead.status !== 'MANUAL'} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-bold text-sm tracking-wide transition disabled:opacity-50 disabled:cursor-not-allowed shrink-0">
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 bg-[#0B0F19]">
             <svg className="w-12 h-12 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
             <p>No active conversation selected.</p>
          </div>
        )}
      </div>

      {/* RIGHT PANEL */}
      {activeLead && (
        <div className="w-80 bg-[#121826] border-l border-[#1e293b] p-6 hidden xl:block overflow-y-auto shrink-0 custom-scrollbar">
          <div className="flex flex-col items-center border-b border-[#1e293b] pb-8 mb-8 mt-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold mb-5 shadow-[0_0_20px_rgba(99,102,241,0.3)]">
              {activeLead.name ? activeLead.name[0] : 'U'}
            </div>
            <h2 className="text-xl font-bold text-white text-center leading-tight">{activeLead.name || 'Unknown User'}</h2>
            <p className="text-slate-400 font-mono text-sm mt-2 bg-[#0B0F19] px-3 py-1 rounded inline-block border border-[#1e293b]">{activeLead.phone}</p>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> Funnel Status
              </h3>
              <div className="bg-[#0B0F19] px-4 py-3.5 rounded-lg border border-[#1e293b]">
                <span className="font-black text-indigo-400 uppercase tracking-wider text-xs">{activeLead.status.replace('_', ' ')}</span>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">Lead is currently parked in this automation segment.</p>
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> Intent Product
              </h3>
              <div className="bg-[#0B0F19] px-4 py-3.5 rounded-lg border border-[#1e293b]">
                <span className="font-bold text-white text-sm block mb-1">{activeLead.product?.name || 'No Product Assigned'}</span>
                <p className="text-[11px] text-slate-400 font-mono border-t border-[#1e293b] pt-2 mt-2">
                  <span className="text-green-400 font-bold">R$ {activeLead.product?.price?.toFixed(2) || '0.00'}</span> • {activeLead.product?.platform || 'Direct'}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Financial Events
              </h3>
              <div className="bg-[#0B0F19] px-4 py-3.5 rounded-lg border border-[#1e293b]">
                {activeLead.checkoutEvents.length > 0 ? (
                  <>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-green-400 border border-green-400/30 bg-green-400/10 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">{activeLead.checkoutEvents[0].status}</span>
                      <p className="text-xs text-white font-bold">R$ {activeLead.checkoutEvents[0].amount.toFixed(2)}</p>
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono truncate">{activeLead.checkoutEvents[0].transactionId}</p>
                  </>
                ) : (
                  <span className="text-xs text-slate-500 italic">No checkout attempts registered on webhook.</span>
                )}
              </div>
            </div>
            
            <div className="pt-8 border-t border-[#1e293b] space-y-3">
              <button className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 py-3 rounded-lg font-bold text-xs uppercase tracking-widest shadow-lg shadow-red-500/5 transition">
                Take Control (Manual)
              </button>
              <button className="w-full bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 py-3 rounded-lg font-bold text-xs uppercase tracking-widest shadow-lg shadow-indigo-500/5 transition">
                Send Checkout Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
