import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { AdminHeader } from './AdminHeader';
import { MultiImageUpload } from './MultiImageUpload';
import { ManagedImage, saveCarImages } from '../services/imageService';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Brand {
  id: string;
  name: string;
}

type UserRole = 'administrador' | 'vendedor' | 'cliente' | null;
type Toast = { type: 'success' | 'error'; message: string } | null;

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_FILE_SIZE_MB = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const BUCKET_NAME = 'car-images';
const ALLOWED_ROLES: UserRole[] = ['administrador', 'vendedor'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// ─── Field styles ─────────────────────────────────────────────────────────────

const fieldClass =
  'w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-slate-400 dark:placeholder-slate-500';

const labelClass =
  'block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5';

// ─── Sidebar nav items ────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { label: 'Inventario', icon: 'local_shipping', href: '/admin' },
  { label: 'Usuarios', icon: 'group', href: '/admin?view=usuarios' },
];

// ─────────────────────────────────────────────────────────────────────────────

export function AddVehiclePage() {
  const { session, loading: authLoading } = useAuth();
  const [role, setRole] = useState<UserRole>(null);
  const [roleLoading, setRoleLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── Fetch user role from profiles ─────────────────────────────────────────
  useEffect(() => {
    if (authLoading) return;
    if (!session) {
      window.location.href = '/login';
      return;
    }
    supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => {
        const fetchedRole = (data?.role ?? null) as UserRole;
        setRole(fetchedRole);
        setRoleLoading(false);
        if (!fetchedRole || !ALLOWED_ROLES.includes(fetchedRole)) {
          // Not admin or seller → back to admin dashboard
          window.location.href = '/admin';
        }
      });
  }, [authLoading, session]);

  // ── Form state ────────────────────────────────────────────────────────────
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const [images, setImages] = useState<ManagedImage[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    brand_id: '',
    model: '',
    year: new Date().getFullYear(),
    price: '',
    mileage: '',
    color: '',
    condition: 'usado' as 'nuevo' | 'usado',
    transmission: 'automático' as 'automático' | 'manual',
    fuel_type: 'gasolina' as 'gasolina' | 'diesel' | 'eléctrico' | 'híbrido',
    owners: '1',
    plate_end: '',
    description: '',
  });

  // ── Fetch brands ──────────────────────────────────────────────────────────
  useEffect(() => {
    supabase
      .from('brands')
      .select('id, name')
      .order('name', { ascending: true })
      .then(({ data, error }) => {
        if (!error) setBrands(data ?? []);
        setLoadingBrands(false);
      });
  }, []);

  // ── Toast helper ──────────────────────────────────────────────────────────
  function showToast(type: 'success' | 'error', message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  }

  // ── Image handling is now delegated to MultiImageUpload + imageService ──

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (images.length === 0) {
      setImageError('Debes agregar al menos una imagen del vehículo.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!images.some((i) => i.isCover)) {
      setImageError('Debes seleccionar una imagen principal.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!formData.brand_id) {
      showToast('error', 'Debes seleccionar una marca.');
      return;
    }

    setSaving(true);
    try {
      const brand = brands.find((b) => b.id === formData.brand_id);
      const brandName = brand?.name ?? 'auto';
      const slug = `${slugify(brandName)}-${slugify(formData.model)}-${formData.year}-${Date.now()}`;

      // 1) Insert car
      const { data: carData, error: carError } = await supabase
        .from('cars')
        .insert({
          brand_id: formData.brand_id,
          model: formData.model.trim(),
          year: formData.year,
          price: parseFloat(formData.price),
          mileage: parseInt(formData.mileage) || 0,
          color: formData.color.trim(),
          condition: formData.condition,
          transmission: formData.transmission,
          fuel_type: formData.fuel_type,
          owners: parseInt(formData.owners) || 1,
          plate_end: formData.plate_end !== '' ? parseInt(formData.plate_end) : null,
          description: formData.description.trim() || null,
          slug,
          is_active: true,
        })
        .select('id')
        .single();

      if (carError) throw carError;
      const carId = carData.id as string;

      // 2) Upload all images + insert car_images records
      await saveCarImages(carId, images, []);

      showToast('success', '¡Vehículo registrado exitosamente!');
      setTimeout(() => {
        window.location.href = '/admin';
      }, 1800);
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'Error al guardar el vehículo.';
      showToast('error', msg);
      setSaving(false);
    }
  }

  // ── Guards ────────────────────────────────────────────────────────────────
  if (authLoading || roleLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4 text-slate-400">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
          <p className="text-sm font-medium">Verificando acceso…</p>
        </div>
      </div>
    );
  }

  if (!role || !ALLOWED_ROLES.includes(role)) return null;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex font-sans antialiased min-h-screen text-slate-900 dark:text-slate-50 bg-slate-50 dark:bg-slate-950">
      {/* ── Sidebar ────────────────────────────────────────────────────────── */}
      <aside
        className={`fixed md:relative w-64 border-r border-outline-variant bg-surface flex flex-col left-0 top-0 h-screen z-40 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-8 border-b border-outline-variant">
          <a href="/" className="text-xl font-extrabold tracking-tight text-on-surface">
            MILLCARS
          </a>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-2 hover:bg-surface-container rounded-lg"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-4 text-sm font-semibold tracking-wide">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-left transition-all duration-200 text-on-surface-variant hover:bg-surface-container hover:translate-x-1"
            >
              <span className="material-symbols-outlined text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </a>
          ))}

          {/* Active: Nuevo Vehículo */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-left bg-primary/10 text-primary">
            <span
              className="material-symbols-outlined text-xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              add_circle
            </span>
            <span>Nuevo Vehículo</span>
          </div>
        </nav>
      </aside>

      {/* Overlay when sidebar is open on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 md:hidden z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          searchPlaceholder="Buscar en inventario…"
          onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
          breadcrumb={[
            { label: 'Admin', href: '/admin' },
            { label: 'Inventario', href: '/admin' },
            { label: 'Nuevo Vehículo' },
          ]}
        />

        <main className="flex-1 p-6 sm:p-8 lg:p-10">
          {/* Page title */}
          <div className="flex items-center gap-4 mb-8">
            <a
              href="/admin"
              className="flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
              title="Volver al inventario"
            >
              <ArrowLeft className="w-5 h-5" />
            </a>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-slate-50">
                Registrar Nuevo Vehículo
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                Completa todos los campos marcados con{' '}
                <span className="text-red-500 font-bold">*</span> para publicar el vehículo.
              </p>
            </div>
          </div>

          {/* Toast banner */}
          {toast && (
            <div
              className={`mb-6 flex items-center gap-3 rounded-2xl px-5 py-4 text-sm font-semibold border ${
                toast.type === 'success'
                  ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-700 dark:text-green-300'
                  : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-700 dark:text-red-300'
              }`}
            >
              {toast.type === 'success' ? (
                <CheckCircle className="w-5 h-5 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0" />
              )}
              {toast.message}
            </div>
          )}

          {/* ── Form card ──────────────────────────────────────────────────────── */}
          <form
            id="add-vehicle-form"
            onSubmit={handleSubmit}
            className="space-y-8"
          >
            {/* ── Section 1: Images ────────────────────────────────────────── */}
            <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                  Imágenes del vehículo
                </h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Sube hasta 5 imágenes. La imagen principal será la portada en el catálogo.
                </p>
              </div>
              <div className="p-6">
                <MultiImageUpload
                  images={images}
                  onChange={setImages}
                  error={imageError}
                  onErrorChange={setImageError}
                />
              </div>
            </section>

            {/* ── Section 2: Identification ─────────────────────────────── */}
            <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                  Identificación del vehículo
                </h2>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* Brand */}
                <div className="sm:col-span-1">
                  <label htmlFor="brand_id" className={labelClass}>
                    Marca <span className="text-red-500">*</span>
                  </label>
                  {loadingBrands ? (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                      <span className="text-sm text-slate-400">Cargando marcas…</span>
                    </div>
                  ) : (
                    <select
                      id="brand_id"
                      required
                      className={fieldClass}
                      value={formData.brand_id}
                      onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
                    >
                      <option value="">Selecciona una marca</option>
                      {brands.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Model */}
                <div>
                  <label htmlFor="model" className={labelClass}>
                    Modelo <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="model"
                    required
                    type="text"
                    className={fieldClass}
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="Ej: Corolla, Civic, Tiguan…"
                  />
                </div>

                {/* Year */}
                <div>
                  <label htmlFor="year" className={labelClass}>
                    Año <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="year"
                    required
                    type="number"
                    min={1900}
                    max={new Date().getFullYear() + 1}
                    className={fieldClass}
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            </section>

            {/* ── Section 3: Commercial ─────────────────────────────────── */}
            <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                  Datos comerciales
                </h2>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <div>
                  <label htmlFor="price" className={labelClass}>
                    Precio ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="price"
                    required
                    type="number"
                    min={0}
                    step="0.01"
                    className={fieldClass}
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label htmlFor="mileage" className={labelClass}>
                    Kilometraje (KM)
                  </label>
                  <input
                    id="mileage"
                    type="number"
                    min={0}
                    className={fieldClass}
                    value={formData.mileage}
                    onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label htmlFor="condition" className={labelClass}>
                    Condición <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="condition"
                    required
                    className={fieldClass}
                    value={formData.condition}
                    onChange={(e) =>
                      setFormData({ ...formData, condition: e.target.value as 'nuevo' | 'usado' })
                    }
                  >
                    <option value="nuevo">Nuevo</option>
                    <option value="usado">Usado</option>
                  </select>
                </div>
              </div>
            </section>

            {/* ── Section 4: Technical ─────────────────────────────────── */}
            <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                  Especificaciones técnicas
                </h2>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div>
                  <label htmlFor="color" className={labelClass}>
                    Color <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="color"
                    required
                    type="text"
                    className={fieldClass}
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="Ej: Blanco Perla"
                  />
                </div>
                <div>
                  <label htmlFor="transmission" className={labelClass}>
                    Transmisión <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="transmission"
                    required
                    className={fieldClass}
                    value={formData.transmission}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        transmission: e.target.value as 'automático' | 'manual',
                      })
                    }
                  >
                    <option value="automático">Automático</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="fuel_type" className={labelClass}>
                    Combustible <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="fuel_type"
                    required
                    className={fieldClass}
                    value={formData.fuel_type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        fuel_type: e.target.value as
                          | 'gasolina'
                          | 'diesel'
                          | 'eléctrico'
                          | 'híbrido',
                      })
                    }
                  >
                    <option value="gasolina">Gasolina</option>
                    <option value="diesel">Diésel</option>
                    <option value="híbrido">Híbrido</option>
                    <option value="eléctrico">Eléctrico</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="owners" className={labelClass}>
                    Propietarios anteriores
                  </label>
                  <input
                    id="owners"
                    type="number"
                    min={0}
                    className={fieldClass}
                    value={formData.owners}
                    onChange={(e) => setFormData({ ...formData, owners: e.target.value })}
                  />
                </div>
              </div>

              {/* Plate end — standalone row */}
              <div className="px-6 pb-6">
                <div className="max-w-xs">
                  <label htmlFor="plate_end" className={labelClass}>
                    Terminación de placa
                  </label>
                  <input
                    id="plate_end"
                    type="number"
                    min={0}
                    max={9}
                    className={fieldClass}
                    value={formData.plate_end}
                    onChange={(e) => setFormData({ ...formData, plate_end: e.target.value })}
                    placeholder="0 – 9"
                  />
                </div>
              </div>
            </section>

            {/* ── Section 5: Description ─────────────────────────────── */}
            <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                  Descripción
                </h2>
              </div>
              <div className="p-6">
                <label htmlFor="description" className={labelClass}>
                  Descripción del vehículo
                </label>
                <textarea
                  id="description"
                  rows={4}
                  className={fieldClass}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Características destacadas, estado general, equipamiento especial…"
                />
              </div>
            </section>

            {/* ── Footer actions ─────────────────────────────────────────── */}
            <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-4 pt-2 pb-8">
              <a
                href="/admin"
                className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Cancelar y volver
              </a>

              <button
                type="submit"
                form="add-vehicle-form"
                disabled={saving || loadingBrands}
                className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-600/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 disabled:pointer-events-none min-w-[200px]"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Guardando vehículo…
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Registrar vehículo
                  </>
                )}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
