import React, { useEffect, useState, useRef, useCallback } from 'react';
import { PublicHeader } from './PublicHeader';
import { Footer } from './Footer';
import { Car, Category } from '../types';
import { fetchPaginatedCars, fetchCategories, fetchCars } from '../services/carsService';
import { useAuth } from '../context/AuthContext';
import { getWhatsAppLink, countActiveFilters, filterCarsByFilters, formatCurrency } from '../lib/utils';
import { notifyWhatsAppClick } from '../services/notificationService';
import { AssistantPanel } from './AssistantPanel';
import { useAssistant } from '../hooks/useAssistant';
import { CountdownTimer } from './CountdownTimer';
import { Helmet } from 'react-helmet-async';

const LIMIT = 12;

export function CatalogoPage() {
  const { user } = useAuth();

  // ── Cars ────────────────────────────────────────────────────────────────
  const [cars, setCars] = useState<Car[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  // ── Categories ──────────────────────────────────────────────────────────
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // ── Search ──────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');

  // ── Assistant ───────────────────────────────────────────────────────────
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [allCars, setAllCars] = useState<Car[]>([]);
  const assistant = useAssistant(allCars);

  const handleCloseAssistant = () => {
    if (assistant.isLoading) {
      alert('Existe una consulta en curso. Por favor, espera a que finalice para cerrar el asistente.');
      return;
    }
    setIsAssistantOpen(false);
  };

  useEffect(() => {
    fetchCars().then(setAllCars).catch(console.error);
  }, []);

  // ── Client-side text search & AI filters ─────────────────────────────────
  const activeFilterCount = countActiveFilters(assistant.filters as object);
  const isAssistantFiltering = assistant.messages.length > 0 || activeFilterCount > 0;

  // ── Infinite scroll sentinel ────────────────────────────────────────────
  const observer = useRef<IntersectionObserver | null>(null);
  const lastCarElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading || isAssistantFiltering) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore, isAssistantFiltering]);

  // ── Load categories once ────────────────────────────────────────────────
  useEffect(() => {
    fetchCategories().then(setCategories).catch(console.error);
  }, []);

  // ── Reset + reload when category changes ────────────────────────────────
  useEffect(() => {
    setCars([]);
    setPage(1);
    setHasMore(true);
  }, [selectedCategory]);

  // ── Load cars page ──────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetchPaginatedCars(page, LIMIT, selectedCategory)
      .then(({ cars: newCars, total }) => {
        if (cancelled) return;
        setCars(prev => {
          const map = new Map([...prev, ...newCars].map(c => [c.id, c]));
          return Array.from(map.values());
        });
        setHasMore(page * LIMIT < total);
      })
      .catch(err => console.error('Error loading cars:', err))
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [page, selectedCategory]);

  // Use AI filtered cars if active, otherwise use paginated normal catalog
  const displayCars = isAssistantOpen && isAssistantFiltering
    ? filterCarsByFilters(allCars, assistant.filters)
    : cars;

  const filteredCars = displayCars.filter(car =>
    car.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    car.model.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Catálogo de vehículos Millcars",
    "description": "Listado de autos nuevos importados y usados disponibles en Millcars",
    "url": "https://www.millcars.com/catalogo"
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col font-label text-on-surface selection:bg-primary/20">
      <Helmet>
        <title>Catálogo de autos en venta | Millcars</title>
        <meta name="description" content="Explora el catálogo de autos nuevos importados y usados de Millcars. Compra o vende tu vehículo con asesoría personalizada y total seguridad." />
        <meta property="og:title" content="Catálogo de vehículos | Millcars" />
        <meta property="og:description" content="Autos nuevos importados y usados disponibles en Millcars" />
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
      </Helmet>
      
      <PublicHeader active="catalogo" ctaLabel="Ingresar" ctaHref="/login" />

      <main className="flex-1 w-full min-w-0 pt-[112px] pb-24">

        {/* ── Title ──────────────────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 lg:px-0 w-full mt-4 md:mt-8 mb-4">
          <span className="text-primary font-black text-[10px] tracking-[0.15em] uppercase mb-1 block"><div className="inline-flex items-center self-start rounded-full bg-primary-fixed px-3.5 py-1.5 font-label text-[11px] font-semibold uppercase tracking-[0.18em] text-on-primary-fixed">
                    Catálogo Premium
          </div></span>
          <h1 className="text-5xl md:text-[35px] font-display font-bold text-on-surface tracking-tight">Catálogo de vehículos en venta | Autos nuevos importados y usados</h1>
          <p className="mt-4 text-on-surface-variant max-w-3xl leading-relaxed text-sm md:text-base">
            Explora nuestro catálogo exclusivo de vehículos. Contamos con una selecta variedad de <strong className="font-semibold text-on-surface">autos nuevos importados y usados</strong> en excelentes condiciones. En Millcars te ofrecemos asesoría personalizada, seguridad en cada transacción y la confianza que necesitas para realizar la mejor compra.
          </p>
        </div>

        {/* ── Search bar & Assistant Toggle ──────────────────────────────── */}
        <div className="px-4 py-3 bg-surface-container-lowest max-w-7xl mx-auto w-full md:rounded-t-2xl md:mt-4 flex gap-2">
          <div className="flex-1 flex items-center gap-2 bg-surface-container-low rounded-xl px-3 py-2 border border-outline-variant focus-within:border-primary transition-colors">
            <span className="material-symbols-outlined text-outline">search</span>
            <input
              className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-outline"
              placeholder="Buscar marcas, modelos..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-outline hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>
        </div>

        {/* ── Category bubbles (from DB) ───────────────────────────────── */}
        <div className="overflow-x-auto scrollbar-hide bg-surface-container-lowest border-b border-outline-variant/20 max-w-7xl mx-auto w-full">
          <div className="flex gap-2 px-4 py-3 min-w-max md:gap-3">

            {/* "Todos" bubble */}
            <button
              onClick={() => setSelectedCategory(null)}
              className={`flex flex-col items-center gap-1.5 transition-all active:scale-95 group`}
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all border-2 ${
                selectedCategory === null
                  ? 'bg-primary border-primary shadow-md shadow-primary/20'
                  : 'bg-surface-container border-outline-variant/50 hover:border-primary/40'
              }`}>
                <span className={`material-symbols-outlined text-2xl ${selectedCategory === null ? 'text-white' : 'text-outline group-hover:text-primary'}`}
                  style={{ fontVariationSettings: "'FILL' 1" }}>
                  grid_view
                </span>
              </div>
              <span className={`text-[9px] font-black uppercase tracking-wider leading-none ${
                selectedCategory === null ? 'text-primary' : 'text-outline group-hover:text-on-surface'
              } transition-colors`}>
                Todos
              </span>
            </button>

            {/* Dynamic categories from DB */}
            {categories.filter(cat => cat.car_count > 0).map(cat => {
              const isActive = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.slug}
                  onClick={() => setSelectedCategory(isActive ? null : cat.slug)}
                  className="flex flex-col items-center gap-1.5 transition-all active:scale-95 group"
                >
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all border-2 ${
                    isActive
                      ? 'bg-primary border-primary shadow-md shadow-primary/20'
                      : 'bg-surface-container border-outline-variant/50 hover:border-primary/40'
                  }`}>
                    <span
                      className={`material-symbols-outlined text-2xl ${isActive ? 'text-white' : 'text-outline group-hover:text-primary'}`}
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {cat.icon}
                    </span>
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-wider leading-none ${
                    isActive ? 'text-primary' : 'text-outline group-hover:text-on-surface'
                  } transition-colors max-w-[60px] text-center leading-tight`}>
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Active filter pill + Flash Sale banner ─────────────────── */}
        <div className="max-w-7xl mx-auto px-4 lg:px-0 mt-4 mb-5 flex flex-col gap-4">
          
          {/* Flash Sale Banner */}
          <div className="bg-secondary text-white px-5 py-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl shadow-secondary/25 w-full">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-yellow-300 text-2xl shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-90">Oferta Relámpago</p>
                <p className="font-bold text-sm">¡Precio especial por tiempo limitado!</p>
              </div>
            </div>
            <CountdownTimer />
          </div>

          {/* Active category chip */}
          {selectedCategory && (() => {
            const activeCat = categories.find(c => c.slug === selectedCategory);
            return activeCat ? (
              <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary rounded-full px-4 py-1.5 text-xs font-bold self-start mb-2">
                <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>{activeCat.icon}</span>
                {activeCat.name}
                <button onClick={() => setSelectedCategory(null)} className="ml-1 hover:text-secondary transition-colors">
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </div>
            ) : null;
          })()}
        </div>



        {/* Product Grid — 2 cols mobile → 3 tablet → 4 desktop → 5 xl */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 px-4 sm:px-6 lg:px-0 max-w-7xl mx-auto">
          {filteredCars.map((car, index) => {
            const isLastElement = index === filteredCars.length - 1;
            const promotionConfig = {
              flash_sale:    { label: 'Flash Sale',    bg: 'bg-[#c81e45]', icon: 'bolt' },
              oferta:        { label: 'Oferta',        bg: 'bg-orange-500', icon: 'local_offer' },
              mejor_vendido: { label: 'Más Vendido',   bg: 'bg-primary',   icon: 'local_fire_department' },
            };
            const promo = car.promotion ? promotionConfig[car.promotion] : null;

            return (
              <div
                ref={isLastElement ? lastCarElementRef : null}
                key={car.id}
                className="bg-white rounded-2xl overflow-hidden flex flex-col border border-outline-variant/30 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 cursor-pointer group"
                onClick={() => { window.location.href = `/autos/${car.id}`; }}
              >
                {/* ── Image ── */}
                <div className="relative aspect-[4/3] overflow-hidden bg-surface-container-low">
                  {/* Top gradient so tags always readable */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-transparent z-10 pointer-events-none" />
                  <img
                    src={car.image}
                    alt={`${car.brand} ${car.model}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* ── Floating badges ── */}
                  <div className="absolute top-2.5 left-2.5 z-20 flex flex-col gap-1.5">
                    {/* Millcars Certified — from DB */}
                    {car.isCertified && (
                      <div className="inline-flex items-center gap-1 bg-white/95 backdrop-blur-sm text-[#111c2d] pl-1.5 pr-2.5 py-[3px] rounded-full shadow-sm">
                        <span className="material-symbols-outlined text-amber-500 text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                        <span className="text-[8px] font-black uppercase tracking-wider leading-none">Millcars Certified</span>
                      </div>
                    )}
                    {/* Promotion — from DB */}
                    {promo && (
                      <div className={`inline-flex items-center gap-1 ${promo.bg} text-white pl-1.5 pr-2.5 py-[3px] rounded-full shadow-sm`}>
                        <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>{promo.icon}</span>
                        <span className="text-[8px] font-black uppercase tracking-wider leading-none">{promo.label}</span>
                      </div>
                    )}
                    {/* Electric fuel type */}
                    {car.fuelType === 'eléctrico' && (
                      <div className="inline-flex items-center gap-1 bg-[#0047FF] text-white pl-1.5 pr-2.5 py-[3px] rounded-full shadow-sm">
                        <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>ev_station</span>
                        <span className="text-[8px] font-black uppercase tracking-wider leading-none">Eléctrico</span>
                      </div>
                    )}
                  </div>

                  {/* Favorite button — top-right */}
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-2.5 right-2.5 z-20 w-7 h-7 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-all hover:bg-white hover:text-rose-500 hover:scale-110 active:scale-95"
                    aria-label="Agregar a favoritos"
                  >
                    <span className="material-symbols-outlined text-[17px]">favorite</span>
                  </button>
                </div>

                {/* ── Info body ── */}
                <div className="flex flex-col flex-grow p-3 sm:p-4">
                  {/* Title optimized for SEO */}
                  <h2 className="font-display font-bold text-sm sm:text-base md:text-[17px] leading-tight text-on-surface mb-1">
                    {car.brand} {car.model} {car.year} en venta
                  </h2>
                  {/* Price */}
                  <div className="flex items-baseline gap-1 mt-1 mb-2">
                    <span className="text-base sm:text-[17px] font-black text-primary leading-none">{formatCurrency(car.price)}</span>
                    <span className="text-[9px] text-outline font-semibold uppercase tracking-wide">USD</span>
                  </div>

                  {/* Short optimized description */}
                  <p className="text-[11px] sm:text-xs text-on-surface-variant line-clamp-2 mb-3 leading-relaxed">
                    Vehículo {car.condition === 'nuevo' ? 'nuevo importado' : 'usado'} disponible en Millcars en excelente estado. Conoce más detalles y especificaciones.
                  </p>

                  {/* Condition + Year row */}
                  <div className="flex items-center gap-2 mt-auto flex-wrap">
                    {car.condition === 'nuevo' ? (
                      <span className="inline-flex items-center gap-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wide">
                        <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>new_releases</span>
                        Nuevo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wide">
                        <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                        Usado
                      </span>
                    )}
                    <div className="flex items-center gap-1 text-[10px] sm:text-xs text-on-surface-variant font-semibold">
                      <span className="material-symbols-outlined text-[13px] opacity-50">calendar_today</span>
                      {car.year}
                    </div>
                  </div>
                </div>

                {/* ── Action buttons ── */}
                <div className="px-3 pb-3 sm:px-4 sm:pb-4 flex gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); window.location.href = `/autos/${car.id}`; }}
                    className="flex-1 min-w-0 bg-primary text-white py-2 rounded-xl font-bold text-[11px] sm:text-sm flex items-center justify-center shadow-sm shadow-primary/20 active:scale-95 hover:bg-primary/90 transition-all truncate"
                  >
                    Ver Detalles
                  </button>
                  <a
                    href={getWhatsAppLink(car.brand, car.model, car.year)}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => { e.stopPropagation(); notifyWhatsAppClick(car, 'catalogo'); }}
                    className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 bg-[#25D366] text-white rounded-xl flex items-center justify-center active:scale-95 hover:bg-[#20b858] transition-all shadow-sm shadow-[#25D366]/20"
                    aria-label="Consultar por WhatsApp"
                  >
                    <span className="material-symbols-outlined text-[18px] sm:text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── LLMO / Semantic Content (SEO) ────────────────────────────── */}
        {filteredCars.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 lg:px-0 mt-16 mb-8 grid grid-cols-1 md:grid-cols-2 gap-8 text-on-surface-variant">
            <section className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/30 hover:border-primary/30 transition-colors shadow-sm">
              <h2 className="text-xl font-display font-bold text-on-surface mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>handshake</span>
                Compra tu próximo vehículo con Millcars
              </h2>
              <p className="leading-relaxed text-sm">
                Explora nuestro <strong className="text-on-surface font-semibold">catálogo actualizado</strong> con las mejores opciones del mercado. Todos nuestros <strong className="text-on-surface font-semibold">vehículos son seleccionados y verificados</strong> rigurosamente para garantizar tu tranquilidad y seguridad. Además, te ofrecemos <strong className="text-on-surface font-semibold">acompañamiento en todo el proceso</strong> de compra o venta, desde la primera consulta hasta la entrega definitiva de las llaves.
              </p>
            </section>

            <section className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/30 hover:border-primary/30 transition-colors shadow-sm">
              <h2 className="text-xl font-display font-bold text-on-surface mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                ¿Qué es el catálogo de Millcars?
              </h2>
              <p className="leading-relaxed text-sm">
                El catálogo de Millcars es una plataforma digital avanzada diseñada para mostrar nuestro inventario en tiempo real. Aquí podrás encontrar de manera rápida y estructurada una extensa variedad de <strong className="text-on-surface font-semibold">autos nuevos importados y vehículos usados premium</strong>. Nuestro sistema está optimizado para brindarte toda la información técnica y comercial relevante, facilitando la toma de decisiones y ofreciéndote una experiencia de compra automotriz superior y transparente.
              </p>
            </section>
          </div>
        )}


        {loading && (
          <div className="flex justify-center py-10">
            <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
          </div>
        )}

        {!hasMore && filteredCars.length > 0 && (
          <div className="text-center py-10 text-sm text-outline font-medium flex flex-col items-center gap-2">
            <span className="material-symbols-outlined text-outline/50 text-3xl">check_circle</span>
            Has llegado al final del catálogo
          </div>
        )}

      </main>

      <Footer />

      {/* Floating Trigger (Mobile & Desktop) */}
      <button
        type="button"
        aria-label="Abrir asistente de búsqueda"
        onClick={() => setIsAssistantOpen(true)}
        className={`fixed bottom-6 right-6 lg:bottom-10 lg:right-10 z-[100] flex h-16 w-16 items-center justify-center rounded-full bg-primary text-on-primary shadow-2xl transition-[transform,opacity] duration-200 hover:scale-105 active:scale-95 ${isAssistantOpen ? 'pointer-events-none opacity-0' : ''}`}
      >
        <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
          chat_bubble
        </span>
      </button>

      {/* Assistant Overlay */}
      {isAssistantOpen && (
        <div className="fixed inset-0 z-[160] flex justify-end">
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Cerrar asistente"
            onClick={handleCloseAssistant}
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm cursor-default"
          />

          {/* Desktop Right Panel */}
          <div className="hidden lg:block relative w-[400px] bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300">
            <AssistantPanel
              messages={assistant.messages}
              onSendMessage={assistant.handleSendMessage}
              isLoading={assistant.isLoading}
              input={assistant.input}
              onInputChange={assistant.setInput}
              filters={assistant.filters}
              clearFilters={assistant.clearFilters}
              mode="desktop"
              onClose={handleCloseAssistant}
            />
          </div>

          {/* Mobile Bottom Panel */}
          <div className="lg:hidden absolute inset-x-0 bottom-0 max-h-[86vh] overflow-hidden rounded-t-3xl shadow-2xl bg-white animate-in slide-in-from-bottom duration-300">
            <AssistantPanel
              messages={assistant.messages}
              onSendMessage={assistant.handleSendMessage}
              isLoading={assistant.isLoading}
              input={assistant.input}
              onInputChange={assistant.setInput}
              filters={assistant.filters}
              clearFilters={assistant.clearFilters}
              mode="mobile"
              onClose={handleCloseAssistant}
            />
          </div>
        </div>
      )}
    </div>
  );
}
