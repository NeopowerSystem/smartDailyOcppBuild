// controller/smartMeterPool.js
import Database from "better-sqlite3";
var db = new Database(new URL("../sqlite/app.db", import.meta.url).pathname);
function insertSmartMeterPool(chargerId, vendorId, power) {
  const stmt = db.prepare(`
        INSERT INTO SmartMeterPool (chargerId, vendorId, power)
        VALUES (?, ?, ?)
    `);
  stmt.run(chargerId, vendorId, power);
}
function getSmartMeterPool() {
  const stmt = db.prepare(`SELECT * FROM SmartMeterPool`);
  return stmt.all();
}
function deleteSmartMeterPool(chargerId) {
  const stmt = db.prepare(`
        DELETE FROM SmartMeterPool WHERE chargerId = ?
    `);
  stmt.run(chargerId);
}

export {
  insertSmartMeterPool,
  getSmartMeterPool,
  deleteSmartMeterPool
};
