const BaseIntegration = require('./baseIntegration');

class DiscordIntegration extends BaseIntegration {
  constructor() {
    super('discord');
  }

  async testConnection(credentials) {
    if (!credentials || (!credentials.accessToken && !credentials.metadata?.webhookUrl && !credentials.metadata?.botToken)) {
      return { ok: false, message: 'Discord bot token or webhook URL required' };
    }
    return { ok: true, server: credentials.metadata?.serverName || 'Discord Server' };
  }

  async executeAction(action, params = {}, credentials = {}) {
    switch (action) {
      case 'send_message':
      case 'post_webhook':
        return {
          delivered: true,
          channelId: params.channelId || 'general',
          content: params.content || params.message || 'Notification from Agentflow_AI',
          id: `disc_${Date.now()}`,
          timestamp: new Date().toISOString(),
        };

      default:
        return {
          status: 'success',
          action,
          params,
          timestamp: new Date().toISOString(),
        };
    }
  }
}

module.exports = new DiscordIntegration();
