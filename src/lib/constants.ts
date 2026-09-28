export const PRODUCT_CATEGORIES = [
  "Stitched",
  "Unstitched",
  "Pakistani Suit",
  "Printed",
  "Embroidery",
  "Patchwork",
  "Daily Wear",
  "Party Wear",
  "Casual Wear",
  "Western Wear",
  "Night Wear",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];
