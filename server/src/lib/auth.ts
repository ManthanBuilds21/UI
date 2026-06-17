import jwt from 'jsonwebtoken'
import type { Role, User } from '@prisma/client'
import { config } from '../config.js'

export interface AuthTokenPayload {
  userId: string
  email: string
  role: Role
}

export function signAuthToken(user: Pick<User, 'id' | 'email' | 'role'>) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    } satisfies AuthTokenPayload,
    config.jwtSecret,
    { expiresIn: '7d' },
  )
}

export function verifyAuthToken(token: string) {
  return jwt.verify(token, config.jwtSecret) as AuthTokenPayload
}

export function toClientRole(role: Role) {
  return role === 'ADMIN' ? 'admin' : 'user'
}
