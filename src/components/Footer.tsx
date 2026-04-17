import React from 'react';
// Material Icons reemplazan Lucide

const socialLinks = [
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/people/MILL-CARS-CA/61571903014854/',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px] fill-current">
        <path d="M13.5 21v-7h2.3l.4-2.8h-2.7V9.4c0-.8.2-1.4 1.4-1.4H16V5.5c-.2 0-.9-.1-1.8-.1-1.8 0-3.1 1.1-3.1 3.3v2.5H9v2.8h2.3v7h2.2Z" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/millcars_/',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px] fill-none stroke-current" strokeWidth="1.9">
        <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.4" cy="6.6" r="1" className="fill-current stroke-none" />
      </svg>
    ),
  },
];

export const Footer: React.FC = () => {
  return (
    <footer id="soporte" className="bg-slate-950 px-4 pb-10 pt-20 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-5">
            <a href="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-surface text-primary">
                <span className="material-symbols-outlined text-2xl">directions_car</span>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.32em] text-on-surface-variant">MILLCARS</p>
              </div>
            </a>
            <p className="max-w-sm text-xs leading-relaxed text-white/65">
              Millcars es un concesionario de vehículos nuevos importados y usados con asesoría personalizada y compra segura.
            </p>
            <div className="flex gap-3">
              {socialLinks.map(({ icon, label, href }, index) => (
                <a
                  key={index}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/72 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary hover:text-on-primary"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-6 text-[10px] font-black uppercase tracking-[0.35em] text-on-surface-variant">Explorar</h4>
            <ul className="space-y-4 text-sm text-on-surface-variant">
              <li><a href="/" className="transition-colors hover:text-white">Inventario</a></li>
              <li><a href="/cotizar" className="transition-colors hover:text-white">Cotizar auto</a></li>
              <li><a href="#" className="transition-colors hover:text-white">Asesoría IA</a></li>
              <li><a href="#" className="transition-colors hover:text-white">Sucursales</a></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-[10px] font-black uppercase tracking-[0.35em] text-on-surface-variant">Contacto</h4>
            <ul className="space-y-5 text-sm text-on-surface-variant">
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary mt-0.5">location_on</span>
                <span>Av. Principal, Los Cortijos de Lourdes, Caracas</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">call</span>
                <span>+58 412-6512845</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">mail</span>
                <span>ventas@millcars.com</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-[10px] font-black uppercase tracking-[0.35em] text-on-surface-variant">Legal</h4>
            <ul className="space-y-4 text-sm text-on-surface-variant">
              <li><a href="#" className="transition-colors hover:text-white">Privacidad</a></li>
              <li><a href="#" className="transition-colors hover:text-white">Términos</a></li>
              <li><a href="#" className="transition-colors hover:text-white">Cookies</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-outline-variant pt-6 text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant md:flex-row md:items-center md:justify-between">
          <p>© 2026 MILLCARS. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <a href="#" className="transition-colors hover:text-primary">Seguridad</a>
            <a href="#" className="transition-colors hover:text-primary">Soporte</a>
            <a href="#" className="transition-colors hover:text-primary">Estado</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
