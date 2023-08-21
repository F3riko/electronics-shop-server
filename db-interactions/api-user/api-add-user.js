const connection = require("../db-init");

class InvalidEmailError extends Error {
  constructor(message) {
    super(message);
    this.name = "InvalidEmailError";
  }
}

function addUser(email, password, recaptchaResponse, callback) {
  try {
    // Wait for captchaToken validation: connect to google server and verify token validity
    // Wait for email validations:
    // 1. Email is already registered
    // 2. Email format is invalid
    // Wait for password validation: length, letters, digits, etc.
    const queryText = "INSERT INTO users (email, password) VALUES (?, ?)";
    connection.query(queryText, [email, password], (error, results, fields) => {
      if (error) {
        console.log(error);
        return callback(error, null);
      }
      callback(null, results);
    });
  } catch (error) {
    callback(error, null);
  }
}

module.exports = addUser;
