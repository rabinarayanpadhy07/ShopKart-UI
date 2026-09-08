// Local, dependency-free fallback image for missing/broken product photos.
// Replaces the old via.placeholder.com hotlink (third-party host slated for
// shutdown, and an avoidable network round-trip on every broken image).
export const IMAGE_FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23F1F5F9'/%3E%3Cpath d='M100 190h100l-25-40-20 25-15-20z' fill='%23CBD5E1'/%3E%3Ccircle cx='115' cy='115' r='15' fill='%23CBD5E1'/%3E%3C/svg%3E";
