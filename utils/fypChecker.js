function cekFYP({ caption, hashtags }) {
  let score = 0;
  const tips = [];

  if (caption.length > 20) {
    score += 20;
  } else {
    tips.push('Caption terlalu pendek, usahakan minimal 20 karakter.');
  }

  const populer = ['#fyp', '#xyzbca', '#viral', '#tiktok', '#foryou'];
  const cocok = hashtags.filter(tag => populer.includes(tag.toLowerCase()));
  score += cocok.length * 10;
  if (cocok.length === 0) tips.push('Tambahkan hashtag populer seperti #fyp atau #xyzbca.');

  if (caption.toLowerCase().includes('tag') || caption.toLowerCase().includes('komen')) {
    score += 20;
  } else {
    tips.push('Tambahkan ajakan seperti “tag temanmu” atau “komen ya!”.');
  }

  if (score > 100) score = 100;
  return { score, tips };
}

module.exports = { cekFYP };
