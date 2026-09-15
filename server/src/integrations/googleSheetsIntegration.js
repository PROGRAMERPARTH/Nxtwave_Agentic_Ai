const BaseIntegration = require('./baseIntegration');

class GoogleSheetsIntegration extends BaseIntegration {
  constructor() {
    super('google-sheets');
  }

  async testConnection(credentials) {
    if (!credentials || !credentials.accessToken) {
      return { ok: false, message: 'Google Sheets OAuth token required' };
    }
    return { ok: true, email: credentials.metadata?.email || 'user@google.com' };
  }

  async executeAction(action, params = {}, credentials = {}) {
    switch (action) {
      case 'append_row':
        return {
          appended: true,
          spreadsheetId: params.spreadsheetId || 'default_sheet_id',
          tableRange: 'Sheet1!A1:E1',
          updates: {
            updatedRows: 1,
            updatedColumns: Array.isArray(params.values) ? params.values.length : 3,
            updatedCells: 3,
          },
          timestamp: new Date().toISOString(),
        };

      case 'read_rows':
        return {
          spreadsheetId: params.spreadsheetId || 'default_sheet_id',
          range: params.range || 'Sheet1!A1:D10',
          values: [
            ['InvoiceID', 'Vendor', 'Amount', 'Date'],
            ['INV-1001', 'Acme Corp', '1250.00', '2026-03-01'],
            ['INV-1002', 'CloudNet', '450.00', '2026-03-02'],
          ],
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

module.exports = new GoogleSheetsIntegration();
