/**
 * Database manager for all database operations
 */

const { getDatabaseClient } = require('./db');

class DatabaseManager {
  /**
   * Parse datetime string from SQLite
   * @private
   */
  parseDateTime(dtStr) {
    if (!dtStr) {
      return null;
    }

    try {
      return new Date(dtStr);
    } catch {
      return null;
    }
  }

  // User operations

  /**
   * Create a new user in the database
   * @param {number} userId
   * @param {string|null} [username]
   * @param {string|null} [firstName]
   * @returns {Promise<Object>}
   */
  async createUser(userId, username, firstName) {
    const client = getDatabaseClient();

    try {
      await client.execute({
        sql: `
          INSERT INTO users (user_id, username, first_name)
          VALUES (?, ?, ?)
        `,
        args: [userId, username || null, firstName || null],
      });

      return await this.getUserById(userId);
    } catch (error) {
      // User already exists, return existing user
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return await this.getUserById(userId);
      }
      throw error;
    }
  }

  /**
   * Get user by Telegram user_id
   * @param {number} userId
   * @returns {Promise<Object|null>}
   */
  async getUserById(userId) {
    const client = getDatabaseClient();
    const result = await client.execute({
      sql: 'SELECT * FROM users WHERE user_id = ?',
      args: [userId],
    });

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      user_id: row.user_id,
      username: row.username,
      first_name: row.first_name,
      category: row.category,
      joined_at: this.parseDateTime(row.joined_at),
    };
  }

  /**
   * Update user category
   * @param {number} userId
   * @param {string} category
   * @returns {Promise<boolean>}
   */
  async updateUserCategory(userId, category) {
    const client = getDatabaseClient();
    const result = await client.execute({
      sql: 'UPDATE users SET category = ? WHERE user_id = ?',
      args: [category, userId],
    });

    return (result.rowsAffected ?? 0) > 0;
  }

  /**
   * Get all registered users
   * @returns {Promise<Array>}
   */
  async getAllUsers() {
    const client = getDatabaseClient();
    const result = await client.execute('SELECT * FROM users');

    return result.rows.map((row) => ({
      id: row.id,
      user_id: row.user_id,
      username: row.username,
      first_name: row.first_name,
      category: row.category,
      joined_at: this.parseDateTime(row.joined_at),
    }));
  }

  // Quiz question operations

  /**
   * Create a new quiz question
   * @param {string} questionText
   * @param {string} optionA
   * @param {string} optionB
   * @param {string} optionC
   * @param {string} optionD
   * @param {string} correctAnswer
   * @returns {Promise<Object>}
   */
  async createQuizQuestion(questionText, optionA, optionB, optionC, optionD, correctAnswer) {
    const client = getDatabaseClient();
    const result = await client.execute({
      sql: `
        INSERT INTO quiz_questions 
        (question_text, option_a, option_b, option_c, option_d, correct_answer)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      args: [
        questionText,
        optionA,
        optionB,
        optionC,
        optionD,
        correctAnswer.toLowerCase(),
      ],
    });

    const questionId = Number(result.lastInsertRowid);
    return {
      id: questionId,
      question_text: questionText,
      option_a: optionA,
      option_b: optionB,
      option_c: optionC,
      option_d: optionD,
      correct_answer: correctAnswer.toLowerCase(),
      is_active: true,
    };
  }

  /**
   * Get all active quiz questions
   * @returns {Promise<Array>}
   */
  async getActiveQuizQuestions() {
    const client = getDatabaseClient();
    const result = await client.execute({
      sql: 'SELECT * FROM quiz_questions WHERE is_active = 1 ORDER BY id',
    });

    return result.rows.map((row) => ({
      id: row.id,
      question_text: row.question_text,
      option_a: row.option_a,
      option_b: row.option_b,
      option_c: row.option_c,
      option_d: row.option_d,
      correct_answer: row.correct_answer,
      is_active: Boolean(row.is_active),
      created_at: this.parseDateTime(row.created_at),
    }));
  }

  /**
   * Get quiz question by ID
   * @param {number} questionId
   * @returns {Promise<Object|null>}
   */
  async getQuizQuestionById(questionId) {
    const client = getDatabaseClient();
    const result = await client.execute({
      sql: 'SELECT * FROM quiz_questions WHERE id = ?',
      args: [questionId],
    });

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      question_text: row.question_text,
      option_a: row.option_a,
      option_b: row.option_b,
      option_c: row.option_c,
      option_d: row.option_d,
      correct_answer: row.correct_answer,
      is_active: Boolean(row.is_active),
      created_at: this.parseDateTime(row.created_at),
    };
  }

  // Quiz session operations

  /**
   * Create a new quiz session
   * @param {string} weekId
   * @returns {Promise<Object>}
   */
  async createQuizSession(weekId) {
    const client = getDatabaseClient();
    await client.execute({
      sql: `
        INSERT INTO quiz_sessions (week_id, is_active, started_at)
        VALUES (?, 1, ?)
      `,
      args: [weekId, new Date().toISOString()],
    });

    return await this.getQuizSessionByWeekId(weekId);
  }

  /**
   * Get quiz session by week_id
   * @param {string} weekId
   * @returns {Promise<Object|null>}
   */
  async getQuizSessionByWeekId(weekId) {
    const client = getDatabaseClient();
    const result = await client.execute({
      sql: 'SELECT * FROM quiz_sessions WHERE week_id = ?',
      args: [weekId],
    });

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      week_id: row.week_id,
      is_active: Boolean(row.is_active),
      started_at: this.parseDateTime(row.started_at),
      ended_at: this.parseDateTime(row.ended_at),
    };
  }

  /**
   * Get currently active quiz session
   * @returns {Promise<Object|null>}
   */
  async getActiveQuizSession() {
    const client = getDatabaseClient();
    const result = await client.execute({
      sql: `
        SELECT * FROM quiz_sessions 
        WHERE is_active = 1 
        ORDER BY started_at DESC 
        LIMIT 1
      `,
    });

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      week_id: row.week_id,
      is_active: Boolean(row.is_active),
      started_at: this.parseDateTime(row.started_at),
      ended_at: this.parseDateTime(row.ended_at),
    };
  }

  /**
   * End a quiz session
   * @param {string} weekId
   * @returns {Promise<boolean>}
   */
  async endQuizSession(weekId) {
    const client = getDatabaseClient();
    const result = await client.execute({
      sql: `
        UPDATE quiz_sessions 
        SET is_active = 0, ended_at = ?
        WHERE week_id = ?
      `,
      args: [new Date().toISOString(), weekId],
    });

    return (result.rowsAffected ?? 0) > 0;
  }

  // Quiz result operations

  /**
   * Save quiz result for a user
   * @param {number} userId
   * @param {number} score
   * @param {number} totalQuestions
   * @param {string} quizWeekId
   * @returns {Promise<Object>}
   */
  async saveQuizResult(userId, score, totalQuestions, quizWeekId) {
    const client = getDatabaseClient();
    await client.execute({
      sql: `
        INSERT INTO quiz_results 
        (user_id, score, total_questions, quiz_week_id, completed_at)
        VALUES (?, ?, ?, ?, ?)
      `,
      args: [userId, score, totalQuestions, quizWeekId, new Date().toISOString()],
    });

    return {
      user_id: userId,
      score,
      total_questions: totalQuestions,
      week_id: quizWeekId,
    };
  }

  /**
   * Get top quiz results for a specific week
   * @param {string} quizWeekId
   * @param {number} [limit=3]
   * @returns {Promise<Array>}
   */
  async getTopQuizResults(quizWeekId, limit = 3) {
    const client = getDatabaseClient();
    const result = await client.execute({
      sql: `
        SELECT qr.user_id, qr.score, u.username, u.first_name
        FROM quiz_results qr
        LEFT JOIN users u ON qr.user_id = u.user_id
        WHERE qr.week_id = ?
        ORDER BY qr.score DESC, qr.completed_at ASC
        LIMIT ?
      `,
      args: [quizWeekId, limit],
    });

    return result.rows.map((row) => ({
      user_id: row.user_id,
      score: row.score,
      username: row.username,
      first_name: row.first_name,
    }));
  }

  /**
   * Check if user has already completed a quiz
   * @param {number} userId
   * @param {string} quizWeekId
   * @returns {Promise<boolean>}
   */
  async userHasCompletedQuiz(userId, quizWeekId) {
    const client = getDatabaseClient();
    const result = await client.execute({
      sql: `
        SELECT COUNT(*) as count FROM quiz_results
        WHERE user_id = ? AND week_id = ?
      `,
      args: [userId, quizWeekId],
    });

    return (result.rows[0]?.count ?? 0) > 0;
  }

  // User quiz answer operations

  /**
   * Save user's answer to a quiz question
   * @param {number} userId
   * @param {string} quizWeekId
   * @param {number} questionId
   * @param {string} userAnswer
   * @param {boolean} isCorrect
   * @returns {Promise<Object>}
   */
  async saveUserAnswer(userId, quizWeekId, questionId, userAnswer, isCorrect) {
    const client = getDatabaseClient();
    await client.execute({
      sql: `
        INSERT INTO user_quiz_answers 
        (user_id, quiz_week_id, question_id, selected_answer, is_correct, answered_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      args: [
        userId,
        quizWeekId,
        questionId,
        userAnswer.toLowerCase(),
        isCorrect ? 1 : 0,
        new Date().toISOString(),
      ],
    });

    return {
      user_id: userId,
      quiz_week_id: quizWeekId,
      question_id: questionId,
      selected_answer: userAnswer.toLowerCase(),
      is_correct: isCorrect,
    };
  }

  /**
   * Get all answers for a user in a specific quiz
   * @param {number} userId
   * @param {string} quizWeekId
   * @returns {Promise<Array>}
   */
  async getUserAnswersForQuiz(userId, quizWeekId) {
    const client = getDatabaseClient();
    const result = await client.execute({
      sql: `
        SELECT * FROM user_quiz_answers
        WHERE user_id = ? AND quiz_week_id = ?
        ORDER BY question_id
      `,
      args: [userId, quizWeekId],
    });

    return result.rows.map((row) => ({
      id: row.id,
      user_id: row.user_id,
      quiz_week_id: row.quiz_week_id,
      question_id: row.question_id,
      selected_answer: row.selected_answer,
      is_correct: Boolean(row.is_correct),
      answered_at: this.parseDateTime(row.answered_at),
    }));
  }
}

module.exports = { DatabaseManager };

