import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { VoiceStatusIndicator } from './components/VoiceStatusIndicator';
import { ConsentModal } from './components/ConsentModal';
import { MedicineBoxFlow } from './screens/MedicineBoxFlow';
import { useAccessibility } from './hooks/useAccessibility';
import { useTextToSpeech } from './hooks/useTextToSpeech';
import { useVoiceRecognition } from './hooks/useVoiceRecognition';

export function App() {
  const accessibility = useAccessibility();
  const tts = useTextToSpeech(0.85); // Velocidade inicial calma para idosos (0.85x)

  const [hasConsent, setHasConsent] = useState(() => {
    return localStorage.getItem('vivavos-lgpd-consent') === 'true';
  });

  // Manipulador de comandos de voz no nível do App (ex: aceitar consentimento ou pausar)
  const handleVoiceCommand = (command) => {
    if (!hasConsent && (command.type === 'CONFIRM' || command.text.toLowerCase().includes('concordo'))) {
      handleAcceptConsent();
    } else if (command.type === 'SLOWER') {
      tts.decreaseSpeed();
    } else if (command.type === 'FASTER') {
      tts.increaseSpeed();
    }
  };

  const voice = useVoiceRecognition({ onCommand: handleVoiceCommand });

  const handleAcceptConsent = () => {
    localStorage.setItem('vivavos-lgpd-consent', 'true');
    setHasConsent(true);
    tts.speak('Consentimento confirmado. Bem-vindo ao Vivavós!');
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 ${
        accessibility.highContrast ? 'bg-black text-white' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Barra de Topo com Controles de Acessibilidade */}
      <Header accessibility={accessibility} tts={tts} />

      {/* Indicador de Voz e Microfone (Visual + Feedback) */}
      <VoiceStatusIndicator
        voice={voice}
        tts={tts}
        highContrast={accessibility.highContrast}
      />

      {/* Modal de Consentimento Obrigatório LGPD */}
      <ConsentModal
        isOpen={!hasConsent}
        onAccept={handleAcceptConsent}
        highContrast={accessibility.highContrast}
        tts={tts}
        voice={voice}
      />

      {/* Fluxo Central do MVP: Leitura de Caixa de Remédio */}
      <main className="flex-1 flex flex-col justify-center pb-12" role="main">
        <MedicineBoxFlow
          highContrast={accessibility.highContrast}
          tts={tts}
          voice={voice}
          hasConsent={hasConsent}
        />
      </main>

      {/* Rodapé Acessível */}
      <footer
        className={`w-full py-4 px-4 text-center text-sm font-semibold border-t-2 ${
          accessibility.highContrast
            ? 'bg-zinc-950 border-zinc-800 text-zinc-400'
            : 'bg-slate-100 border-slate-200 text-slate-600'
        }`}
      >
        <p>Vivavós • Feito com acessibilidade para você • Dados da Bula Oficial da ANVISA</p>
      </footer>
    </div>
  );
}

export default App;
