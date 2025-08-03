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

const activeUsers = new Map(); // status input user

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
      content: `${mention} ✍️ Kirim caption dan hashtag kamu.\nContoh:\n\`masak indomie #fyp #resep\``,
      allowedMentions: { users: [interaction.user.id] }
    });
  }

  if (interaction.customId === 'linkCheck') {
    activeUsers.set(interaction.user.id, 'link');
    await interaction.reply({
      content: `${mention} 🔗 Kirim link TikTok kamu (pakai blok kode untuk hindari preview):\n\`\`\`\nhttps://www.tiktok.com/@user/video/123...\n\`\`\``,
      allowedMentions: { users: [interaction.user.id] }
    });
  }

  if (interaction.customId === 'info') {
    await interaction.reply({
      content: `📘 **Info Analisa FYP TikTok**\n\nBot ini menilai potensi masuk FYP dengan menganalisis:\n• 📏 Panjang caption\n• 🧠 Ajakan (CTA)\n• 🏷️ Hashtag populer (#fyp, #xyzbca)\n• 🚀 Link TikTok (fitur dalam pengembangan)\n\nKlik tombol di atas untuk mulai proses. Bot akan memandu kamu.`,
      ephemeral: false
    });
  }
});

client.on('messageCreate', async msg => {
  if (msg.author.bot) return;

  const status = activeUsers.get(msg.author.id);

  // ✂️ Auto-format pesan berisi link TikTok (jika tidak sedang dalam sesi)
  if (msg.content.includes('tiktok.com') && !msg.content.includes('`') && !status) {
    try {
      await msg.delete();
      await msg.channel.send({
        content: `📎 Link TikTok dari <@${msg.author.id}>:\n\`\`\`\n${msg.content}\n\`\`\``,
        allowedMentions: { users: [msg.author.id] }
      });
    } catch (err) {
      console.log("❌ Gagal format ulang link:", err.message);
    }
    return;
  }

  // 📄 Jika sedang input caption
  if (status === 'caption') {
    const input = msg.content.trim();
    const words = input.split(" ");
    const hashtags = words.filter(w => w.startsWith("#"));
    const caption = words.filter(w => !w.startsWith("#")).join(" ");
    const result = cekFYP({ caption, hashtags });

    await msg.reply({
      content: `📊 **Analisa untuk <@${msg.author.id}>**\nSkor FYP: **${result.score}/100**\n\n💡 Tips:\n${result.tips.map(t => `• ${t}`).join("\n")}`,
      allowedMentions: { users: [msg.author.id] }
    });

    activeUsers.delete(msg.author.id);
  }

  // 🔗 Jika sedang input link
  if (status === 'link') {
    if (msg.content.includes('tiktok.com')) {
      await msg.reply({
        content: `✅ Link diterima:\n\`\`\`\n${msg.content}\n\`\`\`\n🚧 Fitur analisa link akan datang segera.`
      });
    } else {
      await msg.reply('❗ Kirim link TikTok yang valid ya!');
    }
    activeUsers.delete(msg.author.id);
  }
});

client.login(config.token);
