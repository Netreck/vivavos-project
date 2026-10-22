import React, { useState, useRef } from 'react';
import { Header } from './components/Header';
import { AccessibilityBar } from './components/AccessibilityBar';
import { VoiceStatusIndicator } from './components/VoiceStatusIndicator';
import { ConsentModal } from './components/ConsentModal';
import { HomeScreen } from './screens/HomeScreen';
import { PhotoFlow } from './screens/PhotoFlow';
import { useAccessibility } from './hooks/useAccessibility';
import { useTextToSpeech } from './hooks/useTextToSpeech';
import { useVoiceRecognition } from './hooks/useVoiceRecognition';

export function App() {
  const accessibility = useAccessibility();
  const tts = useTextToSpeech(0.85); // Velocidade inicial calma para idosos (0.85x)

  const [hasConsent, setHasConsent] = useState(() => {
    return localStorage.getItem('vivavos-lgpd-consent') === 'true';
  });

  // Fluxo atual: null = tela inicial; { kind: 'medicine' | 'exam', file }
  const [flow, setFlow] = useState(null);
  const pendingKindRef = useRef('medicine');
  const fileInputRef = useRef(null);

  // Handler da tela ativa (início ou fluxo de foto), registrado pela própria tela
  const screenCommandHandlerRef = useRef(null);

  // Manipulador de comandos de voz no nível do App (ex: aceitar consentimento ou pausar)
  const handleVoiceCommand = (command) => {
    if (!hasConsent) {
      if (command.type === 'CONFIRM' || command.text.toLowerCase().includes('concordo')) {
        handleAcceptConsent();
      }
    } else if (command.type === 'SLOWER') {
      tts.decreaseSpeed();
    } else if (command.type === 'FASTER') {
      tts.increaseSpeed();
    } else if (screenCommandHandlerRef.current) {
      screenCommandHandlerRef.current(command);
    }
  };

  const voice = useVoiceRecognition({ onCommand: handleVoiceCommand });

  const handleAcceptConsent = () => {
    localStorage.setItem('vivavos-lgpd-consent', 'true');
    setHasConsent(true);
    tts.speak(
      'Obrigado! Toque em Foto do remédio para a caixa do remédio, ou em Foto do exame para o papel do exame.'
    );
  };

  // Abrir a câmera precisa acontecer dentro de um toque do usuário
  const openCamera = (kind) => {
    pendingKindRef.current = kind;
    fileInputRef.current?.click();
  };

  const handleFileChosen = (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    setFlow({ kind: pendingKindRef.current, file });
  };

  const goHome = () => setFlow(null);

  return (
    <div className="min-h-screen bg-page text-ink font-sans sm:py-8 sm:px-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChosen}
      />

      <div className="mx-auto max-w-[34rem] min-h-screen sm:min-h-0 bg-surface border-t-[6px] border-primary sm:rounded-lg shadow-card overflow-hidden">
        <Header />

        <main className="px-5 sm:px-6 pt-5 pb-6" role="main">
          {flow ? (
            <PhotoFlow
              key={flow.kind}
              kind={flow.kind}
              file={flow.file}
              onRetake={() => openCamera(flow.kind)}
              onHome={goHome}
              tts={tts}
              voice={voice}
              commandHandlerRef={screenCommandHandlerRef}
            />
          ) : (
            <HomeScreen
              onPickPhoto={openCamera}
              tts={tts}
              voice={voice}
              commandHandlerRef={screenCommandHandlerRef}
            />
          )}
        </main>

        <footer className="px-5 sm:px-6 pb-24 sm:pb-6">
          <AccessibilityBar accessibility={accessibility} tts={tts} />
        </footer>
      </div>

      <VoiceStatusIndicator voice={voice} tts={tts} />

      {/* Modal de Consentimento Obrigatório LGPD */}
      <ConsentModal isOpen={!hasConsent} onAccept={handleAcceptConsent} tts={tts} voice={voice} />
    </div>
  );
}

export default App;
