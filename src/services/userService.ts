/**
 * User service for user management operations
 */

import { DatabaseManager } from '../database/dbManager';
import { User } from '../database/models';

export class UserService {
  private dbManager: DatabaseManager;

  constructor() {
    this.dbManager = new DatabaseManager();
  }

  /**
   * Get existing user or create new one
   */
  async getOrCreateUser(
    userId: number,
    username?: string | null,
    firstName?: string | null
  ): Promise<User> {
    let user = await this.dbManager.getUserById(userId);
    if (!user) {
      user = await this.dbManager.createUser(userId, username, firstName);
    }
    return user;
  }

  /**
   * Update user category
   */
  async updateUserCategory(userId: number, category: string): Promise<boolean> {
    return await this.dbManager.updateUserCategory(userId, category);
  }

  /**
   * Get user by ID
   */
  async getUser(userId: number): Promise<User | null> {
    return await this.dbManager.getUserById(userId);
  }
}

