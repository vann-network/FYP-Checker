const {
  Client,
  GatewayIntentBits,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  Events
} = require('discord.js');
const config = require('./config');
const { cekFYP } = require('./utils/fypChecker');

// Simpan status user (apakah sedang input caption atau link)
const activeUsers = new Map();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once('ready', async () => {
  console.log(`🤖 Bot aktif sebagai ${client.user.tag}`);

  const channel = await client.channels.fetch(config.targetChannelId);
  if (!channel) return console.log("❌ Channel tidak ditemukan.");

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('captionCheck').setLabel('🔤 Caption + Hashtag').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('linkCheck').setLabel('🔗 Link TikTok').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('info').setLabel('📘 Info FYP').setStyle(ButtonStyle.Success)
  );

  await channel.send({
    content: '**📊 Pilih tipe analisa FYP yang kamu mau:**',
    components: [row]
  });
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;

  const mention = `<@${interaction.user.id}>`;

  if (interaction.customId === 'captionCheck') {
    activeUsers.set(interaction.user.id, 'caption');
    await interaction.reply({
      content: `${mention} ✍️ Kirim caption dan hashtag kamu sekarang.\nContoh:\n\`masak sarden #fyp #resep\``,
      allowedMentions: { users: [interaction.user.id] }
    });
  }

  if (interaction.customId === 'linkCheck') {
    activeUsers.set(interaction.user.id, 'link');
    await interaction.reply({
      content: `${mention} 🔗 Kirim link video TikTok kamu sekarang.\nContoh:\n\`https://www.tiktok.com/@user/video/123...\``,
      allowedMentions: { users: [interaction.user.id] }
    });
  }

  if (interaction.customId === 'info') {
    await interaction.reply({
      content: `📘 **Info Analisa FYP TikTok**\n\nBot ini mengevaluasi apakah video kamu berpotensi masuk FYP berdasarkan:\n• 📏 Panjang caption\n• 🧠 Ajakan (CTA)\n• 🏷️ Hashtag populer\n• ⏱️ Durasi ideal\n\nKamu bisa kirim:\n• Caption dan hashtag\n• Atau link video (fitur segera hadir).`,
      ephemeral: false
    });
  }
});

client.on('messageCreate', async msg => {
  if (msg.author.bot) return;
  const status = activeUsers.get(msg.author.id);

  if (status === 'caption') {
    const input = msg.content.trim();
    const words = input.split(" ");
    const hashtags = words.filter(w => w.startsWith("#"));
    const caption = words.filter(w => !w.startsWith("#")).join(" ");
    const result = cekFYP({ caption, hashtags });

    await msg.reply({
      content: `📊 **Analisa untuk <@${msg.author.id}>**\nSkor kemungkinan FYP: **${result.score}/100**\n\n💡 Tips:\n${result.tips.map(t => `• ${t}`).join("\n")}`,
      allowedMentions: { users: [msg.author.id] }
    });

    activeUsers.delete(msg.author.id);
  }

  if (status === 'link') {
    if (msg.content.includes('tiktok.com')) {
      await msg.reply({
        content: `✅ Link diterima: ${msg.content}\n🚧 Fitur analisa link video masih dalam pengembangan.\nGunakan *caption + hashtag* untuk analisa aktif.`
      });
    } else {
      await msg.reply('❗ Kirim link TikTok yang valid ya!');
    }
    activeUsers.delete(msg.author.id);
  }
});

client.login(config.token);
