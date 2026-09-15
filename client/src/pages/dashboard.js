import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ProtectedRoute from '../components/ProtectedRoute';
import AppShell from '../components/AppShell';
import MetricGrid from '../components/MetricGrid';
import { workflowAPI, executionAPI } from '../services/api';
import {
  Sparkles,
  Plus,
  Play,
  ArrowUpRight,
  Activity,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  RefreshCw,
  Zap,
  Bot,
  ShieldCheck,
  FileText,
  Sliders,
  Cpu,
  Layers,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

const STARTER_TEMPLATES = [
  {
    title: 'Gmail Invoice AI Processor',
    category: 'Finance & Invoicing',
    prompt: 'When an invoice arrives in Gmail, extract vendor and amount with AI, and send a Slack notification to #finance.',
    icon: FileText,
    color: '#818cf8',
    bg: 'rgba(129, 140, 248, 0.15)',
  },
  {
    title: 'Customer Sentiment & Triage',
    category: 'Customer Support',
    prompt: 'Monitor incoming support tickets, analyze urgency and sentiment with Gemini AI, and alert on-call support in Discord.',
    icon: Bot,
    color: '#34d399',
    bg: 'rgba(52, 211, 153, 0.15)',
  },
  {
    title: 'KPI Report & Google Sheets Sync',
    category: 'Operations',
    prompt: 'Summarize operations metrics with AI and append structured rows to Google Sheets table.',
    icon: Sliders,
    color: '#38bdf8',
    bg: 'rgba(56, 189, 248, 0.15)',
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [metrics, setMetrics] = useState({
    totalWorkflows: 0,
    activeWorkflows: 0,
    totalExecutions: 0,
    successfulExecutions: 0,
    failedExecutions: 0,
    avgExecutionTime: '1.2s',
    successRate: '98.5%',
  });
  const [recentWorkflows, setRecentWorkflows] = useState([]);
  const [recentExecutions, setRecentExecutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [launchingTemplate, setLaunchingTemplate] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dashRes, execRes, wfRes] = await Promise.allSettled([
        workflowAPI.getDashboard(),
        executionAPI.list({ limit: 6 }),
        workflowAPI.list({ limit: 6 }),
      ]);

      if (dashRes.status === 'fulfilled' && dashRes.value.data?.data) {
        setMetrics(dashRes.value.data.data);
      }
      if (wfRes.status === 'fulfilled' && wfRes.value.data?.data) {
        setRecentWorkflows(wfRes.value.data.data.workflows || []);
      }
      if (execRes.status === 'fulfilled' && execRes.value.data?.data) {
        setRecentExecutions(execRes.value.data.data.executions || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLaunchTemplate = async (template) => {
    try {
      setLaunchingTemplate(template.title);
      const res = await workflowAPI.generate({ prompt: template.prompt });
      if (res.data?.data) {
        const gen = res.data.data;
        const created = await workflowAPI.create({
          name: template.title,
          description: template.prompt,
          nodes: gen.nodes || [],
          edges: gen.edges || [],
          tags: ['template', 'starter'],
        });
        const wfId = created.data.data.workflow._id;
        router.push(`/workflows/${wfId}`);
      }
    } catch (err) {
      console.error('Failed to launch template:', err);
      alert('Could not instantiate template: ' + (err.response?.data?.error || err.message));
    } finally {
      setLaunchingTemplate(null);
    }
  };

  const handleRunWorkflow = async (e, wfId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await workflowAPI.execute(wfId, {});
      if (res.data?.data?.execution) {
        router.push(`/executions/${res.data.data.execution._id}`);
      }
    } catch (err) {
      alert('Execution trigger error: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <Head>
          <title>Operations Dashboard | Agentflow_AI</title>
        </Head>

        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Header Banner */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1.25rem',
              padding: '1.75rem 2rem',
              background: 'linear-gradient(135deg, rgba(18, 20, 29, 0.9) 0%, rgba(30, 33, 48, 0.8) 100%)',
              border: '1px solid var(--border-secondary)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-40px',
                right: '-40px',
                width: '180px',
                height: '180px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px',
                    padding: '3px 8px',
                    borderRadius: '999px',
                    background: 'rgba(99, 102, 241, 0.2)',
                    color: 'var(--primary-400)',
                    border: '1px solid rgba(99, 102, 241, 0.35)',
                  }}
                >
                  Autonomous Operations Control
                </span>
              </div>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.5px' }}>
                Mission Control & Agent Telemetry
              </h1>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.4rem', fontSize: '0.925rem' }}>
                Real-time 5-agent orchestration metrics, workflow lifecycle, and rapid automation synthesis.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                onClick={fetchData}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.6rem 1rem',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>

              <Link
                href="/workflows/builder"
                className="btn btn-primary"
                style={{ padding: '0.6rem 1.25rem', fontSize: '0.875rem' }}
              >
                <Sparkles size={16} />
                AI Prompt Builder
              </Link>
            </div>
          </div>

          {/* Metric Cards Grid */}
          <MetricGrid metrics={metrics} />

          {/* Quick-Start 1-Click Starter Templates */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  ⚡ Quick-Start Automation Blueprints
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                  Deploy pre-configured multi-agent workflows with one click
                </p>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '1.25rem',
              }}
            >
              {STARTER_TEMPLATES.map((tmpl, idx) => {
                const Icon = tmpl.icon;
                const isLaunching = launchingTemplate === tmpl.title;
                return (
                  <div
                    key={idx}
                    onClick={() => !isLaunching && handleLaunchTemplate(tmpl)}
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-primary)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '1.25rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = tmpl.color;
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-primary)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <div
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: 'var(--radius-sm)',
                            background: tmpl.bg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: tmpl.color,
                          }}
                        >
                          <Icon size={20} />
                        </div>
                        <span
                          style={{
                            fontSize: '10.5px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '999px',
                            background: 'var(--bg-tertiary)',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border-primary)',
                          }}
                        >
                          {tmpl.category}
                        </span>
                      </div>

                      <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '0.975rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {tmpl.title}
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
                        {tmpl.prompt}
                      </p>
                    </div>

                    <div
                      style={{
                        marginTop: '1rem',
                        paddingTop: '0.75rem',
                        borderTop: '1px solid var(--border-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.775rem',
                        color: tmpl.color,
                        fontWeight: 700,
                      }}
                    >
                      <span>{isLaunching ? 'Synthesizing DAG...' : 'Instantiate Workflow'}</span>
                      <ArrowRight size={14} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Workflows & Live Run Stream Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {/* Active Workflows Column */}
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-primary)',
                borderRadius: 'var(--radius-xl)',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Activity size={18} color="var(--primary-400)" />
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Active Workflows ({recentWorkflows.length})
                    </h3>
                  </div>
                  <Link
                    href="/workflows"
                    style={{ fontSize: '0.8rem', color: 'var(--primary-400)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                  >
                    View all <ArrowUpRight size={14} />
                  </Link>
                </div>

                {recentWorkflows.length === 0 ? (
                  <div style={{ padding: '2.5rem 1rem', textAlign: 'center', border: '1px dashed var(--border-primary)', borderRadius: 'var(--radius-md)' }}>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>No workflows created yet.</p>
                    <Link
                      href="/workflows/builder"
                      style={{ marginTop: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--primary-400)', fontSize: '0.825rem', fontWeight: 600 }}
                    >
                      <Sparkles size={13} /> Generate one with AI
                    </Link>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {recentWorkflows.map((wf) => (
                      <div
                        key={wf._id}
                        style={{
                          padding: '0.85rem 1rem',
                          borderRadius: 'var(--radius-md)',
                          background: 'var(--bg-tertiary)',
                          border: '1px solid var(--border-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '1rem',
                        }}
                      >
                        <Link href={`/workflows/${wf._id}`} style={{ textDecoration: 'none', flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {wf.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                            {wf.nodes?.length || 0} nodes • version {wf.version || '1.0.0'}
                          </div>
                        </Link>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button
                            onClick={(e) => handleRunWorkflow(e, wf._id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '4px 10px',
                              background: 'rgba(16, 185, 129, 0.15)',
                              border: '1px solid rgba(16, 185, 129, 0.3)',
                              borderRadius: 'var(--radius-sm)',
                              color: '#34d399',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                            title="Execute Workflow"
                          >
                            <Play size={12} fill="currentColor" /> Run
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Executions Column */}
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-primary)',
                borderRadius: 'var(--radius-xl)',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Play size={18} color="#34d399" />
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Recent Executions
                    </h3>
                  </div>
                  <Link
                    href="/executions"
                    style={{ fontSize: '0.8rem', color: 'var(--primary-400)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                  >
                    Full History <ArrowUpRight size={14} />
                  </Link>
                </div>

                {recentExecutions.length === 0 ? (
                  <div style={{ padding: '2.5rem 1rem', textAlign: 'center', border: '1px dashed var(--border-primary)', borderRadius: 'var(--radius-md)' }}>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>No runs recorded yet.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {recentExecutions.map((exec) => (
                      <Link
                        key={exec._id}
                        href={`/executions/${exec._id}`}
                        style={{
                          padding: '0.85rem 1rem',
                          borderRadius: 'var(--radius-md)',
                          background: 'var(--bg-tertiary)',
                          border: '1px solid var(--border-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          textDecoration: 'none',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          {exec.status === 'COMPLETED' ? (
                            <CheckCircle2 size={16} color="#34d399" />
                          ) : exec.status === 'FAILED' ? (
                            <XCircle size={16} color="#f87171" />
                          ) : (
                            <Clock size={16} color="#fbbf24" className="animate-spin" />
                          )}
                          <div>
                            <div style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                              {exec.workflowSnapshot?.name || 'Execution'}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                              {exec.createdAt ? new Date(exec.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                              {exec.durationMs && ` • ${(exec.durationMs / 1000).toFixed(2)}s`}
                            </div>
                          </div>
                        </div>

                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '999px',
                            background:
                              exec.status === 'COMPLETED'
                                ? 'rgba(16, 185, 129, 0.15)'
                                : exec.status === 'FAILED'
                                ? 'rgba(239, 68, 68, 0.15)'
                                : 'rgba(245, 158, 11, 0.15)',
                            color:
                              exec.status === 'COMPLETED'
                                ? '#34d399'
                                : exec.status === 'FAILED'
                                ? '#f87171'
                                : '#fbbf24',
                            border: '1px solid currentColor',
                          }}
                        >
                          {exec.status}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
