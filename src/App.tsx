import { useState, useMemo, useEffect, useRef } from 'react';
import { Car, Message, SearchFilters } from './types';
import { fetchCars } from './services/carsService';
import { chatWithAgent } from './services/gemini';
import { CarCard, CarCardSkeleton } from './components/CarCard';
import { motion, AnimatePresence } from 'motion/react';
import { countActiveFilters, formatNumber, getWhatsAppLink } from './lib/utils';
import { AdminDashboard } from './components/AdminDashboard';
import { AddVehiclePage } from './components/AddVehiclePage';
import { EditVehiclePage } from './components/EditVehiclePage';
import { VehicleDetailModal } from './components/VehicleDetailModal';
import { VehicleDetailPage } from './components/VehicleDetailPage';
import { Login } from './components/Login';
import { Vender } from './components/Vender';
import { PublicHeader } from './components/PublicHeader';
import { Footer } from './components/Footer';
import { Button } from './components/Button';
import { AssistantPanel } from './components/AssistantPanel';
import { AuthProvider } from './context/AuthContext';

const PRICE_POLICY_MESSAGE =
  'Respecto al precio, por políticas de seguridad y para brindarte la mejor oferta del día, te invito a iniciar sesión o registrarte en nuestro portal. También puedes contactarnos directamente por WhatsApp desde la tarjeta del vehículo para recibir atención inmediata de uno de nuestros asesores. ¿Te gustaría coordinar una visita para verla en persona?';

const filterCarsByFilters = (cars: Car[], filters: SearchFilters) => {
  return cars.filter(car => {
    if (filters.brand) {
      const brands = filters.brand.toLowerCase().split(',').map(b => b.trim());
      if (!brands.some(b => car.brand.toLowerCase().includes(b))) return false;
    }

    if (filters.model) {
      const models = filters.model.toLowerCase().split(',').map(m => m.trim());
      if (!models.some(m => car.model.toLowerCase().includes(m))) return false;
    }

    if (filters.minPrice && car.price < filters.minPrice) return false;
    if (filters.maxPrice && car.price > filters.maxPrice) return false;
    if (filters.minYear && car.year < filters.minYear) return false;
    if (filters.maxYear && car.year > filters.maxYear) return false;
    if (filters.maxMileage && car.mileage > filters.maxMileage) return false;
    if (filters.color && !car.color.toLowerCase().includes(filters.color.toLowerCase())) return false;
    if (filters.condition && car.condition !== filters.condition) return false;
    if (filters.plateEnd !== undefined && car.plateEnd !== filters.plateEnd) return false;
    if (filters.owners !== undefined && car.owners > filters.owners) return false;
    if (filters.fuelType && !car.fuelType.toLowerCase().includes(filters.fuelType.toLowerCase())) return false;
    if (filters.transmission && !car.transmission.toLowerCase().includes(filters.transmission.toLowerCase())) return false;

    if (filters.query) {
      const q = filters.query.toLowerCase();
      const inBrand = car.brand.toLowerCase().includes(q);
      const inModel = car.model.toLowerCase().includes(q);
      const inDesc = car.description.toLowerCase().includes(q);
      const inFeatures = car.features.some(f => f.toLowerCase().includes(q));
      if (!inBrand && !inModel && !inDesc && !inFeatures) return false;
    }

    return true;
  });
};

const buildFiltersFromMentionedCars = (text: string, cars: Car[]): SearchFilters | null => {
  const normalizedText = text.toLowerCase();
  const mentionedCars = cars.filter(car => normalizedText.includes(`${car.brand} ${car.model}`.toLowerCase()));

  if (mentionedCars.length === 0) {
    return null;
  }

  const uniqueBrands = [...new Set(mentionedCars.map(car => car.brand))];
  const uniqueModels = [...new Set(mentionedCars.map(car => car.model))];

  return {
    brand: uniqueBrands.join(','),
    model: uniqueModels.join(','),
  };
};

const buildConciseAssistantMessage = (cars: Car[]) => {
  const listedCars = cars.slice(0, 3);
  const lines = listedCars.map((car, index) => `${index + 1}. ${car.brand} ${car.model} (${car.year})`);
  return `${lines.join('\n')}\n\n${PRICE_POLICY_MESSAGE}`;
};

