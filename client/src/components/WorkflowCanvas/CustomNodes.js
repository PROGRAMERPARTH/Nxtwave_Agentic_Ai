import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import {
  Zap,
  Bot,
  Plug,
  GitFork,
  ArrowRightLeft,
  CheckCircle2,
  Mail,
  MessageSquare,
  Send,
  Table,
  Globe,
  Sliders,
  Sparkles,
} from 'lucide-react';

const getProviderIcon = (provider) => {
  switch (provider) {
    case 'gmail': return Mail;
    case 'slack': return MessageSquare;
    case 'discord': return Send;
    case 'google-sheets': return Table;
    case 'openrouter':
    case 'gemini': return Bot;
    default: return Globe;
  }
};

const CustomNode = ({ data, isConnectable, selected, type, borderCol, headerBg, defaultIcon: DefaultIcon }) => {
  const Icon = data.provider ? getProviderIcon(data.provider) : DefaultIcon;

  return (
    <div
      style={{
        padding: '12px 14px',
        borderRadius: '12px',
        backgroundColor: '#13151f',
        border: `1.5px solid ${selected ? 'var(--primary-400)' : borderCol || 'rgba(255,255,255,0.1)'}`,
        boxShadow: selected
          ? '0 0 20px rgba(99, 102, 241, 0.4), 0 8px 24px rgba(0,0,0,0.6)'
          : '0 6px 18px rgba(0,0,0,0.4)',
        minWidth: '210px',
        maxWidth: '260px',
        transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Target handle (Input) */}
      {type !== 'trigger' && (
        <Handle
          type="target"
          position={Position.Left}
          isConnectable={isConnectable}
          style={{
            background: borderCol || 'var(--primary-400)',
            width: '10px',
            height: '10px',
            border: '2px solid #13151f',
            borderRadius: '50%',
            left: '-6px',
          }}
        />
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '8px' }}>
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            backgroundColor: headerBg || 'rgba(99, 102, 241, 0.2)',
            color: borderCol || 'var(--primary-400)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: `0 2px 8px ${headerBg || 'rgba(0,0,0,0.2)'}`,
          }}
        >
          <Icon size={15} />
        </div>
        <div style={{ overflow: 'hidden', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span
              style={{
                fontSize: '9.5px',
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                color: borderCol || '#64748b',
                fontWeight: 700,
              }}
            >
              {type}
            </span>
            {data.provider && (
              <span
                style={{
                  fontSize: '9px',
                  color: 'var(--text-muted)',
                  textTransform: 'lowercase',
                }}
              >
                {data.provider}
              </span>
            )}
          </div>
          <span
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: '#f8fafc',
              display: 'block',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              marginTop: '1px',
            }}
          >
            {data.label || 'Action'}
          </span>
        </div>
      </div>

      {/* Details / Action Pill */}
      {data.action && (
        <div
          style={{
            fontSize: '11px',
            color: '#94a3b8',
            background: 'rgba(0,0,0,0.3)',
            padding: '4px 8px',
            borderRadius: '6px',
            fontFamily: 'JetBrains Mono, monospace',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '1px solid rgba(255,255,255,0.04)',
          }}
        >
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {data.action}
          </span>
          <span style={{ fontSize: '9px', color: '#64748b', marginLeft: '6px' }}>⚡</span>
        </div>
      )}

      {/* Source handle (Output) */}
      {type !== 'output' && (
        <Handle
          type="source"
          position={Position.Right}
          isConnectable={isConnectable}
          style={{
            background: borderCol || 'var(--primary-400)',
            width: '10px',
            height: '10px',
            border: '2px solid #13151f',
            borderRadius: '50%',
            right: '-6px',
          }}
        />
      )}
    </div>
  );
};

export const TriggerNode = memo((props) => (
  <CustomNode
    {...props}
    type="trigger"
    borderCol="#818cf8"
    headerBg="rgba(129, 140, 248, 0.25)"
    defaultIcon={Zap}
  />
));
TriggerNode.displayName = 'TriggerNode';

export const AIActionNode = memo((props) => (
  <CustomNode
    {...props}
    type="aiAction"
    borderCol="#c084fc"
    headerBg="rgba(192, 132, 252, 0.25)"
    defaultIcon={Bot}
  />
));
AIActionNode.displayName = 'AIActionNode';

export const IntegrationNode = memo((props) => (
  <CustomNode
    {...props}
    type="integration"
    borderCol="#34d399"
    headerBg="rgba(52, 211, 153, 0.25)"
    defaultIcon={Plug}
  />
));
IntegrationNode.displayName = 'IntegrationNode';

export const ConditionNode = memo((props) => (
  <CustomNode
    {...props}
    type="condition"
    borderCol="#fbbf24"
    headerBg="rgba(251, 191, 36, 0.25)"
    defaultIcon={GitFork}
  />
));
ConditionNode.displayName = 'ConditionNode';

export const TransformNode = memo((props) => (
  <CustomNode
    {...props}
    type="transform"
    borderCol="#38bdf8"
    headerBg="rgba(56, 189, 248, 0.25)"
    defaultIcon={ArrowRightLeft}
  />
));
TransformNode.displayName = 'TransformNode';

export const OutputNode = memo((props) => (
  <CustomNode
    {...props}
    type="output"
    borderCol="#2dd4bf"
    headerBg="rgba(45, 212, 191, 0.25)"
    defaultIcon={CheckCircle2}
  />
));
OutputNode.displayName = 'OutputNode';

export const nodeTypes = {
  trigger: TriggerNode,
  aiAction: AIActionNode,
  integration: IntegrationNode,
  condition: ConditionNode,
  transform: TransformNode,
  output: OutputNode,
};
