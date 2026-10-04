import React, { useRef, useState } from 'react';
import {
  Mic,
  MicOff,
  PhoneOff,
  Volume2,
  VolumeX,
  Lightbulb,
  Maximize2,
  Minimize2,
  Wifi,
  Activity,
  Sparkles,
} from 'lucide-react';
import { TutorState } from '../types';
import { ASSETS } from '../assets';

interface LatencyMetrics {
  sttMs?: number;
  aiFirstTokenMs?: number;
  ttsMs?: number;
  totalMs?: number;
}

interface VideoPanelProps {
  tutorState: TutorState;
  isMicActive: boolean;
  isSpeakerMuted: boolean;
  onToggleMic: () => void;
  onToggleSpeaker: () => void;
  onEndCall: () => void;
  onOpenVocabHint: () => void;
  onOpenHskModal?: () => void;
  onOpenLevelSelector?: () => void;
  hskLevel?: string;
  latencyMetrics?: LatencyMetrics;
  showDevTelemetry?: boolean;
  onToggleDevTelemetry?: () => void;
}

export const VideoPanel: React.FC<VideoPanelProps> = ({
  tutorState,
  isMicActive,
  isSpeakerMuted,
  onToggleMic,
  onToggleSpeaker,
  onEndCall,
  onOpenVocabHint,
  onOpenHskModal,
  onOpenLevelSelector,
  hskLevel = 'HSK 1',
  latencyMetrics,
  showDevTelemetry = false,
  onToggleDevTelemetry,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const getStatusText = () => {
    switch (tutorState) {
      case 'LISTENING':
        return 'Đang lắng nghe...';
      case 'PROCESSING':
        return 'Đang suy nghĩ...';
      case 'AI_SPEAKING':
        return 'Đang nói...';
      case 'ENDED':
        return 'Đã kết thúc buổi luyện nói';
      case 'ERROR':
        return 'Gặp sự cố kết nối';
      case 'IDLE':
      default:
        return 'Sẵn sàng luyện nói';
    }
  };

  return (
    <div className="flex flex-col gap-3.5 w-full">
      {/* Live AI Tutor Webcam Frame */}
      <div
        ref={containerRef}
        className={`relative w-full rounded-2xl overflow-hidden border bg-[#0B1528] shadow-md aspect-[4/3] sm:aspect-[16/10] xl:aspect-[16/10.2] select-none flex items-center justify-center transition-all duration-500 ${
          tutorState === 'AI_SPEAKING'
            ? 'border-[#3F6FF5]/60 ring-2 ring-[#3F6FF5]/20 shadow-[#3F6FF5]/10'
            : tutorState === 'LISTENING'
            ? 'border-emerald-500/50 ring-2 ring-emerald-500/15'
            : 'border-[#DDE8F8]'
        }`}
      >
        {/* Full-Bleed photorealistic AI Tutor video presence: clean frame, no body overlays */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <img
            src={ASSETS.tutorLinh}
            alt="Linh · AI Tutor — live video presence"
            className={`w-full h-full object-cover object-[center_34%] pointer-events-none transition-transform duration-700 ease-out animate-tutor-presence ${
              tutorState === 'AI_SPEAKING'
                ? 'scale-[1.018]'
                : tutorState === 'LISTENING'
                ? 'scale-[1.008]'
                : 'scale-100'
            }`}
          />

          {/* Natural camera atmospheric lighting overlay (light at edges, clear on center) */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/30 pointer-events-none" />

          {/* Live Audio Visualizer Glow (only when speaking) */}
          {tutorState === 'AI_SPEAKING' && (
            <div className="absolute inset-0 ring-1 ring-inset ring-cyan-400/25 pointer-events-none" />
          )}
        </div>

        {/* ========================================================
            TOP SAFE OVERLAY ZONE: Outside body & head area
           ======================================================== */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 pointer-events-auto">
          {/* Top-Left: AI Tutor Status Badge */}
          <div className="bg-[#102244]/80 backdrop-blur-md border border-white/15 text-white rounded-full pl-2 pr-4 py-1.5 flex items-center gap-2.5 shadow-md transition-all">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                tutorState === 'LISTENING'
                  ? 'bg-emerald-500/30 text-emerald-300 ring-2 ring-emerald-400/50 animate-pulse'
                  : tutorState === 'AI_SPEAKING'
                  ? 'bg-[#3F6FF5]/40 text-cyan-300 ring-2 ring-cyan-400/40'
                  : tutorState === 'PROCESSING'
                  ? 'bg-amber-500/30 text-amber-300'
                  : 'bg-emerald-500/20 text-emerald-400'
              }`}
            >
              {tutorState === 'AI_SPEAKING' ? (
                /* Dynamic Waveform Bars */
                <div className="flex items-center gap-0.5 h-3.5 px-1">
                  <div className="w-0.5 bg-cyan-300 rounded-full wave-bar-1" />
                  <div className="w-0.5 bg-cyan-300 rounded-full wave-bar-2" />
                  <div className="w-0.5 bg-cyan-300 rounded-full wave-bar-3" />
                  <div className="w-0.5 bg-cyan-300 rounded-full wave-bar-4" />
                  <div className="w-0.5 bg-cyan-300 rounded-full wave-bar-5" />
                </div>
              ) : (
                <Mic className="w-4 h-4 stroke-[2.4]" />
              )}
            </div>

            <div className="flex flex-col text-left">
              <span className="font-semibold text-[13px] text-white tracking-tight leading-tight flex items-center gap-1.5">
                <span>AI Tutor - Linh</span>
                {tutorState === 'AI_SPEAKING' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping inline-block" />
                )}
              </span>
              <span
                className={`text-[11.5px] leading-tight font-medium ${
                  tutorState === 'LISTENING'
                    ? 'text-emerald-300'
                    : tutorState === 'AI_SPEAKING'
                    ? 'text-cyan-300'
                    : tutorState === 'PROCESSING'
                    ? 'text-amber-300'
                    : 'text-slate-300'
                }`}
              >
                {getStatusText()}
              </span>
            </div>
          </div>

          {/* Top-Right: HSK Badge & Fullscreen */}
          <div className="flex items-center gap-2">
            {onToggleDevTelemetry && (
              <button
                onClick={onToggleDevTelemetry}
                className="hidden sm:flex items-center gap-1 bg-[#102244]/80 backdrop-blur-md text-white/80 hover:text-cyan-300 text-[11px] font-medium px-2.5 py-1.5 rounded-full border border-white/15 shadow-sm transition-colors"
                title="Bật/Tắt đo độ trễ hệ thống (Dev Telemetry)"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Dev Latency</span>
              </button>
            )}

            <button
              onClick={onOpenLevelSelector || onOpenHskModal}
              className="bg-[#102244]/80 backdrop-blur-md hover:bg-[#1c386e] text-white/95 text-[12px] font-semibold px-3.5 py-1.5 rounded-full border border-white/15 shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
              title="Bấm để đổi trình độ HSK 1–6"
            >
              <span>{hskLevel}</span>
              <span className="text-[10px] opacity-75">▾</span>
            </button>

            <button
              onClick={toggleFullscreen}
              className="w-8 h-8 rounded-full bg-[#102244]/80 backdrop-blur-md border border-white/15 text-white/80 hover:text-white flex items-center justify-center transition-colors shadow-sm"
              title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* ========================================================
            BODY SAFE ZONE: The entire center & chest is 100% CLEAR!
            No bubbles, no floating transcripts over Linh's body.
           ======================================================== */}

      </div>

      {/* Developer Latency Telemetry Banner (Visible when toggled) */}
      {showDevTelemetry && latencyMetrics && (
        <div className="bg-slate-900 text-cyan-300 rounded-xl px-4 py-2.5 text-[11.5px] font-mono flex items-center justify-between border border-cyan-500/30 animate-in fade-in">
          <div className="flex items-center gap-4 flex-wrap">
            <span>
              STT:{' '}
              <strong className="text-white">
                {latencyMetrics.sttMs ?? 0}ms
              </strong>
            </span>
            <span>
              AI First-Token:{' '}
              <strong className="text-white">
                {latencyMetrics.aiFirstTokenMs ?? 0}ms
              </strong>
            </span>
            <span>
              TTS First-Audio:{' '}
              <strong className="text-white">
                {latencyMetrics.ttsMs ?? 0}ms
              </strong>
            </span>
            <span className="text-emerald-400">
              Total Latency:{' '}
              <strong className="text-white">
                {latencyMetrics.totalMs ?? 0}ms
              </strong>
            </span>
          </div>
          <span className="text-[10px] text-slate-400 uppercase tracking-widest">
            Dev Mode Metrics
          </span>
        </div>
      )}

      {/* Video Control Bar (Positioned below the video frame, 100% safe) */}
      <div className="bg-white rounded-2xl border border-[#E8EEF8] p-4 px-6 flex items-center justify-between shadow-xs">
        {/* Left: Connection status */}
        <div className="flex items-center gap-2 text-xs font-semibold text-[#35A66F]">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <Wifi className="w-4 h-4 stroke-[2.2]" />
          <span>Kết nối tốt</span>
        </div>

        {/* Center: Control buttons */}
        <div className="flex items-center gap-6 sm:gap-8">
          {/* Mic Button */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={onToggleMic}
              className={`w-13 h-13 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-md transition-all active:scale-95 ${
                isMicActive
                  ? 'bg-[#3F6FF5] text-white shadow-[#3F6FF5]/35 ring-4 ring-[#3F6FF5]/20 animate-gentle-pulse'
                  : 'bg-slate-100 text-[#6B83AD] hover:bg-slate-200'
              }`}
              title={isMicActive ? 'Tắt Micro' : 'Bật Micro để nói'}
            >
              {isMicActive ? (
                <Mic className="w-6 h-6 stroke-[2.2]" />
              ) : (
                <MicOff className="w-6 h-6 stroke-[2]" />
              )}
            </button>
            <span className="text-[12px] font-semibold text-[#183B78]">
              {isMicActive ? 'Đang nghe...' : 'Bật Mic'}
            </span>
          </div>

          {/* End Call Button */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={onEndCall}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#F04444] hover:bg-[#e03535] active:scale-95 text-white flex items-center justify-center shadow-md shadow-red-500/25 transition-all"
              title="Kết thúc buổi luyện nói"
            >
              <PhoneOff className="w-5 h-5 stroke-[2.2]" />
            </button>
            <span className="text-[12px] font-semibold text-[#183B78]">
              Kết thúc
            </span>
          </div>

          {/* Speaker Button */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={onToggleSpeaker}
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-[#DDE8F8] flex items-center justify-center transition-all active:scale-95 ${
                !isSpeakerMuted
                  ? 'bg-white text-[#3F6FF5] hover:bg-[#F8FBFF]'
                  : 'bg-slate-100 text-slate-400'
              }`}
              title={isSpeakerMuted ? 'Bật loa' : 'Tắt loa'}
            >
              {isSpeakerMuted ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
            <span className="text-[12px] font-semibold text-[#183B78]">
              {isSpeakerMuted ? 'Bật loa' : 'Tắt loa'}
            </span>
          </div>
        </div>

        {/* Right: Vocabulary hint button */}
        <div>
          <button
            onClick={onOpenVocabHint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-[#DDE8F8] hover:border-[#3F6FF5]/50 hover:bg-[#F0F6FF] text-[#183B78] hover:text-[#3F6FF5] transition-all text-xs font-semibold shadow-xs"
          >
            <Lightbulb className="w-4 h-4 text-[#3F6FF5] stroke-[2.4]" />
            <span>Gợi ý từ vựng</span>
          </button>
        </div>
      </div>

      {/* Bottom Tip Card */}
      <div className="bg-[#F0F6FF] border border-[#DDE8F8] rounded-2xl p-4 flex items-start gap-3 shadow-xs">
        <div className="w-7 h-7 rounded-full bg-[#3F6FF5]/10 text-[#3F6FF5] flex items-center justify-center shrink-0 mt-0.5">
          <Lightbulb className="w-4 h-4 stroke-[2.4]" />
        </div>
        <div>
          <h4 className="font-bold text-[13px] text-[#3F6FF5] leading-tight">
            Mẹo nhỏ
          </h4>
          <p className="text-[12.5px] text-[#183B78]/90 font-medium mt-0.5 leading-relaxed">
            Bạn có thể nói tự nhiên, không cần suy nghĩ quá lâu. AI sẽ lắng nghe,
            hiểu ý và phản hồi như một người bạn thật sự.
          </p>
        </div>
      </div>
    </div>
  );
};
