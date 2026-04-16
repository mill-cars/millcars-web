import React, { useState, useEffect } from 'react';
import { ArrowUpDown, ChevronLeft, ChevronRight, Filter, MoreVertical, Zap } from 'lucide-react';
import { Car } from '../types';
import { getCars } from '../data/cars';
import { AdminHeader } from './AdminHeader';
import { UsersPanel } from './UsersPanel';
import { useAuth } from '../context/AuthContext';

type AdminView = 'inventario' | 'usuarios';

export function AdminDashboard() {
  const { session, loading } = useAuth();
  const [activeView, setActiveView] = useState<AdminView>('inventario');
  const [searchQuery, setSearchQuery] = useState('');
  const [cars, setCars] = useState<Car[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'todos' | 'disponibles' | 'reservados'>('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Auth guard: redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !session) {
      window.location.href = '/login';
    }
  }, [loading, session]);

  useEffect(() => {
    // Initial fetch
    setCars(getCars());
  }, []);

  const filteredCars = cars.filter(car => {
    if (filterStatus === 'disponibles') {
      return cars.indexOf(car) % 3 !== 0; // Simulate available status
    }
    if (filterStatus === 'reservados') {
      return cars.indexOf(car) % 3 === 0; // Simulate reserved status
    }
    return true;
  });

  const totalPages = Math.ceil(filteredCars.length / itemsPerPage);
  const paginatedCars = filteredCars.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSaved = () => {
    // Refresh local list from static data (real-time refresh via Supabase can be added later)
    setCars(getCars());
  };

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
              <p className="text-3xl font-black text-slate-950 dark:text-slate-50">{cars.length}</p>
              <p className="text-xs text-green-600 dark:text-green-400 font-bold mt-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-base align-middle">trending_up</span> +12% vs mes anterior
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                En Showroom
              </p>
              <p className="text-3xl font-black text-slate-950 dark:text-slate-50">
                {cars.filter((_, i) => i % 3 !== 0).length}
              </p>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-4">
                <div className="bg-blue-600 h-full rounded-full w-2/3"></div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Valor de Flota
              </p>
              <p className="text-3xl font-black text-slate-950 dark:text-slate-50">
                ${(cars.reduce((acc, car) => acc + car.price, 0) / 1000000).toFixed(1)}M
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                Tasación actualizada hoy
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Días Promedio
              </p>
              <p className="text-3xl font-black text-slate-950 dark:text-slate-50">18</p>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-bold mt-2 flex items-center gap-1">
                <Zap className="w-4 h-4" /> Alta rotación
              </p>
            </div>
          </div>
          {/* Inventory Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 gap-4">
              <div className="flex gap-2 sm:gap-4 overflow-x-auto pb-2 sm:pb-0">
                <button
                  onClick={() => {
                    setFilterStatus('todos');
                    setCurrentPage(1);
                  }}
                  className={`text-sm font-bold px-2 pb-1 transition-colors whitespace-nowrap ${
                    filterStatus === 'todos'
                      ? 'border-b-2 border-blue-600 text-slate-950 dark:text-slate-50'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-50'
                  }`}
                >
                  Todos ({cars.length})
                </button>
                <button
                  onClick={() => {
                    setFilterStatus('disponibles');
                    setCurrentPage(1);
                  }}
                  className={`text-sm font-medium px-2 pb-1 transition-colors whitespace-nowrap ${
                    filterStatus === 'disponibles'
                      ? 'border-b-2 border-blue-600 text-slate-950 dark:text-slate-50 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-50'
                  }`}
                >
                  Disponibles ({cars.filter((_, i) => i % 3 !== 0).length})
                </button>
                <button
                  onClick={() => {
                    setFilterStatus('reservados');
                    setCurrentPage(1);
                  }}
                  className={`text-sm font-medium px-2 pb-1 transition-colors whitespace-nowrap ${
                    filterStatus === 'reservados'
                      ? 'border-b-2 border-blue-600 text-slate-950 dark:text-slate-50 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-50'
                  }`}
                >
                  Reservados ({cars.filter((_, i) => i % 3 === 0).length})
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
                {paginatedCars.length > 0 ? (
                  paginatedCars.map((car) => {
                    const globalIndex = cars.indexOf(car);
                    const isReserved = globalIndex % 3 === 0;
                    return (
                      <tr
                        key={car.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <img
                          alt={car.model}
                          className="w-16 h-10 object-cover rounded-lg group-hover:scale-105 transition-transform"
                          src={
                            car.image ||
                            'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&q=80&w=200'
                          }
                        />
                        <div>
                          <p className="font-bold text-slate-950 dark:text-slate-50">
                            {car.brand} {car.model}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            VIN: {Math.random().toString(36).substring(2, 10).toUpperCase()}...
                            {car.plateEnd}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full ${
                          isReserved
                            ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400'
                            : 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                        }`}
                      >
                        {isReserved ? 'Reservado' : 'Disponible'}
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
                    <td className="px-8 py-5 text-right">
                      <button className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
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
            <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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

