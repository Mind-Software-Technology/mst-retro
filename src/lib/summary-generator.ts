import { Feedback, Theme } from '@/types/retrospective';
import { extractKeywords } from './keyword-extractor';

export function generateSummary(feedbacks: Feedback[], theme: Theme | null): string {
  if (!feedbacks.length || !theme) return "Belum ada feedback untuk disimpulkan.";

  const cat1Texts = feedbacks.map(f => f.category1).filter(t => t.trim().length > 0);
  const cat2Texts = feedbacks.map(f => f.category2).filter(t => t.trim().length > 0);
  const cat3Texts = feedbacks.map(f => f.category3).filter(t => t.trim().length > 0);

  const cat1Keywords = extractKeywords(cat1Texts).slice(0, 2).map(k => k.word);
  const cat2Keywords = extractKeywords(cat2Texts).slice(0, 2).map(k => k.word);
  const cat3Keywords = extractKeywords(cat3Texts).slice(0, 2).map(k => k.word);

  let summary = `Secara keseluruhan, tim telah memberikan ${feedbacks.length} feedback. `;

  if (cat1Keywords.length > 0) {
    summary += `Hal-hal positif yang menonjol berkaitan dengan ${cat1Keywords.join(' dan ')}. `;
  }

  if (cat2Keywords.length > 0) {
    summary += `Namun, ada beberapa hal yang perlu diperhatikan terkait ${cat2Keywords.join(' dan ')}. `;
  }

  if (cat3Keywords.length > 0) {
    summary += `Sebagai langkah ke depan, tim menyarankan perbaikan pada area ${cat3Keywords.join(' dan ')}.`;
  }

  if (cat1Keywords.length === 0 && cat2Keywords.length === 0 && cat3Keywords.length === 0) {
    summary = "Tim telah berpartisipasi, namun umpan balik terlalu singkat untuk dianalisis polanya secara mendalam. Komunikasi langsung mungkin lebih baik untuk menggali detail.";
  }

  return summary;
}
