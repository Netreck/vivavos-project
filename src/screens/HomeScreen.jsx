import React, { useEffect, useCallback } from 'react';
import { Camera, FileText, Mic } from 'lucide-react';
import { Button, Divider, SmallPrint } from '../components/ui';

function normalize(text) {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

function ChoiceCard({ icon: Icon, title, subtitle, filled, onClick, ariaLabel }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`text-left rounded-lg p-4 sm:p-5 min-h-[9.5rem] flex flex-col justify-between gap-4 transition active:scale-[0.98] ${
        filled
          ? 'bg-primary text-on-primary border-2 border-primary hover:brightness-110'
          : 'bg-surface text-ink border-2 border-strong hover:bg-page'
      }`}
    >
      <span
        aria-hidden="true"
        className={`w-12 h-12 rounded-full flex items-center justify-center ${
          filled ? 'bg-primary-icon text-on-primary' : 'bg-primary-soft text-primary'
        }`}
      >
        <Icon className="w-6 h-6" strokeWidth={2.25} />
      </span>
      <span>
        <span className="block text-[1.4rem] font-bold leading-tight">{title}</span>
        <span className="block text-[1rem] mt-1 opacity-95">{subtitle}</span>
      </span>
    </button>
  );
}

export function HomeScreen({ onPickPhoto, tts, voice, commandHandlerRef }) {
  const { speak, stop } = tts;

  // Pela voz não dá para abrir a câmera (o navegador exige um toque), então orientamos qual botão tocar
  const handleVoiceCommand = useCallback(
    (command) => {
      const text = normalize(command.text);
      if (text.includes('exame')) {
        speak('Para o exame, toque no botão branco, Foto do exame, e mostre o papel bem de frente.');
      } else if (text.includes('remedio') || text.includes('caixa') || text.includes('bula')) {
        speak('Para o remédio, toque no botão azul, Foto do remédio, e mostre a caixa bem de frente.');
      } else {
        speak('Toque em Foto do remédio para a caixa do remédio, ou em Foto do exame para o papel do exame.');
      }
    },
    [speak]
  );

  useEffect(() => {
    if (!commandHandlerRef) return;
    commandHandlerRef.current = handleVoiceCommand;
    return () => {
      commandHandlerRef.current = null;
    };
  }, [commandHandlerRef, handleVoiceCommand]);

  const handleTalk = () => {
    stop();
    voice.startListening();
  };

  return (
    <div>
      <h1 className="text-[1.75rem] leading-tight font-bold mb-5">O que você quer entender hoje?</h1>

      <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-3 sm:gap-4">
        <ChoiceCard
          filled
          icon={Camera}
          title="Foto do remédio"
          subtitle="Mostre a caixa e eu explico."
          ariaLabel="Foto do remédio. Mostre a caixa e eu explico."
          onClick={() => onPickPhoto('medicine')}
        />
        <ChoiceCard
          icon={FileText}
          title="Foto do exame"
          subtitle="Mostre o papel e eu explico."
          ariaLabel="Foto do exame. Mostre o papel e eu explico."
          onClick={() => onPickPhoto('exam')}
        />
      </div>

      <p className="mt-6 mb-2 text-[0.95rem]">Ou diga: “Vivavós, que remédio é esse?”</p>
      <Button variant="accent" icon={Mic} onClick={handleTalk} className="min-h-[3.75rem] text-[1.25rem]">
        Toque e fale
      </Button>
      {voice.error && (
        <p role="alert" className="mt-2 text-[0.9rem] font-bold text-danger">
          {voice.error}
        </p>
      )}

      <Divider className="mt-6 mb-4" />
      <SmallPrint>Esta página ajuda você a ler. Ela não substitui o médico nem o farmacêutico.</SmallPrint>
    </div>
  );
}
