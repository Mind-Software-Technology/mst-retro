import { useState } from 'react';
import { Feedback } from '@/types/retrospective';
import { MessageCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface FeedbackCardProps {
  feedback: Feedback;
  onAddNote: (feedbackId: string, text: string) => void;
  myName: string;
}

export default function FeedbackCard({ feedback, onAddNote, myName }: FeedbackCardProps) {
  const [showNotes, setShowNotes] = useState(false);
  const [noteText, setNoteText] = useState('');

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    onAddNote(feedback.id, noteText);
    setNoteText('');
  };

  return (
    <div className="bg-white dark:bg-slate-950 rounded-xl p-4 shadow-sm border border-border/50 hover:shadow-md transition-shadow group relative">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 dark:bg-slate-900 rounded-full text-slate-600 dark:text-slate-400">
          {feedback.isAnonymous ? 'Anonymous' : feedback.authorName}
        </span>
        <span className="text-[10px] text-muted-foreground">
          {new Date(feedback.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      
      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap mb-4">
        {feedback.content}
      </p>

      <div className="border-t border-border/40 pt-3 mt-3 flex items-center justify-between">
        <button 
          onClick={() => setShowNotes(!showNotes)}
          className="text-xs font-medium text-muted-foreground hover:text-primary flex items-center gap-1.5 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          {feedback.notes?.length || 0} Notes
        </button>
      </div>

      {showNotes && (
        <div className="mt-4 space-y-3 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-border/30">
          {feedback.notes && feedback.notes.length > 0 ? (
            <div className="space-y-3 mb-3">
              {feedback.notes.map((note) => (
                <div key={note.id} className="text-xs space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{note.authorName}</span>
                    <span className="text-[9px] text-muted-foreground">
                      {new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-muted-foreground pl-1 border-l-2 border-primary/20">{note.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center italic mb-2">Belum ada catatan.</p>
          )}

          <form onSubmit={handleAddNote} className="flex gap-2">
            <Input 
              size={1}
              className="h-8 text-xs bg-white dark:bg-black" 
              placeholder="Tambahkan catatan..." 
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
            />
            <Button type="submit" size="sm" className="h-8 px-3 rounded-md" disabled={!noteText.trim() || !myName.trim()}>
              <Send className="w-3 h-3" />
            </Button>
          </form>
          {!myName.trim() && (
             <p className="text-[9px] text-destructive">Isi nama Anda di form sebelah kiri untuk bisa komentar.</p>
          )}
        </div>
      )}
    </div>
  );
}
