import React from 'react';
import { Contrast } from 'lucide-react';
import { MIN_FONT, MAX_FONT } from '../hooks/useAccessibility';

const chip =
  'min-h-[2.5rem] min-w-[2.5rem] px-3 rounded-full border-2 border-line font-bold hover:border-strong disabled:opacity-40 transition';

export function AccessibilityBar({ accessibility, tts }) {
  const { highContrast, toggleHighContrast, increaseFontSize, decreaseFontSize, fontSize } = accessibility;
  const { rate, increaseSpeed, decreaseSpeed } = tts;

  return (
    <div
      role="toolbar"
      aria-label="Ajustes de leitura"
      className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-4 border-t-2 border-line text-[0.85rem]"
    >
      <div className="flex items-center gap-1.5">
        <span className="text-muted mr-0.5">Letra</span>
        <button className={chip} onClick={decreaseFontSize} disabled={fontSize <= MIN_FONT} aria-label="Diminuir tamanho da letra">
          A−
        </button>
        <button className={chip} onClick={increaseFontSize} disabled={fontSize >= MAX_FONT} aria-label="Aumentar tamanho da letra">
          A+
        </button>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="text-muted mr-0.5">Voz</span>
        <button className={chip} onClick={decreaseSpeed} disabled={rate <= 0.6} aria-label="Falar mais devagar">
          −
        </button>
        <span className="tabular-nums w-11 text-center" aria-label={`Velocidade ${Number(rate.toFixed(2))}`}>
          {Number(rate.toFixed(2))}x
        </span>
        <button className={chip} onClick={increaseSpeed} disabled={rate >= 1.3} aria-label="Falar mais rápido">
          +
        </button>
      </div>

      <button
        className={`${chip} flex items-center gap-1.5 ${highContrast ? 'bg-primary text-on-primary border-primary' : ''}`}
        onClick={toggleHighContrast}
        aria-pressed={highContrast}
      >
        <Contrast className="w-4 h-4" aria-hidden="true" />
        <span>Alto contraste</span>
      </button>
    </div>
  );
}
