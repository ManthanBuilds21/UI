import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ZodError } from 'zod';
import { config } from '../config.js';
import { ApiError } from '../lib/http.js';
import { writeErrorLog } from '../lib/logger.js';
function sendFailure(response, statusCode, payload) {
    response.status(statusCode).json(payload);
}
export function notFoundHandler(_request, response) {
    sendFailure(response, 404, {
        success: false,
        message: 'Route not found.',
    });
}
export function errorHandler(error, request, response, _next) {
    if (error instanceof ApiError) {
        sendFailure(response, error.statusCode, {
            success: false,
            message: error.message,
        });
        return;
    }
    if (error instanceof ZodError) {
        sendFailure(response, 400, {
            success: false,
            message: 'Validation failed.',
            issues: error.issues,
        });
        return;
    }
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        sendFailure(response, 404, {
            success: false,
            message: 'The requested record could not be found.',
        });
        return;
    }
    const detail = error instanceof Error ? error.message : 'Unknown error.';
    const stack = error instanceof Error ? error.stack : undefined;
    const errorLogEntry = JSON.stringify({
        timestamp: new Date().toISOString(),
        method: request.method,
        path: request.originalUrl,
        detail,
        stack,
    });
    console.error(error);
    writeErrorLog(errorLogEntry);
    sendFailure(response, 500, {
        success: false,
        message: 'Internal server error.',
        ...(config.nodeEnv === 'production' ? {} : { detail }),
    });
}
