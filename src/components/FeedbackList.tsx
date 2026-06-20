import { Feedback, Theme } from '@/types/retrospective';
import { ScrollArea } from '@/components/ui/scroll-area';
import FeedbackCard from './FeedbackCard';

interface FeedbackListProps {
  feedbacks: Feedback[];
  theme: Theme;
  onAddNote: (feedbackId: string, text: string) => void;
  myName: string;
}

export default function FeedbackList({ feedbacks, theme, onAddNote, myName }: FeedbackListProps) {
  if (feedbacks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-muted-foreground bg-white/50 dark:bg-slate-950/50 rounded-lg border border-dashed border-border/60">
        <div className="w-16 h-16 mb-4 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-2xl">✨</span>
        </div>
        <h3 className="text-lg font-semibold text-foreground">Board masih kosong</h3>
        <p className="text-sm">Jadilah yang pertama memberikan feedback!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-border/40 px-2">
        <h2 className="text-lg font-semibold text-foreground">Team Board</h2>
      </div>
      
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 h-full min-h-[500px]">
        {theme.categories.map((category) => {
          const categoryFeedbacks = feedbacks.filter(f => f.categoryId === category.id);
          
          return (
            <div key={category.id} className="flex flex-col bg-slate-50/50 dark:bg-slate-900/30 rounded-xl overflow-hidden border border-border/30">
              {/* Column Header */}
              <div className="p-3 bg-white/60 dark:bg-slate-950/60 backdrop-blur-md border-b border-border/50 sticky top-0 z-10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{category.icon}</span>
                  <h3 className="font-semibold text-sm text-foreground">{category.name}</h3>
                </div>
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-bold">
                  {categoryFeedbacks.length}
                </span>
              </div>

              {/* Column Body */}
              <ScrollArea className="flex-1 p-3">
                <div className="space-y-3 pb-4">
                  {categoryFeedbacks.length > 0 ? (
                    categoryFeedbacks.map((feedback) => (
                      <FeedbackCard 
                        key={feedback.id} 
                        feedback={feedback} 
                        onAddNote={onAddNote}
                        myName={myName}
                      />
                    ))
                  ) : (
                    <div className="text-center p-4 border border-dashed border-border/40 rounded-lg text-muted-foreground text-xs italic">
                      Belum ada poin
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          );
        })}
      </div>
    </div>
  );
}
