/**
 * Broadcast service for sending messages to all users
 */

const { DatabaseManager } = require('../database/dbManager');

class BroadcastService {
  constructor() {
    this.dbManager = new DatabaseManager();
  }

  /**
   * Broadcast a message to all registered users
   * @param {import('grammy').Bot} bot
   * @param {string} messageText
   * @returns {Promise<{success: number, failure: number, total: number}>}
   */
  async broadcastMessage(bot, messageText) {
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

module.exports = { BroadcastService };

