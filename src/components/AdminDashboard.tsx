import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowUpDown, ChevronLeft, ChevronRight, Filter, MoreVertical, Zap } from 'lucide-react';
import { Car } from '../types';
import { fetchAllCars } from '../services/carsService';
import { AdminHeader } from './AdminHeader';
import { UsersPanel } from './UsersPanel';
import { useAuth } from '../context/AuthContext';

type AdminView = 'inventario' | 'usuarios';

export function AdminDashboard() {
  const { session, loading, profile } = useAuth();
  const [activeView, setActiveView] = useState<AdminView>('inventario');
  const [searchQuery, setSearchQuery] = useState('');
  const [cars, setCars] = useState<Car[]>([]);
  const [carsLoading, setCarsLoading] = useState(true);
  const [carsError, setCarsError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'todos' | 'disponibles' | 'inactivos'>('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Auth guard: redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !session) {
      window.location.href = '/login';
    }
  }, [loading, session]);

  useEffect(() => {
    const loadCars = () => {
      setCarsLoading(true);
      fetchAllCars()
        .then(data => { setCars(data); setCarsError(null); })
        .catch(err => setCarsError(err.message))
        .finally(() => setCarsLoading(false));
    };
    if (!loading && session) loadCars();
  }, [loading, session]);

  if (!loading && session && profile?.role === 'cliente') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-slate-900 bg-slate-50 dark:bg-slate-950 dark:text-slate-50 font-sans antialiased p-6">
        <h1 className="text-6xl font-black mb-4">403</h1>
        <h2 className="text-2xl font-bold mb-4">Acceso no permitido</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md text-center">
          Tu rol de usuario cliente no tiene los permisos necesarios para acceder a este panel de administración.
        </p>
        <a href="/" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition">
          Volver al inicio
        </a>
      </div>
    );
  }

  const filteredCars = cars.filter(car => {
    const matchesSearch = !searchQuery ||
      `${car.brand} ${car.model}`.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filterStatus === 'disponibles') return car.isActive !== false;
    if (filterStatus === 'inactivos') return car.isActive === false;
    return true;
  });

  const totalPages = Math.ceil(filteredCars.length / itemsPerPage);
  const paginatedCars = filteredCars.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSaved = useCallback(() => {
    setCarsLoading(true);
    fetchAllCars()
      .then(data => { setCars(data); setCarsError(null); })
      .catch(err => setCarsError(err.message))
      .finally(() => setCarsLoading(false));
  }, []);

  /** Close dropdown when clicking outside */
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
      setOpenMenuId(null);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  /** Navigate to edit page for a specific car */
  function navigateToEdit(carId: string) {
    setOpenMenuId(null);
    const path = `/admin/vehiculos/${carId}/editar`;
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }

  /** Toggle is_active for a car (soft-delete / restore) */
  async function toggleActive(car: Car) {
    setOpenMenuId(null);
    const { supabase } = await import('../lib/supabase');
    const newValue = car.isActive === false ? true : false;
    await supabase.from('cars').update({ is_active: newValue }).eq('id', car.id);
    handleSaved();
  }

  return (
    <div className="flex font-sans antialiased min-h-screen text-slate-900 dark:text-slate-50 bg-slate-50 dark:bg-slate-950">
      {/* Sidebar - Toggle on mobile */}
      <aside className={`fixed md:relative w-64 border-r border-outline-variant bg-surface flex flex-col left-0 top-0 h-screen z-40 transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="h-16 flex items-center justify-between px-8 border-b border-outline-variant">
          <a href="/" className="text-xl font-extrabold tracking-tight text-on-surface">
            MILLCARS
          </a>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-2 hover:bg-surface-container rounded-lg"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>
        <nav className="flex flex-col gap-1 p-4 text-sm font-semibold tracking-wide">
          <button
            onClick={() => { setActiveView('inventario'); setSearchQuery(''); setSidebarOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg w-full text-left transition-all duration-200 ${
              activeView === 'inventario'
                ? 'bg-primary/10 text-primary'
                : 'text-on-surface-variant hover:bg-surface-container hover:translate-x-1'
            }`}
          >
            <span className="material-symbols-outlined text-xl" style={activeView === 'inventario' ? { fontVariationSettings: "'FILL' 1" } : {}}>local_shipping</span>
            <span>Inventario</span>
          </button>
          <button
            onClick={() => { setActiveView('usuarios'); setSearchQuery(''); setSidebarOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg w-full text-left transition-all duration-200 ${
              activeView === 'usuarios'
                ? 'bg-primary/10 text-primary'
                : 'text-on-surface-variant hover:bg-surface-container hover:translate-x-1'
            }`}
          >
            <span className="material-symbols-outlined text-xl" style={activeView === 'usuarios' ? { fontVariationSettings: "'FILL' 1" } : {}}>group</span>
            <span>Usuarios</span>
          </button>
        </nav>
      </aside>

      {/* Overlay when sidebar open on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 md:hidden z-30"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content Area */}
      <div className="flex-1">
        {/* Header */}
        <AdminHeader
          searchPlaceholder={activeView === 'inventario' ? 'Buscar inventario, VIN, o modelos...' : 'Buscar usuarios, roles o emails...'}
          onSearch={setSearchQuery}
          onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Switch views */}
        {activeView === 'usuarios' ? (
          <UsersPanel searchQuery={searchQuery} />
        ) : (
        <main className="p-6 sm:p-8 min-h-[calc(100vh-4rem)]">
          <div className="flex justify-between items-end mb-10 gap-4 flex-col sm:flex-row">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 dark:text-slate-50 mb-2">
                Gestión de Inventario
              </h1>
              <p className="text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed text-sm sm:text-base">
                Supervise su flota global con precisión. Gestione especificaciones, disponibilidad y tasaciones en tiempo real.
              </p>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <span className="material-symbols-outlined text-base">download</span>
                <span className="hidden sm:inline">Exportar CSV</span>
              </button>
              <button 
                onClick={() => {
                  window.history.pushState({}, '', '/admin/vehiculos/nuevo');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-600/20 hover:scale-105 active:scale-95 transition-all">
                <span className="material-symbols-outlined text-base">add</span>
                <span className="hidden sm:inline">Añadir</span>
              </button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-10">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Total Unidades
              </p>
              {carsLoading
                ? <div className="h-9 w-16 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse mt-1" />
                : <p className="text-3xl font-black text-slate-950 dark:text-slate-50">{cars.length}</p>
              }
              <p className="text-xs text-green-600 dark:text-green-400 font-bold mt-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-base align-middle">trending_up</span> Desde Supabase
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Activos
              </p>
              {carsLoading
                ? <div className="h-9 w-16 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse mt-1" />
                : <p className="text-3xl font-black text-slate-950 dark:text-slate-50">
                    {cars.filter(c => c.isActive !== false).length}
                  </p>
              }
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-4">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: cars.length ? `${(cars.filter(c => c.isActive !== false).length / cars.length) * 100}%` : '0%' }} />
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Valor de Flota
              </p>
              {carsLoading
                ? <div className="h-9 w-20 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse mt-1" />
                : <p className="text-3xl font-black text-slate-950 dark:text-slate-50">
                    ${(cars.reduce((acc, car) => acc + car.price, 0) / 1000000).toFixed(1)}M
                  </p>
              }
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                Tasación actualizada
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Inactivos
              </p>
              {carsLoading
                ? <div className="h-9 w-10 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse mt-1" />
                : <p className="text-3xl font-black text-slate-950 dark:text-slate-50">
                    {cars.filter(c => c.isActive === false).length}
                  </p>
              }
              <p className="text-xs text-orange-500 dark:text-orange-400 font-bold mt-2 flex items-center gap-1">
                <Zap className="w-4 h-4" /> Fuera de catálogo
              </p>
            </div>
          </div>
          {/* Inventory Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 gap-4 rounded-t-2xl">
              <div className="flex gap-2 sm:gap-4 overflow-x-auto pb-2 sm:pb-0">
                <button
                  onClick={() => { setFilterStatus('todos'); setCurrentPage(1); }}
                  className={`text-sm font-bold px-2 pb-1 transition-colors whitespace-nowrap ${
                    filterStatus === 'todos'
                      ? 'border-b-2 border-blue-600 text-slate-950 dark:text-slate-50'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-50'
                  }`}
                >
                  Todos ({cars.length})
                </button>
                <button
                  onClick={() => { setFilterStatus('disponibles'); setCurrentPage(1); }}
                  className={`text-sm font-medium px-2 pb-1 transition-colors whitespace-nowrap ${
                    filterStatus === 'disponibles'
                      ? 'border-b-2 border-blue-600 text-slate-950 dark:text-slate-50 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-50'
                  }`}
                >
                  Activos ({cars.filter(c => c.isActive !== false).length})
                </button>
                <button
                  onClick={() => { setFilterStatus('inactivos'); setCurrentPage(1); }}
                  className={`text-sm font-medium px-2 pb-1 transition-colors whitespace-nowrap ${
                    filterStatus === 'inactivos'
                      ? 'border-b-2 border-blue-600 text-slate-950 dark:text-slate-50 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-50'
                  }`}
                >
                  Inactivos ({cars.filter(c => c.isActive === false).length})
                </button>
              </div>
              <div className="flex gap-2">
                <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400">
                  <Filter className="w-5 h-5" />
                </button>
                <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400">
                  <ArrowUpDown className="w-5 h-5" />
                </button>
              </div>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800">
                  <th className="px-8 py-4">Vehículo</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4">Especificaciones</th>
                  <th className="px-6 py-4">Ubicación</th>
                  <th className="px-6 py-4 text-right">Precio</th>
                  <th className="px-8 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {carsLoading ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-12 text-center">
                      <div className="flex items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        Cargando inventario desde Supabase...
                      </div>
                    </td>
                  </tr>
                ) : carsError ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-12 text-center text-red-500">
                      {carsError}
                    </td>
                  </tr>
                ) : paginatedCars.length > 0 ? (
                  paginatedCars.map((car) => {
                    const isActive = car.isActive !== false;
                    return (
                      <tr key={car.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <img
                          alt={car.model}
                          className="w-16 h-10 object-cover rounded-lg group-hover:scale-105 transition-transform"
                          src={car.image}
                        />
                        <div>
                          <p className="font-bold text-slate-950 dark:text-slate-50">
                            {car.brand} {car.model}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {car.year} · {car.color} · {car.mileage.toLocaleString()} km
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full ${
                        isActive
                          ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}>
                        {isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-medium text-slate-950 dark:text-slate-50">
                        {car.fuelType} • {car.owners} Dueño(s)
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{car.transmission}</p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-medium text-slate-950 dark:text-slate-50">
                        Madrid Sur
                      </p>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <p className="text-lg font-black text-blue-600 dark:text-blue-400">
                        ${car.price.toLocaleString()}
                      </p>
                    </td>
                    <td className="px-8 py-5 text-right relative">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === car.id ? null : car.id)}
                        className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                        aria-label="Opciones del vehículo"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {openMenuId === car.id && (
                        <div
                          ref={menuRef}
                          className="absolute right-8 top-12 z-50 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 overflow-hidden"
                        >
                          <button
                            onClick={() => navigateToEdit(car.id)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            <span className="material-symbols-outlined text-base">edit</span>
                            Editar vehículo
                          </button>
                          <div className="h-px bg-slate-100 dark:bg-slate-700 mx-3" />
                          <button
                            onClick={() => toggleActive(car)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold transition-colors ${
                              isActive
                                ? 'text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                                : 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                            }`}
                          >
                            <span className="material-symbols-outlined text-base">
                              {isActive ? 'visibility_off' : 'visibility'}
                            </span>
                            {isActive ? 'Desactivar' : 'Activar'}
                          </button>
                        </div>
                      )}
                    </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-8 py-12 text-center text-slate-500 dark:text-slate-400">
                      No hay vehículos para mostrar
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 rounded-b-2xl">
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Mostrando {paginatedCars.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-{Math.min(currentPage * itemsPerPage, filteredCars.length)} de {filteredCars.length} unidades
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="p-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-30"
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="px-3 py-1 bg-blue-600 text-white text-sm font-bold rounded-lg">
                  {currentPage}
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="p-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-30"
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </main>
        )}
      </div>

    </div>
  );
}

