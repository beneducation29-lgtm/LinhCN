import { HskLevel, HskLevelProfile, TopicDefinition, VocabItem, GrammarPattern, VocabStatus } from './types';
import { hsk1Profile, hsk1Vocab, hsk1Grammar, hsk1Topics } from './hsk1';
import { hsk2Profile, hsk2Vocab, hsk2Grammar, hsk2Topics } from './hsk2';
import { hsk3Profile, hsk3Vocab, hsk3Grammar, hsk3Topics } from './hsk3';
import {
  hsk4Profile,
  hsk4Vocab,
  hsk4Grammar,
  hsk4Topics,
  hsk5Profile,
  hsk5Vocab,
  hsk5Grammar,
  hsk5Topics,
  hsk6Profile,
  hsk6Vocab,
  hsk6Grammar,
  hsk6Topics,
} from './hsk4to6';

export * from './types';
export * from './hsk1';
export * from './hsk2';
export * from './hsk3';
export * from './hsk4to6';

export function getHskProfile(level: HskLevel): HskLevelProfile {
  switch (level) {
    case 'HSK 1':
      return hsk1Profile;
    case 'HSK 2':
      return hsk2Profile;
    case 'HSK 3':
      return hsk3Profile;
    case 'HSK 4':
      return hsk4Profile;
    case 'HSK 5':
      return hsk5Profile;
    case 'HSK 6':
      return hsk6Profile;
    default:
      return hsk1Profile;
  }
}

export function getAllTopicsForLevel(level: HskLevel): TopicDefinition[] {
  switch (level) {
    case 'HSK 1':
      return hsk1Topics;
    case 'HSK 2':
      return hsk2Topics;
    case 'HSK 3':
      return hsk3Topics;
    case 'HSK 4':
      return hsk4Topics;
    case 'HSK 5':
      return hsk5Topics;
    case 'HSK 6':
      return hsk6Topics;
    default:
      return hsk1Topics;
  }
}

export function getTopic(level: HskLevel, topicId?: string): TopicDefinition {
  const topics = getAllTopicsForLevel(level);
  if (!topicId) return topics[0];
  return topics.find((t) => t.id === topicId) || topics[0];
}

export function getAllVocabulary(): VocabItem[] {
  return [
    ...hsk1Vocab,
    ...hsk2Vocab,
    ...hsk3Vocab,
    ...hsk4Vocab,
    ...hsk5Vocab,
    ...hsk6Vocab,
  ];
}

export function getRelevantVocab(level: HskLevel, topicId?: string): VocabItem[] {
  let pool: VocabItem[] = [];
  switch (level) {
    case 'HSK 1':
      pool = hsk1Vocab;
      break;
    case 'HSK 2':
      pool = hsk2Vocab;
      break;
    case 'HSK 3':
      pool = hsk3Vocab;
      break;
    case 'HSK 4':
      pool = hsk4Vocab;
      break;
    case 'HSK 5':
      pool = hsk5Vocab;
      break;
    case 'HSK 6':
      pool = hsk6Vocab;
      break;
    default:
      pool = hsk1Vocab;
  }

  if (topicId) {
    const matched = pool.filter((v) => v.topic === topicId);
    return matched.length ? matched : pool;
  }
  return pool;
}

export function getRelevantGrammar(level: HskLevel): GrammarPattern[] {
  switch (level) {
    case 'HSK 1':
      return hsk1Grammar;
    case 'HSK 2':
      return hsk2Grammar;
    case 'HSK 3':
      return hsk3Grammar;
    case 'HSK 4':
      return hsk4Grammar;
    case 'HSK 5':
      return hsk5Grammar;
    case 'HSK 6':
      return hsk6Grammar;
    default:
      return hsk1Grammar;
  }
}

// Strip diacritics / tones for fuzzy search
function normalizePinyin(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '');
}

export function searchVocabulary(
  query: string,
  level?: HskLevel | 'all',
  topic?: string,
  status?: VocabStatus | 'favorite' | 'all'
): VocabItem[] {
  let list = getAllVocabulary();

  if (level && level !== 'all') {
    list = list.filter((v) => v.hskLevel === level);
  }

  if (topic && topic !== 'all') {
    list = list.filter((v) => v.topic === topic);
  }

  if (status && status !== 'all') {
    if (status === 'favorite') {
      list = list.filter((v) => v.isFavorite);
    } else {
      list = list.filter((v) => v.status === status);
    }
  }

  if (!query || !query.trim()) return list;

  const qTrim = query.trim().toLowerCase();
  const qNorm = normalizePinyin(qTrim);

  return list.filter((item) => {
    return (
      item.word.includes(qTrim) ||
      normalizePinyin(item.pinyin).includes(qNorm) ||
      item.meaningVi.toLowerCase().includes(qTrim) ||
      item.topicNameVi.toLowerCase().includes(qTrim)
    );
  });
}

/**
 * Returns dynamic, level-adapted knowledge context for Gemini API prompts
 * Strictly adapts response length, tone, vocabulary complexity and conversation goals per HSK level!
 */
export function getKnowledgeContextForPrompt(
  level: HskLevel,
  topicId: string,
  currentStep: number
): string {
  const profile = getHskProfile(level);
  const topic = getTopic(level, topicId);
  const step = topic.steps.find((s) => s.stepNumber === currentStep) || topic.steps[0];
  const vocabList = topic.keyVocabulary.slice(0, 6).join(', ');
  const grammarList = getRelevantGrammar(level).slice(0, 3).map((g) => g.name).join('; ');

  return `HSK_KNOWLEDGE_PROFILE:
- Level: ${level} (${profile.title})
- Topic: ${topic.title} (${topic.titleZh})
- Current Step [${currentStep}/5]: ${step.name} - Objective: ${step.objective}
- Recommended Response Length: ${profile.recommendedResponseLength}
- Conversation Style: ${profile.conversationStyle}
- Key Target Vocabulary: ${vocabList}
- Key Grammar Patterns: ${grammarList}
- 3-LAYER LANGUAGE RULE: Every response MUST strictly have [CHINESE], [PINYIN] (with standard tone marks), and natural [VIETNAMESE].`;
}
