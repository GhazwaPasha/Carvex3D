import type { Product } from '../types/product'

export const categories = [
  'Fixtures & Jigs',
  'Brackets & Mounts',
  'Enclosures',
  'Gears & Drives',
  'Tooling & Cutters',
  'Automotive Parts',
  'Robotics',
  'Custom Fixtures',
]

export const fileFormats = ['STEP', 'DXF', 'IGES', 'STL'] as const

export const materials = ['Aluminum', 'Steel', 'Delrin / Acetal', 'Plywood']

export const products: Product[] = [
  {
    id: 'modular-vise-jaw-set',
    name: 'Modular Vise Jaw Set',
    creator: 'Blackridge Machine Co.',
    material: '6061 Aluminum',
    price: '$28',
    rating: '4.9',
    format: 'STEP',
    category: 'Fixtures & Jigs',
    description:
      'Precision-machined vise jaw set for 4th-axis rotary fixtures. Designed for repeat setups on aluminum and mild steel stock, with integrated dowel pins for zero-point alignment. Verified on a Haas VF-2 with a 5,000 RPM spindle; deburr edges before first use.',
    specs: [
      { label: 'File formats', value: 'STEP, DXF' },
      { label: 'Material tested', value: '6061 Aluminum' },
      { label: 'Tolerance', value: '±0.05mm' },
      { label: 'Bounding box', value: '120 × 80 × 45 mm' },
      { label: 'Recommended tools', value: '3-flute end mill, 6mm' },
      { label: 'License', value: 'Commercial use included' },
    ],
    files: [
      { name: 'vise_jaw_set.step', size: '1.2 MB' },
      { name: 'vise_jaw_set.dxf', size: '340 KB' },
      { name: 'setup_sheet.pdf', size: '180 KB' },
    ],
  },
  {
    id: 'servo-mount-bracket',
    name: 'Servo Mount Bracket',
    creator: 'Vantage Tooling',
    material: 'Steel, 3mm',
    price: '$16',
    rating: '4.8',
    format: 'DXF',
    category: 'Brackets & Mounts',
  },
  {
    id: 'cable-chain-enclosure',
    name: 'Cable Chain Enclosure',
    creator: 'Ironclad Works',
    material: 'ABS / Delrin',
    price: '$22',
    rating: '4.7',
    format: 'STEP',
    category: 'Enclosures',
  },
  {
    id: 'planetary-gear-set-3-1',
    name: 'Planetary Gear Set 3:1',
    creator: 'Fenwick Precision',
    material: 'Hardened Steel',
    price: '$34',
    rating: '4.9',
    format: 'STEP',
    category: 'Gears & Drives',
  },
  {
    id: 't-slot-fixture-plate',
    name: 'T-Slot Fixture Plate',
    creator: 'Blackridge Machine Co.',
    material: '6061 Aluminum',
    price: '$19',
    rating: '5.0',
    format: 'DXF',
    category: 'Fixtures & Jigs',
  },
  {
    id: 'router-sled-jig',
    name: 'Router Sled Jig',
    creator: 'Ironclad Works',
    material: 'Plywood / Al rail',
    price: '$12',
    rating: '4.6',
    format: 'DXF',
    category: 'Fixtures & Jigs',
  },
  {
    id: 'spindle-housing',
    name: 'Spindle Housing',
    creator: 'Vantage Tooling',
    material: '6061 Aluminum',
    price: '$41',
    rating: '4.8',
    format: 'IGES',
    category: 'Tooling & Cutters',
  },
  {
    id: 'linear-rail-bracket-pair',
    name: 'Linear Rail Bracket Pair',
    creator: 'Fenwick Precision',
    material: 'Steel, 5mm',
    price: '$14',
    rating: '4.9',
    format: 'STEP',
    category: 'Brackets & Mounts',
  },
  {
    id: 'quick-change-tool-holder',
    name: 'Quick-Change Tool Holder',
    creator: 'Blackridge Machine Co.',
    material: 'Tool Steel',
    price: '$25',
    rating: '4.9',
    format: 'STEP',
    category: 'Tooling & Cutters',
  },
  {
    id: 'enclosure-panel-vented',
    name: 'Enclosure Panel, Vented',
    creator: 'Ironclad Works',
    material: '6061 Aluminum',
    price: '$18',
    rating: '4.7',
    format: 'DXF',
    category: 'Enclosures',
  },
  {
    id: 'timing-belt-pulley-20t',
    name: 'Timing Belt Pulley 20T',
    creator: 'Fenwick Precision',
    material: 'Delrin',
    price: '$9',
    rating: '4.8',
    format: 'STEP',
    category: 'Gears & Drives',
  },
  {
    id: 'dovetail-clamp-set',
    name: 'Dovetail Clamp Set',
    creator: 'Vantage Tooling',
    material: '6061 Aluminum',
    price: '$21',
    rating: '4.9',
    format: 'IGES',
    category: 'Fixtures & Jigs',
  },
]

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id)
}

/** Every product has a detail page; only the demo product above ships with
 *  hand-written specs/files/description. This fills in plausible generic
 *  content for the rest so no catalog entry opens to a half-empty page. */
export function getProductDetails(product: Product): {
  description: string
  specs: Product['specs']
  files: Product['files']
} {
  if (product.description && product.specs && product.files) {
    return { description: product.description, specs: product.specs, files: product.files }
  }
  const slug = product.id.replace(/-/g, '_')
  return {
    description: `${product.name} from ${product.creator}, machined and verified in ${product.material}. Shop-tested and toleranced for repeat production runs — check the included setup sheet before first use.`,
    specs: [
      { label: 'File formats', value: product.format },
      { label: 'Material tested', value: product.material },
      { label: 'Tolerance', value: '±0.1mm' },
      { label: 'License', value: 'Commercial use included' },
    ],
    files: [
      { name: `${slug}.${product.format.toLowerCase()}`, size: '1.1 MB' },
      { name: 'setup_sheet.pdf', size: '180 KB' },
    ],
  }
}
