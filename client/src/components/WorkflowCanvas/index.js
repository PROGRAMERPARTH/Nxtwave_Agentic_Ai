import React, { useCallback, useRef } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  addEdge as rfAddEdge,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { nodeTypes } from './CustomNodes';
import useWorkflowStore from '../../store/workflowStore';

export default function WorkflowCanvas({ initialNodes = [], initialEdges = [], onNodesChangeCallback, onEdgesChangeCallback }) {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { selectNode, deselectNode } = useWorkflowStore();

  // Sync back to store or parent
  const handleNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes);
      if (onNodesChangeCallback) onNodesChangeCallback(changes);
    },
    [onNodesChange, onNodesChangeCallback]
  );

  const handleEdgesChange = useCallback(
    (changes) => {
      onEdgesChange(changes);
      if (onEdgesChangeCallback) onEdgesChangeCallback(changes);
    },
    [onEdgesChange, onEdgesChangeCallback]
  );

  const onConnect = useCallback(
    (connection) => {
      const edge = { ...connection, animated: true, id: `e-${Date.now()}` };
      setEdges((eds) => rfAddEdge(edge, eds));
    },
    [setEdges]
  );

  const onNodeClick = useCallback(
    (event, node) => {
      selectNode(node);
    },
    [selectNode]
  );

  const onPaneClick = useCallback(() => {
    deselectNode();
  }, [deselectNode]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const rawData = event.dataTransfer.getData('application/agentflow-node');
      if (!rawData) return;

      try {
        const nodeTemplate = JSON.parse(rawData);
        const bounds = reactFlowWrapper.current.getBoundingClientRect();
        const position = {
          x: event.clientX - bounds.left - 100,
          y: event.clientY - bounds.top - 40,
        };

        const newNode = {
          id: `node-${Date.now()}`,
          type: nodeTemplate.type,
          position,
          data: {
            label: nodeTemplate.label,
            provider: nodeTemplate.provider || '',
            action: nodeTemplate.action || '',
            config: nodeTemplate.defaultConfig || {},
          },
        };

        setNodes((nds) => nds.concat(newNode));
        selectNode(newNode);
      } catch (err) {
        console.error('Error dropping node:', err);
      }
    },
    [setNodes, selectNode]
  );

  return (
    <div ref={reactFlowWrapper} className="w-full h-full relative bg-[#0a0a0f]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onDragOver={onDragOver}
        onDrop={onDrop}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
        defaultEdgeOptions={{ animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } }}
      >
        <Controls position="bottom-left" />
        <MiniMap
          nodeColor={(n) => {
            if (n.type === 'trigger') return '#6366f1';
            if (n.type === 'aiAction') return '#a855f7';
            if (n.type === 'integration') return '#10b981';
            if (n.type === 'condition') return '#f59e0b';
            return '#3b82f6';
          }}
          maskColor="rgba(10, 10, 15, 0.7)"
          position="bottom-right"
        />
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#2a2a3a" />
      </ReactFlow>
    </div>
  );
}
