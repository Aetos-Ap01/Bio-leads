"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Credenciais inválidas. Tente novamente.");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] relative overflow-hidden">
      {/* Decorative Blur Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 px-4">
        <div className="bg-[#121826]/80 backdrop-blur-xl p-10 rounded-3xl border border-[#1e293b] shadow-2xl relative">
          {/* Logo Placeholder */}
          <div className="flex justify-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
          </div>

          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-white tracking-tight">Bio Leads</h2>
            <p className="mt-2 text-slate-400 text-sm font-medium">Acesse sua central de automação</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Email corporativo</label>
                <div className="relative">
                  <input 
                    name="email" 
                    type="email" 
                    required 
                    className="w-full bg-[#0B0F19] border border-[#1e293b] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600 shadow-inner" 
                    placeholder="exemplo@bioleads.shop" 
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Senha de acesso</label>
                <div className="relative">
                  <input 
                    name="password" 
                    type={showPassword ? "text" : "password"} 
                    required 
                    className="w-full bg-[#0B0F19] border border-[#1e293b] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600 pr-12 shadow-inner" 
                    placeholder="••••••••" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 px-4 flex items-center text-slate-500 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-xs py-3 px-4 rounded-xl text-center font-bold">
                {error}
              </div>
            )}

            <button 
              disabled={loading} 
              type="submit" 
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl font-black text-sm tracking-widest uppercase shadow-xl shadow-indigo-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "Processando..." : "Entrar no Dashboard"}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 mt-8 font-medium">
            Problemas com o acesso? <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-bold ml-1 transition-colors underline-offset-4 hover:underline">Fale com o suporte</Link>
          </p>
        </div>
        
        <p className="text-center text-[10px] text-slate-600 mt-10 uppercase tracking-[0.2em] font-black pointer-events-none">
          Powered by Bio Leads Automation Framework
        </p>
      </div>
    </div>
  );
}
