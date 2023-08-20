const getAllChildrenCategories = (categoriesArray, parentId) => {
  const children = getCategoriesByParent(categoriesArray, parentId);
  const result = [];
  for (const category of children) {
    const descendants = getAllChildrenCategories(categoriesArray, category.id);
    result.push(category, ...descendants);
  }

  return result.map((category) => category.id);
};

module.exports = getAllChildrenCategories;
