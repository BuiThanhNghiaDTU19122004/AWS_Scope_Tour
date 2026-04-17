const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const http = require('http');

// Load associations first
require('./models/associations');

const teamRoutes = require('./routes/team_route');
const subjectRoute = require('./routes/subject_route');
const taskRoutes = require('./routes/task_route');
const loginRoute = require('./routes/login_route');
const signupRoute = require('./routes/signup_route');
const userProfileRoute = require('./routes/user_profile_route');
const joinRoute = require('./routes/join_route');
const invitationRoute = require('./routes/invitation_route');

const parseFeatureToggle = (value, defaultValue = false) => {
  if (typeof value === 'undefined') {
    return defaultValue;
  }

  return String(value).trim().toLowerCase() === 'true';
};

const ENABLE_REDIS = parseFeatureToggle(process.env.ENABLE_REDIS, false);
const ENABLE_RABBITMQ = parseFeatureToggle(process.env.ENABLE_RABBITMQ, false);

// Middlewares
const { warmTaskCache } = ENABLE_REDIS
  ? require('./middlewares/cache_warming')
  : { warmTaskCache: async () => false };
const redisClient = ENABLE_REDIS ? require('./utils/redis_client') : null;
const rabbitmqClient = ENABLE_RABBITMQ ? require('./utils/rabbitmq_client') : null;
const websocketHandler = require('./utils/websocket_handler');
const taskConsumer = ENABLE_RABBITMQ ? require('./consumers/task_consumer') : null;
const databaseMonitor = require('./utils/database_monitor');

const app = express();
const server = http.createServer(app);
const PORT = Number(process.env.PORT) || 3000;
const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'null'
];
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
  : DEFAULT_ALLOWED_ORIGINS;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  methods: ['GET', 'POST', 'PUT','PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

// API Routes
app.use('/api/team', teamRoutes);
app.use('/api/subject', subjectRoute);
app.use('/api/task', taskRoutes);
app.use("/api/login", loginRoute);
app.use("/api/signup", signupRoute);
app.use("/api/user-profile", userProfileRoute);
app.use("/api/join", joinRoute);
app.use('/api/invitation', invitationRoute);

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const initializeServices = async () => {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    if (ENABLE_RABBITMQ && rabbitmqClient && taskConsumer) {
      // Connect to RabbitMQ
      await rabbitmqClient.connect();
      console.log('✅ RabbitMQ connection established.');

      // Start task consumer
      await taskConsumer.startConsuming();
      console.log('✅ Task consumer started.');
    } else {
      console.log('⏸ RabbitMQ is disabled (ENABLE_RABBITMQ=false). Task queue is running in direct DB fallback mode.');
    }

    if (!ENABLE_REDIS) {
      console.log('⏸ Redis is disabled (ENABLE_REDIS=false). Cache warming is skipped.');
    }
    
  } catch (err) {
    console.error('❌ Service initialization failed:', err);
  }
};

// When Redis is ready, warm up cache for important teams and subjects
if (ENABLE_REDIS && redisClient) {
  redisClient.on('connect', async () => {
    console.log('✅ Redis connected - starting cache warming');

    // Add your most active teams and subjects here
    const importantData = [
      { teamId: 1, subjectId: 1 },
      { teamId: 2, subjectId: 2 }
      // Add more as needed
    ];

    for (const { teamId, subjectId } of importantData) {
      await warmTaskCache(teamId, subjectId);
    }
  });

  // Periodically rewarm cache
  const CACHE_REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutes
  setInterval(async () => {
    if (redisClient.isReady) {
      console.log('⏳ Refreshing cache...');
      const importantData = [
        { teamId: 1, subjectId: 1 },
        { teamId: 2, subjectId: 2 }
        // Add more as needed
      ];

      for (const { teamId, subjectId } of importantData) {
        await warmTaskCache(teamId, subjectId);
      }
    }
  }, CACHE_REFRESH_INTERVAL);
}

// Initialize WebSocket
websocketHandler.initialize(server);

// Sync Database & Start Server
const startServer = async () => {
  try {
    await initializeServices();
    await sequelize.sync({ alter: true });
    console.log('Database synced successfully');
    
    // Listen on all interfaces
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`WebSocket server initialized`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

// Add after other initializations
databaseMonitor.startMonitoring();

databaseMonitor.on('connected', () => {
  console.log('🔄 Database reconnected - processing queued operations');
  // Optionally trigger queue processing
});

databaseMonitor.on('disconnected', () => {
  console.log('⚠️ Database disconnected - operations will queue');
});

startServer();
