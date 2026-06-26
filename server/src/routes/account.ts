import { Router } from 'express'
import { z } from 'zod'
import { asyncHandler, ApiError } from '../lib/http.js'
import { prisma } from '../lib/prisma.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

router.use(authenticate)

// ── GET /api/account/orders ───────────────────────────────────────────────────

router.get(
  '/orders',
  asyncHandler(async (request, response) => {
    const userId = request.auth!.userId

    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    })

    response.json({ orders })
  }),
)

// ── GET /api/account/orders/:id ───────────────────────────────────────────────

router.get(
  '/orders/:id',
  asyncHandler(async (request, response) => {
    const userId = request.auth!.userId

    const order = await prisma.order.findFirst({
      where: { id: request.params.id as string, userId },
      include: {
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

// ── GET /api/account/addresses ────────────────────────────────────────────────

router.get(
  '/addresses',
  asyncHandler(async (request, response) => {
    const userId = request.auth!.userId

    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    })

    response.json({ addresses })
  }),
)

// ── POST /api/account/addresses ───────────────────────────────────────────────

const addressSchema = z.object({
  name: z.string().min(1),
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().default('India'),
  phone: z.string().min(1),
})

router.post(
  '/addresses',
  asyncHandler(async (request, response) => {
    const payload = addressSchema.parse(request.body)
    const userId = request.auth!.userId

    // If no existing addresses, make this one default
    const existingCount = await prisma.address.count({ where: { userId } })

    const address = await prisma.address.create({
      data: {
        ...payload,
        userId,
        isDefault: existingCount === 0,
      },
    })

    response.status(201).json({ address })
  }),
)

// ── PATCH /api/account/addresses/:id ─────────────────────────────────────────

const updateAddressSchema = z.object({
  name: z.string().min(1),
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().default('India'),
  phone: z.string().min(1),
})

router.patch(
  '/addresses/:id',
  asyncHandler(async (request, response) => {
    const payload = updateAddressSchema.parse(request.body)
    const userId = request.auth!.userId

    const existing = await prisma.address.findFirst({
      where: { id: request.params.id as string, userId },
    })

    if (!existing) {
      throw new ApiError(404, 'Address not found.')
    }

    const address = await prisma.address.update({
      where: { id: request.params.id as string },
      data: payload,
    })

    response.json({ address })
  }),
)

// ── DELETE /api/account/addresses/:id ────────────────────────────────────────

router.delete(
  '/addresses/:id',
  asyncHandler(async (request, response) => {
    const userId = request.auth!.userId

    const address = await prisma.address.findFirst({
      where: { id: request.params.id as string, userId },
    })

    if (!address) {
      throw new ApiError(404, 'Address not found.')
    }

    await prisma.address.delete({
      where: { id: request.params.id as string },
    })

    // If the deleted address was default, promote the most recent one
    if (address.isDefault) {
      const next = await prisma.address.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      })
      if (next) {
        await prisma.address.update({
          where: { id: next.id },
          data: { isDefault: true },
        })
      }
    }

    response.json({ success: true })
  }),
)

// ── PATCH /api/account/addresses/:id/default ─────────────────────────────────

router.patch(
  '/addresses/:id/default',
  asyncHandler(async (request, response) => {
    const userId = request.auth!.userId

    const address = await prisma.address.findFirst({
      where: { id: request.params.id as string, userId },
    })

    if (!address) {
      throw new ApiError(404, 'Address not found.')
    }

    // Unset all, then set the target
    const targetId = request.params.id as string
    await prisma.$transaction([
      prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      }),
      prisma.address.update({
        where: { id: targetId },
        data: { isDefault: true },
      }),
    ])

    const updated = await prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    })

    response.json({ addresses: updated })
  }),
)

export default router
