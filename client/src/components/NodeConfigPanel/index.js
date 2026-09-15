import React, { useState, useEffect } from 'react';
import useWorkflowStore from '../../store/workflowStore';
import { X, Trash2, CheckCircle2, Sliders, AlertTriangle } from 'lucide-react';

export default function NodeConfigPanel({ node, onClose, onUpdate, onDelete }) {
  const [label, setLabel] = useState('');
  const [provider, setProvider] = useState('');
  const [action, setAction] = useState('');
  const [configJson, setConfigJson] = useState('{}');
  const [jsonError, setJsonError] = useState('');

  useEffect(() => {
    if (node) {
      setLabel(node.data?.label || '');
      setProvider(node.data?.provider || '');
      setAction(node.data?.action || '');
      try {
        setConfigJson(JSON.stringify(node.data?.config || {}, null, 2));
        setJsonError('');
      } catch (e) {
        setConfigJson('{}');
      }
    }
  }, [node]);

  if (!node) return null;

  const handleSave = () => {
    try {
      const parsedConfig = JSON.parse(configJson);
      onUpdate(node.id, {
        label,
        provider,
        action,
        config: parsedConfig,
      });
      setJsonError('');
    } catch (e) {
      setJsonError('Invalid JSON format in configuration');
    }
  };

  return (
    <div className="w-80 bg-[#111118] border-l border-[#2a2a3a] h-full overflow-y-auto p-5 flex flex-col justify-between select-none">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#2a2a3a]">
          <div className="flex items-center gap-2">
            <Sliders size={16} className="text-indigo-400" />
            <h3 className="text-sm font-semibold text-white">Configure Node</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-500 hover:text-white rounded hover:bg-[#1a1a24]"
          >
            <X size={16} />
          </button>
        </div>

        {/* Node Type & ID */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-500">Node ID</span>
          <span className="font-mono text-zinc-400">{node.id}</span>
        </div>

        {/* Label */}
        <div>
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Label
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="input"
            placeholder="Node display name"
          />
        </div>

        {/* Provider */}
        <div>
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Provider / Integration
          </label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="input bg-[#1a1a24] cursor-pointer"
          >
            <option value="">None / Custom Logic</option>
            <option value="gmail">Gmail</option>
            <option value="slack">Slack</option>
            <option value="discord">Discord</option>
            <option value="google-sheets">Google Sheets</option>
            <option value="openrouter">OpenRouter (AI)</option>
            <option value="gemini">Google Gemini (AI)</option>
          </select>
        </div>

        {/* Action */}
        <div>
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Action Identifier
          </label>
          <input
            type="text"
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="input font-mono text-xs"
            placeholder="e.g. read_mail, post_message"
          />
        </div>

        {/* Config JSON */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Parameters (JSON)
            </label>
            {jsonError && (
              <span className="text-[10px] text-red-400 flex items-center gap-1">
                <AlertTriangle size={12} /> {jsonError}
              </span>
            )}
          </div>
          <textarea
            rows={6}
            value={configJson}
            onChange={(e) => {
              setConfigJson(e.target.value);
              setJsonError('');
            }}
            className="input font-mono text-xs bg-[#181824] leading-relaxed resize-none"
            placeholder="{}"
          />
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-6 border-t border-[#2a2a3a] space-y-2">
        <button
          onClick={handleSave}
          className="btn btn-primary w-full py-2.5 text-xs font-semibold"
        >
          Apply Changes
        </button>
        <button
          onClick={() => onDelete(node.id)}
          className="btn btn-ghost text-red-400 hover:bg-red-500/10 w-full py-2 text-xs flex items-center justify-center gap-1.5"
        >
          <Trash2 size={14} /> Remove Node
        </button>
      </div>
    </div>
  );
}
