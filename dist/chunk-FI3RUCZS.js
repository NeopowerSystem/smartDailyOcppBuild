import {
  getCurrentTimestamp
} from "./chunk-7LYFSOHO.js";

// controller/smartMeter.js
import Database from "better-sqlite3";
var db = new Database(new URL("../sqlite/app.db", import.meta.url).pathname);
async function getSmartMeters() {
  const stmt = db.prepare(`SELECT * FROM smartMeters`);
  return stmt.all();
}
async function insertSmartMeter(deviceId, host, port, vendorId) {
  const stmt = db.prepare(`
        INSERT INTO smartMeters (deviceId, host, port, vendorId, last_update)
        VALUES (?, ?, ?, ?, ?)
    `);
  stmt.run(deviceId, host, port, vendorId, getCurrentTimestamp());
}
async function updateSmartMeter(id, body) {
  const validFields = ["deviceId", "host", "port", "vendorId"];
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
  const stmt = db.prepare(`UPDATE smartMeters SET ${setClause} WHERE id = ?`);
  stmt.run(...values, id);
}
async function deleteSmartMeter(id) {
  const stmt = db.prepare(`
        DELETE FROM smartMeters WHERE id = ?
    `);
  stmt.run(id);
}
async function getSmartMeterById(id) {
  const stmt = db.prepare(`
        SELECT * FROM smartMeters WHERE id = ?
    `);
  return stmt.get(id);
}
async function getSmartMeterByHost(host) {
  const stmt = db.prepare(`
        SELECT * FROM smartMeters WHERE host = ?
    `);
  return stmt.get(host);
}
function getAllSmartMeterVendorId() {
  const stmt = db.prepare(`SELECT DISTINCT vendorId FROM smartMeters`);
  return stmt.all().map((row) => row.vendorId);
}

export {
  getSmartMeters,
  insertSmartMeter,
  updateSmartMeter,
  deleteSmartMeter,
  getSmartMeterById,
  getSmartMeterByHost,
  getAllSmartMeterVendorId
};
