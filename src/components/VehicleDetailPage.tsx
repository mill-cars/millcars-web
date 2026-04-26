import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Car } from '../types';
import { fetchCarById } from '../services/carsService';
import { fetchCarImages } from '../services/imageService';
import { formatNumber, getWhatsAppLink } from '../lib/utils';
import { PublicHeader } from './PublicHeader';
import { Footer } from './Footer';

// ── Helpers ──────────────────────────────────────────────────────────────────

function fuelTypeLabel(ft: string) {
  const map: Record<string, string> = {
    gasolina: 'Gasolina',
    diesel: 'Diésel',
    eléctrico: 'Eléctrico',
    híbrido: 'Híbrido',
  };
  return map[ft] ?? ft;
}

function fuelIcon(ft: string) {
  const map: Record<string, string> = {
    gasolina: 'local_gas_station',
    diesel: 'local_gas_station',
    eléctrico: 'electric_car',
    híbrido: 'eco',
  };
  return map[ft] ?? 'local_gas_station';
}

// ── CountdownTimer ────────────────────────────────────────────────────────────

function CountdownTimer() {
  // Fixed 2h 45m 12s countdown that resets every day (cosmetic)
  const [time, setTime] = useState({ h: 2, m: 45, s: 12 });

  useEffect(() => {
    const id = setInterval(() => {
      setTime(prev => {
        let { h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 2; m = 45; s = 12; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="flex gap-2 items-center">
      <div className="bg-black/25 rounded-lg px-2.5 py-1 font-mono font-black text-white tabular-nums">{pad(time.h)}</div>
      <span className="font-bold text-white">:</span>
      <div className="bg-black/25 rounded-lg px-2.5 py-1 font-mono font-black text-white tabular-nums">{pad(time.m)}</div>
      <span className="font-bold text-white">:</span>
      <div className="bg-black/25 rounded-lg px-2.5 py-1 font-mono font-black text-white tabular-nums">{pad(time.s)}</div>
    </div>
  );
}

// ── NotFound ──────────────────────────────────────────────────────────────────

function NotFound() {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <PublicHeader active="inventario" ctaLabel="Ingresar" ctaHref="/login" />
      <main className="flex-1 flex items-center justify-center pt-32 pb-24 px-4">
        <div className="text-center max-w-md space-y-6">
          <span className="material-symbols-outlined text-7xl text-outline-variant">directions_car_off</span>
          <h1 className="text-4xl font-black tracking-tight text-on-surface">Vehículo no encontrado</h1>
          <p className="text-on-surface-variant">
            El auto que buscas no está disponible o fue removido del catálogo.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 bg-primary text-on-primary px-8 py-4 rounded-xl font-bold hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Ver catálogo completo
          </a>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

interface VehicleDetailPageProps {
  id: string;
}

export function VehicleDetailPage({ id }: VehicleDetailPageProps) {
  const [car, setCar] = useState<Car | null>(null);
  const [images, setImages] = useState<{ id: string; url: string }[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);

  const mainImgRef = useRef<HTMLDivElement>(null);

  // ── Fetch car by UUID ──────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    setNotFound(false);

    fetchCarById(id)
      .then(async (fetchedCar) => {
        if (!fetchedCar) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        setCar(fetchedCar);

        // Fetch gallery images
        const fallback = [{ id: 'cover', url: fetchedCar.image }];
        try {
          const fetched = await fetchCarImages(fetchedCar.id);
          setImages(fetched.length > 0 ? fetched : fallback);
        } catch {
          setImages(fallback);
        }
        setLoading(false);
      })
      .catch(() => {
        setNotFound(true);
        setLoading(false);
      });
  }, [id]);

  // ── Sticky bar on scroll ────────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      setShowStickyBar(window.scrollY > 600 && window.innerWidth > 1024);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ── Update page title ───────────────────────────────────────────────────
  useEffect(() => {
    if (car) {
      document.title = `${car.brand} ${car.model} ${car.year} - MILLCARS`;
    }
  }, [car]);

  const handlePrev = () => setCurrentIdx(p => (p - 1 + images.length) % images.length);
  const handleNext = () => setCurrentIdx(p => (p + 1) % images.length);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col">
        <PublicHeader active="inventario" ctaLabel="Ingresar" ctaHref="/login" />
        <main className="flex-1 pt-32 pb-24 px-4 max-w-7xl mx-auto w-full">
          <SkeletonPage />
        </main>
        <Footer />
      </div>
    );
  }

  if (notFound || !car) {
    return <NotFound />;
  }

  const whatsappUrl = getWhatsAppLink(car.brand, car.model, car.year);

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <PublicHeader active="inventario" ctaLabel="Ingresar" ctaHref="/login" />

      <main className="flex-1 pt-[112px] pb-32 max-w-7xl mx-auto px-4 lg:px-8 w-full">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-outline mb-6 pt-4 font-semibold" aria-label="Breadcrumb">
          <a href="/" className="hover:text-primary transition-colors">Inicio</a>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <a href="/#catalogo" className="hover:text-primary transition-colors">Catálogo</a>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-on-surface truncate max-w-[180px]">{car.brand} {car.model} {car.year}</span>
        </nav>

        {/* Flash Sale Banner */}
        <div className="bg-secondary text-white px-5 py-3.5 rounded-2xl mb-8 flex items-center justify-between shadow-xl shadow-secondary/25">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-yellow-300 text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-90">Oferta Relámpago</p>
              <p className="font-bold text-sm">¡Precio especial por tiempo limitado!</p>
            </div>
          </div>
          <CountdownTimer />
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* ── Left: Gallery ── */}
          <div className="lg:col-span-7 space-y-5" ref={mainImgRef}>

            {/* Main image */}
            <div className="relative group rounded-2xl overflow-hidden shadow-xl bg-black aspect-[4/3]">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentIdx}
                  src={images[currentIdx]?.url ?? car.image}
                  alt={`${car.brand} ${car.model} ${car.year}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </AnimatePresence>

              {/* Tags */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <span className="bg-primary text-on-primary text-[10px] font-black px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-md uppercase">
                  <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  Certificado Millcars
                </span>
                {car.condition === 'nuevo' && (
                  <span className="bg-green-500 text-white text-[10px] font-black px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-md uppercase">
                    <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>new_releases</span>
                    Nuevo
                  </span>
                )}
              </div>

              {/* Nav arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePrev}
                    aria-label="Imagen anterior"
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-3 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all z-10"
                  >
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  <button
                    onClick={handleNext}
                    aria-label="Siguiente imagen"
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-3 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all z-10"
                  >
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </>
              )}

              {/* Image counter */}
              {images.length > 1 && (
                <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm text-white text-[10px] font-black px-2.5 py-1 rounded-full">
                  {currentIdx + 1} / {images.length}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.slice(0, 3).map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setCurrentIdx(idx)}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                      idx === currentIdx
                        ? 'border-primary scale-[1.03] shadow-lg shadow-primary/20'
                        : 'border-transparent opacity-60 hover:opacity-100 hover:scale-[1.02]'
                    }`}
                    aria-label={`Ver imagen ${idx + 1}`}
                  >
                    <img src={img.url} alt={`${car.brand} ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
                {images.length > 3 && (
                  <button
                    onClick={() => setCurrentIdx(3)}
                    className="aspect-square rounded-xl bg-surface-container flex items-center justify-center border-2 border-outline-variant/30 hover:border-primary/40 hover:bg-surface-container-high transition-all"
                    aria-label={`Ver ${images.length - 3} fotos más`}
                  >
                    <span className="text-on-surface-variant font-black text-lg">+{images.length - 3}</span>
                  </button>
                )}
              </div>
            )}

            {/* Description */}
            <div className="bg-white p-8 rounded-2xl border border-outline-variant/20 shadow-sm mt-4">
              <h3 className="text-xl font-black tracking-tight text-on-surface mb-5">Descripción del vehículo</h3>
              <p className="text-on-surface-variant leading-relaxed text-sm">
                {car.description || `Este ${car.brand} ${car.model} ${car.year} está disponible en nuestro catálogo con garantía de inspección técnica integral y respaldo Millcars.`}
              </p>

              {car.features && car.features.length > 0 && (
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 mt-6 text-sm text-on-surface-variant">
                  {car.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      {f}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* ── Right: Info panel ── */}
          <div className="lg:col-span-5">
            <div className="bg-white p-8 rounded-2xl border border-outline-variant/20 shadow-sm lg:sticky lg:top-28 space-y-6">

              {/* Title */}
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-on-surface leading-tight">
                    {car.brand} {car.model} {car.year}
                  </h1>
                </div>
                <span className="bg-surface-container text-on-surface-variant px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shrink-0">
                  {car.condition}
                </span>
              </div>



              {/* Key specs */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: 'speed', label: 'Kilometraje', value: `${formatNumber(car.mileage)} km` },
                  { icon: 'palette', label: 'Color', value: car.color },
                  { icon: 'settings', label: 'Transmisión', value: car.transmission },
                  { icon: fuelIcon(car.fuelType), label: 'Combustible', value: fuelTypeLabel(car.fuelType) },
                ].map(item => (
                  <div key={item.label} className="bg-surface-container-low p-4 rounded-xl flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-xl">{item.icon}</span>
                    <div>
                      <p className="text-[9px] text-outline uppercase font-black tracking-widest">{item.label}</p>
                      <p className="text-sm font-black text-on-surface capitalize">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* WhatsApp CTA */}
              <div className="space-y-3">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  id="whatsapp-cta-main"
                  className="w-full py-4 bg-whatsapp text-white rounded-xl font-black flex items-center justify-center gap-3 shadow-xl shadow-green-500/20 hover:brightness-105 active:scale-[0.98] transition-all text-base"
                  style={{ animation: 'pulse-subtle 2.5s infinite' }}
                >
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
                  Contactar por WhatsApp
                </a>
                <p className="text-center text-xs text-outline">Respuesta promedio en menos de 5 minutos</p>
              </div>

              {/* Amenities / features — always shown with defaults */}
              <div className="pt-6 border-t border-outline-variant/20">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-outline mb-4">Comodidades</h3>
                <div className="flex flex-wrap gap-2">
                  {(car.features && car.features.length > 0
                    ? car.features
                    : ['Aire Acondicionado', 'Radio AM/FM']
                  ).slice(0, 8).map((f, i) => (
                    <span key={i} className="bg-surface-container text-on-surface-variant px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-primary">check</span>
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Seller card */}
              <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl overflow-hidden relative mt-2">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
                    <span className="text-xl font-black">M</span>
                  </div>
                  <div>
                    <p className="font-black text-lg leading-tight">MILLCARS</p>
                    <div className="flex items-center gap-0.5 text-yellow-400 text-xs mt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      ))}
                      <span className="text-white/60 ml-2 text-[10px]">Concesionario Certificado</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Desktop sticky bottom bar ── */}
      <AnimatePresence>
        {showStickyBar && car && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="hidden lg:flex fixed bottom-0 left-0 w-full z-40 items-center justify-center px-4 py-4 bg-white/90 backdrop-blur-xl border-t border-outline-variant/20 shadow-[0_-8px_32px_rgba(0,0,0,0.08)]"
          >
            <div className="max-w-7xl w-full flex items-center justify-between gap-6 px-8">
              <div className="flex items-center gap-4">
                <img
                  src={images[0]?.url ?? car.image}
                  alt={car.brand}
                  className="w-12 h-12 rounded-xl object-cover shadow-md"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <p className="font-black text-sm text-on-surface">{car.brand} {car.model} {car.year}</p>
                  <p className="text-xs text-primary font-bold capitalize">{car.condition} · {fuelTypeLabel(car.fuelType)}</p>
                </div>
              </div>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-whatsapp text-white px-8 py-3 rounded-xl font-black flex items-center gap-2 hover:brightness-110 transition-all shadow-md"
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
                Contactar por WhatsApp
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mobile bottom nav ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 pt-2 pb-safe bg-white border-t border-outline-variant/20 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
        <a href="/" className="flex flex-col items-center text-outline transition-transform active:scale-90">
          <span className="material-symbols-outlined text-2xl">search</span>
          <span className="text-[9px] font-black uppercase tracking-widest">Explorar</span>
        </a>
        <a href="/#catalogo" className="flex flex-col items-center text-outline transition-transform active:scale-90">
          <span className="material-symbols-outlined text-2xl">grid_view</span>
          <span className="text-[9px] font-black uppercase tracking-widest">Catálogo</span>
        </a>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center text-whatsapp transition-transform active:scale-90"
        >
          <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
          <span className="text-[9px] font-black uppercase tracking-widest">Consultar</span>
        </a>
        <a href="/login" className="flex flex-col items-center text-outline transition-transform active:scale-90">
          <span className="material-symbols-outlined text-2xl">person</span>
          <span className="text-[9px] font-black uppercase tracking-widest">Perfil</span>
        </a>
      </nav>

      <div className="lg:block">
        <Footer />
      </div>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-pulse">
      <div className="lg:col-span-7 space-y-5">
        <div className="w-full aspect-[4/3] rounded-2xl bg-surface-container-high" />
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-surface-container-high" />
          ))}
        </div>
        <div className="p-8 rounded-2xl bg-surface-container-high space-y-3">
          <div className="h-5 w-1/3 rounded bg-surface-container" />
          <div className="h-4 w-full rounded bg-surface-container" />
          <div className="h-4 w-5/6 rounded bg-surface-container" />
        </div>
      </div>
      <div className="lg:col-span-5">
        <div className="p-8 rounded-2xl bg-surface-container-high space-y-5">
          <div className="h-7 w-2/3 rounded bg-surface-container" />
          <div className="h-4 w-1/3 rounded bg-surface-container" />
          <div className="h-24 rounded-2xl bg-surface-container" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-surface-container" />
            ))}
          </div>
          <div className="h-14 rounded-xl bg-surface-container" />
        </div>
      </div>
    </div>
  );
}
