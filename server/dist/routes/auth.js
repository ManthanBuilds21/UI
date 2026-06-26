import bcrypt from 'bcrypt';
import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { asyncHandler, ApiError } from '../lib/http.js';
import { authenticate } from '../middleware/auth.js';
import { signAuthToken, toClientRole } from '../lib/auth.js';
const router = Router();
const signupSchema = z.object({
    name: z.string().trim().min(2),
    email: z.string().trim().email(),
    password: z.string().min(8),
    role: z.enum(['user', 'admin']),
});
const loginSchema = z.object({
    email: z.string().trim().email(),
    password: z.string().min(8),
    role: z.enum(['user', 'admin']),
});
function serializeUser(user) {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: toClientRole(user.role),
    };
}
router.post('/signup', asyncHandler(async (request, response) => {
    const payload = signupSchema.parse(request.body);
    const existingUser = await prisma.user.findUnique({
        where: {
            email: payload.email.toLowerCase(),
        },
    });
    if (existingUser) {
        throw new ApiError(409, 'An account with that email already exists.');
    }
    const user = await prisma.user.create({
        data: {
            name: payload.name,
            email: payload.email.toLowerCase(),
            passwordHash: await bcrypt.hash(payload.password, 12),
            role: payload.role === 'admin' ? 'ADMIN' : 'USER',
        },
    });
    response.status(201).json({
        token: signAuthToken(user),
        user: serializeUser(user),
    });
}));
router.post('/login', asyncHandler(async (request, response) => {
    const payload = loginSchema.parse(request.body);
    const user = await prisma.user.findUnique({
        where: {
            email: payload.email.toLowerCase(),
        },
    });
    if (!user) {
        throw new ApiError(401, 'Invalid email or password.');
    }
    const passwordMatches = await bcrypt.compare(payload.password, user.passwordHash);
    if (!passwordMatches) {
        throw new ApiError(401, 'Invalid email or password.');
    }
    if (toClientRole(user.role) !== payload.role) {
        throw new ApiError(403, 'That account does not match the selected role.');
    }
    response.json({
        token: signAuthToken(user),
        user: serializeUser(user),
    });
}));
router.get('/me', authenticate, asyncHandler(async (request, response) => {
    const user = await prisma.user.findUnique({
        where: {
            id: request.auth?.userId,
        },
    });
    if (!user) {
        throw new ApiError(401, 'Authentication required.');
    }
    response.json({
        user: serializeUser(user),
    });
}));
// In-memory store for password reset tokens: email.toLowerCase() -> { token, expiresAt }
const resetTokens = new Map();
const forgotPasswordSchema = z.object({
    email: z.string().trim().email(),
});
const resetPasswordSchema = z.object({
    email: z.string().trim().email(),
    token: z.string().trim(),
    password: z.string().min(8),
});
router.post('/forgot-password', asyncHandler(async (request, response) => {
    const { email } = forgotPasswordSchema.parse(request.body);
    const normalizedEmail = email.toLowerCase();
    const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
    });
    if (user) {
        // Generate a 6-digit verification code
        const token = Math.floor(100000 + Math.random() * 900000).toString();
        resetTokens.set(normalizedEmail, {
            token,
            expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes
        });
        // Simulate sending email by logging to the backend console
        console.log('\n==================================================');
        console.log(`[PASSWORD RESET] Token for ${email}: ${token}`);
        console.log('==================================================\n');
    }
    response.json({
        success: true,
        message: 'If that email exists in our system, we have sent a reset code.',
    });
}));
router.post('/reset-password', asyncHandler(async (request, response) => {
    const { email, token, password } = resetPasswordSchema.parse(request.body);
    const normalizedEmail = email.toLowerCase();
    const stored = resetTokens.get(normalizedEmail);
    if (!stored || stored.token !== token || Date.now() > stored.expiresAt) {
        throw new ApiError(400, 'Invalid or expired reset token.');
    }
    const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
    });
    if (!user) {
        throw new ApiError(404, 'User not found.');
    }
    // Update password
    await prisma.user.update({
        where: { id: user.id },
        data: {
            passwordHash: await bcrypt.hash(password, 12),
        },
    });
    // Clean up token
    resetTokens.delete(normalizedEmail);
    response.json({
        success: true,
        message: 'Password has been reset successfully.',
    });
}));
export default router;
