/**
 * Quiz handlers with session for quiz flow
 */

import { Bot, Context, SessionFlavor } from 'grammy';
import { QuizService } from '../services/quizService';
import {
  getQuizQuestionMessage,
  getQuizCompletionMessage,
} from '../utils/messages';
import { getQuizAnswerKeyboard } from '../keyboards/inline';
import { validateAnswerChoice } from '../utils/validators';

// Define session data structure
interface SessionData {
  quizWeekId?: string;
  questions?: Array<{ id?: number; question_text: string; option_a: string; option_b: string; option_c: string; option_d: string; correct_answer: string }>;
  currentQuestionIndex?: number;
  answers?: Record<number, string>;
}

type MyContext = Context & SessionFlavor<SessionData>;

const quizService = new QuizService();

/**
 * Send a quiz question to user
 */
async function sendQuestion(
  ctx: MyContext,
  question: { id?: number; question_text: string; option_a: string; option_b: string; option_c: string; option_d: string },
  questionIndex: number,
  totalQuestions: number
): Promise<void> {
  const questionText = `${question.question_text}

گزینه الف: ${question.option_a}
گزینه ب: ${question.option_b}
گزینه ج: ${question.option_c}
گزینه د: ${question.option_d}`;

  const messageText = getQuizQuestionMessage(
    questionIndex + 1,
    totalQuestions,
    questionText
  );

  const keyboard = getQuizAnswerKeyboard(question.id!);

  if (questionIndex === 0) {
    // First question - send new message
    await ctx.reply(messageText, { reply_markup: keyboard });
  } else {
    // Subsequent questions - edit previous message
    try {
      await ctx.editMessageText(messageText, { reply_markup: keyboard });
    } catch (error) {
      // If edit fails, send new message
      await ctx.reply(messageText, { reply_markup: keyboard });
    }
  }
}

export function setupQuizHandlers(bot: Bot<MyContext>) {
  // Start quiz for a user when they click start button
  bot.callbackQuery('start_quiz_user', async (ctx: MyContext) => {
    try {
      const user = ctx.from;
      if (!user) {
        return;
      }

      const userId = user.id;

      // Get active quiz session
      const session = await quizService.getActiveSession();
      if (!session) {
        await ctx.answerCallbackQuery({
          text: 'در حال حاضر کوئیز فعالی وجود ندارد.',
          show_alert: true,
        });
        return;
      }

      // Check if user has already completed this quiz
      if (await quizService.userHasCompletedQuiz(userId, session.week_id)) {
        await ctx.answerCallbackQuery({
          text: 'شما قبلاً در این کوئیز شرکت کرده‌اید.',
          show_alert: true,
        });
        return;
      }

      // Get all questions
      const questions = await quizService.getActiveQuestions();
      if (questions.length === 0) {
        await ctx.answerCallbackQuery({
          text: 'سوالی برای نمایش وجود ندارد.',
          show_alert: true,
        });
        return;
      }

      // Initialize quiz state
      ctx.session.quizWeekId = session.week_id;
      ctx.session.questions = questions;
      ctx.session.currentQuestionIndex = 0;
      ctx.session.answers = {};

      // Send first question
      await sendQuestion(ctx, questions[0], 0, questions.length);
      await ctx.answerCallbackQuery();
    } catch (error) {
      console.error('Error starting quiz for user:', error);
      await ctx.answerCallbackQuery({
        text: 'خطایی در شروع کوئیز رخ داد.',
        show_alert: true,
      });
    }
  });

  // Handle user's answer to a quiz question
  bot.callbackQuery(/^quiz_answer_(\d+)_([abcd])$/, async (ctx: MyContext) => {
    try {
      const callbackData = ctx.callbackQuery?.data;
      if (!callbackData) {
        return;
      }

      // Parse callback data: quiz_answer_{question_id}_{answer}
      const match = callbackData.match(/^quiz_answer_(\d+)_([abcd])$/);
      if (!match) {
        await ctx.answerCallbackQuery({
          text: 'پاسخ نامعتبر است.',
          show_alert: true,
        });
        return;
      }

      const questionId = parseInt(match[1], 10);
      const answer = match[2];

      if (!validateAnswerChoice(answer)) {
        await ctx.answerCallbackQuery({
          text: 'پاسخ نامعتبر است.',
          show_alert: true,
        });
        return;
      }

      // Get state data
      const quizWeekId = ctx.session.quizWeekId;
      const questions = ctx.session.questions;
      const currentIndex = ctx.session.currentQuestionIndex ?? 0;
      const answers = ctx.session.answers ?? {};

      if (!quizWeekId || !questions || questions.length === 0) {
        await ctx.answerCallbackQuery({
          text: 'خطا در دریافت اطلاعات کوئیز.',
          show_alert: true,
        });
        return;
      }

      const user = ctx.from;
      if (!user) {
        return;
      }

      // Save answer
      await quizService.saveUserAnswer(
        user.id,
        quizWeekId,
        questionId,
        answer
      );

      // Store answer in state
      answers[questionId] = answer;
      ctx.session.answers = answers;

      // Move to next question
      const nextIndex = currentIndex + 1;

      if (nextIndex < questions.length) {
        // Send next question
        ctx.session.currentQuestionIndex = nextIndex;
        const nextQuestion = questions[nextIndex];
        await sendQuestion(ctx, nextQuestion, nextIndex, questions.length);
        await ctx.answerCallbackQuery({
          text: 'پاسخ شما ثبت شد. ✅',
        });
      } else {
        // Quiz completed - calculate score
        await ctx.answerCallbackQuery({
          text: 'در حال محاسبه نتیجه...',
          show_alert: false,
        });

        // Calculate and save score
        const result = await quizService.calculateAndSaveScore(
          user.id,
          quizWeekId
        );

        if (result) {
          // Send completion message
          const completionMessage = getQuizCompletionMessage(
            result.score,
            result.total_questions
          );
          await ctx.editMessageText(completionMessage);
        } else {
          await ctx.editMessageText(
            'خطا در محاسبه نتیجه. لطفاً با ادمین تماس بگیرید.'
          );
        }

        // Clear state
        ctx.session.quizWeekId = undefined;
        ctx.session.questions = undefined;
        ctx.session.currentQuestionIndex = undefined;
        ctx.session.answers = undefined;

        console.log(`Quiz completed for user ${user.id}`);
      }
    } catch (error) {
      console.error('Error handling quiz answer:', error);
      await ctx.answerCallbackQuery({
        text: 'خطایی در ثبت پاسخ رخ داد.',
        show_alert: true,
      });
    }
  });
}


