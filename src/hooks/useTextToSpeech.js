import { useState, useEffect, useCallback, useRef } from 'react';

// Vozes brasileiras mais naturais primeiro (Edge, Chrome, Windows, Apple)
const PREFERRED_PT_BR_VOICES = ['Francisca', 'Thalita', 'Antonio', 'Google', 'Luciana', 'Maria', 'Daniel', 'Felipe'];

/**
 * Escolhe uma voz do português do Brasil. Nunca devolve voz de Portugal (pt-PT).
 */
export function pickBrazilianVoice(voices) {
  const ptBr = voices.filter((v) => v.lang.replace('_', '-').toLowerCase() === 'pt-br');
  if (ptBr.length === 0) return null;
  for (const name of PREFERRED_PT_BR_VOICES) {
    const match = ptBr.find((v) => v.name.includes(name));
    if (match) return match;
  }
  return ptBr[0];
}

export function useTextToSpeech(initialRate = 0.85) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [rate, setRate] = useState(() => {
    const saved = localStorage.getItem('vivavos-speech-rate');
    return saved ? parseFloat(saved) : initialRate;
  });
  const currentUtteranceRef = useRef(null);

  useEffect(() => {
    if (!window.speechSynthesis) {
      setIsSupported(false);
      return;
    }
    // No Chrome a lista de vozes chega depois; pedir de novo garante que ela esteja pronta na primeira fala
    const loadVoices = () => window.speechSynthesis.getVoices();
    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
  }, []);

  useEffect(() => {
    localStorage.setItem('vivavos-speech-rate', rate.toString());
  }, [rate]);

  const speak = useCallback(
    (text, onEndCallback) => {
      if (!window.speechSynthesis || !text) return;

      // Cancela fala anterior
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = rate; // Ajustado para compreensão de idosos
      utterance.pitch = 1.0;

      // Usa somente vozes do português do Brasil; sem nenhuma, o navegador escolhe pelo lang pt-BR
      const ptBrVoice = pickBrazilianVoice(window.speechSynthesis.getVoices());
      if (ptBrVoice) {
        utterance.voice = ptBrVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        if (onEndCallback) onEndCallback();
      };

      utterance.onerror = (e) => {
        console.warn('Erro na síntese de fala:', e);
        setIsSpeaking(false);
      };

      currentUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [rate]
  );

  const stop = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const increaseSpeed = useCallback(() => {
    setRate((prev) => {
      const next = Math.min(Number((prev + 0.1).toFixed(2)), 1.3);
      return next;
    });
  }, []);

  const decreaseSpeed = useCallback(() => {
    setRate((prev) => {
      const next = Math.max(Number((prev - 0.1).toFixed(2)), 0.6);
      return next;
    });
  }, []);

  return {
    speak,
    stop,
    isSpeaking,
    isSupported,
    rate,
    setRate,
    increaseSpeed,
    decreaseSpeed,
  };
}
