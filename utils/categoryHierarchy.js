const {
  getCategoriesList,
} = require("../db-interactions/api-products/api-products-interactions");

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

const getChildrenCategoriesArray = async (parentId) => {
  const categories = await getCategoriesList();
  const result = getAllChildrenCategories(categories, parentId);
  return result.map((category) => category.id);
};

module.exports = getChildrenCategoriesArray;
