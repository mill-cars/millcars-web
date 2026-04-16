import { supabase } from '../lib/supabase';
import { Car } from '../types';

/**
 * Row shape returned by the `cars` join query.
 * brand_name comes from the joined `brands` table.
 * cover_image comes from a subquery on `car_images`.
 * features comes from `car_features` aggregated.
 */
interface CarRow {
  id: string;
  brand_id: string;
  brand_name: string | null;
  model: string;
  year: number;
  price: string; // numeric comes back as string from PostgREST
  mileage: number;
  color: string;
  condition: 'nuevo' | 'usado';
  transmission: 'automático' | 'manual';
  fuel_type: 'gasolina' | 'diesel' | 'eléctrico' | 'híbrido';
  owners: number;
  plate_end: number | null;
  description: string | null;
  is_active: boolean;
  slug: string | null;
  cover_image: string | null;
  features: string[] | null;
}

/** Maps a DB row to the frontend `Car` type */
function mapRowToCar(row: CarRow): Car {
  return {
    id: row.id,
    brand: row.brand_name ?? 'Sin marca',
    model: row.model,
    year: row.year,
    price: parseFloat(row.price),
    mileage: row.mileage,
    color: row.color,
    condition: row.condition,
    transmission: row.transmission,
    fuelType: row.fuel_type,
    owners: row.owners,
    plateEnd: row.plate_end ?? 0,
    image:
      row.cover_image ??
      'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&q=80&w=800',
    description: row.description ?? '',
    features: row.features ?? [],
    isActive: row.is_active,
    slug: row.slug ?? undefined,
  };
}

/**
 * Fetch all **active** cars from Supabase, joined with brand name,
 * cover image and features.
 */
export async function fetchCars(): Promise<Car[]> {
  const { data, error } = await supabase.rpc('get_cars_with_details');

  if (error) {
    console.error('[carsService] Error fetching cars:', error.message);
    throw new Error(error.message);
  }

  return (data as CarRow[]).map(mapRowToCar);
}

/**
 * Fetch ALL cars (active + inactive) for the admin dashboard.
 */
export async function fetchAllCars(): Promise<Car[]> {
  const { data, error } = await supabase.rpc('get_all_cars_with_details');

  if (error) {
    console.error('[carsService] Error fetching all cars:', error.message);
    throw new Error(error.message);
  }

  return (data as CarRow[]).map(mapRowToCar);
}
