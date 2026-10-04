import React, { useState, useMemo, useEffect } from 'react';
import {
  BookOpen,
  FileText,
  MessageSquare,
  BarChart3,
  Home,
  ArrowRight,
  Volume2,
  Sparkles,
  TrendingUp,
  Award,
  Search,
  Star,
  CheckCircle2,
  Clock,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { HskLevel, searchVocabulary, getRelevantGrammar, VocabStatus, VocabItem, getHskProfile } from '../data/hsk';
import { playAudioSpeech } from '../utils/speech';

interface OtherViewProps {
  tab: string;
  onGoToSpeakingRoom: () => void;
  onPracticeWord?: (word: string) => void;
  hskLevel?: HskLevel;
}

export const OtherView: React.FC<OtherViewProps> = ({
  tab,
  onGoToSpeakingRoom,
  onPracticeWord,
  hskLevel = 'HSK 1',
}) => {
  const [selectedLevel, setSelectedLevel] = useState<HskLevel>(hskLevel);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [playingItem, setPlayingItem] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set(['hsk1-nihao', 'hsk2-kafei', 'hsk2-natie']));

  // Keep Vocabulary Lab in sync with user's selected HSK level
  useEffect(() => {
    if (hskLevel) {
      setSelectedLevel(hskLevel);
    }
  }, [hskLevel]);

  const handlePlayAudio = (text: string, id: string) => {
    setPlayingItem(id);
    playAudioSpeech(text, 0.9, undefined, () => setPlayingItem(null));
  };

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Filtered vocabulary list using single source of truth search
  const filteredVocab = useMemo(() => {
    return searchVocabulary(
      searchQuery,
      selectedLevel,
      selectedTopic,
      selectedStatus === 'favorite' ? 'favorite' : (selectedStatus as VocabStatus | 'all')
    );
  }, [searchQuery, selectedLevel, selectedTopic, selectedStatus]);

  const grammarList = getRelevantGrammar(selectedLevel);

  if (tab === 'vocab') {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in">
        {/* Banner */}
        <div className="bg-white rounded-3xl border border-[#E8EEF8] p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#3F6FF5] text-white flex items-center justify-center shadow-xs shrink-0">
              <BookOpen className="w-7 h-7 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-[22px] font-bold text-[#183B78]">
                  Vocabulary Lab · Kho Từ Vựng HSK
                </h2>
                <span className="bg-[#EAF1FF] text-[#3F6FF5] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#DDE8F8]">
                  {selectedLevel}
                </span>
              </div>
              <p className="text-[13px] text-[#6B83AD] mt-1">
                Chuẩn hóa 3 lớp ngôn ngữ: <strong className="text-[#183B78]">中文</strong> → <strong className="text-[#3F6FF5]">Pinyin có dấu thanh</strong> → <strong className="text-[#6B83AD]">Tiếng Việt</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onGoToSpeakingRoom}
            className="px-5 py-2.5 rounded-full bg-[#3F6FF5] text-white text-[13px] font-semibold hover:bg-[#3261e4] flex items-center gap-2 shadow-xs transition-all shrink-0"
          >
            <span>Vào phòng luyện nói</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Learning Progress Summary Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-white border border-[#E8EEF8] p-4 rounded-2xl shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-[#6B83AD] uppercase">Đã thành thạo</span>
              <div className="text-[20px] font-bold text-[#183B78]">73 từ</div>
            </div>
          </div>

          <div className="bg-white border border-[#E8EEF8] p-4 rounded-2xl shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#3F6FF5] flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-[#6B83AD] uppercase">Đang luyện tập</span>
              <div className="text-[20px] font-bold text-[#183B78]">34 từ</div>
            </div>
          </div>

          <div className="bg-white border border-[#E8EEF8] p-4 rounded-2xl shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-[#6B83AD] uppercase">Cần ôn lại</span>
              <div className="text-[20px] font-bold text-[#183B78]">18 từ</div>
            </div>
          </div>

          <div className="bg-white border border-[#E8EEF8] p-4 rounded-2xl shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-[#6B83AD] uppercase">Kho từ vựng {selectedLevel}</span>
              <div className="text-[20px] font-bold text-[#183B78]">{getHskProfile(selectedLevel).wordCount} từ</div>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white border border-[#E8EEF8] rounded-2xl p-4 shadow-xs space-y-3.5">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#6B83AD] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm từ vựng bằng chữ Hán, Pinyin (kāfēi / kafei) hoặc Tiếng Việt (cà phê)..."
              className="w-full bg-[#F8FBFF] border border-[#DDE8F8] focus:border-[#3F6FF5] focus:outline-none pl-10 pr-4 py-2.5 rounded-xl text-[14px] text-[#183B78] placeholder-[#6B83AD]"
            />
          </div>

          {/* Level Switcher & Topic Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-[#F0F6FF]">
            {/* Level Selector */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {(['HSK 1', 'HSK 2', 'HSK 3', 'HSK 4', 'HSK 5', 'HSK 6'] as HskLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevel(lvl)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    selectedLevel === lvl
                      ? 'bg-[#3F6FF5] text-white shadow-xs'
                      : 'bg-[#F8FBFF] text-[#6B83AD] hover:text-[#183B78] border border-[#E8EEF8]'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5">
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'mastered', label: 'Thành thạo' },
                { id: 'learning', label: 'Đang học' },
                { id: 'weak', label: 'Cần ôn' },
                { id: 'favorite', label: 'Yêu thích' },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setSelectedStatus(st.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    selectedStatus === st.id
                      ? 'bg-[#183B78] text-white'
                      : 'bg-slate-100 text-[#6B83AD] hover:bg-slate-200'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Vocabulary Grid (3-Layer Language Display) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVocab.map((item) => {
            const isFav = favorites.has(item.id);
            return (
              <div
                key={item.id}
                className="bg-white border border-[#E8EEF8] hover:border-[#3F6FF5]/50 rounded-2xl p-4.5 shadow-xs flex flex-col justify-between gap-3 group transition-all"
              >
                <div>
                  {/* Top Bar: Word + Tone Pinyin + Audio + Favorite */}
                  <div className="flex items-start justify-between">
                    <div>
                      {/* Layer 1: 中文 (Chinese Hanzi - Visual Primary) */}
                      <span className="font-chinese text-[25px] font-bold text-[#183B78] group-hover:text-[#3F6FF5] transition-colors leading-tight block">
                        {item.word}
                      </span>
                      {/* Layer 2: Pinyin có dấu thanh */}
                      <span className="text-[14px] text-[#3F6FF5] font-semibold tracking-wide block mt-0.5">
                        {item.pinyin}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handlePlayAudio(item.word, item.id)}
                        className={`p-2 rounded-xl transition-colors ${
                          playingItem === item.id
                            ? 'bg-[#3F6FF5] text-white animate-pulse'
                            : 'text-[#6B83AD] hover:text-[#3F6FF5] hover:bg-[#F0F6FF]'
                        }`}
                        title="Nghe phát âm từ này"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={(e) => toggleFavorite(item.id, e)}
                        className={`p-2 rounded-xl transition-colors ${
                          isFav ? 'text-amber-500 bg-amber-50' : 'text-slate-300 hover:text-amber-500'
                        }`}
                        title="Thêm vào yêu thích"
                      >
                        <Star className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Layer 3: Tiếng Việt */}
                  <p className="text-[13.5px] font-semibold text-[#183B78] mt-1.5">
                    {item.meaningVi}
                  </p>

                  {/* Part of Speech & Topic Tag */}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[11px] bg-[#EAF1FF] text-[#3F6FF5] font-semibold px-2.5 py-0.5 rounded-md">
                      {item.partOfSpeechLabel}
                    </span>
                    <span className="text-[11px] bg-slate-100 text-[#6B83AD] font-medium px-2 py-0.5 rounded-md">
                      {item.topicNameVi}
                    </span>
                  </div>

                  {/* 3-Layer Example Sentence */}
                  {item.exampleChinese && (
                    <div className="mt-3 pt-2.5 border-t border-[#F8FBFF] space-y-1 bg-[#FAFCFF] p-2.5 rounded-xl border border-[#F0F4F9]">
                      <div className="flex items-center justify-between">
                        <span className="text-[10.5px] font-bold text-[#6B83AD] uppercase tracking-wider">
                          Ví dụ khẩu ngữ:
                        </span>
                        <button
                          onClick={() => handlePlayAudio(item.exampleChinese, `${item.id}-ex`)}
                          className="text-[#6B83AD] hover:text-[#3F6FF5] p-1"
                          title="Nghe cả câu ví dụ"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="font-chinese font-semibold text-[#183B78] text-[13.5px]">
                        {item.exampleChinese}
                      </p>
                      <p className="text-[12px] text-[#3F6FF5] font-medium">
                        {item.examplePinyin}
                      </p>
                      <p className="text-[11.5px] text-[#6B83AD] italic">
                        {item.exampleVietnamese}
                      </p>
                    </div>
                  )}

                  {/* Collocations */}
                  {item.commonCollocations && item.commonCollocations.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {item.commonCollocations.map((col, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] bg-[#F0F6FF] text-[#3F6FF5] font-medium px-2 py-0.5 rounded-md"
                        >
                          {col}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bottom Action: Practice in Speaking Room */}
                <div className="pt-2 border-t border-[#F8FBFF] flex items-center justify-between">
                  <span className="text-[11px] text-[#6B83AD] font-medium">
                    Cấp độ: {item.hskLevel}
                  </span>

                  <button
                    onClick={() => {
                      if (onPracticeWord) onPracticeWord(item.word);
                      else onGoToSpeakingRoom();
                    }}
                    className="text-[12px] text-[#3F6FF5] hover:text-[#2a54c9] font-semibold flex items-center gap-1 transition-colors"
                  >
                    <span>Luyện nói từ này</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (tab === 'grammar') {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in">
        <div className="bg-white rounded-3xl border border-[#E8EEF8] p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#3F6FF5] text-white flex items-center justify-center shadow-xs shrink-0">
              <FileText className="w-7 h-7 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-[22px] font-bold text-[#183B78]">
                  Grammar Lab · Ngữ Pháp Thực Chiến
                </h2>
                <span className="bg-[#EAF1FF] text-[#3F6FF5] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#DDE8F8]">
                  {selectedLevel}
                </span>
              </div>
              <p className="text-[13px] text-[#6B83AD] mt-1">
                Các cấu trúc câu giao tiếp theo chuẩn 3 lớp: 中文 → Pinyin có dấu thanh → Tiếng Việt
              </p>
            </div>
          </div>

          <button
            onClick={onGoToSpeakingRoom}
            className="px-5 py-2.5 rounded-full bg-[#3F6FF5] text-white text-[13px] font-semibold hover:bg-[#3261e4] flex items-center gap-2 shadow-xs transition-all shrink-0"
          >
            <span>Thực hành cùng cô Linh</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {grammarList.map((g) => (
            <div
              key={g.id}
              className="bg-white border border-[#E8EEF8] rounded-2xl p-5 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-[16px] text-[#183B78]">{g.name}</h3>
                  <div className="inline-block bg-[#F0F6FF] border border-[#DDE8F8] text-[#3F6FF5] font-mono text-[13px] px-3 py-1 rounded-xl mt-1.5 font-semibold">
                    {g.pattern}
                  </div>
                </div>
                <span className="text-[11px] font-bold text-[#3F6FF5] bg-[#EAF1FF] px-2.5 py-0.5 rounded-full">
                  {g.level}
                </span>
              </div>

              <p className="text-[13px] text-[#6B83AD] leading-relaxed">
                {g.explanation}
              </p>

              {/* 3-Layer Grammar Examples */}
              <div className="bg-[#FAFCFF] border border-[#E8EEF8] rounded-xl p-3.5 space-y-3">
                <span className="text-[11px] font-bold text-[#183B78] uppercase tracking-wider block">
                  Ví dụ thực tế trong khẩu ngữ:
                </span>
                {g.examples.map((ex, i) => (
                  <div key={i} className="flex items-start justify-between gap-3 text-[13px] bg-white p-3 rounded-xl border border-[#F0F4F9]">
                    <div className="space-y-0.5">
                      <p className="font-chinese font-bold text-[#183B78] text-[14px]">
                        {ex.chinese}
                      </p>
                      <p className="text-[12px] text-[#3F6FF5] font-medium">
                        {ex.pinyin}
                      </p>
                      <p className="text-[12px] text-[#6B83AD]">
                        {ex.vietnamese}
                      </p>
                    </div>
                    <button
                      onClick={() => handlePlayAudio(ex.chinese, `g-${g.id}-${i}`)}
                      className="p-1.5 text-[#6B83AD] hover:text-[#3F6FF5] hover:bg-[#F0F6FF] rounded-lg transition-colors shrink-0"
                      title="Nghe ví dụ"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {g.commonMistakes && g.commonMistakes.length > 0 && (
                <div className="text-[12px] text-amber-700 bg-amber-50/80 border border-amber-200/60 p-2.5 rounded-xl">
                  <strong>Lỗi học viên hay mắc: </strong>
                  {g.commonMistakes.join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Reports / Progress view
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in">
      <div className="bg-white rounded-3xl border border-[#E8EEF8] p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#3F6FF5] text-white flex items-center justify-center shadow-xs shrink-0">
            <BarChart3 className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-[22px] font-bold text-[#183B78]">
              Báo Cáo Tiến Độ & Năng Lực HSK
            </h2>
            <p className="text-[13px] text-[#6B83AD] mt-1">
              Dữ liệu học tập đồng bộ trực tiếp từ các buổi luyện nói cùng AI Tutor Linh
            </p>
          </div>
        </div>

        <button
          onClick={onGoToSpeakingRoom}
          className="px-5 py-2.5 rounded-full bg-[#3F6FF5] text-white text-[13px] font-semibold hover:bg-[#3261e4] flex items-center gap-2 shadow-xs transition-all shrink-0"
        >
          <span>Vào phòng luyện nói</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E8EEF8] p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-[#6B83AD]">
            <span className="text-[12px] font-semibold uppercase">Độ lưu loát & phản xạ</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-[28px] font-bold text-[#183B78] mt-2">88/100</div>
          <p className="text-[12px] text-emerald-600 font-medium mt-1">
            +12% so với tuần trước
          </p>
        </div>

        <div className="bg-white border border-[#E8EEF8] p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-[#6B83AD]">
            <span className="text-[12px] font-semibold uppercase">Từ vựng đã dùng</span>
            <BookOpen className="w-4 h-4 text-[#3F6FF5]" />
          </div>
          <div className="text-[28px] font-bold text-[#183B78] mt-2">{getHskProfile(selectedLevel).wordCount} từ</div>
          <p className="text-[12px] text-[#3F6FF5] font-medium mt-1">
            Bao phủ kho từ vựng {selectedLevel}
          </p>
        </div>

        <div className="bg-white border border-[#E8EEF8] p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-[#6B83AD]">
            <span className="text-[12px] font-semibold uppercase">Hội thoại hoàn thành</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-[28px] font-bold text-[#183B78] mt-2">24 lượt</div>
          <p className="text-[12px] text-[#6B83AD] font-medium mt-1">
            Cấp độ hiện tại: {selectedLevel}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-[#E8EEF8] p-6 shadow-xs space-y-3">
        <h3 className="font-bold text-[16px] text-[#183B78]">
          Gợi ý luyện tập cá nhân hóa hôm nay:
        </h3>
        <p className="text-[13.5px] text-[#6B83AD] leading-relaxed">
          Bạn đang sử dụng rất tốt các mẫu câu so sánh với <code className="text-[#3F6FF5] bg-[#EAF1FF] px-1.5 py-0.5 rounded font-mono font-semibold">比较</code> và câu nguyên nhân <code className="text-[#3F6FF5] bg-[#EAF1FF] px-1.5 py-0.5 rounded font-mono font-semibold">因为...所以...</code>.
          Hãy tiếp tục luyện thêm phản xạ với hành động song song <code className="text-[#3F6FF5] bg-[#EAF1FF] px-1.5 py-0.5 rounded font-mono font-semibold">一边...一边...</code> trong buổi nói tới cùng cô Linh!
        </p>

        <div className="pt-2">
          <button
            onClick={onGoToSpeakingRoom}
            className="text-[#3F6FF5] hover:text-[#274fb8] font-semibold text-sm flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Mở phòng luyện nói ngay bây giờ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
