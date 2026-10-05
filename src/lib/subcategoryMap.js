import { SUBCATEGORY_GRIDS } from "./subcategoryGrids";

// Build a map of category name → unique subcategory names, derived from the
// subcategory grid configs (the authoritative source for subcategory labels).
// This ensures ScanHub, CategoryDetail, and the grid pages all reference the
// same subcategory names so scanned products land in the correct sections.
export const CATEGORY_SUBCATEGORIES = (() => {
  const map = {};
  Object.values(SUBCATEGORY_GRIDS).forEach((grid) => {
    grid.cells.forEach((cell) => {
      if (!cell.category || !cell.subcategory) return;
      if (!map[cell.category]) map[cell.category] = [];
      if (!map[cell.category].includes(cell.subcategory)) {
        map[cell.category].push(cell.subcategory);
      }
    });
  });
  return map;
})();

export function getSubcategories(category) {
  return CATEGORY_SUBCATEGORIES[category] || [];
}
