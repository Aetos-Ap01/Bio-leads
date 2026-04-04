"use client";

import { useState, useTransition } from "react";
import { updateProfile, changePassword, updateTenantName, updateEvolutionConfig } from "@/actions/settings";
import WhatsAppConnector from "./WhatsAppConnector";

interface SettingsClientProps {
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
  tenantName: string;
  tenantId: string;
  evolutionConfig?: {
    apiUrl: string;
    globalKey: string;
  } | null;
}

export default function SettingsClient({ user, tenantName, tenantId, evolutionConfig }: SettingsClientProps) {
  // Profile state
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isPendingProfile, startProfileTransition] = useTransition();

  // Password state
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isPendingPassword, startPasswordTransition] = useTransition();

  // Tenant state
  const [tenantMsg, setTenantMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isPendingTenant, startTenantTransition] = useTransition();

  // Evolution state
  const [evolutionMsg, setEvolutionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isPendingEvolution, startEvolutionTransition] = useTransition();

  // Visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showGlobalKey, setShowGlobalKey] = useState(false);

  const handleProfileSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setProfileMsg(null);
    startProfileTransition(async () => {
      const result = await updateProfile(formData);
      if (result.error) {
        setProfileMsg({ type: 'error', text: result.error });
      } else {
        setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
      }
    });
  };

  const handlePasswordSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setPasswordMsg(null);
    startPasswordTransition(async () => {
      const result = await changePassword(formData);
      if (result.error) {
        setPasswordMsg({ type: 'error', text: result.error });
      } else {
        setPasswordMsg({ type: 'success', text: 'Password changed successfully!' });
        (e.target as HTMLFormElement).reset();
      }
    });
  };

  const handleTenantSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setTenantMsg(null);
    startTenantTransition(async () => {
      const result = await updateTenantName(formData);
      if (result.error) {
        setTenantMsg({ type: 'error', text: result.error });
      } else {
        setTenantMsg({ type: 'success', text: 'Workspace name updated!' });
      }
    });
  };

  const handleEvolutionSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setEvolutionMsg(null);
    startEvolutionTransition(async () => {
      const result = await updateEvolutionConfig(formData);
      if (result.error) {
        setEvolutionMsg({ type: 'error', text: result.error });
      } else {
        setEvolutionMsg({ type: 'success', text: 'Evolution API configuration updated!' });
      }
    });
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-1">Settings</h1>
        <p className="text-slate-400 text-sm">Manage your account, workspace, and preferences</p>
      </div>

      {/* WhatsApp Connectivity Section */}
      <WhatsAppConnector tenantId={tenantId} />

      {/* Profile Section */}
      <div className="bg-[#121826] border border-[#1e293b] rounded-2xl shadow-xl mb-8 overflow-hidden">
        <div className="px-7 py-5 border-b border-[#1e293b] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
            <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-white">Profile Information</h2>
        </div>
        <form onSubmit={handleProfileSubmit} className="p-7 space-y-5">
          {profileMsg && (
            <div className={`px-4 py-3 rounded-lg text-sm font-medium border ${profileMsg.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
              {profileMsg.text}
            </div>
          )}
          <div>
            <label className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-2">Full Name</label>
            <input
              name="name"
              defaultValue={user.name || ""}
              required
              className="w-full bg-[#0B0F19] border border-[#1e293b] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            />
          </div>
          <div>
            <label className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-2">Email Address</label>
            <input
              name="email"
              type="email"
              defaultValue={user.email || ""}
              required
              className="w-full bg-[#0B0F19] border border-[#1e293b] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            />
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isPendingProfile}
              className="px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-[#6366F1] hover:bg-indigo-500 transition shadow-[0_0_15px_rgba(99,102,241,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPendingProfile ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
      </div>

      {/* Password Section */}
      <div className="bg-[#121826] border border-[#1e293b] rounded-2xl shadow-xl mb-8 overflow-hidden">
        <div className="px-7 py-5 border-b border-[#1e293b] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-white">Change Password</h2>
        </div>
        <form onSubmit={handlePasswordSubmit} className="p-7 space-y-5">
          {passwordMsg && (
            <div className={`px-4 py-3 rounded-lg text-sm font-medium border ${passwordMsg.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
              {passwordMsg.text}
            </div>
          )}
          <div>
            <label className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-2">Current Password</label>
            <div className="relative">
              <input
                name="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                required
                className="w-full bg-[#0B0F19] border border-[#1e293b] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-white transition-colors"
              >
                {showCurrentPassword ? (
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-2">New Password</label>
              <div className="relative">
                <input
                  name="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  required
                  minLength={6}
                  className="w-full bg-[#0B0F19] border border-[#1e293b] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-white transition-colors"
                >
                  {showNewPassword ? (
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
            <div>
              <label className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-2">Confirm Password</label>
              <div className="relative">
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  minLength={6}
                  className="w-full bg-[#0B0F19] border border-[#1e293b] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? (
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
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isPendingPassword}
              className="px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-amber-600 hover:bg-amber-500 transition shadow-[0_0_15px_rgba(245,158,11,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPendingPassword ? "Changing..." : "Change Password"}
            </button>
          </div>
        </form>
      </div>

      {/* Workspace Section */}
      <div className="bg-[#121826] border border-[#1e293b] rounded-2xl shadow-xl mb-8 overflow-hidden">
        <div className="px-7 py-5 border-b border-[#1e293b] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-white">Workspace</h2>
        </div>
        <form onSubmit={handleTenantSubmit} className="p-7 space-y-5">
          {tenantMsg && (
            <div className={`px-4 py-3 rounded-lg text-sm font-medium border ${tenantMsg.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
              {tenantMsg.text}
            </div>
          )}
          <div>
            <label className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-2">Workspace Name</label>
            <input
              name="tenantName"
              defaultValue={tenantName}
              required
              className="w-full bg-[#0B0F19] border border-[#1e293b] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            />
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isPendingTenant}
              className="px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-purple-600 hover:bg-purple-500 transition shadow-[0_0_15px_rgba(168,85,247,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPendingTenant ? "Saving..." : "Update Workspace"}
            </button>
          </div>
        </form>
      </div>

      {/* Evolution API Configuration */}
      <div className="bg-[#121826] border border-[#1e293b] rounded-2xl shadow-xl mb-8 overflow-hidden">
        <div className="px-7 py-5 border-b border-[#1e293b] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-white">Evolution API Configuration</h2>
        </div>
        <form onSubmit={handleEvolutionSubmit} className="p-7 space-y-5">
          {evolutionMsg && (
            <div className={`px-4 py-3 rounded-lg text-sm font-medium border ${evolutionMsg.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
              {evolutionMsg.text}
            </div>
          )}
          <div>
            <label className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-2">API URL</label>
            <input
              name="apiUrl"
              type="url"
              defaultValue={evolutionConfig?.apiUrl || ""}
              placeholder="https://your-evolution-api.com"
              required
              className="w-full bg-[#0B0F19] border border-[#1e293b] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition"
            />
          </div>
          <div>
            <label className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-2">Global API Key</label>
            <div className="relative">
              <input
                name="globalKey"
                type={showGlobalKey ? "text" : "password"}
                defaultValue={evolutionConfig?.globalKey || ""}
                placeholder="Your Evolution API global key"
                required
                className="w-full bg-[#0B0F19] border border-[#1e293b] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition pr-10"
              />
              <button
                type="button"
                onClick={() => setShowGlobalKey(!showGlobalKey)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-white transition-colors"
              >
                {showGlobalKey ? (
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
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isPendingEvolution}
              className="px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-green-600 hover:bg-green-500 transition shadow-[0_0_15px_rgba(34,197,94,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPendingEvolution ? "Saving..." : "Save Configuration"}
            </button>
          </div>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="bg-[#121826] border border-red-500/20 rounded-2xl shadow-xl overflow-hidden">
        <div className="px-7 py-5 border-b border-red-500/20 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
            <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-red-400">Danger Zone</h2>
        </div>
        <div className="p-7">
          <p className="text-sm text-slate-400 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
          <button
            disabled
            className="px-6 py-2.5 rounded-lg text-sm font-bold text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition cursor-not-allowed opacity-50"
          >
            Delete Account (Contact Support)
          </button>
        </div>
      </div>
    </div>
  );
}
