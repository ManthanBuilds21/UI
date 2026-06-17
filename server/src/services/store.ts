import type { Prisma, PrismaClient } from '@prisma/client'
import { calculateShipping } from '../lib/catalog.js'
import { prisma } from '../lib/prisma.js'
import { ApiError } from '../lib/http.js'

type DbClient = PrismaClient | Prisma.TransactionClient

export interface StoreSnapshot {
  cart: Array<{
    productId: string
    size: string
    quantity: number
  }>
  wishlist: string[]
  cartCount: number
  subtotal: number
}

async function buildStoreSnapshotWithClient(db: DbClient, userId: string): Promise<StoreSnapshot> {
  const [cartItems, wishlistItems] = await Promise.all([
    db.cartItem.findMany({
      where: { userId },
      orderBy: [{ createdAt: 'desc' }],
      include: {
        product: {
          select: {
            price: true,
          },
        },
      },
    }),
    db.wishlistItem.findMany({
      where: { userId },
      orderBy: [{ createdAt: 'desc' }],
      select: {
        productId: true,
      },
    }),
  ])

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  return {
    cart: cartItems.map((item) => ({
      productId: item.productId,
      size: item.size,
      quantity: item.quantity,
    })),
    wishlist: wishlistItems.map((item) => item.productId),
    cartCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
    subtotal,
  }
}

export async function buildStoreSnapshot(userId: string) {
  return buildStoreSnapshotWithClient(prisma, userId)
}

export async function createOrderFromCart(userId: string) {
  return prisma.$transaction(async (transaction) => {
    const cartItems = await transaction.cartItem.findMany({
      where: { userId },
      include: {
        product: true,
      },
    })

    if (cartItems.length === 0) {
      throw new ApiError(400, 'Your cart is empty.')
    }

    const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
    const shipping = calculateShipping(subtotal)
    const total = subtotal + shipping

    const order = await transaction.order.create({
      data: {
        userId,
        subtotal,
        shipping,
        total,
        items: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            productName: item.product.name,
            productSlug: item.product.slug,
            productImage: item.product.images[0] ?? '',
            size: item.size,
            quantity: item.quantity,
            unitPrice: item.product.price,
          })),
        },
      },
      include: {
        items: true,
      },
    })

    await transaction.cartItem.deleteMany({
      where: { userId },
    })

    const store = await buildStoreSnapshotWithClient(transaction, userId)

    return {
      order: {
        id: order.id,
        total: order.total,
        createdAt: order.createdAt.toISOString(),
      },
      store,
    }
  })
}
