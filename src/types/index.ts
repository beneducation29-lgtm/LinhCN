export interface Message {
  id: string;
  role: 'user' | 'assistant';
  chinese: string;
  pinyin?: string;
  vietnamese?: string;
  timestamp: string;
  correction?: {
    hasCorrection: boolean;
    original?: string;
    originalPinyin?: string;
    originalVi?: string;
    suggestion?: string;
    suggestionPinyin?: string;
    suggestionVi?: string;
    explanation?: string;
  };
  vocabulary?: Array<{
    word: string;
    pinyin: string;
    meaningVi: string;
  }>;
  followUp?: {
    chinese: string;
    pinyin: string;
    vietnamese: string;
  };
}

export type TutorState =
  | 'IDLE'
  | 'LISTENING'
  | 'PROCESSING'
  | 'AI_SPEAKING'
  | 'ERROR'
  | 'ENDED';

export interface TopicInfo {
  id: string;
  title: string;
  subtitle: string;
  level: string;
  currentTurn: number;
  totalTurns: number;
}

export interface VocabularyWord {
  chinese: string;
  pinyin: string;
  vietnamese: string;
  partOfSpeech?: string;
  collocation?: string;
  exampleChinese?: string;
  examplePinyin?: string;
  exampleVietnamese?: string;
}
