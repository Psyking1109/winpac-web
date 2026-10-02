"use strict";
// Create an admin, or change an existing admin's password:
//   npm run create-admin -- <username> <password>
require("dotenv").config();
const bcrypt = require("bcryptjs");
const DB = require("./db");
const [username, password] = process.argv.slice(2);
if (!username || !password) { console.log("Usage: npm run create-admin -- <username> <password>"); process.exit(1); }
if (password.length < 10) { console.log("Use a password of at least 10 characters."); process.exit(1); }
bcrypt.hash(password, 12).then(hash => {
  const existed = DB.admins.upsert(username, hash);
  console.log(existed ? `Password changed for '${username}'.` : `Admin '${username}' created.`);
});
