/**
 * Broadcast service for sending messages to all users
 */

import { Bot } from 'grammy';
import { DatabaseManager } from '../database/dbManager';
import { User } from '../database/models';

export class BroadcastService {
  private dbManager: DatabaseManager;

  constructor() {
    this.dbManager = new DatabaseManager();
  }

  /**
   * Broadcast a message to all registered users
   */
  async broadcastMessage(bot: Bot, messageText: string): Promise<{
    success: number;
    failure: number;
    total: number;
  }> {
    const users = await this.dbManager.getAllUsers();
    let successCount = 0;
    let failureCount = 0;

    for (const user of users) {
      try {
        await bot.api.sendMessage({
          chat_id: user.user_id,
          text: messageText,
        });
        successCount++;
        console.log(`Broadcast message sent to user ${user.user_id}`);
      } catch (error) {
        failureCount++;
        console.warn(`Failed to send broadcast to user ${user.user_id}:`, error);
      }
    }

    return {
      success: successCount,
      failure: failureCount,
      total: users.length,
    };
  }
}

