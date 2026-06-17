import cors from 'cors'
import express from 'express'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { ZodError } from 'zod'
import { config } from './config.js'
import { ApiError } from './lib/http.js'
import authRouter from './routes/auth.js'
import catalogRouter from './routes/catalog.js'
import newsletterRouter from './routes/newsletter.js'
import storeRouter from './routes/store.js'
import adminRouter from './routes/admin.js'

const app = express()

app.use(
  cors({
    origin: config.clientOrigin,
  }),
)
app.use(express.json())

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' })
})

app.use('/api/auth', authRouter)
app.use('/api/catalog', catalogRouter)
app.use('/api/newsletter', newsletterRouter)
app.use('/api/store', storeRouter)
app.use('/api/admin', adminRouter)

app.use((_request, response) => {
  response.status(404).json({
    message: 'Route not found.',
  })
})

app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  if (error instanceof ApiError) {
    response.status(error.statusCode).json({
      message: error.message,
    })
    return
  }

  if (error instanceof ZodError) {
    response.status(400).json({
      message: 'Validation failed.',
      issues: error.issues,
    })
    return
  }

  if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
    response.status(404).json({
      message: 'The requested record could not be found.',
    })
    return
  }

  console.error(error)

  response.status(500).json({
    message: 'Internal server error.',
  })
})

app.listen(config.port, () => {
  console.log(`MANTHAN API listening on http://localhost:${config.port}`)
})
