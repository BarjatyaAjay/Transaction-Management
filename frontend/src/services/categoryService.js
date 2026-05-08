// Mock categories (can be replaced with API call later)
export const CATEGORIES = [
  { id: 1, name: 'Food' },
  { id: 2, name: 'Transport' },
  { id: 3, name: 'Entertainment' },
  { id: 4, name: 'Shopping' },
  { id: 5, name: 'Utilities' },
  { id: 6, name: 'Other' },
  { id: 7, name: 'Salary' },
  { id: 8, name: 'Freelance' },
  { id: 9, name: 'Investments' },
  { id: 10, name: 'Gifts' },
];

export const getCategoryName = (categoryId) => {
  const category = CATEGORIES.find((c) => c.id === categoryId);
  return category?.name || 'Unknown';
};

export const getCategoryId = (categoryName) => {
  const category = CATEGORIES.find((c) => c.name === categoryName);
  return category?.id || null;
};
