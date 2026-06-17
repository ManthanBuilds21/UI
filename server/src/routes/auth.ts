import bcrypt from 'bcrypt'
import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { asyncHandler, ApiError } from '../lib/http.js'
import { authenticate } from '../middleware/auth.js'
import { signAuthToken, toClientRole } from '../lib/auth.js'

const router = Router()

const signupSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  password: z.string().min(8),
  role: z.enum(['user', 'admin']),
})

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8),
  role: z.enum(['user', 'admin']),
})

function serializeUser(user: { id: string; name: string; email: string; role: 'USER' | 'ADMIN' }) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: toClientRole(user.role),
  }
}

router.post(
  '/signup',
  asyncHandler(async (request, response) => {
    const payload = signupSchema.parse(request.body)
    const existingUser = await prisma.user.findUnique({
      where: {
        email: payload.email.toLowerCase(),
      },
    })

    if (existingUser) {
      throw new ApiError(409, 'An account with that email already exists.')
    }

    const user = await prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email.toLowerCase(),
        passwordHash: await bcrypt.hash(payload.password, 12),
        role: payload.role === 'admin' ? 'ADMIN' : 'USER',
      },
    })

    response.status(201).json({
      token: signAuthToken(user),
      user: serializeUser(user),
    })
  }),
)

router.post(
  '/login',
  asyncHandler(async (request, response) => {
    const payload = loginSchema.parse(request.body)
    const user = await prisma.user.findUnique({
      where: {
        email: payload.email.toLowerCase(),
      },
    })

    if (!user) {
      throw new ApiError(401, 'Invalid email or password.')
    }

    const passwordMatches = await bcrypt.compare(payload.password, user.passwordHash)

    if (!passwordMatches) {
      throw new ApiError(401, 'Invalid email or password.')
    }

    if (toClientRole(user.role) !== payload.role) {
      throw new ApiError(403, 'That account does not match the selected role.')
    }

    response.json({
      token: signAuthToken(user),
      user: serializeUser(user),
    })
  }),
)

router.get(
  '/me',
  authenticate,
  asyncHandler(async (request, response) => {
    const user = await prisma.user.findUnique({
      where: {
        id: request.auth?.userId,
      },
    })

    if (!user) {
      throw new ApiError(401, 'Authentication required.')
    }

    response.json({
      user: serializeUser(user),
    })
  }),
)

export default router
