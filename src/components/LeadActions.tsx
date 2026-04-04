"use client";

import { useState, useTransition } from "react";
import { createLead, updateLead, deleteLead, updateLeadStatus } from "@/actions/leads";

interface Product {
  id: string;
  name: string;
}

interface Lead {
  id: string;
  name: string | null;
  phone: string;
  status: string;
  productId: string | null;
}

const STATUSES = [
  { value: "NEW_LEAD", label: "New Lead" },
  { value: "DIAGNOSIS", label: "Diagnosis" },
  { value: "OFFER_SENT", label: "Offer Sent" },
  { value: "CHECKOUT_CLICKED", label: "Checkout Clicked" },
  { value: "PURCHASE_COMPLETED", label: "Purchase Completed" },
  { value: "MANUAL", label: "Manual Control" },
];

// ─── Modal Overlay ───────────────────────────────────────────────

function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-[#121826] border border-[#1e293b] rounded-2xl shadow-2xl shadow-black/60 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
        {children}
      </div>
    </div>
  );
}

// ─── Lead Form ───────────────────────────────────────────────────

function LeadForm({
  lead,
  products,
  onClose,
}: {
  lead?: Lead;
  products: Product[];
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError(null);

    startTransition(async () => {
      const result = lead
        ? await updateLead(lead.id, formData)
        : await createLead(formData);

      if (result.error) {
        setError(result.error);
      } else {
        onClose();
      }
    });
  };

  return (
    <ModalOverlay onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="p-6 border-b border-[#1e293b]">
          <h2 className="text-xl font-bold text-white">
            {lead ? "Edit Lead" : "Add Lead Manually"}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {lead ? "Update lead information" : "Add a new contact to your pipeline"}
          </p>
        </div>

        <div className="p-6 space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-2">Name</label>
            <input
              name="name"
              defaultValue={lead?.name || ""}
              className="w-full bg-[#0B0F19] border border-[#1e293b] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              placeholder="Contact name"
            />
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-2">Phone Number *</label>
            <input
              name="phone"
              defaultValue={lead?.phone || ""}
              required
              className="w-full bg-[#0B0F19] border border-[#1e293b] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition font-mono"
              placeholder="5511999999999"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-2">Status</label>
              <select
                name="status"
                defaultValue={lead?.status || "NEW_LEAD"}
                className="w-full bg-[#0B0F19] border border-[#1e293b] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition appearance-none"
              >
                {STATUSES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-2">Product</label>
              <select
                name="productId"
                defaultValue={lead?.productId || ""}
                className="w-full bg-[#0B0F19] border border-[#1e293b] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition appearance-none"
              >
                <option value="">None</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-[#1e293b] flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-sm font-bold text-slate-400 hover:text-white bg-[#0B0F19] border border-[#1e293b] hover:border-slate-600 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-[#6366F1] hover:bg-indigo-500 transition shadow-[0_0_15px_rgba(99,102,241,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Saving..." : lead ? "Save Changes" : "Add Lead"}
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
}

// ─── Delete Confirmation Modal ──────────────────────────────────

function DeleteLeadModal({
  leadName,
  leadId,
  onClose,
}: {
  leadName: string;
  leadId: string;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      await deleteLead(leadId);
      onClose();
    });
  };

  return (
    <ModalOverlay onClose={onClose}>
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Delete Lead</h2>
            <p className="text-sm text-slate-400 mt-1">
              Are you sure you want to delete <span className="text-white font-semibold">&quot;{leadName}&quot;</span>? All messages and history will be lost.
            </p>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-sm font-bold text-slate-400 hover:text-white bg-[#0B0F19] border border-[#1e293b] hover:border-slate-600 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-red-600 hover:bg-red-500 transition shadow-[0_0_15px_rgba(239,68,68,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Deleting..." : "Delete Lead"}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}

// ─── Add Lead Button ────────────────────────────────────────────

export function AddLeadButton({ products }: { products: Product[] }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="bg-[#6366F1] hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg text-sm font-bold tracking-wide transition shadow-[0_0_15px_rgba(99,102,241,0.3)]"
      >
        + Add Lead Manual
      </button>
      {showModal && <LeadForm products={products} onClose={() => setShowModal(false)} />}
    </>
  );
}

// ─── Lead Card Actions ──────────────────────────────────────────

export function LeadCardActions({
  lead,
  products,
}: {
  lead: Lead;
  products: Product[];
}) {
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (newStatus: string) => {
    startTransition(async () => {
      await updateLeadStatus(lead.id, newStatus);
    });
  };

  return (
    <>
      <div className="mt-6 pt-4 border-t border-[#1e293b] space-y-3">
        <div>
          <label className="block text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Quick Status</label>
          <select
            value={lead.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={isPending}
            className="w-full bg-[#0B0F19] border border-[#1e293b] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition appearance-none disabled:opacity-50"
          >
            {STATUSES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowEdit(true)}
            className="flex-1 bg-[#1e293b] hover:bg-slate-700 text-white py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition"
          >
            Edit Lead
          </button>
          <button
            onClick={() => setShowDelete(true)}
            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2.5 rounded-lg text-xs font-bold transition border border-red-500/20 hover:border-red-500/40"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      {showEdit && <LeadForm lead={lead} products={products} onClose={() => setShowEdit(false)} />}
      {showDelete && (
        <DeleteLeadModal
          leadName={lead.name || lead.phone}
          leadId={lead.id}
          onClose={() => setShowDelete(false)}
        />
      )}
    </>
  );
}
