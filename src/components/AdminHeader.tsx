import React from 'react';
import { Search, LogOut, Menu } from 'lucide-react';

interface AdminHeaderProps {
  searchPlaceholder?: string;
  userRole?: string;
  userName?: string;
  onLogout?: () => void;
  onSidebarToggle?: () => void;
  userImage?: string;
  breadcrumb?: { label: string; href?: string }[];
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  searchPlaceholder = 'Buscar inventario, VIN, o modelos...',
  userRole = 'Gestor de Flota',
  userName = 'Admin User',
  onLogout,
  onSidebarToggle,
  userImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuC10KNRUeNTFDFsDXLtsL7uBDf_sB-ylo1jZzRqP2WVUXM3qRPNW1P48QoUxhB2epXHwU6szUdhrjBqEMe20WoDu0UDzGKI9B7Vs619Q-7zYUHkyR-Y3Fv09MOucxLKlxC-2Op4X8NZV6cGn5iATyI3NemG1LLzyskaBniW2X-hOpXCRHlLKleiUPndZh-lEZiF1SzBeXF3A5X2PxfjGe8CcNNCDWzzOOwuMSsxEo3HsEOsKJERVzoxukIqaeLJYhwNXBAkvIgdIe4',
  breadcrumb = [{ label: 'Admin', href: '/admin' }],
}) => {
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

      {/* Main Header */}
      <div className="h-16 flex justify-between items-center px-8">
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
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 w-5 h-5" />
            <input
              className="w-full bg-transparent border-none rounded-none pl-10 pr-4 py-2 text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:ring-0"
              placeholder={searchPlaceholder}
              type="text"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 ml-8">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-900 dark:text-slate-50">{userName}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">{userRole}</p>
          </div>
          <img
            alt="User profile"
            className="w-10 h-10 rounded-full border-2 border-blue-600/10 object-cover"
            src={userImage}
          />
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              title="Cerrar sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
