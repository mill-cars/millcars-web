import React, { useState, useRef, useEffect } from 'react';
import { Search, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AdminHeaderProps {
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  onSidebarToggle?: () => void;
  breadcrumb?: { label: string; href?: string }[];
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  searchPlaceholder = 'Buscar...',
  onSearch,
  onSidebarToggle,
  breadcrumb = [{ label: 'Admin', href: '/admin' }],
}) => {
  const { user, signOut } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const avatarUrl: string | undefined =
    (user?.user_metadata?.avatar_url as string | undefined) ??
    (user?.user_metadata?.picture as string | undefined);

  const displayName: string =
    (user?.user_metadata?.full_name as string | undefined) ??
    (user?.user_metadata?.name as string | undefined) ??
    user?.email ??
    'Admin User';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setUserMenuOpen(false);
    await signOut();
    window.location.href = '/login';
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl">
      {/* Breadcrumb */}
      <div className="h-10 flex items-center px-8 border-b border-slate-100 dark:border-slate-800/50 text-xs font-medium text-slate-600 dark:text-slate-400">
        <a href="/" className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
          Inicio
        </a>
        {breadcrumb.map((item, idx) => (
          <React.Fragment key={idx}>
            <span className="mx-2 text-slate-400 dark:text-slate-600">/</span>
            {item.href ? (
              <a href={item.href} className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
                {item.label}
              </a>
            ) : (
              <span className="text-slate-900 dark:text-slate-200 font-semibold">{item.label}</span>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Main header row */}
      <div className="h-16 flex justify-between items-center px-8">
        {/* Left: sidebar toggle + search */}
        <div className="flex items-center gap-4 flex-1">
          {onSidebarToggle && (
            <button
              onClick={onSidebarToggle}
              className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors text-slate-600 dark:text-slate-400"
              title="Alternar menú"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 w-5 h-5" />
            <input
              className="w-full bg-transparent border-none rounded-none pl-10 pr-4 py-2 text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:ring-0 outline-none"
              placeholder={searchPlaceholder}
              type="text"
              onChange={e => onSearch?.(e.target.value)}
            />
          </div>
        </div>

        {/* Right: user pill + dropdown */}
        <div className="relative ml-8" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setUserMenuOpen((v) => !v)}
            className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 transition-all hover:border-primary/30 hover:shadow-md"
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
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
              <div className="p-2">
                <a
                  href="/"
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-on-surface hover:bg-slate-50 transition-colors"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <span className="material-symbols-outlined text-base text-primary">store</span>
                  Ver inventario público
                </a>
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
      </div>
    </header>
  );
};
