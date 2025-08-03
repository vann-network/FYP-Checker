function cekFYP({ caption = "", hashtags = [], duration = null }) {
  let score = 0;
  let tips = [];

  if (caption.length >= 20) {
    score += 20;
  } else {
    tips.push("💬 Perpanjang captionmu, minimal 20 karakter.");
  }

  if (/komen|like|tag|share|follow/i.test(caption)) {
    score += 20;
  } else {
    tips.push("🗣️ Tambahkan ajakan, seperti 'tag temanmu' atau 'komen ya!'");
  }

  const fypTags = ["fyp", "xyzbca", "tiktok", "viral"];
  const found = hashtags.filter(tag => fypTags.includes(tag.toLowerCase()));
  score += Math.min(found.length * 10, 30);
  if (found.length === 0) tips.push("🏷️ Tambahkan hashtag #fyp atau #xyzbca.");

  if (duration !== null) {
    if (duration >= 8 && duration <= 20) {
      score += 30;
    } else if (duration > 60) {
      tips.push("⏱️ Potong durasi videomu. Idealnya 9–15 detik.");
    }
  }

  return {
    score: Math.min(score, 100),
    tips
  };
}

module.exports = { cekFYP };
