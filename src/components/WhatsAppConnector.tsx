"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import Image from "next/image";
import { getWhatsAppStatus, connectWhatsApp, disconnectWhatsApp } from "@/actions/whatsapp";

interface WhatsAppConnectorProps {
  tenantId: string | null;
}

export default function WhatsAppConnector({ tenantId }: WhatsAppConnectorProps) {
  const [status, setStatus] = useState<string>("LOADING");
  const [qrcode, setQrcode] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const checkStatus = useCallback(async () => {
    const result = await getWhatsAppStatus();
    setStatus(result.status || "UNKNOWN");
    if (result.status === "open") setQrcode(null);
  }, []);

  useEffect(() => {
    const initCheck = async () => {
      await checkStatus();
    };
    initCheck();
    const interval = setInterval(checkStatus, 15000); // Check every 15s
    return () => clearInterval(interval);
  }, [checkStatus]);

  const handleConnect = () => {
    setError(null);
    startTransition(async () => {
      const result = await connectWhatsApp();
      if (result.error) {
        setError(result.error);
      } else if (result.qrcode) {
        setQrcode(result.qrcode);
      } else if (result.status === 'CONNECTED') {
        setStatus('open');
      }
    });
  };

  const handleDisconnect = () => {
    setError(null);
    startTransition(async () => {
      const result = await disconnectWhatsApp();
      if (result.error) {
        setError(result.error);
      } else {
        setStatus("DISCONNECTED");
        setQrcode(null);
      }
    });
  };

  if (!tenantId) return null;

  return (
    <div className="bg-[#121826] border border-[#1e293b] rounded-2xl shadow-xl mb-8 overflow-hidden">
      <div className="px-7 py-5 border-b border-[#1e293b] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-white">WhatsApp Connectivity</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tight ${status === 'open' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {status === 'open' ? 'Connected' : status === 'LOADING' ? 'Checking...' : 'Disconnected'}
          </span>
        </div>
      </div>

      <div className="p-7 space-y-6">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {status === 'open' ? (
          <div className="flex flex-col items-center py-6">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-white font-bold text-lg mb-1">WhatsApp is Active!</h3>
            <p className="text-slate-400 text-sm mb-6">Your chatbot is ready to process incoming messages.</p>
            <button
              onClick={handleDisconnect}
              disabled={isPending}
              className="px-6 py-2 rounded-lg text-sm font-bold text-red-400 border border-red-500/20 hover:bg-red-500/10 transition"
            >
              {isPending ? "Processing..." : "Disconnect WhatsApp"}
            </button>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-white font-bold text-lg mb-2">Connect your Instance</h3>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                To start sending and receiving messages, you need to connect your WhatsApp account to your workspace. 
                This will create a dedicated instance for your chatbot.
              </p>
              <button
                onClick={handleConnect}
                disabled={isPending}
                className="px-8 py-3 rounded-xl text-sm font-bold text-white bg-green-600 hover:bg-green-500 transition shadow-[0_0_15px_rgba(22,163,74,0.3)] disabled:opacity-50"
              >
                {isPending ? "Generating QR Code..." : qrcode ? "Regenerate QR Code" : "Connect WhatsApp"}
              </button>
            </div>

            <div className="w-64 h-64 bg-[#0B0F19] border border-[#1e293b] rounded-xl overflow-hidden flex items-center justify-center relative group">
              {qrcode ? (
                <Image src={qrcode} alt="WhatsApp QR Code" width={256} height={256} className="w-full h-full p-2" />
              ) : isPending ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Waiting for API</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 opacity-30 group-hover:opacity-100 transition-opacity">
                  <svg className="w-12 h-12 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">No Connection</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
