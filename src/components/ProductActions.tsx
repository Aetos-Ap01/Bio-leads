"use client";

import { useState, useTransition } from "react";
import { createProduct, updateProduct, deleteProduct } from "@/actions/products";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string | null;
  checkoutUrl: string | null;
  platform: string | null;
  language: string | null;
}

// ─── Modal Overlay ───────────────────────────────────────────────

function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-[#121826] border border-[#1e293b] rounded-2xl shadow-2xl shadow-black/60 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto custom-scrollbar animate-in">
        {children}
      </div>
    </div>
  );
}

// ─── Product Form (shared by create + edit) ──────────────────────

function ProductForm({
  product,
  onClose,
}: {
  product?: Product;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError(null);

    startTransition(async () => {
      const result = product
        ? await updateProduct(product.id, formData)
        : await createProduct(formData);

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
            {product ? "Edit Product" : "New Product"}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {product ? "Update the product details below" : "Configure a new product for your sales funnel"}
          </p>
        </div>

        <div className="p-6 space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-2">Product Name *</label>
            <input
              name="name"
              defaultValue={product?.name || ""}
              required
              className="w-full bg-[#0B0F19] border border-[#1e293b] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              placeholder="e.g. Ebook Renascimento Interior"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-2">Price (R$) *</label>
              <input
                name="price"
                type="number"
                step="0.01"
                min="0"
                defaultValue={product?.price || ""}
                required
                className="w-full bg-[#0B0F19] border border-[#1e293b] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                placeholder="19.90"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-2">Platform</label>
              <select
                name="platform"
                defaultValue={product?.platform || ""}
                className="w-full bg-[#0B0F19] border border-[#1e293b] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition appearance-none"
              >
                <option value="">Select platform</option>
                <option value="Hotmart">Hotmart</option>
                <option value="Kiwify">Kiwify</option>
                <option value="Eduzz">Eduzz</option>
                <option value="Monetizze">Monetizze</option>
                <option value="Shopify">Shopify</option>
                <option value="Stripe">Stripe</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-2">Checkout URL</label>
            <input
              name="checkoutUrl"
              defaultValue={product?.checkoutUrl || ""}
              className="w-full bg-[#0B0F19] border border-[#1e293b] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition font-mono"
              placeholder="https://pay.hotmart.com/..."
            />
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-2">Description</label>
            <textarea
              name="description"
              defaultValue={product?.description || ""}
              rows={3}
              className="w-full bg-[#0B0F19] border border-[#1e293b] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition resize-none custom-scrollbar"
              placeholder="Brief description of the product..."
            />
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-2">Bot Language</label>
            <select
              name="language"
              defaultValue={product?.language || "PT-BR"}
              className="w-full bg-[#0B0F19] border border-[#1e293b] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition appearance-none"
            >
              <option value="PT-BR">Português (BR)</option>
              <option value="EN">English</option>
              <option value="ES">Español</option>
            </select>
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
            {isPending ? "Saving..." : product ? "Save Changes" : "Create Product"}
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
}

// ─── Delete Confirmation Modal ──────────────────────────────────

function DeleteConfirmModal({
  productName,
  productId,
  onClose,
}: {
  productName: string;
  productId: string;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      await deleteProduct(productId);
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
            <h2 className="text-xl font-bold text-white">Delete Product</h2>
            <p className="text-sm text-slate-400 mt-1">
              Are you sure you want to delete <span className="text-white font-semibold">&quot;{productName}&quot;</span>? This action cannot be undone.
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
            {isPending ? "Deleting..." : "Delete Product"}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}

// ─── Add Product Button ─────────────────────────────────────────

export function AddProductButton() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="bg-[#6366F1] hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg text-sm font-bold tracking-wide transition shadow-[0_0_15px_rgba(99,102,241,0.4)]"
      >
        + Add Product
      </button>
      {showModal && <ProductForm onClose={() => setShowModal(false)} />}
    </>
  );
}

// ─── Product Card Actions (Edit + Delete) ───────────────────────

export function ProductCardActions({ product }: { product: Product }) {
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  return (
    <>
      <div className="mt-8 flex gap-3">
        <button
          onClick={() => setShowEdit(true)}
          className="flex-1 bg-[#1e293b] hover:bg-slate-700 text-white py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition border border-[#334155] hover:border-slate-500 shadow-md"
        >
          Edit Configuration
        </button>
        <button
          onClick={() => setShowDelete(true)}
          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-3 rounded-lg text-xs font-bold transition border border-red-500/20 hover:border-red-500/40"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
      {showEdit && <ProductForm product={product} onClose={() => setShowEdit(false)} />}
      {showDelete && (
        <DeleteConfirmModal
          productName={product.name}
          productId={product.id}
          onClose={() => setShowDelete(false)}
        />
      )}
    </>
  );
}
