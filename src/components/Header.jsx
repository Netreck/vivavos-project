import React from 'react';
import { AudioLines } from 'lucide-react';

export function Header() {
  return (
    <header role="banner" className="flex items-center justify-between gap-3 px-5 sm:px-6 py-3.5 border-b-2 border-strong">
      <div className="flex items-center gap-2.5">
        <span className="w-9 h-9 rounded-md bg-primary flex items-center justify-center" aria-hidden="true">
          <AudioLines className="w-5 h-5 text-logo-wave" strokeWidth={2.5} />
        </span>
        <span className="text-[1.3rem] font-bold">Vivavós</span>
      </div>
      <p className="text-[0.8rem] text-muted text-right">Informação para o paciente</p>
    </header>
  );
}
