/**
 * Main entry point for the Telegram bot
 */

import { Bot, Context, SessionFlavor } from 'grammy';
import { freeStorage } from '@grammyjs/storage-free';
import { Config } from './config/config';
import { initDatabase } from './database/migrations';
import { setupStartHandler } from './handlers/start';
import { setupWelcomeHandler } from './handlers/welcome';
import { setupQuizHandlers } from './handlers/quiz';
import { setupAdminHandlers } from './handlers/admin';
import { setupCallbackHandlers } from './handlers/callbacks';

// Define session data structure
interface SessionData {
  quizWeekId?: string;
  questions?: Array<{
    id?: number;
    question_text: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_answer: string;
  }>;
  currentQuestionIndex?: number;
  answers?: Record<number, string>;
}

type MyContext = Context & SessionFlavor<SessionData>;

// Configure logging
const logger = {
  info: (message: string) => console.log(`[INFO] ${new Date().toISOString()} - ${message}`),
  error: (message: string) => console.error(`[ERROR] ${new Date().toISOString()} - ${message}`),
  warn: (message: string) => console.warn(`[WARN] ${new Date().toISOString()} - ${message}`),
};

async function main() {
  try {
    // Validate configuration
    Config.validate();
    logger.info('Configuration validated successfully');
  } catch (error: any) {
    logger.error(`Configuration error: ${error.message}`);
    process.exit(1);
  }

  // Initialize database
  try {
    await initDatabase();
    logger.info('Database initialized successfully');
  } catch (error: any) {
    logger.error(`Database initialization failed: ${error.message}`);
    process.exit(1);
  }

  // Initialize bot
  const bot = new Bot<MyContext>(Config.BOT_TOKEN);

  // Use free storage for sessions (in-memory)
  // For production, consider using Redis or database storage
  const storage = freeStorage<SessionData>(bot.token);
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

