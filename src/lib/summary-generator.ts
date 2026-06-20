import { Feedback, Theme } from '@/types/retrospective';
import { extractKeywords } from './keyword-extractor';

export function generateSummary(feedbacks: Feedback[], theme: Theme | null): string {
  if (!feedbacks.length || !theme) return "Belum ada feedback untuk disimpulkan.";

  const total = feedbacks.length;
  
  const categoryCounts = theme.categories.map(cat => {
    return {
      catName: cat.name,
      count: feedbacks.filter(f => f.categoryId === cat.id).length
    };
  });
  
  categoryCounts.sort((a, b) => b.count - a.count);
  const mostActiveCat = categoryCounts[0];

  let summary = `Tim telah mengumpulkan total ${total} poin feedback. Kriteria yang paling banyak disorot pada sesi ini adalah "${mostActiveCat.catName}" dengan ${mostActiveCat.count} masukan.\n\n`;

  const allTexts = feedbacks.map(f => f.content);
  feedbacks.forEach(f => {
    if (f.notes) allTexts.push(...f.notes.map(n => n.text));
  });
  
  const keywords = extractKeywords(allTexts).slice(0, 4).map(k => k.word);
  
  if (keywords.length > 0) {
    summary += `Topik atau kata kunci yang paling sering dibahas meliputi: ${keywords.map(k => `"${k}"`).join(', ')}. `;
    summary += `Sangat disarankan untuk mendiskusikan area ini lebih dalam.`;
  } else {
    summary += `Teks yang diberikan terlalu pendek untuk diekstrak polanya. Lakukan diskusi secara langsung untuk menggali konteks lebih lanjut.`;
  }

  return summary;
}
