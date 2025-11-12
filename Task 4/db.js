// config/db.js
import mongoose from 'mongoose';
import debug from 'debug';

const log = debug('taskflow:db');

export async function connectDB(uri, options = {}) {
  const defaultOpts = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // keepAlive etc can be set here
    serverSelectionTimeoutMS: 5000,
    ...options,
  };

  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    try {
      attempts++;
      await mongoose.connect(uri, defaultOpts);
      log('MongoDB connected');
      mongoose.connection.on('error', err => {
        log('MongoDB connection error', err);
      });
      mongoose.connection.on('disconnected', () => {
        log('MongoDB disconnected');
      });
      return mongoose;
    } catch (err) {
      log(`MongoDB connect attempt ${attempts} failed: ${err.message}`);
      if (attempts >= maxAttempts) throw err;
      await new Promise(res => setTimeout(res, 1000 * attempts));
    }
  }
}
