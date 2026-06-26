export type Category =
  | 'Hoodies'
  | 'T-Shirts'
  | 'Jackets'
  | 'Cargo Pants'
  | 'Sneakers'
  | 'Accessories'

export type FilterCategory = 'All' | Category

export interface Product {
  id: string
  slug: string
  name: string
  category: Category
  collection: string
  price: number
  accent: string
  background: string
  ghostText: string
  badge: string
  shortDescription: string
  description: string
  story: string
  fit: string
  material: string
  colors: string[]
  sizes: string[]
  features: string[]
  images: string[]
  stockBySize?: Record<string, number>
}

export interface CollectionSpotlight {
  id: string
  slug: string
  name: string
  ghostText: string
  tagline: string
  description: string
  category: Category
  background: string
  accent: string
  heroImage: string
  productSlugs: string[]
}

export interface EditorialMoment {
  title: string
  description: string
  image: string
  location: string
}

export interface BrandValue {
  title: string
  description: string
}
