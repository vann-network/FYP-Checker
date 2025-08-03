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
    new ButtonBuilder()
      .setCustomId('captionCheck')
      .setLabel('🔤 Caption + Hashtag')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('linkCheck')
      .setLabel('🔗 Link TikTok')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('info')
      .setLabel('📘 Info FYP')
      .setStyle(ButtonStyle.Success)
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
    await interaction.reply({
      content: `${mention} ✍️ Kirim caption dan hashtag TikTok kamu. Contoh:\n\`\`\`\nmasak indomie #fyp #resep\n\`\`\``,
      allowedMentions: { users: [interaction.user.id] }
    });
  }

  if (interaction.customId === 'linkCheck') {
    await interaction.reply({
      content: `${mention} 🔗 Kirim link video TikTok kamu. Contoh:\n\`\`\`\nhttps://www.tiktok.com/@user/video/123...\n\`\`\``,
      allowedMentions: { users: [interaction.user.id] }
    });
  }

  if (interaction.customId === 'info') {
    await interaction.reply({
      content: `📘 **Info Analisa FYP TikTok**\n\nBot ini membantu mengevaluasi apakah video TikTok kamu berpotensi masuk FYP berdasarkan:\n\n• 📏 Panjang caption\n• 🧠 Adanya ajakan (CTA)\n• 🏷️ Hashtag populer (#fyp, #xyzbca, #viral)\n• ⏱️ Durasi ideal (fitur link video segera hadir)\n\nKamu bisa kirim:\n• Caption dan hashtag\n• Atau link video (jika fitur sudah aktif)\n\nSkor dihitung hingga 100 poin, dan kamu akan dapat saran praktis untuk meningkatkan performa konten kamu.`,
      ephemeral: false
    });
  }
});

client.on('messageCreate', async msg => {
  if (msg.author.bot) return;
  if (!msg.content.startsWith(config.prefix)) return;

  const input = msg.content.slice(config.prefix.length).trim();
  const words = input.split(" ");
  const hashtags = words.filter(w => w.startsWith("#"));
  const caption = words.filter(w => !w.startsWith("#")).join(" ");
  const result = cekFYP({ caption, hashtags });

  await msg.reply({
    content: `📊 **Analisa untuk <@${msg.author.id}>**\nSkor kemungkinan FYP: **${result.score}/100**\n\n💡 Tips:\n${result.tips.map(t => `• ${t}`).join("\n")}`,
    allowedMentions: { users: [msg.author.id] }
  });
});

client.login(config.token);
