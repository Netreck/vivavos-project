import React from 'react';
import { ChevronLeft, TriangleAlert } from 'lucide-react';

const BUTTON_VARIANTS = {
  primary: 'bg-primary text-on-primary border-2 border-primary hover:brightness-110',
  accent: 'bg-accent text-on-accent border-2 border-accent hover:brightness-105',
  outline: 'bg-surface text-ink border-2 border-strong hover:bg-page',
  outlinePrimary: 'bg-surface text-primary border-2 border-primary hover:bg-primary-soft',
};

export function Button({ icon: Icon, variant = 'primary', className = '', children, ...props }) {
  return (
    <button
      type="button"
      className={`w-full min-h-[3.25rem] px-5 py-3 rounded-full font-bold text-[1.05rem] flex items-center justify-center gap-2.5 transition active:scale-[0.98] ${BUTTON_VARIANTS[variant]} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-6 h-6 shrink-0" strokeWidth={2.5} aria-hidden="true" />}
      <span>{children}</span>
    </button>
  );
}

export function BackLink({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 -ml-1 mb-3 py-1 text-primary font-bold text-[1rem] hover:underline"
    >
      <ChevronLeft className="w-6 h-6" strokeWidth={2.75} aria-hidden="true" />
      <span>Voltar</span>
    </button>
  );
}

export function Title({ children }) {
  return <h1 className="text-[1.75rem] leading-tight font-bold">{children}</h1>;
}

export function Divider({ strong = false, className = '' }) {
  return <hr className={`border-0 h-0.5 ${strong ? 'bg-strong' : 'bg-line'} ${className}`} />;
}

export function SmallPrint({ children }) {
  return <p className="text-[0.8rem] text-muted">{children}</p>;
}

export function NumberedSection({ n, title, children }) {
  return (
    <section className="flex gap-3 py-4">
      <span
        aria-hidden="true"
        className="shrink-0 w-8 h-8 rounded-md bg-ink text-surface font-bold flex items-center justify-center"
      >
        {n}
      </span>
      <div className="flex-1 min-w-0">
        <h2 className="text-[1.2rem] font-bold leading-snug mb-1">{title}</h2>
        <div className="text-[1rem] leading-relaxed">{children}</div>
      </div>
    </section>
  );
}

export function Notice({ label = 'Atenção:', children }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border-2 border-strong bg-warn-soft">
      <TriangleAlert className="w-6 h-6 shrink-0 mt-0.5" strokeWidth={2.25} aria-hidden="true" />
      <p>
        {label && <strong>{label} </strong>}
        {children}
      </p>
    </div>
  );
}

const PILL_TONES = {
  warn: 'bg-warn-soft border-strong',
  ok: 'bg-ok-soft border-ok',
  neutral: 'bg-page border-line',
};

export function StatusPill({ tone = 'neutral', icon: Icon, children }) {
  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border-2 font-bold text-[0.95rem] ${PILL_TONES[tone]}`}
    >
      {Icon && <Icon className="w-5 h-5" strokeWidth={2.25} aria-hidden="true" />}
      {children}
    </span>
  );
}

/** Moldura cinza com cantos amarelos de "enquadramento", como no design */
export function PhotoFrame({ src, alt, children }) {
  return (
    <div className="relative rounded-lg border-2 border-strong bg-page p-5 flex items-center justify-center min-h-[9rem]">
      {src && <img src={src} alt={alt} className="max-h-48 w-auto rounded-md object-contain" />}
      {children}
      <span aria-hidden="true" className="absolute top-3 left-3 w-6 h-6 border-t-4 border-l-4 border-accent" />
      <span aria-hidden="true" className="absolute top-3 right-3 w-6 h-6 border-t-4 border-r-4 border-accent" />
      <span aria-hidden="true" className="absolute bottom-3 left-3 w-6 h-6 border-b-4 border-l-4 border-accent" />
      <span aria-hidden="true" className="absolute bottom-3 right-3 w-6 h-6 border-b-4 border-r-4 border-accent" />
    </div>
  );
}
