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
} from 'lucide-react';

export const CATEGORIES = [
  { name: 'All', searchName: '', Icon: LayoutGrid },
  { name: 'Shirts', searchName: 'Shirts', Icon: Shirt },
  { name: 'Pants', searchName: 'Pants', Icon: Layers },
  { name: 'Accessories', searchName: 'Accessories', Icon: Watch },
  { name: 'Mobiles', searchName: 'Mobiles', Icon: Smartphone },
  { name: 'Mobile Accessories', searchName: 'Mobile Accessories', Icon: Headphones },
  { name: 'Beauty', searchName: 'Beauty', Icon: Sparkles },
  { name: 'Appliances', searchName: 'Appliances', Icon: Tv },
  { name: 'Books', searchName: 'Books', Icon: BookOpen },
  { name: 'Food', searchName: 'Food', Icon: Utensils },
];
