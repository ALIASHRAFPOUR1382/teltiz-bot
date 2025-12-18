/**
 * Admin command handlers
 */

import { Bot, Context } from 'grammy';
import { Config } from '../config/config';
import { QuizService } from '../services/quizService';
import { BroadcastService } from '../services/broadcastService';
import {
  getQuizAnnouncementMessage,
  getQuizWinnersMessage,
  getAdminHelpMessage,
} from '../utils/messages';
import { getQuizStartKeyboard } from '../keyboards/inline';

const quizService = new QuizService();
const broadcastService = new BroadcastService();

function isAdmin(userId: number): boolean {
  return Config.isAdmin(userId);
}

export function setupAdminHandlers(bot: Bot) {
  // Handle /startquiz command - Start a new quiz session
  bot.command('startquiz', async (ctx: Context) => {
    const user = ctx.from;
    if (!user || !isAdmin(user.id)) {
      await ctx.reply('شما دسترسی به این دستور را ندارید.');
      return;
    }

    try {
      // Check if there's already an active quiz
      const activeSession = await quizService.getActiveSession();
      if (activeSession) {
        await ctx.reply(
          `یک کوئیز فعال وجود دارد (Week ID: ${activeSession.week_id}).\n` +
            'لطفاً ابتدا کوئیز قبلی را با دستور /endquiz پایان دهید.'
        );
        return;
      }

      // Get active questions
      const questions = await quizService.getActiveQuestions();
      if (questions.length === 0) {
        await ctx.reply(
          'هیچ سوال فعالی در پایگاه داده وجود ندارد.\n' +
            'لطفاً ابتدا سوالات را اضافه کنید.'
        );
        return;
      }

      // Create new quiz session
      const session = await quizService.createQuizSession();

      // Send announcement to channel
      const announcementText = getQuizAnnouncementMessage();
      const keyboard = getQuizStartKeyboard();

      try {
        await bot.api.sendMessage({
          chat_id: Config.CHANNEL_ID,
          text: announcementText,
          reply_markup: keyboard,
        });
        await ctx.reply(
          `✅ کوئیز هفتگی با موفقیت شروع شد!\n` +
            `Week ID: ${session.week_id}\n` +
            `تعداد سوالات: ${questions.length}\n` +
            `اعلان در کانال ارسال شد.`
        );
        console.log(
          `Quiz started by admin ${user.id}, Week ID: ${session.week_id}`
        );
      } catch (error) {
        console.error('Error sending announcement to channel:', error);
        await ctx.reply(
          `❌ خطا در ارسال اعلان به کانال: ${error}\n` +
            `کوئیز ایجاد شد اما اعلان ارسال نشد.`
        );
      }
    } catch (error) {
      console.error('Error starting quiz:', error);
      await ctx.reply(`خطا در شروع کوئیز: ${error}`);
    }
  });

  // Handle /endquiz command - End quiz and announce winners
  bot.command('endquiz', async (ctx: Context) => {
    const user = ctx.from;
    if (!user || !isAdmin(user.id)) {
      await ctx.reply('شما دسترسی به این دستور را ندارید.');
      return;
    }

    try {
      // Get active quiz session
      const session = await quizService.getActiveSession();
      if (!session) {
        await ctx.reply('هیچ کوئیز فعالی وجود ندارد.');
        return;
      }

      // End the session
      const success = await quizService.endQuizSession(session.week_id);
      if (!success) {
        await ctx.reply('خطا در پایان دادن به کوئیز.');
        return;
      }

      // Get top winners
      const winners = await quizService.getTopWinners(session.week_id, 3);

      if (winners.length === 0) {
        await ctx.reply(
          `کوئیز با موفقیت پایان یافت.\n` +
            `هیچ شرکت‌کننده‌ای وجود نداشت.`
        );
        return;
      }

      // Format winners message
      const winnersMessage = getQuizWinnersMessage(
        session.week_id,
        winners
      );

      // Send winners announcement to channel
      try {
        await bot.api.sendMessage({
          chat_id: Config.CHANNEL_ID,
          text: winnersMessage,
        });
        await ctx.reply(
          `✅ کوئیز با موفقیت پایان یافت و برندگان اعلام شدند.\n` +
            `Week ID: ${session.week_id}\n` +
            `تعداد برندگان: ${winners.length}`
        );
        console.log(
          `Quiz ended by admin ${user.id}, Week ID: ${session.week_id}`
        );
      } catch (error) {
        console.error('Error sending winners announcement:', error);
        await ctx.reply(
          `❌ خطا در ارسال اعلان برندگان به کانال: ${error}\n` +
            `کوئیز پایان یافت اما اعلان ارسال نشد.`
        );
      }
    } catch (error) {
      console.error('Error ending quiz:', error);
      await ctx.reply(`خطا در پایان دادن به کوئیز: ${error}`);
    }
  });

  // Handle /broadcast command - Send message to all users
  bot.command('broadcast', async (ctx: Context) => {
    const user = ctx.from;
    if (!user || !isAdmin(user.id)) {
      await ctx.reply('شما دسترسی به این دستور را ندارید.');
      return;
    }

    // Extract message text (everything after /broadcast)
    const commandText = ctx.message?.text || ctx.message?.caption || '';
    const parts = commandText.split(/\s+/, 2);

    if (parts.length < 2) {
      await ctx.reply(
        'لطفاً پیام خود را بعد از دستور /broadcast بنویسید.\n' +
          'مثال: /broadcast این یک پیام همگانی است.'
      );
      return;
    }

    const broadcastText = parts[1];

    try {
      // Send confirmation
      await ctx.reply('در حال ارسال پیام به تمام کاربران...');

      // Broadcast message
      const result = await broadcastService.broadcastMessage(bot, broadcastText);

      await ctx.reply(
        `✅ ارسال پیام همگانی انجام شد:\n` +
          `موفق: ${result.success}\n` +
          `ناموفق: ${result.failure}\n` +
          `کل: ${result.total}`
      );
      console.log(
        `Broadcast sent by admin ${user.id}: ` +
          `${result.success} successful, ${result.failure} failed`
      );
    } catch (error) {
      console.error('Error broadcasting message:', error);
      await ctx.reply(`خطا در ارسال پیام همگانی: ${error}`);
    }
  });

  // Handle /adminhelp command - Show admin help
  bot.command('adminhelp', async (ctx: Context) => {
    const user = ctx.from;
    if (!user || !isAdmin(user.id)) {
      await ctx.reply('شما دسترسی به این دستور را ندارید.');
      return;
    }

    await ctx.reply(getAdminHelpMessage());
  });
}



