/**
 * Database manager for all database operations
 */

import { getDatabaseClient } from './db';
import {
  User,
  QuizQuestion,
  QuizSession,
  QuizResult,
  UserQuizAnswer,
  TopWinner,
} from './models';

export class DatabaseManager {
  /**
   * Parse datetime string from SQLite
   */
  private parseDateTime(dtStr: string | null | undefined): Date | null {
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
   */
  async createUser(
    userId: number,
    username?: string | null,
    firstName?: string | null
  ): Promise<User> {
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
    } catch (error: any) {
      // User already exists, return existing user
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return await this.getUserById(userId);
      }
      throw error;
    }
  }

  /**
   * Get user by Telegram user_id
   */
  async getUserById(userId: number): Promise<User | null> {
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
      id: row.id as number,
      user_id: row.user_id as number,
      username: row.username as string | null,
      first_name: row.first_name as string | null,
      category: row.category as string | null,
      joined_at: this.parseDateTime(row.joined_at as string),
    };
  }

  /**
   * Update user category
   */
  async updateUserCategory(userId: number, category: string): Promise<boolean> {
    const client = getDatabaseClient();
    const result = await client.execute({
      sql: 'UPDATE users SET category = ? WHERE user_id = ?',
      args: [category, userId],
    });

    return (result.rowsAffected ?? 0) > 0;
  }

  /**
   * Get all registered users
   */
  async getAllUsers(): Promise<User[]> {
    const client = getDatabaseClient();
    const result = await client.execute('SELECT * FROM users');

    return result.rows.map((row) => ({
      id: row.id as number,
      user_id: row.user_id as number,
      username: row.username as string | null,
      first_name: row.first_name as string | null,
      category: row.category as string | null,
      joined_at: this.parseDateTime(row.joined_at as string),
    }));
  }

  // Quiz question operations

  /**
   * Create a new quiz question
   */
  async createQuizQuestion(
    questionText: string,
    optionA: string,
    optionB: string,
    optionC: string,
    optionD: string,
    correctAnswer: string
  ): Promise<QuizQuestion> {
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
   */
  async getActiveQuizQuestions(): Promise<QuizQuestion[]> {
    const client = getDatabaseClient();
    const result = await client.execute({
      sql: 'SELECT * FROM quiz_questions WHERE is_active = 1 ORDER BY id',
    });

    return result.rows.map((row) => ({
      id: row.id as number,
      question_text: row.question_text as string,
      option_a: row.option_a as string,
      option_b: row.option_b as string,
      option_c: row.option_c as string,
      option_d: row.option_d as string,
      correct_answer: row.correct_answer as string,
      is_active: Boolean(row.is_active),
      created_at: this.parseDateTime(row.created_at as string),
    }));
  }

  /**
   * Get quiz question by ID
   */
  async getQuizQuestionById(questionId: number): Promise<QuizQuestion | null> {
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
      id: row.id as number,
      question_text: row.question_text as string,
      option_a: row.option_a as string,
      option_b: row.option_b as string,
      option_c: row.option_c as string,
      option_d: row.option_d as string,
      correct_answer: row.correct_answer as string,
      is_active: Boolean(row.is_active),
      created_at: this.parseDateTime(row.created_at as string),
    };
  }

  // Quiz session operations

  /**
   * Create a new quiz session
   */
  async createQuizSession(weekId: string): Promise<QuizSession> {
    const client = getDatabaseClient();
    await client.execute({
      sql: `
        INSERT INTO quiz_sessions (week_id, is_active, started_at)
        VALUES (?, 1, ?)
      `,
      args: [weekId, new Date().toISOString()],
    });

    return await this.getQuizSessionByWeekId(weekId) as QuizSession;
  }

  /**
   * Get quiz session by week_id
   */
  async getQuizSessionByWeekId(weekId: string): Promise<QuizSession | null> {
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
      id: row.id as number,
      week_id: row.week_id as string,
      is_active: Boolean(row.is_active),
      started_at: this.parseDateTime(row.started_at as string),
      ended_at: this.parseDateTime(row.ended_at as string),
    };
  }

  /**
   * Get currently active quiz session
   */
  async getActiveQuizSession(): Promise<QuizSession | null> {
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
      id: row.id as number,
      week_id: row.week_id as string,
      is_active: Boolean(row.is_active),
      started_at: this.parseDateTime(row.started_at as string),
      ended_at: this.parseDateTime(row.ended_at as string),
    };
  }

  /**
   * End a quiz session
   */
  async endQuizSession(weekId: string): Promise<boolean> {
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
   */
  async saveQuizResult(
    userId: number,
    score: number,
    totalQuestions: number,
    quizWeekId: string
  ): Promise<QuizResult> {
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
   */
  async getTopQuizResults(
    quizWeekId: string,
    limit: number = 3
  ): Promise<TopWinner[]> {
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
      user_id: row.user_id as number,
      score: row.score as number,
      username: row.username as string | null,
      first_name: row.first_name as string | null,
    }));
  }

  /**
   * Check if user has already completed a quiz
   */
  async userHasCompletedQuiz(userId: number, quizWeekId: string): Promise<boolean> {
    const client = getDatabaseClient();
    const result = await client.execute({
      sql: `
        SELECT COUNT(*) as count FROM quiz_results
        WHERE user_id = ? AND week_id = ?
      `,
      args: [userId, quizWeekId],
    });

    return (result.rows[0]?.count as number) > 0;
  }

  // User quiz answer operations

  /**
   * Save user's answer to a quiz question
   */
  async saveUserAnswer(
    userId: number,
    quizWeekId: string,
    questionId: number,
    userAnswer: string,
    isCorrect: boolean
  ): Promise<UserQuizAnswer> {
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
   */
  async getUserAnswersForQuiz(
    userId: number,
    quizWeekId: string
  ): Promise<UserQuizAnswer[]> {
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
      id: row.id as number,
      user_id: row.user_id as number,
      quiz_week_id: row.quiz_week_id as string,
      question_id: row.question_id as number,
      selected_answer: row.selected_answer as string,
      is_correct: Boolean(row.is_correct),
      answered_at: this.parseDateTime(row.answered_at as string),
    }));
  }
}



