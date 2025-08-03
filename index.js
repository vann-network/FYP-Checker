require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const { cekFYP } = require("./utils/fypChecker");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.once("ready", () => {
  console.log(`🤖 FYP Checker aktif sebagai ${client.user.tag}`);
});

client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;

  if (msg.content.startsWith("!fypcek")) {
    const input = msg.content.replace("!fypcek", "").trim();

    if (input.includes("tiktok.com")) {
      msg.channel.send("🔗 Analisis link belum tersedia. Kirim caption + hashtag dulu ya!");
      return;
    }

    const words = input.split(" ");
    const hashtags = words.filter(w => w.startsWith("#"));
    const caption = words.filter(w => !w.startsWith("#")).join(" ");

    const result = cekFYP({ caption, hashtags });

    msg.channel.send(
      `📊 Skor kemungkinan FYP: **${result.score}/100**\n\n💡 Tips:\n${result.tips.map(t => `• ${t}`).join("\n")}`
    );
  }
});

client.login(process.env.DISCORD_TOKEN);
