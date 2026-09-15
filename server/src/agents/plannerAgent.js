/**
 * Planner Agent
 * Pure agent: Decides topological node ordering, detects cycles, and calculates confidence score.
 */
class PlannerAgent {
  /**
   * Plan the execution order of nodes for a workflow DAG.
   * @param {Object} workflowSnapshot - { nodes: [], edges: [] }
   * @returns {Object} { executionPlan: string[], confidenceScore: number, branches: Object, isValid: boolean }
   */
  async plan(workflowSnapshot) {
    const { nodes = [], edges = [] } = workflowSnapshot;

    if (!nodes || nodes.length === 0) {
      return {
        isValid: false,
        executionPlan: [],
        confidenceScore: 0.0,
        error: 'Workflow contains no nodes to execute.',
      };
    }

    // Build adjacency list and in-degree map
    const adj = {};
    const inDegree = {};
    const nodeMap = {};

    nodes.forEach((n) => {
      adj[n.id] = [];
      inDegree[n.id] = 0;
      nodeMap[n.id] = n;
    });

    edges.forEach((e) => {
      if (adj[e.source] && inDegree[e.target] !== undefined) {
        adj[e.source].push(e.target);
        inDegree[e.target] = (inDegree[e.target] || 0) + 1;
      }
    });

    // Find all trigger / start nodes (in-degree 0)
    const queue = [];
    nodes.forEach((n) => {
      if (inDegree[n.id] === 0) {
        queue.push(n.id);
      }
    });

    // Kahn's Algorithm for Topological Sort
    const executionPlan = [];
    while (queue.length > 0) {
      const current = queue.shift();
      executionPlan.push(current);

      const neighbors = adj[current] || [];
      for (const neighbor of neighbors) {
        inDegree[neighbor]--;
        if (inDegree[neighbor] === 0) {
          queue.push(neighbor);
        }
      }
    }

    // Cycle detection check
    const hasCycle = executionPlan.length !== nodes.length;
    if (hasCycle) {
      // Append any unvisited nodes as fallback
      nodes.forEach((n) => {
        if (!executionPlan.includes(n.id)) {
          executionPlan.push(n.id);
        }
      });
    }

    // Calculate confidence score (higher if valid DAG and has explicit trigger)
    const hasTrigger = nodes.some((n) => n.type === 'trigger');
    const edgeCoverage = nodes.length > 1 ? edges.length / (nodes.length - 1) : 1;
    let confidenceScore = 0.95;

    if (hasCycle) confidenceScore -= 0.3;
    if (!hasTrigger) confidenceScore -= 0.15;
    if (edgeCoverage < 0.8) confidenceScore -= 0.1;

    confidenceScore = Math.max(0.1, Math.min(1.0, parseFloat(confidenceScore.toFixed(2))));

    return {
      isValid: !hasCycle,
      executionPlan,
      confidenceScore,
      totalNodes: nodes.length,
      totalEdges: edges.length,
      hasTrigger,
    };
  }
}

module.exports = new PlannerAgent();
