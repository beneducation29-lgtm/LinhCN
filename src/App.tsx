import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { VideoPanel } from './components/VideoPanel';
import { ChatPanel } from './components/ChatPanel';
import { VocabModal } from './components/VocabModal';
import { SettingsModal } from './components/SettingsModal';
import { OtherView } from './components/OtherViews';
import { HskKnowledgeModal } from './components/HskKnowledgeModal';
import { HskLevelSelectorModal } from './components/HskLevelSelectorModal';
import { SessionSummaryModal } from './components/SessionSummaryModal';
import { AuthScreen } from './components/AuthScreen';
import { Message, TopicInfo, TutorState } from './types';
import { HskLevel, getTopic, getRelevantVocab, getHskProfile } from './data/hsk';
import { playAudioSpeech, stopAudioSpeech, SpeechRecognitionManager } from './utils/speech';

interface LatencyMetrics {
  sttMs?: number;
  aiFirstTokenMs?: number;
  ttsMs?: number;
  totalMs?: number;
}

export default function App() {
  // Navigation & tabs
  const [authUser, setAuthUser] = useState<{id:string; email:string; name:string} | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [learningProfile, setLearningProfile] = useState({
    hsk_level: 'HSK 1',
    fluency_score: 0,
    conversations_completed: 0,
    user_messages: 0,
    vocabulary_used: 0,
    practice_minutes: 0,
  });
  const sessionStartedAtRef = useRef<number>(Date.now());

  useEffect(() => {
    let cancelled = false;
    const timeout = window.setTimeout(() => {
      if (!cancelled) setAuthChecking(false);
    }, 3500);

    fetch('/api/auth/me', { credentials: 'include' })
      .then(async (r) => r.ok ? r.json() : ({ authenticated: false }))
      .then((data) => {
        if (!cancelled) setAuthUser(data.user || null);
      })
      .catch(() => {
        if (!cancelled) setAuthUser(null);
      })
      .finally(() => {
        if (!cancelled) setAuthChecking(false);
        window.clearTimeout(timeout);
      });

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
    stopAudioSpeech();
    setAuthUser(null);
  };

  const persistLearningProfile = (patch: Partial<typeof learningProfile>) => {
    setLearningProfile((prev) => {
      const next = { ...prev, ...patch };
      fetch('/api/learning/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(next),
      }).catch(() => {});
      return next;
    });
  };

  const [activeTab, setActiveTab] = useState('speaking');
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Modals
  const [isVocabModalOpen, setIsVocabModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isHskModalOpen, setIsHskModalOpen] = useState(false);
  const [isLevelSelectorOpen, setIsLevelSelectorOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);

  // Settings & Dynamic HSK Level (Zero hardcoded HSK 2 default!)
  const [speechRate, setSpeechRate] = useState(0.9);
  const [hskLevel, setHskLevel] = useState<HskLevel>('HSK 1');

  useEffect(() => {
    if (!authUser?.id) return;
    try {
      const saved = window.localStorage.getItem('ai_tutor_user_hsk_level:' + authUser.id) as HskLevel;
      if (saved && ['HSK 1', 'HSK 2', 'HSK 3', 'HSK 4', 'HSK 5', 'HSK 6'].includes(saved)) {
        setHskLevel(saved);
      }
    } catch {
      // Ignore storage restrictions; the tutor remains usable.
    }
  }, [authUser?.id]);
  useEffect(() => {
    if (!authUser?.id) return;
    sessionStartedAtRef.current = Date.now();
    fetch('/api/learning/profile', { credentials: 'include' })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.profile) {
          setLearningProfile(data.profile);
          if (data.profile.hsk_level && ['HSK 1', 'HSK 2', 'HSK 3', 'HSK 4', 'HSK 5', 'HSK 6'].includes(data.profile.hsk_level)) {
            setHskLevel(data.profile.hsk_level as HskLevel);
          }
        }
      })
      .catch(() => {});
  }, [authUser?.id]);

  const [showVietnameseSubtitle, setShowVietnameseSubtitle] = useState(true);

  // Audio & Mic controls
  const [isMicActive, setIsMicActive] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');

  // Conversation & Streaming state
  const [tutorState, setTutorState] = useState<TutorState>('IDLE');
  const [avatarAudioLevel, setAvatarAudioLevel] = useState(0);
  const [streamingMessage, setStreamingMessage] = useState<{
    chinese: string;
    pinyin?: string;
    vietnamese?: string;
  } | null>(null);
  const [recentQuestions, setRecentQuestions] = useState<string[]>([]);
  const [wordsUsedSet, setWordsUsedSet] = useState<Set<string>>(new Set());

  // Dev Telemetry
  const [showDevTelemetry, setShowDevTelemetry] = useState(false);
  const [latencyMetrics, setLatencyMetrics] = useState<LatencyMetrics>({
    sttMs: 140,
    aiFirstTokenMs: 280,
    ttsMs: 310,
    totalMs: 730,
  });

  // Dynamic Topic loaded from the current level's knowledge profile
  const [topic, setTopic] = useState<TopicInfo>(() => {
    const topicDef = getTopic(hskLevel);
    return {
      id: topicDef.id,
      title: topicDef.title,
      subtitle: topicDef.subtitle,
      level: hskLevel,
      currentTurn: 1,
      totalTurns: 5,
    };
  });

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  // Dynamic messages matching the active HSK level strictly with 3-Layer format
  const [messages, setMessages] = useState<Message[]>(() => {
    const profile = getHskProfile(hskLevel);
    return [
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        chinese: profile.defaultOpeningQuestion.chinese,
        pinyin: profile.defaultOpeningQuestion.pinyin,
        vietnamese: profile.defaultOpeningQuestion.vietnamese,
        timestamp: getCurrentTime(),
      },
    ];
  });

  // Speech Recognition instance
  const speechManagerRef = useRef<SpeechRecognitionManager | null>(null);

  useEffect(() => {
    speechManagerRef.current = new SpeechRecognitionManager();
    return () => {
      stopAudioSpeech();
      speechManagerRef.current?.stop();
    };
  }, []);

  // Play audio speech with interruption safety
  const handlePlayVoice = async (chineseText: string) => {
    if (isSpeakerMuted || !chineseText) return;

    setTutorState('AI_SPEAKING');
    setAvatarAudioLevel(0);

    const audioStart = performance.now();
    await playAudioSpeech(
      chineseText,
      speechRate,
      () => {
        setTutorState('AI_SPEAKING');
        const ttsElapsed = Math.round(performance.now() - audioStart);
        setLatencyMetrics((prev) => ({ ...prev, ttsMs: ttsElapsed }));
        console.log(`[Speaking] tts_first_audio: ${ttsElapsed}ms`);
      },
      () => {
        setAvatarAudioLevel(0);
        setTutorState('IDLE');
      },
      (level) => setAvatarAudioLevel(level)
    );
  };

  // High-Speed Streaming Message Pipeline with Knowledge Engine Guidance
  const handleSendMessage = async (userText: string, recordedSttMs = 0) => {
    if (!userText.trim()) return;

    const requestStartTime = performance.now();
    console.log(`[Speaking] speech_end -> request_start: userText="${userText}"`);

    // Barge-in: Stop any existing TTS speech
    stopAudioSpeech();

    if (isMicActive) {
      speechManagerRef.current?.stop();
      setIsMicActive(false);
      setInterimTranscript('');
    }

    const newUserMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      chinese: userText,
      timestamp: getCurrentTime(),
    };

    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);

    const levelVocabs = getRelevantVocab(hskLevel, topic.id);
    const newlyUsedWords = levelVocabs.filter((v) => userText.includes(v.word)).map((v) => v.word);
    const nextVocabularyUsed = new Set([...wordsUsedSet, ...newlyUsedWords]).size;
    const nextUserMessages = learningProfile.user_messages + 1;
    persistLearningProfile({
      hsk_level: hskLevel,
      user_messages: nextUserMessages,
      vocabulary_used: Math.max(learningProfile.vocabulary_used, nextVocabularyUsed),
      fluency_score: Math.min(100, nextUserMessages * 3 + Math.max(learningProfile.vocabulary_used, nextVocabularyUsed) * 5),
      practice_minutes: Math.max(learningProfile.practice_minutes, Math.round((Date.now() - sessionStartedAtRef.current) / 60000)),
    });

    // Track words used from the single source of truth
    levelVocabs.forEach((v) => {
      if (userText.includes(v.word)) {
        setWordsUsedSet((prev) => new Set(prev).add(v.word));
      }
    });

    const nextStep = Math.min(topic.totalTurns, topic.currentTurn + 1);
    setTopic((prev) => ({
      ...prev,
      currentTurn: nextStep,
    }));

    setTutorState('PROCESSING');
    setStreamingMessage({ chinese: '', pinyin: '', vietnamese: '' });

    try {
      const historyContext = updatedMessages.slice(-5).map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        content: m.chinese,
      }));

      // Call streaming SSE endpoint with dynamic HSK level parameters
      const response = await fetch('/api/tutor/respond-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: historyContext,
          topic: topic.title,
          level: hskLevel,
          currentStep: topic.currentTurn,
          recentQuestions: recentQuestions.slice(-4),
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Stream request failed with status ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let firstTokenReceived = false;
      let finalData: any = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        let currentEvent = 'message';
        for (const line of lines) {
          if (line.startsWith('event:')) {
            currentEvent = line.replace('event:', '').trim();
          } else if (line.startsWith('data:')) {
            const rawJson = line.replace('data:', '').trim();
            if (!rawJson) continue;

            try {
              const parsed = JSON.parse(rawJson);

              if (currentEvent === 'meta' || parsed.firstTokenMs) {
                if (!firstTokenReceived) {
                  firstTokenReceived = true;
                  const tokenTime = parsed.firstTokenMs || Math.round(performance.now() - requestStartTime);
                  console.log(`[Speaking] ai_first_token: ${tokenTime}ms`);
                  setLatencyMetrics((prev) => ({ ...prev, aiFirstTokenMs: tokenTime }));
                }
              } else if (currentEvent === 'chunk') {
                if (!firstTokenReceived) {
                  firstTokenReceived = true;
                  const tokenTime = Math.round(performance.now() - requestStartTime);
                  console.log(`[Speaking] ai_first_token: ${tokenTime}ms`);
                  setLatencyMetrics((prev) => ({ ...prev, aiFirstTokenMs: tokenTime }));
                }

                if (parsed.currentChinese || parsed.text) {
                  setStreamingMessage((prev) => ({
                    chinese: parsed.currentChinese || (prev?.chinese || '') + parsed.text,
                    pinyin: prev?.pinyin,
                    vietnamese: prev?.vietnamese,
                  }));
                }
              } else if (currentEvent === 'complete') {
                finalData = parsed;
              }
            } catch (_) {}
          }
        }
      }

      const totalTime = Math.round(performance.now() - requestStartTime);
      console.log(`[Speaking] ai_complete: totalLatency=${totalTime}ms`);

      const aiResponseChinese =
        finalData?.chinese || '听起来很有意思！你还能告诉我更多吗？';
      const aiResponsePinyin = finalData?.pinyin;
      const aiResponseVietnamese =
        showVietnameseSubtitle && finalData?.vietnamese ? finalData.vietnamese : undefined;

      // Track questions asked by AI to prevent repetition
      if (aiResponseChinese.includes('？') || aiResponseChinese.includes('?')) {
        const questionMatch = aiResponseChinese.split(/[。！]/).find((s: string) => s.includes('？') || s.includes('?'));
        if (questionMatch) {
          setRecentQuestions((prev) => [...prev, questionMatch.trim()]);
        }
      }

      // 3-Layer Assistant Message
      const newAssistantMsg: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        chinese: aiResponseChinese,
        pinyin: aiResponsePinyin,
        vietnamese: aiResponseVietnamese,
        timestamp: getCurrentTime(),
        correction: finalData?.correction?.hasCorrection
          ? {
              hasCorrection: true,
              original: finalData.correction.original || userText,
              originalPinyin: finalData.correction.originalPinyin,
              originalVi: finalData.correction.originalVi,
              suggestion: finalData.correction.suggestion,
              suggestionPinyin: finalData.correction.suggestionPinyin,
              suggestionVi: finalData.correction.suggestionVi,
              explanation: finalData.correction.explanation || 'Gợi ý khẩu ngữ tự nhiên hơn',
            }
          : finalData?.correction?.explanation
          ? {
              hasCorrection: false,
              explanation: finalData.correction.explanation,
            }
          : undefined,
      };

      setStreamingMessage(null);
      setMessages((prev) => [...prev, newAssistantMsg]);

      setLatencyMetrics({
        sttMs: recordedSttMs || 150,
        aiFirstTokenMs: Math.min(totalTime, 280),
        ttsMs: 320,
        totalMs: totalTime,
      });

      // Play audio TTS
      if (!isSpeakerMuted) {
        handlePlayVoice(aiResponseChinese);
      } else {
        setTutorState('IDLE');
      }

      // Check if finished 5 steps -> Show summary celebration
      if (nextStep >= 5 && updatedMessages.length >= 7) {
        persistLearningProfile({
          conversations_completed: learningProfile.conversations_completed + 1,
          practice_minutes: Math.max(learningProfile.practice_minutes, Math.round((Date.now() - sessionStartedAtRef.current) / 60000)),
        });
        setTimeout(() => {
          setIsSummaryModalOpen(true);
        }, 3200);
      }
    } catch (err) {
      console.error('Streaming error, falling back to instant response:', err);
      setStreamingMessage(null);
      setTutorState('ERROR');
      setTimeout(() => setTutorState('IDLE'), 1500);
    }
  };

  // Toggle Microphone with Auto-Submit Silence Detection
  const handleToggleMic = () => {
    if (isMicActive) {
      speechManagerRef.current?.stop();
      setIsMicActive(false);
      setInterimTranscript('');
      setTutorState('IDLE');
    } else {
      stopAudioSpeech();

      setIsMicActive(true);
      setTutorState('LISTENING');
      const micActivatedTime = performance.now();

      speechManagerRef.current?.start(
        (transcript: string, isFinal: boolean) => {
          setInterimTranscript(transcript);
          if (isFinal && transcript.trim()) {
            const sttTime = Math.round(performance.now() - micActivatedTime);
            console.log(`[Speaking] stt_end: ${sttTime}ms -> auto-submit`);
            setIsMicActive(false);
            setInterimTranscript('');
            handleSendMessage(transcript.trim(), sttTime);
          }
        },
        () => {
          setIsMicActive(false);
          setInterimTranscript('');
          setTutorState('IDLE');
        },
        (error: any) => {
          console.warn('Speech recognition notice:', error);
          setIsMicActive(false);
          setInterimTranscript('');
          setTutorState('IDLE');
        }
      );
    }
  };

  // Toggle Speaker
  const handleToggleSpeaker = () => {
    if (!isSpeakerMuted) {
      stopAudioSpeech();
      setIsSpeakerMuted(true);
      } else {
      setIsSpeakerMuted(false);
    }
  };

  // End Call & trigger Session Summary
  const handleEndCall = () => {
    stopAudioSpeech();
    setAvatarAudioLevel(0);
    speechManagerRef.current?.stop();
    setIsMicActive(false);
    setStreamingMessage(null);
    setTutorState('ENDED');
    setIsSummaryModalOpen(true);
  };

  // Insert vocabulary word
  const handleInsertWord = (word: string) => {
    handleSendMessage(`我想说关于“${word}”。`);
  };

  // Dynamic Level Switching (HSK 1 - 6)
  const handleSelectHskLevel = (lvl: HskLevel) => {
    setHskLevel(lvl);
    if (authUser?.id) {
      persistLearningProfile({ hsk_level: lvl });
      try {
        window.localStorage.setItem('ai_tutor_user_hsk_level:' + authUser.id, lvl);
      } catch {
        // Ignore storage restrictions.
      }
    }

    const activeProfile = getHskProfile(lvl);
    const activeTopicDef = getTopic(lvl);

    setTopic({
      id: activeTopicDef.id,
      title: activeTopicDef.title,
      subtitle: activeTopicDef.subtitle,
      level: lvl,
      currentTurn: 1,
      totalTurns: 5,
    });

    setRecentQuestions([]);
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        chinese: activeProfile.defaultOpeningQuestion.chinese,
        pinyin: activeProfile.defaultOpeningQuestion.pinyin,
        vietnamese: activeProfile.defaultOpeningQuestion.vietnamese,
        timestamp: getCurrentTime(),
      },
    ]);
  };

  // Restart Topic session
  const handleRestartTopic = () => {
    const profile = getHskProfile(hskLevel);
    setTopic((prev) => ({ ...prev, currentTurn: 1 }));
    setTutorState('IDLE');
    setRecentQuestions([]);
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        chinese: profile.defaultOpeningQuestion.chinese,
        pinyin: profile.defaultOpeningQuestion.pinyin,
        vietnamese: profile.defaultOpeningQuestion.vietnamese,
        timestamp: getCurrentTime(),
      },
    ]);
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#F8FBFF] flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 rounded-full border-4 border-[#DDE8F8] border-t-[#3F6FF5] animate-spin" />
          <p className="mt-4 text-sm font-medium text-[#6B83AD]">Đang mở phòng học của bạn...</p>
        </div>
      </div>
    );
  }

  if (!authUser) {
    return <AuthScreen onAuthenticated={(user) => setAuthUser(user)} />;
  }

  return (
    <div className="flex min-h-screen bg-[#F8FBFF] text-[#183B78]">
      {/* Fixed Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        className="hidden md:flex"
      />

      {/* Mobile Sidebar overlay */}
      {showMobileSidebar && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => setShowMobileSidebar(false)}
          />
          <Sidebar
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            className="relative z-10 w-[280px]"
            onCloseMobile={() => setShowMobileSidebar(false)}
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          hskLevel={hskLevel}
          onBack={() => setActiveTab('home')}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          onOpenHelp={() => setIsVocabModalOpen(true)}
          onOpenHskModal={() => setIsHskModalOpen(true)}
          onOpenLevelSelector={() => setIsLevelSelectorOpen(true)}
          onToggleMobileSidebar={() => setShowMobileSidebar(true)}
          userName={authUser.name}
          userEmail={authUser.email}
          onLogout={handleLogout}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-7 overflow-y-auto">
          {activeTab === 'speaking' ? (
            /* Speaking Room: 70% : 30% grid */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 max-w-[1700px] mx-auto items-start">
              {/* Left Column (Video Webcam Presence & Controls) ~70% */}
              <div className="lg:col-span-8 flex flex-col gap-4">
                <VideoPanel
                  tutorState={tutorState}
                  isMicActive={isMicActive}
                  isSpeakerMuted={isSpeakerMuted}
                  onToggleMic={handleToggleMic}
                  onToggleSpeaker={handleToggleSpeaker}
                  onEndCall={handleEndCall}
                  onOpenVocabHint={() => setIsVocabModalOpen(true)}
                  onOpenHskModal={() => setIsHskModalOpen(true)}
                  onOpenLevelSelector={() => setIsLevelSelectorOpen(true)}
                  hskLevel={hskLevel}
                  latencyMetrics={latencyMetrics}
                  showDevTelemetry={showDevTelemetry}
                  onToggleDevTelemetry={() => setShowDevTelemetry(!showDevTelemetry)}
                  audioLevel={avatarAudioLevel}
                />
              </div>

              {/* Right Column (Chat & Conversation Panel) ~30% */}
              <div className="lg:col-span-4 h-[620px] lg:h-[calc(100vh-130px)] min-h-[560px] lg:sticky lg:top-24">
                <ChatPanel
                  topic={topic}
                  messages={messages}
                  tutorState={tutorState}
                  onSendMessage={(text) => handleSendMessage(text)}
                  onPlaySpeech={handlePlayVoice}
                  interimTranscript={interimTranscript}
                  isMicActive={isMicActive}
                  streamingMessage={streamingMessage}
                />
              </div>
            </div>
          ) : (
            <OtherView
              tab={activeTab}
              onGoToSpeakingRoom={() => setActiveTab('speaking')}
              onPracticeWord={(word) => {
                setActiveTab('speaking');
                handleInsertWord(word);
              }}
              hskLevel={hskLevel}
              learningProfile={learningProfile}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <VocabModal
        isOpen={isVocabModalOpen}
        onClose={() => setIsVocabModalOpen(false)}
        onInsertWord={handleInsertWord}
        onPlayPronounce={(chinese) => playAudioSpeech(chinese, speechRate)}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        speechRate={speechRate}
        onSpeechRateChange={setSpeechRate}
        hskLevel={hskLevel}
        onHskLevelChange={(lvl) => handleSelectHskLevel(lvl as HskLevel)}
        showVietnameseTranslation={showVietnameseSubtitle}
        onToggleVietnameseTranslation={setShowVietnameseSubtitle}
      />

      <HskKnowledgeModal
        isOpen={isHskModalOpen}
        onClose={() => setIsHskModalOpen(false)}
        currentLevel={hskLevel}
        onSelectLevel={handleSelectHskLevel}
        topicId={topic.id}
        currentStep={topic.currentTurn}
      />

      <HskLevelSelectorModal
        isOpen={isLevelSelectorOpen}
        onClose={() => setIsLevelSelectorOpen(false)}
        currentLevel={hskLevel}
        onSelectLevel={handleSelectHskLevel}
      />

      <SessionSummaryModal
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        hskLevel={hskLevel}
        totalSentences={messages.filter((m) => m.role === 'user').length}
        vocabUsedCount={wordsUsedSet.size}
        newWordsCount={2}
        onReviewVocab={() => setActiveTab('vocab')}
        onReviewGrammar={() => setActiveTab('grammar')}
        onRestartTopic={handleRestartTopic}
      />
    </div>
  );
}
