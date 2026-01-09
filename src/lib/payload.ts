const PAYLOAD_API_URL = process.env.PAYLOAD_API_URL || 'https://payload-saleor-payload.vercel.app/api'
const PAYLOAD_API_KEY = process.env.PAYLOAD_API_KEY || ''

export interface BrandPageBlock {
  blockType: 'brand-hero' | 'brand-about'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

export interface BrandPageData {
  vendorId: string
  saleorPageSlug: string
  brandName: string
  layout?: BrandPageBlock[]
}

export interface PayloadBrandPage {
  id: string
  vendorId: string
  saleorPageSlug: string
  brandName: string
  translationHash?: string
  layout?: BrandPageBlock[]
  createdAt: string
  updatedAt: string
}

async function payloadFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${PAYLOAD_API_URL}${endpoint}`
  
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-payload-api-key': PAYLOAD_API_KEY,
      ...options.headers,
    },
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`PayloadCMS error: ${res.status} - ${error}`)
  }

  return res.json()
}

/**
 * Get a vendor's brand page by their vendorId
 */
export async function getVendorBrandPage(vendorId: string): Promise<PayloadBrandPage | null> {
  try {
    const response = await payloadFetch<{ docs: PayloadBrandPage[] }>(
      `/brand-page?where[vendorId][equals]=${vendorId}&limit=1`
    )
    return response.docs[0] || null
  } catch (error) {
    console.error('Failed to fetch brand page:', error)
    return null
  }
}

/**
 * Get a brand page by saleorPageSlug (for storefront rendering)
 */
export async function getBrandPageBySlug(slug: string, locale?: string): Promise<PayloadBrandPage | null> {
  try {
    const localeParam = locale ? `&locale=${locale}` : ''
    const response = await payloadFetch<{ docs: PayloadBrandPage[] }>(
      `/brand-page?where[saleorPageSlug][equals]=${slug}&limit=1${localeParam}`
    )
    return response.docs[0] || null
  } catch (error) {
    console.error('Failed to fetch brand page by slug:', error)
    return null
  }
}

/**
 * Create a new brand page
 */
export async function createBrandPage(data: BrandPageData): Promise<PayloadBrandPage> {
  return payloadFetch<{ doc: PayloadBrandPage }>('/brand-page', {
    method: 'POST',
    body: JSON.stringify(data),
  }).then(res => res.doc)
}

/**
 * Update a vendor's brand page
 */
export async function updateVendorBrandPage(
  vendorId: string,
  data: Partial<BrandPageData>
): Promise<PayloadBrandPage | null> {
  const existing = await getVendorBrandPage(vendorId)
  if (!existing) return null

  return payloadFetch<{ doc: PayloadBrandPage }>(`/brand-page/${existing.id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }).then(res => res.doc)
}

/**
 * Upload media file to PayloadCMS
 */
export async function uploadMedia(
  file: File,
  vendorId: string,
  alt?: string
): Promise<{ id: string; url: string }> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('alt', alt || file.name)

  const res = await fetch(`${PAYLOAD_API_URL}/media`, {
    method: 'POST',
    headers: {
      'x-payload-api-key': PAYLOAD_API_KEY,
      'x-vendor-id': vendorId,
    },
    body: formData,
  })

  if (!res.ok) {
    throw new Error(`Failed to upload media: ${res.status}`)
  }

  const data = await res.json()
  return { id: data.doc.id, url: data.doc.url }
}
