# 👵👴 Vivavós - Assistente de Saúde Voice-First para a Terceira Idade

O **Vivavós** é uma aplicação web progressiva e responsiva desenvolvida especificamente para pessoas idosas, com foco total em acessibilidade, voz como interface primária (*voice-first*) e regras rígidas de segurança farmacêutica.

---

## 🚀 Arquitetura & Stack

- **Frontend**: React 18, Vite, TailwindCSS (paleta de alto contraste, tipografia ampliada de 20px a 28px e alvos de toque gigantes).
- **Backend Serverless**: Funções Serverless prontas para o **Vercel** sob a pasta [`/api/`](file:///c:/Users/Usuario/Desktop/repositorios-mariana/vivavos/vivavos-project/api).
- **Otimização de Imagens**: Utilitário cliente [`imageCompressor.js`](file:///c:/Users/Usuario/Desktop/repositorios-mariana/vivavos/vivavos-project/src/utils/imageCompressor.js) via HTML5 Canvas (reduz fotos de 5MB-12MB para ~150KB-250KB antes do upload).
- **IA e Visão Computacional**: Arquitetura desacoplada com interface [`VisionProvider`](file:///c:/Users/Usuario/Desktop/repositorios-mariana/vivavos/vivavos-project/api/_lib/vision/VisionProvider.js) e implementação OpenAI Vision ([`OpenAIVisionProvider`](file:///c:/Users/Usuario/Desktop/repositorios-mariana/vivavos/vivavos-project/api/_lib/vision/OpenAIVisionProvider.js)).
- **Bulário Oficial**: Serviço [`anvisaService.js`](file:///c:/Users/Usuario/Desktop/repositorios-mariana/vivavos/vivavos-project/api/_lib/bulario/anvisaService.js) que valida indicações e posologia exclusivamente em fontes oficiais da ANVISA, impedindo alucinações.

---

## 🔒 Regras de Segurança Implementadas

1. **Confirmação Ativa Obrigatória**: Antes de dar qualquer explicação sobre o medicamento, o aplicativo **pergunta em voz alta** o que leu (*"Li Losartana 50 mg, está certo?"*) e só avança se o usuário confirmar por voz ("Sim", "Correto") ou pelo botão verde gigante.
2. **Anti-Adivinhação**: Se a foto estiver borrada, escura ou com nome cortado, o sistema rejeita a leitura e solicita outra foto. Nunca tenta adivinhar.
3. **Fonte Oficial da ANVISA**: Posologia e indicações vêm da bula oficial. Se não encontrar o registro, o aplicativo informa abertamente que não localizou a bula oficial e não inventa.
4. **Aviso Médico Obrigatório**: Todas as respostas alertam que as informações não substituem médicos nem farmacêuticos.
5. **Privacidade e LGPD**: As imagens são descartadas imediatamente após a leitura e exigem consentimento prévio do idoso.

---

## 🎙️ Recursos de Acessibilidade

- **Voz Bidirecional (pt-BR)**: Reconhecimento de voz para comandos (*"Sim"*, *"Não"*, *"Falar mais devagar"*, *"Ouvir de novo"*) e síntese com velocidade padrão ajustada (0.85x).
- **Modo Alto Contraste**: Fundo preto puro (`#000000`), texto branco nítido e realces em amarelo vibrante (`#FFDF00`), ideal para catarata ou baixa visão.
- **Redimensionamento Rápido de Fontes**: Botões `A-` e `A+` para leitura confortável.
- **Bipes Sonoros Sutis**: Retorno auditivo indicando início e fim da escuta do microfone.

---

## ⚙️ Configuração Local e Variáveis de Ambiente

1. Clone ou abra a pasta do projeto:
```bash
cd vivavos-project
```

2. Instale as dependências:
```bash
npm install
```

3. Configure o arquivo `.env`:
```env
OPENAI_API_KEY=sua-chave-openai-aqui
OPENAI_MODEL=gpt-4o-mini
VISION_PROVIDER=openai
```

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

> **Nota:** Caso a chave `OPENAI_API_KEY` ainda não tenha sido configurada, o aplicativo entra automaticamente em **modo demonstrativo seguro**, permitindo testar a experiência de voz, confirmações e interface sem quebras.

---

## ☁️ Deploy no Vercel

O projeto está 100% configurado para o Vercel com [`vercel.json`](file:///c:/Users/Usuario/Desktop/repositorios-mariana/vivavos/vivavos-project/vercel.json):
1. Importe o repositório no dashboard do Vercel.
2. Nas variáveis de ambiente do projeto no Vercel (*Settings* $\rightarrow$ *Environment Variables*), adicione:
   - `OPENAI_API_KEY` = sua chave da OpenAI.
3. Clique em **Deploy**. As rotas `/api/*` se tornarão funções serverless automaticamente.
