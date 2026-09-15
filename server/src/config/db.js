const mongoose = require('mongoose');
const config = require('./env');

let isConnected = false;
let usingFallback = false;
let mongoServer = null;

const connectDB = async () => {
  // 1. First attempt to connect to configured MongoDB URI
  try {
    const conn = await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 3000,
      socketTimeoutMS: 45000,
    });
    isConnected = true;
    usingFallback = false;
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`⚠️ MongoDB connection to "${config.mongodbUri}" failed: ${error.message}`);
    console.warn('📦 Initializing MongoMemoryServer in-memory database fallback...');
  }

  // 2. Fall back to MongoMemoryServer
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    const conn = await mongoose.connect(uri);
    isConnected = true;
    usingFallback = true;
    console.log(`✅ In-Memory MongoDB connected at ${uri} (Zero-Config mode)`);
    return conn;
  } catch (memError) {
    console.error('❌ Failed to start in-memory MongoDB fallback:', memError.message);
    throw memError;
  }
};

const getDBStatus = () => ({
  connected: isConnected,
  type: usingFallback ? 'in-memory' : isConnected ? 'mongodb' : 'disconnected',
  host: isConnected ? (usingFallback ? 'in-memory-server' : mongoose.connection.host) : 'none',
});

module.exports = { connectDB, getDBStatus };
