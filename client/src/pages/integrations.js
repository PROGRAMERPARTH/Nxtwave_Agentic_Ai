import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import AppShell from '@/components/AppShell';
import ProtectedRoute from '@/components/ProtectedRoute';
import { integrationAPI } from '@/services/api';
import {
  Plug,
  Mail,
  MessageSquare,
  Hash,
  Table,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  RefreshCw,
  ExternalLink,
  Plus,
  ShieldCheck,
  Zap,
} from 'lucide-react';

const PROVIDER_METADATA = {
  gmail: {
    name: 'Gmail & Google Workspace',
    icon: Mail,
    color: '#EA4335',
    bgLight: 'rgba(234, 67, 53, 0.1)',
    description: 'Send automated emails, parse incoming messages, create drafts, and process invoice receipts.',
    fields: [
      { name: 'email', label: 'Google Account Email', type: 'email', placeholder: 'operator@company.com' },
      { name: 'accessToken', label: 'OAuth Access Token (or App Password)', type: 'password', placeholder: 'ya29.a0AfH6...' },
    ],
  },
  slack: {
    name: 'Slack',
    icon: MessageSquare,
    color: '#4A154B',
    bgLight: 'rgba(74, 21, 75, 0.15)',
    description: 'Post structured alerts to channels, notify on-call engineers, and dispatch interactive message blocks.',
    fields: [
      { name: 'webhookUrl', label: 'Incoming Webhook URL', type: 'text', placeholder: 'https://hooks.slack.com/services/...' },
      { name: 'teamName', label: 'Slack Workspace Name', type: 'text', placeholder: 'Acme-Corp' },
      { name: 'accessToken', label: 'Bot User OAuth Token (Optional)', type: 'password', placeholder: 'xoxb-...' },
    ],
  },
  discord: {
    name: 'Discord',
    icon: Hash,
    color: '#5865F2',
    bgLight: 'rgba(88, 101, 242, 0.15)',
    description: 'Send alerts to channels via webhooks or bot integrations for 24/7 autonomous notifications.',
    fields: [
      { name: 'webhookUrl', label: 'Discord Webhook URL', type: 'text', placeholder: 'https://discord.com/api/webhooks/...' },
      { name: 'serverName', label: 'Server / Guild Name', type: 'text', placeholder: 'DevOps Discord' },
      { name: 'botToken', label: 'Bot Token (Optional)', type: 'password', placeholder: 'Bot MTI...' },
    ],
  },
  'google-sheets': {
    name: 'Google Sheets',
    icon: Table,
    color: '#0F9D58',
    bgLight: 'rgba(15, 157, 88, 0.15)',
    description: 'Append rows, extract structured data, update inventory tables, and sync workflow results.',
    fields: [
      { name: 'email', label: 'Authorized Google Account', type: 'email', placeholder: 'finance@company.com' },
      { name: 'accessToken', label: 'OAuth Access Token', type: 'password', placeholder: 'ya29.a0AfH6...' },
    ],
  },
};

