import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler, sendSuccess } from '../lib/http.js';
import { prisma } from '../lib/prisma.js';
const router = Router();
const newsletterSchema = z.object({
    email: z.string().trim().email(),
});
router.post('/', asyncHandler(async (request, response) => {
    const payload = newsletterSchema.parse(request.body);
    const subscriber = await prisma.newsletterSubscriber.upsert({
        where: {
            email: payload.email.toLowerCase(),
        },
        update: {},
        create: {
            email: payload.email.toLowerCase(),
        },
    });
    sendSuccess(response, {
        email: subscriber.email,
    }, 201);
}));
export default router;
