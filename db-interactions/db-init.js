const passwordDb = require("../pass");
const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: passwordDb,
  database: "electronicsshop",
});

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err.message);
    return;
  }
  console.log("Connected to the database");
});

connection.on("error", (err) => {
  console.error("Database connection error:", err.message);
});

module.exports = connection;
