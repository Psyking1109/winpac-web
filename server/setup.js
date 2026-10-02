"use strict";
// First-time setup for testing: creates .env with a secret key and asks for an admin login.
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const readline = require("readline");
const ENV = path.join(__dirname, "..", ".env");

if (!fs.existsSync(ENV)) {
  fs.writeFileSync(ENV, `JWT_SECRET=${crypto.randomBytes(48).toString("hex")}\nTRUST_PROXY=1\nPORT=8080\n`);
  console.log("Created .env with a new secret key.");
}
require("dotenv").config({ path: ENV });
const bcrypt = require("bcryptjs");
const DB = require("./db");
if (DB.admins.count()) process.exit(0);

const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: process.stdin.isTTY });
const lines = [], waiting = [];
rl.on("line", l => { const w = waiting.shift(); if (w) w(l); else lines.push(l); });
rl.on("close", () => { while (waiting.length) waiting.shift()(""); });
const ask = q => { process.stdout.write(q); return lines.length ? Promise.resolve(lines.shift()) : new Promise(r => waiting.push(r)); };
(async () => {
  console.log("\nCreate the admin login for the website.");
  const user = (await ask("  Username: ")).trim() || "admin";
  let pass = "";
  for (let i = 0; i < 5 && pass.length < 10; i++) { pass = await ask("  Password (10+ characters): "); if (pass.length < 10) console.log("  Too short, try again."); }
  if (pass.length < 10) { console.log("No admin created. Run this again to set one up."); process.exit(1); }
  rl.close();
  DB.admins.upsert(user, await bcrypt.hash(pass, 12));
  console.log(`Admin '${user}' created.\n`);
})();
