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
        const lower = text.toLowerCase().trim();

        // Análise de comandos de voz simples e intuitivos para idosos
        if (
          lower.includes('sim') ||
          lower.includes('certo') ||
          lower.includes('correto') ||
          lower.includes('confirmo') ||
          lower.includes('pode') ||
          lower.includes('isso')
        ) {
          onCommandRef.current({ type: 'CONFIRM', text });
        } else if (
          lower.includes('não') ||
          lower.includes('nao') ||
          lower.includes('errado') ||
          lower.includes('outra') ||
          lower.includes('tirar outra') ||
          lower.includes('cancelar')
        ) {
          onCommandRef.current({ type: 'REJECT', text });
        } else if (lower.includes('devagar') || lower.includes('lento') || lower.includes('menos')) {
          onCommandRef.current({ type: 'SLOWER', text });
        } else if (lower.includes('rápido') || lower.includes('rapido') || lower.includes('mais rápido')) {
          onCommandRef.current({ type: 'FASTER', text });
        } else if (
          lower.includes('repetir') ||
          lower.includes('de novo') ||
          lower.includes('denovo') ||
          lower.includes('ouvir') ||
          lower.includes('ler')
        ) {
          onCommandRef.current({ type: 'REPEAT', text });
        } else {
          onCommandRef.current({ type: 'SPEECH', text });
        }
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
