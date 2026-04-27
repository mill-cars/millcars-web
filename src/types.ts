export interface CarImage {
  id: string;
  url: string;
  storagePath: string | null;
  isCover: boolean;
  sortOrder: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string | null;
  sort_order: number;
  car_count: number;
}

export interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  color: string;
  condition: 'nuevo' | 'usado';
  transmission: 'automático' | 'manual';
  fuelType: 'gasolina' | 'diesel' | 'eléctrico' | 'híbrido';
  owners: number;
  plateEnd: number;
  image: string;
  description: string;
  features: string[];
  /** All images for detail view */
  images?: CarImage[];
  /** Whether the car is visible in the public catalog (soft-delete) */
  isActive?: boolean;
  /** SEO-friendly slug */
  slug?: string;
  /** Millcars certified inspection badge */
  isCertified?: boolean;
  /** Optional promotion label */
  promotion?: 'flash_sale' | 'oferta' | 'mejor_vendido' | null;
  /** Category slugs this car belongs to */
  categories?: string[];
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface SearchFilters {
  brand?: string;
  model?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  maxMileage?: number;
  color?: string;
  condition?: 'nuevo' | 'usado';
  plateEnd?: number;
  owners?: number;
  fuelType?: string;
  transmission?: string;
  query?: string;
}
