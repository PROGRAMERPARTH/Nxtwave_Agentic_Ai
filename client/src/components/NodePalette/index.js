import React from 'react';
import {
  Zap, Bot, Plug, GitFork, ArrowRightLeft,
  Mail, MessageSquare, Send, Table, Globe, Sparkles
} from 'lucide-react';

const nodePaletteItems = [
  {
    category: 'Triggers',
    items: [
      {
        type: 'trigger',
        label: 'Gmail: Inbound Email',
        provider: 'gmail',
        action: 'read_mail',
        defaultConfig: { filter: 'is:unread' },
        icon: Mail,
        color: '#6366f1',
      },
      {
        type: 'trigger',
        label: 'Webhook Listener',
        provider: 'custom',
        action: 'webhook_listener',
        defaultConfig: { path: '/incoming-event' },
        icon: Globe,
        color: '#6366f1',
      },
      {
        type: 'trigger',
        label: 'Cron Schedule',
        action: 'cron_schedule',
        defaultConfig: { cron: '0 9 * * *' },
        icon: Zap,
        color: '#6366f1',
      },
    ],
  },
  {
    category: 'AI Agents & Models',
    items: [
      {
        type: 'aiAction',
        label: 'AI: Extract Entities',
        provider: 'openrouter',
        action: 'extract_entities',
        defaultConfig: { schema: 'amount, vendor, date' },
        icon: Bot,
        color: '#a855f7',
      },
      {
        type: 'aiAction',
        label: 'AI: Sentiment & Intent',
        provider: 'gemini',
        action: 'sentiment_analysis',
        defaultConfig: { categories: 'urgent, normal, low' },
        icon: Sparkles,
        color: '#a855f7',
      },
      {
        type: 'aiAction',
        label: 'AI: Prompt Transform',
        provider: 'openrouter',
        action: 'custom_llm_call',
        defaultConfig: { systemPrompt: 'You are an operations assistant' },
        icon: Bot,
        color: '#a855f7',
      },
    ],
  },
  {
    category: 'Third-Party SaaS',
    items: [
      {
        type: 'integration',
        label: 'Slack: Post Message',
        provider: 'slack',
        action: 'post_message',
        defaultConfig: { channel: '#general', message: 'Alert from Agent' },
        icon: MessageSquare,
        color: '#10b981',
      },
      {
        type: 'integration',
        label: 'Discord: Send Alert',
        provider: 'discord',
        action: 'send_message',
        defaultConfig: { channelId: 'alerts', content: 'Agentflow Notification' },
        icon: Send,
        color: '#10b981',
      },
      {
        type: 'integration',
        label: 'Google Sheets: Append Row',
        provider: 'google-sheets',
        action: 'append_row',
        defaultConfig: { spreadsheetId: 'OPS_DATA', range: 'Sheet1!A:Z' },
        icon: Table,
        color: '#10b981',
      },
    ],
  },
  {
    category: 'Logic & Output',
    items: [
      {
        type: 'condition',
        label: 'Branch Condition',
        action: 'evaluate_rule',
        defaultConfig: { condition: 'value > 100' },
        icon: GitFork,
        color: '#f59e0b',
      },
      {
        type: 'transform',
        label: 'Data Mapper / JSON',
        action: 'transform_json',
        defaultConfig: { mapping: '{ "id": input.id }' },
        icon: ArrowRightLeft,
        color: '#3b82f6',
      },
    ],
  },
];

export default function NodePalette() {
  const onDragStart = (event, nodeData) => {
    event.dataTransfer.setData('application/agentflow-node', JSON.stringify(nodeData));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-64 bg-[#111118] border-r border-[#2a2a3a] h-full overflow-y-auto p-4 flex flex-col gap-6 select-none">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
          Node Palette
        </h3>
        <p className="text-[11px] text-zinc-500">Drag items to add onto the canvas</p>
      </div>

      <div className="space-y-6">
        {nodePaletteItems.map((cat, idx) => (
          <div key={idx} className="space-y-2">
            <span className="text-[11px] font-semibold text-zinc-400 block px-1">
              {cat.category}
            </span>
            <div className="space-y-1.5">
              {cat.items.map((item, itemIdx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={itemIdx}
                    draggable
                    onDragStart={(e) => onDragStart(e, item)}
                    className="p-2.5 rounded-lg bg-[#181824] hover:bg-[#202030] border border-[#2a2a3a] hover:border-indigo-500/50 cursor-grab active:cursor-grabbing flex items-center gap-2.5 transition group"
                  >
                    <div
                      className="w-6 h-6 rounded flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${item.color}20`, color: item.color }}
                    >
                      <Icon size={14} />
                    </div>
                    <span className="text-xs font-medium text-zinc-300 group-hover:text-white line-clamp-1">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
