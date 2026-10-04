import React from 'react';
import { X, BookOpen, Sparkles, CheckCircle2, ChevronRight, Layers } from 'lucide-react';
import { HskLevel, getHskProfile, getTopic, getRelevantVocab, getRelevantGrammar } from '../data/hsk';

interface HskKnowledgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLevel: HskLevel;
  onSelectLevel: (lvl: HskLevel) => void;
  topicId: string;
  currentStep: number;
}

export const HskKnowledgeModal: React.FC<HskKnowledgeModalProps> = ({
  isOpen,
  onClose,
  currentLevel,
  onSelectLevel,
  topicId,
  currentStep,
}) => {
  if (!isOpen) return null;

  const profile = getHskProfile(currentLevel);
  const topic = getTopic(currentLevel, topicId);
  const vocabList = getRelevantVocab(currentLevel, topicId).slice(0, 8);
  const grammarList = getRelevantGrammar(currentLevel).slice(0, 3);

  const levels: HskLevel[] = ['HSK 1', 'HSK 2', 'HSK 3', 'HSK 4', 'HSK 5', 'HSK 6'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl border border-[#E8EEF8] shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#E8EEF8] flex items-center justify-between bg-[#F8FBFF]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#3F6FF5] text-white flex items-center justify-center shadow-xs">
              <Layers className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[17px] text-[#183B78]">
                  HSK Knowledge Engine
                </h3>
                <span className="bg-[#EAF1FF] text-[#3F6FF5] text-[11px] font-bold px-2 py-0.5 rounded-full border border-[#DDE8F8]">
                  {currentLevel}
                </span>
              </div>
              <p className="text-[12px] text-[#6B83AD]">
                当前主题：{topic.titleZh} ({topic.title})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-slate-100 text-[#6B83AD] hover:text-[#183B78] flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Level Switcher */}
        <div className="px-5 py-3 border-b border-[#F0F6FF] bg-[#FAFCFF] flex items-center gap-1.5 overflow-x-auto">
          {levels.map((lvl) => (
            <button
              key={lvl}
              onClick={() => onSelectLevel(lvl)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                currentLevel === lvl
                  ? 'bg-[#3F6FF5] text-white shadow-xs'
                  : 'bg-white text-[#6B83AD] hover:text-[#183B78] border border-[#E8EEF8]'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 bg-[#FAFCFF]">
          {/* Level Overview */}
          <div className="bg-white border border-[#E8EEF8] rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between mb-1.5">
              <h4 className="font-bold text-[14px] text-[#183B78]">
                {profile.title} ({profile.wordCount} từ vựng chuẩn)
              </h4>
              <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
                Đang kích hoạt
              </span>
            </div>
            <p className="text-[12.5px] text-[#6B83AD] leading-relaxed">
              {profile.description}
            </p>
          </div>

          {/* 5-Step Speaking Progression */}
          <div className="bg-white border border-[#E8EEF8] rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="font-bold text-[13.5px] text-[#183B78] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#3F6FF5]" />
                <span>Tiến trình hội thoại 5 bước (Bước {currentStep}/5)</span>
              </h4>
            </div>

            <div className="space-y-1.5">
              {topic.steps.map((st) => {
                const isPassed = currentStep > st.stepNumber;
                const isCurrent = currentStep === st.stepNumber;
                return (
                  <div
                    key={st.stepNumber}
                    className={`flex items-center justify-between p-2.5 rounded-xl text-[12px] transition-colors ${
                      isCurrent
                        ? 'bg-[#EAF1FF] border border-[#3F6FF5]/30 text-[#183B78] font-semibold'
                        : isPassed
                        ? 'bg-emerald-50/50 text-[#6B83AD]'
                        : 'bg-white text-[#6B83AD]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                          isCurrent
                            ? 'bg-[#3F6FF5] text-white'
                            : isPassed
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-100 text-[#6B83AD]'
                        }`}
                      >
                        {st.stepNumber}
                      </span>
                      <span>{st.name}</span>
                    </div>
                    <span className="text-[11px] opacity-80">{st.objective}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Today's Key Vocabulary */}
          <div className="bg-white border border-[#E8EEF8] rounded-2xl p-4 shadow-xs">
            <h4 className="font-bold text-[13.5px] text-[#183B78] mb-2 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-[#3F6FF5]" />
              <span>Từ vựng trọng tâm hôm nay (今日重点词汇)</span>
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {vocabList.map((item) => (
                <div
                  key={item.word}
                  className="bg-[#F8FBFF] border border-[#E8EEF8] p-2.5 rounded-xl text-left"
                >
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-chinese font-bold text-[15px] text-[#183B78]">
                      {item.word}
                    </span>
                    <span className="text-[11px] text-[#6B83AD] font-medium">
                      [{item.pinyin}]
                    </span>
                  </div>
                  <p className="text-[11.5px] text-[#183B78]/80 mt-0.5 font-medium">
                    {item.meaningVi}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Target Grammar Patterns */}
          <div className="bg-white border border-[#E8EEF8] rounded-2xl p-4 shadow-xs">
            <h4 className="font-bold text-[13.5px] text-[#183B78] mb-2">
              Mẫu câu ngữ pháp cốt lõi
            </h4>
            <div className="space-y-2">
              {grammarList.map((g) => (
                <div key={g.id} className="bg-[#F8FBFF] border border-[#E8EEF8] p-3 rounded-xl">
                  <div className="font-semibold text-[12.5px] text-[#3F6FF5]">
                    {g.name}
                  </div>
                  <div className="text-[11.5px] text-[#183B78] font-mono mt-0.5">
                    {g.pattern}
                  </div>
                  {g.examples[0] && (
                    <div className="text-[11.5px] text-[#6B83AD] mt-1 font-chinese italic">
                      Ví dụ: {g.examples[0].chinese} ({g.examples[0].vietnamese})
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E8EEF8] bg-white flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full bg-[#3F6FF5] text-white text-[13px] font-semibold hover:bg-[#3261e4] transition-colors"
          >
            Đã hiểu kiến thức
          </button>
        </div>
      </div>
    </div>
  );
};
