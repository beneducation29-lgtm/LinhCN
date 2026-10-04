import React from 'react';
import { ASSETS } from '../assets';
import { TutorState } from '../types';

interface TalkingAvatarProps {
  tutorState: TutorState;
  className?: string;
}

export const TalkingAvatar: React.FC<TalkingAvatarProps> = ({ tutorState, className = '' }) => {
  const speaking = tutorState === 'AI_SPEAKING';
  const listening = tutorState === 'LISTENING';

  return (
    <div className={`relative w-full h-full overflow-hidden bg-white ${className}`}>
      <img
        src={ASSETS.tutorLinh}
        alt="Linh · AI Tutor"
        className={`absolute inset-0 w-full h-full object-contain object-center pointer-events-none transition-transform duration-500 ${speaking ? 'scale-[1.018]' : listening ? 'scale-[1.008]' : 'scale-100'}`}
      />

      <div className={`absolute left-0 right-0 top-0 bottom-0 pointer-events-none transition-opacity duration-300 ${speaking ? 'opacity-100' : 'opacity-80'}`}>
        {/* Subtle eye movement/blink layer. Positions are intentionally soft so it follows the reference portrait without covering it. */}
        <div className={`absolute left-[43%] top-[31%] w-[5%] h-[1.8%] rounded-full bg-slate-700/20 ${speaking ? 'animate-eye-drift' : ''}`} />
        <div className={`absolute left-[56%] top-[31%] w-[5%] h-[1.8%] rounded-full bg-slate-700/20 ${speaking ? 'animate-eye-drift-delayed' : ''}`} />

        {/* Mouth motion is driven by the same AI_SPEAKING state that starts with TTS playback. */}
        <div className={`absolute left-1/2 top-[40%] -translate-x-1/2 ${speaking ? 'animate-lip-sync' : 'opacity-0'}`}>
          <div className="w-10 sm:w-12 h-2 rounded-[50%] bg-[#6b2330]/35 border border-white/25 shadow-sm" />
          <div className="mx-auto mt-[-1px] w-6 h-1 rounded-b-full bg-[#3d1720]/35" />
        </div>

        {speaking && (
          <div className="absolute inset-x-[12%] bottom-[5%] h-20 rounded-full bg-[#3F6FF5]/8 blur-2xl animate-audio-presence" />
        )}
      </div>
    </div>
  );
};
