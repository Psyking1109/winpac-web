"use strict";
// Make a safe copy of the database into data/backups:  npm run backup
// Also copy the data/uploads folder (your photos) when you back up.
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const DB = require("./db");
const dir = path.join(DB.DATA_DIR, "backups");
fs.mkdirSync(dir, { recursive: true });
const file = path.join(dir, `winpac-${new Date().toISOString().replace(/[:.]/g, "-")}.db`);
DB.backup(file);
console.log("Backup saved: " + file);
