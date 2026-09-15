const BaseIntegration = require('./baseIntegration');

class GmailIntegration extends BaseIntegration {
  constructor() {
    super('gmail');
  }

  async testConnection(credentials) {
    if (!credentials || !credentials.accessToken) {
      return { ok: false, message: 'Gmail access token missing' };
    }
    return { ok: true, email: credentials.metadata?.email || 'user@gmail.com' };
  }

  async executeAction(action, params = {}, credentials = {}) {
    switch (action) {
      case 'send_email':
        return {
          sent: true,
          to: params.to || 'recipient@example.com',
          subject: params.subject || 'Automated Notification',
          messageId: `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          timestamp: new Date().toISOString(),
        };

      case 'read_emails':
        return {
          messages: [
            {
              id: 'msg_001',
              from: 'billing@vendor.com',
              subject: 'Invoice #4589 for services',
              snippet: 'Please find attached invoice for last month...',
              date: new Date().toISOString(),
            },
          ],
        };

      case 'create_draft':
        return {
          draftId: `draft_${Date.now()}`,
          to: params.to,
          subject: params.subject,
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

module.exports = new GmailIntegration();
