import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Emite um bipe suave usando a Web Audio API para dar retorno tátil/sonoro ao idoso
 * de que o microfone abriu ou fechou.
 */
function playAudioCue(freq = 440, duration = 0.12) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Falha silenciosa caso áudio seja bloqueado antes da primeira interação
  }
}

/**
 * Classifica a fala do idoso em um comando simples.
 * A negação é verificada ANTES da confirmação: "não está certo" precisa virar REJECT,
 * nunca CONFIRM. As palavras são comparadas inteiras (sem acento) para evitar falsos
 * positivos como "assim" contendo "sim".
 */
export function classifyCommand(text) {
  const normalized = (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
  const has = (...words) => words.some((w) => new RegExp(`\\b${w}\\b`).test(normalized));

  if (has('nao', 'errado', 'errada', 'outra', 'cancelar', 'cancela')) return 'REJECT';
  if (has('sim', 'certo', 'certa', 'correto', 'correta', 'confirmo', 'pode', 'isso')) return 'CONFIRM';
  if (has('devagar', 'lento', 'menos')) return 'SLOWER';
  if (has('rapido')) return 'FASTER';
  if (has('repetir', 'repete', 'de novo', 'denovo', 'ouvir', 'ler')) return 'REPEAT';
  return 'SPEECH';
}

export function useVoiceRecognition(options = {}) {
  const { onCommand } = options;
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef(null);
  const onCommandRef = useRef(onCommand);

  useEffect(() => {
    onCommandRef.current = onCommand;
  }, [onCommand]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setError('O microfone não é suportado pelo seu navegador atual. Use o Google Chrome ou Microsoft Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      playAudioCue(580, 0.1); // Bipe de início
    };

    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const text = event.results[current][0].transcript;
      setTranscript(text);

      const isFinal = event.results[current].isFinal;
      if (isFinal && onCommandRef.current) {
        onCommandRef.current({ type: classifyCommand(text), text });
      }
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      playAudioCue(320, 0.15); // Bipe baixo de aviso
      if (event.error === 'not-allowed') {
        setError('Por favor, autorize o microfone para conversar por voz.');
      } else if (event.error === 'no-speech') {
        setError('Não ouvi nada. Pode falar novamente bem pertinho do celular?');
      } else {
        setError('Não consegui entender com clareza. Pode repetir?');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      setError(null);
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.warn('Microfone já ativo ou erro ao iniciar:', e);
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setError(null);
  }, []);

  return {
    isListening,
    transcript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  };
}
