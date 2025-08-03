
require('dotenv').config();

module.exports = {
  token: process.env.DISCORD_TOKEN,
  prefix: process.env.PREFIX || '!',
  targetChannelId: process.env.TARGET_CHANNEL_ID
};
