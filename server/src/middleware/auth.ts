import type { NextFunction, Request, Response } from 'express'
import type { Role } from '@prisma/client'
import { verifyAuthToken, type AuthTokenPayload } from '../lib/auth.js'
import { ApiError } from '../lib/http.js'

declare global {
  namespace Express {
    interface Request {
      auth?: AuthTokenPayload
    }
  }
}

function getBearerToken(request: Request) {
  const authorization = request.header('authorization')

  if (!authorization?.startsWith('Bearer ')) {
    throw new ApiError(401, 'Authentication required.')
  }

  return authorization.slice('Bearer '.length).trim()
}

export function authenticate(request: Request, _response: Response, next: NextFunction) {
  try {
    const token = getBearerToken(request)
    request.auth = verifyAuthToken(token)
    next()
  } catch (error) {
    next(error)
  }
}

export function requireRole(role: Role) {
  return (request: Request, _response: Response, next: NextFunction) => {
    if (!request.auth) {
      next(new ApiError(401, 'Authentication required.'))
      return
    }

    if (request.auth.role !== role) {
      next(new ApiError(403, 'You do not have permission to access this resource.'))
      return
    }

    next()
  }
}
