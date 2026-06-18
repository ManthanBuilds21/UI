import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
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

describe('newsletter routes', () => {
  const app = createApp()

  beforeEach(() => {
    resetMockPrisma()
  })

  it('stores newsletter subscribers with the success envelope', async () => {
    mockPrisma.newsletterSubscriber.upsert.mockResolvedValueOnce({
      email: 'subscriber@example.com',
    })

    const response = await request(app).post('/api/newsletter').send({
      email: 'subscriber@example.com',
    })

    expect(response.status).toBe(201)
    expect(response.body).toEqual({
      success: true,
      data: {
        email: 'subscriber@example.com',
      },
    })
  })

  it('rejects invalid email addresses', async () => {
    const response = await request(app).post('/api/newsletter').send({
      email: 'bad-email',
    })

    expect(response.status).toBe(400)
    expect(response.body.success).toBe(false)
    expect(response.body.message).toBe('Validation failed.')
  })
})
