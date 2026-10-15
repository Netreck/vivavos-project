import { useState, useEffect, useCallback } from 'react';

export function useAccessibility() {
  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem('vivavos-fontsize');
    return saved ? parseInt(saved, 10) : 20; // 20px padrão para terceira idade
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
    if (highContrast) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.remove('high-contrast');
    }
  }, [highContrast]);

  const increaseFontSize = useCallback(() => {
    setFontSize((prev) => Math.min(prev + 2, 28));
  }, []);

  const decreaseFontSize = useCallback(() => {
    setFontSize((prev) => Math.max(prev - 2, 18));
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
