import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { THEMES, ThemeType } from '@/types/retrospective';

interface ThemeSelectorProps {
  onSelect: (themeId: ThemeType) => void;
}

export default function ThemeSelector({ onSelect }: ThemeSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Object.values(THEMES).map((theme) => (
        <Card 
          key={theme.id} 
          className="cursor-pointer hover:border-primary hover:shadow-lg transition-all"
          onClick={() => onSelect(theme.id)}
        >
          <CardHeader>
            <CardTitle className="text-xl text-center text-primary">{theme.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {theme.categories.map(cat => (
                <li key={cat.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="text-xl">{cat.icon}</span>
                  <span>{cat.name}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
