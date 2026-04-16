"use client";

import { useState, useTransition } from "react";
import { updateAgentConfig } from "@/actions/agent";

interface AgentConfigClientProps {
  tenantId: string;
  currentMode: string;
  currentPrompt: string;
}

export default function AgentConfigClient({ tenantId, currentMode, currentPrompt }: AgentConfigClientProps) {
  const [mode, setMode] = useState(currentMode);
  const [prompt, setPrompt] = useState(currentPrompt);
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = () => {
    setMsg(null);
    startTransition(async () => {
      const result = await updateAgentConfig({ tenantId, mode, systemPrompt: prompt });
      if (result.error) {
        setMsg({ type: 'error', text: result.error });
      } else {
        setMsg({ type: 'success', text: 'Configuração salva com sucesso!' });
      }
    });
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-1">Agente de Vendas</h1>
        <p className="text-slate-400 text-sm">Configure o comportamento do bot que responde seus leads no WhatsApp</p>
      </div>

      {/* Mode Selector */}
      <div className="bg-[#121826] border border-[#1e293b] rounded-2xl shadow-xl mb-8 overflow-hidden">
        <div className="px-7 py-5 border-b border-[#1e293b]">
          <h2 className="text-lg font-bold text-white">Modo do Agente</h2>
          <p className="text-slate-400 text-sm mt-1">Escolha como o bot vai responder seus leads</p>
        </div>
        <div className="p-7 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              id: 'BOT',
              icon: '🤖',
              title: 'Bot Script',
              desc: 'Respostas fixas baseadas nos scripts que você definiun. Simples e previsível.'
            },
            {
              id: 'CLAUDE',
              icon: '⚡',
              title: 'Agente Claude',
              desc: 'IA da Anthropic responde de forma natural e inteligente, adaptando ao contexto do lead.'
            },
            {
              id: 'MANUAL',
              icon: '👤',
              title: 'Só Manual',
              desc: 'Bot desligado. Todas as conversas ficam em modo manual para atendimento humano.'
            }
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setMode(opt.id)}
              className={`p-5 rounded-xl border-2 text-left transition-all ${
                mode === opt.id
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : 'border-[#1e293b] bg-[#0B0F19] hover:border-slate-600'
              }`}
            >
              <div className="text-2xl mb-3">{opt.icon}</div>
              <h3 className="font-bold text-white text-sm mb-1">{opt.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{opt.desc}</p>
              {mode === opt.id && (
                <span className="inline-block mt-3 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                  ● Activo
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* System Prompt (only for CLAUDE mode) */}
      {mode === 'CLAUDE' && (
        <div className="bg-[#121826] border border-[#1e293b] rounded-2xl shadow-xl mb-8 overflow-hidden">
          <div className="px-7 py-5 border-b border-[#1e293b]">
            <h2 className="text-lg font-bold text-white">Instruções do Agente Claude</h2>
            <p className="text-slate-400 text-sm mt-1">
              Escreva como o Claude deve se comportar. Use variáveis: {"{leadName}"}, {"{productName}"}, {"{productPrice}"}, {"{checkoutUrl}"}
            </p>
          </div>
          <div className="p-7">
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              rows={12}
              className="w-full bg-[#0B0F19] border border-[#1e293b] rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none font-mono leading-relaxed custom-scrollbar"
              placeholder="Escreva as instruções do agente aqui..."
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {['{leadName}', '{productName}', '{productPrice}', '{checkoutUrl}'].map(v => (
                <button
                  key={v}
                  onClick={() => setPrompt(p => p + ' ' + v)}
                  className="text-[10px] font-mono bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 px-2 py-1 rounded hover:bg-indigo-500/20 transition"
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Save */}
      {msg && (
        <div className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium border ${
          msg.type === 'success'
            ? 'bg-green-500/10 border-green-500/30 text-green-400'
            : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          {msg.text}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={isPending}
        className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl font-black text-sm tracking-widest uppercase shadow-xl shadow-indigo-500/20 transition-all disabled:opacity-50"
      >
        {isPending ? 'Salvando...' : 'Salvar Configuração'}
      </button>
    </div>
  );
}
