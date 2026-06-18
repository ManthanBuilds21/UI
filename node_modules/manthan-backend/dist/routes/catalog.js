import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { asyncHandler, ApiError, sendSuccess } from '../lib/http.js';
import { categories, serializeCollection, serializeProduct } from '../lib/catalog.js';
import { z } from 'zod';
const router = Router();
const productSlugParamsSchema = z.object({
    slug: z.string().trim().min(1),
});
router.get('/', asyncHandler(async (_request, response) => {
    const [collections, products] = await Promise.all([
        prisma.collection.findMany({
            orderBy: [{ sortOrder: 'asc' }],
        }),
        prisma.product.findMany({
            orderBy: [{ sortOrder: 'asc' }],
            include: {
                collection: true,
            },
        }),
    ]);
    sendSuccess(response, {
        categories,
        collections: collections.map(serializeCollection),
        products: products.map(serializeProduct),
    });
}));
router.get('/products/:slug', asyncHandler(async (request, response) => {
    const { slug } = productSlugParamsSchema.parse(request.params);
    const product = await prisma.product.findUnique({
        where: {
            slug,
        },
        include: {
            collection: true,
        },
    });
    if (!product) {
        throw new ApiError(404, 'Product not found.');
    }
    sendSuccess(response, {
        product: serializeProduct(product),
    });
}));
export default router;
