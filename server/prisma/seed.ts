import { PrismaClient } from '@prisma/client'
import { collections, products } from '../../src/data/catalog.ts'

const prisma = new PrismaClient()

async function main() {
  const collectionByName = new Map(collections.map((collection) => [collection.name, collection]))

  for (const [index, collection] of collections.entries()) {
    await prisma.collection.upsert({
      where: { id: collection.id },
      update: {
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
        sortOrder: index,
      },
      create: {
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
        sortOrder: index,
      },
    })
  }

  for (const [index, product] of products.entries()) {
    const collection = collectionByName.get(product.collection)

    if (!collection) {
      throw new Error(`Collection "${product.collection}" was not found for product "${product.id}".`)
    }

    await prisma.product.upsert({
      where: { id: product.id },
      update: {
        slug: product.slug,
        name: product.name,
        category: product.category,
        collectionId: collection.id,
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
        sortOrder: index,
      },
      create: {
        id: product.id,
        slug: product.slug,
        name: product.name,
        category: product.category,
        collectionId: collection.id,
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
        sortOrder: index,
      },
    })
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
