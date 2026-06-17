import type { Collection, Product } from '@prisma/client'

export const categories = [
  'All',
  'Hoodies',
  'T-Shirts',
  'Jackets',
  'Cargo Pants',
  'Sneakers',
  'Accessories',
] as const

export const freeShippingThreshold = 180
export const flatShippingRate = 18

export function calculateShipping(subtotal: number) {
  return subtotal === 0 || subtotal >= freeShippingThreshold ? 0 : flatShippingRate
}

export function serializeCollection(collection: Collection) {
  return {
    id: collection.id,
    slug: collection.slug,
    name: collection.name,
    ghostText: collection.ghostText,
    tagline: collection.tagline,
    description: collection.description,
    category: collection.category,
    background: collection.background,
    accent: collection.accent,
    heroImage: collection.heroImage,
    productSlugs: collection.productSlugs,
  }
}

export function serializeProduct(
  product: Product & {
    collection: Collection
  },
) {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: product.category,
    collection: product.collection.name,
    price: product.price,
    accent: product.accent,
    background: product.background,
    ghostText: product.ghostText,
    badge: product.badge,
    shortDescription: product.shortDescription,
    description: product.description,
    story: product.story,
    fit: product.fit,
    material: product.material,
    colors: product.colors,
    sizes: product.sizes,
    features: product.features,
    images: product.images,
  }
}
