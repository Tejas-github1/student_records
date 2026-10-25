const mongoose = require('mongoose');

let mongoMemoryServer = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/student_exam_db';
  const useMemoryPreference = process.env.USE_MEMORY_DB || 'auto';

  if (useMemoryPreference === 'true') {
    return await connectMemoryDB('Forced by USE_MEMORY_DB=true');
  }

  try {
    // Attempt standard connection with 2.5s server selection timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`[Database] Connected to MongoDB at ${uri.replace(/\/\/.*@/, '//***@')}`);
  } catch (err) {
    if (useMemoryPreference === 'auto') {
      console.warn(`[Database] Could not connect to external MongoDB (${err.message}). Starting embedded in-memory database...`);
      return await connectMemoryDB('Automatic fallback');
    } else {
      console.error('[Database] MongoDB connection failed:', err);
      throw err;
    }
  }
};

const connectMemoryDB = async (reason = '') => {
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongoMemoryServer = await MongoMemoryServer.create({
      instance: {
        dbName: 'student_exam_db',
      },
      binary: {
        arch: 'x64',
        version: '7.0.14',
      },
    });
    const memoryUri = mongoMemoryServer.getUri();
    await mongoose.connect(memoryUri);
    console.log(`[Database] Connected to embedded in-memory MongoDB (${reason})`);
    return memoryUri;
  } catch (error) {
    console.error('[Database] Failed to start embedded in-memory MongoDB:', error);
    throw error;
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
      mongoMemoryServer = null;
    }
  } catch (error) {
    console.error('[Database] Error while disconnecting:', error);
  }
};

module.exports = {
  connectDB,
  disconnectDB,
};
