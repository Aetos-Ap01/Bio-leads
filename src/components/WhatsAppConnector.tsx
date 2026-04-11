"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import Image from "next/image";
import { getWhatsAppStatus, connectWhatsApp, connectWhatsAppByPhone, disconnectWhatsApp } from "@/actions/whatsapp";

interface WhatsAppConnectorProps {
  tenantId: string | null;
}

export default function WhatsAppConnector({ tenantId }: WhatsAppConnectorProps) {
  const [status, setStatus] = useState<string>("LOADING");
  const [qrcode, setQrcode] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [connectionMethod, setConnectionMethod] = useState<'qrcode' | 'phone'>('qrcode');
  const [phoneNumber, setPhoneNumber] = useState<string>('');

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
      if (connectionMethod === 'phone' && phoneNumber) {
        const result = await connectWhatsAppByPhone(phoneNumber);
        if (result.error) {
          setError(result.error);
        } else if (result.status === 'CONNECTED') {
          setStatus('open');
        } else {
          setError('Failed to connect with phone number');
        }
      } else {
        const result = await connectWhatsApp();
        if (result.error) {
          setError(result.error);
        } else if (result.qrcode) {
          setQrcode(result.qrcode);
        } else if (result.status === 'CONNECTED') {
          setStatus('open');
        }
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
          <div className="space-y-6">
            {/* Connection Method Selection */}
            <div className="flex flex-col gap-4">
              <h3 className="text-white font-bold text-lg mb-2">Choose Connection Method</h3>
              <div className="flex gap-4">
                <button
                  onClick={() => setConnectionMethod('qrcode')}
                  className={`flex-1 px-4 py-3 rounded-lg border transition ${
                    connectionMethod === 'qrcode'
                      ? 'bg-green-500/20 border-green-500/50 text-green-400'
                      : 'bg-[#0B0F19] border-[#1e293b] text-slate-400 hover:border-green-500/30'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                    <span className="font-medium">QR Code</span>
                  </div>
                </button>
                <button
                  onClick={() => setConnectionMethod('phone')}
                  className={`flex-1 px-4 py-3 rounded-lg border transition ${
                    connectionMethod === 'phone'
                      ? 'bg-green-500/20 border-green-500/50 text-green-400'
                      : 'bg-[#0B0F19] border-[#1e293b] text-slate-400 hover:border-green-500/30'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="font-medium">Phone Number</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Connection Content */}
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-white font-bold text-lg mb-2">
                  {connectionMethod === 'qrcode' ? 'Connect with QR Code' : 'Connect with Phone Number'}
                </h3>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                  {connectionMethod === 'qrcode' 
                    ? 'Scan the QR code with your WhatsApp app to connect your account.'
                    : 'Enter your WhatsApp number to receive a connection code via SMS.'
                  }
                </p>
                
                {connectionMethod === 'phone' && (
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+5511999998888"
                    className="w-full mb-4 bg-[#0B0F19] border border-[#1e293b] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition"
                  />
                )}
                
                <button
                  onClick={handleConnect}
                  disabled={isPending || (connectionMethod === 'phone' && !phoneNumber)}
                  className="px-8 py-3 rounded-xl text-sm font-bold text-white bg-green-600 hover:bg-green-500 transition shadow-[0_0_15px_rgba(22,163,74,0.3)] disabled:opacity-50"
                >
                  {isPending 
                    ? (connectionMethod === 'qrcode' ? "Generating QR Code..." : "Connecting...")
                    : (connectionMethod === 'qrcode' ? (qrcode ? "Regenerate QR Code" : "Connect WhatsApp") : "Connect with Phone")
                  }
                </button>
              </div>

              {connectionMethod === 'qrcode' && (
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
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
