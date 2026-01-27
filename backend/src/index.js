import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import { createServer } from 'http';
import { Server } from 'socket.io';

import authRoutes from './routes/authRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import scraperRoutes from './routes/scraperRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import emailRoutes from './routes/emailRoutes.js';
import { scanAllUserInboxes } from './services/emailScanner.js';

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3001;

const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

global.io = io; 

io.on('connection', (socket) => {
  console.log('🔌 A user connected via WebSocket');
  socket.on('disconnect', () => { console.log('🔌 User disconnected'); });
});

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/scrape', scraperRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/email', emailRoutes);

httpServer.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  
  // Schedule the job to run at the start of every second hour
  console.log('🗓️ Scheduling email scan job to run every two hours...');
  cron.schedule('0 */2 * * *', () => {
    scanAllUserInboxes();
  });

  // Uncomment for immediate testing
  // console.log('🚀 Running initial email scan on startup for testing...');
  // scanAllUserInboxes();
});