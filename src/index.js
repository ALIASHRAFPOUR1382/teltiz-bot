/**
 * Main entry point for the Telegram bot
 */

const { Bot } = require('grammy');
const { freeStorage } = require('@grammyjs/storage-free');
const { Config } = require('./config/config');
const { initDatabase } = require('./database/migrations');
const { setupStartHandler } = require('./handlers/start');
const { setupWelcomeHandler } = require('./handlers/welcome');
const { setupQuizHandlers } = require('./handlers/quiz');
const { setupAdminHandlers } = require('./handlers/admin');
const { setupCallbackHandlers } = require('./handlers/callbacks');

// Configure logging
const logger = {
  info: (message) => console.log(`[INFO] ${new Date().toISOString()} - ${message}`),
  error: (message) => console.error(`[ERROR] ${new Date().toISOString()} - ${message}`),
  warn: (message) => console.warn(`[WARN] ${new Date().toISOString()} - ${message}`),
};

async function main() {
  try {
    // Validate configuration
    Config.validate();
    logger.info('Configuration validated successfully');
  } catch (error) {
    logger.error(`Configuration error: ${error.message}`);
    process.exit(1);
  }

  // Initialize database
  try {
    await initDatabase();
    logger.info('Database initialized successfully');
  } catch (error) {
    logger.error(`Database initialization failed: ${error.message}`);
    process.exit(1);
  }

  // Initialize bot
  const bot = new Bot(Config.BOT_TOKEN);

  // Use free storage for sessions (in-memory)
  // For production, consider using Redis or database storage
  const storage = freeStorage(bot.token);
  bot.use(storage);

  // Setup handlers
  setupStartHandler(bot);
  setupWelcomeHandler(bot);
  setupQuizHandlers(bot);
  setupAdminHandlers(bot);
  setupCallbackHandlers(bot);

  // Error handler
  bot.catch((err) => {
    logger.error(`Error in bot: ${err.error.message}`);
  });

  // Start bot
  logger.info('Bot started successfully');
  await bot.start();

  // Graceful shutdown
  process.once('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully...');
    bot.stop();
    process.exit(0);
  });

  process.once('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully...');
    bot.stop();
    process.exit(0);
  });
}

// Run main function
main().catch((error) => {
  logger.error(`Fatal error: ${error.message}`);
  process.exit(1);
});

