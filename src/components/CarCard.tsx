import React from 'react';
import { Car } from '../types';
import { formatNumber, getWhatsAppLink } from '../lib/utils';
import { motion } from 'motion/react';

interface CarCardProps {
  car: Car;
  onClick: (car: Car) => void;
  variant?: 'featured' | 'used';
}

export const CarCard: React.FC<CarCardProps> = ({ car, onClick, variant = 'featured' }) => {
  const waLink = getWhatsAppLink(car.brand, car.model, car.year);

  if (variant === 'used') {
    return (
      <div 
        onClick={() => onClick(car)}
        className="min-w-[300px] md:min-w-[340px] bg-white rounded-[1.6rem] overflow-hidden snap-start border border-outline-variant/10 p-2 cursor-pointer group hover:shadow-xl transition-all"
      >
        <div className="aspect-[16/11] relative overflow-hidden rounded-[1.2rem]">
          <img 
            src={car.image} 
            alt={`${car.brand} ${car.model}`} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.18em]">
            {car.condition === 'nuevo' ? 'Nuevo' : 'Certificado'}
          </div>
        </div>
        <div className="p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h3 className="max-w-[180px] truncate text-lg font-black uppercase tracking-tight text-on-surface">
                {car.brand} {car.model}
              </h3>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-outline">
                {car.year} · {car.condition === 'nuevo' ? 'Nuevo' : 'Usado'}
              </p>
            </div>
            <div className="text-right">
              <div className="relative group/price cursor-help">
                <span className="text-lg font-black price-blur">${formatNumber(car.price)}</span>
                <div className="absolute bottom-full right-0 mb-2 w-max px-3 py-1 bg-on-surface text-white text-[10px] rounded opacity-0 group-hover/price:opacity-100 transition-opacity z-10">
                    Regístrate para ver el precio
                </div>
              </div>
            </div>
          </div>
          <div className="mb-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-surface-container-low px-3 py-2.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-outline">Km</p>
              <p className="mt-1 text-sm font-bold text-on-surface">{formatNumber(car.mileage)}</p>
            </div>
            <div className="rounded-xl bg-surface-container-low px-3 py-2.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-outline">Dueños</p>
              <p className="mt-1 text-sm font-bold text-on-surface">{car.owners}</p>
            </div>
          </div>
          <div className="flex gap-3 mt-auto">
            <button className="flex-[2] bg-black text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.18em] hover:bg-slate-900 transition-colors">
              DETALLES
            </button>
            <a 
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex-1 bg-whatsapp text-white rounded-xl flex items-center justify-center hover:opacity-90 transition-opacity max-w-[60px]"
            >
              <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>chat</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={() => onClick(car)}
      className="mx-auto flex h-full w-full max-w-[350px] cursor-pointer flex-col overflow-hidden rounded-[1.7rem] border border-outline-variant/10 bg-white shadow-sm transition-all group hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative aspect-[16/11] overflow-hidden">
        <img 
          src={car.image} 
          alt={`${car.brand} ${car.model}`} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <div className={`absolute left-3 top-3 ${car.condition === 'nuevo' ? 'bg-primary' : 'bg-red-600'} rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white`}>
          {car.condition}
        </div>
      </div>
      
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h3 className="flex items-baseline gap-2 text-xl font-black uppercase tracking-tight text-on-surface">
              {car.brand} <span className="font-medium text-outline">{car.model}</span>
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-bold text-outline">{car.year}</span>
              <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
              <span className="text-[11px] font-black uppercase tracking-[0.16em] text-primary">{car.condition}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.18em] text-outline">Cotizaci&oacute;n</span>
            <div className="relative group/price cursor-help">
              <span className="text-lg font-black price-blur">${formatNumber(car.price)}</span>
              <div className="absolute bottom-full right-0 mb-2 w-max px-3 py-1 bg-on-surface text-white text-[10px] rounded opacity-0 group-hover/price:opacity-100 transition-opacity z-10">
                Regístrate para ver el precio
              </div>
            </div>
          </div>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3 rounded-[1rem] bg-surface-container-low px-3 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white">
              <span className="material-symbols-outlined text-lg text-outline">speed</span>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-outline">Kilometraje</p>
              <p className="text-sm font-bold">{formatNumber(car.mileage)} km</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-[1rem] bg-surface-container-low px-3 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white">
              <span className="material-symbols-outlined text-lg text-outline">person</span>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-outline">Propiedad</p>
              <p className="text-sm font-bold">{car.owners} Dueño{car.owners !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-auto">
          <button className="flex-[2] rounded-[1rem] bg-black py-3.5 text-[11px] font-black uppercase tracking-[0.18em] text-white flex items-center justify-center gap-2 hover:bg-slate-900 transition-colors">
            DETALLES <span className="material-symbols-outlined text-xs">arrow_forward_ios</span>
          </button>
          <a 
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex-1 rounded-[1rem] bg-whatsapp py-3.5 text-[11px] font-black uppercase tracking-[0.16em] text-white flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined text-lg" style={{fontVariationSettings: "'FILL' 1"}}>chat</span> PRECIO
          </a>
        </div>
      </div>
    </div>
  );
};
