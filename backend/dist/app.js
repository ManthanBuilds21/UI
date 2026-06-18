import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { config } from './config.js';
import { ApiError, sendSuccess } from './lib/http.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { devRequestLogger, requestLogger } from './middleware/requestLogger.js';
import adminRouter from './routes/admin.js';
import authRouter from './routes/auth.js';
import catalogRouter from './routes/catalog.js';
import newsletterRouter from './routes/newsletter.js';
import storeRouter from './routes/store.js';
function isAllowedOrigin(origin) {
    if (!origin) {
        return true;
    }
    return config.corsOrigins.includes(origin);
}
export function createApp() {
    const app = express();
    app.use(helmet());
    app.use(cors({
        origin(origin, callback) {
            if (isAllowedOrigin(origin)) {
                callback(null, true);
                return;
            }
            callback(new ApiError(403, 'Origin not allowed by CORS.'));
        },
        credentials: true,
    }));
    app.use(requestLogger);
    if (devRequestLogger) {
        app.use(devRequestLogger);
    }
    app.use(express.json({ limit: '1mb' }));
    app.get('/api/health', (_request, response) => {
        sendSuccess(response, {
            status: 'ok',
            timestamp: new Date().toISOString(),
            version: config.appVersion,
        }, 200);
    });
    app.use('/api/auth', authRouter);
    app.use('/api/catalog', catalogRouter);
    app.use('/api/newsletter', newsletterRouter);
    app.use('/api/store', storeRouter);
    app.use('/api/admin', adminRouter);
    app.use(notFoundHandler);
    app.use(errorHandler);
    return app;
}
