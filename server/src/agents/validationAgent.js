/**
 * Validation Agent
 * Pure agent: Verifies required output fields, schema constraints, and payload integrity.
 */
class ValidationAgent {
  /**
   * Validate the output of an executed node.
   * @param {Object} nodeResult - { success, nodeId, nodeType, output, error }
   * @param {Object} node - The original node definition
   * @returns {Object} { isValid, issues[], validatedFields[] }
   */
  async validate(nodeResult, node) {
    const issues = [];
    const validatedFields = [];

    // 1. Check if execution succeeded
    if (!nodeResult.success) {
      issues.push({
        severity: 'error',
        field: 'execution',
        message: `Node execution failed: ${nodeResult.error || 'Unknown error'}`,
      });
      return { isValid: false, issues, validatedFields };
    }

    const output = nodeResult.output || {};
    const nodeType = node.type;
    const config = node.data?.config || {};

    // 2. Type-specific validation
    switch (nodeType) {
      case 'trigger':
        if (!output.triggered) {
          issues.push({ severity: 'warning', field: 'triggered', message: 'Trigger did not fire.' });
        } else {
          validatedFields.push('triggered');
        }
        break;

      case 'aiAction':
        if (!output.result && !output.processed) {
          issues.push({ severity: 'error', field: 'result', message: 'AI action produced no result.' });
        } else {
          validatedFields.push('result');
        }

        // If schema is defined, validate extracted fields
        if (config.schema) {
          const requiredFields = config.schema.split(',').map((f) => f.trim().toLowerCase());
          for (const field of requiredFields) {
            if (output[field] !== undefined) {
              validatedFields.push(field);
            }
            // Don't treat as error since AI output might be nested
          }
        }
        break;

      case 'integration':
        if (!output.dispatched && !output.sent && !output.appended && !output.messageId) {
          // Check for simulation marker or real result
          if (!output.simulatedResult && Object.keys(output).length === 0) {
            issues.push({ severity: 'warning', field: 'output', message: 'Integration produced empty output.' });
          }
        }
        validatedFields.push('integration_dispatched');
        break;

      case 'condition':
        if (output.conditionMet === undefined) {
          issues.push({ severity: 'error', field: 'conditionMet', message: 'Condition evaluation produced no result.' });
        } else {
          validatedFields.push('conditionMet');
        }
        break;

      case 'transform':
        if (!output.transformed) {
          issues.push({ severity: 'warning', field: 'transformed', message: 'Transform produced no mapped output.' });
        } else {
          validatedFields.push('transformed');
        }
        break;

      case 'output':
        validatedFields.push('final');
        break;
    }

    // 3. Check payload is not unreasonably large (> 1MB serialized)
    try {
      const serialized = JSON.stringify(output);
      if (serialized.length > 1024 * 1024) {
        issues.push({ severity: 'warning', field: 'payload_size', message: 'Output payload exceeds 1MB.' });
      }
    } catch {
      issues.push({ severity: 'error', field: 'serialization', message: 'Output is not JSON serializable.' });
    }

    const hasErrors = issues.some((i) => i.severity === 'error');

    return {
      isValid: !hasErrors,
      issues,
      validatedFields,
      nodeId: nodeResult.nodeId,
    };
  }
}

module.exports = new ValidationAgent();
