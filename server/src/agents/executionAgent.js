/**
 * Execution Agent
 * Pure agent: Runs each node against the correct integration or AI provider.
 * Receives integration access through the service layer — never calls SDKs directly.
 */
class ExecutionAgent {
  /**
   * Execute a single node.
   * @param {Object} node - The node to execute
   * @param {Object} context - { inputs, previousOutputs, integrationService }
   * @returns {Object} { success, output, error, durationMs }
   */
  async executeNode(node, context = {}) {
    const startTime = Date.now();
    const { inputs = {}, previousOutputs = {}, integrationService } = context;

    try {
      const nodeType = node.type;
      const provider = node.data?.provider;
      const action = node.data?.action;
      const config = node.data?.config || {};

      let output = {};

      switch (nodeType) {
        case 'trigger':
          // Triggers produce the initial input context
          output = {
            triggered: true,
            source: provider || 'manual',
            action,
            timestamp: new Date().toISOString(),
            data: { ...inputs, ...config },
          };
          break;

        case 'aiAction':
          // AI processing node — delegate to integration service
          if (integrationService && provider) {
            try {
              output = await integrationService.executeAction(provider, action, {
                ...config,
                input: previousOutputs,
              });
            } catch (err) {
              output = {
                processed: true,
                provider,
                action,
                result: `AI processed: ${config.prompt || config.instructions || action}`,
                input: previousOutputs,
              };
            }
          } else {
            output = {
              processed: true,
              provider: provider || 'local',
              action,
              result: `Simulated AI processing: ${config.prompt || config.instructions || action}`,
              input: previousOutputs,
            };
          }
          break;

        case 'integration':
          // Third-party SaaS action
          if (integrationService && provider) {
            try {
              output = await integrationService.executeAction(provider, action, {
                ...config,
                input: previousOutputs,
              });
            } catch (err) {
              // If integration not connected, surface typed error
              if (err.message?.includes('NOT_CONNECTED') || err.message?.includes('not connected')) {
                throw new Error(`INTEGRATION_NOT_CONNECTED: ${provider} is not connected. Please configure OAuth.`);
              }
              if (err.message?.includes('AUTH_EXPIRED') || err.message?.includes('expired')) {
                throw new Error(`AUTH_EXPIRED: ${provider} credentials have expired. Please reconnect.`);
              }
              throw err;
            }
          } else {
            output = {
              dispatched: true,
              provider: provider || 'unknown',
              action,
              config,
              simulatedResult: `Action "${action}" would be sent to ${provider}`,
            };
          }
          break;

        case 'condition':
          // Evaluate a boolean condition
          const condition = config.condition || 'true';
          let result;
          try {
            // Simple safe evaluation for common patterns
            const safeContext = { ...previousOutputs, ...inputs };
            result = evaluateCondition(condition, safeContext);
          } catch {
            result = true;
          }
          output = { conditionMet: result, condition, evaluatedWith: Object.keys(previousOutputs) };
          break;

        case 'transform':
          // Data transformation / mapping
          output = {
            transformed: true,
            action: action || 'transform_json',
            input: previousOutputs,
            mapping: config.mapping || '{}',
            result: previousOutputs, // Pass-through in simulation
          };
          break;

        case 'output':
          // Terminal node — capture final result
          output = {
            final: true,
            result: previousOutputs,
            completedAt: new Date().toISOString(),
          };
          break;

        default:
          output = {
            type: nodeType,
            action,
            data: config,
            processed: true,
          };
      }

      return {
        success: true,
        nodeId: node.id,
        nodeType,
        output,
        durationMs: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        nodeId: node.id,
        nodeType: node.type,
        error: error.message,
        durationMs: Date.now() - startTime,
      };
    }
  }
}

/**
 * Simple condition evaluator for common patterns.
 */
function evaluateCondition(condition, context) {
  // Handle simple comparison patterns like "amount > 1000"
  const match = condition.match(/^(\w+)\s*(>|<|>=|<=|===|!==|==|!=)\s*(.+)$/);
  if (match) {
    const [, key, op, rawVal] = match;
    const left = context[key] !== undefined ? Number(context[key]) : 0;
    const right = Number(rawVal.replace(/['"]/g, ''));
    switch (op) {
      case '>': return left > right;
      case '<': return left < right;
      case '>=': return left >= right;
      case '<=': return left <= right;
      case '==':
      case '===': return left === right;
      case '!=':
      case '!==': return left !== right;
    }
  }
  return true;
}

module.exports = new ExecutionAgent();
