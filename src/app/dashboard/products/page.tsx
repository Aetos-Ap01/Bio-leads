import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AddProductButton, ProductCardActions } from "@/components/ProductActions";

export default async function ProductsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.tenantId) {
    redirect("/login");
  }

  const products = await prisma.product.findMany({
    where: { tenantId: session.user.tenantId },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-1">Products Configuration</h1>
          <p className="text-slate-400 text-sm">Manage mapping, pricing and payloads for your sales funnels</p>
        </div>
        <AddProductButton />
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-20 h-20 rounded-full bg-indigo-500/10 flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-indigo-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No products yet</h3>
          <p className="text-slate-400 text-sm text-center max-w-sm">Add your first product to start configuring your automated sales funnel.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {products.map(product => (
            <div key={product.id} className="bg-[#121826] border border-[#1e293b] rounded-2xl overflow-hidden shadow-xl shadow-black/40 flex flex-col group hover:border-[#6366F1]/50 transition-colors duration-300">
              <div className="h-44 bg-gradient-to-br from-indigo-900/60 via-[#121826] to-[#0B0F19] relative flex items-center justify-center border-b border-[#1e293b] overflow-hidden">
                <div className="text-indigo-400/50 group-hover:scale-110 group-hover:text-indigo-400 transition-all duration-500 shrink-0 relative z-10">
                  <svg className="w-16 h-16 drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                </div>
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-md text-[10px] font-black text-white uppercase tracking-widest border border-white/10 shadow-lg">
                  {product.platform || 'General'}
                </div>
              </div>
              
              <div className="p-7 flex-1 flex flex-col">
                <h2 className="text-xl font-bold text-white mb-3 leading-tight">{product.name}</h2>
                
                <div className="flex items-center gap-4 mb-8 bg-[#0B0F19] p-4 rounded-xl border border-[#1e293b]">
                  <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">R$ {product.price?.toFixed(2)}</span>
                  <div className="flex flex-col">
                     <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Normal Value</span>
                     <span className="text-sm text-slate-500 line-through decoration-red-500/50 decoration-2">R$ {(product.price * 1.5).toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="space-y-5 flex-1">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Target Checkout URL</p>
                    <a href={product.checkoutUrl || '#'} target="_blank" className="text-xs text-blue-400 hover:text-blue-300 hover:underline truncate block bg-[#0B0F19] px-3.5 py-2.5 rounded-lg border border-[#1e293b] font-mono shadow-inner cursor-pointer transition">
                      {product.checkoutUrl || 'No link configured'}
                    </a>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Bot Language</p>
                      <p className="text-xs text-slate-300 font-bold px-3 py-2 bg-[#0B0F19] rounded-lg border border-[#1e293b] w-full text-center shadow-inner">{product.language || 'PT-BR'}</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Pipeline Status</p>
                      <p className="text-xs text-green-400 font-bold px-3 py-2 bg-green-400/10 rounded-lg border border-green-400/20 w-full text-center">ACTIVE</p>
                    </div>
                  </div>
                </div>
                
                <ProductCardActions product={{
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  description: product.description,
                  checkoutUrl: product.checkoutUrl,
                  platform: product.platform,
                  language: product.language,
                }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
