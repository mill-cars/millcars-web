import React, { useMemo, useState } from 'react';
import { PublicHeader } from './PublicHeader';
import { Footer } from './Footer';

interface VenderProps {
  mode?: 'vender' | 'cotizar';
}

interface QuoteFormState {
  fullName: string;
  email: string;
  phone: string;
  brand: string;
  model: string;
  year: string;
  mileage: string;
  condition: string;
  notes: string;
}

const contactPhone = '584126512845';
const contactEmail = 'ventas@millcars.com';
const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 12 }, (_, index) => String(currentYear - index));

const initialQuoteForm: QuoteFormState = {
  fullName: '',
  email: '',
  phone: '',
  brand: '',
  model: '',
  year: '',
  mileage: '',
  condition: 'usado',
  notes: '',
};

function buildQuoteSummary(form: QuoteFormState) {
  return [
    `Nombre: ${form.fullName || 'No indicado'}`,
    `Email: ${form.email || 'No indicado'}`,
    `Teléfono: ${form.phone || 'No indicado'}`,
    `Vehículo: ${[form.brand, form.model].filter(Boolean).join(' ') || 'No indicado'}`,
    `Año: ${form.year || 'No indicado'}`,
    `Kilometraje: ${form.mileage || 'No indicado'}`,
    `Condición: ${form.condition || 'No indicada'}`,
    `Notas: ${form.notes || 'Sin notas adicionales'}`,
  ].join('\n');
}

