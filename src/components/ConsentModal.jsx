import React, { useEffect } from 'react';
import { Check, Lock } from 'lucide-react';
import { Button } from './ui';

export function ConsentModal({ isOpen, onAccept, tts, voice }) {
  const { speak } = tts;
  const { startListening } = voice;

  useEffect(() => {
    if (isOpen) {
      const consentText =
        'Olá! Para sua segurança e privacidade, a foto do remédio ou do exame é analisada na hora e apagada imediatamente. Não guardamos suas fotos. Você concorda em continuar? Diga Concordo ou toque no botão azul.';
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
    >
      <div className="w-full max-w-[30rem] rounded-lg bg-surface text-ink border-t-[6px] border-primary shadow-card p-6">
        <h2 id="consent-title" className="text-[1.5rem] font-bold leading-tight mb-4">
          Antes de começar
        </h2>

        <ul className="space-y-3 mb-6">
          <li className="flex items-start gap-3">
            <Lock className="w-6 h-6 shrink-0 mt-0.5 text-primary" aria-hidden="true" />
            <span>
              A foto do remédio ou do exame é lida na hora e <strong>apagada em seguida</strong>.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <Check className="w-6 h-6 shrink-0 mt-0.5 text-primary" aria-hidden="true" />
            <span>Nenhuma foto ou dado pessoal fica guardado.</span>
          </li>
        </ul>

        <Button icon={Check} onClick={onAccept} aria-label="Concordo e quero continuar">
          Concordo e continuar
        </Button>
        <p className="text-center text-[0.85rem] text-muted mt-3">
          Você também pode dizer: <strong>“Concordo”</strong>
        </p>
      </div>
    </div>
  );
}
