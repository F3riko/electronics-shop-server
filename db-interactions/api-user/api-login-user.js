const crypto = require("crypto");
const connection = require("../db-init");

class UserNotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = "UserNotFoundError";
  }
}

async function getUser(email, password, res) {
  try {
    const results = await new Promise((resolve, reject) => {
      const queryText = `SELECT * FROM users WHERE email = ? AND password = ?`;
      connection.query(
        queryText,
        [email, password],
        function (err, results, fields) {
          if (err) {
            console.error("Error fetching user:", err);
            reject(err);
            return;
          }
          if (results.length == 0) {
            reject(new UserNotFoundError("No user found"));
            return;
          } else {
            resolve(results);
          }
        }
      );
    });

    // User's data here and object from it
    const userData = results[0];
    const userObject = {
      id: userData.id,
      email: userData.email,
    };
    const jsonData = JSON.stringify(userObject);

    // Choose a secret key and IV for encryption
    const secretKey = crypto.randomBytes(32); // 256 bits
    const iv = crypto.randomBytes(16); // 128 bits

    // Create a cipher object using the secret key and IV, temp userData file for exercise purposes
    const cipher = crypto.createCipheriv("aes-256-cbc", secretKey, iv);
    let encryptedData = cipher.update(jsonData, "utf8", "hex");
    encryptedData += cipher.final("hex");
    res.cookie("userData", encryptedData, { maxAge: 3600000 });
    res.cookie("iv", iv.toString("hex"), { maxAge: 3600000 });
    res.cookie("openData", JSON.stringify(userData.email));
    res.sendStatus(200);
  } catch (error) {
    throw error;
  }
}

module.exports = getUser;
