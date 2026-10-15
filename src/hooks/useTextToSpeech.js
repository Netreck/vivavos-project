import { useState, useEffect, useCallback, useRef } from 'react';

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
    }
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

      // Tenta selecionar voz pt-BR natural se houver
      const voices = window.speechSynthesis.getVoices();
      const ptVoice = voices.find((v) => v.lang.startsWith('pt') && (v.name.includes('Google') || v.name.includes('Luciana') || v.name.includes('Maria') || v.name.includes('Francisca')));
      if (ptVoice) {
        utterance.voice = ptVoice;
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
