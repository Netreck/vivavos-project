import React from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

export function VoiceStatusIndicator({ voice, tts, highContrast }) {
  const { isListening, startListening, stopListening, transcript } = voice;
  const { isSpeaking, stop } = tts;

  return (
    <aside
      aria-label="Status de voz e microfone"
      className={`w-full py-3 px-4 border-b-2 transition-colors ${
        highContrast
          ? 'bg-zinc-900 border-yellow-400 text-yellow-300'
          : 'bg-blue-50 border-blue-200 text-blue-950'
      }`}
    >
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        {/* Indicador de Status Visual */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {isSpeaking ? (
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-bold">
              <span className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-green-600"></span>
              </span>
              <span className="text-base sm:text-lg truncate">🔊 Vivavós falando...</span>
            </div>
          ) : isListening ? (
            <div className="flex items-center gap-2 text-blue-700 dark:text-yellow-300 font-bold">
              <div className="flex items-center gap-1 h-5">
                <span className="w-1.5 h-3 bg-red-600 rounded-full animate-voice-1"></span>
                <span className="w-1.5 h-5 bg-red-600 rounded-full animate-voice-2"></span>
                <span className="w-1.5 h-3 bg-red-600 rounded-full animate-voice-3"></span>
              </div>
              <span className="text-base sm:text-lg truncate">
                {transcript ? `"${transcript}"` : '🎤 Estou ouvindo... Pode falar!'}
              </span>
            </div>
          ) : (
            <div className="text-sm sm:text-base font-semibold opacity-90 truncate">
              {transcript ? (
                <span>Você falou: "{transcript}"</span>
              ) : (
                <span>Toque no microfone ou fale a qualquer momento</span>
              )}
            </div>
          )}
        </div>

        {/* Botão de Controle Rápido do Microfone / Parar Fala */}
        <div className="flex items-center gap-2 shrink-0">
          {isSpeaking && (
            <button
              onClick={stop}
              aria-label="Silenciar fala agora"
              className="px-3 py-1.5 rounded-lg bg-red-600 text-white font-bold text-sm flex items-center gap-1 active:scale-95 shadow"
            >
              <VolumeX className="w-4 h-4" />
              <span>Silenciar</span>
            </button>
          )}

          <button
            onClick={isListening ? stopListening : startListening}
            aria-label={isListening ? 'Desativar microfone' : 'Ativar microfone para falar'}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl font-extrabold text-base transition-all active:scale-95 shadow ${
              isListening
                ? 'bg-red-600 text-white hover:bg-red-700 animate-pulse'
                : highContrast
                ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                : 'bg-[#1351B4] text-white hover:bg-blue-800'
            }`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            <span className="hidden sm:inline">{isListening ? 'Parar de Ouvir' : 'Falar'}</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
