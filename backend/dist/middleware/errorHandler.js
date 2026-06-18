import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ZodError } from 'zod';
import { config } from '../config.js';
import { ApiError } from '../lib/http.js';
export function notFoundHandler(_request, response) {
    response.status(404).json({
        message: 'Route not found.',
    });
}
export function errorHandler(error, _request, response, _next) {
    if (error instanceof ApiError) {
        response.status(error.statusCode).json({
            message: error.message,
        });
        return;
    }
    if (error instanceof ZodError) {
        response.status(400).json({
            message: 'Validation failed.',
            issues: error.issues,
        });
        return;
    }
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        response.status(404).json({
            message: 'The requested record could not be found.',
        });
        return;
    }
    console.error(error);
    response.status(500).json({
        message: 'Internal server error.',
        ...(config.nodeEnv === 'production' ? {} : { detail: error instanceof Error ? error.message : 'Unknown error.' }),
    });
}
