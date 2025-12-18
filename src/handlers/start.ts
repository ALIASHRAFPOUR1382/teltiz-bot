/**
 * Start command handler
 */

import { Bot, Context } from 'grammy';
import { getStartCommandMessage } from '../utils/messages';

export function setupStartHandler(bot: Bot) {
  bot.command('start', async (ctx: Context) => {
    await ctx.reply(getStartCommandMessage());
  });
}



