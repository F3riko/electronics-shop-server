const getCategoriesByParent = (categories, parentId) => {
  const parentIdNum = Number(parentId);
  return categories.filter(
    (category) => category.parent_category_id === parentIdNum
  );
};

const getAllChildrenCategories = (categoriesArray, parentId) => {
  const children = getCategoriesByParent(categoriesArray, parentId);
  const result = [];
  for (const category of children) {
    const descendants = getAllChildrenCategories(categoriesArray, category.id);
    result.push(category, ...descendants);
  }
  return result;
};


module.exports = getAllChildrenCategories;
