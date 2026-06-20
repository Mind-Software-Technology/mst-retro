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

export interface Note {
  id: string;
  authorName: string;
  text: string;
  timestamp: number;
}

export interface Feedback {
  id: string;
  authorName: string;
  isAnonymous: boolean;
  categoryId: string; // The ID of the category this feedback belongs to
  content: string;    // The actual feedback text
  notes: Note[];      // Discussion notes
  timestamp: number;
}

export interface Participant {
  id: string;      // PeerJS ID
  name: string;    // User chosen name
  isHost: boolean;
}

export interface RetrospectiveSession {
  teamName: string;
  sprintName: string;
  date: string;
  theme: ThemeType | null;
  feedbacks: Feedback[];
  participants?: Participant[];
}
