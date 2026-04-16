"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulação de envio - no futuro integrar com provedor de email
    await new Promise(r => setTimeout(r, 1000));
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 px-4">
        <div className="bg-[#121826]/80 backdrop-blur-xl p-10 rounded-3xl border border-[#1e293b] shadow-2xl">
          <div className="flex justify-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>

          {!submitted ? (
            <>
              <div className="text-center mb-10">
                <h2 className="text-3xl font-black text-white tracking-tight">Recuperar Senha</h2>
                <p className="mt-2 text-slate-400 text-sm font-medium">Informe seu email para receber as instruções</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full bg-[#0B0F19] border border-[#1e293b] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600 shadow-inner"
                    placeholder="voce@empresa.com"
                  />
                </div>

                <button
                  disabled={loading}
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl font-black text-sm tracking-widest uppercase shadow-xl shadow-indigo-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? "Enviando..." : "Enviar instruções"}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-black text-white mb-3">Email enviado!</h2>
              <p className="text-slate-400 text-sm mb-6">
                Se existe uma conta com o email <span className="text-white font-bold">{email}</span>, receberás as instruções em breve.
              </p>
              <p className="text-xs text-slate-500">Não recebeste? Verifica o spam ou contacta o suporte.</p>
            </div>
          )}

          <p className="text-center text-xs text-slate-500 mt-8 font-medium">
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors underline-offset-4 hover:underline">
              ← Voltar ao login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
