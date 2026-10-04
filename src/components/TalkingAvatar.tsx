import React from 'react';
import { ASSETS } from '../assets';
import { TutorState } from '../types';

interface TalkingAvatarProps {
  tutorState: TutorState;
  className?: string;
  audioLevel?: number;
}

export const TalkingAvatar: React.FC<TalkingAvatarProps> = ({ tutorState, className = '', audioLevel = 0 }) => {
  const level = Math.max(0, Math.min(1, audioLevel));
  const speaking = tutorState === 'AI_SPEAKING';
  const listening = tutorState === 'LISTENING';

  return (
    <div className={`relative w-full h-full overflow-hidden bg-white ${className}`} style={{ '--avatar-audio-level': level } as React.CSSProperties}>
      <div
        className={`absolute inset-0 origin-[50%_38%] transition-transform duration-700 will-change-transform ${
          speaking
            ? 'animate-tutor-speaking-presence'
            : listening
            ? 'animate-tutor-listening-presence'
            : 'animate-tutor-idle-presence'
        }`}
      >
        <img
          src={ASSETS.tutorLinh}
          alt="Linh · AI Tutor"
          className="absolute inset-0 w-full h-full object-contain object-center pointer-events-none select-none"
          draggable={false}
        />
      </div>

      {/* Motion layer: intentionally subtle so the reference portrait stays clean. */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className={`absolute left-[43%] top-[31%] w-[4.8%] h-[1.6%] rounded-full bg-slate-700/15 origin-center ${
            speaking ? 'animate-eye-drift' : ''
          }`}
        />
        <div
          className={`absolute left-[56%] top-[31%] w-[4.8%] h-[1.6%] rounded-full bg-slate-700/15 origin-center ${
            speaking ? 'animate-eye-drift-delayed' : ''
          }`}
        />

        {speaking && (
          <>
            <div
              className="absolute left-1/2 top-[40%] -translate-x-1/2 w-[7.5%] h-[2.1%] rounded-[50%] border border-[#6b2330]/15 bg-[#6b2330]/10 animate-lip-sync-reactive"
              aria-hidden="true"
            />
            <div className="absolute inset-x-[12%] bottom-[5%] h-20 rounded-full bg-[#3F6FF5]/7 blur-2xl animate-audio-presence" />
          </>
        )}
      </div>
    </div>
  );
};
