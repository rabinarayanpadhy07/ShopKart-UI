import { useEffect, useState } from 'react';
import { getCategories } from '@/api/products';
import { buildCategoryList, CATEGORIES } from '@/lib/categories';

/** Category navigation list sourced from the backend (cached 5 min in apiCache). */
export function useCategories() {
  const [categories, setCategories] = useState(CATEGORIES);

  useEffect(() => {
    let active = true;
    getCategories()
      .then((rows) => {
        if (active) setCategories(buildCategoryList(rows));
      })
      .catch(() => {
        // Keep the static fallback list; navigation still works by name.
      });
    return () => {
      active = false;
    };
  }, []);

  return categories;
}
