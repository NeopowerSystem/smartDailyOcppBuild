// controller/waitingQueue.js
import Database from "better-sqlite3";
var db = new Database(new URL("../sqlite/app.db", import.meta.url).pathname);
function tableExists(tableName) {
  const db2 = new Database("sqlite/app.db");
  const stmt = db2.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name = ?`);
  const result = stmt.get(tableName);
  db2.close();
  return !!result;
}
function getWaitingQueue() {
  const stmt = db.prepare(`SELECT * FROM waitingQueue`);
  return stmt.all();
}
function insertWaitingQueue(chargerId, isSmartMeter, transactionId) {
  const isSmartMeterInt = isSmartMeter ? "true" : "false";
  const stmt = db.prepare(`
        INSERT INTO waitingQueue (chargerId, isSmartMeter, transactionId)
        VALUES (?, ?, ?)
    `);
  stmt.run(chargerId, isSmartMeterInt, transactionId);
}
function deleteWaitingQueueByTransactionId(transactionId) {
  const stmt = db.prepare(`
        DELETE FROM waitingQueue WHERE transactionId = ?
    `);
  stmt.run(transactionId);
}

export {
  tableExists,
  getWaitingQueue,
  insertWaitingQueue,
  deleteWaitingQueueByTransactionId
};
