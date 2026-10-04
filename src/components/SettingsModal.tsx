import React from 'react';
import { X, Volume2, Mic, Settings, Sliders, Globe } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  speechRate: number;
  onSpeechRateChange: (rate: number) => void;
  hskLevel: string;
  onHskLevelChange: (level: string) => void;
  showVietnameseTranslation: boolean;
  onToggleVietnameseTranslation: (show: boolean) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  speechRate,
  onSpeechRateChange,
  hskLevel,
  onHskLevelChange,
  showVietnameseTranslation,
  onToggleVietnameseTranslation,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl border border-[#E8EEF8] shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#E8EEF8] flex items-center justify-between bg-[#F8FBFF]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#3F6FF5]/10 text-[#3F6FF5] flex items-center justify-center">
              <Settings className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-bold text-[17px] text-[#183B78]">
                Cài đặt phòng luyện nói
              </h3>
              <p className="text-[12px] text-[#6B83AD]">
                Tùy chỉnh giọng nói và cấp độ AI
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

        {/* Content */}
        <div className="p-6 space-y-5 bg-white">
          {/* HSK Level Selection */}
          <div>
            <label className="block text-[13px] font-semibold text-[#183B78] mb-2">
              Trình độ HSK mục tiêu
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {['HSK 1', 'HSK 2', 'HSK 3', 'HSK 4', 'HSK 5', 'HSK 6'].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => onHskLevelChange(lvl)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    hskLevel === lvl
                      ? 'bg-[#3F6FF5] text-white border-[#3F6FF5] shadow-xs'
                      : 'bg-white text-[#183B78] border-[#DDE8F8] hover:bg-[#F8FBFF]'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Speech Rate Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[13px] font-semibold text-[#183B78] flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-[#3F6FF5]" />
                <span>Tốc độ giọng nói cô Linh</span>
              </label>
              <span className="text-[12px] font-bold text-[#3F6FF5] bg-[#EAF1FF] px-2 py-0.5 rounded-lg">
                {speechRate}x
              </span>
            </div>
            <input
              type="range"
              min="0.7"
              max="1.3"
              step="0.1"
              value={speechRate}
              onChange={(e) => onSpeechRateChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-[#EAF1FF] rounded-lg appearance-none cursor-pointer accent-[#3F6FF5]"
            />
            <div className="flex justify-between text-[11px] text-[#6B83AD] mt-1 font-medium">
              <span>Chậm (0.7x)</span>
              <span>Tốc độ khuyến nghị (0.9x)</span>
              <span>Nhanh (1.3x)</span>
            </div>
          </div>

          {/* Vietnamese Translation toggle */}
          <div className="flex items-center justify-between pt-3 border-t border-[#F0F6FF]">
            <div>
              <p className="text-[13px] font-semibold text-[#183B78]">
                Hiển thị bản dịch Tiếng Việt
              </p>
              <p className="text-[11.5px] text-[#6B83AD]">
                Kèm phụ đề dịch nghĩa ngay dưới câu tiếng Trung
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                onToggleVietnameseTranslation(!showVietnameseTranslation)
              }
              className={`w-12 h-6 rounded-full transition-colors relative ${
                showVietnameseTranslation ? 'bg-[#3F6FF5]' : 'bg-slate-200'
              }`}
            >
              <span
                className={`block w-5 h-5 rounded-full bg-white shadow-xs transition-transform absolute top-0.5 left-0.5 ${
                  showVietnameseTranslation ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E8EEF8] bg-[#F8FBFF] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full bg-[#3F6FF5] text-white text-[13px] font-semibold hover:bg-[#3261e4] transition-colors"
          >
            Lưu cài đặt
          </button>
        </div>
      </div>
    </div>
  );
};
