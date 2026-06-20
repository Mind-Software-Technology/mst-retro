import { Feedback, Theme } from '@/types/retrospective';
import { extractKeywords } from './keyword-extractor';

export function generateActionItems(feedbacks: Feedback[], theme: Theme | null): string[] {
  if (!feedbacks.length || !theme) return [];

  // Kita fokus pada kategori 3 (Improvement/Destination/Continue) dan kategori 2 (Didn't go well/Sad/Stop)
  const improvementTexts = feedbacks.map(f => f.category3).filter(t => t.trim().length > 0);
  const negativeTexts = feedbacks.map(f => f.category2).filter(t => t.trim().length > 0);

  const actionKeywords = extractKeywords([...improvementTexts, ...negativeTexts]);
  
  const actionItems: string[] = [];

  // Jika tidak ada teks yang memadai
  if (actionKeywords.length === 0) {
    return ["Diskusikan lebih lanjut untuk menentukan action items konkrit."];
  }

  // Buat action items dari keyword paling sering muncul
  const topKeywords = actionKeywords.slice(0, 5);

  const actionVerbs = ['Tingkatkan', 'Perbaiki', 'Fokus pada', 'Evaluasi kembali', 'Implementasikan'];
  
  topKeywords.forEach((kw, index) => {
    const verb = actionVerbs[index % actionVerbs.length];
    actionItems.push(`${verb} proses yang berkaitan dengan "${kw.word}"`);
  });

  return actionItems;
}
