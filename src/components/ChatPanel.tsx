import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Smile,
  Volume2,
  Copy,
  Check,
  CheckCheck,
  Info,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { Message, TopicInfo, TutorState } from '../types';
import { ASSETS } from '../assets';

interface ChatPanelProps {
  topic: TopicInfo;
  messages: Message[];
  tutorState: TutorState;
  onSendMessage: (text: string) => void;
  onPlaySpeech: (text: string) => void;
  interimTranscript?: string;
  isMicActive?: boolean;
  streamingMessage?: { chinese: string; pinyin?: string; vietnamese?: string } | null;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  topic,
  messages,
  tutorState,
  onSendMessage,
  onPlaySpeech,
  interimTranscript = '',
  isMicActive = false,
  streamingMessage = null,
}) => {
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, tutorState, interimTranscript, streamingMessage]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = (inputText || interimTranscript).trim();
    if (!trimmed) return;
    onSendMessage(trimmed);
    setInputText('');
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const sampleEmojis = ['😊', '👍', '☕', '❤️', '👋', '🎉', '🍵', '✨'];

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-[#E8EEF8] shadow-xs overflow-hidden">
      {/* Topic Card Header */}
      <div className="p-4 border-b border-[#E8EEF8] bg-white">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#E8EEF8] bg-[#F0F6FF] shrink-0">
              <img
                src={ASSETS.topicDailyLife}
                alt="Cuộc sống hàng ngày"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-[#6B83AD] uppercase tracking-wider">
                Chủ đề hiện tại
              </span>
              <h3 className="font-bold text-[16px] text-[#183B78] leading-tight mt-0.5">
                {topic.title}
              </h3>
              <p className="text-[12px] text-[#6B83AD] font-medium mt-0.5">
                {topic.subtitle}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <span className="bg-[#EAF1FF] text-[#3F6FF5] text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-[#DDE8F8]">
              {topic.level}
            </span>
            <div className="flex items-center gap-2">
              <div className="w-16 h-1.5 bg-[#EAF1FF] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#3F6FF5] rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      (topic.currentTurn / topic.totalTurns) * 100
                    )}%`,
                  }}
                />
              </div>
              <span className="text-[11.5px] font-semibold text-[#183B78]">
                {topic.currentTurn}/{topic.totalTurns}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div
        ref={chatScrollRef}
        className="flex-1 p-4 space-y-4 overflow-y-auto bg-[#FAFCFF]"
      >
        {messages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div key={msg.id} className="space-y-2">
              {isUser ? (
                /* User Message (3 Layers) */
                <div className="flex items-start justify-end gap-2.5">
                  <div className="flex flex-col items-end max-w-[85%]">
                    <div className="bg-[#EAF1FF] text-[#183B78] rounded-2xl rounded-tr-xs px-4 py-3 shadow-xs">
                      {/* Layer 1: Chinese */}
                      <p className="font-chinese text-[15.5px] font-bold leading-relaxed">
                        {msg.chinese}
                      </p>

                      {/* Layer 2: Pinyin (if available) */}
                      {msg.pinyin && (
                        <p className="text-[12px] text-[#3F6FF5] font-medium mt-0.5 tracking-wide">
                          {msg.pinyin}
                        </p>
                      )}

                      {/* Layer 3: Vietnamese (if available) */}
                      {msg.vietnamese && (
                        <p className="text-[12px] text-[#6B83AD] mt-1 border-t border-[#DDE8F8] pt-1">
                          {msg.vietnamese}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[#6B83AD]">
                      <span>{msg.timestamp}</span>
                      <CheckCheck className="w-3.5 h-3.5 text-[#3F6FF5]" />
                    </div>
                  </div>

                  <div className="w-8 h-8 rounded-full overflow-hidden border border-[#DDE8F8] shrink-0 mt-0.5">
                    <img
                      src={ASSETS.studentTriet}
                      alt="Student"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              ) : (
                /* AI Tutor Message (3 Layers: 中文 → Pinyin có dấu thanh → Tiếng Việt) */
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-[#DDE8F8] shrink-0 mt-0.5">
                    <img
                      src={ASSETS.tutorLinh}
                      alt="AI Tutor Linh"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex flex-col items-start max-w-[88%]">
                    <div className="text-[12px] font-semibold text-[#3F6FF5] mb-1 pl-1 flex items-center gap-1.5">
                      <span>Linh · AI Tutor</span>
                    </div>

                    <div className="bg-white border border-[#E8EEF8] rounded-2xl rounded-tl-xs p-4 shadow-xs w-full">
                      {/* Layer 1: 中文 (Chinese Hanzi - Visual Primary) */}
                      <p className="font-chinese text-[16px] font-bold text-[#183B78] leading-relaxed whitespace-pre-line">
                        {msg.chinese}
                      </p>

                      {/* Layer 2: Pinyin có dấu thanh */}
                      {msg.pinyin && (
                        <p className="text-[13px] text-[#3F6FF5] font-medium tracking-wide mt-1 whitespace-pre-line">
                          {msg.pinyin}
                        </p>
                      )}

                      {/* Layer 3: Tiếng Việt */}
                      {msg.vietnamese && (
                        <p className="text-[12.5px] text-[#6B83AD] mt-2 italic font-normal leading-relaxed border-t border-[#F0F6FF] pt-2 whitespace-pre-line">
                          {msg.vietnamese}
                        </p>
                      )}

                      {/* Message Actions */}
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#F0F6FF] text-[#6B83AD]">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onPlaySpeech(msg.chinese)}
                            className="p-1 hover:text-[#3F6FF5] hover:bg-[#F0F6FF] rounded-md transition-colors"
                            title="Nghe phát âm"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleCopy(msg.id, msg.chinese)}
                            className="p-1 hover:text-[#3F6FF5] hover:bg-[#F0F6FF] rounded-md transition-colors"
                            title="Sao chép"
                          >
                            {copiedId === msg.id ? (
                              <Check className="w-4 h-4 text-[#35A66F]" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>

                        <div className="flex items-center gap-1 text-[11px]">
                          <span>{msg.timestamp}</span>
                          <Check className="w-3.5 h-3.5 text-[#3F6FF5]" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Grammar Correction Box (3-Layer Language Support) */}
              {msg.correction && (
                <div className="ml-10 max-w-[90%] bg-white border border-[#DDE8F8] rounded-2xl p-3.5 shadow-xs">
                  <div className="flex items-center gap-2 text-[12px] font-semibold text-[#183B78]">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-[#35A66F] flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                    <span>Góp ý ngữ pháp nhẹ nhàng</span>
                  </div>

                  {msg.correction.hasCorrection ? (
                    <div className="mt-2.5 space-y-2 text-[12.5px]">
                      {msg.correction.original && (
                        <div className="text-[#6B83AD] bg-[#FAFBFD] p-2.5 rounded-xl border border-[#F0F4F9]">
                          <span className="font-semibold text-[#183B78] block text-[11px] uppercase tracking-wider mb-1">
                            Bạn nói:
                          </span>
                          <p className="font-chinese font-semibold text-[#183B78]">
                            {msg.correction.original}
                          </p>
                          {msg.correction.originalPinyin && (
                            <p className="text-[11.5px] text-[#3F6FF5] mt-0.5">
                              {msg.correction.originalPinyin}
                            </p>
                          )}
                          {msg.correction.originalVi && (
                            <p className="text-[11.5px] text-[#6B83AD] italic mt-0.5">
                              {msg.correction.originalVi}
                            </p>
                          )}
                        </div>
                      )}

                      {msg.correction.suggestion && (
                        <div className="text-[#183B78] bg-[#F0F9F5] p-2.5 rounded-xl border border-emerald-100">
                          <span className="font-semibold text-[#35A66F] block text-[11px] uppercase tracking-wider mb-1">
                            Gợi ý tự nhiên hơn:
                          </span>
                          <p className="font-chinese font-bold text-[#183B78] text-[13.5px]">
                            {msg.correction.suggestion}
                          </p>
                          {msg.correction.suggestionPinyin && (
                            <p className="text-[11.5px] text-[#3F6FF5] mt-0.5">
                              {msg.correction.suggestionPinyin}
                            </p>
                          )}
                          {msg.correction.suggestionVi && (
                            <p className="text-[11.5px] text-[#6B83AD] italic mt-0.5">
                              {msg.correction.suggestionVi}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : null}

                  {msg.correction.explanation && (
                    <div className="mt-2 flex items-start gap-1.5 text-[11.5px] text-[#3F6FF5] font-medium bg-[#F0F6FF] p-2.5 rounded-xl">
                      <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{msg.correction.explanation}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Live speech transcription bubble when mic is on */}
        {isMicActive && interimTranscript && (
          <div className="flex items-start justify-end gap-2.5">
            <div className="bg-[#EAF1FF]/70 border border-[#3F6FF5]/30 text-[#183B78] rounded-2xl rounded-tr-xs px-4 py-3 shadow-xs animate-pulse">
              <span className="text-[11px] text-[#3F6FF5] font-semibold block mb-0.5">
                Đang nhận diện giọng nói...
              </span>
              <p className="font-chinese text-[15px] font-medium">
                {interimTranscript}
              </p>
            </div>
          </div>
        )}

        {/* Live AI Streaming Bubble (Token-by-Token instant visibility) */}
        {streamingMessage && streamingMessage.chinese && (
          <div className="flex items-start gap-2.5 animate-in fade-in">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-[#DDE8F8] shrink-0 mt-0.5">
              <img
                src={ASSETS.tutorLinh}
                alt="AI Tutor Linh"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex flex-col items-start max-w-[88%]">
              <div className="text-[12px] font-semibold text-[#3F6FF5] mb-1 pl-1 flex items-center gap-1.5">
                <span>Linh · AI Tutor</span>
                <span className="w-1.5 h-1.5 bg-[#3F6FF5] rounded-full animate-ping" />
              </div>

              <div className="bg-white border border-[#3F6FF5]/30 rounded-2xl rounded-tl-xs p-4 shadow-xs w-full">
                {/* Chinese */}
                <p className="font-chinese text-[16px] font-bold text-[#183B78] leading-relaxed whitespace-pre-line">
                  {streamingMessage.chinese}
                  <span className="inline-block w-1.5 h-4 bg-[#3F6FF5] ml-1 animate-pulse align-middle" />
                </p>

                {/* Pinyin */}
                {streamingMessage.pinyin && (
                  <p className="text-[13px] text-[#3F6FF5] font-medium tracking-wide mt-1">
                    {streamingMessage.pinyin}
                  </p>
                )}

                {/* Vietnamese */}
                {streamingMessage.vietnamese && (
                  <p className="text-[12.5px] text-[#6B83AD] mt-2 italic font-normal leading-relaxed border-t border-[#F0F6FF] pt-2">
                    {streamingMessage.vietnamese}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* AI Typing / Processing Indicator */}
        {tutorState === 'PROCESSING' && !streamingMessage?.chinese && (
          <div className="flex items-center gap-2.5 text-[#6B83AD] text-xs">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-[#DDE8F8] shrink-0">
              <img
                src={ASSETS.tutorLinh}
                alt="AI Tutor"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="bg-white border border-[#E8EEF8] rounded-2xl px-4 py-2.5 flex items-center gap-1.5 shadow-xs">
              <span className="w-1.5 h-1.5 bg-[#3F6FF5] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1.5 h-1.5 bg-[#3F6FF5] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 bg-[#3F6FF5] rounded-full animate-bounce"></span>
              <span className="text-[12px] font-medium text-[#6B83AD] ml-1.5">
                Linh đang suy nghĩ...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input Box Area */}
      <div className="p-3 border-t border-[#E8EEF8] bg-white relative">
        {/* Emoji picker popup */}
        {showEmojiPicker && (
          <div className="absolute bottom-16 left-4 bg-white border border-[#E8EEF8] rounded-2xl shadow-xl p-2.5 flex gap-2 z-40 animate-in fade-in">
            {sampleEmojis.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  setInputText((prev) => prev + emoji);
                  setShowEmojiPicker(false);
                }}
                className="text-lg hover:bg-[#F0F6FF] p-1.5 rounded-xl transition-transform hover:scale-125"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 bg-[#F8FBFF] border border-[#DDE8F8] focus-within:border-[#3F6FF5] focus-within:ring-2 focus-within:ring-[#3F6FF5]/15 rounded-full px-4 py-1.5 transition-all shadow-xs"
        >
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="text-[#6B83AD] hover:text-[#183B78] p-1 rounded-full transition-colors"
            title="Thêm biểu tượng cảm xúc"
          >
            <Smile className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Nhập câu trả lời bằng tiếng Trung..."
            className="flex-1 bg-transparent py-2 text-[14px] text-[#183B78] placeholder-[#6B83AD] focus:outline-none font-chinese"
          />

          <button
            type="submit"
            disabled={!inputText.trim() && !interimTranscript.trim()}
            className="w-9 h-9 rounded-full bg-[#3F6FF5] hover:bg-[#3261e4] disabled:opacity-40 disabled:hover:bg-[#3F6FF5] text-white flex items-center justify-center transition-all shrink-0 active:scale-95 shadow-sm shadow-[#3F6FF5]/25"
            title="Gửi câu trả lời"
          >
            <Send className="w-4 h-4 ml-0.5 stroke-[2.2]" />
          </button>
        </form>
      </div>
    </div>
  );
};
