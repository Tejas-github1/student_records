const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { connectDB, disconnectDB } = require('./config/db');

// Load environment variables
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Routes
const authRoutes = require('./routes/authRoutes');
const examRoutes = require('./routes/examRoutes');
const studentRoutes = require('./routes/studentRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// 404 handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found`,
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.stack || err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

let server = null;

// Only start listener if not required as a test module
if (process.env.NODE_ENV !== 'test') {
  connectDB().then(async () => {
    // Check if database needs initial seeding
    const User = require('./models/User');
    const count = await User.countDocuments();
    if (count === 0) {
      console.log('[Server] Database is empty. Auto-seeding initial users and exams...');
      const { seedInitialData } = require('./seed/seed');
      await seedInitialData();
    }

    server = app.listen(PORT, () => {
      console.log(`[Server] Online Examination Server running on http://localhost:${PORT}`);
      console.log(`[WhatsApp Recipient] Configured to: ${process.env.WHATSAPP_RECIPIENT || '+91 6305497264'}`);
    });
  }).catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

// Graceful shutdown
const handleExit = async () => {
  if (server) {
    server.close(() => {
      console.log('HTTP server closed.');
    });
  }
  await disconnectDB();
  process.exit(0);
};

process.on('SIGINT', handleExit);
process.on('SIGTERM', handleExit);

module.exports = app;
