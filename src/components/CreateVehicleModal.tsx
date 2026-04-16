import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, CheckCircle, AlertCircle, Loader2, ImagePlus } from 'lucide-react';
import { supabase } from '../lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Brand {
  id: string;
  name: string;
}

interface CreateVehicleModalProps {
  onClose: () => void;
  onSaved: () => void;
}

type Toast = { type: 'success' | 'error'; message: string } | null;

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_FILE_SIZE_MB = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const BUCKET_NAME = 'car-images';

// ─── Helper ───────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────

export function CreateVehicleModal({ onClose, onSaved }: CreateVehicleModalProps) {
  // ── State ──────────────────────────────────────────────────────────────────
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    async function fetchBrands() {
      setLoadingBrands(true);
      const { data, error } = await supabase
        .from('brands')
        .select('id, name')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching brands:', error);
        showToast('error', 'No se pudieron cargar las marcas.');
      } else {
        setBrands(data ?? []);
      }
      setLoadingBrands(false);
    }
    fetchBrands();
  }, []);

  // ── Toast helper ──────────────────────────────────────────────────────────
  function showToast(type: 'success' | 'error', message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4500);
  }

  // ── Image handling ────────────────────────────────────────────────────────
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setImageError('Formato no permitido. Usa JPG, PNG o WebP.');
      return;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setImageError(`El archivo excede ${MAX_FILE_SIZE_MB} MB.`);
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    // Simulate change event
    const fakeEvent = { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>;
    handleFileSelect(fakeEvent);
  }

  // ── Upload image to Supabase Storage ──────────────────────────────────────
  async function uploadImage(file: File, carId: string): Promise<string> {
    const ext = file.name.split('.').pop() ?? 'jpg';
    const storagePath = `${carId}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(storagePath);
    return data.publicUrl;
  }

  // ── Form submit ───────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!imageFile) {
      setImageError('La imagen del vehículo es obligatoria.');
      return;
    }

    if (!formData.brand_id) {
      showToast('error', 'Debes seleccionar una marca.');
      return;
    }

    setSaving(true);
    try {
      // 1. Find brand name for slug generation
      const brand = brands.find((b) => b.id === formData.brand_id);
      const brandName = brand?.name ?? 'auto';

      // 2. Insert car record
      const slug = `${slugify(brandName)}-${slugify(formData.model)}-${formData.year}-${Date.now()}`;

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

      // 3. Upload image and get public URL
      const publicUrl = await uploadImage(imageFile, carId);

      // 4. Insert into car_images
      const { error: imgError } = await supabase.from('car_images').insert({
        car_id: carId,
        url: publicUrl,
        storage_path: `${carId}/${imageFile.name}`,
        is_cover: true,
        sort_order: 0,
      });

      if (imgError) throw imgError;

      showToast('success', '¡Vehículo registrado correctamente!');
      setTimeout(() => {
        onSaved();
        onClose();
      }, 1500);
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'Error al guardar el vehículo.';
      showToast('error', msg);
    } finally {
      setSaving(false);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0 bg-gradient-to-r from-blue-600 to-blue-500">
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">
              Añadir Nuevo Vehículo
            </h2>
            <p className="text-blue-100 text-xs mt-0.5 font-medium">
              Completa todos los campos para registrar el vehículo
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={saving}
            className="p-2 hover:bg-white/20 rounded-xl transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          <form id="create-vehicle-form" onSubmit={handleSubmit} className="space-y-6">

            {/* ── Image Upload ─────────────────────────────────────────── */}
            <div>
              <label className={labelClass}>
                Imagen del vehículo
                <span className="ml-1 text-red-500">*</span>
              </label>
              <div
                role="button"
                tabIndex={0}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                className={`relative w-full h-48 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all group overflow-hidden ${
                  imageError
                    ? 'border-red-400 bg-red-50 dark:bg-red-900/10'
                    : imagePreview
                    ? 'border-blue-400 bg-blue-50/30 dark:bg-blue-900/10'
                    : 'border-slate-300 dark:border-slate-600 hover:border-blue-400 hover:bg-blue-50/30 dark:hover:border-blue-500 dark:hover:bg-blue-900/10'
                }`}
              >
                {imagePreview ? (
                  <>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                      <ImagePlus className="w-8 h-8 text-white" />
                      <p className="text-white text-sm font-bold">Cambiar imagen</p>
                    </div>
                    <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    {imageFile && (
                      <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] rounded-lg px-2 py-1 font-mono">
                        {imageFile.name} · {(imageFile.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-3 px-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                      <Upload className="w-6 h-6 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        Arrastra una imagen o haz clic para seleccionar
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        JPG, PNG, WebP · Máx. {MAX_FILE_SIZE_MB} MB
                      </p>
                    </div>
                  </div>
                )}
              </div>
              {imageError && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {imageError}
                </p>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>

            {/* ── Brand + Model ─────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="brand_id" className={labelClass}>
                  Marca
                  <span className="ml-1 text-red-500">*</span>
                </label>
                {loadingBrands ? (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    <span className="text-sm text-slate-400">Cargando marcas...</span>
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

              <div>
                <label htmlFor="model" className={labelClass}>
                  Modelo
                  <span className="ml-1 text-red-500">*</span>
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
            </div>

            {/* ── Year + Price + Mileage ────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="year" className={labelClass}>Año *</label>
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
              <div>
                <label htmlFor="price" className={labelClass}>Precio ($) *</label>
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
                <label htmlFor="mileage" className={labelClass}>Kilometraje (KM)</label>
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
            </div>

            {/* ── Color + Condition + Plate End ─────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="color" className={labelClass}>Color *</label>
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
                <label htmlFor="condition" className={labelClass}>Condición *</label>
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
              <div>
                <label htmlFor="plate_end" className={labelClass}>Terminación placa</label>
                <input
                  id="plate_end"
                  type="number"
                  min={0}
                  max={9}
                  className={fieldClass}
                  value={formData.plate_end}
                  onChange={(e) => setFormData({ ...formData, plate_end: e.target.value })}
                  placeholder="0-9"
                />
              </div>
            </div>

            {/* ── Transmission + Fuel + Owners ──────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="transmission" className={labelClass}>Transmisión *</label>
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
                <label htmlFor="fuel_type" className={labelClass}>Combustible *</label>
                <select
                  id="fuel_type"
                  required
                  className={fieldClass}
                  value={formData.fuel_type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fuel_type: e.target.value as 'gasolina' | 'diesel' | 'eléctrico' | 'híbrido',
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
                <label htmlFor="owners" className={labelClass}>Propietarios</label>
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

            {/* ── Description ──────────────────────────────────────────── */}
            <div>
              <label htmlFor="description" className={labelClass}>Descripción</label>
              <textarea
                id="description"
                rows={3}
                className={fieldClass}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Características destacadas del vehículo…"
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-3 bg-slate-50 dark:bg-slate-800/50 shrink-0">
          {/* Toast inline */}
          {toast && (
            <div
              className={`flex items-center gap-2 text-sm font-semibold rounded-xl px-4 py-2 transition-all ${
                toast.type === 'success'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}
            >
              {toast.type === 'success' ? (
                <CheckCircle className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              {toast.message}
            </div>
          )}
          {!toast && <div />}

          <div className="flex gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="create-vehicle-form"
              disabled={saving || loadingBrands}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-600/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-60 disabled:pointer-events-none"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando…
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Guardar Vehículo
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
