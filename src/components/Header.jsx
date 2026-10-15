import React from 'react';
import { Sun, Moon, Volume2, Type, RefreshCw } from 'lucide-react';

export function Header({ accessibility, tts }) {
  const { highContrast, toggleHighContrast, increaseFontSize, decreaseFontSize, fontSize } = accessibility;
  const { rate, increaseSpeed, decreaseSpeed } = tts;

  return (
    <header
      role="banner"
      className={`w-full py-4 px-4 sm:px-8 border-b-4 transition-colors ${
        highContrast
          ? 'bg-black border-yellow-400 text-white'
          : 'bg-[#1351B4] border-blue-900 text-white shadow-md'
      }`}
    >
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Nome do Aplicativo */}
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wide flex items-center justify-center sm:justify-start gap-2">
            <span>👵👴</span>
            <span>Vivavós</span>
          </h1>
          <p className={`text-sm sm:text-base font-medium mt-0.5 ${highContrast ? 'text-yellow-300' : 'text-blue-100'}`}>
            Saúde explicada por voz
          </p>
        </div>

        {/* Barra de Acessibilidade */}
        <div className="flex flex-wrap items-center justify-center gap-2" role="toolbar" aria-label="Controles de acessibilidade">
          {/* Alto Contraste */}
          <button
            onClick={toggleHighContrast}
            aria-label={highContrast ? 'Desativar alto contraste' : 'Ativar alto contraste'}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-base border-2 transition-all active:scale-95 ${
              highContrast
                ? 'bg-yellow-400 text-black border-yellow-300 hover:bg-yellow-300'
                : 'bg-white/10 text-white border-white/30 hover:bg-white/20'
            }`}
          >
            {highContrast ? <Sun className="w-5 h-5 text-black" /> : <Moon className="w-5 h-5" />}
            <span className="text-sm sm:text-base">{highContrast ? 'Contraste Normal' : 'Alto Contraste'}</span>
          </button>

          {/* Tamanho da Letra */}
          <div className="flex items-center rounded-xl overflow-hidden border-2 border-white/30 bg-white/10">
            <button
              onClick={decreaseFontSize}
              disabled={fontSize <= 18}
              aria-label="Diminuir tamanho da letra"
              className="px-3 py-2 font-black text-lg hover:bg-white/20 disabled:opacity-40 transition-colors"
            >
              A-
            </button>
            <span className="px-2 font-bold text-sm" aria-hidden="true">
              Letra
            </span>
            <button
              onClick={increaseFontSize}
              disabled={fontSize >= 28}
              aria-label="Aumentar tamanho da letra"
              className="px-3 py-2 font-black text-xl hover:bg-white/20 disabled:opacity-40 transition-colors"
            >
              A+
            </button>
          </div>

          {/* Velocidade da Voz */}
          <div className="flex items-center rounded-xl overflow-hidden border-2 border-white/30 bg-white/10">
            <button
              onClick={decreaseSpeed}
              disabled={rate <= 0.6}
              aria-label="Falar mais devagar"
              title="Voz mais devagar"
              className="px-2.5 py-2 font-bold hover:bg-white/20 disabled:opacity-40 transition-colors"
            >
              🐢
            </button>
            <span className="px-1.5 text-xs sm:text-sm font-semibold" title="Velocidade da fala">
              {rate.toFixed(1)}x
            </span>
            <button
              onClick={increaseSpeed}
              disabled={rate >= 1.3}
              aria-label="Falar mais rápido"
              title="Voz mais rápida"
              className="px-2.5 py-2 font-bold hover:bg-white/20 disabled:opacity-40 transition-colors"
            >
              🐇
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
