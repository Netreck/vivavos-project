/**
 * Utilitário de compressão e redimensionamento de imagens no cliente.
 * Reduz fotos de câmeras de celular de 5MB-12MB para ~150KB-300KB
 * antes de enviar para a função serverless, acelerando o envio e economizando dados móveis.
 *
 * @param {File | Blob} file - Arquivo de imagem original da câmera ou galeria
 * @param {object} [options] - Opções de redimensionamento
 * @param {number} [options.maxWidth=1280] - Largura máxima em pixels
 * @param {number} [options.maxHeight=1280] - Altura máxima em pixels
 * @param {number} [options.quality=0.8] - Qualidade JPEG (0 a 1)
 * @returns {Promise<{
 *   base64: string,
 *   originalSizeKb: number,
 *   compressedSizeKb: number,
 *   compressionRatio: number
 * }>}
 */
export async function compressImage(file, options = {}) {
  const { maxWidth = 1280, maxHeight = 1280, quality = 0.8 } = options;

  return new Promise((resolve, reject) => {
    const originalSizeKb = Math.round(file.size / 1024);
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Erro ao ler arquivo de imagem.'));

    reader.onload = (e) => {
      const img = new Image();

      img.onerror = () => reject(new Error('Formato de imagem não suportado.'));

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calcula novas dimensões mantendo a proporção original
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Não foi possível inicializar o canvas de compressão.'));
          return;
        }

        // Desenha imagem redimensionada
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Exporta em JPEG otimizado
        const base64 = canvas.toDataURL('image/jpeg', quality);

        // Calcula tamanho aproximado da string base64
        const head = 'data:image/jpeg;base64,';
        const base64Data = base64.startsWith(head) ? base64.substring(head.length) : base64;
        const compressedSizeKb = Math.round((base64Data.length * 3) / 4 / 1024);
        const compressionRatio = Math.round((1 - compressedSizeKb / (originalSizeKb || 1)) * 100);

        resolve({
          base64,
          dataOnly: base64Data,
          width,
          height,
          originalSizeKb,
          compressedSizeKb,
          compressionRatio: Math.max(0, compressionRatio),
        });
      };

      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  });
}
