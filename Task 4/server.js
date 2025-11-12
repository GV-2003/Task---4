// server.js
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import taskRoutes from './routes/taskRoutes.js';
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await connectDB(process.env.MONGODB_URI);

    // Global middleware
    app.use(cors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
      methods: ['GET','POST','PUT','DELETE','OPTIONS']
    }));
    app.use(express.json({ limit: '5mb' }));
    app.use(morgan('dev'));
    app.use(requestLogger);

    // Health check
    app.get('/', (req, res) => res.json({ message: 'TaskFlow API (MongoDB) running' }));

    // Routes
    app.use('/api/tasks', taskRoutes);

    // Error handler (last)
    app.use(errorHandler);

    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('SIGINT received, closing server & DB connection');
      server.close(async () => {
        await (await import('mongoose')).default.disconnect();
        process.exit(0);
      });
    });
  } catch (err) {
    console.error('Failed to start app:', err);
    process.exit(1);
  }
})();
