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
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.PORT ?? 4000),
    clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
    jwtSecret: getRequiredEnv('JWT_SECRET'),
    admin: process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD
        ? {
            email: process.env.ADMIN_EMAIL.toLowerCase(),
            password: process.env.ADMIN_PASSWORD,
        }
        : null,
};
