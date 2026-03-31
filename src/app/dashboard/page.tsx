import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardMainPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.tenantId) {
    redirect("/login");
  }

  const leads = await prisma.lead.findMany({
    where: { tenantId: session.user.tenantId }
  });
  
  const today = new Date();
  today.setHours(0,0,0,0);

  const leadsToday = leads.filter(l => l.createdAt >= today).length;
  
  // Stages count
  const countNewLead = leads.filter(l => l.status === 'NEW_LEAD').length;
  const countDiagnosis = leads.filter(l => l.status === 'DIAGNOSIS').length;
  const countOffer = leads.filter(l => l.status === 'OFFER_SENT').length;
  const countCheckout = leads.filter(l => l.status === 'CHECKOUT_CLICKED').length;
  const countPurchase = leads.filter(l => l.status === 'PURCHASE_COMPLETED').length;
  
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-8">
        Overview
      </h1>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <MetricCard title="Leads Today" value={leadsToday} icon="👥" color="border-[#6366F1]" />
        <MetricCard title="Offers Sent" value={countOffer + countCheckout + countPurchase} icon="🚀" color="border-[#F59E0B]" />
        <MetricCard title="Checkout Clicked" value={countCheckout + countPurchase} icon="🖱️" color="border-[#3B82F6]" />
        <MetricCard title="Purchases Completed" value={countPurchase} icon="💰" color="border-[#22C55E]" />
      </div>

      {/* VISUAL FUNNEL */}
      <h2 className="text-xl font-bold text-white mb-6">Sales Funnel Conversion</h2>
      <div className="bg-[#121826] border border-[#1e293b] rounded-xl p-8 shadow-xl overflow-x-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 min-w-[700px]">
          <FunnelStage name="NEW LEAD" count={countNewLead} color="bg-slate-800" text="text-slate-300" />
          <FunnelArrow />
          <FunnelStage name="DIAGNOSIS" count={countDiagnosis} color="bg-purple-900/30 border-purple-500/30" text="text-purple-400" />
          <FunnelArrow />
          <FunnelStage name="OFFER SENT" count={countOffer} color="bg-[#F59E0B]/10 border-[#F59E0B]/30" text="text-[#F59E0B]" />
          <FunnelArrow />
          <FunnelStage name="CHECKOUT" count={countCheckout} color="bg-[#3B82F6]/10 border-[#3B82F6]/30" text="text-[#3B82F6]" />
          <FunnelArrow />
          <FunnelStage name="PURCHASE" count={countPurchase} color="bg-[#22C55E]/10 border-[#22C55E]/30" text="text-[#22C55E]" />
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, color }: { title: string, value: number, icon: string, color: string }) {
  return (
    <div className={`bg-[#121826] border-l-4 ${color} rounded-xl p-6 shadow-md transform hover:-translate-y-1 transition-all`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{title}</p>
          <h3 className="text-4xl font-black text-white mt-3">{value}</h3>
        </div>
        <div className="text-2xl bg-[#0B0F19] w-12 h-12 rounded-lg flex items-center justify-center border border-[#1e293b]">
          {icon}
        </div>
      </div>
    </div>
  )
}

function FunnelStage({ name, count, color, text }: { name: string, count: number, color: string, text: string }) {
  return (
    <div className={`flex-1 w-full text-center p-6 rounded-lg border border-[#1e293b] ${color} relative overflow-hidden group transition-all`}>
      <h4 className={`text-xs font-black uppercase tracking-widest ${text} mb-3`}>{name}</h4>
      <p className="text-4xl font-bold text-white">{count}</p>
    </div>
  )
}

function FunnelArrow() {
  return (
    <div className="hidden md:block text-[#1e293b] shrink-0">
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" /></svg>
    </div>
  )
}
