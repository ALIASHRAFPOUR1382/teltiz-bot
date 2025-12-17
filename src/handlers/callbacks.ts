/**
 * Callback query handlers
 */

import { Bot, Context } from 'grammy';
import { UserService } from '../services/userService';
import { getCategoryConfirmationMessage } from '../utils/messages';
import { validateCategory } from '../utils/validators';

const userService = new UserService();

// Category display names mapping
const CATEGORY_NAMES: Record<string, string> = {
  student_6: 'دانش‌آموز پایه ششم',
  student_9: 'دانش‌آموز پایه نهم',
  parent: 'والدین گرامی',
  teacher: 'معلم / مشاور',
};

export function setupCallbackHandlers(bot: Bot) {
  // Handle category selection callback
  bot.callbackQuery(/^category_(.+)$/, async (ctx: Context) => {
    try {
      const callbackData = ctx.callbackQuery?.data;
      if (!callbackData) {
        return;
      }

      // Extract category from callback data
      const category = callbackData.replace('category_', '');

      if (!validateCategory(category)) {
        await ctx.answerCallbackQuery({
          text: 'دسته‌بندی نامعتبر است.',
          show_alert: true,
        });
        return;
      }

      const user = ctx.from;
      if (!user) {
        return;
      }

      // Get or create user
      await userService.getOrCreateUser(
        user.id,
        user.username,
        user.first_name
      );

      // Update user category
      const success = await userService.updateUserCategory(user.id, category);

      if (success) {
        // Get category display name
        const categoryName = CATEGORY_NAMES[category] || category;

        // Send confirmation message with gift
        const confirmationMessage = getCategoryConfirmationMessage(categoryName);
        await ctx.editMessageText(confirmationMessage);
        await ctx.answerCallbackQuery({
          text: 'اطلاعات شما ثبت شد! ✅',
          show_alert: false,
        });
        console.log(`Category ${category} set for user ${user.id}`);
      } else {
        await ctx.answerCallbackQuery({
          text: 'خطا در ثبت اطلاعات. لطفاً دوباره تلاش کنید.',
          show_alert: true,
        });
      }
    } catch (error) {
      console.error('Error handling category selection:', error);
      await ctx.answerCallbackQuery({
        text: 'خطایی رخ داد. لطفاً دوباره تلاش کنید.',
        show_alert: true,
      });
    }
  });
}


