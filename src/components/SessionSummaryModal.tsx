import React from 'react';
import { Award, CheckCircle2, RotateCcw, BookOpen, FileText, ArrowRight, X } from 'lucide-react';
import { HskLevel } from '../data/hsk';

interface SessionSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  hskLevel: HskLevel;
  totalSentences: number;
  vocabUsedCount: number;
  newWordsCount: number;
  onReviewVocab: () => void;
  onReviewGrammar: () => void;
  onRestartTopic: () => void;
}

export const SessionSummaryModal: React.FC<SessionSummaryModalProps> = ({
  isOpen,
  onClose,
  hskLevel,
  totalSentences,
  vocabUsedCount,
  newWordsCount,
  onReviewVocab,
  onReviewGrammar,
  onRestartTopic,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl border border-[#E8EEF8] shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
        {/* Header with celebration badge */}
        <div className="p-6 bg-gradient-to-b from-[#EAF1FF] to-white border-b border-[#E8EEF8] text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-slate-100 text-[#6B83AD] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-16 h-16 rounded-full bg-[#3F6FF5] text-white flex items-center justify-center mx-auto shadow-md shadow-[#3F6FF5]/30 mb-3">
            <Award className="w-8 h-8 stroke-[2.2]" />
          </div>

          <h3 className="font-bold text-[20px] text-[#183B78]">
            Buổi luyện nói hoàn thành!
          </h3>
          <p className="text-[13px] text-[#6B83AD] mt-1">
            Tuyệt vời! Bạn đã hoàn thành 5 bước đối thoại {hskLevel} cùng cô Linh.
          </p>
        </div>

        {/* Learning Stats Checkpoints */}
        <div className="p-6 space-y-3 bg-white">
          <div className="bg-[#F8FBFF] border border-[#E8EEF8] rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center gap-3 text-[13.5px] font-semibold text-[#183B78]">
              <CheckCircle2 className="w-5 h-5 text-[#35A66F] shrink-0" />
              <span>{Math.max(5, totalSentences)} câu đã nói lưu loát</span>
            </div>

            <div className="flex items-center gap-3 text-[13.5px] font-semibold text-[#183B78]">
              <CheckCircle2 className="w-5 h-5 text-[#35A66F] shrink-0" />
              <span>{Math.max(6, vocabUsedCount)} từ vựng cốt lõi đã sử dụng</span>
            </div>

            <div className="flex items-center gap-3 text-[13.5px] font-semibold text-[#183B78]">
              <CheckCircle2 className="w-5 h-5 text-[#35A66F] shrink-0" />
              <span>{Math.max(2, newWordsCount)} từ mới mở rộng (拿铁, 聊天)</span>
            </div>

            <div className="flex items-center gap-3 text-[13.5px] font-semibold text-[#183B78]">
              <CheckCircle2 className="w-5 h-5 text-[#35A66F] shrink-0" />
              <span>1 mẫu câu đã luyện: 因为...所以...</span>
            </div>

            <div className="flex items-center gap-3 text-[13.5px] font-semibold text-[#3F6FF5]">
              <CheckCircle2 className="w-5 h-5 text-[#3F6FF5] shrink-0" />
              <span>1 lưu ý khẩu ngữ: Dùng 很喜欢 thay vì 比较很好</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={() => {
                onClose();
                onReviewVocab();
              }}
              className="w-full py-3 px-4 rounded-2xl bg-[#EAF1FF] hover:bg-[#dbe7ff] text-[#3F6FF5] font-semibold text-[13.5px] flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4" />
                <span>Ôn lại từ vựng đã dùng</span>
              </div>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                onClose();
                onReviewGrammar();
              }}
              className="w-full py-3 px-4 rounded-2xl bg-white border border-[#DDE8F8] hover:bg-[#F8FBFF] text-[#183B78] font-semibold text-[13.5px] flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-[#6B83AD]" />
                <span>Xem giải thích ngữ pháp</span>
              </div>
              <ArrowRight className="w-4 h-4 text-[#6B83AD]" />
            </button>

            <button
              onClick={() => {
                onClose();
                onRestartTopic();
              }}
              className="w-full py-3 px-4 rounded-2xl bg-[#3F6FF5] hover:bg-[#3261e4] text-white font-semibold text-[13.5px] flex items-center justify-center gap-2 transition-colors shadow-sm shadow-[#3F6FF5]/25"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Luyện lại chủ đề này</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
