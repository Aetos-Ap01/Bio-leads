export default function ScriptsPage() {
  const blocks = [
    { name: "Initial Opening", hook: "NEW_LEAD", delay: "Instant", type: "intro", text: "Talvez ninguém tenha te dito isso ainda...\nMas a mulher que você era antes de tudo que aconteceu ainda existe." },
    { name: "Diagnosis Bridge", hook: "DIAGNOSIS", delay: "+ 1.5s", type: "bridge", text: "Criei um material curto e direto mostrando 5 passos para recuperar sua identidade e confiança." },
    { name: "Direct Offer Drop", hook: "OFFER_SENT", delay: "+ 1.5s", type: "offer", text: "Hoje ele está disponível por R$19,90.\nSe quiser acessar agora:\n{checkoutUrl}" },
    { name: "First Follow-up", hook: "CRON 2 HOURS", delay: "2 Hours Inactive", type: "follow", text: "Oi! Vi que você ainda não finalizou sua inscrição. Ficou com alguma dúvida sobre o produto ou a forma de pagamento?" },
    { name: "Urgency Follow-up", hook: "CRON 24 HOURS", delay: "24 Hours Inactive", type: "follow", text: "Passando para avisar que as vagas com esse valor promocional estão quase no fim. Ainda dá tempo de garantir a sua! Qualquer dúvida estou aqui." },
    { name: "Post-Purchase Welcome", hook: "WEBHOOK PAYMENT", delay: "Instant Arrival", type: "post", text: "Pagamento confirmado! 🎉 Muito obrigado pela confiança. Seu acesso detalhado chegará no seu e-mail em instantes." },
  ];

  const getColor = (type: string) => {
    switch(type) {
      case 'intro': return 'border-blue-500/50 bg-blue-500/5 hover:border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.1)]';
      case 'bridge': return 'border-purple-500/50 bg-purple-500/5 hover:border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.1)]';
      case 'offer': return 'border-[#F59E0B]/50 bg-[#F59E0B]/5 hover:border-[#F59E0B] shadow-[0_0_15px_rgba(245,158,11,0.1)]';
      case 'follow': return 'border-slate-500/50 bg-slate-500/5 hover:border-slate-500';
      case 'post': return 'border-green-500/50 bg-green-500/5 hover:border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.1)]';
      default: return 'border-slate-700 bg-slate-800';
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-12 border-b border-[#1e293b] pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Automation Scripts</h1>
          <p className="text-slate-400 mt-2 text-sm">Visual workflow editor for your automated chat sequencing</p>
        </div>
        <button className="bg-[#6366F1] hover:bg-indigo-500 text-white px-6 py-2.5 rounded-lg text-sm font-bold tracking-wide transition shadow-lg shadow-indigo-500/30">
          Save Pipeline State
        </button>
      </div>

      <div className="relative">
        {/* Pipeline Line Connecting Blocks */}
        <div className="absolute left-8 top-6 bottom-16 w-1 bg-[#1e293b] rounded-full"></div>
        
        <div className="space-y-10">
          {blocks.map((block, idx) => (
             <div key={idx} className="relative z-10 pl-24 pr-4">
                {/* Node Connector */}
                <div className="absolute left-[26px] top-8 w-6 h-6 rounded-full bg-[#0B0F19] border-4 border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.9)] z-20"></div>
                <div className="absolute left-8 top-[42px] w-16 h-0.5 bg-[#1e293b] z-10"></div>
                
                <div className={`bg-[#121826] border-2 ${getColor(block.type)} rounded-2xl p-7 transition-all duration-300 group`}>
                   <div className="flex justify-between items-center mb-5">
                     <div>
                       <h3 className="text-lg font-bold text-white flex items-center gap-3">
                         {block.name}
                       </h3>
                       <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-black">HOOK: {block.hook}</p>
                     </div>
                     <span className="px-3 py-1.5 bg-[#0B0F19] border border-[#1e293b] text-slate-300 text-[10px] uppercase font-bold tracking-widest rounded-md shadow-inner">
                       Delay: <span className="text-indigo-400">{block.delay}</span>
                     </span>
                   </div>
                   
                   <textarea 
                     defaultValue={block.text}
                     className="w-full h-28 bg-[#0B0F19] border border-[#1e293b] rounded-xl p-4 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none font-medium leading-relaxed custom-scrollbar shadow-inner transition-colors"
                   />
                   
                   <div className="flex justify-between items-center mt-5">
                     <p className="text-xs text-slate-500 bg-[#0B0F19] inline-block px-3 py-1.5 rounded-lg border border-[#1e293b]">
                       <span className="text-indigo-400 font-bold">{'{}'}</span> Variables: <span className="font-mono text-slate-400 text-[11px] ml-1">checkoutUrl, leadName, productName</span>
                     </p>
                     <button className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest transition opacity-0 group-hover:opacity-100 bg-indigo-500/10 px-4 py-2 rounded-lg border border-indigo-500/20">
                       Quick Save Frame
                     </button>
                   </div>
                </div>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
}
