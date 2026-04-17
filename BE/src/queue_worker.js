const path = require('path');

require('dotenv').config({ 
  path: path.join(__dirname, '../.env') 
});

const ENABLE_RABBITMQ = String(process.env.ENABLE_RABBITMQ || '').trim().toLowerCase() === 'true';

let rabbitmqClient;
let taskConsumer;
let sequelize;

async function startWorker() {
  console.log('🚀 Starting queue worker...');

  if (!ENABLE_RABBITMQ) {
    console.log('⏸ Queue worker is disabled (ENABLE_RABBITMQ=false).');
    process.exit(0);
  }

  rabbitmqClient = require('./utils/rabbitmq_client');
  taskConsumer = require('./consumers/task_consumer');
  sequelize = require('./config/database');

  // Load associations only when worker is enabled.
  require('./models/associations');
  
  try {
    // Try to connect to database
    try {
      await sequelize.authenticate();
      console.log('✅ Database connected successfully');
    } catch (dbError) {
      console.log('⚠️ Database not available at startup:', dbError.message);
      console.log('🔄 Worker will continue and retry database operations when messages arrive');
    }
    
    // Connect to RabbitMQ
    await rabbitmqClient.connect();
    
    // Start consuming messages
    await taskConsumer.startConsuming();
    
    // Start retry cleanup
    taskConsumer.startRetryCleanup();
    
    console.log('✅ Queue worker started successfully');
    
    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('📴 Received SIGTERM, shutting down gracefully...');
      taskConsumer.cleanup();
      await rabbitmqClient.close();
      process.exit(0);
    });
    
    process.on('SIGINT', async () => {
      console.log('📴 Received SIGINT, shutting down gracefully...');
      taskConsumer.cleanup();
      await rabbitmqClient.close();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Failed to start queue worker:', error);
    process.exit(1);
  }
}

startWorker();