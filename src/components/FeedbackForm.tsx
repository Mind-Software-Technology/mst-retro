import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Theme, Feedback } from '@/types/retrospective';

interface FeedbackFormProps {
  theme: Theme;
  onAddFeedback: (feedback: Omit<Feedback, 'id' | 'timestamp'>) => void;
}

export default function FeedbackForm({ theme, onAddFeedback }: FeedbackFormProps) {
  const [name, setName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [cat1, setCat1] = useState('');
  const [cat2, setCat2] = useState('');
  const [cat3, setCat3] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAnonymous && !name.trim()) {
      alert("Silakan isi nama atau pilih Anonymous");
      return;
    }
    
    onAddFeedback({
      authorName: name,
      isAnonymous,
      category1: cat1,
      category2: cat2,
      category3: cat3,
    });

    // Reset fields except name/anonymous so others can type or same person adds more
    setCat1('');
    setCat2('');
    setCat3('');
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Add Feedback</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Participant Name</label>
            <div className="flex items-center gap-4">
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Your Name" 
                disabled={isAnonymous}
                className="flex-1"
              />
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="anonymous" 
                  checked={isAnonymous}
                  onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
                />
                <label htmlFor="anonymous" className="text-sm font-medium leading-none cursor-pointer">
                  Anonymous
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              {theme.categories[0].icon} {theme.categories[0].name}
            </label>
            <Textarea 
              value={cat1} 
              onChange={(e) => setCat1(e.target.value)} 
              placeholder={`Enter ${theme.categories[0].name}...`}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              {theme.categories[1].icon} {theme.categories[1].name}
            </label>
            <Textarea 
              value={cat2} 
              onChange={(e) => setCat2(e.target.value)} 
              placeholder={`Enter ${theme.categories[1].name}...`}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              {theme.categories[2].icon} {theme.categories[2].name}
            </label>
            <Textarea 
              value={cat3} 
              onChange={(e) => setCat3(e.target.value)} 
              placeholder={`Enter ${theme.categories[2].name}...`}
            />
          </div>

          <Button type="submit" className="w-full">Add Feedback</Button>
        </form>
      </CardContent>
    </Card>
  );
}
