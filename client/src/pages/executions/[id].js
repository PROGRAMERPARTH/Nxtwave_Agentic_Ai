import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import ProtectedRoute from '@/components/ProtectedRoute';
import { executionAPI } from '@/services/api';
import { getSocket } from '@/services/socket';
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Pause,
  Play,
  Square,
  RefreshCw,
  Cpu,
  Layers,
  Terminal,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  Code,
  Copy,
  Check,
} from 'lucide-react';

const AGENT_COLORS = {
  planner: {
    name: 'Planner Agent',
    bg: 'rgba(139, 92, 246, 0.15)',
    border: 'rgba(139, 92, 246, 0.35)',
    text: '#c084fc',
    icon: Layers,
  },
  execution: {
    name: 'Execution Agent',
    bg: 'rgba(59, 130, 246, 0.15)',
    border: 'rgba(59, 130, 246, 0.35)',
    text: '#60a5fa',
    icon: Cpu,
  },
  validation: {
    name: 'Validation Agent',
    bg: 'rgba(16, 185, 129, 0.15)',
    border: 'rgba(16, 185, 129, 0.35)',
    text: '#34d399',
    icon: ShieldCheck,
  },
  recovery: {
    name: 'Recovery Agent',
    bg: 'rgba(245, 158, 11, 0.15)',
    border: 'rgba(245, 158, 11, 0.35)',
    text: '#fbbf24',
    icon: AlertTriangle,
  },
  monitoring: {
    name: 'Monitoring Agent',
    bg: 'rgba(99, 102, 241, 0.15)',
    border: 'rgba(99, 102, 241, 0.35)',
    text: '#818cf8',
    icon: Terminal,
  },
};

const normalizeTimeline = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.logs)) return value.logs;
  if (Array.isArray(value?.data?.logs)) return value.data.logs;
  return [];
};

