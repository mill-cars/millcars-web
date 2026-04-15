import React from 'react';
import { PublicHeader } from './PublicHeader';
import { Footer } from './Footer';

export function Vender() {
  return (
    <div className="min-h-screen bg-surface text-on-surface font-body selection:bg-primary-fixed selection:text-on-primary-fixed">
      <PublicHeader active="vender" ctaLabel="Ingresar" ctaHref="/login" />

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <header className="mb-12 max-w-3xl">
          <p className="mb-4 inline-flex rounded-full bg-primary-fixed px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-on-primary-fixed">
            Venta guiada
          </p>
          <h1 className="mb-4 text-5xl font-black tracking-tighter text-on-surface sm:text-6xl">
            Vende tu vehículo con claridad y precisión.
          </h1>
          <p className="text-lg leading-relaxed text-on-surface-variant">
            Completa la información principal y obtén una valuación estimada pensada para ser rápida, comprensible y confiable.
          </p>
        </header>

        <div className="mb-16">
          <div className="mb-4 flex items-center justify-between gap-4">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary">Paso 1 de 3: Identidad del vehículo</span>
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-on-surface-variant">33% completado</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container">
            <div className="h-full w-1/3 rounded-full bg-primary transition-all duration-700 ease-out" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="space-y-12 lg:col-span-8">
            <section className="rounded-3xl bg-surface-container-lowest p-6 sm:p-8 md:p-12">
              <h2 className="mb-8 flex items-center gap-3 text-2xl font-bold">
                <span className="material-symbols-outlined text-primary">directions_car</span>
                Especificaciones principales
              </h2>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
                <div className="space-y-2">
                  <label className="ml-1 text-sm font-semibold text-on-surface-variant">Marca</label>
                  <div className="relative">
                    <select className="w-full appearance-none rounded-2xl border border-outline-variant/20 bg-surface-container-low px-5 py-4 font-medium text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none">
                      <option>Seleccionar fabricante</option>
                      <option>Porsche</option>
                      <option>Ferrari</option>
                      <option>BMW</option>
                      <option>Mercedes-Benz</option>
                      <option>Audi</option>
                    </select>
                    <span className="material-symbols-outlined pointer-events-none absolute right-4 top-4 text-outline">expand_more</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="ml-1 text-sm font-semibold text-on-surface-variant">Modelo</label>
                  <input className="w-full rounded-2xl border border-outline-variant/20 bg-surface-container-low px-5 py-4 font-medium text-on-surface placeholder:text-outline/50 focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none" placeholder="ej. 911 Carrera S" type="text" />
                </div>

                <div className="space-y-2">
                  <label className="ml-1 text-sm font-semibold text-on-surface-variant">Año de producción</label>
                  <div className="relative">
                    <select className="w-full appearance-none rounded-2xl border border-outline-variant/20 bg-surface-container-low px-5 py-4 font-medium text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none">
                      <option>Seleccionar año</option>
                      <option>2024</option>
                      <option>2023</option>
                      <option>2022</option>
                      <option>2021</option>
                      <option>2020</option>
                    </select>
                    <span className="material-symbols-outlined pointer-events-none absolute right-4 top-4 text-outline">calendar_month</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="ml-1 text-sm font-semibold text-on-surface-variant">Kilometraje actual</label>
                  <div className="relative">
                    <input className="w-full rounded-2xl border border-outline-variant/20 bg-surface-container-low px-5 py-4 font-medium text-on-surface placeholder:text-outline/50 focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none" placeholder="0" type="number" />
                    <span className="absolute right-5 top-4 text-xs font-bold uppercase tracking-[0.2em] text-outline">Millas</span>
                  </div>
                </div>
              </div>
            </section>

            <div className="flex flex-col-reverse items-stretch justify-between gap-4 py-4 sm:flex-row sm:items-center">
              <button onClick={() => (window.location.href = '/')} className="flex items-center justify-center gap-2 font-semibold text-on-surface-variant transition-colors hover:text-primary sm:justify-start">
                <span className="material-symbols-outlined">arrow_back</span>
                Volver al inicio
              </button>
              <button className="flex items-center justify-center gap-3 rounded-2xl bg-primary px-8 py-4 font-bold text-on-primary shadow-xl shadow-primary/20 transition-transform hover:scale-[1.01] active:scale-[0.98]">
                Guardar y continuar
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </div>

          <aside className="lg:col-span-4">
            <div className="sticky top-32 space-y-8">
              <div className="relative overflow-hidden rounded-3xl bg-surface-container-low p-8">
                <div className="absolute right-0 top-0 p-4 opacity-10">
                  <span className="material-symbols-outlined text-6xl">auto_awesome</span>
                </div>
                <h3 className="mb-4 text-xl font-bold">Valuación de precisión</h3>
                <p className="mb-6 text-sm leading-relaxed text-on-surface-variant">
                  Nuestra IA analiza registros de mercado para ayudarte a estimar el valor del vehículo antes de publicar.
                </p>

                <div className="rounded-2xl bg-surface-container-lowest p-6">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.3em] text-outline">Rango estimado</span>
                  <div className="text-3xl font-black text-primary">$ --,---</div>
                  <p className="mt-4 text-[10px] leading-tight text-outline">
                    Completa los detalles del vehículo para desbloquear tu perfil de valuación.
                  </p>
                </div>
              </div>

              <div className="group relative aspect-[4/3] overflow-hidden rounded-3xl">
                <img
                  alt="Premium vehicle dashboard"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCR12fZK42UL1rcgRmlHfhXp1cB7qtNc6sYFoBjJdvwF_UnjKMPYxQ9L3EleFwTb-5MY0o24gQ5wB12Mr5QpgC61db8Mk4uwGHmkqGdhlUeksgeLknx3vRagGICtaoiWKevTSr95geKZM7zXhg2c9kvFUWCja-zGgUHKooTad2eVUvgk9YrRUUHpgqR2dIvT7aosw8lhRf4flK1d2dfV4dg2pDJq7Ykf4IhPOMvGU7Hv6X1k5dpdpW302u4NRPnDeyfZfV0M0IHUk8"
                />
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-slate-950/80 to-transparent p-6">
                  <p className="text-xs italic text-white">
                    "Vender mi auto fue mucho más claro con una guía paso a paso."
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
