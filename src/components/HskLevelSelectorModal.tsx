import React from 'react';
import { X, Check, Sparkles, BookOpen, Layers, Award, ArrowRight } from 'lucide-react';
import { HskLevel, getHskProfile, getTopic } from '../data/hsk';

interface HskLevelSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLevel: HskLevel;
  onSelectLevel: (lvl: HskLevel) => void;
}

export const HskLevelSelectorModal: React.FC<HskLevelSelectorModalProps> = ({
  isOpen,
  onClose,
  currentLevel,
  onSelectLevel,
}) => {
  if (!isOpen) return null;

  const levels: HskLevel[] = ['HSK 1', 'HSK 2', 'HSK 3', 'HSK 4', 'HSK 5', 'HSK 6'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl border border-[#E8EEF8] shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#E8EEF8] bg-[#F8FBFF] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#3F6FF5] text-white flex items-center justify-center shadow-xs">
              <Layers className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[18px] text-[#183B78]">
                  Chọn trình độ HSK của bạn
                </h3>
                <span className="bg-[#EAF1FF] text-[#3F6FF5] text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-[#DDE8F8]">
                  Động HSK 1–6
                </span>
              </div>
              <p className="text-[12.5px] text-[#6B83AD] mt-0.5">
                AI Tutor Linh sẽ tự động điều chỉnh từ vựng, ngữ pháp và độ sâu hội thoại theo đúng trình độ này.
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

        {/* Level List */}
        <div className="p-5 sm:p-6 space-y-3 overflow-y-auto flex-1 bg-[#FAFCFF]">
          {levels.map((lvl) => {
            const profile = getHskProfile(lvl);
            const topic = getTopic(lvl);
            const isSelected = currentLevel === lvl;

            return (
              <div
                key={lvl}
                onClick={() => {
                  onSelectLevel(lvl);
                  onClose();
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group ${
                  isSelected
                    ? 'bg-[#EAF1FF]/80 border-[#3F6FF5] shadow-xs'
                    : 'bg-white border-[#E8EEF8] hover:border-[#3F6FF5]/50 hover:bg-[#F8FBFF]'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center shrink-0 font-bold transition-colors ${
                      isSelected
                        ? 'bg-[#3F6FF5] text-white shadow-xs'
                        : 'bg-[#F0F6FF] text-[#3F6FF5] group-hover:bg-[#EAF1FF]'
                    }`}
                  >
                    <span className="text-[13px] leading-tight">{lvl}</span>
                    <span className="text-[9px] font-normal opacity-90">{profile.badgeLabel}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-[15px] text-[#183B78]">
                        {profile.title}
                      </h4>
                      <span className="text-[11px] text-[#6B83AD] font-medium bg-slate-100 px-2 py-0.5 rounded-md">
                        {profile.wordCount} từ vựng
                      </span>
                    </div>

                    <p className="text-[12.5px] text-[#6B83AD] mt-1 leading-relaxed">
                      {profile.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 mt-2 text-[11.5px]">
                      <span className="font-semibold text-[#183B78]">Chủ đề mở đầu:</span>
                      <span className="bg-white text-[#3F6FF5] px-2 py-0.5 rounded-md border border-[#DDE8F8] font-chinese font-medium">
                        {topic.titleZh} ({topic.title})
                      </span>
                      <span className="text-[#6B83AD] italic hidden sm:inline">
                        · {profile.recommendedResponseLength}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end sm:justify-center shrink-0">
                  {isSelected ? (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#3F6FF5] bg-white px-3 py-1.5 rounded-full border border-[#DDE8F8] shadow-2xs">
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Đang chọn</span>
                    </div>
                  ) : (
                    <div className="opacity-0 group-hover:opacity-100 text-[#3F6FF5] font-semibold text-xs flex items-center gap-1 transition-opacity">
                      <span>Chọn cấp độ</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E8EEF8] bg-white flex items-center justify-between text-xs text-[#6B83AD]">
          <span>Mọi bài luyện nói và kho từ vựng sẽ đồng bộ lập tức khi bạn chuyển cấp độ.</span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full bg-[#3F6FF5] text-white font-semibold hover:bg-[#3261e4] transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
