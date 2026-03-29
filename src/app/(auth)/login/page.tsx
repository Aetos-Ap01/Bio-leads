"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      setError("Email ou senha incorretos");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-md space-y-8 bg-zinc-900 p-8 rounded-2xl border border-zinc-800 shadow-2xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white tracking-tight">Bem-vindo de volta</h2>
          <p className="mt-2 text-zinc-400">Acesse seu dashboard SaaS</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300">Email</label>
              <input name="email" type="email" required className="mt-1 block w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-white focus:border-indigo-500 focus:ring-indigo-500 outline-none transition" placeholder="voce@exemplo.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300">Senha</label>
              <input name="password" type="password" required className="mt-1 block w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-white focus:border-indigo-500 focus:ring-indigo-500 outline-none transition" placeholder="••••••••" />
            </div>
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button disabled={loading} type="submit" className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-zinc-900 transition disabled:opacity-50">
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-400">
          Ainda não tem conta? <Link href="/register" className="font-medium text-indigo-400 hover:text-indigo-300 transition">Registre-se</Link>
        </p>
      </div>
    </div>
  );
}
