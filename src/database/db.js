/**
 * Database connection manager
 */

const { createClient } = require('@libsql/client');
const { Config } = require('../config/config');

let clientInstance = null;

/**
 * Get database client instance (singleton)
 */
function getDatabaseClient() {
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
function closeDatabase() {
  if (clientInstance) {
    clientInstance.close();
    clientInstance = null;
  }
}

module.exports = {
  getDatabaseClient,
  closeDatabase,
};