export default function ExecutionDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [execution, setExecution] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('timeline'); // timeline | outputs | json
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedAgentFilter, setSelectedAgentFilter] = useState('all');

  const logsEndRef = useRef(null);

  const fetchDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [execRes, timeRes] = await Promise.allSettled([
        executionAPI.get(id),
        executionAPI.getTimeline(id),
      ]);

      if (execRes.status === 'fulfilled' && execRes.value.data?.success) {
        const rawExec = execRes.value.data.data;
        setExecution(rawExec.execution || rawExec);
      }

      if (timeRes.status === 'fulfilled' && timeRes.value.data?.success) {
        const rawTime = timeRes.value.data.data;
        setTimeline(normalizeTimeline(rawTime));
      }
    } catch (err) {
      console.error('Failed to load execution details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  // Socket.IO real-time stream subscription
  useEffect(() => {
    if (!id) return;
    const socket = getSocket();
    if (!socket) return;

    socket.emit('join:execution', id);

    const handleEvent = (event) => {
      setTimeline((prev) => [...normalizeTimeline(prev), event]);
      // If status changed or completed, refresh execution doc
      if (event.metadata?.status || event.agent === 'monitoring') {
        executionAPI.get(id).then((res) => {
          if (res.data?.success) {
            const raw = res.data.data;
            setExecution(raw.execution || raw);
          }
        });
      }
    };

    socket.on('execution:event', handleEvent);

    return () => {
      socket.emit('leave:execution', id);
      socket.off('execution:event', handleEvent);
    };
  }, [id]);

  const handlePause = async () => {
    try {
      setActionLoading(true);
      await executionAPI.pause(id);
      fetchDetails();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to pause execution');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResume = async () => {
    try {
      setActionLoading(true);
      await executionAPI.resume(id);
      fetchDetails();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to resume execution');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this execution?')) return;
    try {
      setActionLoading(true);
      await executionAPI.cancel(id);
      fetchDetails();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel execution');
    } finally {
      setActionLoading(false);
    }
  };

  const safeTimeline = Array.isArray(timeline) ? timeline : [];
  const filteredTimeline =
    selectedAgentFilter === 'all'
      ? safeTimeline
      : safeTimeline.filter((t) => t.agent === selectedAgentFilter);

  if (loading && !execution) {
    return (
      <ProtectedRoute>
        <AppShell>
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <Activity size={36} className="animate-spin" style={{ margin: '0 auto 1rem auto', color: 'var(--primary-400)' }} />
            Connecting to execution telemetry stream...
          </div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  const isRunning = execution?.status === 'RUNNING' || execution?.status === 'RETRYING';
  const isPaused = execution?.status === 'PAUSED';

  return (
    <ProtectedRoute>
      <AppShell>
        <Head>
          <title>Execution {id ? String(id).substring(0, 8) : ''} | Agentflow_AI</title>
        </Head>

        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Top Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link
              href="/executions"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: 600,
              }}
            >
              <ArrowLeft size={16} />
              Back to Execution History
            </Link>

            <button
              onClick={fetchDetails}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 12px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-primary)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-secondary)',
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              Refresh Feed
            </button>
          </div>

          {/* Execution Header Card */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-secondary)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.75rem',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1.25rem',
              boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                  {execution?.workflowSnapshot?.name || 'Workflow Execution'}
                </h1>
                <span
                  style={{
                    padding: '3px 10px',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    letterSpacing: '0.5px',
                    background:
                      execution?.status === 'COMPLETED'
                        ? 'rgba(16, 185, 129, 0.15)'
                        : execution?.status === 'FAILED'
                        ? 'rgba(239, 68, 68, 0.15)'
                        : isRunning
                        ? 'rgba(59, 130, 246, 0.15)'
                        : 'rgba(168, 85, 247, 0.15)',
                    color:
                      execution?.status === 'COMPLETED'
                        ? '#34d399'
                        : execution?.status === 'FAILED'
                        ? '#f87171'
                        : isRunning
                        ? '#60a5fa'
                        : '#c084fc',
                    border: '1px solid currentColor',
                  }}
                >
                  {execution?.status || 'PENDING'}
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '1.5rem',
                  marginTop: '0.65rem',
                  fontSize: '0.825rem',
                  color: 'var(--text-secondary)',
                  flexWrap: 'wrap',
                }}
              >
                <span>
                  Execution ID: <code style={{ color: 'var(--text-primary)' }}>{id}</code>
                </span>
                <span>
                  Started:{' '}
                  {execution?.startTime
                    ? new Date(execution.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                    : '—'}
                </span>
                <span>
                  Duration:{' '}
                  {execution?.durationMs
                    ? `${(execution.durationMs / 1000).toFixed(2)}s`
                    : isRunning
                    ? 'Running...'
                    : '—'}
                </span>
                <span>
                  LangGraph Engine:{' '}
                  <span style={{ color: 'var(--primary-400)', fontWeight: 600 }}>
                    {execution?.orchestratorMeta?.langGraph || 'native'}
                  </span>
                </span>
              </div>
            </div>

            {/* Execution Controls */}
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              {isRunning && (
                <button
                  onClick={handlePause}
                  disabled={actionLoading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.55rem 1rem',
                    background: 'rgba(245, 158, 11, 0.15)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    color: '#fbbf24',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                  }}
                >
                  <Pause size={14} />
                  Pause
                </button>
              )}

              {isPaused && (
                <button
                  onClick={handleResume}
                  disabled={actionLoading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.55rem 1rem',
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    color: '#34d399',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                  }}
                >
                  <Play size={14} />
                  Resume
                </button>
              )}

              {(isRunning || isPaused) && (
                <button
                  onClick={handleCancel}
                  disabled={actionLoading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.55rem 1rem',
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    color: '#f87171',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                  }}
                >
                  <Square size={14} />
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* 5-Agent Stage Telemetry Banner */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
              gap: '0.85rem',
            }}
          >
            {Object.entries(AGENT_COLORS).map(([key, agent]) => {
              const Icon = agent.icon;
              const count = safeTimeline.filter((t) => t.agent === key).length;
              const isFilterActive = selectedAgentFilter === key;

              return (
                <div
                  key={key}
                  onClick={() => setSelectedAgentFilter(isFilterActive ? 'all' : key)}
                  style={{
                    background: isFilterActive ? 'var(--bg-elevated)' : 'var(--bg-card)',
                    border: `1px solid ${isFilterActive ? agent.text : count > 0 ? agent.border : 'var(--border-primary)'}`,
                    borderRadius: 'var(--radius-lg)',
                    padding: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: count > 0 ? `0 4px 15px ${agent.bg}` : 'none',
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: 'var(--radius-sm)',
                      background: agent.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: agent.text,
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{agent.name}</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', marginTop: '1px' }}>
                      {count} {count === 1 ? 'event' : 'events'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* View Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              borderBottom: '1px solid var(--border-primary)',
              paddingBottom: '0.5rem',
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={() => setActiveTab('timeline')}
              style={{
                padding: '0.55rem 1.1rem',
                borderRadius: 'var(--radius-md)',
                background: activeTab === 'timeline' ? 'var(--primary-600)' : 'transparent',
                border: 'none',
                color: activeTab === 'timeline' ? '#fff' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              Telemetry Timeline ({filteredTimeline.length})
            </button>
            <button
              onClick={() => setActiveTab('outputs')}
              style={{
                padding: '0.55rem 1.1rem',
                borderRadius: 'var(--radius-md)',
                background: activeTab === 'outputs' ? 'var(--primary-600)' : 'transparent',
                border: 'none',
                color: activeTab === 'outputs' ? '#fff' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              Node Outputs Inspector
            </button>
            <button
              onClick={() => setActiveTab('json')}
              style={{
                padding: '0.55rem 1.1rem',
                borderRadius: 'var(--radius-md)',
                background: activeTab === 'json' ? 'var(--primary-600)' : 'transparent',
                border: 'none',
                color: activeTab === 'json' ? '#fff' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              Raw Execution Snapshot
            </button>

            {selectedAgentFilter !== 'all' && (
              <button
                onClick={() => setSelectedAgentFilter('all')}
                style={{
                  marginLeft: 'auto',
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#f87171',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Clear filter ({selectedAgentFilter}) ✕
              </button>
            )}
          </div>

          {/* Tab 1: Timeline Feed */}
          {activeTab === 'timeline' && (
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-secondary)',
                borderRadius: 'var(--radius-xl)',
                padding: '1.5rem',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              }}
            >
              {filteredTimeline.length === 0 ? (
                <div style={{ padding: '3.5rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <Terminal size={36} style={{ margin: '0 auto 0.75rem auto', color: 'var(--text-muted)' }} />
                  <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>
                    No telemetry events found
                  </p>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    {selectedAgentFilter !== 'all'
                      ? `No events recorded from ${selectedAgentFilter} agent.`
                      : 'Waiting for multi-agent events to stream...'}
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {filteredTimeline.map((event, idx) => {
                    const agentMeta = AGENT_COLORS[event.agent] || AGENT_COLORS.monitoring;
                    const Icon = agentMeta.icon;
                    const timeStr = event.timestamp
                      ? new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                      : '';

                    return (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '1rem',
                          padding: '0.95rem 1.15rem',
                          background: 'var(--bg-tertiary)',
                          border: `1px solid ${
                            event.level === 'error'
                              ? 'rgba(239, 68, 68, 0.4)'
                              : event.level === 'warn'
                              ? 'rgba(245, 158, 11, 0.4)'
                              : 'var(--border-primary)'
                          }`,
                          borderRadius: 'var(--radius-md)',
                        }}
                      >
                        <div
                          style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '8px',
                            background: agentMeta.bg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: agentMeta.text,
                            flexShrink: 0,
                          }}
                        >
                          <Icon size={17} />
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                              <span
                                style={{
                                  fontSize: '0.75rem',
                                  fontWeight: 800,
                                  color: agentMeta.text,
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px',
                                }}
                              >
                                {event.agent} Agent
                              </span>
                              {event.nodeId && (
                                <span
                                  style={{
                                    fontSize: '0.725rem',
                                    fontFamily: 'JetBrains Mono, monospace',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    background: 'var(--bg-card)',
                                    color: 'var(--primary-400)',
                                    border: '1px solid var(--border-primary)',
                                  }}
                                >
                                  {event.nodeId}
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{timeStr}</span>
                          </div>

                          <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 600, lineHeight: '1.45' }}>
                            {event.message}
                          </div>

                          {event.metadata && Object.keys(event.metadata).length > 0 && (
                            <details style={{ marginTop: '0.5rem', fontSize: '0.775rem' }}>
                              <summary style={{ color: 'var(--primary-400)', cursor: 'pointer', fontWeight: 600 }}>
                                View Event Details & Payload
                              </summary>
                              <pre
                                style={{
                                  background: 'var(--bg-card)',
                                  padding: '0.75rem',
                                  borderRadius: 'var(--radius-sm)',
                                  overflowX: 'auto',
                                  color: '#34d399',
                                  marginTop: '0.4rem',
                                  fontSize: '0.75rem',
                                  border: '1px solid var(--border-primary)',
                                }}
                              >
                                {JSON.stringify(event.metadata, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={logsEndRef} />
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Node Outputs Inspector */}
          {activeTab === 'outputs' && (
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-secondary)',
                borderRadius: 'var(--radius-xl)',
                padding: '1.75rem',
              }}
            >
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Executed Node Payloads & State
              </h3>
              {!execution?.outputs || Object.keys(execution.outputs).length === 0 ? (
                <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No node outputs generated yet. Payloads stream in as nodes complete execution.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1rem' }}>
                  {Object.entries(execution.outputs).map(([nodeId, output]) => (
                    <div
                      key={nodeId}
                      style={{
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-primary)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '1.25rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--primary-400)', fontFamily: 'JetBrains Mono, monospace' }}>
                          Node: {nodeId}
                        </span>
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: 'rgba(16, 185, 129, 0.15)',
                            color: '#34d399',
                          }}
                        >
                          SUCCESS
                        </span>
                      </div>
                      <pre
                        style={{
                          background: 'var(--bg-card)',
                          padding: '0.85rem',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '0.75rem',
                          maxHeight: '260px',
                          overflowY: 'auto',
                          color: '#38bdf8',
                          margin: 0,
                          border: '1px solid var(--border-primary)',
                        }}
                      >
                        {JSON.stringify(output, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Raw JSON */}
          {activeTab === 'json' && (
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-secondary)',
                borderRadius: 'var(--radius-xl)',
                padding: '1.75rem',
              }}
            >
              <pre
                style={{
                  background: 'var(--bg-tertiary)',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: '0.8rem',
                  maxHeight: '520px',
                  overflowY: 'auto',
                  color: 'var(--text-primary)',
                  margin: 0,
                  border: '1px solid var(--border-primary)',
                }}
              >
                {JSON.stringify(execution, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