export function Vender({ mode = 'cotizar' }: VenderProps) {
  const isQuoteMode = true;
  const [quoteForm, setQuoteForm] = useState<QuoteFormState>(initialQuoteForm);

  const summary = useMemo(() => buildQuoteSummary(quoteForm), [quoteForm]);
  const whatsappMessage = useMemo(
    () =>
      [
        'Hola MILLCARS, quiero vender mi auto después de cotizarlo.',
        '',
        summary,
        '',
        'La cotización es referencial y me interesa avanzar con una propuesta.',
      ].join('\n'),
    [summary],
  );
  const whatsappHref = `https://wa.me/${contactPhone}?text=${encodeURIComponent(whatsappMessage)}`;
  const emailSubject = `Cotización de ${quoteForm.brand || 'mi auto'} ${quoteForm.model || ''}`.trim();
  const emailBody = [
    'Hola MILLCARS,',
    '',
    'Quiero vender mi auto después de cotizarlo.',
    '',
    summary,
    '',
    'Por favor, contáctenme para continuar.',
  ].join('\n');
  const emailHref = `mailto:${contactEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

  const updateField = <K extends keyof QuoteFormState>(field: K, value: QuoteFormState[K]) => {
    setQuoteForm((previous) => ({ ...previous, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface font-body selection:bg-primary-fixed selection:text-on-primary-fixed">
      <PublicHeader active="cotizar" ctaLabel="Ingresar" ctaHref="/login" />

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <header className="mb-12 max-w-3xl">
          <p className="mb-4 inline-flex rounded-full bg-primary-fixed px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-on-primary-fixed">
            Cotización gratis
          </p>
          <h1 className="mb-4 text-5xl font-black tracking-tighter text-on-surface sm:text-6xl">
            Cotiza tu auto gratis con claridad y precisión.
          </h1>
          <p className="text-lg leading-relaxed text-on-surface-variant">
            La cotización es subjetiva y referencial, no una oferta de compra. Si decides vender, te enviaremos la información por WhatsApp y correo.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <section className="rounded-[2rem] border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-[0_20px_60px_rgba(17,28,45,0.06)] sm:p-8">
            <div className="mb-8 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <span className="material-symbols-outlined">directions_car</span>
              </span>
              <div>
                <h2 className="text-2xl font-black tracking-tight text-on-surface">Datos para tu cotización</h2>
                <p className="text-sm text-on-surface-variant">Completa este formulario único para obtener una cotización referencial.</p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <label className="space-y-2">
                <span className="ml-1 text-sm font-semibold text-on-surface-variant">Nombre completo</span>
                <input
                  value={quoteForm.fullName}
                  onChange={(event) => updateField('fullName', event.target.value)}
                  className="w-full rounded-2xl border border-outline-variant/20 bg-surface-container-low px-5 py-4 font-medium text-on-surface placeholder:text-outline/50 focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none"
                  placeholder="Tu nombre"
                  type="text"
                />
              </label>

              <label className="space-y-2">
                <span className="ml-1 text-sm font-semibold text-on-surface-variant">Correo electrónico</span>
                <input
                  value={quoteForm.email}
                  onChange={(event) => updateField('email', event.target.value)}
                  className="w-full rounded-2xl border border-outline-variant/20 bg-surface-container-low px-5 py-4 font-medium text-on-surface placeholder:text-outline/50 focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none"
                  placeholder="correo@ejemplo.com"
                  type="email"
                />
              </label>

              <label className="space-y-2">
                <span className="ml-1 text-sm font-semibold text-on-surface-variant">Teléfono</span>
                <input
                  value={quoteForm.phone}
                  onChange={(event) => updateField('phone', event.target.value)}
                  className="w-full rounded-2xl border border-outline-variant/20 bg-surface-container-low px-5 py-4 font-medium text-on-surface placeholder:text-outline/50 focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none"
                  placeholder="+58 412 0000000"
                  type="tel"
                />
              </label>

              <label className="space-y-2">
                <span className="ml-1 text-sm font-semibold text-on-surface-variant">Marca</span>
                <input
                  value={quoteForm.brand}
                  onChange={(event) => updateField('brand', event.target.value)}
                  className="w-full rounded-2xl border border-outline-variant/20 bg-surface-container-low px-5 py-4 font-medium text-on-surface placeholder:text-outline/50 focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none"
                  placeholder="BMW"
                  type="text"
                />
              </label>

              <label className="space-y-2">
                <span className="ml-1 text-sm font-semibold text-on-surface-variant">Modelo</span>
                <input
                  value={quoteForm.model}
                  onChange={(event) => updateField('model', event.target.value)}
                  className="w-full rounded-2xl border border-outline-variant/20 bg-surface-container-low px-5 py-4 font-medium text-on-surface placeholder:text-outline/50 focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none"
                  placeholder="X5"
                  type="text"
                />
              </label>

              <label className="space-y-2">
                <span className="ml-1 text-sm font-semibold text-on-surface-variant">Año</span>
                <select
                  value={quoteForm.year}
                  onChange={(event) => updateField('year', event.target.value)}
                  className="w-full appearance-none rounded-2xl border border-outline-variant/20 bg-surface-container-low px-5 py-4 font-medium text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none"
                >
                  <option value="">Seleccionar año</option>
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="ml-1 text-sm font-semibold text-on-surface-variant">Kilometraje</span>
                <input
                  value={quoteForm.mileage}
                  onChange={(event) => updateField('mileage', event.target.value)}
                  className="w-full rounded-2xl border border-outline-variant/20 bg-surface-container-low px-5 py-4 font-medium text-on-surface placeholder:text-outline/50 focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none"
                  placeholder="45.000"
                  type="number"
                />
              </label>

              <label className="space-y-2">
                <span className="ml-1 text-sm font-semibold text-on-surface-variant">Condición</span>
                <select
                  value={quoteForm.condition}
                  onChange={(event) => updateField('condition', event.target.value)}
                  className="w-full appearance-none rounded-2xl border border-outline-variant/20 bg-surface-container-low px-5 py-4 font-medium text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none"
                >
                  <option value="nuevo">Nuevo</option>
                  <option value="usado">Usado</option>
                </select>
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className="ml-1 text-sm font-semibold text-on-surface-variant">Notas adicionales</span>
                <textarea
                  value={quoteForm.notes}
                  onChange={(event) => updateField('notes', event.target.value)}
                  className="min-h-32 w-full rounded-2xl border border-outline-variant/20 bg-surface-container-low px-5 py-4 font-medium text-on-surface placeholder:text-outline/50 focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none"
                  placeholder="Estado, extras, mantenimiento, etc."
                />
              </label>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-[2rem] border border-outline-variant/20 bg-surface-container-low p-6 shadow-[0_16px_48px_rgba(17,28,45,0.06)]">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-xl font-black text-on-surface">Resumen</h3>
                <span className="rounded-full bg-primary-fixed px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-on-primary-fixed">Referencial</span>
              </div>
              <div className="space-y-3 text-sm text-on-surface-variant">
                <p><span className="font-semibold text-on-surface">Nombre:</span> {quoteForm.fullName || 'No indicado'}</p>
                <p><span className="font-semibold text-on-surface">Vehículo:</span> {[quoteForm.brand, quoteForm.model].filter(Boolean).join(' ') || 'No indicado'}</p>
                <p><span className="font-semibold text-on-surface">Año:</span> {quoteForm.year || 'No indicado'}</p>
                <p><span className="font-semibold text-on-surface">Kilometraje:</span> {quoteForm.mileage || 'No indicado'}</p>
                <p><span className="font-semibold text-on-surface">Email:</span> {quoteForm.email || 'No indicado'}</p>
                <p><span className="font-semibold text-on-surface">Teléfono:</span> {quoteForm.phone || 'No indicado'}</p>
              </div>
            </div>

            <div className="overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#111c2d_0%,#1d2d4f_100%)] p-6 text-white shadow-[0_18px_48px_rgba(17,28,45,0.16)]">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70">Canales para vender</p>
              <h3 className="mt-3 text-2xl font-black leading-tight">Si quieres vender, elige cómo contactarnos.</h3>
              <p className="mt-3 text-sm leading-6 text-white/78">
                Enviaremos la información del formulario por WhatsApp y correo electrónico para continuar con la gestión.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-whatsapp px-5 py-4 text-sm font-black uppercase tracking-[0.16em] text-white shadow-[0_14px_30px_rgba(37,211,102,0.25)] transition-transform hover:-translate-y-0.5"
                >
                  Quiero vender por WhatsApp
                  <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
                </a>
                <a
                  href={emailHref}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-5 py-4 text-sm font-black uppercase tracking-[0.16em] text-white backdrop-blur transition-transform hover:-translate-y-0.5"
                >
                  Quiero vender por correo
                  <span className="material-symbols-outlined text-base">mail</span>
                </a>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
