import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MessageSquare, TrendingUp } from 'lucide-react';

interface StatisticsCardProps {
  totalFeedback: number;
  totalParticipants: number;
  topTopics: string[];
}

export default function StatisticsCard({ totalFeedback, totalParticipants, topTopics }: StatisticsCardProps) {
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Statistics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border flex flex-col items-center justify-center text-center">
            <Users className="w-6 h-6 text-primary mb-1" />
            <span className="text-2xl font-bold">{totalParticipants}</span>
            <span className="text-xs text-muted-foreground">Participants</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border flex flex-col items-center justify-center text-center">
            <MessageSquare className="w-6 h-6 text-secondary mb-1" />
            <span className="text-2xl font-bold">{totalFeedback}</span>
            <span className="text-xs text-muted-foreground">Feedback Items</span>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-2">Top Topics:</h4>
          {topTopics.length === 0 ? (
            <p className="text-xs text-muted-foreground">Belum ada topik.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {topTopics.map((topic, idx) => (
                <span key={idx} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium">
                  {topic}
                </span>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
