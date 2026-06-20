const stopWords = new Set([
  'dan', 'atau', 'tapi', 'yang', 'di', 'ke', 'dari', 'untuk', 'pada', 'dalam', 'dengan', 'itu',
  'ini', 'adalah', 'juga', 'tidak', 'ada', 'bisa', 'akan', 'lebih', 'sudah', 'saya', 'kita',
  'kami', 'mereka', 'dia', 'kamu', 'karena', 'seperti', 'oleh', 'sangat', 'buat', 'terus',
  'jadi', 'kalau', 'saat', 'hal', 'banyak', 'beberapa', 'masih', 'hanya', 'saja', 'lagi',
  'bikin', 'harus', 'semua', 'udah', 'belum', 'biar', 'kalau', 'untuk', 'agar', 'supaya',
  'and', 'or', 'but', 'the', 'a', 'an', 'in', 'to', 'for', 'of', 'on', 'with', 'it', 'this',
  'that', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did',
  'not', 'can', 'could', 'will', 'would', 'should', 'we', 'they', 'he', 'she', 'you', 'i',
  'as', 'at', 'by', 'from', 'about', 'more', 'some', 'any', 'all', 'so', 'if', 'then', 'than'
]);

export function extractKeywords(texts: string[]): Array<{word: string, count: number}> {
  const wordCounts: Record<string, number> = {};

  texts.forEach(text => {
    // Convert to lowercase, remove punctuation
    const cleanText = text.toLowerCase().replace(/[^\w\s]/g, '');
    const words = cleanText.split(/\s+/);

    words.forEach(word => {
      if (word.length > 2 && !stopWords.has(word)) {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      }
    });
  });

  return Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([word, count]) => ({ word, count }));
}
