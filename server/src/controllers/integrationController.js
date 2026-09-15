const integrationService = require('../services/integrationService');

const list = async (req, res, next) => {
  try {
    const integrations = await integrationService.listIntegrations(req.user.id);
    res.json({ success: true, data: integrations });
  } catch (err) {
    next(err);
  }
};

const getStatus = async (req, res, next) => {
  try {
    const status = await integrationService.getIntegrationStatus(req.user.id);
    res.json({ success: true, data: status });
  } catch (err) {
    next(err);
  }
};

const connect = async (req, res, next) => {
  try {
    const { provider, accessToken, refreshToken, scopes, expiresAt, metadata } = req.body;
    if (!provider) {
      return res.status(400).json({ success: false, error: 'Provider is required' });
    }
    const result = await integrationService.saveCredentials({
      userId: req.user.id,
      provider,
      accessToken,
      refreshToken,
      scopes,
      expiresAt,
      metadata,
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const testConnection = async (req, res, next) => {
  try {
    const { provider } = req.params;
    const result = await integrationService.testIntegration(req.user.id, provider);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const disconnect = async (req, res, next) => {
  try {
    const { provider } = req.params;
    await integrationService.disconnectIntegration(req.user.id, provider);
    res.json({ success: true, message: `Disconnected ${provider}` });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  list,
  getStatus,
  connect,
  testConnection,
  disconnect,
};
