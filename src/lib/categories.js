import {
  LayoutGrid,
  Shirt,
  Layers,
  Watch,
  Smartphone,
  Headphones,
  Sparkles,
  Tv,
  BookOpen,
  Utensils,
  Laptop,
  Footprints,
  SprayCan,
  ShoppingBag,
  Tag,
} from 'lucide-react';

const ICONS = {
  Shirts: Shirt,
  Pants: Layers,
  Accessories: ShoppingBag,
  Mobiles: Smartphone,
  'Mobile Accessories': Headphones,
  Laptops: Laptop,
  Watches: Watch,
  Footwear: Footprints,
  Fragrances: SprayCan,
  Beauty: Sparkles,
  Appliances: Tv,
  Books: BookOpen,
  Food: Utensils,
};

export function categoryIcon(name) {
  return ICONS[name] || Tag;
}

// Display order for known categories; anything new from the backend is appended.
const ORDER = Object.keys(ICONS);

/** Static fallback used before /api/products/categories responds (or if it fails). */
export const CATEGORIES = [
  { name: 'All', searchName: '', Icon: LayoutGrid },
  ...ORDER.map((name) => ({ name, searchName: name, Icon: ICONS[name] })),
];

/** Builds the navigation list from the backend category rows, keeping a stable order. */
export function buildCategoryList(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return CATEGORIES;
  const names = rows.map((r) => r.categoryName).filter(Boolean);
  names.sort((a, b) => {
    const ia = ORDER.indexOf(a);
    const ib = ORDER.indexOf(b);
    return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib) || a.localeCompare(b);
  });
  return [
    { name: 'All', searchName: '', Icon: LayoutGrid },
    ...names.map((name) => ({ name, searchName: name, Icon: categoryIcon(name) })),
  ];
}
