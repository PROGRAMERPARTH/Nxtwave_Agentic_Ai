import React from 'react';
import { Save, Play, Copy, Trash2, ArrowLeft, Check, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function WorkflowToolbar({
  workflowName,
  onNameChange,
  status,
  onStatusChange,
  version,
  onSave,
  onExecute,
  onDuplicate,
  onDelete,
  isSaving,
  isExecuting,
}) {
  return (
    <div className="h-14 px-4 bg-[#111118] border-b border-[#2a2a3a] flex items-center justify-between gap-4 select-none">
      <div className="flex items-center gap-3">
        <Link
          href="/workflows"
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#1a1a24] transition"
          title="Back to workflows"
        >
          <ArrowLeft size={18} />
        </Link>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={workflowName}
            onChange={(e) => onNameChange(e.target.value)}
            className="bg-transparent text-sm font-semibold text-white focus:bg-[#181824] px-2 py-1 rounded border border-transparent focus:border-[#2a2a3a] outline-none transition"
            placeholder="Untitled Workflow"
          />
          <span className="badge badge-neutral text-[10px]">v{version}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="bg-[#1a1a24] border border-[#2a2a3a] text-zinc-300 text-xs rounded-lg px-2.5 py-1.5 outline-none cursor-pointer"
        >
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="archived">Archived</option>
        </select>

        <button
          onClick={onDuplicate}
          className="btn btn-secondary btn-sm"
          title="Clone workflow"
        >
          <Copy size={14} />
        </button>

        <button
          onClick={onSave}
          disabled={isSaving}
          className="btn btn-secondary btn-sm flex items-center gap-1.5"
        >
          {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          <span>Save</span>
        </button>

        <button
          onClick={onExecute}
          disabled={isExecuting}
          className="btn btn-primary btn-sm flex items-center gap-1.5 shadow-lg shadow-indigo-500/25"
        >
          {isExecuting ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
          <span>Run Agent Chain</span>
        </button>
      </div>
    </div>
  );
}
