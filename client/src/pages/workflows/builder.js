import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import ProtectedRoute from '../../components/ProtectedRoute';
import AppShell from '../../components/AppShell';
import WorkflowCanvas from '../../components/WorkflowCanvas';
import { workflowAPI } from '../../services/api';
import {
  Sparkles,
  Send,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Cpu,
  Layers,
  AlertCircle,
  RefreshCw,
  Zap,
  Bot,
  Sliders,
  Code,
  Check,
} from 'lucide-react';

const CATEGORY_PROMPTS = [
  {
    category: 'Finance & Invoicing',
    icon: '💳',
    prompts: [
      'When an invoice arrives in Gmail, extract vendor and total amount with AI, validate fields, and post a Slack alert to #finance.',
      'Daily scheduled query: find unpaid invoices in Stripe and send email reminders via Gmail.',
    ],
  },
  {
    category: 'Customer Support',
    icon: '🎧',
    prompts: [
      'Monitor customer support tickets, analyze urgency and sentiment with Gemini AI, and dispatch high-priority issues to Discord.',
      'When a user submits feedback, summarize key requests with AI and append to Google Sheets.',
    ],
  },
  {
    category: 'DevOps & Incident Response',
    icon: '🚀',
    prompts: [
      'When an error alert webhook fires, analyze stack trace with AI, determine severity, and send Slack notification.',
      'Automated nightly health check: ping service endpoints and broadcast report to Discord channel.',
    ],
  },
  {
    category: 'Data Sync & Operations',
    icon: '📊',
    prompts: [
      'Read incoming data payload, transform schema, and append structured records into Google Sheets.',
      'Extract weekly sales summary from email attachments and format tabular output.',
    ],
  },
];

export default function WorkflowBuilderPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedGraph, setGeneratedGraph] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(0);

  const handleGenerate = async (targetPrompt) => {
    const textToUse = targetPrompt || prompt;
    if (!textToUse.trim()) return;

    try {
      setLoading(true);
      setError('');
      const res = await workflowAPI.generate({ prompt: textToUse });
      if (res.data?.data) {
        setGeneratedGraph(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate workflow graph.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndOpen = async () => {
    if (!generatedGraph) return;
    try {
      setSaving(true);
      const res = await workflowAPI.create({
        name: generatedGraph.name || 'AI Generated Workflow',
        description: generatedGraph.description || prompt,
        nodes: generatedGraph.nodes || [],
        edges: generatedGraph.edges || [],
        tags: generatedGraph.tags || ['ai-generated'],
      });
      const wf = res.data.data.workflow;
      router.push(`/workflows/${wf._id}`);
    } catch (err) {
      setError('Failed to persist generated workflow.');
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <Head>
          <title>AI Workflow Builder | Agentflow_AI</title>
        </Head>

        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Header */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '3px 10px',
                  borderRadius: '999px',
                  background: 'rgba(99, 102, 241, 0.15)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  color: 'var(--primary-400)',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  marginBottom: '0.4rem',
                }}
              >
                <Sparkles size={13} />
                Natural Language AI Generator
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Synthesize Workflows from Plain English
              </h1>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.9rem' }}>
                Describe your business goal. Our AI cascade translates requirements into an executable DAG graph with validated node schemas.
              </p>
            </div>

            {generatedGraph && (
              <button
                onClick={handleSaveAndOpen}
                disabled={saving}
                className="btn btn-primary"
                style={{ padding: '0.65rem 1.25rem', fontSize: '0.875rem' }}
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Provisioning...
                  </>
                ) : (
                  <>
                    Save & Open in Canvas Editor <ArrowRight size={16} />
                  </>
                )}
              </button>
            )}
          </div>

          {/* Prompt Input Box */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-secondary)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.5rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            }}
          >
            {/* Input Bar */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                placeholder="Describe your automation (e.g. When an invoice arrives in Gmail, extract data with AI and send a Slack notification)..."
                style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-secondary)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontSize: '0.925rem',
                  outline: 'none',
                }}
              />
              <button
                onClick={() => handleGenerate()}
                disabled={loading || !prompt.trim()}
                className="btn btn-primary"
                style={{ padding: '0.75rem 1.5rem', minWidth: '130px' }}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                <span>{loading ? 'Synthesizing...' : 'Generate'}</span>
              </button>
            </div>

            {/* Category Tabs & Quick Chips */}
            <div>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', overflowX: 'auto', paddingBottom: '4px' }}>
                {CATEGORY_PROMPTS.map((cat, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedCategory(idx)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '5px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: selectedCategory === idx ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-tertiary)',
                      border: `1px solid ${selectedCategory === idx ? 'var(--primary-400)' : 'var(--border-primary)'}`,
                      color: selectedCategory === idx ? '#fff' : 'var(--text-secondary)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.category}</span>
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {CATEGORY_PROMPTS[selectedCategory]?.prompts.map((p, pIdx) => (
                  <div
                    key={pIdx}
                    onClick={() => {
                      setPrompt(p);
                      handleGenerate(p);
                    }}
                    style={{
                      padding: '0.6rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-primary)',
                      color: 'var(--text-secondary)',
                      fontSize: '0.825rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary-400)';
                      e.currentTarget.style.color = '#fff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-primary)';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }}
                  >
                    <span>{p}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--primary-400)', fontWeight: 600, marginLeft: '1rem' }}>
                      Try prompt →
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div
                style={{
                  marginTop: '1rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#f87171',
                  fontSize: '0.825rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Generated Canvas Preview */}
          {generatedGraph ? (
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-secondary)',
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
                height: '540px',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
              }}
            >
              {/* Preview Header */}
              <div
                style={{
                  padding: '0.85rem 1.5rem',
                  background: 'var(--bg-secondary)',
                  borderBottom: '1px solid var(--border-primary)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                    {generatedGraph.name}
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '999px',
                      background: 'rgba(56, 189, 248, 0.15)',
                      color: '#38bdf8',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                    }}
                  >
                    {generatedGraph.generatedBy || 'Rule Engine'}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {generatedGraph.nodes?.length || 0} Nodes • {generatedGraph.edges?.length || 0} Connections
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <button
                    onClick={() => handleGenerate()}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '5px 10px',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-primary)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-secondary)',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                    }}
                  >
                    <RefreshCw size={13} /> Re-generate
                  </button>
                  <button
                    onClick={handleSaveAndOpen}
                    disabled={saving}
                    className="btn btn-primary btn-sm"
                  >
                    Save & Edit Canvas
                  </button>
                </div>
              </div>

              {/* React Flow Canvas Preview */}
              <div style={{ flex: 1, width: '100%', height: '100%', position: 'relative' }}>
                <WorkflowCanvas
                  key={JSON.stringify(generatedGraph)}
                  initialNodes={generatedGraph.nodes || []}
                  initialEdges={generatedGraph.edges || []}
                />
              </div>
            </div>
          ) : (
            <div
              style={{
                height: '320px',
                border: '1px dashed var(--border-secondary)',
                borderRadius: 'var(--radius-xl)',
                background: 'var(--bg-card)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '2rem',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'rgba(99, 102, 241, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary-400)',
                  marginBottom: '1rem',
                }}
              >
                <Cpu size={28} />
              </div>
              <h3 style={{ margin: '0 0 0.35rem 0', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                No Workflow Preview Generated Yet
              </h3>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '420px', lineHeight: '1.5' }}>
                Type an automation description or choose one of the starter templates above to see the graph assembled in real time.
              </p>
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
