import { useState, useEffect, useCallback } from 'react';

export const MIN_FONT = 16;
export const MAX_FONT = 26;

export function useAccessibility() {
  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem('vivavos-fontsize');
    const parsed = saved ? parseInt(saved, 10) : NaN;
    return parsed >= MIN_FONT && parsed <= MAX_FONT ? parsed : 18; // 18px padrão para terceira idade
  });

  const [highContrast, setHighContrast] = useState(() => {
    const saved = localStorage.getItem('vivavos-highcontrast');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('vivavos-fontsize', fontSize.toString());
    document.documentElement.style.fontSize = `${fontSize}px`;
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('vivavos-highcontrast', highContrast.toString());
    document.documentElement.classList.toggle('high-contrast', highContrast);
  }, [highContrast]);

  const increaseFontSize = useCallback(() => {
    setFontSize((prev) => Math.min(prev + 2, MAX_FONT));
  }, []);

  const decreaseFontSize = useCallback(() => {
    setFontSize((prev) => Math.max(prev - 2, MIN_FONT));
  }, []);

  const toggleHighContrast = useCallback(() => {
    setHighContrast((prev) => !prev);
  }, []);

  return {
    fontSize,
    highContrast,
    increaseFontSize,
    decreaseFontSize,
    toggleHighContrast,
  };
}
