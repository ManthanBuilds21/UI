import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { asyncHandler } from '../lib/http.js'
import { authenticate, requireRole } from '../middleware/auth.js'

const router = Router()

router.use(authenticate, requireRole('ADMIN'))

router.get(
  '/dashboard',
  asyncHandler(async (_request, response) => {
    const [orderCount, userCount, collectionCount, orders] = await Promise.all([
      prisma.order.count(),
      prisma.user.count({
        where: {
          role: 'USER',
        },
      }),
      prisma.collection.count(),
      prisma.order.findMany({
        orderBy: [{ createdAt: 'desc' }],
        take: 8,
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          items: {
            orderBy: [{ createdAt: 'asc' }],
            select: {
              productName: true,
              size: true,
              quantity: true,
            },
          },
        },
      }),
    ])

    response.json({
      orderCount,
      userCount,
      collectionCount,
      orders: orders.map((order) => ({
        id: order.id,
        customerName: order.user.name,
        customerEmail: order.user.email,
        total: order.total,
        createdAt: order.createdAt.toISOString(),
        itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
        status: order.status,
        items: order.items,
      })),
    })
  }),
)

export default router
