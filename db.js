/** Database setup for BizTime. */

const { Client } = require("pg");
require("dotenv").config(); // Load environment variables from .env

// Determine the database URI based on the environment
let DB_URI =
  process.env.NODE_ENV === "test"
    ? process.env.DB_URI_TEST
    : process.env.DB_URI;

// Set up the database client
let db = new Client({
  connectionString: DB_URI,
});

db.connect();

module.exports = db;

