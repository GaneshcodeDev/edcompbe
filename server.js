require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { sequelize } = require('./src/models');
const routes = require('./src/routes');
const { errorHandler, notFound } = require('./src/middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Security Middleware ───
app.use(helmet());
app.use(cors({
  origin: 'https://edcomp.vercel.app' || 'http://localhost:4200',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-Id'],
}));

// ─── Body Parsing ───
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Logging ───
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── Health Check ───
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// ─── API Routes ───
app.use('/api/v1', routes);

// ─── Error Handling ───
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ───
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL Database connected successfully');

    // Sync models - only create missing tables, don't alter existing ones
    await sequelize.sync();
    console.log('✅ Database tables synced');

    app.listen(PORT, () => {
      console.log(`\n🚀 AttendEase API running on http://localhost:${PORT}`);
      console.log(`📋 API docs: http://localhost:${PORT}/api/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}\n`);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error.message);
    process.exit(1);
  }
}

startServer();

module.exports = app;
