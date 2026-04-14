"use client";

import { useState, useTransition } from "react";
import { saveAllSteps } from "@/actions/scripts";
import type { ScriptStep } from "@prisma/client";

interface ScriptsClientProps {
  initialSteps: ScriptStep[];
}

export default function ScriptsClient({ initialSteps }: ScriptsClientProps) {
  const [steps, setSteps] = useState(initialSteps);
  const [isPending, startTransition] = useTransition();
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  const handleTextChange = (id: string, text: string) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, messageText: text } : s));
    setSaveStatus("idle");
  };

  const handleSave = () => {
    setSaveStatus("saving");
    startTransition(async () => {
      const dataToSave = steps.map(s => ({ id: s.id, messageText: s.messageText }));
      const result = await saveAllSteps(dataToSave);
      if (result.success) {
        setSaveStatus("success");
      } else {
        setSaveStatus("error");
        alert(result.error);
      }
    });
  };

  const getColor = (type: string | null) => {
    switch(type) {
      case 'intro': return 'border-blue-500/50 bg-blue-500/5 hover:border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.1)]';
      case 'bridge': return 'border-purple-500/50 bg-purple-500/5 hover:border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.1)]';
      case 'offer': return 'border-[#F59E0B]/50 bg-[#F59E0B]/5 hover:border-[#F59E0B] shadow-[0_0_15px_rgba(245,158,11,0.1)]';
      case 'follow': return 'border-slate-500/50 bg-slate-500/5 hover:border-slate-500';
      case 'post': return 'border-green-500/50 bg-green-500/5 hover:border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.1)]';
      default: return 'border-slate-700 bg-slate-800';
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-12 border-b border-[#1e293b] pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Automation Scripts</h1>
          <p className="text-slate-400 mt-2 text-sm">Visual workflow editor for your automated chat sequencing</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isPending || saveStatus === "saving"}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-lg text-sm font-bold tracking-wide transition shadow-lg shadow-indigo-500/30 disabled:opacity-50"
        >
          {isPending ? "Saving..." : saveStatus === "success" ? "Saved Successfully!" : "Save Pipeline State"}
        </button>
      </div>

      <div className="relative">
        {/* Pipeline Line Connecting Blocks */}
        <div className="absolute left-8 top-6 bottom-16 w-1 bg-[#1e293b] rounded-full"></div>
        
        <div className="space-y-10">
          {steps.map((block, idx) => (
             <div key={block.id} className="relative z-10 pl-24 pr-4">
                {/* Node Connector */}
                <div className="absolute left-[26px] top-8 w-6 h-6 rounded-full bg-[#0B0F19] border-4 border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.9)] z-20"></div>
                <div className="absolute left-8 top-[42px] w-16 h-0.5 bg-[#1e293b] z-10"></div>
                
                <div className={`bg-[#121826] border-2 ${getColor(block.type)} rounded-2xl p-7 transition-all duration-300 group`}>
                   <div className="flex justify-between items-center mb-5">
                     <div>
                       <h3 className="text-lg font-bold text-white flex items-center gap-3">
                         {block.name || `Passo ${idx + 1}`}
                       </h3>
                       <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-black">HOOK: {block.hook || "MANUAL"}</p>
                     </div>
                     <span className="px-3 py-1.5 bg-[#0B0F19] border border-[#1e293b] text-slate-300 text-[10px] uppercase font-bold tracking-widest rounded-md shadow-inner">
                        Delay: <span className="text-indigo-400">{block.delayMins || 0}m</span>
                     </span>
                   </div>
                   
                   <textarea 
                     value={block.messageText}
                     onChange={(e) => handleTextChange(block.id, e.target.value)}
                     className="w-full h-28 bg-[#0B0F19] border border-[#1e293b] rounded-xl p-4 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none font-medium leading-relaxed custom-scrollbar shadow-inner transition-colors"
                   />
                   
                   <div className="flex justify-between items-center mt-5">
                     <p className="text-xs text-slate-500 bg-[#0B0F19] inline-block px-3 py-1.5 rounded-lg border border-[#1e293b]">
                       <span className="text-indigo-400 font-bold">{'{}'}</span> Variables: <span className="font-mono text-slate-400 text-[11px] ml-1">checkoutUrl, leadName, productName</span>
                     </p>
                   </div>
                </div>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
}
