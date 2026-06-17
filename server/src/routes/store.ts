import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { asyncHandler, ApiError } from '../lib/http.js'
import { authenticate } from '../middleware/auth.js'
import { buildStoreSnapshot, createOrderFromCart } from '../services/store.js'

const router = Router()

const cartItemSchema = z.object({
  productId: z.string().min(1),
  size: z.string().min(1),
})

const addCartItemSchema = cartItemSchema.extend({
  quantity: z.number().int().positive(),
})

const updateCartItemSchema = cartItemSchema.extend({
  quantity: z.number().int().positive(),
})

const wishlistSchema = z.object({
  productId: z.string().min(1),
})

router.use(authenticate)

async function getProductOrThrow(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  })

  if (!product) {
    throw new ApiError(404, 'Product not found.')
  }

  return product
}

router.get(
  '/',
  asyncHandler(async (request, response) => {
    response.json(await buildStoreSnapshot(request.auth!.userId))
  }),
)

router.post(
  '/cart/items',
  asyncHandler(async (request, response) => {
    const payload = addCartItemSchema.parse(request.body)
    const product = await getProductOrThrow(payload.productId)

    if (!product.sizes.includes(payload.size)) {
      throw new ApiError(400, 'That size is not available for this product.')
    }

    await prisma.cartItem.upsert({
      where: {
        userId_productId_size: {
          userId: request.auth!.userId,
          productId: payload.productId,
          size: payload.size,
        },
      },
      update: {
        quantity: {
          increment: payload.quantity,
        },
      },
      create: {
        userId: request.auth!.userId,
        productId: payload.productId,
        size: payload.size,
        quantity: payload.quantity,
      },
    })

    response.status(201).json(await buildStoreSnapshot(request.auth!.userId))
  }),
)

router.patch(
  '/cart/items',
  asyncHandler(async (request, response) => {
    const payload = updateCartItemSchema.parse(request.body)
    const product = await getProductOrThrow(payload.productId)

    if (!product.sizes.includes(payload.size)) {
      throw new ApiError(400, 'That size is not available for this product.')
    }

    await prisma.cartItem.update({
      where: {
        userId_productId_size: {
          userId: request.auth!.userId,
          productId: payload.productId,
          size: payload.size,
        },
      },
      data: {
        quantity: payload.quantity,
      },
    })

    response.json(await buildStoreSnapshot(request.auth!.userId))
  }),
)

router.delete(
  '/cart/items',
  asyncHandler(async (request, response) => {
    const payload = cartItemSchema.parse(request.body)

    await prisma.cartItem.deleteMany({
      where: {
        userId: request.auth!.userId,
        productId: payload.productId,
        size: payload.size,
      },
    })

    response.json(await buildStoreSnapshot(request.auth!.userId))
  }),
)

router.post(
  '/wishlist/toggle',
  asyncHandler(async (request, response) => {
    const payload = wishlistSchema.parse(request.body)
    await getProductOrThrow(payload.productId)

    const existing = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: request.auth!.userId,
          productId: payload.productId,
        },
      },
    })

    if (existing) {
      await prisma.wishlistItem.delete({
        where: {
          userId_productId: {
            userId: request.auth!.userId,
            productId: payload.productId,
          },
        },
      })
    } else {
      await prisma.wishlistItem.create({
        data: {
          userId: request.auth!.userId,
          productId: payload.productId,
        },
      })
    }

    response.json(await buildStoreSnapshot(request.auth!.userId))
  }),
)

router.post(
  '/checkout',
  asyncHandler(async (request, response) => {
    response.status(201).json(await createOrderFromCart(request.auth!.userId))
  }),
)

export default router
