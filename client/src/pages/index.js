import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import useAuthStore from '../store/authStore';
import {
  Zap,
  ArrowRight,
  Bot,
  Cpu,
  GitMerge,
  ShieldCheck,
  Sparkles,
  Layers,
  Activity,
  Lock,
  CheckCircle2,
  ChevronRight,
  Terminal,
  Play,
  Check,
  Sliders,
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, token } = useAuthStore();
  const [demoPrompt, setDemoPrompt] = useState('When an invoice email arrives in Gmail, extract vendor details with AI and notify Slack #finance');
  const [previewGraph, setPreviewGraph] = useState([
    { stage: 'Stage 1: Trigger', label: 'Gmail: Invoice Received', provider: 'gmail', color: '#818cf8' },
    { stage: 'Stage 2: AI Action', label: 'Gemini: Extract Invoice Data', provider: 'gemini', color: '#c084fc' },
    { stage: 'Stage 3: Validation', label: 'Validation Agent: Schema Check', provider: 'local', color: '#34d399' },
    { stage: 'Stage 4: Integration', label: 'Slack: Post Approval Card', provider: 'slack', color: '#38bdf8' },
  ]);

  useEffect(() => {
    if (isAuthenticated || token) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, token, router]);

  const agents = [
    {
      step: '01',
      name: 'Planner Agent',
      desc: 'Validates workflow DAG, resolves topological execution sequence, and estimates confidence score.',
      color: '#818cf8',
      bg: 'rgba(129, 140, 248, 0.15)',
      badge: 'agent-planner',
    },
    {
      step: '02',
      name: 'Execution Agent',
      desc: 'Executes individual nodes against integrations, LLM providers, or deterministic rule engines.',
      color: '#38bdf8',
      bg: 'rgba(56, 189, 248, 0.15)',
      badge: 'agent-execution',
    },
    {
      step: '03',
      name: 'Validation Agent',
      desc: 'Ensures data payload contracts, required keys, and output constraints are rigorously satisfied.',
      color: '#34d399',
      bg: 'rgba(52, 211, 153, 0.15)',
      badge: 'agent-validation',
    },
    {
      step: '04',
      name: 'Recovery Agent',
      desc: 'Classifies failure types and orchestrates intelligent exponential backoff or escalation.',
      color: '#fbbf24',
      bg: 'rgba(251, 191, 36, 0.15)',
      badge: 'agent-recovery',
    },
    {
      step: '05',
      name: 'Monitoring Agent',
      desc: 'Streams real-time step events and audit telemetry logs over WebSockets to your operations console.',
      color: '#c084fc',
      bg: 'rgba(192, 132, 252, 0.15)',
      badge: 'agent-monitoring',
    },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflowX: 'hidden',
      }}
    >
      <Head>
        <title>Agentflow_AI | Autonomous Multi-Agent Operations Platform</title>
      </Head>

      {/* Ambient background glows */}
      <div
        style={{
          position: 'absolute',
          top: '-100px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '800px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, rgba(139, 92, 246, 0.08) 50%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Navigation */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backdropFilter: 'blur(16px)',
          background: 'rgba(8, 9, 14, 0.8)',
          borderBottom: '1px solid var(--border-primary)',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 24px',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
              }}
            >
              <Zap size={18} />
            </div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.4px', color: '#fff' }}>
              Agentflow<span style={{ color: 'var(--primary-400)' }}>AI</span>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link
              href="/login"
              style={{
                padding: '8px 16px',
                fontSize: '13.5px',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                textDecoration: 'none',
              }}
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="btn btn-primary"
              style={{ padding: '8px 18px', fontSize: '13.5px' }}
            >
              Get Started <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main style={{ flex: 1, position: 'relative', zIndex: 1 }}>
        <section
          style={{
            padding: '5rem 1.5rem 3.5rem 1.5rem',
            maxWidth: '1100px',
            margin: '0 auto',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '999px',
              background: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              color: 'var(--primary-400)',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              marginBottom: '1.75rem',
            }}
          >
            <Sparkles size={14} />
            Autonomous 5-Agent Architecture
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.5rem, 5.5vw, 4.25rem)',
              fontWeight: 800,
              letterSpacing: '-1.5px',
              lineHeight: 1.12,
              marginBottom: '1.5rem',
              color: '#fff',
            }}
          >
            Orchestrate complex operations with <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 40%, #38bdf8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Cooperating AI Agents
            </span>
          </h1>

          <p
            style={{
              fontSize: '1.15rem',
              color: 'var(--text-secondary)',
              maxWidth: '740px',
              margin: '0 auto 2.5rem auto',
              lineHeight: 1.6,
            }}
          >
            Describe your business workflow in natural language. Agentflow translates your intent into an executable graph, dispatches real SaaS integrations, and monitors execution with zero silent failures.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '3.5rem' }}>
            <Link
              href="/register"
              className="btn btn-primary btn-lg"
              style={{ padding: '14px 28px', fontSize: '15px' }}
            >
              Launch Console <ArrowRight size={18} />
            </Link>
            <Link
              href="/login"
              className="btn btn-secondary btn-lg"
              style={{ padding: '14px 24px', fontSize: '15px' }}
            >
              Operator Sign In
            </Link>
          </div>

          {/* Interactive Live Preview Box */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-secondary)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.75rem',
              boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-primary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Terminal size={16} color="var(--primary-400)" />
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                  Live Natural Language DAG Preview
                </span>
              </div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '999px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#34d399',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                }}
              >
                ● Ready to Execute
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1rem',
              }}
            >
              {previewGraph.map((node, i) => (
                <div
                  key={i}
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-tertiary)',
                    border: `1px solid ${node.color}40`,
                    boxShadow: `0 4px 15px ${node.color}15`,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: node.color, textTransform: 'uppercase' }}>
                      {node.stage}
                    </span>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', marginTop: '4px' }}>
                      {node.label}
                    </div>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '0.75rem', fontFamily: 'JetBrains Mono, monospace' }}>
                    provider: {node.provider}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5-Agent Resilient Chain Section */}
        <section style={{ padding: '4rem 1.5rem', maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', margin: 0 }}>
              The 5-Agent Resilience Chain
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '1rem' }}>
              Every workflow execution runs through a synchronized pipeline engineered for zero silent failures.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {agents.map((ag, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                  transition: 'all 0.2s ease',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)' }}>
                      STEP {ag.step}
                    </span>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: ag.bg,
                        color: ag.color,
                        border: `1px solid ${ag.color}40`,
                      }}
                    >
                      Active
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', margin: '0 0 0.5rem 0' }}>
                    {ag.name}
                  </h3>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                    {ag.desc}
                  </p>
                </div>

                <div
                  style={{
                    marginTop: '1.25rem',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid var(--border-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.75rem',
                    color: '#34d399',
                    fontWeight: 600,
                  }}
                >
                  <CheckCircle2 size={13} />
                  <span>Autonomous Lifecycle</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Security & Integrations Showcase */}
        <section
          style={{
            padding: '3rem 2rem',
            maxWidth: '1100px',
            margin: '2rem auto 5rem auto',
            background: 'linear-gradient(135deg, rgba(18, 20, 29, 0.9) 0%, rgba(25, 28, 42, 0.8) 100%)',
            border: '1px solid var(--border-secondary)',
            borderRadius: 'var(--radius-xl)',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '2rem' }}>
            <div style={{ maxWidth: '540px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#34d399',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  marginBottom: '0.75rem',
                }}
              >
                <ShieldCheck size={14} />
                AES-256-GCM Token Encryption
              </div>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', margin: '0 0 0.75rem 0' }}>
                Enterprise SaaS Connectors
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
                Integrate with Gmail, Slack, Discord, and Google Sheets. OAuth credentials and webhooks are encrypted at rest with authenticated ciphers and never logged in plaintext.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', minWidth: '240px' }}>
              {['Gmail (Read/Send & Attachments)', 'Slack (Channels, DMs & Webhooks)', 'Discord (Bot & Guild Broadcasts)', 'Google Sheets (Read/Append Data)'].map((tool, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.85rem',
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                    background: 'var(--bg-tertiary)',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-primary)',
                  }}
                >
                  <Check size={14} color="#34d399" />
                  <span>{tool}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-primary)',
          padding: '2rem 1.5rem',
          textAlign: 'center',
          fontSize: '0.825rem',
          color: 'var(--text-muted)',
          background: 'var(--bg-secondary)',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <span>&copy; {new Date().getFullYear()} Agentflow_AI. All rights reserved.</span>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link href="/login" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
              Sign In
            </Link>
            <Link href="/register" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
              Create Operator Account
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
