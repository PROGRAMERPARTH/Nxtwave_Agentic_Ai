const gmail = require('./gmailIntegration');
const slack = require('./slackIntegration');
const discord = require('./discordIntegration');
const googleSheets = require('./googleSheetsIntegration');

const adapters = {
  gmail,
  slack,
  discord,
  'google-sheets': googleSheets,
};

module.exports = {
  adapters,
  getAdapter(provider) {
    return adapters[provider] || null;
  },
};
