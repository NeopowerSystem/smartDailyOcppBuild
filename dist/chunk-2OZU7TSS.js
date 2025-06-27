import {
  getCurrentTimestamp
} from "./chunk-7LYFSOHO.js";

// controller/maxPower.js
import Database from "better-sqlite3";
var db = new Database(new URL("../sqlite/app.db", import.meta.url).pathname);
async function getMaxPower() {
  const stmt = db.prepare(`SELECT * FROM maxPower`);
  return stmt.all();
}
async function insertMaxPower(vendorId, unit, kw_limit) {
  const stmt = db.prepare(`INSERT INTO maxPower(vendorId, unit, kw_limit,last_update)
          VALUES (?, ?, ?,?)`);
  stmt.run(vendorId, unit, kw_limit, getCurrentTimestamp());
}
async function updateMaxPower(vendorId, body) {
  const validFields = ["unit", "kw_limit"];
  const fieldsToUpdate = [];
  const values = [];
  for (const key of validFields) {
    if (body.hasOwnProperty(key)) {
      fieldsToUpdate.push(`${key} = ?`);
      values.push(body[key]);
    }
  }
  fieldsToUpdate.push("last_update = ?");
  values.push(getCurrentTimestamp());
  const setClause = fieldsToUpdate.join(", ");
  const stmt = db.prepare(`UPDATE maxPower SET ${setClause} WHERE vendorId = ?`);
  stmt.run(...values, vendorId);
}
async function deleteMaxPower(vendorId) {
  const stmt = db.prepare(`DELETE FROM maxPower WHERE vendorId = ?`);
  stmt.run(vendorId);
}
async function getMaxPowerByVendorId(vendorId) {
  const stmt = db.prepare(`SELECT * FROM maxPower WHERE vendorId = ?`);
  return stmt.get(vendorId);
}

export {
  getMaxPower,
  insertMaxPower,
  updateMaxPower,
  deleteMaxPower,
  getMaxPowerByVendorId
};
