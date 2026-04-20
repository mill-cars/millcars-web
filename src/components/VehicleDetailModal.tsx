import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Car } from '../types';
import { formatNumber, getWhatsAppLink } from '../lib/utils';
import { fetchCarImages } from '../services/imageService';

interface CarImage {
  id: string;
  url: string;
}

interface VehicleDetailModalProps {
  car: Car;
  onClose: () => void;
}

export function VehicleDetailModal({ car, onClose }: VehicleDetailModalProps) {
  const [images, setImages] = useState<CarImage[]>([{ id: 'cover', url: car.image }]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch full gallery on mount
  useEffect(() => {
    let mounted = true;
    if (car.images && car.images.length > 0) {
      setImages(car.images);
      setIsLoading(false);
    } else {
      setIsLoading(true);
      fetchCarImages(car.id)
        .then((fetched) => {
          if (!mounted) return;
          if (fetched.length > 0) {
            setImages(fetched);
          }
          setIsLoading(false);
        })
        .catch(console.error);
    }
    return () => { mounted = false; };
  }, [car]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 md:p-12">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/90 backdrop-blur-md cursor-pointer"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 30 }}
        className="relative w-full max-w-6xl bg-surface rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row max-h-[90vh]"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-[210] w-10 h-10 bg-black/20 hover:bg-black/50 hover:text-white text-white rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        {/* ── Left Pane: Image Gallery ── */}
        <div className="lg:w-3/5 h-[400px] md:h-[450px] lg:h-auto relative overflow-hidden group bg-black">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentIndex}
              src={images[currentIndex]?.url}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full object-cover"
              alt={`${car.brand} ${car.model}`}
              referrerPolicy="no-referrer"
            />
          </AnimatePresence>

          {/* Nav Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/70 text-white p-3 rounded-full backdrop-blur opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all z-10"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/70 text-white p-3 rounded-full backdrop-blur opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all z-10"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none hidden lg:block" />

          {/* Title & Thumbnails */}
          <div className="absolute bottom-6 left-6 right-6 lg:bottom-10 lg:left-10 lg:right-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 pointer-events-none">
            <div className="pointer-events-auto hidden lg:block">
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-primary text-on-primary px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg">
                  {car.condition}
                </span>
                <span className="text-white/80 font-mono text-[10px] tracking-widest font-bold drop-shadow-md">
                  EST. {car.year}
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none drop-shadow-lg">
                {car.brand} <br />
                <span className="text-white/70">{car.model}</span>
              </h2>
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 pointer-events-auto overflow-x-auto pb-2 -mb-2 no-scrollbar max-w-full sm:max-w-[50%]">
                {images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                      idx === currentIndex
                        ? 'border-primary scale-105 shadow-xl'
                        : 'border-transparent opacity-50 hover:opacity-100 hover:scale-95'
                    }`}
                  >
                    <img src={img.url} className="w-full h-full object-cover" alt="thumbnail" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Right Pane: Details ── */}
        <div className="lg:w-2/5 p-8 lg:p-12 overflow-y-auto bg-surface flex flex-col relative">
          <div className="space-y-8 flex-1">
            <div>
              <h4 className="text-[9px] font-black uppercase tracking-widest text-outline mb-4">
                Reseña del Experto
              </h4>
              <p className="text-on-surface-variant leading-relaxed text-sm font-medium">
                {car.description || 'Sin descripción disponible.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-8">
              <div>
                <h4 className="text-[9px] font-black uppercase tracking-widest text-outline mb-2">Recorrido</h4>
                <p className="text-lg font-black tracking-tight">
                  {formatNumber(car.mileage)} <span className="text-[10px] text-outline font-bold">KM</span>
                </p>
              </div>
              <div>
                <h4 className="text-[9px] font-black uppercase tracking-widest text-outline mb-2">Transmisión</h4>
                <p className="text-lg font-black uppercase tracking-tight">{car.transmission}</p>
              </div>
              <div>
                <h4 className="text-[9px] font-black uppercase tracking-widest text-outline mb-2">Motorización</h4>
                <p className="text-lg font-black uppercase tracking-tight">{car.fuelType}</p>
              </div>
              <div className="hidden lg:block">
                <h4 className="text-[9px] font-black uppercase tracking-widest text-outline mb-2">Identificación</h4>
                <p className="text-lg font-black tracking-tight flex items-center gap-1">
                  PLACA <span className="text-primary bg-primary/10 px-2 rounded font-mono">***{car.plateEnd}</span>
                </p>
              </div>
            </div>

            {car.features && car.features.length > 0 && (
              <div>
                <h4 className="text-[9px] font-black uppercase tracking-widest text-outline mb-4">
                  Equipamiento Premium
                </h4>
                <div className="flex flex-wrap gap-2">
                  {car.features.map((f, i) => (
                    <span
                      key={i}
                      className="bg-surface-container-high px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider text-on-surface-variant"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-8 flex flex-col sm:flex-row gap-3 shrink-0 mt-8 border-t border-outline-variant/10">
            <a
              href={getWhatsAppLink(car.brand, car.model, car.year)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 bg-whatsapp text-white rounded-xl font-black uppercase tracking-widest hover:opacity-90 transition-all duration-300 transform hover:scale-[1.01] flex items-center justify-center gap-3 text-[10px] shadow-xl shadow-whatsapp/20"
            >
              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                chat
              </span>
              Precio
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
