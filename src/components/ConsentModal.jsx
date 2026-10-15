import React, { useEffect } from 'react';
import { ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';

export function ConsentModal({ isOpen, onAccept, highContrast, tts, voice }) {
  const { speak } = tts;
  const { startListening } = voice;

  useEffect(() => {
    if (isOpen) {
      const consentText =
        'Olá! Para sua segurança e privacidade, a foto da caixinha do remédio é analisada na hora e apagada imediatamente. Não guardamos suas fotos. Você concorda em continuar? Diga Concordo ou toque no botão verde.';
      speak(consentText, () => {
        // Inicia escuta automaticamente após ler o aviso
        startListening();
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="consent-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <div
        className={`w-full max-w-lg rounded-3xl p-6 sm:p-8 border-4 shadow-2xl transition-all ${
          highContrast
            ? 'bg-black border-yellow-400 text-white'
            : 'bg-white border-blue-600 text-slate-900'
        }`}
      >
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-2xl bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400">
          <ShieldCheck className="w-10 h-10" />
        </div>

        <h2 id="consent-title" className="text-2xl sm:text-3xl font-black text-center mb-4">
          Privacidade e Segurança (LGPD)
        </h2>

        <div className={`space-y-4 text-base sm:text-lg mb-8 leading-relaxed ${highContrast ? 'text-zinc-200' : 'text-slate-700'}`}>
          <div className="flex items-start gap-3">
            <Lock className="w-6 h-6 text-green-600 shrink-0 mt-1" />
            <p>
              A foto do seu remédio é analisada apenas para ler as informações e é <strong>descartada imediatamente</strong>.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0 mt-1" />
            <p>
              Nenhum dado pessoal ou imagem fica armazenado em nossos servidores.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={onAccept}
            aria-label="Concordo e quero continuar"
            className="w-full py-5 px-6 rounded-2xl bg-green-600 hover:bg-green-700 active:scale-98 text-white font-black text-xl sm:text-2xl shadow-lg border-2 border-green-500 transition-all flex items-center justify-center gap-3"
          >
            <CheckCircle2 className="w-7 h-7" />
            <span>CONCORDO E CONTINUAR</span>
          </button>
          <p className="text-center text-sm font-semibold opacity-75 mt-1">
            Você também pode dizer em voz alta: <strong>"Concordo"</strong> ou <strong>"Sim"</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
