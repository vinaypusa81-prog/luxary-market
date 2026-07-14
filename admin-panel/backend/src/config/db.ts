import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/luxemarket_admin';
const IS_DEV = process.env.NODE_ENV !== 'production';
const IS_LOCAL = MONGODB_URI.includes('localhost') || MONGODB_URI.includes('127.0.0.1');

// Holds reference to the in-memory server (dev only)
let memoryServerUri: string | null = null;

async function startMemoryServer(): Promise<string> {
  const { MongoMemoryServer } = await import('mongodb-memory-server');
  const mongod = await MongoMemoryServer.create({
    instance: { dbName: 'luxemarket_admin' },
    binary: {
      version: '7.0.14',       // stable LTS version with x64 Windows binary
      arch: 'x64',             // force x64 (ARM Windows runs x64 via emulation)
      platform: 'win32',
    },
  });
  const uri = mongod.getUri();
  console.log('🧪 mongodb-memory-server started for local development:', uri);
  // Keep process alive with this reference
  (global as any).__mongod = mongod;
  return uri;
}

export const connectMongoDB = async (): Promise<void> => {
  const options = {
    autoIndex: true,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  };

  // In dev mode with a localhost URI, try real MongoDB first,
  // fall back to embedded mongodb-memory-server if it's not running.
  let uri = MONGODB_URI;

  if (IS_DEV && IS_LOCAL) {
    // Quick check: can we connect to localhost:27017?
    try {
      await mongoose.connect(MONGODB_URI, { ...options, serverSelectionTimeoutMS: 2000 });
      console.log('💚 MongoDB connected successfully.');
      return;
    } catch {
      console.log('⚠️  No MongoDB at localhost — starting embedded mongodb-memory-server...');
      try {
        uri = await startMemoryServer();
        memoryServerUri = uri;
      } catch (memErr: any) {
        console.error('❌ Failed to start embedded MongoDB:', memErr.message);
        // Fall through and retry original URI
        uri = MONGODB_URI;
      }
    }
  }

  const connectWithRetry = () => {
    console.log('🔄 Attempting MongoDB connection...');
    mongoose.connect(uri, options)
      .then(() => {
        console.log('💚 MongoDB connected successfully.');
      })
      .catch((err) => {
        console.error('❌ MongoDB connection error:', err.message);
        console.log('🔄 Retrying MongoDB connection in 5 seconds...');
        setTimeout(connectWithRetry, 5000);
      });
  };

  mongoose.connection.on('disconnected', () => {
    if (memoryServerUri) return; // Memory server handles its own lifecycle
    console.warn('⚠️ MongoDB disconnected! Attempting to reconnect...');
  });

  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB event error:', err);
  });

  connectWithRetry();
};
