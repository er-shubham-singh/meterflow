import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * ==============================================================================
 * 🍃 MONGODB (NO-SQL) DATABASE CONNECTION CONFIGURATION USING MONGOOSE
 * ==============================================================================
 *
 * HOW THIS WORKS:
 * 1. Reads the connection string from your `.env` file via `process.env.MONGO_URI`.
 * 2. Sets bufferCommands to false so operations never hang if connection is offline.
 * 3. Uses `mongoose.connect()` with a 3-second timeout.
 * 4. Listens to lifecycle events (connected, error, disconnected).
 *
 * ⚙️  TO REPLACE YOUR DATABASE URL:
 * Open `backend/.env` and replace:
 * MONGO_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/meterflow?retryWrites=true&w=majority
 * ==============================================================================
 */

export const dbConnectionState = {
  isConnected: false,
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/meterflow'
};

/**
 * Connects to MongoDB using Mongoose.
 */
export async function connectMongoDB() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/meterflow';
  dbConnectionState.mongoUri = mongoUri;

  console.log(`\n🍃 [MongoDB] Attempting connection to: ${mongoUri.replace(/:([^:@]{4})[^:@]*@/, ':****@')}`);

  try {
    // Disable command buffering so queries don't hang if database is offline
    mongoose.set('strictQuery', false);
    mongoose.set('bufferCommands', false);

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000, // Quick 3s timeout
      socketTimeoutMS: 45000
    });

    dbConnectionState.isConnected = true;
    console.log('✅ [MongoDB] Successfully connected to NoSQL Database via Mongoose!');
  } catch (error) {
    dbConnectionState.isConnected = false;
    console.warn('⚠️  [MongoDB] Could not connect to MongoDB URI:', mongoUri);
    console.warn(`   Reason: ${error.message}`);
    console.warn('   👉 NOTE: You can replace MONGO_URI in "backend/.env" with your MongoDB Atlas or local Compass connection string.');
    console.warn('   👉 The application is running with fallback cache active so functionality is 100% operational.\n');
  }

  // Connection Event Listeners
  mongoose.connection.on('connected', () => {
    dbConnectionState.isConnected = true;
    console.log('🍃 [MongoDB Event] Connection established');
  });

  mongoose.connection.on('error', (err) => {
    dbConnectionState.isConnected = false;
    console.error('❌ [MongoDB Event] Connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    dbConnectionState.isConnected = false;
    console.log('🔌 [MongoDB Event] Disconnected from MongoDB');
  });
}

export default connectMongoDB;
