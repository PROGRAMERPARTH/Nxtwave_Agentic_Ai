import { create } from 'zustand';

const useWorkflowStore = create((set, get) => ({
  workflows: [],
  currentWorkflow: null,
  nodes: [],
  edges: [],
  selectedNode: null,
  isLoading: false,
  error: null,
  searchQuery: '',
  filters: { status: 'all' },

  // Set workflows list
  setWorkflows: (workflows) => set({ workflows }),

  // Set current workflow being edited
  setCurrentWorkflow: (workflow) =>
    set({
      currentWorkflow: workflow,
      nodes: workflow?.nodes || [],
      edges: workflow?.edges || [],
    }),

  // React Flow node/edge state management
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  onNodesChange: (changes) => {
    const { nodes } = get();
    // Apply changes using React Flow's applyNodeChanges
    set({ nodes: applyChanges(nodes, changes) });
  },

  // Select a node for configuration panel
  selectNode: (node) => set({ selectedNode: node }),
  deselectNode: () => set({ selectedNode: null }),

  // Update a specific node's data
  updateNodeData: (nodeId, data) => {
    const { nodes } = get();
    set({
      nodes: nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n
      ),
    });
  },

  // Add a new node
  addNode: (node) => {
    const { nodes } = get();
    set({ nodes: [...nodes, node] });
  },

  // Remove a node
  removeNode: (nodeId) => {
    const { nodes, edges } = get();
    set({
      nodes: nodes.filter((n) => n.id !== nodeId),
      edges: edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      selectedNode: null,
    });
  },

  // Add a new edge
  addEdge: (edge) => {
    const { edges } = get();
    set({ edges: [...edges, edge] });
  },

  // Search and filter
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setFilters: (filters) => set({ filters }),

  // Loading and error states
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Reset store
  reset: () =>
    set({
      currentWorkflow: null,
      nodes: [],
      edges: [],
      selectedNode: null,
      error: null,
    }),
}));

// Simple change applier for React Flow node changes
function applyChanges(nodes, changes) {
  let result = [...nodes];
  for (const change of changes) {
    if (change.type === 'position' && change.position) {
      result = result.map((n) =>
        n.id === change.id ? { ...n, position: change.position } : n
      );
    } else if (change.type === 'remove') {
      result = result.filter((n) => n.id !== change.id);
    } else if (change.type === 'select') {
      result = result.map((n) =>
        n.id === change.id ? { ...n, selected: change.selected } : n
      );
    } else if (change.type === 'dimensions' && change.dimensions) {
      result = result.map((n) =>
        n.id === change.id ? { ...n, ...change.dimensions } : n
      );
    }
  }
  return result;
}

export default useWorkflowStore;
