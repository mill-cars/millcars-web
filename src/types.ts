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
  /** Whether the car is visible in the public catalog (soft-delete) */
  isActive?: boolean;
  /** SEO-friendly slug */
  slug?: string;
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
