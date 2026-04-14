"use client";

import { useState, useTransition, useEffect, useRef, useOptimistic } from "react";
import { toggleManualMode } from "@/actions/leads";
import { sendWhatsAppMessage, sendCheckoutMessage } from "@/actions/whatsapp";

interface Message {
  id: string;
  content: string;
  role: string;
  createdAt: Date;
}

interface Lead {
  id: string;
  name: string | null;
  phone: string;
  status: string;
  product?: {
    name: string;
    price: number;
    platform: string | null;
  } | null;
  messages: Message[];
  checkoutEvents: {
    id: string;
    status: string;
    amount: number;
    platform: string | null;
  }[];
}

export default function ConversationPanel({ lead }: { lead: Lead }) {
  const [inputText, setInputText] = useState("");
  const [isPending, startTransition] = useTransition();
  const [optimisticMessages, dispatchOptimistic] = useOptimistic<
    Message[],
    { type: "add"; message: Message } | { type: "remove"; id: string } | { type: "replace"; messages: Message[] }
  >(lead.messages, (state, action) => {
    switch (action.type) {
      case "add":
        return [...state, action.message];
      case "remove":
        return state.filter((m) => m.id !== action.id);
      case "replace":
        return action.messages;
      default:
        return state;
    }
  });
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [optimisticMessages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isPending) return;
    
    const messageContent = inputText;
    setInputText("");

    // Optimistic Update
    const tempId = Math.random().toString();
    dispatchOptimistic({ type: "add", message: {
      id: tempId,
      content: messageContent,
      role: 'system',
      createdAt: new Date()
    }});
    
    startTransition(async () => {
      const result = await sendWhatsAppMessage(lead.phone, messageContent, lead.id);
      if (!result.success) {
        alert("Erro ao enviar: " + result.error);
        // Rollback if failed
        dispatchOptimistic({ type: "remove", id: tempId });
      }
    });
  };

  const handleToggleManual = () => {
    startTransition(async () => {
      const result = await toggleManualMode(lead.id);
      if (result.error) alert(result.error);
    });
  };

  const handleSendCheckout = () => {
    startTransition(async () => {
      const result = await sendCheckoutMessage(lead.id);
      if (result.error) {
        alert(result.error);
      } else {
        // Add checkout message optimistically
        dispatchOptimistic({ type: "add", message: {
          id: Math.random().toString(),
          content: "Checkout link sent successfully.",
          role: 'system',
          createdAt: new Date()
        }});
      }
    });
  };

  return (
    <>
      {/* CENTER PANEL */}
      <div className="flex-1 flex flex-col bg-[#0B0F19] relative min-w-0">
        <div className="h-16 px-6 border-b border-[#1e293b] flex items-center justify-between bg-[#121826] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold shrink-0">
              {lead.name ? lead.name[0] : 'U'}
            </div>
            <div className="truncate">
              <h3 className="font-bold text-white text-sm truncate">{lead.name || 'Unknown Prospect'}</h3>
              <p className="text-xs text-slate-400 font-mono truncate">{lead.phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-[#0B0F19] px-3 py-1.5 rounded-full border border-[#1e293b]">
            <span className={`w-2 h-2 rounded-full ${lead.status === 'MANUAL' ? 'bg-orange-500 shadow-[0_0_5px_#F97316]' : 'bg-green-500 shadow-[0_0_5px_#22C55E]'}`}></span>
            <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">{lead.status === 'MANUAL' ? 'Manual' : 'Automation'}</span>
          </div>
        </div>
        
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar scroll-smooth"
        >
          {optimisticMessages.map(msg => (
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
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={lead.status === 'MANUAL' ? "Digite uma resposta para " + lead.phone : "Bot está controlando agora."} 
              disabled={lead.status !== 'MANUAL' || isPending} 
              className="flex-1 bg-[#0B0F19] border border-[#1e293b] rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed" 
            />
            <button 
              onClick={handleSendMessage}
              disabled={lead.status !== 'MANUAL' || isPending || !inputText.trim()} 
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-bold text-sm tracking-wide transition disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              {isPending ? '...' : 'Enviar'}
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-80 bg-[#121826] border-l border-[#1e293b] p-6 hidden xl:block overflow-y-auto shrink-0 custom-scrollbar">
        <div className="flex flex-col items-center border-b border-[#1e293b] pb-8 mb-8 mt-4">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold mb-5 shadow-[0_0_20px_rgba(99,102,241,0.3)]">
            {lead.name ? lead.name[0] : 'U'}
          </div>
          <h2 className="text-xl font-bold text-white text-center leading-tight">{lead.name || 'Prospecto'}</h2>
          <p className="text-slate-400 font-mono text-sm mt-2 bg-[#0B0F19] px-3 py-1 rounded inline-block border border-[#1e293b]">{lead.phone}</p>
        </div>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> Status do Funil
            </h3>
            <div className="bg-[#0B0F19] px-4 py-3.5 rounded-lg border border-[#1e293b]">
              <span className="font-black text-indigo-400 uppercase tracking-wider text-xs">{lead.status.replace('_', ' ')}</span>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">O lead está neste segmento da automação.</p>
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> Produto de Interesse
            </h3>
            <div className="bg-[#0B0F19] px-4 py-3.5 rounded-lg border border-[#1e293b]">
              <span className="font-bold text-white text-sm block mb-1">{lead.product?.name || 'Nenhum Produto'}</span>
              <p className="text-[11px] text-slate-400 font-mono border-t border-[#1e293b] pt-2 mt-2">
                <span className="text-green-400 font-bold">R$ {lead.product?.price?.toFixed(2) || '0.00'}</span> • {lead.product?.platform || 'Direto'}
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-[#1e293b] space-y-3">
            <button 
              onClick={handleToggleManual}
              disabled={isPending}
              className={`w-full py-3 rounded-lg font-bold text-xs uppercase tracking-widest shadow-lg transition border ${lead.status === 'MANUAL' ? 'bg-green-500/10 hover:bg-green-500/20 text-green-500 border-green-500/30' : 'bg-red-500/10 hover:bg-red-500/20 text-red-500 border-red-500/30'}`}
            >
              {lead.status === 'MANUAL' ? 'Ativar Robô' : 'Assumir Manual'}
            </button>
            <button 
              onClick={handleSendCheckout}
              disabled={isPending}
              className="w-full bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 py-3 rounded-lg font-bold text-xs uppercase tracking-widest shadow-lg shadow-indigo-500/5 transition"
            >
              Reenviar Checkout
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
