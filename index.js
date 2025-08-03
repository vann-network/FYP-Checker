const {
  Client,
  GatewayIntentBits,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  Events,
  StringSelectMenuBuilder,
  Collection
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
const userStats = new Collection(); // statistik pemakaian per user

client.once('ready', async () => {
  console.log(`✅ Bot aktif sebagai ${client.user.tag}`);
  const channel = await client.channels.fetch(config.targetChannelId);
  if (!channel) return;

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('captionCheck').setLabel('🔤 Caption + Hashtag').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('genreIdea').setLabel('🎭 Genre Caption').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('info').setLabel('📘 Info Bot').setStyle(ButtonStyle.Success)
  );

  await channel.send({
    content: '**🚀 Selamat datang di FYP Assistant Pro!**\nPilih menu di bawah ini:',
    components: [row]
  });
});

client.on('interactionCreate', async interaction => {
  if (interaction.isButton()) {
    const mention = `<@${interaction.user.id}>`;

    if (interaction.customId === 'captionCheck') {
      activeUsers.set(interaction.user.id, 'caption');
      return interaction.reply({
        content: `${mention} ✍️ Kirim caption dan hashtag kamu.\nContoh:\n\`masak indomie #fyp #resep\``,
        allowedMentions: { users: [interaction.user.id] }
      });
    }

    if (interaction.customId === 'genreIdea') {
      const select = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('select_genre')
          .setPlaceholder('Pilih genre konten kamu...')
          .addOptions([
            { label: 'Makanan', value: 'makanan', emoji: '🍜' },
            { label: 'Fashion', value: 'fashion', emoji: '👗' },
            { label: 'Komedi', value: 'komedi', emoji: '😂' },
            { label: 'Motivasi', value: 'motivasi', emoji: '💪' },
            { label: 'Galau', value: 'galau', emoji: '💔' }
          ])
      );
      return interaction.reply({
        content: '🎭 Pilih genre konten kamu untuk inspirasi caption:',
        components: [select],
        ephemeral: true
      });
    }

    if (interaction.customId === 'info') {
      return interaction.reply({
        content: `📘 **Tentang Bot Ini:**\n\nBot ini membantu menganalisis caption dan hashtag TikTok kamu agar berpotensi masuk FYP dengan lebih optimal.\n\n✨ Fitur:\n• Analisa caption dan hashtag\n• Pilihan genre caption\n• Statistik pemakaian dasar\n• UI modern dengan tombol & dropdown`,
        ephemeral: true
      });
    }
  }

  if (interaction.isStringSelectMenu() && interaction.customId === 'select_genre') {
    const genre = interaction.values[0];
    let response = '📝 Contoh caption: ';

    switch (genre) {
      case 'makanan':
        response += '"Kamu belum sahur kalau belum coba ini 😭 #makanansehat #fyp"'; break;
      case 'fashion':
        response += '"OOTD kamu hari ini gimana? 🔥 #fyp #stylecheck"'; break;
      case 'komedi':
        response += '"Pas disuruh masak tapi malah bakar dapur 😅 #foryou #komedi"'; break;
      case 'motivasi':
        response += '"Terus berjuang walau belum kelihatan hasilnya 💪 #fyp #semangat"'; break;
      case 'galau':
        response += '"Senyumku boleh palsu, tapi rinduku asli 😢 #fyp #galau"'; break;
    }

    return interaction.reply({ content: response, ephemeral: true });
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

    const stats = userStats.get(msg.author.id) || { total: 0 };
    stats.total += 1;
    userStats.set(msg.author.id, stats);

    await msg.reply({
      content: `📊 **Analisa untuk <@${msg.author.id}>**\nSkor FYP: **${result.score}/100**\n\n💡 Tips:\n${result.tips.map(t => `• ${t}`).join("\n")}\n📈 Total analisa kamu: **${stats.total}x**`,
      allowedMentions: { users: [msg.author.id] }
    });

    activeUsers.delete(msg.author.id);
  }
});

client.login(config.token);
