import React, { useState } from 'react';
// Material Icons reemplazan Lucide


interface PublicHeaderProps {
  active?: 'inventario' | 'vender';
  ctaLabel?: string;
  ctaHref?: string;
  offsetDesktop?: boolean;
}

export const PublicHeader: React.FC<PublicHeaderProps> = ({
  active = 'inventario',
  ctaLabel = 'Ingresar',
  ctaHref = '/login',
  offsetDesktop = false,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const shellClass = offsetDesktop
    ? 'fixed inset-x-0 top-0 lg:left-[336px] lg:w-[calc(100%-336px)]'
    : 'fixed inset-x-0 top-0';

  const linkClass = (isActive: boolean) =>
    `rounded-full px-4 py-2 transition-all ${isActive ? 'bg-on-surface text-white shadow-[0_8px_24px_rgba(17,28,45,0.16)]' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`;

  return (
    <header className={`${shellClass} z-50 bg-white/72 backdrop-blur-2xl`}>
      <div className="mx-auto max-w-7xl px-5 pb-3 pt-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 rounded-[1.6rem] border border-white/70 bg-white/82 px-4 py-3 shadow-[0_16px_48px_rgba(17,28,45,0.08)]">
          <a href="/" className="min-w-0 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-[1.2rem] bg-[linear-gradient(135deg,#111c2d_0%,#1d2d4f_100%)] text-primary shadow-[0_12px_30px_rgba(17,28,45,0.18)]">
              <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>directions_car</span>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.34em] text-on-surface-variant">MILLCARS</p>
              <p className="truncate text-base font-semibold tracking-[-0.03em] text-on-surface">Showroom IA</p>
            </div>
          </a>

          <nav className="hidden md:flex items-center rounded-full border border-slate-200 bg-slate-50/85 p-1.5 text-sm font-medium">
            <a href="/" className={linkClass(active === 'inventario')}>
              Inventario
            </a>
            <a href="/vender" className={linkClass(active === 'vender')}>
              Vender
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={ctaHref}
              className="hidden sm:inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-on-primary shadow-[0_14px_30px_rgba(0,71,255,0.24)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(0,71,255,0.3)] active:translate-y-0"
            >
              {ctaLabel}
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </a>
            <button
              type="button"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              onClick={() => setMobileMenuOpen((value) => !value)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-on-surface transition-colors hover:bg-slate-50 md:hidden"
            >
              <span className="material-symbols-outlined text-xl">{mobileMenuOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="mx-auto max-w-7xl px-5 pb-4 sm:px-6 lg:px-8 md:hidden">
          <div className="rounded-[1.4rem] border border-white/70 bg-white/92 p-4 shadow-[0_18px_48px_rgba(17,28,45,0.1)]">
            <div className="flex flex-col gap-2 text-sm font-medium">
              <a href="/" className={linkClass(active === 'inventario')} onClick={() => setMobileMenuOpen(false)}>
                Inventario
              </a>
              <a href="/vender" className={linkClass(active === 'vender')} onClick={() => setMobileMenuOpen(false)}>
                Vender
              </a>
            </div>
            <a
              href={ctaHref}
              onClick={() => setMobileMenuOpen(false)}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-on-primary shadow-[0_14px_30px_rgba(0,71,255,0.24)]"
            >
              {ctaLabel}
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
