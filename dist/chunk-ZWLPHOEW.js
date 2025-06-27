// controller/OCPPPool.js
import Database from "better-sqlite3";
var db = new Database(new URL("../sqlite/app.db", import.meta.url).pathname);
function insertOCPPPool(chargerId) {
  const stmt = db.prepare(`
        INSERT INTO OCPPPool (chargerId)
        VALUES (?)
    `);
  stmt.run(chargerId);
}
function getOCPPPool() {
  const stmt = db.prepare(`SELECT * FROM OCPPPool`);
  return stmt.all();
}
function deleteOCPPPool(chargerId) {
  const stmt = db.prepare(`
        DELETE FROM OCPPPool WHERE chargerId = ?
    `);
  stmt.run(chargerId);
}

export {
  insertOCPPPool,
  getOCPPPool,
  deleteOCPPPool
};
