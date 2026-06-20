import { Feedback, Theme } from '@/types/retrospective';
import { extractKeywords } from './keyword-extractor';

export function generateSummary(feedbacks: Feedback[], theme: Theme | null): string {
  if (!feedbacks.length || !theme) return "Belum ada feedback untuk dirangkum.";

  let summary = "Rangkuman masukan dari seluruh tim:\n\n";

  theme.categories.forEach(cat => {
    const catFeedbacks = feedbacks.filter(f => f.categoryId === cat.id);
    if (catFeedbacks.length > 0) {
      summary += `[${cat.name}]\n`;
      catFeedbacks.forEach(f => {
        summary += `- ${f.content}\n`;
        if (f.notes && f.notes.length > 0) {
          f.notes.forEach(n => {
            summary += `  ↳ Diskusi: ${n.text}\n`;
          });
        }
      });
      summary += '\n';
    }
  });

  return summary.trim();
}
