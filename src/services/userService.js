/**
 * User service for user management operations
 */

const { DatabaseManager } = require('../database/dbManager');

class UserService {
  constructor() {
    this.dbManager = new DatabaseManager();
  }

  /**
   * Get existing user or create new one
   * @param {number} userId
   * @param {string|null} [username]
   * @param {string|null} [firstName]
   * @returns {Promise<Object>}
   */
  async getOrCreateUser(userId, username, firstName) {
    let user = await this.dbManager.getUserById(userId);
    if (!user) {
      user = await this.dbManager.createUser(userId, username, firstName);
    }
    return user;
  }

  /**
   * Update user category
   * @param {number} userId
   * @param {string} category
   * @returns {Promise<boolean>}
   */
  async updateUserCategory(userId, category) {
    return await this.dbManager.updateUserCategory(userId, category);
  }

  /**
   * Get user by ID
   * @param {number} userId
   * @returns {Promise<Object|null>}
   */
  async getUser(userId) {
    return await this.dbManager.getUserById(userId);
  }
}

module.exports = { UserService };

