import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { asyncHandler, ApiError } from '../lib/http.js'
import { authenticate, requireRole } from '../middleware/auth.js'

const router = Router()

router.use(authenticate, requireRole('ADMIN'))

// ── Helper: detect low-stock products (any size ≤ 3) ─────────────────────────

function getLowStockProducts(products: Array<{ id: string; name: string; stockBySize: unknown }>) {
  const result: Array<{ productId: string; productName: string; size: string; stock: number }> = []
  for (const product of products) {
    const stockBySize = (product.stockBySize as Record<string, number>) ?? {}
    for (const [size, stock] of Object.entries(stockBySize)) {
      if (stock <= 3) {
        result.push({ productId: product.id, productName: product.name, size, stock })
      }
    }
  }
  return result
}

// ── GET /api/admin/dashboard ──────────────────────────────────────────────────

router.get(
  '/dashboard',
  asyncHandler(async (_request, response) => {
    const [orderCount, userCount, revenueAgg, products] = await Promise.all([
      prisma.order.count(),
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { paymentStatus: 'PAID' },
      }),
      prisma.product.findMany({ select: { id: true, name: true, stockBySize: true } }),
    ])

    const revenue = revenueAgg._sum.total ?? 0
    const lowStockProducts = getLowStockProducts(products)

    response.json({
      orderCount,
      userCount,
      revenue,
      lowStockProducts,
    })
  }),
)

// ── GET /api/admin/orders ─────────────────────────────────────────────────────

const ordersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
})

router.get(
  '/orders',
  asyncHandler(async (request, response) => {
    const { page } = ordersQuerySchema.parse(request.query)
    const PAGE_SIZE = 20
    const skip = (page - 1) * PAGE_SIZE

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        skip,
        take: PAGE_SIZE,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          items: {
            select: { productName: true, size: true, quantity: true, unitPrice: true },
          },
        },
      }),
      prisma.order.count(),
    ])

    response.json({
      orders: orders.map((order) => ({
        id: order.id,
        customerName: order.user.name,
        customerEmail: order.user.email,
        total: order.total,
        subtotal: order.subtotal,
        shipping: order.shipping,
        createdAt: order.createdAt.toISOString(),
        itemCount: order.items.reduce((s, i) => s + i.quantity, 0),
        status: order.status,
        paymentStatus: order.paymentStatus,
        items: order.items,
      })),
      total,
      page,
      pageSize: PAGE_SIZE,
      totalPages: Math.ceil(total / PAGE_SIZE),
    })
  }),
)

// ── GET /api/admin/orders/:id ─────────────────────────────────────────────────

router.get(
  '/orders/:id',
  asyncHandler(async (request, response) => {
    const order = await prisma.order.findUnique({
      where: { id: request.params.id as string },
      include: {
        user: { select: { name: true, email: true } },
        items: true,
        address: true,
      },
    })

    if (!order) {
      throw new ApiError(404, 'Order not found.')
    }

    response.json({ order })
  }),
)

// ── PATCH /api/admin/orders/:id ───────────────────────────────────────────────

const patchOrderSchema = z.object({
  status: z.enum(['CONFIRMED', 'FULFILLED', 'CANCELLED']),
})

router.patch(
  '/orders/:id',
  asyncHandler(async (request, response) => {
    const { status } = patchOrderSchema.parse(request.body)

    const order = await prisma.order.findUnique({ where: { id: request.params.id as string } })
    if (!order) {
      throw new ApiError(404, 'Order not found.')
    }

    const updated = await prisma.order.update({
      where: { id: request.params.id as string },
      data: { status },
    })

    response.json({ order: updated })
  }),
)

// ── GET /api/admin/products ───────────────────────────────────────────────────

router.get(
  '/products',
  asyncHandler(async (_request, response) => {
    const products = await prisma.product.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { collection: { select: { name: true } } },
    })

    response.json({
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        collectionName: p.collection.name,
        price: p.price,
        sizes: p.sizes,
        stockBySize: p.stockBySize as Record<string, number>,
      })),
    })
  }),
)

// ── PATCH /api/admin/products/:id/stock ───────────────────────────────────────

const patchStockSchema = z.object({
  size: z.string().min(1),
  stock: z.number().int().min(0),
})

router.patch(
  '/products/:id/stock',
  asyncHandler(async (request, response) => {
    const { size, stock } = patchStockSchema.parse(request.body)

    const product = await prisma.product.findUnique({ where: { id: request.params.id as string } })
    if (!product) {
      throw new ApiError(404, 'Product not found.')
    }

    if (!product.sizes.includes(size)) {
      throw new ApiError(400, `Size "${size}" is not available for this product.`)
    }

    const currentStock = (product.stockBySize as Record<string, number>) ?? {}
    const updatedStock = { ...currentStock, [size]: stock }

    const updated = await prisma.product.update({
      where: { id: request.params.id as string },
      data: { stockBySize: updatedStock },
    })

    response.json({
      product: {
        id: updated.id,
        name: updated.name,
        stockBySize: updated.stockBySize as Record<string, number>,
      },
    })
  }),
)

export default router
