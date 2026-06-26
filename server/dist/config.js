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
    port: Number(process.env.PORT ?? 4000),
    clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
    jwtSecret: getRequiredEnv('JWT_SECRET'),
    razorpayKeyId: process.env.RAZORPAY_KEY_ID ?? 'rzp_test_mock',
    razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET ?? 'mock_secret',
    razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET ?? 'mock_webhook_secret',
};
