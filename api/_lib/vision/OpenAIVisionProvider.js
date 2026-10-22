import { VisionProvider } from './VisionProvider.js';

export class OpenAIVisionProvider extends VisionProvider {
  constructor(config = {}) {
    super();
    this.apiKey = config.apiKey || process.env.OPENAI_API_KEY;
    this.model = config.model || process.env.OPENAI_MODEL || 'gpt-4o-mini';
    this.baseUrl = config.baseUrl || process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
  }

  /**
   * Garante que a string base64 esteja no formato data:image/...;base64,...
   */
  _formatImageUrl(base64) {
    if (base64.startsWith('data:image/')) {
      return base64;
    }
    return `data:image/jpeg;base64,${base64}`;
  }

  async analyzeMedicineBox(imageBase64) {
    if (!this.apiKey) {
      throw new Error('OPENAI_API_KEY não configurada no ambiente. Adicione sua chave no arquivo .env.');
    }

    const systemPrompt = `Você é um leitor óptico e farmacêutico digital especializado em segurança para idosos.
Sua única tarefa agora é ler a imagem enviada de uma caixa/embalagem de remédio.

REGRAS DE SEGURANÇA E PRECISÃO ESTREITAS:
1. NUNCA ADIVINHE OU CHUTE. Se a foto estiver borrada, com reflexo que impeça ler o nome, cortada, com baixa resolução ou se não for possível ler com 100% de clareza o nome e a dosagem, marque "isLegible": false e explique em linguagem simples e acolhedora em português o motivo (ex: "A foto ficou um pouco embaçada", "Não deu para ler o nome do remédio", "A imagem está muito escura").
2. Se a imagem NÃO for de um medicamento ou caixa de remédio, marque "isLegible": false com motivo "Esta imagem não parece ser de uma caixa de remédio".
3. Se for perfeitamente legível, extraia:
   - medicineName: Nome comercial ou genérico impresso com maior destaque (ex: "Losartana Potássica", "Glifage XR", "Dipirona Monoidratada").
   - dosage: Concentração ou dosagem visível (ex: "50 mg", "500 mg", "20 mg/mL", "10 gotas").
   - form: Forma farmacêutica se visível, em minúsculas e no singular (ex: "comprimido", "cápsula", "gotas", "xarope").
   - activeIngredient: Princípio ativo caso informado (ex: "Losartana Potássica", "Cloridrato de Metformina").
   - laboratory: Laboratório fabricante se visível (ex: "Medley", "EMS", "Eurofarma").
   - confidence: "high" (certeza absoluta), "medium" (legível mas com alguma letra encoberta) ou "low" (duvidoso).
   - Se confidence for "low", obrigatoriamente marque "isLegible": false.

Responda OBRIGATORIAMENTE em JSON válido puro, sem blocos markdown adicionais, no formato:
{
  "isLegible": true/false,
  "confidence": "high" | "medium" | "low",
  "medicineName": string | null,
  "dosage": string | null,
  "form": string | null,
  "activeIngredient": string | null,
  "laboratory": string | null,
  "reasonIfIllegible": string | null
}`;

    const parsed = await this._askJson(
      systemPrompt,
      'Analise a imagem da caixa do remédio com o máximo de precisão e segurança para um idoso.',
      imageBase64,
      300
    );

    return {
      isLegible: Boolean(parsed.isLegible && parsed.confidence !== 'low'),
      confidence: parsed.confidence || 'medium',
      medicineName: parsed.medicineName || null,
      dosage: parsed.dosage || null,
      form: parsed.form || null,
      activeIngredient: parsed.activeIngredient || null,
      laboratory: parsed.laboratory || null,
      reasonIfIllegible: parsed.reasonIfIllegible || (parsed.isLegible ? null : 'Não foi possível ler o nome do remédio com nitidez suficiente.'),
    };
  }

