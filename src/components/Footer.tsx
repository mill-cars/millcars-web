import React from 'react';
import { Car, Facebook, Instagram, Twitter, Linkedin, MapPin, Phone, Mail, ChevronRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-black text-white pt-24 pb-12 px-8 border-t border-white/5">
      <div className="max-w-[1700px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="bg-[#D00000] p-2 rounded-xl">
                <Car size={22} />
              </div>
              <span className="text-2xl font-bold tracking-tighter font-display uppercase">MILLCARS<span className="text-[#D00000]"></span></span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs font-body">
              Revolucionando la compra y venta de vehículos con inteligencia artificial de vanguardia. Encuentra tu próximo auto mediante una conversación.
            </p>
            <div className="flex gap-5">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-[#D00000] transition-all duration-300 group">
                  <Icon size={18} className="text-white/40 group-hover:text-white" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20 mb-8 font-display">Explorar</h4>
            <ul className="space-y-4">
              {['Inventario', 'Vender Auto', 'Financiamiento', 'Test Drive', 'Sucursales'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-white/60 hover:text-white transition-colors font-body">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20 mb-8 font-display">Contacto</h4>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <MapPin size={18} className="text-[#D00000] mt-1" />
                <span className="text-sm text-white/60 font-body">Av. Principal, Los Cortijos de Lourdes, Caracas</span>
              </li>
              <li className="flex items-center gap-4">
                <Phone size={18} className="text-[#D00000]" />
                <span className="text-sm text-white/60 font-body">+58 412-6512845</span>
              </li>
              <li className="flex items-center gap-4">
                <Mail size={18} className="text-[#D00000]" />
                <span className="text-sm text-white/60 font-body">ventas@millcars.com</span>
              </li>
              <li className="flex items-center gap-4">
                <ChevronRight size={18} className="text-[#D00000]" />
                <a href="https://www.millcars.com" target="_blank" rel="noopener noreferrer" className="text-sm text-white/60 hover:text-white transition-colors font-body">www.millcars.com</a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-[9px] font-bold uppercase tracking-widest text-white/20 mb-6 font-display">Newsletter</h4>
            <p className="text-[11px] text-white/40 mb-4 font-body">Recibe las mejores ofertas y lanzamientos antes que nadie.</p>
            <form className="space-y-2">
              <input 
                type="email" 
                placeholder="Tu email" 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#D00000] transition-colors font-body"
              />
              <button className="w-full bg-white text-black py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-[#D00000] hover:text-white transition-all duration-300 font-display">
                Suscribirme
              </button>
            </form>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] text-white/20 font-bold uppercase tracking-[0.2em] font-display">
            © 2026 MILLCARS AI. TODOS LOS DERECHOS RESERVADOS.
          </p>
          <div className="flex gap-8 text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 font-display">
            <a href="#" className="hover:text-white transition-colors">Privacidad</a>
            <a href="#" className="hover:text-white transition-colors">Términos</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
