export type ThemeType = 'Professional' | 'Simple' | 'Sailboat' | 'StartStopContinue';

export interface Category {
  id: string;
  name: string;
  icon?: string;
}

export interface Theme {
  id: ThemeType;
  name: string;
  categories: Category[];
}

export const THEMES: Record<ThemeType, Theme> = {
  Professional: {
    id: 'Professional',
    name: 'Professional',
    categories: [
      { id: 'wentWell', name: 'What Went Well', icon: '✅' },
      { id: 'didNotGoWell', name: "What Didn't Go Well", icon: '⚠️' },
      { id: 'improvementIdeas', name: 'Improvement Ideas', icon: '🚀' },
    ],
  },
  Simple: {
    id: 'Simple',
    name: 'Simple',
    categories: [
      { id: 'happy', name: 'Happy', icon: '😊' },
      { id: 'sad', name: 'Sad', icon: '😕' },
      { id: 'idea', name: 'Idea', icon: '💡' },
    ],
  },
  Sailboat: {
    id: 'Sailboat',
    name: 'Sailboat',
    categories: [
      { id: 'wind', name: 'Wind (Helps us move)', icon: '⛵' },
      { id: 'anchor', name: 'Anchor (Holds us back)', icon: '⚓' },
      { id: 'destination', name: 'Destination (Goal)', icon: '🏝️' },
    ],
  },
  StartStopContinue: {
    id: 'StartStopContinue',
    name: 'Start Stop Continue',
    categories: [
      { id: 'start', name: 'Start', icon: '▶️' },
      { id: 'stop', name: 'Stop', icon: '⏹️' },
      { id: 'continue', name: 'Continue', icon: '🔄' },
    ],
  },
};

export interface Feedback {
  id: string;
  authorName: string;
  isAnonymous: boolean;
  category1: string; // E.g., What went well
  category2: string; // E.g., What didn't go well
  category3: string; // E.g., Improvement Ideas
  timestamp: number;
}

export interface RetrospectiveSession {
  teamName: string;
  sprintName: string;
  date: string;
  theme: ThemeType | null;
  feedbacks: Feedback[];
}
