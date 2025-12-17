/**
 * Database connection manager
 */

import { createClient, Client } from '@libsql/client';
import { Config } from '../config/config';

let clientInstance: Client | null = null;

/**
 * Get database client instance (singleton)
 */
export function getDatabaseClient(): Client {
  if (!clientInstance) {
    clientInstance = createClient({
      url: `file:${Config.DATABASE_PATH}`,
    });
  }
  return clientInstance;
}

/**
 * Close database connection
 */
export function closeDatabase(): void {
  if (clientInstance) {
    clientInstance.close();
    clientInstance = null;
  }
}


