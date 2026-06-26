import crypto from 'crypto'
import { Router, type Request, type Response } from 'express'
import Razorpay from 'razorpay'
import { z } from 'zod'
import { config } from '../config.js'
import { asyncHandler, ApiError } from '../lib/http.js'
import { prisma } from '../lib/prisma.js'
import { authenticate } from '../middleware/auth.js'
import { calculateShipping } from '../lib/catalog.js'

const router = Router()

const razorpay = new Razorpay({
  key_id: config.razorpayKeyId,
  key_secret: config.razorpayKeySecret,
})

const addressSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().default('India'),
  phone: z.string().min(1),
})

// ─── Webhook (no auth middleware — server-to-server) ──────────────────────────
// NOTE: This route must be registered in index.ts BEFORE express.json() with
// express.raw({ type: 'application/json' }) so it receives the raw Buffer body.

export async function webhookHandler(request: Request, response: Response) {
  const signature = request.headers['x-razorpay-signature'] as string | undefined

  if (!signature) {
    response.status(400).json({ message: 'Missing webhook signature.' })
    return
  }

  // Verify HMAC-SHA256 of raw body
  const rawBody = request.body as Buffer
  const expectedSig = crypto
    .createHmac('sha256', config.razorpayWebhookSecret)
    .update(rawBody)
    .digest('hex')

  if (expectedSig !== signature) {
    response.status(400).json({ message: 'Invalid webhook signature.' })
    return
  }

  let event: { event: string; payload: Record<string, unknown> }
  try {
    event = JSON.parse(rawBody.toString()) as {
      event: string
      payload: Record<string, unknown>
    }
  } catch {
    response.status(400).json({ message: 'Invalid JSON payload.' })
    return
  }

  if (event.event === 'payment.captured') {
    try {
      const paymentEntity = (event.payload as any)?.payment?.entity as Record<string, unknown>
      const razorpayOrderId = paymentEntity?.order_id as string | undefined
      const razorpayPaymentId = paymentEntity?.id as string | undefined

      if (!razorpayOrderId) {
        response.status(200).json({ message: 'Ignored — no order_id.' })
        return
      }

      const order = await prisma.order.findFirst({
        where: { razorpayOrderId },
        include: { items: true },
      })

      if (!order) {
        // Unknown order — respond 200 to avoid Razorpay retries
        response.status(200).json({ message: 'Order not found.' })
        return
      }

      // Idempotent — already paid
      if (order.paymentStatus === 'PAID') {
        response.status(200).json({ message: 'Already processed.' })
        return
      }

      // Run same transaction as /verify
      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: 'PAID',
            status: 'CONFIRMED',
            razorpayPaymentId: razorpayPaymentId ?? null,
            paymentProvider: 'razorpay',
          },
        })

        // Clear the cart for the user
        await tx.cartItem.deleteMany({
          where: { userId: order.userId },
        })

        // Decrement stock for each item
        for (const item of order.items) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
            select: { stockBySize: true },
          })

          if (!product) continue

          const stockBySize = (product.stockBySize as Record<string, number>) ?? {}
          const currentStock = stockBySize[item.size] ?? 0
          const newStock = currentStock - item.quantity

          if (newStock < 0) {
            throw new ApiError(409, 'One or more items are out of stock.')
          }

          await tx.product.update({
            where: { id: item.productId },
            data: {
              stockBySize: {
                ...stockBySize,
                [item.size]: newStock,
              },
            },
          })
        }
      })
    } catch (error) {
      console.error('Webhook processing error:', error)
      // Don't expose internal errors to Razorpay — respond 200 to avoid retries
      // Log and handle via monitoring
    }
  }

  response.status(200).json({ message: 'ok' })
}

// ─── All routes below require user authentication ─────────────────────────────

router.use(authenticate)

router.post(
  '/address',
  asyncHandler(async (request, response) => {
    const payload = addressSchema.parse(request.body)
    const userId = request.auth!.userId

    let address
    if (payload.id) {
      address = await prisma.address.update({
        where: { id: payload.id, userId },
        data: payload,
      })
    } else {
      address = await prisma.address.create({
        data: {
          ...payload,
          userId,
        },
      })
    }

    response.json({ address })
  }),
)

