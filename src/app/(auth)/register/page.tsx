"use client";

import { useState } from "react";
import { registerUser } from "@/actions/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Register() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    const formData = new FormData(e.currentTarget);
    const res = await registerUser(formData);
    
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.push("/login?registered=true");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-md space-y-8 bg-zinc-900 p-8 rounded-2xl border border-zinc-800 shadow-2xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white tracking-tight">Crie sua conta</h2>
          <p className="mt-2 text-zinc-400">Transforme leads em clientes automaticamente</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300">Nome</label>
              <input name="name" type="text" required className="mt-1 block w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-white focus:border-indigo-500 focus:ring-indigo-500 outline-none transition" placeholder="Seu nome" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300">Email</label>
              <input name="email" type="email" required className="mt-1 block w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-white focus:border-indigo-500 focus:ring-indigo-500 outline-none transition" placeholder="voce@exemplo.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300">Senha</label>
              <div className="relative mt-1">
                <input 
                  name="password" 
                  type={showPassword ? "text" : "password"} 
                  required 
                  className="block w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-white focus:border-indigo-500 focus:ring-indigo-500 outline-none transition pr-10" 
                  placeholder="••••••••" 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.822 7.822L21 21m-2.228-2.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.644C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button disabled={loading} type="submit" className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-zinc-900 transition disabled:opacity-50">
            {loading ? "Criando..." : "Criar Conta"}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-400">
          Já tem uma conta? <Link href="/login" className="font-medium text-indigo-400 hover:text-indigo-300 transition">Entre aqui</Link>
        </p>
      </div>
    </div>
  );
}
