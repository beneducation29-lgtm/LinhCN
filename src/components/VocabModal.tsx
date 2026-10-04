import React from 'react';
import { X, Volume2, Plus, Sparkles, BookOpen } from 'lucide-react';
import { getRelevantVocab, VocabItem } from '../data/hsk';

interface VocabModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertWord: (chinese: string) => void;
  onPlayPronounce: (chinese: string) => void;
}

export const VocabModal: React.FC<VocabModalProps> = ({
  isOpen,
  onClose,
  onInsertWord,
  onPlayPronounce,
}) => {
  if (!isOpen) return null;

  // Single Source of Truth from HSK Knowledge Engine
  const vocabList: VocabItem[] = getRelevantVocab('HSK 2', 'daily-life');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl border border-[#E8EEF8] shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#E8EEF8] flex items-center justify-between bg-[#F8FBFF]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#3F6FF5]/10 text-[#3F6FF5] flex items-center justify-center">
              <BookOpen className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[17px] text-[#183B78]">
                  Gợi ý từ vựng HSK 2
                </h3>
                <span className="bg-[#EAF1FF] text-[#3F6FF5] text-[11px] font-bold px-2 py-0.5 rounded-full border border-[#DDE8F8]">
                  Single Source
                </span>
              </div>
              <p className="text-[12px] text-[#6B83AD]">
                Chủ đề: Cuộc sống hàng ngày & Sở thích
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

        {/* Modal Content */}
        <div className="p-5 space-y-3 overflow-y-auto flex-1 bg-[#FAFCFF]">
          <div className="bg-[#EAF1FF] border border-[#DDE8F8] p-3 rounded-2xl text-[12.5px] text-[#183B78] flex items-center gap-2 font-medium">
            <Sparkles className="w-4 h-4 text-[#3F6FF5] shrink-0" />
            <span>
              Bấm vào từ để chèn nhanh vào câu nói hoặc nghe cô Linh phát âm mẫu!
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {vocabList.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-[#E8EEF8] hover:border-[#3F6FF5]/40 rounded-2xl p-3.5 transition-all shadow-xs flex flex-col justify-between gap-2 group"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      {/* Chinese */}
                      <span className="font-chinese text-[19px] font-bold text-[#183B78] group-hover:text-[#3F6FF5] transition-colors leading-tight block">
                        {item.word}
                      </span>
                      {/* Pinyin */}
                      <span className="text-[12px] text-[#3F6FF5] font-semibold tracking-wide block mt-0.5">
                        {item.pinyin}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onPlayPronounce(item.word)}
                        className="p-1.5 text-[#6B83AD] hover:text-[#3F6FF5] hover:bg-[#F0F6FF] rounded-lg transition-colors"
                        title="Nghe phát âm"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          onInsertWord(item.word);
                          onClose();
                        }}
                        className="p-1.5 text-[#3F6FF5] hover:bg-[#EAF1FF] rounded-lg transition-colors"
                        title="Chèn từ này vào hội thoại"
                      >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>

                  {/* Vietnamese */}
                  <p className="text-[12px] text-[#183B78] font-medium mt-1">
                    {item.meaningVi}
                  </p>

                  {/* Example in 3 layers */}
                  {item.exampleChinese && (
                    <div className="mt-2 pt-2 border-t border-[#F8FBFF] text-[11px] space-y-0.5">
                      <p className="font-chinese font-semibold text-[#183B78]">
                        {item.exampleChinese}
                      </p>
                      <p className="text-[#3F6FF5]">{item.examplePinyin}</p>
                      <p className="text-[#6B83AD] italic">{item.exampleVietnamese}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