const initiateSchema = z.object({
  addressId: z.string().min(1),
})

router.post(
  '/initiate',
  asyncHandler(async (request, response) => {
    const { addressId } = initiateSchema.parse(request.body)
    const userId = request.auth!.userId

    const address = await prisma.address.findUnique({
      where: { id: addressId, userId },
    })

    if (!address) {
      throw new ApiError(404, 'Address not found.')
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    })

    if (cartItems.length === 0) {
      throw new ApiError(400, 'Your cart is empty.')
    }

    const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
    const shipping = calculateShipping(subtotal)
    const total = subtotal + shipping

    // Create Razorpay Order
    let razorpayOrder
    try {
      razorpayOrder = await razorpay.orders.create({
        amount: total * 100, // Amount in paise
        currency: 'INR',
        receipt: `rcpt_${userId}_${Date.now()}`.slice(0, 40),
      })
    } catch (error) {
      console.error('Razorpay Error:', error)
      throw new ApiError(500, 'Failed to initialize payment gateway.')
    }

    // Create our DB order
    const order = await prisma.order.create({
      data: {
        userId,
        subtotal,
        shipping,
        total,
        addressId,
        razorpayOrderId: razorpayOrder.id,
        status: 'PENDING',
        paymentStatus: 'UNPAID',
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
    })

    response.json({
      orderId: order.id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: config.razorpayKeyId,
    })
  }),
)

const verifySchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
})

router.post(
  '/verify',
  asyncHandler(async (request, response) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = verifySchema.parse(
      request.body,
    )
    const userId = request.auth!.userId

    // ── Step 1: Verify Razorpay signature ────────────────────────────────────
    const body = razorpay_order_id + '|' + razorpay_payment_id

    const expectedSignature = crypto
      .createHmac('sha256', config.razorpayKeySecret)
      .update(body.toString())
      .digest('hex')

    const isAuthentic = expectedSignature === razorpay_signature

    if (!isAuthentic) {
      throw new ApiError(400, 'Invalid payment signature.')
    }

    // ── Step 2: Fetch order with items from DB ────────────────────────────────
    const order = await prisma.order.findFirst({
      where: { razorpayOrderId: razorpay_order_id, userId },
      include: { items: true },
    })

    if (!order) {
      throw new ApiError(404, 'Order not found.')
    }

    // Already paid (idempotent)
    if (order.paymentStatus === 'PAID') {
      response.json({ orderId: order.id })
      return
    }

    // ── Step 3: Recompute total and verify against Razorpay's recorded amount ─
    const recomputedSubtotal = order.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    )
    const recomputedTotal = recomputedSubtotal + order.shipping

    let razorpayFetchedOrder: { amount: number }
    try {
      razorpayFetchedOrder = await razorpay.orders.fetch(razorpay_order_id) as { amount: number }
    } catch (error) {
      console.error('Razorpay fetch error:', error)
      throw new ApiError(500, 'Could not verify payment amount with gateway.')
    }

    if (razorpayFetchedOrder.amount !== recomputedTotal * 100) {
      throw new ApiError(400, 'Payment amount mismatch. Please contact support.')
    }

    // ── Step 4: Mark paid + clear cart + decrement stock (atomic transaction) ─
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'PAID',
          status: 'CONFIRMED',
          razorpayPaymentId: razorpay_payment_id,
          paymentProvider: 'razorpay',
        },
      })

      // Clear the cart
      await tx.cartItem.deleteMany({
        where: { userId },
      })

      // Decrement stock for each ordered item
      for (const item of order.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { stockBySize: true },
        })

        if (!product) continue

        const stockBySize = (product.stockBySize as Record<string, number>) ?? {}
        const currentStock = stockBySize[item.size] ?? 0
        const newStock = currentStock - item.quantity

        if (newStock < 0) {
          throw new ApiError(409, 'One or more items are out of stock.')
        }

        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockBySize: {
              ...stockBySize,
              [item.size]: newStock,
            },
          },
        })
      }
    })

    response.json({ orderId: order.id })
  }),
)

export default router
