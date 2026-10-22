/**
 * Interface base para provedores de Visão Computacional.
 * Permite trocar a OpenAI por Anthropic, Gemini, Ollama ou qualquer outro provedor
 * sem alterar a lógica de negócios da aplicação.
 */
export class VisionProvider {
  /**
   * Analisa a foto de uma embalagem/caixa de medicamento.
   * @param {string} imageBase64 - Imagem em formato base64 (com ou sem data:image prefix)
   * @returns {Promise<{
   *   isLegible: boolean,
   *   medicineName: string | null,
   *   dosage: string | null,
   *   activeIngredient: string | null,
   *   laboratory: string | null,
   *   confidence: 'high' | 'medium' | 'low',
   *   reasonIfIllegible: string | null
   * }>}
   */
  async analyzeMedicineBox(imageBase64) {
    throw new Error('Método analyzeMedicineBox não implementado pelo provedor de visão');
  }

  /**
   * Analisa a foto de um exame laboratorial (fluxo futuro).
   */
  async analyzeExam(imageBase64) {
    throw new Error('Método analyzeExam não implementado pelo provedor de visão');
  }
}
