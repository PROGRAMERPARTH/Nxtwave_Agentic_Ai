import React, { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import ProtectedRoute from '../../components/ProtectedRoute';
import AppShell from '../../components/AppShell';
import WorkflowCanvas from '../../components/WorkflowCanvas';
import WorkflowToolbar from '../../components/WorkflowCanvas/WorkflowToolbar';
import NodePalette from '../../components/NodePalette';
import NodeConfigPanel from '../../components/NodeConfigPanel';
import useWorkflowStore from '../../store/workflowStore';
import { workflowAPI } from '../../services/api';
import { Loader2, AlertCircle } from 'lucide-react';

export default function WorkflowEditorPage() {
  const router = useRouter();
  const { id } = router.query;
  const {
    currentWorkflow,
    setCurrentWorkflow,
    nodes,
    edges,
    selectedNode,
    deselectNode,
    updateNodeData,
    removeNode,
  } = useWorkflowStore();

  const [workflowName, setWorkflowName] = useState('');
  const [status, setStatus] = useState('draft');
  const [version, setVersion] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState('');

  // Load workflow
  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        setLoading(true);
        const res = await workflowAPI.get(id);
        if (res.data?.data?.workflow) {
          const wf = res.data.data.workflow;
          setCurrentWorkflow(wf);
          setWorkflowName(wf.name || '');
          setStatus(wf.status || 'draft');
          setVersion(wf.version || 1);
        }
      } catch (err) {
        setError('Failed to load workflow.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, setCurrentWorkflow]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      const res = await workflowAPI.update(id, {
        name: workflowName,
        status,
        nodes,
        edges,
      });
      if (res.data?.data?.workflow) {
        setVersion(res.data.data.workflow.version);
      }
    } catch (err) {
      setError('Failed to save workflow.');
    } finally {
      setSaving(false);
    }
  };

  const handleExecute = async () => {
    try {
      setExecuting(true);
      setError('');
      // Save before running
      await workflowAPI.update(id, { name: workflowName, status, nodes, edges });
      const res = await workflowAPI.execute(id, {});
      if (res.data?.data?.execution?._id) {
        router.push(`/executions/${res.data.data.execution._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to trigger execution.');
      setExecuting(false);
    }
  };

  const handleDuplicate = async () => {
    try {
      const res = await workflowAPI.duplicate(id);
      if (res.data?.data?.workflow?._id) {
        router.push(`/workflows/${res.data.data.workflow._id}`);
      }
    } catch (err) {
      setError('Failed to duplicate workflow.');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this workflow?')) return;
    try {
      await workflowAPI.delete(id);
      router.push('/workflows');
    } catch (err) {
      setError('Failed to delete workflow.');
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <AppShell>
          <div className="h-[80vh] flex items-center justify-center">
            <Loader2 size={32} className="animate-spin text-indigo-500" />
          </div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Head>
        <title>{workflowName || 'Workflow Editor'} | Agentflow AI</title>
      </Head>

      <div className="flex flex-col h-screen overflow-hidden bg-[#0a0a0f]">
        {/* Top Toolbar */}
        <WorkflowToolbar
          workflowName={workflowName}
          onNameChange={setWorkflowName}
          status={status}
          onStatusChange={setStatus}
          version={version}
          onSave={handleSave}
          onExecute={handleExecute}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
          isSaving={saving}
          isExecuting={executing}
        />

        {error && (
          <div className="p-2 bg-red-500/10 border-b border-red-500/20 text-red-400 text-xs flex items-center justify-center gap-2">
            <AlertCircle size={14} /> {error}
          </div>
        )}

        {/* Editor Body: Palette + Canvas + Config Panel */}
        <div className="flex flex-1 overflow-hidden relative">
          <NodePalette />

          <div className="flex-1 h-full relative">
            <WorkflowCanvas
              initialNodes={nodes}
              initialEdges={edges}
            />
          </div>

          {selectedNode && (
            <NodeConfigPanel
              node={selectedNode}
              onClose={deselectNode}
              onUpdate={updateNodeData}
              onDelete={(nodeId) => {
                removeNode(nodeId);
                deselectNode();
              }}
            />
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
