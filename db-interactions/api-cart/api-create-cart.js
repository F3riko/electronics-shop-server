const connection = require("../db-init");

async function createCartForUser(email) {
  return new Promise((resolve, reject) => {
    const createCartQuery = `
      INSERT INTO carts (user_id, cart_expiration_date)
      SELECT u.id, DATE_ADD(NOW(), INTERVAL 7 DAY)
      FROM users u
      WHERE u.email = ?;
    `;

    connection.query(createCartQuery, [email], (error, results) => {
      if (error) {
        reject(error); 
      } else {
        if (results.affectedRows === 1) {
          console.log(results.insertId);
          resolve(results.insertId); 
        } else {
          reject(new Error("Cart insertion failed")); 
        }
      }
    });
  });
}

module.exports = createCartForUser;
