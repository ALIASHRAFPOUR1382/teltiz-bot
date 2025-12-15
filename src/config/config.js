/**
 * Configuration management for the bot
 */

const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

class Config {
  /**
   * Validate that all required configuration is present
   * @throws {Error} If required config is missing
   */
  static validate() {
    if (!this.BOT_TOKEN) {
      throw new Error('BOT_TOKEN is required but not set in environment variables');
    }

    if (this.ADMIN_IDS.length === 0) {
      throw new Error('ADMIN_IDS is required but not set in environment variables');
    }

    if (!this.CHANNEL_ID) {
      throw new Error('CHANNEL_ID is required but not set in environment variables');
    }

    if (!this.WELCOME_GIFT_LINK) {
      throw new Error('WELCOME_GIFT_LINK is required but not set in environment variables');
    }
  }

  /**
   * Check if a user is an admin
   * @param {number} userId Telegram user ID to check
   * @returns {boolean} True if user is admin, False otherwise
   */
  static isAdmin(userId) {
    return this.ADMIN_IDS.includes(userId);
  }
}

/** Telegram Bot Token */
Config.BOT_TOKEN = process.env.BOT_TOKEN || '';

/** Admin User IDs */
Config.ADMIN_IDS = (process.env.ADMIN_IDS || '')
  .split(',')
  .map(id => id.trim())
  .filter(id => id && /^\d+$/.test(id))
  .map(id => parseInt(id, 10));

/** Channel ID or username */
Config.CHANNEL_ID = process.env.CHANNEL_ID || '';

/** Welcome gift link */
Config.WELCOME_GIFT_LINK = process.env.WELCOME_GIFT_LINK || '';

/** Database file path */
Config.DATABASE_PATH = process.env.DATABASE_PATH || 'bot.db';

module.exports = { Config };

