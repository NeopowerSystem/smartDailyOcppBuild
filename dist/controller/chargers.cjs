var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// controller/chargers.js
var chargers_exports = {};
__export(chargers_exports, {
  default: () => chargers_default
});
module.exports = __toCommonJS(chargers_exports);
var import_better_sqlite32 = __toESM(require("better-sqlite3"), 1);

// controller/smartMeter.js
var import_better_sqlite3 = __toESM(require("better-sqlite3"), 1);
var import_meta = {};
var db = new import_better_sqlite3.default(new URL("../sqlite/app.db", import_meta.url).pathname);
function getAllSmartMeterVendorId() {
  const stmt = db.prepare(`SELECT DISTINCT vendorId FROM smartMeters`);
  return stmt.all().map((row) => row.vendorId);
}

// controller/chargers.js
var import_meta2 = {};
var db2 = new import_better_sqlite32.default(new URL("../sqlite/app.db", import_meta2.url).pathname);
function insertCharger(chargerId) {
  const stmt = db2.prepare(`
        INSERT INTO chargers (chargerId) 
        VALUES (?)
    `);
  stmt.run(chargerId);
}
function updateCharger(chargerId, updates) {
  const validFields = ["vendorId"];
  const fields = Object.keys(updates).filter((field) => validFields.includes(field));
  if (fields.length === 0) {
    throw new Error("No valid fields to update.");
  }
  const setClause = fields.map((field) => `${field} = ?`).join(", ");
  const sql = `
        UPDATE chargers
        SET ${setClause}
        WHERE chargerId = ?
    `;
  const values = fields.map((field) => updates[field]);
  values.push(chargerId);
  const stmt = db2.prepare(sql);
  stmt.run(...values);
}
function getConnectorByChargerId(chargerId) {
  const stmt = db2.prepare(`
        SELECT * FROM connectors WHERE chargerId = ?
    `);
  return stmt.all(chargerId);
}
function upsertConnector(fields) {
  try {
    if (!fields.chargerId || !fields.connectorId) {
      throw new Error("chargerId \u548C connectorId \u662F\u5FC5\u9700\u7684\u6B04\u4F4D");
    }
    const columns = Object.keys(fields);
    const values = Object.values(fields);
    const placeholders = columns.map(() => "?").join(", ");
    const updates = columns.map((col) => `${col} = excluded.${col}`).join(", ");
    const sql = `
            INSERT INTO connectors (${columns.join(", ")})
            VALUES (${placeholders})
            ON CONFLICT(chargerId, connectorId) 
            DO UPDATE SET ${updates}
        `;
    const stmt = db2.prepare(sql);
    const result = stmt.run(...values);
    if (result.changes > 0) {
      console.log(`Upserted ${fields.chargerId} Connector , Insert or update successful : `, result);
    }
  } catch (error) {
    console.error("Error executing upsertConnector:", error);
  }
}
function generateTransactionId(chargerId, connectorId) {
  try {
    const lastTransactionStmt = db2.prepare(`SELECT MAX(transactionId) AS transactionId FROM transactions`);
    const lastTransaction = lastTransactionStmt.get();
    let transactionId = lastTransaction && lastTransaction.transactionId ? lastTransaction.transactionId + 1 : 1000000001;
    if (transactionId > 1999999999) {
      throw new Error("Transaction ID exceeded the limit of 1999999999");
    }
    const transactionStmt = db2.prepare(`
            INSERT INTO transactions (transactionId, chargerId, connectorId)
            VALUES ( ?, ?, ?)
        `);
    transactionStmt.run(transactionId, chargerId, connectorId);
    console.log(`New transaction created with ID: ${transactionId}`);
    const connectorStmt = db2.prepare(`
            UPDATE connectors
            SET transactionId = ?
            WHERE chargerId = ? AND connectorId = ?
        `);
    const result = connectorStmt.run(transactionId, chargerId, connectorId);
    console.log(`Connector update result:`, result);
    const verifyStmt = db2.prepare(`
            SELECT transactionId, status
            FROM connectors
            WHERE chargerId = ? AND connectorId = ?
        `);
    const verifyResult = verifyStmt.get(chargerId, connectorId);
    console.log(`Updated connector state:`, verifyResult);
    return transactionId;
  } catch (e) {
    console.error("Error starting charging:", e);
    throw e;
  }
}
function startCharging(chargerId, connectorId, startTime) {
  try {
    const transactionId = getTransactionById(chargerId, connectorId);
    const transactionStmt = db2.prepare(`
            UPDATE transactions
            SET start_time = ?
            WHERE transactionId = ?
        `);
    const res = transactionStmt.run(startTime, transactionId);
    if (res.changes > 0) {
    } else {
      console.error(`Failed to update transaction ${transactionId}`);
    }
    const connectorStmt = db2.prepare(`
            UPDATE connectors
            SET status = 'Charging', transactionId = ? WHERE chargerId = ? AND connectorId = ?
        `);
    const result = connectorStmt.run(transactionId, chargerId, connectorId);
    console.log(`Connector update result:`, result);
    const vendorId = getVendorByChargerId(chargerId);
    const smartMeterVendorId = getAllSmartMeterVendorId();
    if (smartMeterVendorId.includes(vendorId)) {
      return;
    }
    const verifyStmt = db2.prepare(`
            SELECT status
            FROM connectors
            WHERE chargerId = ? AND connectorId = ?
        `);
    const verifyResult = verifyStmt.get(chargerId, connectorId);
    return transactionId;
  } catch (e) {
    console.error("Error starting charging:", e);
    throw e;
  }
}
function stopCharging(transactionId, stopTime, meterStart, meterStop, totalEnergyUsed, recordChargingDuration) {
  try {
    const transactionStmt = db2.prepare(`
            UPDATE transactions
            SET stop_time = ?, meterStart = ?, meterStop = ?, totalEnergyUsed = ?, chargingDuration = ?
            WHERE transactionId = ?
        `);
    const result = transactionStmt.run(stopTime, meterStart, meterStop, totalEnergyUsed, recordChargingDuration, transactionId);
    if (result.changes > 0) {
      console.log(`Transaction ${transactionId} ended at ${stopTime}`);
    } else {
      console.error(`Failed to update transaction ${transactionId}`);
    }
    const chargerId = getChargerIdByTransactionId(transactionId);
    const vendorId = getVendorByChargerId(chargerId);
    const smartMeterVendorId = getAllSmartMeterVendorId();
    if (smartMeterVendorId.includes(vendorId)) {
      const connectorStmt = db2.prepare(`
                UPDATE connectors
                SET 
                    transactionId = NULL,
                    status = 'Preparing',
                    voltage = NULL,
                    current = NULL,
                    WH = NULL,
                    power = NULL,
                    soc = NULL
                WHERE transactionId = ?
            `);
      connectorStmt.run(transactionId);
    } else {
      const connectorStmt = db2.prepare(`
                UPDATE connectors
                SET 
                    transactionId = NULL,
                    status = 'Finishing',
                    voltage = NULL,
                    current = NULL,
                    power = NULL,
                    soc = NULL
                WHERE transactionId = ?
            `);
      connectorStmt.run(transactionId);
    }
  } catch (error) {
    console.error("Error stopping charging:", error);
  }
}
function removeCharger(chargerId) {
  const stmt = db2.prepare(`
        DELETE FROM chargers WHERE chargerId = ?
    `);
  stmt.run(chargerId);
}
function removeConnector(chargerId, connectorId) {
  const stmt = db2.prepare(`
        DELETE FROM connectors WHERE chargerId = ? AND connectorId = ?
    `);
  stmt.run(chargerId, connectorId);
}
function getAllChargers() {
  const stmt = db2.prepare(`
        SELECT * FROM chargers
    `);
  return stmt.all().map((charger) => {
    return Object.fromEntries(Object.entries(charger).filter(([key, value]) => value !== null));
  });
}
function getVendorByChargerId(chargerId) {
  const stmt = db2.prepare(`
        SELECT vendorId
        FROM chargers
        WHERE chargerId = ?
    `);
  const result = stmt.get(chargerId);
  return result ? result.vendorId : null;
}
function checkIfQueueing(chargerId, transactionId) {
  const stmt = db2.prepare(`
        SELECT COUNT(*) AS count
        FROM transactions
        WHERE chargerId = ? AND transactionId = ? AND start_time IS NULL
    `);
  const result = stmt.get(chargerId, transactionId);
  return result && result.count > 0;
}
function getChargerIdByTransactionId(transactionId) {
  const stmt = db2.prepare(`
        SELECT chargerId 
        FROM transactions
        WHERE transactionId = ?
    `);
  const result = stmt.get(transactionId);
  return result ? result.chargerId : null;
}
function getTransactionById(chargerId, connectorId) {
  const stmt = db2.prepare(`
        SELECT transactionId 
        FROM connectors 
        WHERE chargerId = ? 
        AND connectorId = ? 
    `);
  const result = stmt.get(chargerId, connectorId);
  return result ? result.transactionId : null;
}
function getChargerById(chargerId) {
  const stmt = db2.prepare(`
        SELECT * FROM chargers WHERE chargerId = ?
    `);
  const charger = stmt.get(chargerId);
  if (charger) {
    return Object.fromEntries(Object.entries(charger).filter(([key, value]) => value !== null));
  } else {
    return null;
  }
}
function getChargerWithConnectorsById(chargerId) {
  const stmt = db2.prepare(`
        SELECT chargers.*, connectors.* 
        FROM chargers
        LEFT JOIN connectors ON chargers.chargerId = connectors.chargerId
        WHERE chargers.chargerId = ?
    `);
  return stmt.all(chargerId).map((row) => {
    const filteredRow = {};
    for (const [key, value] of Object.entries(row)) {
      if (value !== null) {
        filteredRow[key] = value;
      }
    }
    return filteredRow;
  });
}
function getChargerWithConnectors() {
  const stmt = db2.prepare(`
        SELECT chargers.*, connectors.* FROM chargers
        LEFT JOIN connectors ON chargers.chargerId = connectors.chargerId
    `);
  return stmt.all().map((row) => {
    const filteredRow = {};
    for (const [key, value] of Object.entries(row)) {
      if (value !== null) {
        filteredRow[key] = value;
      }
    }
    return filteredRow;
  });
}
var chargers_default = {
  checkIfQueueing,
  getChargerIdByTransactionId,
  generateTransactionId,
  insertCharger,
  updateCharger,
  getChargerById,
  getConnectorByChargerId,
  upsertConnector,
  removeCharger,
  removeConnector,
  getAllChargers,
  getChargerWithConnectorsById,
  getChargerWithConnectors,
  startCharging,
  stopCharging,
  getTransactionById,
  getVendorByChargerId
};
