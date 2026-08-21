export type FileFormat = 'STEP' | 'DXF' | 'IGES' | 'STL'

export interface ProductSpec {
  label: string
  value: string
}

export interface ProductFile {
  name: string
  size: string
}

export interface Product {
  /** URL slug, used as the route param on /product/:id */
  id: string
  name: string
  creator: string
  material: string
  price: string
  rating: string
  format: FileFormat
  category: string
  /** Optional richer detail content — only fully populated for the demo
   *  product with a real 3D preview. Product.tsx falls back to generated
   *  generic copy for everything else so every catalog entry still opens
   *  to a complete-looking page. */
  description?: string
  specs?: ProductSpec[]
  files?: ProductFile[]
}
