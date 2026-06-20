import { Feedback, Theme } from '@/types/retrospective';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FeedbackListProps {
  feedbacks: Feedback[];
  theme: Theme;
}

export default function FeedbackList({ feedbacks, theme }: FeedbackListProps) {
  if (feedbacks.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[200px] text-muted-foreground bg-slate-50 dark:bg-slate-900 rounded-lg border border-dashed">
        Belum ada feedback. Jadilah yang pertama!
      </div>
    );
  }

  return (
    <ScrollArea className="h-[600px] pr-4">
      <div className="space-y-4">
        {feedbacks.map((f) => (
          <Card key={f.id} className="shadow-sm">
            <CardHeader className="py-3 bg-slate-50 dark:bg-slate-900 border-b">
              <CardTitle className="text-sm font-semibold">
                {f.isAnonymous ? 'Anonymous' : f.authorName}
                <span className="text-xs text-muted-foreground ml-2 font-normal">
                  {new Date(f.timestamp).toLocaleTimeString()}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="py-3 space-y-3">
              {f.category1 && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                    {theme.categories[0].icon} {theme.categories[0].name}
                  </h4>
                  <p className="text-sm whitespace-pre-wrap">{f.category1}</p>
                </div>
              )}
              {f.category2 && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                    {theme.categories[1].icon} {theme.categories[1].name}
                  </h4>
                  <p className="text-sm whitespace-pre-wrap">{f.category2}</p>
                </div>
              )}
              {f.category3 && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                    {theme.categories[2].icon} {theme.categories[2].name}
                  </h4>
                  <p className="text-sm whitespace-pre-wrap">{f.category3}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