export default function IntegrationsPage() {
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testingProvider, setTestingProvider] = useState(null);
  const [testResults, setTestResults] = useState({});
  const [activeModal, setActiveModal] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await integrationAPI.getStatus();
      if (res.data?.success) {
        setStatuses(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch integration statuses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleOpenConnect = (provider) => {
    setActiveModal(provider);
    setFormData({});
  };

  const handleSaveConnection = async (e) => {
    e.preventDefault();
    if (!activeModal) return;

    try {
      setSaving(true);
      const meta = { ...formData };
      delete meta.accessToken;
      delete meta.refreshToken;

      const payload = {
        provider: activeModal,
        accessToken: formData.accessToken || 'simulated_oauth_token_' + Date.now(),
        refreshToken: formData.refreshToken || 'simulated_refresh_token',
        metadata: meta,
      };

      const res = await integrationAPI.connect(payload);
      if (res.data?.success) {
        setNotification({ type: 'success', message: `Connected to ${PROVIDER_METADATA[activeModal]?.name || activeModal} successfully!` });
        setActiveModal(null);
        fetchStatus();
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.response?.data?.error || 'Failed to save integration.' });
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async (provider) => {
    try {
      setTestingProvider(provider);
      const res = await integrationAPI.test(provider);
      if (res.data?.success) {
        setTestResults((prev) => ({
          ...prev,
          [provider]: { ok: true, message: res.data.data.message || 'Connection test successful!' },
        }));
      } else {
        setTestResults((prev) => ({
          ...prev,
          [provider]: { ok: false, message: res.data.data?.message || 'Connection test failed.' },
        }));
      }
    } catch (err) {
      setTestResults((prev) => ({
        ...prev,
        [provider]: { ok: false, message: err.response?.data?.error || 'Test failed.' },
      }));
    } finally {
      setTestingProvider(null);
    }
  };

  const handleDisconnect = async (provider) => {
    if (!confirm(`Are you sure you want to disconnect ${PROVIDER_METADATA[provider]?.name || provider}?`)) return;

    try {
      const res = await integrationAPI.disconnect(provider);
      if (res.data?.success) {
        setNotification({ type: 'info', message: `Disconnected ${PROVIDER_METADATA[provider]?.name || provider}.` });
        fetchStatus();
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to disconnect integration.' });
    }
  };

  const connectedCount = statuses.filter((s) => s.status === 'connected').length;

  return (
    <ProtectedRoute>
      <AppShell>
        <Head>
          <title>Integrations | Agentflow_AI</title>
        </Head>

        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Plug size={28} color="var(--primary-400)" />
                Connected Integrations
              </h1>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.35rem', fontSize: '0.95rem' }}>
                Manage API credentials, OAuth connections, and security tokens used by the Execution Agent.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={fetchStatus}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                }}
              >
                <RefreshCw size={15} />
                Refresh
              </button>
            </div>
          </div>

          {/* Toast Notification */}
          {notification && (
            <div
              style={{
                padding: '0.85rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.5rem',
                background: notification.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                border: `1px solid ${notification.type === 'error' ? 'var(--danger-500)' : 'var(--success-500)'}`,
                color: notification.type === 'error' ? '#f87171' : '#34d399',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>{notification.message}</span>
              <button
                onClick={() => setNotification(null)}
                style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
          )}

          {/* Security Banner */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.25rem 1.5rem',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              borderRadius: 'var(--radius-lg)',
              marginBottom: '2rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(99, 102, 241, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary-400)',
                }}
              >
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  AES-256-GCM Encrypted Credential Vault
                </h4>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                  All OAuth tokens, API secrets, and webhook URLs are encrypted at rest with AES-256-GCM authenticated cipher. Secrets are never exposed to the client or in telemetry logs.
                </p>
              </div>
            </div>
            <div style={{ textAlign: 'right', minWidth: '130px' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-400)' }}>
                {connectedCount} / {Object.keys(PROVIDER_METADATA).length}
              </span>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Providers Connected</div>
            </div>
          </div>

          {/* Providers Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {Object.entries(PROVIDER_METADATA).map(([key, meta]) => {
              const statusObj = statuses.find((s) => s.provider === key);
              const isConnected = statusObj?.status === 'connected';
              const isExpired = statusObj?.status === 'expired';
              const Icon = meta.icon;
              const testResult = testResults[key];

              return (
                <div
                  key={key}
                  style={{
                    background: 'var(--bg-card)',
                    border: `1px solid ${isConnected ? 'rgba(99, 102, 241, 0.3)' : 'var(--border-color)'}`,
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: isConnected ? '0 4px 20px rgba(0,0,0,0.2)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div>
                    {/* Card Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: 'var(--radius-md)',
                            background: meta.bgLight,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: meta.color,
                          }}
                        >
                          <Icon size={24} />
                        </div>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {meta.name}
                          </h3>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                            {key}
                          </div>
                        </div>
                      </div>

                      {/* Status Tag */}
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.25rem 0.65rem',
                          borderRadius: '999px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background: isConnected
                            ? 'rgba(16, 185, 129, 0.15)'
                            : isExpired
                            ? 'rgba(245, 158, 11, 0.15)'
                            : 'rgba(100, 116, 139, 0.15)',
                          color: isConnected ? '#34d399' : isExpired ? '#fbbf24' : 'var(--text-secondary)',
                          border: `1px solid ${
                            isConnected ? 'rgba(16, 185, 129, 0.3)' : isExpired ? 'rgba(245, 158, 11, 0.3)' : 'rgba(100, 116, 139, 0.3)'
                          }`,
                        }}
                      >
                        {isConnected ? (
                          <>
                            <CheckCircle2 size={12} /> Connected
                          </>
                        ) : isExpired ? (
                          <>
                            <AlertTriangle size={12} /> Expired
                          </>
                        ) : (
                          <>
                            <XCircle size={12} /> Disconnected
                          </>
                        )}
                      </span>
                    </div>

                    {/* Description */}
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.5', margin: '0 0 1.25rem 0' }}>
                      {meta.description}
                    </p>

                    {/* Test result feedback */}
                    {testResult && (
                      <div
                        style={{
                          padding: '0.5rem 0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.775rem',
                          marginBottom: '1rem',
                          background: testResult.ok ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          border: `1px solid ${testResult.ok ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                          color: testResult.ok ? '#34d399' : '#f87171',
                        }}
                      >
                        {testResult.message}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                    {isConnected ? (
                      <>
                        <button
                          onClick={() => handleTestConnection(key)}
                          disabled={testingProvider === key}
                          style={{
                            flex: 1,
                            padding: '0.5rem 0.75rem',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-md)',
                            color: 'var(--text-primary)',
                            fontSize: '0.825rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.4rem',
                          }}
                        >
                          <Zap size={14} color="var(--primary-400)" />
                          {testingProvider === key ? 'Testing...' : 'Test Connection'}
                        </button>
                        <button
                          onClick={() => handleDisconnect(key)}
                          style={{
                            padding: '0.5rem 0.75rem',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: 'var(--radius-md)',
                            color: '#f87171',
                            fontSize: '0.825rem',
                            cursor: 'pointer',
                          }}
                        >
                          Disconnect
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleOpenConnect(key)}
                        style={{
                          width: '100%',
                          padding: '0.6rem 1rem',
                          background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-500) 100%)',
                          border: 'none',
                          borderRadius: 'var(--radius-md)',
                          color: '#fff',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
                        }}
                      >
                        <Plus size={16} />
                        Connect {meta.name}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Connect Modal */}
          {activeModal && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.7)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 100,
                padding: '1rem',
              }}
            >
              <div
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-xl)',
                  width: '100%',
                  maxWidth: '520px',
                  padding: '2rem',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: 'var(--radius-md)',
                        background: PROVIDER_METADATA[activeModal]?.bgLight,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: PROVIDER_METADATA[activeModal]?.color,
                      }}
                    >
                      {React.createElement(PROVIDER_METADATA[activeModal]?.icon || Plug, { size: 20 })}
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Connect {PROVIDER_METADATA[activeModal]?.name}
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveModal(null)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.25rem' }}
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSaveConnection}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                    {(PROVIDER_METADATA[activeModal]?.fields || []).map((field) => (
                      <div key={field.name}>
                        <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                          {field.label}
                        </label>
                        <input
                          type={field.type}
                          placeholder={field.placeholder}
                          value={formData[field.name] || ''}
                          onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.65rem 0.85rem',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-md)',
                            color: 'var(--text-primary)',
                            fontSize: '0.875rem',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      style={{
                        padding: '0.65rem 1.25rem',
                        background: 'transparent',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      style={{
                        padding: '0.65rem 1.5rem',
                        background: 'var(--primary-600)',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        color: '#fff',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                      }}
                    >
                      {saving ? 'Encrypting & Saving...' : 'Save & Authorize'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
