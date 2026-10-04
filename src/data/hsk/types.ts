export type HskLevel =
  | 'HSK 1'
  | 'HSK 2'
  | 'HSK 3'
  | 'HSK 4'
  | 'HSK 5'
  | 'HSK 6';

export type PartOfSpeech =
  | 'noun'
  | 'verb'
  | 'adj'
  | 'adv'
  | 'pron'
  | 'prep'
  | 'conj'
  | 'measure'
  | 'particle'
  | 'phrase';

export type VocabStatus = 'learned' | 'learning' | 'weak' | 'mastered';
export type ResponseLengthType = 'very_short' | 'short' | 'medium' | 'detailed' | 'extended';

export interface VocabItem {
  id: string;
  word: string;
  pinyin: string;
  meaningVi: string;
  partOfSpeech: PartOfSpeech;
  partOfSpeechLabel: string; // e.g. "动词 · Động từ", "名词 · Danh từ"
  hskLevel: HskLevel;
  topic: string;
  topicNameVi: string;
  exampleChinese: string;
  examplePinyin: string;
  exampleVietnamese: string;
  commonCollocations?: string[];
  relatedWords?: string[];
  commonMistakes?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  frequency?: number;
  status?: VocabStatus;
  isFavorite?: boolean;
}

export interface GrammarPattern {
  id: string;
  name: string;
  level: HskLevel;
  pattern: string;
  explanation: string;
  examples: Array<{
    chinese: string;
    pinyin: string;
    vietnamese: string;
  }>;
  commonMistakes?: string[];
}

export interface TopicStep {
  stepNumber: number;
  name: string;
  objective: string;
  samplePromptZh: string;
  samplePromptPinyin: string;
  samplePromptVi: string;
}

export interface TopicQuestion {
  id: string;
  type: 'opening' | 'preference' | 'reason' | 'followup' | 'free';
  chinese: string;
  pinyin: string;
  vietnamese: string;
  step: number;
}

export interface TopicDefinition {
  id: string;
  title: string;
  titleZh: string;
  subtitle: string;
  level: HskLevel;
  description: string;
  steps: TopicStep[];
  keyVocabulary: string[];
  targetGrammar: string[];
  questionPool: TopicQuestion[];
}

export interface HskLevelProfile {
  level: HskLevel;
  title: string;
  badgeLabel: string;
  wordCount: number;
  description: string;
  communicationGoals: string[];
  difficultyProfile: string;
  responseLength: ResponseLengthType;
  recommendedResponseLength: string;
  conversationStyle: string;
  defaultOpeningQuestion: {
    chinese: string;
    pinyin: string;
    vietnamese: string;
  };
  sampleTopicsSummary: string;
}

export interface UserLearningProfile {
  selectedHskLevel: HskLevel;
  currentTopicId: string;
  vocabularyProgress: {
    learned: number;
    learning: number;
    weak: number;
    mastered: number;
  };
  grammarProgress: number;
  speakingSessionsCount: number;
}
