import { useState, useMemo, useEffect } from 'react';
import { Car, Message, SearchFilters } from './types';
import { CARS_DATA } from './data/cars';
import { chatWithAgent } from './services/gemini';
import { Chat } from './components/Chat';
import { CarCard } from './components/CarCard';
import { Footer } from './components/Footer';
import { motion, AnimatePresence } from 'motion/react';
import { Car as CarIcon, Search, SlidersHorizontal, X, Info, MessageCircle, ChevronRight, User } from 'lucide-react';
import { getWhatsAppLink } from './lib/utils';

const ADS = [
  {
    id: 1,
    title: "Financiamiento 0%",
    subtitle: "En modelos seleccionados 2024",
    image: "https://picsum.photos/seed/carad1/1200/400",
    cta: "Ver Modelos",
    color: "#D00000"
  },
  {
    id: 2,
    title: "Bono de $2,000",
    subtitle: "Al entregar tu auto usado como parte de pago",
    image: "https://picsum.photos/seed/carad2/1200/400",
    cta: "Avaluar mi Auto",
    color: "#0078FF"
  },
  {
    id: 3,
    title: "Seguro Gratis",
    subtitle: "Por el primer año en toda la línea SUV",
    image: "https://picsum.photos/seed/carad3/1200/400",
    cta: "Más Info",
    color: "#000000"
  }
];

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [currentAd, setCurrentAd] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentAd((prev) => (prev + 1) % ADS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

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

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-black font-body flex flex-col">
      <nav className="sticky top-0 z-50 bg-black text-white px-8 py-5 flex justify-between items-center border-b border-white/5 backdrop-blur-md bg-black/95">
        <div className="flex items-center gap-3">
          <div className="bg-[#D00000] p-2 rounded-xl shadow-[0_0_20px_rgba(208,0,0,0.3)]">
            <CarIcon size={22} />
          </div>
          <span className="text-2xl font-bold tracking-tighter font-display uppercase">MILLCARS<span className="text-[#D00000]"></span></span>
        </div>
        <div className="hidden lg:flex items-center gap-10 text-[11px] font-medium uppercase tracking-[0.2em] font-display">
          <a href="#" className="hover:text-[#D00000] transition-all duration-300 relative group">
            Inventario
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#D00000] transition-all duration-300 group-hover:w-full"></span>
          </a>
          <a href="#" className="hover:text-[#D00000] transition-all duration-300 relative group">
            Vender
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#D00000] transition-all duration-300 group-hover:w-full"></span>
          </a>
          <a href="#" className="hover:text-[#D00000] transition-all duration-300 relative group">
            Financiamiento
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#D00000] transition-all duration-300 group-hover:w-full"></span>
          </a>
          <a href="#" className="hover:text-[#D00000] transition-all duration-300 relative group">
            Contacto
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#D00000] transition-all duration-300 group-hover:w-full"></span>
          </a>
        </div>
      </nav>

      <main className="max-w-[1700px] mx-auto p-8 grid grid-cols-1 lg:grid-cols-12 gap-10 flex-grow w-full">
        {/* Left Column: Chat - Sticky on Desktop */}
        <div className="lg:col-span-4 xl:col-span-3 lg:h-[calc(100vh-140px)] lg:sticky lg:top-28">
          <Chat 
            messages={messages} 
            onSendMessage={handleSendMessage} 
            isLoading={isLoading} 
          />
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-8">
          {/* Dynamic Ad Banner Section */}
          <div className="relative h-48 md:h-64 rounded-3xl overflow-hidden shadow-xl group">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentAd}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="absolute inset-0"
              >
                <img 
                  src={ADS[currentAd].image} 
                  alt={ADS[currentAd].title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex flex-col justify-center px-12">
                  <motion.span 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-[10px] font-bold text-white/60 uppercase tracking-[0.3em] mb-2 font-display"
                  >
                    Promoción Exclusiva
                  </motion.span>
                  <motion.h2 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-4xl md:text-5xl font-bold text-white font-display tracking-tighter uppercase mb-2"
                  >
                    {ADS[currentAd].title}
                  </motion.h2>
                  <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-white/70 text-sm md:text-base font-medium mb-6 max-w-md"
                  >
                    {ADS[currentAd].subtitle}
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <button 
                      className="px-6 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest text-white transition-all duration-300 font-display shadow-lg"
                      style={{ backgroundColor: ADS[currentAd].color }}
                    >
                      {ADS[currentAd].cta}
                    </button>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>
            
            {/* Ad Indicators */}
            <div className="absolute bottom-6 right-12 flex gap-2">
              {ADS.map((_, i) => (
                <button 
                  key={i}
                  onClick={() => setCurrentAd(i)}
                  className={`h-1 rounded-full transition-all duration-500 ${currentAd === i ? 'w-8 bg-white' : 'w-2 bg-white/30'}`}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-black font-display tracking-tight">
                  {filteredCars.length} <span className="text-black/20 uppercase text-sm tracking-widest ml-1">Vehículos Disponibles</span>
                </h1>
                {Object.keys(filters).length > 0 && (
                  <span className="text-[9px] font-bold text-[#0078FF] bg-[#0078FF]/5 px-2 py-0.5 rounded-md font-mono uppercase tracking-widest">
                    AI Filtered
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {Object.keys(filters).length > 0 && (
                <button 
                  onClick={clearFilters}
                  className="flex items-center gap-2 text-[10px] font-bold text-[#D00000] hover:text-black transition-colors font-display uppercase tracking-widest"
                >
                  <X size={14} />
                  Resetear Filtros
                </button>
              )}
              <div className="flex items-center gap-2 bg-black/5 p-1 rounded-xl">
                <button className="p-2 bg-white shadow-sm rounded-lg text-black">
                  <SlidersHorizontal size={16} />
                </button>
                <button className="p-2 text-black/30 hover:text-black transition-colors">
                  <Search size={16} />
                </button>
              </div>
            </div>
          </div>

          {Object.keys(filters).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {Object.entries(filters).map(([key, value]) => {
                if (value === undefined || value === '') return null;
                return (
                  <div key={key} className="bg-white border border-black/5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 font-display shadow-sm">
                    <span className="text-black/20">{key}</span>
                    <span className="text-black">{value}</span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="pb-12">
            {filteredCars.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence mode='popLayout'>
                  {filteredCars.map(car => (
                    <CarCard 
                      key={car.id} 
                      car={car} 
                      onClick={setSelectedCar} 
                    />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="h-[500px] flex flex-col items-center justify-center text-center p-12 bg-white rounded-3xl border border-dashed border-black/10">
                <div className="w-20 h-20 bg-black/5 rounded-full flex items-center justify-center mb-6">
                  <Search size={32} className="text-black/10" />
                </div>
                <h3 className="text-xl font-bold mb-2 font-display uppercase tracking-tight">Sin coincidencias</h3>
                <p className="text-black/40 max-w-sm text-sm font-medium">
                  Refina tu conversación con carsAgent para encontrar el vehículo ideal.
                </p>
                <button 
                  onClick={clearFilters}
                  className="mt-6 px-8 py-3 bg-black text-white rounded-xl font-bold hover:bg-[#D00000] transition-all duration-300 font-display uppercase text-[10px] tracking-widest shadow-lg shadow-black/10"
                >
                  Ver Inventario Completo
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      <AnimatePresence>
        {selectedCar && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12">
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
              className="relative w-full max-w-6xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row max-h-[90vh]"
            >
              <button 
                onClick={() => setSelectedCar(null)}
                className="absolute top-6 right-6 z-10 w-10 h-10 bg-black/5 hover:bg-[#D00000] hover:text-white text-black rounded-full flex items-center justify-center transition-all duration-300"
              >
                <X size={20} />
              </button>

              <div className="lg:w-3/5 h-80 lg:h-auto relative overflow-hidden">
                <img 
                  src={selectedCar.image} 
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  alt={selectedCar.model}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-10 left-10">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-[#D00000] text-white px-3 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest font-display">
                      {selectedCar.condition}
                    </span>
                    <span className="text-white/60 font-mono text-[10px] tracking-widest">EST. {selectedCar.year}</span>
                  </div>
                  <h2 className="text-5xl font-bold text-white font-display tracking-tighter uppercase">
                    {selectedCar.brand} <span className="text-white/40">{selectedCar.model}</span>
                  </h2>
                </div>
              </div>

              <div className="lg:w-2/5 p-10 lg:p-12 overflow-y-auto bg-white">
                <div className="flex justify-between items-end mb-10 border-b border-black/5 pb-6">
                  <div>
                    <span className="text-[9px] font-bold text-black/30 uppercase tracking-widest mb-1 block font-display">Status</span>
                    <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest font-display">Disponible</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-bold text-black/30 uppercase tracking-widest mb-1 block font-display">Cotización</span>
                    <div className="bg-black/5 px-4 py-2 rounded-xl blur-[8px] select-none text-2xl font-bold font-display">
                      $XX.XXX
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <h4 className="text-[9px] font-bold uppercase tracking-widest text-black/20 mb-4 font-display">Reseña del Experto</h4>
                    <p className="text-black/60 leading-relaxed font-body text-sm">
                      {selectedCar.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-x-6 gap-y-8">
                    <div>
                      <h4 className="text-[9px] font-bold uppercase tracking-widest text-black/20 mb-2 font-display">Recorrido</h4>
                      <p className="text-lg font-bold tracking-tight">{new Intl.NumberFormat('es-EC').format(selectedCar.mileage)} <span className="text-[10px] text-black/30">KM</span></p>
                    </div>
                    <div>
                      <h4 className="text-[9px] font-bold uppercase tracking-widest text-black/20 mb-2 font-display">Transmisión</h4>
                      <p className="text-lg font-bold font-display uppercase tracking-tight">{selectedCar.transmission}</p>
                    </div>
                    <div>
                      <h4 className="text-[9px] font-bold uppercase tracking-widest text-black/20 mb-2 font-display">Motorización</h4>
                      <p className="text-lg font-bold font-display uppercase tracking-tight">{selectedCar.fuelType}</p>
                    </div>
                    <div>
                      <h4 className="text-[9px] font-bold uppercase tracking-widest text-black/20 mb-2 font-display">Identificación</h4>
                      <p className="text-lg font-bold tracking-tight">PLACA <span className="text-[#D00000]">***{selectedCar.plateEnd}</span></p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[9px] font-bold uppercase tracking-widest text-black/20 mb-4 font-display">Equipamiento Premium</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCar.features.map((f, i) => (
                        <span key={i} className="bg-black/[0.03] border border-black/[0.05] px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider font-display text-black/60">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 flex flex-col gap-3">
                    <a 
                      href={getWhatsAppLink(selectedCar.brand, selectedCar.model, selectedCar.year)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-4 bg-[#25D366] text-white rounded-xl font-bold uppercase tracking-widest hover:bg-[#128C7E] transition-all duration-300 transform hover:scale-[1.01] flex items-center justify-center gap-3 font-display text-[10px] shadow-lg shadow-[#25D366]/10"
                    >
                      <MessageCircle size={18} />
                      Solicitar Cotización
                    </a>
                    <button className="w-full py-4 bg-black text-white rounded-xl font-bold uppercase tracking-widest hover:bg-[#D00000] transition-all duration-300 transform hover:scale-[1.01] font-display text-[10px] shadow-lg shadow-black/10">
                      Agendar Test Drive
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

