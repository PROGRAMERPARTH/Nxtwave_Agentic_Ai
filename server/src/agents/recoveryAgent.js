/**
 * Recovery Agent
 * Pure agent: Classifies failures and decides between retry_with_backoff and escalate.
 */
class RecoveryAgent {
  /**
   * Classify an error and decide recovery action.
   * @param {Object} error - { message, nodeId, nodeType, retryCount }
   * @returns {Object} { classification, action, backoffMs, maxRetries, shouldEscalate }
   */
  async recover(error) {
    const message = (error.message || error.error || '').toLowerCase();
    const retryCount = error.retryCount || 0;

    let classification = 'UNKNOWN';
    let action = 'escalate';
    let backoffMs = 0;
    let maxRetries = 0;
    let shouldEscalate = true;

    // ─── Classify the failure type ──────────────────
    if (message.includes('missing_fields') || message.includes('required') || message.includes('validation')) {
      classification = 'MISSING_FIELDS';
      action = 'escalate';
      maxRetries = 0;
      shouldEscalate = true;
    } else if (message.includes('api_failure') || message.includes('econnrefused') ||
               message.includes('network') || message.includes('timeout') || message.includes('socket')) {
      classification = 'API_FAILURE';
      action = 'retry_with_backoff';
      maxRetries = 3;
      backoffMs = Math.min(1000 * Math.pow(2, retryCount), 30000); // Exponential backoff capped at 30s
      shouldEscalate = retryCount >= maxRetries;
    } else if (message.includes('auth_expired') || message.includes('token expired') ||
               message.includes('unauthorized') || message.includes('401')) {
      classification = 'AUTH_EXPIRED';
      action = 'escalate';
      maxRetries = 0;
      shouldEscalate = true;
    } else if (message.includes('rate_limit') || message.includes('429') || message.includes('too many')) {
      classification = 'RATE_LIMIT';
      action = 'retry_with_backoff';
      maxRetries = 5;
      backoffMs = Math.min(2000 * Math.pow(2, retryCount), 60000); // Longer backoff for rate limits
      shouldEscalate = retryCount >= maxRetries;
    } else if (message.includes('transient') || message.includes('temporary') ||
               message.includes('502') || message.includes('503') || message.includes('504')) {
      classification = 'TRANSIENT';
      action = 'retry_with_backoff';
      maxRetries = 3;
      backoffMs = Math.min(1500 * Math.pow(2, retryCount), 30000);
      shouldEscalate = retryCount >= maxRetries;
    } else if (message.includes('not_connected') || message.includes('integration_not_connected')) {
      classification = 'INTEGRATION_NOT_CONNECTED';
      action = 'escalate';
      maxRetries = 0;
      shouldEscalate = true;
    } else {
      classification = 'UNKNOWN';
      action = retryCount < 2 ? 'retry_with_backoff' : 'escalate';
      maxRetries = 2;
      backoffMs = 2000 * (retryCount + 1);
      shouldEscalate = retryCount >= maxRetries;
    }

    // If retries exhausted, always escalate
    if (retryCount >= maxRetries && action === 'retry_with_backoff') {
      action = 'escalate';
      shouldEscalate = true;
    }

    return {
      classification,
      action,
      backoffMs,
      maxRetries,
      currentRetry: retryCount,
      shouldEscalate,
      nodeId: error.nodeId,
      originalError: error.message || error.error,
    };
  }
}

module.exports = new RecoveryAgent();
