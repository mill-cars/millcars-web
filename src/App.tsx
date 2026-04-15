import { useState, useMemo, useEffect } from 'react';
import { Car, Message, SearchFilters } from './types';
import { CARS_DATA } from './data/cars';
import { chatWithAgent } from './services/gemini';
import { CarCard } from './components/CarCard';
import { motion, AnimatePresence } from 'motion/react';
import { formatNumber, getWhatsAppLink } from './lib/utils';
import { AdminDashboard } from './components/AdminDashboard';
import { Login } from './components/Login';
import { Vender } from './components/Vender';
import { PublicHeader } from './components/PublicHeader';
import { Footer } from './components/Footer';
import { Button } from './components/Button';
import { AssistantPanel } from './components/AssistantPanel';

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const isAdminPage = currentPath === '/admin';
  const isLoginPage = currentPath === '/login';
  const isSellPage = currentPath === '/vender';

  useEffect(() => {
    const onPopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const [messages, setMessages] = useState<Message[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [input, setInput] = useState('');
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  const hasActiveSearch = messages.length > 0 || Object.keys(filters).length > 0;

  const filteredCars = useMemo(() => {
    return CARS_DATA.filter(car => {
      // Multi-value brand filter
      if (filters.brand) {
        const brands = filters.brand.toLowerCase().split(',').map(b => b.trim());
        if (!brands.some(b => car.brand.toLowerCase().includes(b))) return false;
      }
      
      // Multi-value model filter
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
      
      // New filters
      if (filters.fuelType && !car.fuelType.toLowerCase().includes(filters.fuelType.toLowerCase())) return false;
      if (filters.transmission && !car.transmission.toLowerCase().includes(filters.transmission.toLowerCase())) return false;
      
      // General query search
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
  }, [filters]);

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
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.message,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, botMessage]);
      
      if (response.filters && Object.keys(response.filters).length > 0) {
        setFilters(prev => ({ ...prev, ...response.filters }));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({});
    setMessages([]);
  };

  const featuredCars = filteredCars.slice(0, 3);
  const usedPopularCars = filteredCars.slice(3, 10);

  if (isAdminPage) {
    return <AdminDashboard />;
  }

  if (isLoginPage) {
    return <Login />;
  }

  if (isSellPage) {
    return <Vender />;
  }

  return (
    <div className="min-h-screen bg-surface">
      <PublicHeader active="inventario" ctaLabel="Ingresar" ctaHref="/login" />

      <main className="flex-1 overflow-x-hidden px-4 pb-0 pt-[112px] sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-[1600px] items-start gap-8 xl:grid-cols-[320px_minmax(0,1fr)]">
          <div className="hidden self-start lg:block">
            <div className="lg:sticky lg:top-[118px]">
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

          <div className="min-w-0">
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
                  <h1 className="max-w-4xl font-display text-5xl font-semibold leading-[0.95] tracking-[-0.05em] text-on-surface sm:text-6xl lg:text-[5.25rem]">
                    Showroom digital para
                    <span className="mt-2 block text-primary italic">
                      autos excepcionales.
                    </span>
                  </h1>
                  <p className="max-w-2xl text-lg leading-8 text-on-surface-variant sm:text-[1.35rem]">
                    Descubre, compara y vende con una experiencia m&aacute;s precisa, confiable y elegante. IA que entiende tus preferencias y acelera cada decisi&oacute;n.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button variant="primary" size="lg" className="flex items-center gap-2 shadow-xl shadow-primary/20" onClick={() => window.location.href = '/'}>
                      Explorar inventario
                      <span className="material-symbols-outlined">arrow_forward</span>
                    </Button>
                    <Button variant="secondary" size="lg" onClick={() => window.location.href = '/vender'}>
                      Valorar mi auto
                    </Button>
                  </div>
                </div>
                <div className="col-span-12 lg:col-span-5 relative mt-12 lg:mt-0">
                  <div className="absolute -top-20 -right-20 h-96 w-96 rounded-full bg-primary-fixed-dim/30 blur-[120px]"></div>
                  <div className="relative space-y-4">
                    <div className="group relative overflow-hidden rounded-[2rem] border border-outline-variant/30 bg-surface-container-low shadow-[0_24px_80px_rgba(17,28,45,0.12)]">
                      <div className="absolute inset-0 bg-gradient-to-t from-[#111c2d]/75 via-[#111c2d]/10 to-transparent z-10"></div>
                      <img
                        alt="Fachada principal de Millcars"
                        className="h-[420px] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        src="/assets/millcars-rif.webp"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-x-0 bottom-0 z-20 p-6 text-white">
                        <p className="font-label text-[11px] uppercase tracking-[0.18em] text-white/75">
                          Presencia de marca
                        </p>
                        <h3 className="mt-2 font-display text-2xl font-semibold leading-tight">
                          Una vitrina confiable, física y digital.
                        </h3>
                        <p className="mt-2 max-w-sm text-sm leading-6 text-white/80">
                          Combinamos respaldo comercial, curaduría visual y atención asistida para elevar la experiencia de compra.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      {featuredCars.map((car, index) => (
                        <div
                          key={car.id}
                          className="group relative overflow-hidden rounded-[1.5rem] border border-outline-variant/20 bg-surface-container-low shadow-[0_12px_32px_rgba(17,28,45,0.08)]"
                        >
                          <div className="absolute inset-0 bg-gradient-to-t from-[#111c2d]/70 via-[#111c2d]/10 to-transparent z-10"></div>
                          <img
                            alt={`${car.brand} ${car.model}`}
                            className="h-48 w-full object-cover transition-transform duration-700 group-hover:scale-105"
                            src={car.image}
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-x-0 bottom-0 z-20 p-4 text-white">
                            <p className="font-label text-[10px] uppercase tracking-[0.18em] text-white/70">
                              {index === 0 ? 'Selección destacada' : index === 1 ? 'Listo para entregar' : 'Publicidad de inventario'}
                            </p>
                            <h4 className="mt-1 font-display text-lg font-semibold leading-tight">
                              {car.brand} {car.model}
                            </h4>
                            <p className="mt-1 text-sm text-white/80">
                              {car.year} · ${formatNumber(car.price)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="max-w-7xl mx-auto mt-16">
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
              </div>
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
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-outline">carsAgent · Resultados</p>
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

        {/* Featured Car (Destacados) */}
        {featuredCars.length > 0 && (
          <section className="bg-surface-container-low px-0 py-14">
            <div className="max-w-7xl mx-auto">
              <div className="mb-10 flex items-end justify-between">
                <div>
                  <h2 className="mb-2 text-3xl font-black tracking-tight">
                    {hasActiveSearch ? 'Resultados recomendados' : 'Destacados'}
                  </h2>
                  <p className="font-label text-sm uppercase tracking-[0.18em] text-on-surface-variant">
                    {hasActiveSearch ? 'Selección afinada por tu búsqueda' : 'Ingeniería de Precisión y Lujo Moderno'}
                  </p>
                </div>
                <a className="text-primary font-bold hidden md:flex items-center gap-2 hover:translate-x-1 transition-transform" href="#">
                  Ver Todos <span className="material-symbols-outlined">arrow_right_alt</span>
                </a>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                <AnimatePresence mode='popLayout'>
                  {featuredCars.map(car => (
                    <CarCard 
                      key={car.id} 
                      car={car} 
                      onClick={setSelectedCar} 
                      variant="featured"
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </section>
        )}

        {/* Popular Used Cars */}
        {usedPopularCars.length > 0 && (
          <section className="overflow-hidden bg-surface px-0 py-24">
            <div className="max-w-7xl mx-auto">
              <div className="mb-12">
                <h2 className="text-4xl font-black tracking-tight mb-2">Selección de Usados Populares</h2>
                <p className="text-on-surface-variant font-label text-sm uppercase tracking-widest">Certificados y Pre-Inspeccionados</p>
              </div>
              <div className="flex space-x-8 overflow-x-auto pb-12 snap-x no-scrollbar">
                <AnimatePresence mode='popLayout'>
                  {usedPopularCars.map(car => (
                    <CarCard 
                      key={car.id} 
                      car={car} 
                      onClick={setSelectedCar} 
                      variant="used"
                    />
                  ))}
                </AnimatePresence>
                {/* Fallback padding so the last item isn't strictly against the edge if scrolling */}
                <div className="min-w-4 shrink-0"></div>
              </div>
            </div>
          </section>
        )}

        {/* Fallback no results */}
        {filteredCars.length === 0 && (
          <section className="mx-0 rounded-[2rem] bg-surface-container-low px-8 py-24">
             <div className="max-w-xl mx-auto text-center space-y-6">
                <span className="material-symbols-outlined text-6xl text-outline-variant">search_off</span>
                <h3 className="text-3xl font-black text-on-surface">Sin coincidencias</h3>
                <p className="text-on-surface-variant">Intenta ajustar tu búsqueda o pídele asistencia a carsAgent para encontrar opciones similares.</p>
                <button 
                  onClick={clearFilters}
                  className="bg-primary text-on-primary px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:scale-105 transition-transform"
                >
                  Ver todo el inventario
                </button>
             </div>
          </section>
        )}

        {/* Final CTA Section */}
        <section className="px-0 py-24">
          <div className="max-w-7xl mx-auto bg-primary-container rounded-[2.5rem] p-12 lg:p-24 relative overflow-hidden text-on-primary-container">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/20 -skew-x-12 translate-x-20"></div>
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-5xl md:text-7xl font-black leading-tight tracking-tighter mb-8">¿Listo para estrenar?</h2>
              <p className="text-xl mb-12 opacity-90 leading-relaxed">Explora nuestro catálogo verificado o recibe una oferta por tu auto actual. Todo en minutos, sin intermediarios.</p>
              <div className="flex flex-col md:flex-row gap-4">
                <button onClick={() => window.location.href = '/'} className="bg-white text-primary px-8 py-4 rounded-xl font-black text-lg hover:bg-on-primary-container transition-colors flex-1 md:flex-none">
                  Ver autos disponibles
                </button>
                <button onClick={() => window.location.href = '/vender'} className="border-2 border-white text-white px-8 py-4 rounded-xl font-black text-lg hover:bg-white/10 transition-colors flex-1 md:flex-none">
                  Cotizar mi auto
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
        className="lg:hidden fixed bottom-6 right-6 z-[100] flex h-16 w-16 items-center justify-center rounded-full bg-primary text-on-primary shadow-2xl transition-transform active:scale-95"
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
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 md:p-12">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCar(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="relative w-full max-w-6xl bg-surface rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row max-h-[90vh]"
            >
              <button 
                onClick={() => setSelectedCar(null)}
                className="absolute top-6 right-6 z-10 w-10 h-10 bg-black/20 hover:bg-black/50 hover:text-white text-white rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur"
              >
                <span className="material-symbols-outlined">close</span>
              </button>

              <div className="lg:w-3/5 h-80 lg:h-auto relative overflow-hidden">
                <img 
                  src={selectedCar.image} 
                  className="w-full h-full object-cover"
                  alt={selectedCar.model}
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-10 left-10">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-primary text-on-primary px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest">
                      {selectedCar.condition}
                    </span>
                    <span className="text-white/60 font-mono text-[10px] tracking-widest font-bold">EST. {selectedCar.year}</span>
                  </div>
                  <h2 className="text-5xl font-black text-white tracking-tighter uppercase">
                    {selectedCar.brand} <br/><span className="text-white/60">{selectedCar.model}</span>
                  </h2>
                </div>
              </div>

              <div className="lg:w-2/5 p-10 lg:p-12 overflow-y-auto bg-surface flex flex-col">
                <div className="flex justify-between items-end mb-10 border-b border-outline-variant/20 pb-6 shrink-0">
                  <div>
                    <span className="text-[9px] font-black text-outline uppercase tracking-widest mb-1 block">Status</span>
                    <p className="text-xs font-bold text-whatsapp uppercase tracking-widest">Disponible</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-black text-outline uppercase tracking-widest mb-1 block">Cotización</span>
                    <div className="bg-surface-container-high px-4 py-2 rounded-xl price-blur text-2xl font-black text-on-surface">
                      $XX.XXX
                    </div>
                  </div>
                </div>

                <div className="space-y-8 flex-1">
                  <div>
                    <h4 className="text-[9px] font-black uppercase tracking-widest text-outline mb-4">Reseña del Experto</h4>
                    <p className="text-on-surface-variant leading-relaxed text-sm font-medium">
                      {selectedCar.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-x-6 gap-y-8">
                    <div>
                      <h4 className="text-[9px] font-black uppercase tracking-widest text-outline mb-2">Recorrido</h4>
                      <p className="text-lg font-black tracking-tight">{formatNumber(selectedCar.mileage)} <span className="text-[10px] text-outline font-bold">KM</span></p>
                    </div>
                    <div>
                      <h4 className="text-[9px] font-black uppercase tracking-widest text-outline mb-2">Transmisión</h4>
                      <p className="text-lg font-black uppercase tracking-tight">{selectedCar.transmission}</p>
                    </div>
                    <div>
                      <h4 className="text-[9px] font-black uppercase tracking-widest text-outline mb-2">Motorización</h4>
                      <p className="text-lg font-black uppercase tracking-tight">{selectedCar.fuelType}</p>
                    </div>
                    <div>
                      <h4 className="text-[9px] font-black uppercase tracking-widest text-outline mb-2">Identificación</h4>
                      <p className="text-lg font-black tracking-tight flex items-center gap-1">PLACA <span className="text-primary bg-primary/10 px-2 rounded font-mono">***{selectedCar.plateEnd}</span></p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[9px] font-black uppercase tracking-widest text-outline mb-4">Equipamiento Premium</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCar.features.map((f, i) => (
                        <span key={i} className="bg-surface-container-high px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider text-on-surface-variant">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="pt-8 flex gap-3 shrink-0 mt-8 border-t border-outline-variant/10">
                  <a 
                    href={getWhatsAppLink(selectedCar.brand, selectedCar.model, selectedCar.year)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-[2] py-4 bg-whatsapp text-white rounded-xl font-black uppercase tracking-widest hover:opacity-90 transition-all duration-300 transform hover:scale-[1.01] flex items-center justify-center gap-3 text-[10px] shadow-xl shadow-whatsapp/20"
                  >
                    <span className="material-symbols-outlined text-lg" style={{fontVariationSettings: "'FILL' 1"}}>chat</span>
                    Solicitar Cotización
                  </a>
                  <button className="flex-1 py-4 bg-black text-white rounded-xl font-black uppercase tracking-widest hover:bg-slate-900 transition-all duration-300 transform hover:scale-[1.01] flex items-center justify-center text-[10px]">
                    Test Drive
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
