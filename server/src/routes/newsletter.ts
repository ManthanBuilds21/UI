import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { asyncHandler } from '../lib/http.js'

const router = Router()

const newsletterSchema = z.object({
  email: z.string().trim().email(),
})

router.post(
  '/',
  asyncHandler(async (request, response) => {
    const payload = newsletterSchema.parse(request.body)

    const subscriber = await prisma.newsletterSubscriber.upsert({
      where: {
        email: payload.email.toLowerCase(),
      },
      update: {},
      create: {
        email: payload.email.toLowerCase(),
      },
    })

    response.status(201).json({
      email: subscriber.email,
    })
  }),
)

export default router
