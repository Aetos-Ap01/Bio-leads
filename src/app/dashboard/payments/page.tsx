import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function PaymentsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.tenantId) {
    redirect("/login");
  }

  const checkoutEvents = await prisma.checkoutEvent.findMany({
    where: { tenantId: session.user.tenantId },
    include: {
      lead: true,
      product: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const totalRevenue = checkoutEvents
    .filter(e => e.status === 'completed')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalPending = checkoutEvents
    .filter(e => e.status === 'pending')
    .reduce((sum, e) => sum + e.amount, 0);

  const completedCount = checkoutEvents.filter(e => e.status === 'completed').length;
  const pendingCount = checkoutEvents.filter(e => e.status === 'pending').length;
  const failedCount = checkoutEvents.filter(e => e.status === 'failed').length;

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20';
      case 'pending': return 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20';
      case 'failed': return 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'pending': return '⏳';
      case 'failed': return '❌';
      default: return '❓';
    }
  };

  return (
    <div className="p-8">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-1">Payments</h1>
        <p className="text-slate-400 text-sm">Track all checkout events and revenue from your sales funnels</p>
      </div>

      {/* Revenue Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-[#121826] border-l-4 border-[#22C55E] rounded-xl p-6 shadow-md">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Revenue</p>
          <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500 mt-3">R$ {totalRevenue.toFixed(2)}</h3>
          <p className="text-xs text-slate-500 mt-2">{completedCount} completed transactions</p>
        </div>
        <div className="bg-[#121826] border-l-4 border-[#F59E0B] rounded-xl p-6 shadow-md">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Pending</p>
          <h3 className="text-3xl font-black text-[#F59E0B] mt-3">R$ {totalPending.toFixed(2)}</h3>
          <p className="text-xs text-slate-500 mt-2">{pendingCount} awaiting confirmation</p>
        </div>
        <div className="bg-[#121826] border-l-4 border-[#3B82F6] rounded-xl p-6 shadow-md">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Transactions</p>
          <h3 className="text-3xl font-black text-white mt-3">{checkoutEvents.length}</h3>
          <p className="text-xs text-slate-500 mt-2">All-time events</p>
        </div>
        <div className="bg-[#121826] border-l-4 border-[#EF4444] rounded-xl p-6 shadow-md">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Failed</p>
          <h3 className="text-3xl font-black text-[#EF4444] mt-3">{failedCount}</h3>
          <p className="text-xs text-slate-500 mt-2">Declined or errored</p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-[#121826] border border-[#1e293b] rounded-xl shadow-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-[#1e293b]">
          <h2 className="text-lg font-bold text-white">Transaction History</h2>
        </div>

        {checkoutEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center mb-5">
              <svg className="w-8 h-8 text-indigo-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No transactions yet</h3>
            <p className="text-slate-400 text-sm text-center max-w-sm">Payment events will appear here when leads interact with your checkout links.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1e293b]">
                  <th className="text-left px-6 py-4 text-[10px] text-slate-500 uppercase tracking-widest font-bold">Status</th>
                  <th className="text-left px-6 py-4 text-[10px] text-slate-500 uppercase tracking-widest font-bold">Lead</th>
                  <th className="text-left px-6 py-4 text-[10px] text-slate-500 uppercase tracking-widest font-bold">Product</th>
                  <th className="text-left px-6 py-4 text-[10px] text-slate-500 uppercase tracking-widest font-bold">Amount</th>
                  <th className="text-left px-6 py-4 text-[10px] text-slate-500 uppercase tracking-widest font-bold">Platform</th>
                  <th className="text-left px-6 py-4 text-[10px] text-slate-500 uppercase tracking-widest font-bold">Transaction ID</th>
                  <th className="text-left px-6 py-4 text-[10px] text-slate-500 uppercase tracking-widest font-bold">Date</th>
                </tr>
              </thead>
              <tbody>
                {checkoutEvents.map((event) => (
                  <tr key={event.id} className="border-b border-[#1e293b]/50 hover:bg-[#1e293b]/30 transition">
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] uppercase tracking-widest font-black rounded border ${getStatusStyle(event.status)}`}>
                        {getStatusIcon(event.status)} {event.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-semibold text-white">{event.lead.name || 'Unknown'}</p>
                        <p className="text-xs text-slate-500 font-mono">{event.lead.phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-300">{event.product.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-green-400">R$ {event.amount.toFixed(2)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-slate-400 uppercase tracking-wider">{event.platform || '-'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-slate-500 font-mono truncate max-w-[160px]">{event.transactionId || '-'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-slate-400">{new Date(event.createdAt).toLocaleString('pt-BR')}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
