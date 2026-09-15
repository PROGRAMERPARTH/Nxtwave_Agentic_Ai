import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ProtectedRoute from '../../components/ProtectedRoute';
import AppShell from '../../components/AppShell';
import { workflowAPI } from '../../services/api';
import {
  Workflow, Plus, Sparkles, Search, Filter,
  MoreVertical, Copy, Trash2, ExternalLink, Play, Clock
} from 'lucide-react';

export default function WorkflowsListPage() {
  const router = useRouter();
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreating, setIsCreating] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState('');

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const res = await workflowAPI.list({ search, status: statusFilter });
      if (res.data?.data?.workflows) {
        setWorkflows(res.data.data.workflows);
      }
    } catch (err) {
      console.error('Failed to fetch workflows:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, [search, statusFilter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newWorkflowName.trim()) return;

    try {
      const res = await workflowAPI.create({
        name: newWorkflowName,
        nodes: [
          {
            id: 'node-1',
            type: 'trigger',
            position: { x: 150, y: 150 },
            data: { label: 'Start Trigger', action: 'manual' },
          },
        ],
        edges: [],
      });
      const wf = res.data.data.workflow;
      router.push(`/workflows/${wf._id}`);
    } catch (err) {
      console.error('Failed to create workflow:', err);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this workflow?')) return;
    try {
      await workflowAPI.delete(id);
      setWorkflows(workflows.filter((w) => w._id !== id));
    } catch (err) {
      console.error('Failed to delete workflow:', err);
    }
  };

  const handleDuplicate = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await workflowAPI.duplicate(id);
      setWorkflows([res.data.data.workflow, ...workflows]);
    } catch (err) {
      console.error('Failed to duplicate workflow:', err);
    }
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <Head>
          <title>Workflows | Agentflow AI</title>
        </Head>

        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Workflows</h1>
              <p className="text-xs text-zinc-400 mt-1">
                Visual directed acyclic graphs for autonomous multi-agent execution
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/workflows/builder"
                className="btn btn-primary btn-sm flex items-center gap-1.5 shadow-lg shadow-indigo-500/20"
              >
                <Sparkles size={14} /> AI Prompt Builder
              </Link>
              <button
                onClick={() => setIsCreating(true)}
                className="btn btn-secondary btn-sm flex items-center gap-1.5"
              >
                <Plus size={14} /> Blank Workflow
              </button>
            </div>
          </div>

          {/* Create Modal */}
          {isCreating && (
            <div className="p-4 rounded-xl bg-[#13131d] border border-indigo-500/40 flex items-center gap-3">
              <input
                type="text"
                autoFocus
                placeholder="Workflow Name (e.g. Email to Slack Router)"
                value={newWorkflowName}
                onChange={(e) => setNewWorkflowName(e.target.value)}
                className="input flex-1"
                onKeyDown={(e) => e.key === 'Enter' && handleCreate(e)}
              />
              <button onClick={handleCreate} className="btn btn-primary btn-sm">
                Create & Open
              </button>
              <button onClick={() => setIsCreating(false)} className="btn btn-ghost btn-sm">
                Cancel
              </button>
            </div>
          )}

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-2.5 text-zinc-500" size={16} />
              <input
                type="text"
                placeholder="Search workflows by title, description or tag..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#181824] border border-[#2a2a3a] text-zinc-300 text-xs rounded-lg px-3 py-2 outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="paused">Paused</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Workflows Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-40 skeleton" />
              ))}
            </div>
          ) : workflows.length === 0 ? (
            <div className="text-center py-20 bg-[#13131d] border border-[#2a2a3a] rounded-xl">
              <Workflow size={36} className="mx-auto text-zinc-600 mb-3" />
              <h3 className="text-base font-semibold text-zinc-300">No workflows found</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                Generate your first graph with natural language prompts or create a blank canvas.
              </p>
              <div className="mt-5 flex justify-center gap-3">
                <Link href="/workflows/builder" className="btn btn-primary btn-sm flex items-center gap-1.5">
                  <Sparkles size={14} /> Open AI Builder
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {workflows.map((wf) => (
                <div
                  key={wf._id}
                  onClick={() => router.push(`/workflows/${wf._id}`)}
                  className="bg-[#13131d] hover:bg-[#181824] border border-[#2a2a3a] hover:border-indigo-500/40 rounded-xl p-5 cursor-pointer transition flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-sm text-white group-hover:text-indigo-300 transition line-clamp-1">
                        {wf.name}
                      </h3>
                      <span className={`badge shrink-0 ${wf.status === 'active' ? 'badge-success' : 'badge-neutral'}`}>
                        {wf.status}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                      {wf.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#2a2a3a]/60 flex items-center justify-between text-xs text-zinc-500">
                    <div className="flex items-center gap-2">
                      <span>{wf.nodes?.length || 0} nodes</span>
                      <span>•</span>
                      <span>v{wf.version || 1}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleDuplicate(wf._id, e)}
                        className="p-1 text-zinc-400 hover:text-white rounded hover:bg-[#202030]"
                        title="Duplicate"
                      >
                        <Copy size={14} />
                      </button>
                      <button
                        onClick={(e) => handleDelete(wf._id, e)}
                        className="p-1 text-zinc-400 hover:text-red-400 rounded hover:bg-[#202030]"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
