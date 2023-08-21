const connection = require("../db-init");

function addUser(email, password, recaptchaResponse, callback) {
  // Wait for captchaToken validation: connect to google server and verify token validity
  // Wait for email validations:
  // 1. Email is already registered
  // 2. Email format is invalid
  // Wait for password validation: length, letters, digits, etc.
}

module.exports = addUser;
