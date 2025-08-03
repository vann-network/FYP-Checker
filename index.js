
const {
  Client,
  GatewayIntentBits,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  Events,
  TextChannel
} = require('discord.js');
const config = require('./config');
const { cekFYP } = require('./utils/fypChecker');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.once('ready', async () => {
  console.log(`🤖 Bot aktif sebagai ${client.user.tag}`);

  const channel = await client.channels.fetch(config.targetChannelId);
  if (channel && channel.isTextBased()) {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('captionCheck').setLabel('📄 Caption + Hashtag').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('linkCheck').setLabel('🔗 Link TikTok').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('help').setLabel('ℹ️ Info').setStyle(ButtonStyle.Secondary)
    );

    await channel.send({
      content: '**Pilih analisa yang kamu mau:**',
      components: [row]
    });
  } else {
    console.error('❌ Channel tidak ditemukan atau bukan channel teks.');
  }
});

client.on('messageCreate', async (msg) => {
  if (msg.author.bot) return;
  if (!msg.content.startsWith(config.prefix + 'fypcek')) return;

  const input = msg.content.replace(config.prefix + 'fypcek', '').trim();
  if (!input) return msg.reply('❗ Kirim caption + hashtag setelah perintah.');

  const words = input.split(' ');
  const hashtags = words.filter(w => w.startsWith('#'));
  const caption = words.filter(w => !w.startsWith('#')).join(' ');

  const result = cekFYP({ caption, hashtags });
  msg.reply(
    `📊 Skor kemungkinan FYP: **${result.score}/100**

💡 Tips:
${result.tips.map(t => `• ${t}`).join('\n')}`
  );
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isButton()) return;

  if (interaction.customId === 'captionCheck') {
    await interaction.reply({
      content: '✍️ Kirim caption dan hashtag kamu di bawah.\nContoh:\n`masak indomie #fyp #resep`',
      ephemeral: true
    });
  }

  if (interaction.customId === 'linkCheck') {
    await interaction.reply({
      content: '🔗 Kirim link video TikTok kamu.\nContoh:\n`https://www.tiktok.com/@user/video/...`',
      ephemeral: true
    });
  }

  if (interaction.customId === 'help') {
    await interaction.reply({
      content: 'ℹ️ Bot ini bantu analisis kemungkinan video kamu masuk FYP.\nKirim caption atau link untuk dicek.',
      ephemeral: true
    });
  }
});

client.login(config.token);
