import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { asyncHandler, ApiError } from '../lib/http.js'
import { categories, serializeCollection, serializeProduct } from '../lib/catalog.js'

const router = Router()

router.get(
  '/',
  asyncHandler(async (_request, response) => {
    const [collections, products] = await Promise.all([
      prisma.collection.findMany({
        orderBy: [{ sortOrder: 'asc' }],
      }),
      prisma.product.findMany({
        orderBy: [{ sortOrder: 'asc' }],
        include: {
          collection: true,
        },
      }),
    ])

    response.json({
      categories,
      collections: collections.map(serializeCollection),
      products: products.map(serializeProduct),
    })
  }),
)

router.get(
  '/products/:slug',
  asyncHandler(async (request, response) => {
    const slug = String(request.params.slug)

    const product = await prisma.product.findUnique({
      where: {
        slug,
      },
      include: {
        collection: true,
      },
    })

    if (!product) {
      throw new ApiError(404, 'Product not found.')
    }

    response.json({
      product: serializeProduct(product),
    })
  }),
)

export default router
