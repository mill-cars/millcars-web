import React from 'react';
import { Car } from '../types';
import { formatNumber, getWhatsAppLink } from '../lib/utils';
import { Calendar, Gauge, User, Hash, ChevronRight, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface CarCardProps {
  car: Car;
  onClick: (car: Car) => void;
}

export const CarCard: React.FC<CarCardProps> = ({ car, onClick }) => {
  const waLink = getWhatsAppLink(car.brand, car.model, car.year);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-black/5 group cursor-pointer"
      onClick={() => onClick(car)}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={car.image}
          alt={`${car.brand} ${car.model}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 left-3">
          <span className={car.condition === 'nuevo' ? 'bg-[#0078FF] text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider' : 'bg-[#D00000] text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider'}>
            {car.condition}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-black leading-tight font-display uppercase tracking-tight group-hover:text-[#D00000] transition-colors">
              {car.brand} <span className="text-black/30">{car.model}</span>
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-bold text-black/20 font-mono tracking-widest uppercase">{car.year}</span>
              <span className="w-1 h-1 rounded-full bg-black/10"></span>
              <span className="text-[10px] font-bold text-[#0078FF] font-mono tracking-widest uppercase">{car.condition}</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-bold text-black/20 uppercase tracking-[0.2em] mb-1 font-display">Cotización</span>
            <div className="bg-black/5 px-3 py-1.5 rounded-xl blur-[5px] select-none text-sm font-bold font-mono">
              $XX.XXX
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-2.5 text-[11px] text-black/50 font-medium">
            <div className="w-8 h-8 rounded-lg bg-black/[0.03] flex items-center justify-center">
              <Gauge size={14} className="text-black/40" />
            </div>
            <span className="font-mono">{formatNumber(car.mileage)} km</span>
          </div>
          <div className="flex items-center gap-2.5 text-[11px] text-black/50 font-medium">
            <div className="w-8 h-8 rounded-lg bg-black/[0.03] flex items-center justify-center">
              <User size={14} className="text-black/40" />
            </div>
            <span>{car.owners} {car.owners === 1 ? 'Dueño' : 'Dueños'}</span>
          </div>
          <div className="flex items-center gap-2.5 text-[11px] text-black/50 font-medium">
            <div className="w-8 h-8 rounded-lg bg-black/[0.03] flex items-center justify-center">
              <Hash size={14} className="text-black/40" />
            </div>
            <span className="font-mono">***{car.plateEnd}</span>
          </div>
          <div className="flex items-center gap-2.5 text-[11px] text-black/50 font-medium">
            <div className="w-8 h-8 rounded-lg bg-black/[0.03] flex items-center justify-center">
              <div className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: car.color === 'Blanco' ? '#fff' : car.color === 'Negro' ? '#000' : car.color === 'Rojo' ? '#D00000' : car.color === 'Gris' ? '#888' : car.color === 'Plata' ? '#C0C0C0' : '#444' }} />
            </div>
            <span>{car.color}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button className="flex-1 py-3 bg-black text-white rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#D00000] transition-all duration-300 font-display shadow-md shadow-black/5">
            Detalles
            <ChevronRight size={14} />
          </button>
          <a 
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="px-4 py-3 bg-[#25D366] text-white rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#128C7E] transition-all duration-300 font-display shadow-md shadow-[#25D366]/10"
          >
            <MessageCircle size={16} />
            Precio
          </a>
        </div>
      </div>
    </motion.div>
  );
};
