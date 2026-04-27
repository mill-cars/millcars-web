import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface PublicHeaderProps {
  active?: 'inventario' | 'cotizar' | 'catalogo';
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
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { user, profile, signOut } = useAuth();

  const avatarUrl: string | undefined =
    (user?.user_metadata?.avatar_url as string | undefined) ??
    (user?.user_metadata?.picture as string | undefined);

  const displayName: string =
    (user?.user_metadata?.full_name as string | undefined) ??
    (user?.user_metadata?.name as string | undefined) ??
    user?.email ??
    '';

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const shellClass = offsetDesktop
    ? 'fixed inset-x-0 top-0 lg:left-[336px] lg:w-[calc(100%-336px)]'
    : 'fixed inset-x-0 top-0';

  const linkClass = (isActive: boolean) =>
    `rounded-full px-4 py-2 font-bold transition-all ${isActive ? 'bg-secondary text-white shadow-[0_8px_24px_rgba(17,28,45,0.16)]' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`;

  const handleSignOut = async () => {
    setUserMenuOpen(false);
    await signOut();
    window.location.href = '/';
  };

  return (
    <header className={`${shellClass} z-50 bg-white/72 backdrop-blur-2xl`}>
      <div className="mx-auto max-w-7xl px-5 pb-3 pt-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 rounded-[1.6rem] border border-white/70 bg-white/82 px-4 py-3 shadow-[0_16px_48px_rgba(17,28,45,0.08)]">
          <a href="/" className="relative flex items-center shrink-0 h-10 w-40">
              <img 
                src="/assets/millcars-logo.png" 
                alt="Millcars" 
                className="absolute top-1/2 -translate-y-1/2 left-0 h-36 w-auto max-w-none object-contain" 
              />
          </a>

          <nav className="hidden md:flex items-center rounded-full border border-slate-200 bg-slate-50/85 p-1.5 text-sm font-medium">
            <a href="/catalogo" className={linkClass(active === 'inventario' || active === 'catalogo')}>
              Catálogo
            </a>
            <a href="/cotizar" className={linkClass(active === 'cotizar')}>
              Vender
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              /* ── Authenticated: show avatar + dropdown ── */
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="hidden sm:flex items-center gap-2.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 transition-all hover:border-primary/30 hover:shadow-md"
                  aria-label="Menú de usuario"
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      referrerPolicy="no-referrer"
                      className="h-8 w-8 rounded-full object-cover ring-2 ring-primary/20"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-on-primary text-xs font-bold">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="max-w-[120px] truncate text-sm font-semibold text-on-surface">
                    {displayName.split(' ')[0]}
                  </span>
                  <span className="material-symbols-outlined text-base text-slate-400">
                    {userMenuOpen ? 'expand_less' : 'expand_more'}
                  </span>
                </button>

                {/* Dropdown menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden z-[200]">
                    <div className="px-4 py-3 border-b border-slate-100">
                      {avatarUrl && (
                        <img
                          src={avatarUrl}
                          alt={displayName}
                          referrerPolicy="no-referrer"
                          className="h-10 w-10 rounded-full object-cover mb-2"
                        />
                      )}
                      <p className="text-sm font-bold text-on-surface truncate">{displayName}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                    <div className="p-2">
                      {profile?.role !== 'cliente' && (
                        <a
                          href="/admin"
                          className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-on-surface hover:bg-slate-50 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <span className="material-symbols-outlined text-base text-primary">admin_panel_settings</span>
                          Panel de administración
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <span className="material-symbols-outlined text-base">logout</span>
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* ── Not authenticated: show CTA button ── */
              <a
                href={ctaHref}
                className="hidden sm:inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-on-primary shadow-[0_14px_30px_rgba(0,71,255,0.24)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(0,71,255,0.3)] active:translate-y-0"
              >
                {ctaLabel}
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </a>
            )}

            {/* Mobile hamburger */}
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

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="mx-auto max-w-7xl px-5 pb-4 sm:px-6 lg:px-8 md:hidden">
          <div className="rounded-[1.4rem] border border-white/70 bg-white/92 p-4 shadow-[0_18px_48px_rgba(17,28,45,0.1)]">
            {/* Mobile user info */}
            {user && (
              <div className="mb-3 flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    referrerPolicy="no-referrer"
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-on-primary text-xs font-bold">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-bold text-on-surface truncate">{displayName}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2 text-sm font-medium">
              <a href="/catalogo" className={linkClass(active === 'inventario' || active === 'catalogo')} onClick={() => setMobileMenuOpen(false)}>
                Catálogo
              </a>
              <a href="/cotizar" className={linkClass(active === 'cotizar')} onClick={() => setMobileMenuOpen(false)}>
                Vender
              </a>
            </div>

            {user ? (
              <div className="mt-3 flex flex-col gap-2">
                {profile?.role !== 'cliente' && (
                  <a
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-on-primary"
                  >
                    <span className="material-symbols-outlined text-base">admin_panel_settings</span>
                    Panel de administración
                  </a>
                )}
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-red-200 px-4 py-3 text-sm font-semibold text-red-600"
                >
                  <span className="material-symbols-outlined text-base">logout</span>
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <a
                href={ctaHref}
                onClick={() => setMobileMenuOpen(false)}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-on-primary shadow-[0_14px_30px_rgba(0,71,255,0.24)]"
              >
                {ctaLabel}
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
