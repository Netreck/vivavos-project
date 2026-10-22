import React from 'react';
import { MicOff, VolumeX } from 'lucide-react';

/** Aviso flutuante que só aparece enquanto o Vivavós fala ou escuta */
export function VoiceStatusIndicator({ voice, tts }) {
  const { isListening, stopListening, transcript } = voice;
  const { isSpeaking, stop } = tts;

  if (!isSpeaking && !isListening) return null;

  return (
    <aside
      aria-live="polite"
      aria-label="Status de voz"
      className="fixed bottom-4 inset-x-4 z-40 mx-auto max-w-[30rem] flex items-center justify-between gap-3 pl-5 pr-2 py-2 rounded-full bg-ink text-surface shadow-card"
    >
      <div className="flex items-center gap-3 min-w-0">
        {isListening ? (
          <span className="flex items-center gap-1 h-5" aria-hidden="true">
            <span className="w-1.5 h-3 bg-accent rounded-full animate-voice-1" />
            <span className="w-1.5 h-5 bg-accent rounded-full animate-voice-2" />
            <span className="w-1.5 h-3 bg-accent rounded-full animate-voice-3" />
          </span>
        ) : (
          <span className="relative flex h-3 w-3" aria-hidden="true">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-accent" />
          </span>
        )}
        <span className="font-bold truncate">
          {isListening ? (transcript ? `“${transcript}”` : 'Estou ouvindo… pode falar') : 'Vivavós falando…'}
        </span>
      </div>

      <button
        type="button"
        onClick={isListening ? stopListening : stop}
        className="shrink-0 flex items-center gap-1.5 px-4 min-h-[2.5rem] rounded-full bg-accent text-on-accent font-bold"
      >
        {isListening ? <MicOff className="w-5 h-5" aria-hidden="true" /> : <VolumeX className="w-5 h-5" aria-hidden="true" />}
        <span>{isListening ? 'Parar' : 'Silenciar'}</span>
      </button>
    </aside>
  );
}