  async analyzeExam(imageBase64) {
    if (!this.apiKey) {
      throw new Error('OPENAI_API_KEY não configurada no ambiente. Adicione sua chave no arquivo .env.');
    }

    const systemPrompt = `Você é um leitor óptico de laudos de exames laboratoriais, focado em segurança para idosos.
Sua única tarefa é TRANSCREVER os resultados impressos na foto. Você NÃO interpreta, NÃO diagnostica e NÃO usa valores de referência da sua memória.

REGRAS ESTRITAS:
1. NUNCA ADIVINHE. Se a foto estiver borrada, cortada, escura ou se algum número não puder ser lido com 100% de clareza, marque "isLegible": false e explique o motivo em português simples e acolhedor.
2. Se a imagem NÃO for um resultado de exame, marque "isLegible": false com motivo "Esta imagem não parece ser o resultado de um exame".
3. Para cada resultado legível (no máximo 6, na ordem em que aparecem), extraia:
   - name: nome do exame como impresso (ex: "Glicemia em jejum", "Colesterol total").
   - value: o resultado como número (use ponto decimal; ex: 112, 5.4). null se não for numérico.
   - valueText: o resultado exatamente como impresso (ex: "112", "5,4", "Negativo").
   - unit: unidade impressa (ex: "mg/dL", "%") ou null.
   - refMin / refMax: limites do VALOR DE REFERÊNCIA IMPRESSO NO LAUDO, como números. Para "até 99" use refMin null e refMax 99; para "maior que 40" use refMin 40 e refMax null.
     Se a referência depender de sexo, idade ou faixa que você não consegue escolher com certeza, use null nos dois.
   - refText: o valor de referência exatamente como impresso, em texto curto (ex: "70 a 99 mg/dL"), ou null se não houver.
4. confidence: "high", "medium" ou "low". Se for "low", marque "isLegible": false.

Responda OBRIGATORIAMENTE em JSON válido puro, no formato:
{
  "isLegible": true/false,
  "confidence": "high" | "medium" | "low",
  "reasonIfIllegible": string | null,
  "tests": [{ "name": string, "value": number | null, "valueText": string, "unit": string | null, "refMin": number | null, "refMax": number | null, "refText": string | null }]
}`;

    const parsed = await this._askJson(
      systemPrompt,
      'Transcreva os resultados deste exame com o máximo de precisão.',
      imageBase64,
      900
    );

    const tests = Array.isArray(parsed.tests) ? parsed.tests.filter((t) => t && t.name && t.valueText).slice(0, 6) : [];
    const isLegible = Boolean(parsed.isLegible && parsed.confidence !== 'low' && tests.length > 0);

    return {
      isLegible,
      confidence: parsed.confidence || 'medium',
      reasonIfIllegible: isLegible
        ? null
        : parsed.reasonIfIllegible || 'Não foi possível ler os resultados do exame com nitidez suficiente.',
      tests: isLegible ? tests : [],
    };
  }

  /**
   * Envia a imagem com o prompt de sistema e devolve a resposta já convertida de JSON.
   */
  async _askJson(systemPrompt, userText, imageBase64, maxTokens) {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              { type: 'text', text: userText },
              {
                type: 'image_url',
                image_url: {
                  url: this._formatImageUrl(imageBase64),
                  detail: 'high',
                },
              },
            ],
          },
        ],
        temperature: 0.1, // Temperatura baixa para respostas factuais e consistentes
        max_tokens: maxTokens,
        response_format: { type: 'json_object' },
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data?.error?.message || `Erro na API OpenAI (${response.status})`;
      throw new Error(errorMsg);
    }

    const rawContent = data?.choices?.[0]?.message?.content;
    if (!rawContent) {
      throw new Error('A IA não retornou resposta para a imagem enviada.');
    }

    try {
      return JSON.parse(rawContent);
    } catch {
      throw new Error('Falha ao processar o formato de resposta da visão.');
    }
  }
}
