import { supabase } from '../lib/supabase';
import { CarImage } from '../types';

// ─── Constants ────────────────────────────────────────────────────────────────

const BUCKET_NAME = 'car-images';
const MAX_FILE_SIZE_MB = 5;
const MAX_IMAGES = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CarImageRow {
  id: string;
  url: string;
  storage_path: string | null;
  is_cover: boolean;
  sort_order: number;
}

/** Local state for images being managed in the admin form */
export interface ManagedImage {
  /** DB id if already persisted, or a local temp id */
  id: string;
  /** Public URL (Supabase Storage) or local data URL for preview */
  url: string;
  /** File object if not yet uploaded */
  file?: File;
  /** Storage path if already uploaded */
  storagePath?: string | null;
  /** Whether this is the cover/primary image */
  isCover: boolean;
  /** Display order (0-based) */
  sortOrder: number;
  /** Whether this image is already saved in DB */
  isPersisted: boolean;
}

// ─── Validation ───────────────────────────────────────────────────────────────

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Formato no permitido. Usa JPG, PNG o WebP.';
  }
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    return `El archivo supera ${MAX_FILE_SIZE_MB} MB.`;
  }
  return null;
}

export function canAddMoreImages(currentCount: number): boolean {
  return currentCount < MAX_IMAGES;
}

export { MAX_IMAGES, MAX_FILE_SIZE_MB, ALLOWED_TYPES, BUCKET_NAME };

// ─── Fetch ────────────────────────────────────────────────────────────────────

/** Fetch all images for a car, ordered by cover first then sort_order */
export async function fetchCarImages(carId: string): Promise<CarImage[]> {
  const { data, error } = await supabase.rpc('get_car_images', { p_car_id: carId });

  if (error) {
    console.error('[imageService] Error fetching images:', error.message);
    throw new Error(error.message);
  }

  return (data as CarImageRow[]).map(mapRowToCarImage);
}

function mapRowToCarImage(row: CarImageRow): CarImage {
  return {
    id: row.id,
    url: row.url,
    storagePath: row.storage_path,
    isCover: row.is_cover,
    sortOrder: row.sort_order,
  };
}

// ─── Upload ───────────────────────────────────────────────────────────────────

/** Upload a single file to Supabase Storage and return { publicUrl, storagePath } */
export async function uploadImageToStorage(
  file: File,
  carId: string
): Promise<{ publicUrl: string; storagePath: string }> {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const storagePath = `${carId}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(storagePath, file, { contentType: file.type, upsert: false });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(storagePath);
  return { publicUrl: data.publicUrl, storagePath };
}

// ─── Insert / Update DB Records ───────────────────────────────────────────────

/** Insert a new car_images row */
export async function insertCarImageRecord(params: {
  carId: string;
  url: string;
  storagePath: string;
  isCover: boolean;
  sortOrder: number;
}): Promise<string> {
  const { data, error } = await supabase
    .from('car_images')
    .insert({
      car_id: params.carId,
      url: params.url,
      storage_path: params.storagePath,
      is_cover: params.isCover,
      sort_order: params.sortOrder,
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id as string;
}

/** Update cover status for an image (and unset others for same car) */
export async function setCoverImage(carId: string, imageId: string): Promise<void> {
  // First unset all cover flags for this car
  const { error: unsetError } = await supabase
    .from('car_images')
    .update({ is_cover: false })
    .eq('car_id', carId);

  if (unsetError) throw unsetError;

  // Then set the chosen image as cover
  const { error: setError } = await supabase
    .from('car_images')
    .update({ is_cover: true })
    .eq('id', imageId);

  if (setError) throw setError;
}

/** Update sort_order for multiple images */
export async function updateImageOrder(
  images: { id: string; sortOrder: number }[]
): Promise<void> {
  for (const img of images) {
    const { error } = await supabase
      .from('car_images')
      .update({ sort_order: img.sortOrder })
      .eq('id', img.id);
    if (error) throw error;
  }
}

// ─── Delete ───────────────────────────────────────────────────────────────────

/** Delete an image from both Storage and DB */
export async function deleteCarImage(imageId: string, storagePath?: string | null): Promise<void> {
  // Remove from Storage first (if path given)
  if (storagePath) {
    await supabase.storage.from(BUCKET_NAME).remove([storagePath]);
  }

  // Remove from DB
  const { error } = await supabase.from('car_images').delete().eq('id', imageId);
  if (error) throw error;
}

// ─── Batch Operations ─────────────────────────────────────────────────────────

/**
 * Save all managed images for a car.
 * Handles: uploading new files, deleting removed images, setting cover, updating order.
 */
export async function saveCarImages(
  carId: string,
  images: ManagedImage[],
  originalImages: ManagedImage[]
): Promise<void> {
  // 1) Delete removed images
  const currentIds = new Set(images.map((i) => i.id));
  const removedImages = originalImages.filter((oi) => oi.isPersisted && !currentIds.has(oi.id));
  for (const removed of removedImages) {
    await deleteCarImage(removed.id, removed.storagePath);
  }

  // 2) Upload new images & insert DB records
  const persistedIds: Map<string, string> = new Map(); // oldId → newDbId
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    if (!img.isPersisted && img.file) {
      const { publicUrl, storagePath } = await uploadImageToStorage(img.file, carId);
      const newId = await insertCarImageRecord({
        carId,
        url: publicUrl,
        storagePath,
        isCover: img.isCover,
        sortOrder: i,
      });
      persistedIds.set(img.id, newId);
    } else if (img.isPersisted) {
      // Update sort_order for existing images
      const { error } = await supabase
        .from('car_images')
        .update({ sort_order: i, is_cover: img.isCover })
        .eq('id', img.id);
      if (error) throw error;
    }
  }
}
