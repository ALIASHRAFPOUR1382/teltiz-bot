/**
 * Welcome handler for new channel members
 */

import { Bot, Context } from 'grammy';
import { DatabaseManager } from '../database/dbManager';
import { getWelcomeMessage } from '../utils/messages';
import { getCategorySelectionKeyboard } from '../keyboards/inline';

const dbManager = new DatabaseManager();

export function setupWelcomeHandler(bot: Bot) {
  // Handle new member joining the channel
  bot.on('chat_member', async (ctx: Context) => {
    try {
      const update = ctx.update.chat_member;
      if (!update) {
        return;
      }

      const newMember = update.new_chat_member.user;
      const oldStatus = update.old_chat_member.status;
      const newStatus = update.new_chat_member.status;

      // Skip if the new member is the bot itself
      if (newMember.is_bot) {
        return;
      }

      // Check if user just joined (was not a member before, now is a member)
      if (oldStatus !== 'member' && newStatus === 'member') {
        // Create or update user in database
        await dbManager.createUser(
          newMember.id,
          newMember.username,
          newMember.first_name
        );

        // Send welcome message with category selection
        const welcomeText = getWelcomeMessage();
        const keyboard = getCategorySelectionKeyboard();

        // Try to send private message to user
        try {
          await bot.api.sendMessage({
            chat_id: newMember.id,
            text: welcomeText,
            reply_markup: keyboard,
          });
          console.log(`Welcome message sent to user ${newMember.id}`);
        } catch (error) {
          console.warn(`Could not send private message to user ${newMember.id}:`, error);
          // If private message fails, we'll handle it via callback when user interacts with bot
        }
      }
    } catch (error) {
      console.error('Error handling new member:', error);
    }
  });
}

