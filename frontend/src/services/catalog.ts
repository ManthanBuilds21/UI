import type { CatalogResponse } from '../types/api'
import type { Product } from '../types/catalog'
import { request } from './api'

export async function getCatalog() {
  return request<CatalogResponse>('/catalog')
}

export async function getProductBySlug(slug: string) {
  const response = await request<{ product: Product }>(
    `/catalog/products/${encodeURIComponent(slug)}`,
  )

  return response.product
}
