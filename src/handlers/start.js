/**
 * Start command handler
 */

const { getStartCommandMessage } = require('../utils/messages');

function setupStartHandler(bot) {
  bot.command('start', async (ctx) => {
    await ctx.reply(getStartCommandMessage());
  });
}

module.exports = { setupStartHandler };

