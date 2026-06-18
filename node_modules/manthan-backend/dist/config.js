import dotenv from 'dotenv';
dotenv.config();
function getRequiredEnv(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}
export const config = {
    appVersion: process.env.APP_VERSION ?? '1.0.0',
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.PORT ?? 4000),
    clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
    corsOrigins: (process.env.CORS_ORIGINS ?? process.env.CLIENT_ORIGIN ?? 'http://localhost:5173')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
    authRateLimitWindowMs: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS ?? 15 * 60 * 1000),
    authRateLimitMaxRequests: Number(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS ?? 10),
    jwtSecret: getRequiredEnv('JWT_SECRET'),
    admin: process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD
        ? {
            email: process.env.ADMIN_EMAIL.toLowerCase(),
            password: process.env.ADMIN_PASSWORD,
        }
        : null,
};
