import mongoose from 'mongoose';

export async function connectToDatabase() {
  // Prefer explicit env, but fall back to a sensible local default for dev
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/data-integrity-logger';

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000, // Reduced timeout to fail faster
    });
    return;
  } catch (err) {
    // Re-throw with clearer message so the frontend can surface it nicely
    const message = process.env.MONGODB_URI
      ? `Failed to connect to MongoDB at ${process.env.MONGODB_URI}`
      : 'Failed to connect to MongoDB. Ensure MongoDB is running locally or set MONGODB_URI.';
    err.message = `${message}: ${err.message}`;
    throw err;
  }
}


