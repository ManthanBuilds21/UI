# Database Schema

## Tables

### `users`
- `id` PK
- `name`
- `email` unique
- `password_hash`
- `role` enum: `USER | ADMIN`
- `created_at`
- `updated_at`

### `collections`
- `id` PK
- `slug` unique
- `name` unique
- `ghost_text`
- `tagline`
- `description`
- `category`
- `background`
- `accent`
- `hero_image`
- `product_slugs` string array
- `sort_order`
- `created_at`
- `updated_at`

### `products`
- `id` PK
- `slug` unique
- `name`
- `category`
- `collection_id` FK -> `collections.id`
- `price`
- `accent`
- `background`
- `ghost_text`
- `badge`
- `short_description`
- `description`
- `story`
- `fit`
- `material`
- `colors` string array
- `sizes` string array
- `features` string array
- `images` string array
- `sort_order`
- `created_at`
- `updated_at`

### `cart_items`
- `id` PK
- `user_id` FK -> `users.id`
- `product_id` FK -> `products.id`
- `size`
- `quantity`
- `created_at`
- `updated_at`

Unique key:
- `(user_id, product_id, size)`

### `wishlist_items`
- `id` PK
- `user_id` FK -> `users.id`
- `product_id` FK -> `products.id`
- `created_at`

Unique key:
- `(user_id, product_id)`

### `orders`
- `id` PK
- `user_id` FK -> `users.id`
- `status` enum: `PENDING | CONFIRMED | FULFILLED | CANCELLED`
- `payment_status` enum: `UNPAID | PAID | FAILED`
- `payment_provider`
- `subtotal`
- `shipping`
- `total`
- `created_at`
- `updated_at`

### `order_items`
- `id` PK
- `order_id` FK -> `orders.id`
- `product_id` FK -> `products.id`
- `product_name`
- `product_slug`
- `product_image`
- `size`
- `quantity`
- `unit_price`
- `created_at`

### `newsletter_subscribers`
- `id` PK
- `email` unique
- `created_at`

## Relationships

- One `collection` has many `products`.
- One `user` has many `cart_items`.
- One `user` has many `wishlist_items`.
- One `user` has many `orders`.
- One `order` has many `order_items`.
- One `product` can appear in many cart, wishlist, and order records.
