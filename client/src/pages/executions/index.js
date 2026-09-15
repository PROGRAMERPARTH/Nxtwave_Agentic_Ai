import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import ProtectedRoute from '@/components/ProtectedRoute';
import { executionAPI } from '@/services/api';
import {
  Activity,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Search,
  Filter,
  ArrowRight,
  AlertCircle,
  PauseCircle,
  Cpu,
} from 'lucide-react';

const STATUS_FILTERS = [
  { label: 'All Executions', value: '' },
  { label: 'Running', value: 'RUNNING' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Failed', value: 'FAILED' },
  { label: 'Retrying', value: 'RETRYING' },
  { label: 'Paused', value: 'PAUSED' },
];

export default function ExecutionsPage() {
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const fetchExecutions = async (page = 1) => {
    try {
      setLoading(true);
      const res = await executionAPI.list({
        status: statusFilter || undefined,
        page,
        limit: 15,
      });
      if (res.data?.success) {
        setExecutions(res.data.data.executions || []);
        setPagination(res.data.data.pagination || { page: 1, pages: 1, total: 0 });
      }
    } catch (err) {
      console.error('Failed to fetch executions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExecutions(1);
  }, [statusFilter]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return {
          bg: 'rgba(16, 185, 129, 0.15)',
          color: '#34d399',
          border: 'rgba(16, 185, 129, 0.3)',
          icon: CheckCircle2,
          text: 'Completed',
        };
      case 'RUNNING':
        return {
          bg: 'rgba(59, 130, 246, 0.15)',
          color: '#60a5fa',
          border: 'rgba(59, 130, 246, 0.3)',
          icon: Activity,
          text: 'Running',
        };
      case 'FAILED':
        return {
          bg: 'rgba(239, 68, 68, 0.15)',
          color: '#f87171',
          border: 'rgba(239, 68, 68, 0.3)',
          icon: XCircle,
          text: 'Failed',
        };
      case 'RETRYING':
        return {
          bg: 'rgba(245, 158, 11, 0.15)',
          color: '#fbbf24',
          border: 'rgba(245, 158, 11, 0.3)',
          icon: RefreshCw,
          text: 'Retrying',
        };
      case 'PAUSED':
        return {
          bg: 'rgba(168, 85, 247, 0.15)',
          color: '#c084fc',
          border: 'rgba(168, 85, 247, 0.3)',
          icon: PauseCircle,
          text: 'Paused',
        };
      default:
        return {
          bg: 'rgba(100, 116, 139, 0.15)',
          color: '#94a3b8',
          border: 'rgba(100, 116, 139, 0.3)',
          icon: Clock,
          text: status || 'Pending',
        };
    }
  };

  const filteredExecutions = executions.filter((exec) => {
    if (!search) return true;
    const name = exec.workflowSnapshot?.name || '';
    const id = exec._id || '';
    return name.toLowerCase().includes(search.toLowerCase()) || id.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <ProtectedRoute>
      <AppShell>
        <Head>
          <title>Execution History | Agentflow_AI</title>
        </Head>

        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Page Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem' }}>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Activity size={28} color="var(--primary-400)" />
                Execution History & Agent Telemetry
              </h1>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.35rem', fontSize: '0.95rem' }}>
                Inspect live runs, agent decision logs, error recovery attempts, and payload outputs.
              </p>
            </div>

            <button
              onClick={() => fetchExecutions(pagination.page)}
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
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          {/* Filters & Search Bar */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '1rem',
              marginBottom: '1.5rem',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            {/* Status Tabs */}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setStatusFilter(f.value)}
                  style={{
                    padding: '0.45rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid',
                    background: statusFilter === f.value ? 'var(--primary-600)' : 'transparent',
                    borderColor: statusFilter === f.value ? 'var(--primary-600)' : 'var(--border-color)',
                    color: statusFilter === f.value ? '#fff' : 'var(--text-secondary)',
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', width: '280px' }}>
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search by workflow or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.45rem 0.75rem 0.45rem 2.25rem',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Executions Table */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
            }}
          >
            {loading && executions.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <Activity size={32} className="animate-spin" style={{ margin: '0 auto 1rem auto', color: 'var(--primary-400)' }} />
                Loading execution telemetry...
              </div>
            ) : filteredExecutions.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <AlertCircle size={32} style={{ margin: '0 auto 0.75rem auto', color: 'var(--text-muted)' }} />
                <p style={{ margin: 0, fontWeight: 600 }}>No executions found</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Run a workflow from the canvas editor or dashboard to see its execution stream.
                </p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                      <th style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontWeight: 600 }}>Status</th>
                      <th style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontWeight: 600 }}>Workflow</th>
                      <th style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontWeight: 600 }}>Started</th>
                      <th style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontWeight: 600 }}>Duration</th>
                      <th style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontWeight: 600 }}>Agents Invoked</th>
                      <th style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExecutions.map((exec) => {
                      const badge = getStatusBadge(exec.status);
                      const BadgeIcon = badge.icon;
                      const startTime = exec.startTime ? new Date(exec.startTime).toLocaleString() : '—';
                      const duration = exec.durationMs ? `${(exec.durationMs / 1000).toFixed(2)}s` : exec.status === 'RUNNING' ? 'In progress' : '—';

                      return (
                        <tr
                          key={exec._id}
                          style={{
                            borderBottom: '1px solid var(--border-color)',
                            transition: 'background 0.15s ease',
                          }}
                        >
                          {/* Status */}
                          <td style={{ padding: '1rem 1.25rem' }}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                padding: '0.25rem 0.65rem',
                                borderRadius: '999px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                background: badge.bg,
                                color: badge.color,
                                border: `1px solid ${badge.border}`,
                              }}
                            >
                              <BadgeIcon size={13} className={exec.status === 'RUNNING' ? 'animate-spin' : ''} />
                              {badge.text}
                            </span>
                          </td>

                          {/* Workflow Name & ID */}
                          <td style={{ padding: '1rem 1.25rem' }}>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                              {exec.workflowSnapshot?.name || 'Untitled Workflow'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '0.15rem' }}>
                              ID: {exec._id}
                            </div>
                          </td>

                          {/* Started At */}
                          <td style={{ padding: '1rem 1.25rem', color: 'var(--text-secondary)', fontSize: '0.825rem' }}>
                            {startTime}
                          </td>

                          {/* Duration */}
                          <td style={{ padding: '1rem 1.25rem', color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: '0.825rem' }}>
                            {duration}
                          </td>

                          {/* Agents */}
                          <td style={{ padding: '1rem 1.25rem' }}>
                            <div style={{ display: 'flex', gap: '0.35rem' }}>
                              {['Plan', 'Exec', 'Val', 'Recov', 'Mon'].map((ag) => (
                                <span
                                  key={ag}
                                  style={{
                                    fontSize: '0.7rem',
                                    padding: '0.15rem 0.4rem',
                                    borderRadius: 'var(--radius-sm)',
                                    background: 'var(--bg-secondary)',
                                    color: 'var(--text-secondary)',
                                    border: '1px solid var(--border-color)',
                                  }}
                                >
                                  {ag}
                                </span>
                              ))}
                            </div>
                          </td>

                          {/* Action Button */}
                          <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                            <Link
                              href={`/executions/${exec._id}`}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                padding: '0.45rem 0.85rem',
                                background: 'rgba(99, 102, 241, 0.1)',
                                border: '1px solid rgba(99, 102, 241, 0.3)',
                                borderRadius: 'var(--radius-md)',
                                color: 'var(--primary-400)',
                                fontSize: '0.825rem',
                                fontWeight: 600,
                                textDecoration: 'none',
                              }}
                            >
                              Live Timeline
                              <ArrowRight size={14} />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
