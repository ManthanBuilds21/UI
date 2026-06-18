# API Reference

## Authentication

### `POST /api/auth/signup`
Creates a user or admin account.

Request body:

```json
{
  "name": "Manthan User",
  "email": "user@example.com",
  "password": "strong-password",
  "role": "user"
}
```

Response:

```json
{
  "token": "jwt-token",
  "user": {
    "id": "cuid",
    "name": "Manthan User",
    "email": "user@example.com",
    "role": "user"
  }
}
```

### `POST /api/auth/login`
Authenticates an existing account and returns a JWT.

### `GET /api/auth/me`
Returns the current authenticated user.

Headers:

```txt
Authorization: Bearer <token>
```

## Catalog

### `GET /api/catalog`
Returns the full product catalog payload used by the storefront:

- `categories`
- `collections`
- `products`

### `GET /api/catalog/products/:slug`
Returns a single product by slug.

## Store

All store endpoints require:

```txt
Authorization: Bearer <token>
```

### `GET /api/store`
Returns the persistent cart/wishlist snapshot:

- `cart`
- `wishlist`
- `cartCount`
- `subtotal`

### `POST /api/store/cart/items`
Adds a cart item.

### `PATCH /api/store/cart/items`
Updates a cart line quantity.

### `DELETE /api/store/cart/items`
Removes a cart line.

### `POST /api/store/wishlist/toggle`
Adds or removes a wishlist item.

### `POST /api/store/checkout`
Creates an order from the current cart and clears the cart.

## Admin

### `GET /api/admin/dashboard`
Admin-only endpoint returning:

- `orderCount`
- `userCount`
- `collectionCount`
- `orders`

## Newsletter

### `POST /api/newsletter`
Stores a newsletter email subscription.

Request body:

```json
{
  "email": "subscriber@example.com"
}
```
