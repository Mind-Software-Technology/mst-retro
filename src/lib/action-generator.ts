import { Feedback, Theme } from '@/types/retrospective';
import { extractKeywords } from './keyword-extractor';

export function generateActionItems(feedbacks: Feedback[], theme: Theme | null): string[] {
  if (!feedbacks.length || !theme) return [];

  const improvementCategory = theme.categories[2];
  
  const improvementTexts = feedbacks
    .filter(f => f.categoryId === improvementCategory.id)
    .map(f => f.content);
    
  feedbacks.forEach(f => {
    if (f.notes) {
      improvementTexts.push(...f.notes.map(n => n.text));
    }
  });

  const keywords = extractKeywords(improvementTexts).slice(0, 4);
  
  if (keywords.length === 0) return ["Diskusikan lebih lanjut untuk menentukan action items konkrit."];

  const actionVerbs = ["Tingkatkan", "Perbaiki", "Evaluasi kembali", "Lanjutkan"];
  
  return keywords.map((kw, index) => {
    const verb = actionVerbs[index % actionVerbs.length];
    return `${verb} proses atau diskusi terkait "${kw.word}" untuk sprint berikutnya.`;
  });
}
