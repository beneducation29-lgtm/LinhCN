// Speech-to-Text and Text-to-Speech helpers with Silence Detection and Barge-in

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

let activeAudio: HTMLAudioElement | null = null;

export const playAudioSpeech = async (
  text: string,
  rate = 0.9,
  onStart?: () => void,
  onEnd?: () => void
): Promise<number> => {
  if (!text) {
    onEnd?.();
    return 0;
  }

  // Stop any currently playing audio (Barge-in / interrupt support)
  stopAudioSpeech();

  const ttsStartTime = performance.now();

  try {
    // Try Gemini TTS endpoint on server first
    const res = await fetch('/api/tutor/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.audioBase64) {
        const audio = new Audio(`data:${data.format || 'audio/wav'};base64,${data.audioBase64}`);
        audio.playbackRate = rate;
        activeAudio = audio;

        let firstAudioRecorded = false;
        audio.onplay = () => {
          if (!firstAudioRecorded) {
            firstAudioRecorded = true;
            onStart?.();
          }
        };

        audio.onended = () => {
          activeAudio = null;
          onEnd?.();
        };

        audio.onerror = () => {
          activeAudio = null;
          fallbackBrowserTTS(text, rate, onStart, onEnd);
        };

        await audio.play();
        return Math.round(performance.now() - ttsStartTime);
      }
    }
  } catch (err) {
    console.warn('Backend TTS failed, switching to browser TTS:', err);
  }

  // Fallback to Web Speech Synthesis API
  fallbackBrowserTTS(text, rate, onStart, onEnd);
  return Math.round(performance.now() - ttsStartTime);
};

export const stopAudioSpeech = () => {
  if (activeAudio) {
    activeAudio.pause();
    activeAudio = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};

const fallbackBrowserTTS = (
  text: string,
  rate = 0.9,
  onStart?: () => void,
  onEnd?: () => void
) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onEnd?.();
    return;
  }

  window.speechSynthesis.cancel();

  // Extract clean Chinese characters for synthesis (strip translation if any)
  const cleanChinese = text.split('\n')[0].replace(/[A-Za-z]/g, '').trim() || text;

  const utterance = new SpeechSynthesisUtterance(cleanChinese);
  utterance.lang = 'zh-CN';
  utterance.rate = Math.max(0.7, Math.min(1.3, rate));
  utterance.pitch = 1.05;

  const voices = window.speechSynthesis.getVoices();
  const zhVoice = voices.find(
    (v) =>
      v.lang.startsWith('zh') ||
      v.name.includes('Chinese') ||
      v.name.includes('Mandarin') ||
      v.name.includes('Ting-Ting') ||
      v.name.includes('Mei-Jia')
  );
  if (zhVoice) {
    utterance.voice = zhVoice;
  }

  utterance.onstart = () => {
    onStart?.();
  };

  utterance.onend = () => {
    onEnd?.();
  };

  utterance.onerror = () => {
    onEnd?.();
  };

  window.speechSynthesis.speak(utterance);
};

export class SpeechRecognitionManager {
  private recognition: any = null;
  private isListening = false;
  private onResultCallback?: (text: string, isFinal: boolean) => void;
  private onEndCallback?: () => void;
  private onErrorCallback?: (err: any) => void;
  private silenceTimer: any = null;
  private latestSpokenText = '';
  private speechStartTime = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'zh-CN';

        this.recognition.onresult = (event: any) => {
          let interim = '';
          let final = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              final += event.results[i][0].transcript;
            } else {
              interim += event.results[i][0].transcript;
            }
          }

          const currentText = (final || interim).trim();
          if (currentText) {
            this.latestSpokenText = currentText;
            this.onResultCallback?.(currentText, false);

            // Silence Activity Detection: 1000ms of pause auto-commits speech!
            if (this.silenceTimer) clearTimeout(this.silenceTimer);
            this.silenceTimer = setTimeout(() => {
              if (this.latestSpokenText.trim()) {
                const finishedText = this.latestSpokenText.trim();
                this.latestSpokenText = '';
                this.stop();
                this.onResultCallback?.(finishedText, true);
              }
            }, 1000);
          }
        };

        this.recognition.onerror = (e: any) => {
          this.isListening = false;
          if (this.silenceTimer) clearTimeout(this.silenceTimer);
          this.onErrorCallback?.(e);
        };

        this.recognition.onend = () => {
          this.isListening = false;
          if (this.silenceTimer) clearTimeout(this.silenceTimer);
          if (this.latestSpokenText.trim()) {
            this.onResultCallback?.(this.latestSpokenText.trim(), true);
            this.latestSpokenText = '';
          }
          this.onEndCallback?.();
        };
      }
    }
  }

  public isSupported(): boolean {
    return !!this.recognition;
  }

  public start(
    onResult: (text: string, isFinal: boolean) => void,
    onEnd: () => void,
    onError: (err: any) => void
  ) {
    if (!this.recognition) {
      onError(new Error('Trình duyệt không hỗ trợ nhận diện giọng nói Web Speech'));
      return;
    }

    // Barge-in: Stop any playing audio immediately when mic activates
    stopAudioSpeech();

    this.onResultCallback = onResult;
    this.onEndCallback = onEnd;
    this.onErrorCallback = onError;
    this.latestSpokenText = '';
    this.speechStartTime = performance.now();

    try {
      this.isListening = true;
      this.recognition.start();
    } catch (e) {
      try {
        this.recognition.stop();
        setTimeout(() => {
          this.recognition.start();
        }, 150);
      } catch (err) {
        this.isListening = false;
        onError(err);
      }
    }
  }

  public stop() {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (_) {}
    }
    this.isListening = false;
  }

  public getSpeechDurationMs(): number {
    return Math.round(performance.now() - (this.speechStartTime || performance.now()));
  }
}
