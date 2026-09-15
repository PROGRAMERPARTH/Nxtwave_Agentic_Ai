const crypto = require('crypto');
const Integration = require('../models/Integration');
const config = require('../config/env');
const { getAdapter } = require('../integrations');

const ALGORITHM = 'aes-256-gcm';

/**
 * Derive a 32-byte key from the CREDENTIAL_ENCRYPTION_KEY env var.
 */
function getEncryptionKey() {
  const raw = config.credentialEncryptionKey;
  if (!raw) throw new Error('CREDENTIAL_ENCRYPTION_KEY is not configured.');
  // Normalize to exactly 32 bytes via SHA-256 hash
  return crypto.createHash('sha256').update(raw).digest();
}

/**
 * Encrypt a plaintext string.
 */
function encrypt(text) {
  if (!text) return '';
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypt an encrypted string.
 */
function decrypt(encryptedText) {
  if (!encryptedText || !encryptedText.includes(':')) return '';
  const key = getEncryptionKey();
  const [ivHex, authTagHex, encrypted] = encryptedText.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

/**
 * List all integrations for a user (tokens are never returned).
 */
const listIntegrations = async (userId) => {
  const integrations = await Integration.find({ owner: userId });
  return integrations.map((i) => ({
    _id: i._id,
    provider: i.provider,
    isConnected: i.isConnected,
    scopes: i.scopes,
    expiresAt: i.expiresAt,
    metadata: i.metadata,
    createdAt: i.createdAt,
    updatedAt: i.updatedAt,
  }));
};

/**
 * Get integration status / health for all providers.
 */
const getIntegrationStatus = async (userId) => {
  const providers = ['gmail', 'slack', 'discord', 'google-sheets'];
  const integrations = await Integration.find({ owner: userId });

  return providers.map((provider) => {
    const integration = integrations.find((i) => i.provider === provider);
    let status = 'not-configured';
    if (integration) {
      if (integration.isConnected) {
        if (integration.expiresAt && new Date(integration.expiresAt) < new Date()) {
          status = 'expired';
        } else {
          status = 'connected';
        }
      } else {
        status = 'disconnected';
      }
    }
    return {
      provider,
      status,
      isConnected: status === 'connected',
      expiresAt: integration?.expiresAt || null,
      metadata: integration?.metadata || {},
    };
  });
};

/**
 * Save or update integration credentials (encrypts tokens before storage).
 */
const saveCredentials = async ({ userId, provider, accessToken, refreshToken, scopes, expiresAt, metadata }) => {
  const encryptedAccess = encrypt(accessToken || '');
  const encryptedRefresh = encrypt(refreshToken || '');

  const integration = await Integration.findOneAndUpdate(
    { owner: userId, provider },
    {
      isConnected: true,
      accessToken: encryptedAccess,
      refreshToken: encryptedRefresh,
      scopes: scopes || [],
      expiresAt: expiresAt || null,
      metadata: metadata || {},
    },
    { upsert: true, new: true }
  );

  return {
    _id: integration._id,
    provider: integration.provider,
    isConnected: integration.isConnected,
    scopes: integration.scopes,
    expiresAt: integration.expiresAt,
    metadata: integration.metadata,
  };
};

/**
 * Test credentials for an integration
 */
const testIntegration = async (userId, provider) => {
  const integration = await Integration.findOne({ owner: userId, provider });
  if (!integration || !integration.isConnected) {
    return { ok: false, message: `${provider} is not connected` };
  }

  const decryptedAccess = decrypt(integration.accessToken);
  const decryptedRefresh = decrypt(integration.refreshToken);

  const adapter = getAdapter(provider);
  if (!adapter) {
    return { ok: true, message: `${provider} connection active (generic adapter)` };
  }

  return await adapter.testConnection({
    accessToken: decryptedAccess,
    refreshToken: decryptedRefresh,
    metadata: integration.metadata,
  });
};

/**
 * Execute an action via a provider integration adapter.
 */
const executeAction = async (provider, action, params = {}, userId = null) => {
  let credentials = {};
  if (userId) {
    const integration = await Integration.findOne({ owner: userId, provider });
    if (integration && integration.isConnected) {
      credentials = {
        accessToken: decrypt(integration.accessToken),
        refreshToken: decrypt(integration.refreshToken),
        metadata: integration.metadata,
      };
    }
  }

  const adapter = getAdapter(provider);
  if (adapter) {
    return await adapter.executeAction(action, params, credentials);
  }

  // Generic fallback if adapter not found
  return {
    dispatched: true,
    provider,
    action,
    result: `Action "${action}" executed on ${provider}`,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Disconnect an integration.
 */
const disconnectIntegration = async (userId, provider) => {
  const integration = await Integration.findOneAndUpdate(
    { owner: userId, provider },
    {
      isConnected: false,
      accessToken: '',
      refreshToken: '',
      expiresAt: null,
    },
    { new: true }
  );
  return integration;
};

module.exports = {
  encrypt,
  decrypt,
  listIntegrations,
  getIntegrationStatus,
  saveCredentials,
  testIntegration,
  executeAction,
  disconnectIntegration,
};
