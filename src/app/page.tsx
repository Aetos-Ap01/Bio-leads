import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-[#0B0F19] min-h-screen text-slate-300 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Header / Nav */}
      <nav className="fixed top-0 w-full z-50 bg-[#0B0F19]/80 backdrop-blur-md border-b border-[#1e293b]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
               <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
             </div>
             <span className="text-xl font-black text-white tracking-tighter">BIO LEADS</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold tracking-wide uppercase">
            <a href="#features" className="hover:text-white transition">Funcionalidades</a>
            <a href="#about" className="hover:text-white transition">Como Funciona</a>
            <Link href="/login" className="hover:text-white transition">Login</Link>
            <Link href="/register" className="bg-white text-[#0B0F19] px-6 py-2.5 rounded-full hover:bg-slate-200 transition shadow-xl shadow-white/5">Começar Agora</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-indigo-600/10 to-transparent blur-[120px] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-8">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Automação de WhatsApp SaaS</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[0.9] mb-10">
            TRANSFORME LEADS EM <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-500">CLIENTES REAIS</span> 24H.
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-slate-400 leading-relaxed mb-12">
            O Bio Leads é o motor de vendas definitivo para o seu negócio. Automatize abordagens, acompanhe conversas em tempo real e recupere carrinhos abandonados no WhatsApp sem esforço manual.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <Link href="/register" className="w-full md:w-auto bg-indigo-600 border border-indigo-500 hover:bg-indigo-500 text-white px-10 py-4 rounded-full font-black text-sm uppercase tracking-widest transition shadow-2xl shadow-indigo-600/20 group">
               Criar minha conta grátis <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <a href="#features" className="w-full md:w-auto px-10 py-4 rounded-full border border-[#1e293b] text-white font-black text-sm uppercase tracking-widest hover:bg-[#121826] transition">Ver Demo</a>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6 bg-[#0B019]/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-10 rounded-3xl bg-[#121826] border border-[#1e293b] hover:border-indigo-500/50 transition relative group overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl group-hover:bg-indigo-500/10 transition"></div>
               <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center mb-8 text-indigo-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
               </div>
               <h3 className="text-xl font-bold text-white mb-4">Automação Inteligente</h3>
               <p className="text-sm text-slate-500 leading-relaxed">Defina scripts personalizados que respondem instantaneamente assim que o lead entra no seu funil.</p>
            </div>

            <div className="p-10 rounded-3xl bg-[#121826] border border-[#1e293b] hover:border-purple-500/50 transition relative group overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-3xl group-hover:bg-purple-500/10 transition"></div>
               <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center mb-8 text-purple-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
               </div>
               <h3 className="text-xl font-bold text-white mb-4">Múltiplos Inquilinos</h3>
               <p className="text-sm text-slate-500 leading-relaxed">Gestão poderosa de múltiplos workspaces e usuários com separação total de dados e configurações.</p>
            </div>

            <div className="p-10 rounded-3xl bg-[#121826] border border-[#1e293b] hover:border-green-500/50 transition relative group overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 blur-3xl group-hover:bg-green-500/10 transition"></div>
               <div className="w-12 h-12 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-center mb-8 text-green-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
               </div>
               <h3 className="text-xl font-bold text-white mb-4">Métricas de Venda</h3>
               <p className="text-sm text-slate-500 leading-relaxed">Dashboard analítico para acompanhar taxas de abertura, cliques em checkout e conversão final de vendas.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-[#1e293b] text-center">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-4">Bio Leads SaaS Platform © 2026</p>
          <p className="text-xs text-slate-500">Desenvolvido para alta escala e performance em vendas digitais.</p>
        </div>
      </footer>
    </div>
  );
}
