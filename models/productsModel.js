const connection = require("../config/database");
const getAllChildrenCategories = require("../utils/categoryHierarchy");
const util = require("util");
const query = util.promisify(connection.query).bind(connection);
const NodeCache = require("node-cache");
const cache = new NodeCache();

const getCategoriesQuery = "SELECT * FROM categories";
const getMinMaxPricesByCategoryQueryQuery =
  "SELECT * FROM items WHERE id IN (?)";
const getProductReviewsQuery = `
  SELECT *
  FROM reviews
  WHERE item_id = ? AND verified = 1;
  `;
const getAllowedSpecsParamsQuery = "SELECT title FROM properties;";

(async () => {
  try {
    let allowedSpecsParams = await query(getAllowedSpecsParamsQuery);
    allowedSpecsParams = allowedSpecsParams.map((param) => param.title);
    const categories = await query(getCategoriesQuery);
    cache.set("categories", categories, 3600);
    cache.set("allowedParams", allowedSpecsParams, 9000);
  } catch (error) {
    console.error(error.message);
  }
})();

const getProductData = async (id) => {
  try {
    const selectProductQuery = "SELECT * FROM items WHERE id = ?";
    selectProductPropertiesQuery = `SELECT items_properties.property_value, properties.title
    FROM items_properties
    JOIN properties ON items_properties.property_id = properties.id
    WHERE items_properties.item_id = ?;
    `;

    const results = await query(selectProductQuery, id);
    const resultsProperties = await query(selectProductPropertiesQuery, id);
    const objectData = { ...results[0], properties: resultsProperties };
    if (results.length > 0) {
      return objectData;
    } else {
      throw new Error("No resulst were retrieved");
    }
  } catch (error) {
    throw error;
  }
};

const getImgByProductId = async (id) => {
  try {
    const results = await query("SELECT img FROM items WHERE id = ?", id);

    if (results.length > 0) {
      return results[0];
    } else {
      throw new Error("No resulst were retrieved");
    }
  } catch (error) {
    throw error;
  }
};

const getCategoriesList = async () => {
  try {
    const categories = cache.get("categories");
    if (categories) {
      return categories;
    } else {
      const results = await query(getCategoriesQuery);
      cache.set("categories", results, 3600);
      return results;
    }
  } catch (error) {
    throw error;
  }
};

const getChildrenCategoriesArray = async (parentId) => {
  const categories = await getCategoriesList();
  const result = getAllChildrenCategories(categories, parentId);
  return result.map((category) => category.id);
};

const getMinMaxPricesByCategory = async (categoryId) => {
  try {
    let queryText =
      "SELECT MIN(price) AS minPrice, MAX(price) AS maxPrice FROM items";
    if (categoryId > 0) {
      const categories = await getChildrenCategoriesArray(categoryId);
      categories.push(categoryId);
      queryText += ` WHERE category_id IN (${categories.join(", ")})`;
    }
    const result = await query(queryText);

    return result[0];
  } catch (error) {
    throw error;
  }
};

const getSelectedProductsByIdSQL = async (productIds) => {
  try {
    const result = await query(getMinMaxPricesByCategoryQueryQuery, [
      JSON.parse(productIds),
    ]);
    return result;
  } catch (error) {
    throw error;
  }
};

const getProductsSQL = async (params) => {
  try {
    let allowedSpecsParams = cache.get("allowedParams");
    if (!allowedSpecsParams) {
      allowedSpecsParams = await query(getAllowedSpecsParamsQuery);
      allowedSpecsParams = allowedSpecsParams.map((param) => param.title);
      cache.set("allowedParams", allowedSpecsParams, 9000);
    }
    let queryStr = `
    SELECT DISTINCT items.*
    FROM items
    LEFT JOIN items_properties ON items.id = items_properties.item_id
    LEFT JOIN properties ON items_properties.property_id = properties.id
    WHERE 1=1
  `;
    const { maxPrice, minPrice, sortBy, category, searchQuery } = params;

    for (const paramName in params) {
      if (allowedSpecsParams.includes(paramName)) {
        const paramValues = Array.isArray(params[paramName])
          ? params[paramName]
          : [params[paramName]];
        const propertyIdQuery = `SELECT id FROM properties WHERE title = ${connection.escape(
          paramName
        )}`;
        const propertyIdResult = await query(propertyIdQuery);
        if (propertyIdResult.length > 0) {
          const propertyId = propertyIdResult[0].id;
          queryStr += `
            AND items.id IN (
              SELECT item_id
              FROM items_properties
              WHERE property_id = ${propertyId} 
                AND property_value IN (${paramValues
                  .map((value) => connection.escape(value))
                  .join(", ")})
            )
          `;
        }
      }
    }

    if (maxPrice) {
      queryStr += ` AND price <= ${parseFloat(maxPrice)}`;
    }
    if (minPrice) {
      queryStr += ` AND price >= ${parseFloat(minPrice)}`;
    }
    if (category) {
      const categories = await getChildrenCategoriesArray(category);
      categories.push(parseInt(category));
      queryStr += ` AND items.category_id IN (${categories.join(", ")})`;
    }
    if (searchQuery) {
      const sanitizedSearchQuery = connection.escape(`%${searchQuery}%`);
      queryStr += ` AND items.title LIKE ${sanitizedSearchQuery}`;
    }
    if (sortBy === "rating") {
      queryStr += " ORDER BY item_rating DESC";
    } else if (sortBy === "reviews") {
      queryStr += " ORDER BY reviews_quantity DESC";
    } else if (sortBy === "priceDsc") {
      queryStr += " ORDER BY price DESC";
    } else if (sortBy === "priceAsc") {
      queryStr += " ORDER BY price ASC";
    }

    const result = await query(queryStr);

    return result;
  } catch (error) {
    throw error;
  }
};

const getProductReviewsSQL = async (productId) => {
  try {
    const result = await query(getProductReviewsQuery, [productId]);
    return result;
  } catch (error) {
    throw error;
  }
};

const getSpecsObjSQL = async (categoryId) => {
  try {
    const getSpecsQuery = `
      SELECT
          p.title AS property_name,
          GROUP_CONCAT(DISTINCT ip.property_value ORDER BY ip.property_value) AS unique_values
      FROM properties p
      INNER JOIN items_properties ip ON p.id = ip.property_id
      WHERE p.category_id = ?
      GROUP BY p.title;
    `;
    const result = await query(getSpecsQuery, [categoryId]);
    const formattedResult = {};
    result.forEach((row) => {
      formattedResult[row.property_name] = row.unique_values
        .split(",")
        .map((value, index) => {
          return {
            id: index,
            title: value,
          };
        });
    });
    return formattedResult;
  } catch (error) {
    throw error;
  }
};

getSpecsObjSQL(1);

module.exports = {
  getSpecsObjSQL,
  getSelectedProductsByIdSQL,
  getMinMaxPricesByCategory,
  getProductData,
  getImgByProductId,
  getCategoriesList,
  getProductsSQL,
  getProductReviewsSQL,
};
