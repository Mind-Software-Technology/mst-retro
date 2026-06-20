import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Theme, Feedback } from '@/types/retrospective';
import { cn } from '@/lib/utils';
import { Send } from 'lucide-react';

interface FeedbackFormProps {
  theme: Theme;
  onAddFeedback: (feedback: Omit<Feedback, 'id' | 'timestamp' | 'notes'>) => void;
  myName: string;
  setMyName: (name: string) => void;
  isAnonymous: boolean;
  setIsAnonymous: (val: boolean) => void;
}

export default function FeedbackForm({ 
  theme, 
  onAddFeedback,
  myName,
  setMyName,
  isAnonymous,
  setIsAnonymous
}: FeedbackFormProps) {
  const [activeCategory, setActiveCategory] = useState<string>(theme.categories[0].id);
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAnonymous && !myName.trim()) {
      alert("Silakan isi nama atau pilih Anonymous");
      return;
    }
    if (!content.trim()) {
      return;
    }
    
    onAddFeedback({
      authorName: myName,
      isAnonymous,
      categoryId: activeCategory,
      content,
    });

    setContent('');
  };

  return (
    <Card className="shadow-lg border-primary/10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl">
      <CardHeader className="pb-3 border-b border-border/50">
        <CardTitle className="text-lg font-semibold flex items-center justify-between">
          <span>Tambahkan Feedback</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-5">
        
        {/* Name Input Area */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Identitas Anda</label>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input 
              value={myName} 
              onChange={(e) => setMyName(e.target.value)} 
              placeholder="Ketik nama Anda..." 
              disabled={isAnonymous}
              className="flex-1 transition-all focus:ring-2 focus:ring-primary/20 bg-background"
            />
            <label className="flex items-center space-x-2 cursor-pointer group bg-muted/50 px-3 py-2 rounded-md hover:bg-muted transition-colors border">
              <Checkbox 
                id="anonymous" 
                checked={isAnonymous}
                onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
              />
              <span className="text-sm font-medium leading-none group-hover:text-primary transition-colors">
                Anonymous
              </span>
            </label>
          </div>
        </div>

        {/* Category Selector Tabs */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pilih Kriteria</label>
          <div className="grid grid-cols-3 gap-2 p-1 bg-muted/40 rounded-lg">
            {theme.categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 p-2 rounded-md text-xs font-medium transition-all duration-200",
                  activeCategory === cat.id 
                    ? "bg-white dark:bg-slate-800 shadow-sm text-primary ring-1 ring-border" 
                    : "text-muted-foreground hover:bg-white/50 dark:hover:bg-slate-800/50 hover:text-foreground"
                )}
              >
                <span className="text-lg">{cat.icon}</span>
                <span className="text-center leading-tight line-clamp-1">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Input Area */}
        <form onSubmit={handleSubmit} className="space-y-3 relative group">
          <Textarea 
            value={content} 
            onChange={(e) => setContent(e.target.value)} 
            placeholder={`Tulis sesuatu untuk kategori ini...`}
            className="min-h-[120px] resize-none transition-all focus:ring-2 focus:ring-primary/20 bg-background pb-12"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <div className="absolute bottom-2 right-2 flex items-center gap-2">
             <span className="text-[10px] text-muted-foreground hidden sm:inline-block opacity-0 group-hover:opacity-100 transition-opacity">
               Tekan Enter untuk kirim
             </span>
             <Button 
                type="submit" 
                size="sm" 
                className="rounded-full px-4 font-semibold shadow-md hover:shadow-lg transition-all"
                disabled={!content.trim()}
             >
               Kirim <Send className="w-3 h-3 ml-2" />
             </Button>
          </div>
        </form>

      </CardContent>
    </Card>
  );
}
