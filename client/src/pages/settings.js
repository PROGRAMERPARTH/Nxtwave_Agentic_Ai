import React, { useState } from 'react';
import Head from 'next/head';
import ProtectedRoute from '../components/ProtectedRoute';
import AppShell from '../components/AppShell';
import useAuthStore from '../store/authStore';
import { User, Shield, Key, Database, Cpu, CheckCircle2, Lock } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <ProtectedRoute>
      <AppShell>
        <Head>
          <title>Settings | Agentflow AI</title>
        </Head>

        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Platform Settings</h1>
            <p className="text-xs text-zinc-400 mt-1">
              Configure operator profile, security controls, and integration engine parameters
            </p>
          </div>

          <div className="flex border-b border-[#2a2a3a] gap-6 text-sm font-medium">
            <button
              onClick={() => setActiveTab('profile')}
              className={`pb-3 border-b-2 flex items-center gap-2 transition ${
                activeTab === 'profile'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <User size={16} /> Operator Profile
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`pb-3 border-b-2 flex items-center gap-2 transition ${
                activeTab === 'security'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Shield size={16} /> Security & Keys
            </button>
            <button
              onClick={() => setActiveTab('system')}
              className={`pb-3 border-b-2 flex items-center gap-2 transition ${
                activeTab === 'system'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Database size={16} /> System Health
            </button>
          </div>

          {activeTab === 'profile' && (
            <div className="bg-[#13131d] border border-[#2a2a3a] rounded-xl p-6 space-y-6">
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Account Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs text-zinc-400 mb-2">Operator Name</label>
                  <input type="text" disabled value={user?.name || ''} className="input bg-[#181824] text-zinc-300" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-2">Work Email</label>
                  <input type="text" disabled value={user?.email || ''} className="input bg-[#181824] text-zinc-300" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-2">Assigned Role</label>
                  <span className="badge badge-info uppercase">{user?.role || 'operator'}</span>
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-2">Operator ID</label>
                  <span className="text-xs font-mono text-zinc-500">{user?.id || user?._id || 'N/A'}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-[#13131d] border border-[#2a2a3a] rounded-xl p-6 space-y-6">
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Encryption & Vault Configuration</h2>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-[#181824] border border-[#2a2a3a] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Key className="text-indigo-400" size={20} />
                    <div>
                      <div className="text-sm font-medium text-white">OAuth Credential Encryption</div>
                      <div className="text-xs text-zinc-400">AES-256-GCM application-level vault</div>
                    </div>
                  </div>
                  <span className="badge badge-success">Active & Encrypted</span>
                </div>

                <div className="p-4 rounded-lg bg-[#181824] border border-[#2a2a3a] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Lock className="text-emerald-400" size={20} />
                    <div>
                      <div className="text-sm font-medium text-white">Password Hashing</div>
                      <div className="text-xs text-zinc-400">Bcrypt cost factor 12</div>
                    </div>
                  </div>
                  <span className="badge badge-success">Enforced</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="bg-[#13131d] border border-[#2a2a3a] rounded-xl p-6 space-y-6">
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Subsystem Diagnostics</h2>
              <div className="space-y-3">
                <div className="p-3 bg-[#181824] border border-[#2a2a3a] rounded-lg flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-300">Multi-Agent Engine</span>
                  <span className="badge badge-success">5 Agents Ready</span>
                </div>
                <div className="p-3 bg-[#181824] border border-[#2a2a3a] rounded-lg flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-300">Execution Background Queue</span>
                  <span className="badge badge-info">BullMQ / In-Memory Worker</span>
                </div>
                <div className="p-3 bg-[#181824] border border-[#2a2a3a] rounded-lg flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-300">Live Socket Event Stream</span>
                  <span className="badge badge-success">Connected</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
