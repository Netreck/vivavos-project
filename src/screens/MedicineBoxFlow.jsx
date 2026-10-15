import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  Upload,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Volume2,
  VolumeX,
  FileText,
  ShieldAlert,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { compressImage } from '../utils/imageCompressor';

export function MedicineBoxFlow({ highContrast, tts, voice, hasConsent }) {
  const { speak, stop, isSpeaking, rate } = tts;
  const { startListening, stopListening, isListening } = voice;

  // Estados do fluxo: 'IDLE' | 'PROCESSING' | 'ILLEGIBLE' | 'CONFIRMING' | 'RESULT'
  const [flowState, setFlowState] = useState('IDLE');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [compressionStats, setCompressionStats] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  // Mensagem inicial de acolhimento ao carregar
  useEffect(() => {
    if (hasConsent && flowState === 'IDLE') {
      const welcome =
        'Olá! Eu sou o Vivavós. Toque no botão grande para tirar uma foto bem nítida da frente da caixa do seu remédio.';
      speak(welcome);
    }
  }, [hasConsent]);

  // Manipulação de comandos de voz globais para o fluxo
  const handleVoiceCommand = useCallback(
    (command) => {
      if (flowState === 'CONFIRMING') {
        if (command.type === 'CONFIRM') {
          handleConfirmMedicine();
        } else if (command.type === 'REJECT') {
          handleRejectMedicine();
        }
      } else if (flowState === 'RESULT') {
        if (command.type === 'REPEAT') {
          handleReadBulaAgain();
        } else if (command.type === 'REJECT') {
          handleReset();
        }
      }
    },
    [flowState, analysisResult]
  );

  // Conecta o listener do hook de voz ao comando atual
  useEffect(() => {
    voice.onCommand = handleVoiceCommand;
  }, [voice, handleVoiceCommand]);

  // Processa a foto selecionada pela câmera ou galeria
  const handlePhotoCaptured = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    try {
      setFlowState('PROCESSING');
      setErrorMessage(null);
      stop();

      // Fala acolhedora enquanto processa
      speak('Estou reduzindo e lendo a caixinha do seu remédio. Aguarde um instante...');

      // 1. Redução da imagem no cliente (Canvas API)
      const compressed = await compressImage(file, {
        maxWidth: 1280,
        maxHeight: 1280,
        quality: 0.8,
      });

      setPhotoPreview(compressed.base64);
      setCompressionStats({
        original: compressed.originalSizeKb,
        compressed: compressed.compressedSizeKb,
        ratio: compressed.compressionRatio,
      });

      // 2. Envio para a Serverless Function /api/identify-medicine
      const response = await fetch('/api/identify-medicine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: compressed.base64,
          userConsent: true,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error?.message || 'Falha ao analisar a imagem no servidor.');
      }

      setAnalysisResult(data);

      // Regra 1: Se a imagem não for legível ou estiver borrada -> pede outra foto
      if (!data.isLegible) {
        setFlowState('ILLEGIBLE');
        speak(
          data.voicePrompt ||
            'A foto não ficou nítida o suficiente para ler com certeza. Por favor, tire outra foto com a caixa bem de frente e boa luz.'
        );
        return;
      }

      // Regra 2: Confirmação OBRIGATÓRIA antes de qualquer explicação
      setFlowState('CONFIRMING');
      const confirmationText = data.confirmationPrompt.voiceText;
      speak(confirmationText, () => {
        // Abre o microfone para ouvir "Sim" ou "Não"
        startListening();
      });
    } catch (err) {
      console.error('Erro no processamento da imagem:', err);
      setErrorMessage(err.message || 'Ocorreu um erro ao processar a foto.');
      setFlowState('IDLE');
      speak('Ops, aconteceu um probleminha ao tentar ler a foto. Toque no botão para tentar de novo.');
    } finally {
      // Limpa os inputs de arquivo
      if (cameraInputRef.current) cameraInputRef.current.value = '';
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  // Usuário confirmou que a leitura está correta (por voz ou botão)
  const handleConfirmMedicine = () => {
    stop();
    stopListening();
    setFlowState('RESULT');

    if (!analysisResult) return;

    if (analysisResult.bulaFound && analysisResult.bulaOfficial) {
      const bula = analysisResult.bulaOfficial;
      const speech = `${analysisResult.medicine.name}. Para que serve: ${bula.paraQueServe}. Como tomar segundo a bula oficial: ${bula.comoTomarBula}. Cuidados importantes: ${bula.cuidadosImportantes}. ${bula.avisoObrigatorio}`;
      speak(speech);
    } else {
      const msg =
        analysisResult.bulaMessageIfNotReceived ||
        'Não encontrei a bula oficial deste remédio no registro da Anvisa. Por segurança, consulte seu farmacêutico ou médico.';
      speak(msg);
    }
  };

  // Usuário informou que o nome lido está errado (por voz ou botão)
  const handleRejectMedicine = () => {
    stop();
    stopListening();
    setFlowState('IDLE');
    setAnalysisResult(null);
    setPhotoPreview(null);
    speak('Entendido! Vamos tirar uma nova foto da caixa bem de frente com boa iluminação.');
  };

  // Repete a leitura em voz alta da bula
  const handleReadBulaAgain = () => {
    if (analysisResult && analysisResult.bulaOfficial) {
      const bula = analysisResult.bulaOfficial;
      const speech = `${analysisResult.medicine.name}. Para que serve: ${bula.paraQueServe}. Como tomar segundo a bula oficial: ${bula.comoTomarBula}. Cuidados importantes: ${bula.cuidadosImportantes}. ${bula.avisoObrigatorio}`;
      speak(speech);
    }
  };

  // Reinicia para ler outro medicamento
  const handleReset = () => {
    stop();
    stopListening();
    setFlowState('IDLE');
    setPhotoPreview(null);
    setAnalysisResult(null);
    setErrorMessage(null);
    speak('Pronto para ler outro remédio. Pode tirar a foto!');
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6 sm:py-10">
      {/* Inputs ocultos de câmera e galeria */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handlePhotoCaptured}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handlePhotoCaptured}
      />

      {/* MENSAGEM DE ERRO SE HOUVER */}
      {errorMessage && (
        <div
          role="alert"
          className="mb-6 p-4 rounded-2xl bg-red-100 border-2 border-red-500 text-red-950 font-bold flex items-center gap-3"
        >
          <AlertTriangle className="w-8 h-8 text-red-600 shrink-0" />
          <p className="text-base sm:text-lg">{errorMessage}</p>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ESTADO 1: INÍCIO / PRONTO PARA TIRAR FOTO                           */}
      {/* ==================================================================== */}
      {flowState === 'IDLE' && (
        <div className="flex flex-col items-center text-center space-y-6">
          <div
            className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center border-4 shadow-xl ${
              highContrast
                ? 'bg-zinc-900 border-yellow-400 text-yellow-300'
                : 'bg-blue-100 border-blue-600 text-blue-700'
            }`}
          >
            <Camera className="w-12 h-12 sm:w-16 sm:h-16" />
          </div>

          <div>
            <h2 className="text-2xl sm:text-4xl font-black mb-3">
              Foto da Caixa do Remédio
            </h2>
            <p
              className={`text-lg sm:text-2xl font-medium max-w-xl mx-auto ${
                highContrast ? 'text-zinc-200' : 'text-slate-700'
              }`}
            >
              Tire uma foto bem nítida da frente da caixinha. Vou ler para você e explicar a bula em palavras fáceis.
            </p>
          </div>

          <div className="w-full space-y-4 pt-2">
            {/* Botão Gigante de Câmera */}
            <button
              onClick={() => cameraInputRef.current?.click()}
              aria-label="Tirar foto da caixa do remédio com a câmera"
              className={`w-full py-6 sm:py-8 px-6 rounded-3xl font-black text-2xl sm:text-3xl flex items-center justify-center gap-4 shadow-xl border-4 transition-all active:scale-98 ${
                highContrast
                  ? 'bg-yellow-400 text-black border-yellow-300 hover:bg-yellow-300'
                  : 'bg-[#1351B4] text-white border-blue-800 hover:bg-blue-800'
              }`}
            >
              <Camera className="w-8 h-8 sm:w-10 sm:h-10" />
              <span>TIRAR FOTO AGORA</span>
            </button>

            {/* Botão Secundário de Galeria */}
            <button
              onClick={() => galleryInputRef.current?.click()}
              aria-label="Escolher foto da galeria do celular"
              className={`w-full py-4 px-6 rounded-2xl font-bold text-lg sm:text-xl flex items-center justify-center gap-3 border-2 transition-all active:scale-98 ${
                highContrast
                  ? 'bg-zinc-900 text-white border-zinc-700 hover:bg-zinc-800'
                  : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Upload className="w-6 h-6" />
              <span>Escolher da Galeria de Fotos</span>
            </button>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ESTADO 2: PROCESSANDO / REDUZINDO IMAGEM E ANALISANDO COM IA        */}
      {/* ==================================================================== */}
      {flowState === 'PROCESSING' && (
        <div className="flex flex-col items-center text-center space-y-6 py-8">
          <div className="relative">
            {photoPreview && (
              <img
                src={photoPreview}
                alt="Foto da caixinha enviada"
                className="w-48 h-48 sm:w-64 sm:h-64 object-cover rounded-3xl border-4 border-blue-500 shadow-2xl opacity-80"
              />
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-3xl backdrop-blur-xs">
              <Loader2 className="w-16 h-16 text-yellow-400 animate-spin" />
            </div>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-black mb-2 animate-pulse">
              🔍 Lendo a caixinha do remédio...
            </h2>
            <p className="text-lg sm:text-xl font-medium opacity-90">
              Aguarde alguns segundinhos.
            </p>
          </div>

          {compressionStats && (
            <div
              className={`px-4 py-2 rounded-xl text-sm font-semibold border ${
                highContrast ? 'bg-zinc-900 border-zinc-700 text-zinc-300' : 'bg-slate-100 border-slate-300 text-slate-600'
              }`}
            >
              ⚡ Imagem reduzida no celular: de {compressionStats.original} KB para {compressionStats.compressed} KB (-{compressionStats.ratio}%)
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* ESTADO 3: IMAGEM ILEGÍVEL OU BORRADA (REGRA DE SEGURANÇA 1)          */}
      {/* ==================================================================== */}
      {flowState === 'ILLEGIBLE' && (
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-24 h-24 rounded-full bg-red-100 dark:bg-red-950 text-red-600 border-4 border-red-500 flex items-center justify-center shadow-lg">
            <AlertTriangle className="w-14 h-14" />
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-red-600 dark:text-red-400 mb-3">
              Foto Ilegível ou Embaçada
            </h2>
            <p className="text-lg sm:text-2xl font-bold max-w-lg mx-auto">
              {analysisResult?.reason || 'Não foi possível ler o nome do remédio com 100% de certeza.'}
            </p>
            <p className={`text-base sm:text-lg mt-3 ${highContrast ? 'text-zinc-300' : 'text-slate-600'}`}>
              Por segurança, o Vivavós <strong>nunca adivinha</strong> medicamentos. Por favor, tire outra foto com a caixa bem de frente e em um local iluminado.
            </p>
          </div>

          <div className="w-full pt-4">
            <button
              onClick={() => cameraInputRef.current?.click()}
              aria-label="Tirar outra foto da caixa"
              className={`w-full py-6 px-6 rounded-3xl font-black text-2xl sm:text-3xl flex items-center justify-center gap-4 shadow-xl border-4 transition-all active:scale-98 ${
                highContrast
                  ? 'bg-yellow-400 text-black border-yellow-300 hover:bg-yellow-300'
                  : 'bg-red-600 text-white border-red-700 hover:bg-red-700'
              }`}
            >
              <RotateCcw className="w-8 h-8" />
              <span>TIRAR OUTRA FOTO</span>
            </button>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ESTADO 4: CONFIRMAÇÃO OBRIGATÓRIA ANTES DA EXPLICAÇÃO                */}
      {/* ==================================================================== */}
      {flowState === 'CONFIRMING' && analysisResult?.medicine && (
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-full p-6 sm:p-8 rounded-3xl border-4 shadow-2xl bg-amber-50 dark:bg-zinc-900 border-amber-400 dark:border-yellow-400">
            <p className="text-lg sm:text-xl font-bold uppercase tracking-wider text-amber-800 dark:text-yellow-400 mb-2">
              ⚠️ Confirmação Obrigatória
            </p>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white mb-3">
              {analysisResult.medicine.name}
            </h2>
            {analysisResult.medicine.dosage && (
              <p className="text-2xl sm:text-3xl font-extrabold text-blue-700 dark:text-yellow-300 mb-2">
                Dosagem: {analysisResult.medicine.dosage}
              </p>
            )}
            <p className="text-xl sm:text-2xl font-bold mt-4 pt-4 border-t-2 border-amber-300 dark:border-zinc-700">
              Está certo este remédio?
            </p>
          </div>

          <p className="text-base sm:text-xl font-semibold opacity-90">
            Diga em voz alta <strong>"Sim"</strong> ou <strong>"Não"</strong>, ou toque em um dos botões abaixo:
          </p>

          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Botão SIM */}
            <button
              onClick={handleConfirmMedicine}
              aria-label="Sim, está certo. Continuar para a bula."
              className="py-6 px-6 rounded-3xl bg-green-600 hover:bg-green-700 active:scale-98 text-white font-black text-2xl sm:text-3xl shadow-xl border-4 border-green-500 transition-all flex items-center justify-center gap-3"
            >
              <CheckCircle className="w-9 h-9" />
              <span>SIM, ESTÁ CERTO</span>
            </button>

            {/* Botão NÃO */}
            <button
              onClick={handleRejectMedicine}
              aria-label="Não está certo. Tirar outra foto."
              className="py-6 px-6 rounded-3xl bg-red-600 hover:bg-red-700 active:scale-98 text-white font-black text-2xl sm:text-3xl shadow-xl border-4 border-red-500 transition-all flex items-center justify-center gap-3"
            >
              <XCircle className="w-9 h-9" />
              <span>NÃO, TIRAR OUTRA</span>
            </button>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ESTADO 5: RESULTADO / EXPLICAÇÃO DA BULA OFICIAL ANVISA              */}
      {/* ==================================================================== */}
      {flowState === 'RESULT' && analysisResult && (
        <div className="space-y-6">
          {/* Cabeçalho do Medicamento */}
          <div
            className={`p-6 sm:p-8 rounded-3xl border-4 shadow-xl ${
              highContrast
                ? 'bg-zinc-900 border-yellow-400 text-white'
                : 'bg-white border-blue-600 text-slate-900'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <span className="text-sm sm:text-base font-bold uppercase tracking-wider text-green-600 dark:text-green-400">
                  Medicamento Identificado
                </span>
                <h2 className="text-3xl sm:text-4xl font-black mt-1">
                  {analysisResult.medicine.name} {analysisResult.medicine.dosage || ''}
                </h2>
              </div>
              <button
                onClick={handleReadBulaAgain}
                aria-label="Ouvir tudo novamente em voz alta"
                className={`flex items-center justify-center gap-2 py-3 px-5 rounded-2xl font-black text-lg border-2 shadow transition-all active:scale-95 ${
                  highContrast
                    ? 'bg-yellow-400 text-black border-yellow-300'
                    : 'bg-[#1351B4] text-white border-blue-900 hover:bg-blue-800'
                }`}
              >
                <Volume2 className="w-6 h-6" />
                <span>Ouvir de Novo</span>
              </button>
            </div>

            {analysisResult.bulaFound && analysisResult.bulaOfficial ? (
              <div className="space-y-6 text-lg sm:text-xl">
                {/* 1. Para que serve */}
                <div className="p-4 rounded-2xl bg-blue-50 dark:bg-zinc-800 border-2 border-blue-200 dark:border-zinc-700">
                  <h3 className="font-black text-xl sm:text-2xl text-blue-900 dark:text-yellow-300 mb-2 flex items-center gap-2">
                    <span>🎯</span> Para que serve
                  </h3>
                  <p className="font-medium leading-relaxed">
                    {analysisResult.bulaOfficial.paraQueServe}
                  </p>
                </div>

                {/* 2. Como tomar segundo a bula */}
                <div className="p-4 rounded-2xl bg-green-50 dark:bg-zinc-800 border-2 border-green-200 dark:border-zinc-700">
                  <h3 className="font-black text-xl sm:text-2xl text-green-900 dark:text-green-400 mb-2 flex items-center gap-2">
                    <span>💊</span> Como tomar (Bula Oficial)
                  </h3>
                  <p className="font-medium leading-relaxed">
                    {analysisResult.bulaOfficial.comoTomarBula}
                  </p>
                </div>

                {/* 3. Cuidados importantes */}
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-zinc-800 border-2 border-amber-200 dark:border-zinc-700">
                  <h3 className="font-black text-xl sm:text-2xl text-amber-900 dark:text-amber-400 mb-2 flex items-center gap-2">
                    <span>⚠️</span> Cuidados Importantes
                  </h3>
                  <p className="font-medium leading-relaxed">
                    {analysisResult.bulaOfficial.cuidadosImportantes}
                  </p>
                </div>

                {/* 4. Fonte oficial da ANVISA */}
                <div className="flex items-center gap-2 text-sm sm:text-base font-bold opacity-80 pt-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span>Fonte Oficial: {analysisResult.bulaOfficial.fonte} ({analysisResult.bulaOfficial.registroAnvisa})</span>
                </div>
              </div>
            ) : (
              // Bula não encontrada na fonte oficial (Regra estrita)
              <div className="p-6 rounded-2xl bg-amber-100 border-2 border-amber-500 text-amber-950 font-bold space-y-2">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-8 h-8 text-amber-600 shrink-0" />
                  <h3 className="text-xl font-black">Bula Oficial Não Localizada</h3>
                </div>
                <p className="text-base sm:text-lg">
                  {analysisResult.bulaMessageIfNotReceived ||
                    'Não encontramos a bula deste medicamento nos registros oficiais da Anvisa. Por segurança, não fornecemos posologia sem fonte oficial garantida.'}
                </p>
              </div>
            )}

            {/* Aviso Obrigatório Médico e Farmacêutico */}
            <div
              role="note"
              className="mt-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/50 border-2 border-red-400 dark:border-red-600 text-red-950 dark:text-red-200 font-bold text-base sm:text-lg flex items-start gap-3"
            >
              <ShieldAlert className="w-7 h-7 text-red-600 shrink-0 mt-0.5" />
              <p>
                Aviso de Segurança: Estas informações são da bula oficial e NÃO substituem as orientações do seu médico ou farmacêutico. Nunca mude sua dose por conta própria.
              </p>
            </div>
          </div>

          {/* Botão de Ler Outro Medicamento */}
          <button
            onClick={handleReset}
            aria-label="Tirar foto de outro remédio"
            className={`w-full py-5 px-6 rounded-3xl font-black text-2xl sm:text-3xl flex items-center justify-center gap-4 shadow-xl border-4 transition-all active:scale-98 ${
              highContrast
                ? 'bg-yellow-400 text-black border-yellow-300 hover:bg-yellow-300'
                : 'bg-[#1351B4] text-white border-blue-900 hover:bg-blue-800'
            }`}
          >
            <Camera className="w-8 h-8" />
            <span>LER OUTRO REMÉDIO</span>
          </button>
        </div>
      )}
    </div>
  );
}
