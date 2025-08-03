function cekFYP({ caption, hashtags }) {
  let score = 0;
  const tips = [];

  if (caption.length > 20) {
    score += 20;
  } else {
    tips.push('Caption terlalu pendek. Tambahkan kalimat yang menjelaskan isi video.');
  }

  const populer = ['#fyp', '#xyzbca', '#viral', '#tiktok', '#foryou'];
  const cocok = hashtags.filter(tag => populer.includes(tag.toLowerCase()));
  score += cocok.length * 10;
  if (cocok.length === 0) tips.push('Gunakan hashtag populer seperti #fyp, #xyzbca, dll.');

  if (caption.toLowerCase().includes('tag') || caption.toLowerCase().includes('komen')) {
    score += 20;
  } else {
    tips.push('Tambahkan CTA seperti “tag temanmu” atau “komen sekarang!”.');
  }

  if (score > 100) score = 100;
  return { score, tips };
}

module.exports = { cekFYP };
