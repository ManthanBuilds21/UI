import bcrypt from 'bcrypt'
import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { signAuthToken } from '../src/lib/auth.js'
import { createApp } from '../src/app.js'

const { mockPrisma, resetMockPrisma } = vi.hoisted(() => {
  const prisma = {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      upsert: vi.fn(),
    },
    collection: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    product: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    newsletterSubscriber: {
      upsert: vi.fn(),
    },
    cartItem: {
      findMany: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
      deleteMany: vi.fn(),
    },
    wishlistItem: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
      create: vi.fn(),
    },
    order: {
      count: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
    },
    $connect: vi.fn(),
    $disconnect: vi.fn(),
    $transaction: vi.fn(),
  }

  return {
    mockPrisma: prisma,
    resetMockPrisma() {
      Object.values(prisma).forEach((value) => {
        if (value && typeof value === 'object') {
          Object.values(value).forEach((member) => {
            if (typeof member === 'function' && 'mockReset' in member) {
              ;(member as { mockReset: () => void }).mockReset()
            }
          })
        }
      })
    },
  }
})

vi.mock('../src/lib/prisma.js', () => ({
  prisma: mockPrisma,
}))

describe('auth routes', () => {
  const app = createApp()

  beforeEach(() => {
    resetMockPrisma()
  })

  it('signs up a user with the standard success envelope', async () => {
    mockPrisma.user.findUnique.mockResolvedValueOnce(null)
    mockPrisma.user.create.mockResolvedValueOnce({
      id: 'user_1',
      name: 'Manthan User',
      email: 'user@example.com',
      role: 'USER',
    })

    const response = await request(app).post('/api/auth/signup').send({
      name: 'Manthan User',
      email: 'user@example.com',
      password: 'strong-pass',
      role: 'user',
    })

    expect(response.status).toBe(201)
    expect(response.body.success).toBe(true)
    expect(response.body.data.user.email).toBe('user@example.com')
    expect(response.body.data.token).toEqual(expect.any(String))
  })

  it('logs in a user with a hashed password', async () => {
    const passwordHash = await bcrypt.hash('strong-pass', 12)

    mockPrisma.user.findUnique.mockResolvedValueOnce({
      id: 'user_1',
      name: 'Manthan User',
      email: 'user@example.com',
      role: 'USER',
      passwordHash,
    })

    const response = await request(app).post('/api/auth/login').send({
      email: 'user@example.com',
      password: 'strong-pass',
      role: 'user',
    })

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.data.user.role).toBe('user')
  })

  it('returns the authenticated user for /me', async () => {
    const token = signAuthToken({
      id: 'user_1',
      email: 'user@example.com',
      role: 'USER',
    })

    mockPrisma.user.findUnique.mockResolvedValueOnce({
      id: 'user_1',
      name: 'Manthan User',
      email: 'user@example.com',
      role: 'USER',
    })

    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      success: true,
      data: {
        user: {
          id: 'user_1',
          name: 'Manthan User',
          email: 'user@example.com',
          role: 'user',
        },
      },
    })
  })

  it('rejects invalid login bodies with a failure envelope', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: 'not-an-email',
      password: 'short',
      role: 'user',
    })

    expect(response.status).toBe(400)
    expect(response.body.success).toBe(false)
    expect(response.body.message).toBe('Validation failed.')
  })
})
