/**
 * Database migration and initialization script
 */

const { createClient } = require('@libsql/client');
const { Config } = require('../config/config');
const fs = require('fs');
const path = require('path');

/**
 * Initialize database with all required tables
 * @param {string} [dbPath]
 * @returns {Promise<void>}
 */
async function initDatabase(dbPath) {
  const databasePath = dbPath || Config.DATABASE_PATH;

  // Ensure directory exists
  const dbDir = path.dirname(databasePath);
  if (dbDir && !fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // Create database client
  const client = createClient({
    url: `file:${databasePath}`,
  });

  try {
    // Create users table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id BIGINT UNIQUE NOT NULL,
        username TEXT,
        first_name TEXT,
        category TEXT,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create quiz_questions table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS quiz_questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question_text TEXT NOT NULL,
        option_a TEXT NOT NULL,
        option_b TEXT NOT NULL,
        option_c TEXT NOT NULL,
        option_d TEXT NOT NULL,
        correct_answer CHAR(1) NOT NULL,
        is_active BOOLEAN DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create quiz_sessions table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS quiz_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        week_id TEXT UNIQUE NOT NULL,
        is_active BOOLEAN DEFAULT 1,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ended_at TIMESTAMP
      )
    `);

    // Create quiz_results table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS quiz_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id BIGINT NOT NULL,
        week_id TEXT NOT NULL,
        score INTEGER NOT NULL,
        total_questions INTEGER NOT NULL,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id)
      )
    `);

    // Create user_quiz_answers table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS user_quiz_answers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id BIGINT NOT NULL,
        quiz_week_id TEXT NOT NULL,
        question_id INTEGER NOT NULL,
        selected_answer CHAR(1) NOT NULL,
        is_correct BOOLEAN NOT NULL,
        answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id),
        FOREIGN KEY (question_id) REFERENCES quiz_questions(id)
      )
    `);

    // Create indexes for better performance
    await client.execute('CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id)');
    await client.execute('CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id ON quiz_results(user_id)');
    await client.execute('CREATE INDEX IF NOT EXISTS idx_quiz_results_week_id ON quiz_results(week_id)');
    await client.execute('CREATE INDEX IF NOT EXISTS idx_quiz_results_score ON quiz_results(score DESC)');
    await client.execute('CREATE INDEX IF NOT EXISTS idx_quiz_questions_active ON quiz_questions(is_active)');
    await client.execute('CREATE INDEX IF NOT EXISTS idx_quiz_sessions_active ON quiz_sessions(is_active)');

    console.log(`Database initialized successfully at ${databasePath}`);
  } finally {
    client.close();
  }
}

// Run migration when executed directly
if (require.main === module) {
  initDatabase()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { initDatabase };

