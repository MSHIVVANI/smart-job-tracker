// backend/src/index.js

import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import authRoutes from './routes/authRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import scraperRoutes from './routes/scraperRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import { scanAllUserInboxes } from './services/emailScanner.js'; 

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// --- ADD THIS GLOBAL LOGGER MIDDLEWARE ---
app.use((req, res, next) => {
  console.log(`[SERVER INCOMING] Method: ${req.method}, URL: ${req.originalUrl}`);
  next(); // This is crucial to pass the request on
});
// -----------------------------------------

app.get('/', (req, res) => {
  res.status(200).json({ message: "Smart Job Tracker API is running!" });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/scrape', scraperRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/profile', profileRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
   console.log('🗓️  Scheduling hourly email scan job...');
  cron.schedule('0 * * * *', () => {
    console.log('🚀 Running initial email scan on startup for testing...');
    scanAllUserInboxes();
  });
  console.log('!!! --- Manually triggering email scan for debugging --- !!!');
  scanAllUserInboxes();
});