const extractExplicitFiltersFromText = (text: string): Partial<SearchFilters> => {
  const normalized = text.toLowerCase();
  const explicitFilters: Partial<SearchFilters> = {};

  // "menos de $15,000", "menor a 15000", "max 15000"
  const maxPriceMatch = normalized.match(/(?:menos de|menor a|max(?:imo)?(?: de)?)\s*\$?\s*([\d.,]+)/i);
  if (maxPriceMatch?.[1]) {
    const parsed = Number(maxPriceMatch[1].replace(/[.,]/g, ''));
    if (!Number.isNaN(parsed) && parsed > 0) {
      explicitFilters.maxPrice = parsed;
    }
  }

  if (/\bautom[áa]tic[oa]s?\b/i.test(normalized)) {
    explicitFilters.transmission = 'automático';
  } else if (/\bmanual(?:es)?\b/i.test(normalized)) {
    explicitFilters.transmission = 'manual';
  }

  return explicitFilters;
};

function AppContent() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const isAdminPage = currentPath === '/admin';
  const isAddVehiclePage = currentPath === '/admin/vehiculos/nuevo';
  const isEditVehiclePage = /^\/admin\/vehiculos\/[^/]+\/editar$/.test(currentPath);
  const isLoginPage = currentPath === '/login';
  const isQuotePage = currentPath === '/cotizar';
  const isLegacySellPage = currentPath === '/vender';
  // /autos/:id  — public vehicle detail page (UUID-based route)
  const vehicleDetailMatch = currentPath.match(/^\/autos\/([^/]+)$/);
  const vehicleDetailId = vehicleDetailMatch ? vehicleDetailMatch[1] : null;

  useEffect(() => {
    const onPopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigateTo = (path: string) => {
    if (window.location.pathname === path) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [messages, setMessages] = useState<Message[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [input, setInput] = useState('');
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [assistantAutoAdjusted, setAssistantAutoAdjusted] = useState(false);
  const featuredScrollRef = useRef<HTMLDivElement | null>(null);

  // ── Real data from Supabase ──────────────────────────────────────────────
  const [carsData, setCarsData] = useState<Car[]>([]);
  const [carsLoading, setCarsLoading] = useState(true);
  const [carsError, setCarsError] = useState<string | null>(null);

  useEffect(() => {
    setCarsLoading(true);
    fetchCars()
      .then(data => {
        setCarsData(data);
        setCarsError(null);
      })
      .catch(err => {
        setCarsError('No se pudieron cargar los vehículos. Intenta nuevamente.');
        console.error(err);
      })
      .finally(() => setCarsLoading(false));
  }, []);
  // ────────────────────────────────────────────────────────────────────────

  const activeFilterCount = countActiveFilters(filters as object);
  const hasActiveSearch = messages.length > 0 || activeFilterCount > 0;

  const filteredCars = useMemo(() => {
    return filterCarsByFilters(carsData, filters);
  }, [filters, carsData]);

  // Limit public catalog to 10 units total (3 featured + 7 used)
  const catalogCars = filteredCars.slice(0, 10);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    
    setInput('');
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await chatWithAgent(text, messages);

      const aiFilters = response.filters ?? {};
      let nextFilters = aiFilters;
      let adjustedByFallback = false;
      const resultsWithAiFilters = filterCarsByFilters(carsData, aiFilters);

      if (resultsWithAiFilters.length === 0) {
        const fallbackFilters = buildFiltersFromMentionedCars(response.message ?? '', carsData);
        if (fallbackFilters) {
          nextFilters = fallbackFilters;
          adjustedByFallback = true;
        } else if (countActiveFilters(aiFilters as object) > 0) {
          nextFilters = {};
          adjustedByFallback = true;
        }
      }

      // Enforce hard constraints explicitly written by the user
      const explicitFilters = extractExplicitFiltersFromText(text);
      nextFilters = { ...nextFilters, ...explicitFilters };

      let resultsForFinalFilters = filterCarsByFilters(carsData, nextFilters);

      // Final reconciliation: if we still have no results but assistant mentioned concrete cars,
      // prioritize visual coherence between chat and result grid.
      if (resultsForFinalFilters.length === 0) {
        const finalFallbackFilters = buildFiltersFromMentionedCars(response.message ?? '', carsData);
        if (finalFallbackFilters) {
          const fallbackResults = filterCarsByFilters(carsData, finalFallbackFilters);
          if (fallbackResults.length > 0) {
            nextFilters = finalFallbackFilters;
            resultsForFinalFilters = fallbackResults;
            adjustedByFallback = true;
          }
        }
      }

      const assistantText =
        resultsForFinalFilters.length > 0
          ? buildConciseAssistantMessage(resultsForFinalFilters)
          : response.message;

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: assistantText,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, botMessage]);
      setFilters(nextFilters);
      setAssistantAutoAdjusted(adjustedByFallback);
    } catch (error) {
      console.error(error);
      setAssistantAutoAdjusted(false);
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({});
    setMessages([]);
    setAssistantAutoAdjusted(false);
  };

  const scrollFeaturedCars = (direction: 'left' | 'right') => {
    if (!featuredScrollRef.current) return;
    const amount = Math.round(featuredScrollRef.current.clientWidth * 0.85);
    featuredScrollRef.current.scrollBy({
      left: direction === 'right' ? amount : -amount,
      behavior: 'smooth',
    });
  };

  const featuredCars = catalogCars.slice(0, 3);
  const usedPopularCars = catalogCars.slice(3, 10);

  if (isAddVehiclePage) {
    return <AddVehiclePage />;
  }

  if (isEditVehiclePage) {
    return <EditVehiclePage />;
  }

  if (isAdminPage) {
    return <AdminDashboard />;
  }

  if (isLoginPage) {
    return <Login />;
  }

  if (isQuotePage || isLegacySellPage) {
    return <Vender mode="cotizar" />;
  }

  if (vehicleDetailId) {
    return <VehicleDetailPage id={vehicleDetailId} />;
  }

  return (
    <div className="min-h-screen bg-surface">
      <PublicHeader active="inventario" ctaLabel="Ingresar" ctaHref="/login" />

      <main className="flex-1 px-4 pb-0 pt-[112px] sm:px-6 lg:px-8">
        <div className={`mx-auto grid max-w-[1600px] items-stretch gap-8 ${hasActiveSearch ? 'xl:grid-cols-[320px_minmax(0,1fr)]' : 'grid-cols-1'}`}>
          {/* Stretch to full row height so sticky can stay in view for the whole page scroll */}
          {hasActiveSearch && (
            <div className="hidden min-h-0 self-stretch lg:block">
              <div className="sticky top-[118px] z-30 min-h-0 lg:max-h-[calc(100vh-132px)]">
                <AssistantPanel
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading}
                  input={input}
                  onInputChange={setInput}
                  filters={filters}
                  clearFilters={clearFilters}
                  mode="embedded"
                />
              </div>
            </div>
          )}

          <div className="min-w-0 overflow-x-hidden">
        {/* Hero Section - hidden when agent search is active */}
        <AnimatePresence mode="wait">
          {!hasActiveSearch ? (
            <motion.section
              key="hero"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
              className="relative overflow-hidden px-0 pb-20 pt-4"
            >
              <div className="max-w-7xl mx-auto editorial-grid">
                <div className="col-span-12 lg:col-span-7 flex flex-col justify-center space-y-7 z-10">
                  <div className="inline-flex items-center self-start rounded-full bg-primary-fixed px-3.5 py-1.5 font-label text-[11px] font-semibold uppercase tracking-[0.18em] text-on-primary-fixed">
                    Tecnología y criterio experto
                  </div>
                  <h1 className="max-w-4xl font-display text-4xl font-semibold leading-[0.95] tracking-[-0.05em] text-on-surface sm:text-5xl lg:text-[4.25rem]">
                   Compra o vende tu auto de forma rápida y segura
                  </h1>
                  <p className="max-w-2xl text-lg leading-8 text-on-surface-variant sm:text-[1.35rem]">
                    Millcars es un concesionario de vehículos nuevos importados y usados con asesoría personalizada y compra segura.
                  </p>
                  <div className="flex flex-col gap-4 sm:flex-row">
                  <Button
                      variant="primary"
                      size="lg"
                       className="flex items-center gap-2 shadow-xl shadow-primary/20"
                      
                      onClick={() => {
                        window.location.href = '/#catalogo';
                      }}
                    >
                      Ver catálogo
                      <span className="material-symbols-outlined">apps</span>
                    </Button>
                    <Button
                      variant="secondary"
                      size="lg"
                      className="flex items-center gap-2"
                     
                      onClick={() => navigateTo('/cotizar')}
                    >
                      Vender mi auto
                      <span className="material-symbols-outlined">arrow_forward</span>
                    </Button>
                    
                  </div>
                </div>
                
                {/* Asistente IA - Mantiene al usuario enganchado (F-pattern) */}
                <div className="col-span-12 lg:col-span-4 lg:col-start-9 hidden lg:flex flex-col justify-center z-10 mt-12 lg:mt-0">
                  <div className="bg-surface-container-low border border-outline-variant/30 rounded-[2rem] shadow-lg shadow-black/5 overflow-hidden h-[450px]">
                    <AssistantPanel
                      messages={messages}
                      onSendMessage={handleSendMessage}
                      isLoading={isLoading}
                      input={input}
                      onInputChange={setInput}
                      filters={filters}
                      clearFilters={clearFilters}
                      mode="embedded"
                    />
                  </div>
                </div>
              </div>

              {/* Popular Used Cars */}
              {(carsLoading || (!carsError && usedPopularCars.length > 0)) && (
                <section className="overflow-hidden bg-surface px-0 py-10 lg:py-12">
                  <div className="max-w-7xl mx-auto">
                    <div className="mb-6 lg:mb-8">
                      <h2 className="text-2xl font-black tracking-tight mb-2">Autos destacados</h2>
                      <p className="text-on-surface-variant font-label text-sm uppercase tracking-widest">Certificados y Pre-Inspeccionados</p>
                    </div>
                    <div className="flex space-x-4 overflow-x-auto pb-4 snap-x no-scrollbar lg:space-x-5 lg:pb-6">
                      <AnimatePresence mode='popLayout'>
                        {carsLoading ? (
                          <>
                            {Array.from({ length: 5 }).map((_, i) => (
                              <CarCardSkeleton key={`skeleton-${i}`} variant="used" />
                            ))}
                          </>
                        ) : (
                          usedPopularCars.map(car => (
                            <CarCard 
                              key={car.id} 
                              car={car} 
                              onClick={(c) => {
                                window.history.pushState({}, '', `/autos/${c.id}`);
                                setCurrentPath(`/autos/${c.id}`);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              variant="used"
                            />
                          ))
                        )}
                      </AnimatePresence>
                      {/* Fallback padding so the last item isn't strictly against the edge if scrolling */}
                    </div>
                  </div>
                </section>
              )}

              {/* Showroom Section */}
              <section className="mt-10 lg:mt-16 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row items-center gap-12 bg-surface-container-low rounded-[2.5rem] p-8 lg:p-12 border border-outline-variant/20 shadow-sm">
                  <div className="flex-1 space-y-6">
                    <div className="inline-flex items-center rounded-full bg-primary/10 px-3.5 py-1.5 font-label text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                      Atención Física
                    </div>
                    <h2 className="text-3xl lg:text-[2.5rem] font-display font-semibold leading-tight tracking-tight text-on-surface">
                      Visítanos en nuestro showroom
                    </h2>
                    <p className="text-lg leading-relaxed text-on-surface-variant max-w-lg">
                      Contamos con un espacio físico donde puedes ver los vehículos, recibir asesoría personalizada y comprar con total confianza.
                    </p>
                    <div className="flex items-center gap-3 mt-6 bg-surface px-5 py-4 rounded-2xl border border-outline-variant/30 w-fit">
                        <span className="material-symbols-outlined text-primary text-2xl font-light">location_on</span>
                        <p className="font-medium text-sm text-on-surface">Av. Principal, Los Cortijos de Lourdes</p>
                    </div>
                  </div>
                  <div className="flex-1 w-full lg:w-auto">
                    <div className="group relative overflow-hidden rounded-[2rem] border border-outline-variant/30 shadow-2xl shadow-black/5">
                      <img
                        alt="Fachada principal de Millcars"
                        className="h-[360px] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        src="/assets/millcars-rif.webp"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                </div>

                 <div className="mt-8 rounded-[2rem] border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-[0_18px_48px_rgba(17,28,45,0.06)] lg:p-8">
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="max-w-2xl">
                      <p className="font-label text-[11px] uppercase tracking-[0.18em] text-outline">
                        Millcars en redes
                      </p>
                      <h3 className="mt-2 font-display text-2xl font-semibold leading-tight text-on-surface">
                        Sigue a Millcars
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-on-surface-variant">
                        Publicamos inventario, entregas y novedades.
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <a
                        href="https://www.instagram.com/millcars_/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-3 rounded-[1.1rem] border border-outline-variant/20 bg-surface-container-low px-5 py-4 text-sm font-semibold text-on-surface transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:text-primary"
                      >
                        <span className="material-symbols-outlined text-lg">photo_camera</span>
                        Instagram
                      </a>
                      <a
                        href="https://www.facebook.com/people/MILL-CARS-CA/61571903014854/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-3 rounded-[1.1rem] border border-outline-variant/20 bg-surface-container-low px-5 py-4 text-sm font-semibold text-on-surface transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:text-primary"
                      >
                        <span className="material-symbols-outlined text-lg">groups</span>
                        Facebook
                      </a>
                    </div>
                  </div>
                </div>

                
              </section>

            </motion.section>
          ) : (
            <motion.section
              key="search-context"
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
              className="px-0 pb-6 pt-4"
            >
              <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors duration-300 ${isLoading ? 'bg-primary/20' : 'bg-primary/10'}`}>
                    <span className="material-symbols-outlined text-primary text-xl" style={{fontVariationSettings: "'FILL' 1"}}>smart_toy</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-outline">Asistente IA · Resultados</p>
                    {isLoading ? (
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-sm font-bold text-primary">Procesando búsqueda</p>
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm font-bold text-on-surface">
                        {filteredCars.length > 0
                          ? `${filteredCars.length} resultado${filteredCars.length !== 1 ? 's' : ''} para tu búsqueda`
                          : 'Sin resultados para los filtros aplicados'}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={clearFilters}
                  disabled={isLoading}
                  className="flex items-center gap-2 rounded-xl border border-outline-variant/20 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-outline hover:border-primary/40 hover:text-primary transition-all disabled:pointer-events-none disabled:opacity-40"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                  Limpiar búsqueda
                </button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* ── Error state ──────────────────────────────────────────────────── */}
        {!carsLoading && carsError && (
          <section className="mx-0 rounded-[2rem] bg-surface-container-low px-8 py-24">
            <div className="max-w-xl mx-auto text-center space-y-6">
              <span className="material-symbols-outlined text-6xl text-error">wifi_off</span>
              <h3 className="text-3xl font-black text-on-surface">Error al cargar</h3>
              <p className="text-on-surface-variant">{carsError}</p>
              <button
                onClick={() => { setCarsLoading(true); fetchCars().then(d => { setCarsData(d); setCarsError(null); }).catch(e => setCarsError(e.message)).finally(() => setCarsLoading(false)); }}
                className="bg-primary text-on-primary px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:scale-105 transition-transform"
              >
                Reintentar
              </button>
            </div>
          </section>
        )}

        {/* Catálogo principal */}
        {(carsLoading || (!carsError && featuredCars.length > 0)) && (
          <section id="catalogo" className="bg-surface-container-low px-0 py-14 scroll-mt-36">
            <div className="max-w-7xl mx-auto">
              <div className="mb-10 flex items-end justify-between">
                <div>
                  <h2 className="mb-2 text-3xl font-black tracking-tight">
                    {hasActiveSearch ? 'Resultados recomendados' : 'Catálogo disponible'}
                  </h2>
                  <p className="font-label text-sm uppercase tracking-[0.18em] text-on-surface-variant">
                    {hasActiveSearch ? 'Selección afinada por tu búsqueda' : 'Selección destacada del catálogo'}
                  </p>
                </div>
              </div>
  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                <AnimatePresence mode='popLayout'>
                  {carsLoading ? (
                    <>
                      {Array.from({ length: 6 }).map((_, i) => (
                        <CarCardSkeleton key={`skeleton-main-${i}`} variant="featured" />
                      ))}
                    </>
                  ) : (
                    featuredCars.map(car => (
                      <CarCard 
                        key={car.id}
                        car={car} 
                        onClick={(c) => {
                          window.history.pushState({}, '', `/autos/${c.id}`);
                          setCurrentPath(`/autos/${c.id}`);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        variant="featured"
                      />
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>
          </section>
        )}

        

        {/* Fallback no results — only when not loading and no error */}
        {!carsLoading && !carsError && filteredCars.length === 0 && (
          <section className="mx-0 rounded-[2rem] bg-surface-container-low px-8 py-24">
             <div className="max-w-xl mx-auto text-center space-y-6">
                <span className="material-symbols-outlined text-6xl text-outline-variant">search_off</span>
                <h3 className="text-3xl font-black text-on-surface">Sin coincidencias</h3>
                <p className="text-on-surface-variant">Intenta ajustar tu búsqueda o usa el asistente para encontrar opciones similares.</p>
                <button 
                  onClick={clearFilters}
                  className="bg-primary text-on-primary px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:scale-105 transition-transform"
                >
                  Ver todo el inventario
                </button>
             </div>
          </section>
        )}

 <section className="px-0 py-24">
                        <div className="grid gap-4 md:grid-cols-3">
                  {[
                    {
                      title: 'Inspección técnica integral',
                      detail: 'Vehículos revisados en más de 240 puntos clave.',
                      tone: 'bg-green-100 text-green-700',
                    },
                    {
                      title: 'Garantía y respaldo',
                      detail: 'Acompañamiento postventa para comprar con más calma.',
                      tone: 'bg-blue-100 text-blue-700',
                    },
                    {
                      title: 'Gestión documental',
                      detail: 'Trámites guiados para que el cierre sea más simple.',
                      tone: 'bg-violet-100 text-violet-700',
                    },
                  ].map(item => (
                    <div
                      key={item.title}
                      className="rounded-[1.75rem] border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-[0_12px_32px_rgba(17,28,45,0.06)]"
                    >
                      <div className={`flex h-11 w-11 items-center justify-center rounded-full text-lg font-bold ${item.tone}`}>
                        ✓
                      </div>
                      <h3 className="mt-4 font-display text-xl font-semibold text-on-surface">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                        {item.detail}
                      </p>
                    </div>
                  ))}
                </div>
</section>

        {/* Final CTA Section */}
        <section className="px-0 py-24">
          <div className="max-w-7xl mx-auto bg-primary-container rounded-[2.5rem] p-12 lg:p-24 relative overflow-hidden text-on-primary-container">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/20 -skew-x-12 translate-x-20"></div>
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-5xl md:text-7xl font-black leading-tight tracking-tighter mb-8">¿Quieres una cotización rápida?</h2>
              <p className="text-xl mb-12 opacity-90 leading-relaxed">Deja tus datos, recibe una estimación y, si quieres vender, te contactamos por WhatsApp y correo con la información del formulario.</p>
              <div className="flex flex-col md:flex-row gap-4">
                <button onClick={() => window.location.href = '/cotizar'} className="bg-white text-primary px-8 py-4 rounded-xl font-black text-lg hover:bg-on-primary-container transition-colors flex-1 md:flex-none">
                  Vender mi auto
                </button>
                <button onClick={() => window.location.href = '/'} className="border-2 border-white text-white px-8 py-4 rounded-xl font-black text-lg hover:bg-white/10 transition-colors flex-1 md:flex-none">
                  Ver autos disponibles
                </button>
              </div>
            </div>
          </div>
        </section>

          </div>
        </div>
      </main>

      <Footer />

      {/* Mobile Floating Trigger (Since sidebar is hidden on mobile) */}
      <button
        type="button"
        aria-label="Abrir asistente de búsqueda"
        onClick={() => setIsAssistantOpen(true)}
        className={`lg:hidden fixed bottom-6 right-6 z-[100] flex h-16 w-16 items-center justify-center rounded-full bg-primary text-on-primary shadow-2xl transition-[transform,opacity] duration-200 active:scale-95 ${isAssistantOpen ? 'pointer-events-none opacity-0' : ''}`}
      >
        <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
          chat_bubble
        </span>
      </button>

      {isAssistantOpen && (
        <div className="fixed inset-0 z-[160] lg:hidden">
          <button
            type="button"
            aria-label="Cerrar asistente"
            onClick={() => setIsAssistantOpen(false)}
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[86vh] overflow-hidden rounded-t-3xl shadow-2xl">
            <AssistantPanel
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              input={input}
              onInputChange={setInput}
              filters={filters}
              clearFilters={clearFilters}
              mode="mobile"
              onClose={() => setIsAssistantOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Selected Car Modal */}
      <AnimatePresence>
        {selectedCar && (
          <VehicleDetailModal
            car={selectedCar}
            onClose={() => setSelectedCar(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
