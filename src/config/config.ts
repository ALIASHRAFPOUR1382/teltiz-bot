/**
 * Configuration management for the bot
 */

import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export class Config {
  /** Telegram Bot Token */
  static readonly BOT_TOKEN: string = process.env.BOT_TOKEN || '';

  /** Admin User IDs */
  static readonly ADMIN_IDS: number[] = (process.env.ADMIN_IDS || '')
    .split(',')
    .map(id => id.trim())
    .filter(id => id && /^\d+$/.test(id))
    .map(id => parseInt(id, 10));

  /** Channel ID or username */
  static readonly CHANNEL_ID: string = process.env.CHANNEL_ID || '';

  /** Welcome gift link */
  static readonly WELCOME_GIFT_LINK: string = process.env.WELCOME_GIFT_LINK || '';

  /** Database file path */
  static readonly DATABASE_PATH: string = process.env.DATABASE_PATH || 'bot.db';

  /**
   * Validate that all required configuration is present
   * @throws {Error} If required config is missing
   */
  static validate(): void {
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
   * @param userId Telegram user ID to check
   * @returns True if user is admin, False otherwise
   */
  static isAdmin(userId: number): boolean {
    return this.ADMIN_IDS.includes(userId);
  }
}

