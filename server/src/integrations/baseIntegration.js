/**
 * Base Integration Adapter Contract
 */
class BaseIntegration {
  constructor(name) {
    this.name = name;
  }

  /**
   * Test connection and token health
   * @param {Object} credentials - Decrypted integration credentials
   */
  async testConnection(credentials) {
    throw new Error(`testConnection not implemented for ${this.name}`);
  }

  /**
   * Execute an integration action
   * @param {string} action - Action name
   * @param {Object} params - Action parameters
   * @param {Object} credentials - Decrypted credentials
   */
  async executeAction(action, params, credentials) {
    throw new Error(`executeAction not implemented for ${this.name}`);
  }

  /**
   * Refresh expired tokens if applicable
   * @param {Object} credentials 
   */
  async refreshAuth(credentials) {
    return credentials;
  }
}

module.exports = BaseIntegration;
