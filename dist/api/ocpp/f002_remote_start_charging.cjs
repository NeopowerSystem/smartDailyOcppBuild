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

// api/ocpp/f002_remote_start_charging.js
var f002_remote_start_charging_exports = {};
__export(f002_remote_start_charging_exports, {
  default: () => f002_remote_start_charging_default
});
module.exports = __toCommonJS(f002_remote_start_charging_exports);
var import_express = __toESM(require("express"), 1);

// controller/clients.js
var clients = [];
var getClients = () => clients;

// controller/chargers.js
var import_better_sqlite32 = __toESM(require("better-sqlite3"), 1);

// controller/smartMeter.js
var import_better_sqlite3 = __toESM(require("better-sqlite3"), 1);

// utils/timeFormatter.js
function getCurrentTimestamp() {
  return (/* @__PURE__ */ new Date()).toLocaleString("zh-TW", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).replace(/\//g, "-");
}

// controller/smartMeter.js
var import_meta = {};
var db = new import_better_sqlite3.default(new URL("../sqlite/app.db", import_meta.url).pathname);
async function getSmartMeters() {
  const stmt = db.prepare(`SELECT * FROM smartMeters`);
  return stmt.all();
}
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

// controller/idTags.js
var import_better_sqlite33 = __toESM(require("better-sqlite3"), 1);
var import_meta3 = {};
var db3 = new import_better_sqlite33.default(new URL("../sqlite/app.db", import_meta3.url).pathname);
function loadIdTags() {
  try {
    const stmt = db3.prepare("SELECT * FROM idTags");
    const rows = stmt.all();
    return rows;
  } catch (err) {
    console.error("Error reading idTags from database:", err);
    throw err;
  }
}
function findIdTag(idTag) {
  try {
    const stmt = db3.prepare("SELECT * FROM idTags WHERE idTag = ?");
    const row = stmt.get(idTag);
    return row;
  } catch (err) {
    console.error("Error finding idTag:", err);
    throw err;
  }
}
function findIdTagByChargerId(chargerId) {
  try {
    const stmt = db3.prepare("SELECT * FROM idTags WHERE chargerId = ? LIMIT 1");
    const row = stmt.get(chargerId);
    return row;
  } catch (err) {
    console.error("Error finding idTag by chargerId:", err);
    throw err;
  }
}
function saveIdTag(idTag, chargerId) {
  try {
    const existingTag = findIdTag(idTag);
    if (existingTag) {
      console.log(`idTag ${idTag} already exists...`);
    } else {
      const stmt = db3.prepare(`
                INSERT INTO idTags (idTag, chargerId,created_at)
                VALUES (?, ?,?)
            `);
      stmt.run(idTag, chargerId, getCurrentTimestamp());
      console.log(`idTag ${idTag} inserted with chargerId ${chargerId}.`);
    }
  } catch (err) {
    console.error("Error saving idTag to database:", err);
    throw err;
  }
}
function updateIdTagStatus(idTag, status) {
  try {
    const stmt = db3.prepare(`
            UPDATE idTags
            SET status = ?
            WHERE idTag = ?
        `);
    stmt.run(status, idTag);
    console.log(`idTag ${idTag} status updated to ${status}.`);
  } catch (err) {
    console.error("Error updating idTag status:", err);
    throw err;
  }
}
function deleteIdTag(idTag) {
  try {
    const stmt = db3.prepare("DELETE FROM idTags WHERE idTag = ?");
    stmt.run(idTag);
  } catch (err) {
    console.error("Error deleting idTag:", err);
    throw err;
  }
}
var idTags_default = {
  loadIdTags,
  findIdTag,
  findIdTagByChargerId,
  saveIdTag,
  updateIdTagStatus,
  deleteIdTag
};

// controller/charging.js
var import_better_sqlite34 = __toESM(require("better-sqlite3"), 1);
var import_meta4 = {};
var db4 = new import_better_sqlite34.default(new URL("../sqlite/app.db", import_meta4.url).pathname);
function getChargingParameter() {
  const stmt = db4.prepare(`SELECT * FROM charging_parameter`);
  return stmt.all();
}

// controller/OCPPPool.js
var import_better_sqlite35 = __toESM(require("better-sqlite3"), 1);
var import_meta5 = {};
var db5 = new import_better_sqlite35.default(new URL("../sqlite/app.db", import_meta5.url).pathname);
function insertOCPPPool(chargerId) {
  const stmt = db5.prepare(`
        INSERT INTO OCPPPool (chargerId)
        VALUES (?)
    `);
  stmt.run(chargerId);
}
function getOCPPPool() {
  const stmt = db5.prepare(`SELECT * FROM OCPPPool`);
  return stmt.all();
}

// controller/smartMeterPool.js
var import_better_sqlite36 = __toESM(require("better-sqlite3"), 1);
var import_meta6 = {};
var db6 = new import_better_sqlite36.default(new URL("../sqlite/app.db", import_meta6.url).pathname);
function insertSmartMeterPool(chargerId, vendorId, power) {
  const stmt = db6.prepare(`
        INSERT INTO SmartMeterPool (chargerId, vendorId, power)
        VALUES (?, ?, ?)
    `);
  stmt.run(chargerId, vendorId, power);
}
function getSmartMeterPool() {
  const stmt = db6.prepare(`SELECT * FROM SmartMeterPool`);
  return stmt.all();
}
function deleteSmartMeterPool(chargerId) {
  const stmt = db6.prepare(`
        DELETE FROM SmartMeterPool WHERE chargerId = ?
    `);
  stmt.run(chargerId);
}

// controller/waitingQueue.js
var import_better_sqlite37 = __toESM(require("better-sqlite3"), 1);
var import_meta7 = {};
var db7 = new import_better_sqlite37.default(new URL("../sqlite/app.db", import_meta7.url).pathname);
function tableExists(tableName) {
  const db9 = new import_better_sqlite37.default("sqlite/app.db");
  const stmt = db9.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name = ?`);
  const result = stmt.get(tableName);
  db9.close();
  return !!result;
}
function getWaitingQueue() {
  const stmt = db7.prepare(`SELECT * FROM waitingQueue`);
  return stmt.all();
}
function insertWaitingQueue(chargerId, isSmartMeter, transactionId) {
  const isSmartMeterInt = isSmartMeter ? "true" : "false";
  const stmt = db7.prepare(`
        INSERT INTO waitingQueue (chargerId, isSmartMeter, transactionId)
        VALUES (?, ?, ?)
    `);
  stmt.run(chargerId, isSmartMeterInt, transactionId);
}
function deleteWaitingQueueByTransactionId(transactionId) {
  const stmt = db7.prepare(`
        DELETE FROM waitingQueue WHERE transactionId = ?
    `);
  stmt.run(transactionId);
}

// controller/maxPower.js
var import_better_sqlite38 = __toESM(require("better-sqlite3"), 1);
var import_meta8 = {};
var db8 = new import_better_sqlite38.default(new URL("../sqlite/app.db", import_meta8.url).pathname);
async function getMaxPower() {
  const stmt = db8.prepare(`SELECT * FROM maxPower`);
  return stmt.all();
}
async function getMaxPowerByVendorId(vendorId) {
  const stmt = db8.prepare(`SELECT * FROM maxPower WHERE vendorId = ?`);
  return stmt.get(vendorId);
}

// api/charging/monitor.js
var import_axios = __toESM(require("axios"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_meta9 = {};
var Monitor = class {
  constructor(intervalTime = 5e3) {
    this.interval = null;
    this.chargerInfoUrl = "/ocppAPI/getAllClient";
    this.Allchargers = [];
    this.OCPPPool = [];
    this.smartMeterPool = [];
    this.waitingQueue = [];
    this.config = [];
    this.apiClient = import_axios.default.create({
      baseURL: "http://localhost:5001",
      headers: {
        "Content-Type": "application/json",
        "neopower-api-key": "neopower_ocpp_key"
      }
    });
    this.initializeFromDB();
  }
  // Monitor 開始運作時，從資料庫初始化狀態，避免程式重啟後，狀態消失
  async initializeFromDB() {
    try {
      if (!tableExists("waitingQueue") || !tableExists("OCPPPool") || !tableExists("SmartMeterPool")) {
        console.warn("waitinQueue\u521D\u59CB\u5316\u7565\u904E\uFF0C\u56E0\u70BA\u90E8\u5206\u8CC7\u6599\u8868\u5C1A\u672A\u5EFA\u7ACB\u3002");
        return;
      }
      const waitingQueueData = getWaitingQueue();
      if (waitingQueueData && waitingQueueData.length > 0) {
        this.waitingQueue = waitingQueueData;
        console.log("\u5DF2\u5F9E\u8CC7\u6599\u5EAB\u6062\u5FA9 waitingQueue \u72C0\u614B");
      }
      const ocppPoolData = getOCPPPool();
      if (ocppPoolData && ocppPoolData.length > 0) {
        this.OCPPPool = ocppPoolData.map((item) => item.chargerId);
        console.log("\u5DF2\u5F9E\u8CC7\u6599\u5EAB\u6062\u5FA9 OCPPPool \u72C0\u614B");
      }
      const smartMeterPoolData = getSmartMeterPool();
      if (smartMeterPoolData && smartMeterPoolData.length > 0) {
        this.smartMeterPool = smartMeterPoolData.map((item) => ({
          chargerId: item.chargerId,
          limit: item.power
        }));
        console.log("\u5DF2\u5F9E\u8CC7\u6599\u5EAB\u6062\u5FA9 smartMeterPool \u72C0\u614B");
        this.checkChargingParameters();
      }
    } catch (error) {
      console.error("\u5F9E\u8CC7\u6599\u5EAB\u521D\u59CB\u5316\u72C0\u614B\u6642\u767C\u751F\u932F\u8AA4\uFF1A", error);
    }
  }
  async fetchChargingConfig() {
    try {
      const chargersResponse = await this.apiClient.post(this.chargerInfoUrl);
      if (chargersResponse.data && chargersResponse.data[0].chargerId) {
        const filteredChargers = chargersResponse.data.map((charger) => ({
          chargerId: charger.chargerId,
          vendorId: charger.vendorId,
          firstConnector: charger.connectors[0]
          // 只取第一個 connector
        }));
        this.Allchargers = filteredChargers;
      }
      this.config = getChargingParameter()[0];
      if (!this.config) {
        console.log("\u5145\u96FB\u53C3\u6578\u5C1A\u672A\u914D\u7F6E\uFF0C\u8ACB\u67E5\u770B\u914D\u7F6E\u60C5\u6CC1\u6216\u524D\u5F80http://localhost:5001/ocpp/dashbord.html\u9032\u884C\u914D\u7F6E....");
        return;
      }
      this.checkChargingParameters();
    } catch (error) {
      console.error(`${getCurrentTimestamp()} Error fetching data:`, error.message);
    }
  }
  //演算法
  async checkChargingParameters() {
    this.processWaitingQueue();
    const chargers_unarranged = this.Allchargers.filter(
      (charger) => this.OCPPPool.includes(charger.chargerId)
      // 檢查this.Allchargers中的chargerId是否存在於chargerIds陣列
    );
    if (chargers_unarranged.length || this.smartMeterPool.length) {
      const available_power = this.config.contract_capacity - this.config.reserve_value - this.calSmartMeterPower();
      console.log(`\u76EE\u524D\u5951\u7D04\u5BB9\u91CF:-\u9810\u7559\u503C: ${this.config.contract_capacity} - ${this.config.reserve_value} =`, this.config.contract_capacity - this.config.reserve_value, "kW");
      console.log("\u76EE\u524DOCPP\u53EF\u7528\u96FB\u91CF : ", available_power, "kW");
      console.log("\u76EE\u524D\u96FB\u8868\u4F7F\u7528\u72C0\u6CC1 : ", this.smartMeterPool);
      console.log("\u76EE\u524DOCPP\u4F7F\u7528\u72C0\u6CC1 : ", this.OCPPPool);
      if (this.config.charging_mode == 0) {
        return;
      }
      if (this.config.charging_mode == 1) {
        const charging_chargers = chargers_unarranged.filter(
          (charger) => charger.firstConnector && charger.firstConnector.status_code == 2
        );
        const preparing_chargers = chargers_unarranged.filter(
          (charger) => charger.firstConnector && charger.firstConnector.status_code == 1
        );
        const maxPowerArray = await getMaxPower();
        const maxChargingPower = charging_chargers.reduce(async (sum, charger) => {
          const vendorId = charger.vendorId;
          const limit = await this.getPowerLimit(vendorId, maxPowerArray);
          return sum + limit;
        }, 0);
        const maxPreparingPower = preparing_chargers.reduce(async (sum, charger) => {
          const vendorId = charger.vendorId;
          const limit = await this.getPowerLimit(vendorId, maxPowerArray);
          return sum + limit;
        }, 0);
        const totalMaxPower = maxChargingPower + maxPreparingPower;
        const totalChargerCount = charging_chargers.length + preparing_chargers.length;
        const arrange_power = available_power / totalChargerCount;
        if (charging_chargers.length && preparing_chargers.length && available_power > 0) {
          if (available_power > totalMaxPower) {
            this.startCharging(preparing_chargers);
            this.setCharging(charging_chargers);
          } else {
            charging_chargers.forEach(async (charger) => {
              const vendorId = charger.vendorId;
              const limit = await this.getPowerLimit(vendorId, maxPowerArray);
              const power = Math.min(arrange_power, limit);
              this.setCharging([charger], power.toFixed(2));
            });
            preparing_chargers.forEach(async (charger) => {
              const vendorId = charger.vendorId;
              const limit = await this.getPowerLimit(vendorId, maxPowerArray);
              const power = Math.min(arrange_power, limit);
              this.startCharging([charger], power.toFixed(2));
            });
          }
        }
        if (charging_chargers.length && !preparing_chargers.length && available_power > 0) {
          if (available_power > totalMaxPower) {
            this.setCharging(charging_chargers);
          } else {
            charging_chargers.forEach(async (charger) => {
              const vendorId = charger.vendorId;
              const limit = await this.getPowerLimit(vendorId, maxPowerArray);
              const power = Math.min(arrange_power, limit);
              this.setCharging([charger], power.toFixed(2));
            });
          }
        }
        if (!charging_chargers.length && preparing_chargers.length && available_power > 0) {
          if (available_power > totalMaxPower) {
            this.startCharging(preparing_chargers);
          } else {
            preparing_chargers.forEach(async (charger) => {
              const vendorId = charger.vendorId;
              const limit = await this.getPowerLimit(vendorId, maxPowerArray);
              const power = Math.min(arrange_power, limit);
              this.startCharging([charger], power.toFixed(2));
            });
          }
        }
      }
      if (this.config.charging_mode == 2) {
        return;
      }
    }
  }
  // 依照 vendorId 及 arrangePower 轉換成充電資訊(W或A)
  async getChargingRate(vendorId, arrangePower) {
    try {
      const maxPowerArray = await getMaxPower();
      const vendorConfig = maxPowerArray.find(
        (item) => item.vendorId === vendorId
      );
      if (!vendorConfig) {
        console.error(`\u672A\u914D\u7F6E ${vendorId} \u7684\u529F\u7387\u9650\u5236`);
        return { rate: 0, unit: "W" };
      }
      if (arrangePower !== null && arrangePower !== void 0) {
        if (vendorConfig.unit === "W") {
          return { rate: Math.floor(arrangePower * 1e3), unit: "W" };
        } else if (vendorConfig.unit === "A") {
          return { rate: Math.floor(arrangePower * 1e3 / 220), unit: "A" };
        }
      }
      if (vendorConfig.unit === "W") {
        return { rate: vendorConfig.kw_limit * 1e3, unit: "W" };
      } else {
        return { rate: Math.floor(vendorConfig.kw_limit * 1e3 / 220), unit: "A" };
      }
    } catch (error) {
      console.error(`\u7372\u53D6\u5145\u96FB\u7387\u6642\u767C\u751F\u932F\u8AA4: ${error.message}`);
      return { rate: 0, unit: "W" };
    }
  }
  // 啟動充電
  async startCharging(prepareChargers, arrangePower = null) {
    try {
      for (let i = 0; i < prepareChargers.length; i++) {
        const idTag = await idTags_default.findIdTagByChargerId(prepareChargers[i].chargerId).idTag;
        const chargingRate = await this.getChargingRate(prepareChargers[i].vendorId, arrangePower);
        const requestData = {
          chargerId: prepareChargers[i].chargerId,
          idTag,
          connectorId: 1,
          chargingRate: chargingRate.rate,
          chargingRateUnit: chargingRate.unit
        };
        console.log("startCharging requestData:", requestData);
        await this.apiClient.post("/ocppAPI/remoteStartCharging2", requestData);
      }
    } catch (error) {
      console.error(`${getCurrentTimestamp()} Error starting charger:`, error.message);
    }
  }
  // 設定充電
  async setCharging(chargingChargers, arrangePower = null) {
    try {
      for (let i = 0; i < chargingChargers.length; i++) {
        const chargingRate = await this.getChargingRate(chargingChargers[i].vendorId, arrangePower);
        const requestData = {
          chargerId: chargingChargers[i].chargerId,
          connectorId: 1,
          control_unit: chargingRate.unit,
          limit: chargingRate.rate
        };
        console.log("setCharging requestData:", requestData);
        await this.apiClient.post("/ocppAPI/setChargingProfile", requestData);
      }
    } catch (error) {
      console.error(`${getCurrentTimestamp()} Error setting charging profile for charger:`, error.message);
    }
  }
  // 充電或排隊
  async chargeOrQueue(chargerId, isSmartMeter = false, transactionId) {
    if (isSmartMeter) {
      const isCharging = this.smartMeterPool.some((item) => item.chargerId === chargerId);
      if (isCharging) {
        return;
      }
    } else {
      const isCharging = this.OCPPPool.includes(chargerId);
      if (isCharging) {
        return;
      }
    }
    const isQueuing = this.waitingQueue.some((item) => item.chargerId === chargerId);
    if (isQueuing) {
      return;
    }
    const newRequest = { chargerId, isSmartMeter, transactionId };
    this.waitingQueue.push(newRequest);
    insertWaitingQueue(chargerId, isSmartMeter, transactionId);
    const result = await this.processWaitingQueue(chargerId);
    return result;
  }
  // 取得最大功率限制
  async getPowerLimit(vendorId, maxPowerArray) {
    try {
      const vendorConfig = maxPowerArray.find((item) => item.vendorId === vendorId);
      if (!vendorConfig) {
        console.error(`\u672A\u914D\u7F6E ${vendorId} \u7684\u529F\u7387\u9650\u5236`);
        return 0;
      }
      return vendorConfig.kw_limit;
    } catch (error) {
      console.error(`\u7372\u53D6 ${vendorId} \u529F\u7387\u9650\u5236\u6642\u767C\u751F\u932F\u8AA4:`, error.message);
      return 0;
    }
  }
  async processWaitingQueue(chargerId = null) {
    if (this.waitingQueue.length == 0) {
      console.log("There is no car in queue ...");
      return;
    }
    if (this.isProcessing) {
      console.log("ProcessWaitingQueue is processing in progress, please wait...");
      return;
    }
    const totalPower = await this.calTotalPower();
    const totalPower2 = await this.calTotalPower2();
    const maxPowerArray = await getMaxPower();
    const availableCapacity = this.config.contract_capacity - this.config.reserve_value;
    console.log("\u7576\u524D\u53EF\u7528\u529F\u7387 : ", this.calculateAvailablePower());
    console.log("totalPower : ", totalPower);
    console.log("totalPower2 : ", totalPower2);
    console.log("availableCapacity : ", availableCapacity);
    let smartMeterQueue = this.waitingQueue.filter((q) => q.isSmartMeter);
    let nonSmartMeterQueue = this.waitingQueue.filter((q) => !q.isSmartMeter);
    const nextChargerVendorId = chargers_default.getVendorByChargerId(this.waitingQueue[0].chargerId);
    const nextChargerMaxPower = await this.getPowerLimit(nextChargerVendorId, maxPowerArray);
    if (availableCapacity - totalPower > nextChargerMaxPower) {
      const nextSmartMeter = smartMeterQueue[0];
      if (smartMeterQueue.length > 0) {
        const vendorId = chargers_default.getVendorByChargerId(nextSmartMeter.chargerId);
        const limit = await this.getPowerLimit(vendorId, maxPowerArray);
        this.startCharging([{ chargerId: nextSmartMeter.chargerId, vendorId }], limit);
        this.smartMeterPool.push({
          chargerId: nextSmartMeter.chargerId,
          vendorId,
          limit
        });
        insertSmartMeterPool(nextSmartMeter.chargerId, vendorId, limit);
        return;
      } else {
        const nextNonSmartMeter = nonSmartMeterQueue[0];
        const newChargers = this.Allchargers.filter((charger) => charger.chargerId == nextNonSmartMeter.chargerId).map((charger) => charger.chargerId).filter((chargerId2) => !this.OCPPPool.includes(chargerId2));
        this.OCPPPool.push(...newChargers);
        await Promise.all(newChargers.map((chargerId2) => insertOCPPPool(chargerId2)));
        return;
      }
    }
    console.log("---------------- \u96FB\u91CF\u4E0D\u8DB3\uFF0C\u4F7F\u7528\u5747\u6D41\u6392\u7A0B --------------------");
    if (smartMeterQueue.length > 0 && this.smartMeterPool.length < this.config.smart_meter_num) {
      const nextSmartMeterVendorId = chargers_default.getVendorByChargerId(smartMeterQueue[0].chargerId);
      if (availableCapacity - totalPower2 >= await this.getPowerLimit(nextSmartMeterVendorId, maxPowerArray)) {
        const nextSmartMeter = smartMeterQueue[0];
        const vendorId = chargers_default.getVendorByChargerId(nextSmartMeter.chargerId);
        const limit = await this.getPowerLimit(vendorId, maxPowerArray);
        this.startCharging([{ chargerId: nextSmartMeter.chargerId, vendorId }], limit);
        this.smartMeterPool.push({
          chargerId: nextSmartMeter.chargerId,
          vendorId,
          limit
        });
        insertSmartMeterPool(nextSmartMeter.chargerId, vendorId, limit);
        if (chargerId) {
          if (chargerId == nextSmartMeter.chargerId)
            return { message: `${chargerId} ready to start...` };
          else
            return { message: `Add ${chargerId} into waiting queue...` };
        }
        this.isProcessing = true;
        console.log("Processing started, locking function for 60 seconds to wait rs485 refresh...");
        setTimeout(() => {
          this.isProcessing = false;
          console.log("Function unlocked, ready to process again.");
        }, 6e4);
      } else {
        if (chargerId)
          return { message: `Add ${chargerId} into waiting queue...` };
      }
    } else {
      if (nonSmartMeterQueue.length > 0) {
        if (availableCapacity - this.calSmartMeterPower() - 2 * this.OCPPPool.length >= 2) {
          const nextNonSmartMeter = nonSmartMeterQueue[0];
          const newChargers = this.Allchargers.filter((charger) => charger.chargerId == nextNonSmartMeter.chargerId).map((charger) => charger.chargerId).filter((chargerId2) => !this.OCPPPool.includes(chargerId2));
          this.OCPPPool.push(...newChargers);
          await Promise.all(newChargers.map((chargerId2) => insertOCPPPool(chargerId2)));
          if (chargerId)
            return { message: `${chargerId} ready to start...` };
        } else {
          if (chargerId)
            return { message: `Add ${chargerId} into waiting queue...` };
        }
      }
    }
    return true;
  }
  // OCPP樁數最大用量總和 + 智慧電表容量總和
  async calTotalPower() {
    let totalOCPPPower = 0;
    const totalSmartMeterPower = this.calSmartMeterPower();
    const maxPowerArray = await getMaxPower();
    for (const charger of this.Allchargers) {
      if (this.OCPPPool.includes(charger.chargerId)) {
        const limit = await this.getPowerLimit(charger.vendorId, maxPowerArray);
        totalOCPPPower += limit;
      }
    }
    return totalOCPPPower + totalSmartMeterPower;
  }
  // OCPP樁數*2 + 智慧電表容量總和
  async calTotalPower2() {
    const totalSmartMeterPower = this.calSmartMeterPower();
    let totalOCPPPower = 0;
    for (const charger of this.Allchargers) {
      if (this.OCPPPool.includes(charger.chargerId)) {
        totalOCPPPower += 2;
      }
    }
    return totalOCPPPower + totalSmartMeterPower;
  }
  // 計算當前可用功率
  calculateAvailablePower() {
    let available_power = this.config.contract_capacity - this.config.reserve_value;
    this.Allchargers.forEach((charger) => {
      if (this.OCPPPool.includes(charger.chargerId)) {
        available_power -= charger.firstConnector.power;
      }
    });
    this.smartMeterPool.forEach((smartMeter) => {
      if (smartMeter.limit) {
        available_power -= smartMeter.limit;
      }
    });
    return available_power;
  }
  // 計算智慧電表容量總和
  calSmartMeterPower() {
    let power = 0;
    this.smartMeterPool.forEach((smartMeter) => {
      power += smartMeter.limit;
    });
    return power;
  }
  // 計算OCPP樁數總和
  calOCPPPower() {
    let power = 0;
    this.Allchargers.forEach((charger) => {
      this.OCPPPool.forEach((id) => {
        if (id == charger.chargerId) {
          power += charger.firstConnector.power;
        }
      });
    });
    return power;
  }
  // // 計算當前使用功率
  // calculateUsingPower() {
  //   let power =0;
  //   this.Allchargers.forEach(charger => {
  //     if (charger.firstConnector && charger.firstConnector.power) {
  //       power += charger.firstConnector.power;
  //     }
  //   });
  //   return power;
  // }
  getQueueingData() {
    return this.waitingQueue;
  }
  getAllOCPPPool() {
    return this.OCPPPool;
  }
  // 將充電樁從 OCPPPool 中移除
  removeOcppControlByChargerId(chargerId) {
    this.OCPPPool = this.OCPPPool.filter((id) => id !== chargerId);
  }
  shiftQueueingData(transactionId) {
    const index = this.waitingQueue.findIndex((request) => request.transactionId === transactionId);
    if (index !== -1) {
      this.waitingQueue.splice(index, 1);
      deleteWaitingQueueByTransactionId(transactionId);
      return {
        status: "success",
        message: `${transactionId} has been removed from waiting queue.`
      };
    } else {
      return {
        status: "error",
        message: `${transactionId} not found in waiting queue.`
      };
    }
  }
  start(intervalTime = 5e3) {
    if (this.interval) {
      console.warn("Monitor is already running.");
      return;
    }
    this.fetchChargingConfig().then(() => {
      this.interval = setInterval(() => this.fetchChargingConfig(), intervalTime);
    });
  }
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      console.log(`${getCurrentTimestamp()} Monitor stopped.`);
    } else {
      console.log(`${getCurrentTimestamp()} Monitor is not running.`);
    }
  }
};
var monitorInstance = new Monitor();
monitorInstance.start(15e3);
var monitor_default = monitorInstance;
if (import_meta9.url === "file://" + process.argv[1]) {
  monitorInstance.start(15e3);
}

// api/charging/rs485.js
var import_modbus_serial = __toESM(require("modbus-serial"), 1);
var isRelayAction = false;
function setRelayAction(status) {
  isRelayAction = status;
}
function getRelayAction() {
  return isRelayAction;
}
function timeUTC8() {
  const date = /* @__PURE__ */ new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+08:00`;
}
function parseTime(data) {
  if (!data || data.length < 4) return null;
  const bcdToDec = (val) => (val >> 4) * 10 + (val & 15);
  const year = 2e3 + bcdToDec(data[0] >> 8);
  const month = bcdToDec(data[0] & 255);
  const day = bcdToDec(data[1] >> 8);
  const hour = bcdToDec(data[1] & 255);
  const min = bcdToDec(data[2] >> 8);
  const sec = bcdToDec(data[2] & 255);
  return `${year}/${String(month).padStart(2, "0")}/${String(day).padStart(2, "0")} ${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")} `;
}
function modbusRegistersToFloat(lowWord, highWord) {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt16LE(lowWord, 0);
  buffer.writeUInt16LE(highWord, 2);
  return buffer.readFloatLE(0);
}
async function readDevicesFromDB() {
  try {
    const data = await getSmartMeters();
    return data;
  } catch (error) {
    console.error("\u8B80\u53D6\u96FB\u9336 DB \u8CC7\u6599\u5931\u6557:", error);
    throw error;
  }
}
async function createClient() {
  const client = new import_modbus_serial.default();
  client.setTimeout(3e3);
  return client;
}
async function connectTCP(id) {
  const data = await readDevicesFromDB();
  const device = data.find((item) => parseInt(item.id) === parseInt(id));
  if (!device) {
    throw new Error(`\u627E\u4E0D\u5230\u96FB\u9336 id:${id}`);
  }
  const client = await createClient();
  try {
    client.setID(device.deviceId);
    await client.connectTCP(device.host, { port: device.port });
    return { client, device };
  } catch (error) {
    console.error("\u9023\u63A5 Modbus \u6642\u767C\u751F\u932F\u8AA4:", error);
    throw error;
  }
}
async function disconnectTCP(client) {
  try {
    if (client) {
      client.close();
    }
  } catch (error) {
    console.error("\u65B7\u958B\u9023\u63A5\u6642\u767C\u751F\u932F\u8AA4:", error);
  }
}
async function readPowerMeter(id) {
  var _a;
  let client = null;
  try {
    const { client: c, device } = await connectTCP(id);
    client = c;
    const registers = await client.readInputRegisters(288, 10);
    const relayAddress = 5;
    const relayStatusRaw = await client.readHoldingRegisters(relayAddress, 1);
    const relayStatus = relayStatusRaw.data == 32768 ? 1 : 0;
    const time = await client.readHoldingRegisters(1, 4);
    const voltageRaw = registers.data.slice(0, 2);
    const voltage = modbusRegistersToFloat(voltageRaw[0], voltageRaw[1]).toFixed(2);
    const currentRaw1 = registers.data.slice(2, 4);
    const current1 = modbusRegistersToFloat(currentRaw1[0], currentRaw1[1]).toFixed(2);
    const current = current1;
    const powerRaw1 = registers.data.slice(6, 8);
    const power1 = modbusRegistersToFloat(powerRaw1[0], powerRaw1[1]).toFixed(2);
    const power = power1;
    const result = {
      id,
      deviceId: device.deviceId,
      voltage,
      current,
      vendorId: device.vendorId,
      kw_limit: (_a = await getMaxPowerByVendorId(device.vendorId)) == null ? void 0 : _a.kw_limit,
      power,
      relayStatus,
      time: timeUTC8()
    };
    return result;
  } catch (err) {
    console.error(`\u8B80\u53D6\u96FB\u9336 id:${id} \u8CC7\u8A0A\u5931\u6557:`, err);
    return {
      id,
      voltage: null,
      current: null,
      power: null
    };
  } finally {
    await disconnectTCP(client);
  }
}
async function readAllPowerMeter() {
  if (isRelayAction) {
    console.log("\u7E7C\u96FB\u5668\u52D5\u4F5C\u4E2D\uFF0C\u8DF3\u904E\u8B80\u53D6\u96FB\u8868\u8CC7\u6599");
    return [];
  }
  const data = await readDevicesFromDB();
  const results = [];
  for (const item of data) {
    const result = await readPowerMeter(item.id);
    if (result.vendorId) {
      results.push(result);
    }
  }
  return results;
}
async function turnOnRelay(id) {
  let client = null;
  try {
    setRelayAction(true);
    const { client: c } = await connectTCP(id);
    client = c;
    const relayAddress = 5;
    const value = 32768;
    await client.writeRegisters(relayAddress, [value]);
    console.log(`\u96FB\u9336 id:${id} \u7E7C\u96FB\u5668\u958B\u95DC\u72C0\u614B\u8A2D\u70BA \u958B`);
    return { success: true, message: `\u96FB\u9336 id :${id} \u7E7C\u96FB\u5668\u5DF2\u958B\u555F` };
  } catch (err) {
    console.error(`\u96FB\u9336 id:${id} \u7E7C\u96FB\u5668\u958B\u555F\u5931\u6557:`, err);
    return {
      success: false,
      message: `\u96FB\u9336 id:${id} \u7E7C\u96FB\u5668\u958B\u555F\u5931\u6557`,
      error: err.message
    };
  } finally {
    await disconnectTCP(client);
    setRelayAction(false);
  }
}
async function turnOffRelay(id) {
  let client = null;
  try {
    setRelayAction(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    const { client: c } = await connectTCP(id);
    client = c;
    const relayAddress = 5;
    const value = 0;
    await client.writeRegisters(relayAddress, [value]);
    console.log(`\u96FB\u9336 id:${id} \u7E7C\u96FB\u5668\u958B\u95DC\u72C0\u614B\u8A2D\u70BA \u95DC`);
    return { success: true, message: `\u96FB\u9336 id :${id} \u7E7C\u96FB\u5668\u5DF2\u95DC\u9589` };
  } catch (err) {
    console.error(`\u96FB\u9336 id:${id} \u7E7C\u96FB\u5668\u95DC\u9589\u5931\u6557:`, err);
    return {
      success: false,
      message: `\u96FB\u9336 id:${id} \u7E7C\u96FB\u5668\u95DC\u9589\u5931\u6557`,
      error: err.message
    };
  } finally {
    await disconnectTCP(client);
    setRelayAction(false);
  }
}
async function checkRelay(id) {
  let client = null;
  try {
    const { client: c } = await connectTCP(id);
    client = c;
    const relayAddress = 5;
    const relayStatus = await client.readHoldingRegisters(relayAddress, 1);
    console.log(
      `\u76EE\u524D\u96FB\u9336 id:${id} \u7E7C\u96FB\u5668\u72C0\u614B:`,
      relayStatus.data == 32768 ? "\u958B" : "\u95DC"
    );
    const res = relayStatus.data == 32768 ? 1 : 0;
    return res;
  } catch (err) {
    console.error(`\u67E5\u770B\u96FB\u9336 id:${id} \u7E7C\u96FB\u5668\u5931\u6557:`, err);
  } finally {
    await disconnectTCP(client);
  }
}
async function readTime(id) {
  let client = null;
  try {
    const { client: c } = await connectTCP(id);
    client = c;
    const time = await client.readHoldingRegisters(1, 4);
    console.log("rs485 time :", parseTime(time.data));
    return parseTime(time.data);
  } catch (error) {
    console.log("readAllDevicesTime error : ", error.message);
  } finally {
    await disconnectTCP(client);
  }
}
async function readSlaveId(id) {
  let client = null;
  try {
    const { client: c } = await connectTCP(id);
    client = c;
    const slaveId = await client.readHoldingRegisters(0, 1);
    const convertedSlaveId = slaveId.data[0] >> 8;
    console.log(`\u96FB\u8868 id:${id} \u7684 slave ID:`, convertedSlaveId);
    return {
      success: true,
      slaveId: convertedSlaveId
    };
  } catch (err) {
    console.error(`\u8B80\u53D6\u96FB\u8868 id:${id} slave ID \u5931\u6557:`, err);
    return {
      success: false,
      message: `\u8B80\u53D6\u96FB\u8868 id:${id} slave ID \u5931\u6557`,
      error: err.message
    };
  } finally {
    await disconnectTCP(client);
  }
}
var rs485_default = {
  readPowerMeter,
  readAllPowerMeter,
  turnOnRelay,
  turnOffRelay,
  checkRelay,
  readTime,
  readSlaveId,
  getRelayAction
};

// emit_smartDaily/sendChargingInfo.js
var import_axios2 = __toESM(require("axios"), 1);
function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === "x" ? r : r & 3 | 8;
    return v.toString(16);
  });
}
function convertToTimezoneUTC8(utcDateString) {
  const utcDate = new Date(utcDateString);
  if (isNaN(utcDate.getTime())) {
    throw new Error("Invalid UTC date string");
  }
  const localTime = new Date(utcDate.getTime());
  const year = localTime.getFullYear();
  const month = String(localTime.getMonth() + 1).padStart(2, "0");
  const day = String(localTime.getDate()).padStart(2, "0");
  const hours = String(localTime.getHours()).padStart(2, "0");
  const minutes = String(localTime.getMinutes()).padStart(2, "0");
  const seconds = String(localTime.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+08:00`;
}
async function sendChargingInfo({ DeviceId, DeviceTime, ConnectorId, TransactionId, Voltage, Current, WH }) {
  const RequestId = generateUUID();
  const date = /* @__PURE__ */ new Date();
  const RequestTime = convertToTimezoneUTC8(date);
  const body = {
    DeviceId,
    RequestId,
    RequestTime,
    DeviceTime,
    ConnectorId,
    TransactionId,
    Voltage,
    Current,
    WH
  };
  console.log("Sending chargingInfo to smartDaily... ");
  const url = "http://localhost:30080/api/v1/EvCharging/Event/ChargingInfo";
  try {
    const response = await import_axios2.default.put(url, body, {
      headers: {
        "Authorization": "Bearer zaxb20C3jlV6dX8Dqvy2CpOvcnU7oqsK6mE4HigH",
        "Content-Type": "application/json"
      }
    });
    console.log("Sending ChargingInfo to smartDaily response status code:", response.status);
  } catch (error) {
    console.error("Sending ChargingInfo to smartDaily error:", error.response ? error.response.data : error.message);
  }
}

// emit_smartDaily/sendStatusChange.js
var import_axios3 = __toESM(require("axios"), 1);
function generateUUID2() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === "x" ? r : r & 3 | 8;
    return v.toString(16);
  });
}
function convertToTimezoneUTC82(utcDateString) {
  const utcDate = new Date(utcDateString);
  if (isNaN(utcDate.getTime())) {
    throw new Error("Invalid UTC date string");
  }
  const localTime = new Date(utcDate.getTime());
  const year = localTime.getFullYear();
  const month = String(localTime.getMonth() + 1).padStart(2, "0");
  const day = String(localTime.getDate()).padStart(2, "0");
  const hours = String(localTime.getHours()).padStart(2, "0");
  const minutes = String(localTime.getMinutes()).padStart(2, "0");
  const seconds = String(localTime.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+08:00`;
}
async function sendStatusChange({ DeviceId, DeviceTime, ConnectorId, Status, ErrorCode, VendorErrorCode }) {
  const RequestId = generateUUID2();
  const date = /* @__PURE__ */ new Date();
  const RequestTime = convertToTimezoneUTC82(date);
  const body = {
    DeviceId,
    RequestId,
    RequestTime,
    DeviceTime,
    ConnectorId,
    Status,
    ErrorCode,
    VendorErrorCode
  };
  console.log("Sending statusChange to smartDaily...");
  const url = "http://localhost:30080/api/v1/EvCharging/Event/StatusChange";
  try {
    const response = await import_axios3.default.put(url, body, {
      headers: {
        "Authorization": "Bearer zaxb20C3jlV6dX8Dqvy2CpOvcnU7oqsK6mE4HigH",
        "Content-Type": "application/json"
      }
    });
    console.log("Sending statusChange to smartDaily response status code:", response.status);
  } catch (error) {
    console.error("Sending statusChange to smartDaily error:", error.response ? error.response.data : error.message);
  }
}

// utils/rs485Service.js
function convertToTimezoneUTC83(utcDateString) {
  const utcDate = new Date(utcDateString);
  if (isNaN(utcDate.getTime())) {
    throw new Error("Invalid UTC date string");
  }
  const localTime = new Date(utcDate.getTime());
  const year = localTime.getFullYear();
  const month = String(localTime.getMonth() + 1).padStart(2, "0");
  const day = String(localTime.getDate()).padStart(2, "0");
  const hours = String(localTime.getHours()).padStart(2, "0");
  const minutes = String(localTime.getMinutes()).padStart(2, "0");
  const seconds = String(localTime.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+08:00`;
}
var STATUS_CODE_MAP = {
  "Available": 0,
  //灰白色
  "Preparing": 1,
  //淺藍色
  "Charging": 2,
  //紫色
  "Finishing": 3,
  //綠色
  "Unavailable": 4,
  //紅色
  "Faulted": 5,
  //橘色
  "Offline": 6,
  //灰黑色
  "SuspendedEVSE": 7,
  "SuspendedEV": 8,
  "Reserved": 9
};
var RS485Service = class {
  constructor(interval = 5e3) {
    this.isConnected = false;
    this.rs485Data = [];
    this.transferedData = [];
    this.zeroCurrentCount = [];
    this.interval = interval;
    this.startMonitoring();
    this.isOpen = true;
  }
  // 設定是否開啟讀取電表資料
  setIsOpen(isOpen) {
    this.isOpen = isOpen;
  }
  // 觀測所有rs485設備電流狀況
  countCurrent(newData) {
    newData.forEach((charger) => {
      var _a, _b, _c;
      const chargerId = charger.chargerId;
      const status = ((_a = charger.connectors[0]) == null ? void 0 : _a.status) ?? null;
      const transactionId = ((_b = charger.connectors[0]) == null ? void 0 : _b.transactionId) ?? null;
      const current = ((_c = charger.connectors[0]) == null ? void 0 : _c.current) ?? null;
      let existingEntry = this.zeroCurrentCount.find((item) => item.chargerId === chargerId);
      if (status == "Preparing") {
        if (existingEntry && existingEntry.current_count > 0) {
          existingEntry.current_count = 0;
          existingEntry.transactionId = null;
          existingEntry.status = "Preparing";
          monitor_default.smartMeterPool.splice(monitor_default.smartMeterPool.findIndex((item) => item.chargerId === chargerId), 1);
          deleteSmartMeterPool(chargerId);
        }
        return;
      }
      if (!existingEntry) {
        this.zeroCurrentCount.push({
          chargerId,
          status,
          transactionId,
          current_count: 0
        });
      } else {
        if (current == null || current < 0.5) {
          existingEntry.current_count++;
          console.log(`\u5145\u96FB\u6A01 ${chargerId} \u76EE\u524D\u8B80\u4E0D\u5230\u96FB\u6D41\uFF0C\u5DF2\u6AA2\u67E5${existingEntry.current_count * 1}\u5206\u9418...`);
          if (existingEntry.current_count >= 5) {
            console.log(`\u5145\u96FB\u6A01 ${chargerId} \u9023\u7E8C 5 \u5206\u9418\u8B80\u4E0D\u5230\u96FB\u6D41\uFF0C\u89F8\u767C\u95DC\u9589\u7E7C\u96FB\u5668\uFF01`);
            const smartMeterId = chargerId.match(/\d+$/)[0];
            rs485_default.turnOffRelay(smartMeterId);
            chargers_default.stopCharging(transactionId, getCurrentTimestamp());
            chargers_default.upsertConnector({
              chargerId,
              connectorId: 1,
              status: "Preparing",
              transactionId: null
            });
            const StatusChange_body = {
              "DeviceId": chargerId,
              "DeviceTime": convertToTimezoneUTC83((/* @__PURE__ */ new Date()).toISOString()),
              "ConnectorId": "1",
              "Status": STATUS_CODE_MAP["Preparing"].toString(),
              "ErrorCode": null,
              "VendorErrorCode": null
            };
            monitor_default.smartMeterPool.splice(monitor_default.smartMeterPool.findIndex((item) => item.chargerId === chargerId), 1);
            deleteSmartMeterPool(chargerId);
            sendStatusChange(StatusChange_body);
          }
        } else {
          existingEntry.current_count = 0;
        }
      }
    });
  }
  async fetchRS485Data() {
    try {
      if (!this.isOpen || rs485_default.getRelayAction()) {
        return;
      }
      const rs485data_read = await rs485_default.readAllPowerMeter();
      if (rs485data_read.length) {
        this.transferedData = [];
        for (let i = 0; i < rs485data_read.length; i++) {
          const transfered_id = "SmartMeter" + rs485data_read[i].id;
          const currentTime = getCurrentTimestamp();
          if (!chargers_default.getChargerById(transfered_id)) {
            chargers_default.insertCharger(transfered_id);
            chargers_default.updateCharger(transfered_id, { vendorId: rs485data_read[i].vendorId });
          }
          const getConnectorRes = chargers_default.getChargerWithConnectorsById(transfered_id);
          if (getConnectorRes.vendorId != rs485data_read[i].vendorId) {
            chargers_default.updateCharger(transfered_id, { vendorId: rs485data_read[i].vendorId });
          }
          const transformedData = getConnectorRes.reduce((acc, curr) => {
            let charger = acc.find((item) => item.chargerId === curr.chargerId);
            if (!charger) {
              charger = {
                chargerId: curr.chargerId,
                vendorId: curr.vendorId,
                connectors: []
              };
              acc.push(charger);
            }
            charger.connectors.push({
              connectorId: curr.connectorId,
              status: curr.status,
              transactionId: curr.transactionId ?? null,
              voltage: curr.voltage ?? null,
              current: curr.current ?? null,
              power: curr.power ?? null,
              last_update_time: curr.last_update_time
            });
            return acc;
          }, []);
          this.transferedData.push(...transformedData);
          if (!getConnectorRes[0].connectorId) {
            chargers_default.upsertConnector({
              chargerId: transfered_id,
              connectorId: 1,
              last_update_time: currentTime
            });
          }
          if (getConnectorRes[0].status == "Unknown" && rs485data_read[i].relayStatus != null) {
            chargers_default.upsertConnector({
              chargerId: transfered_id,
              connectorId: 1,
              status: rs485data_read[i].relayStatus == 0 ? "Preparing" : "Charging",
              last_update_time: currentTime
            });
          }
          const transactionId = chargers_default.getTransactionById(transfered_id, 1);
          const smartMeterId = transfered_id.match(/\d+$/)[0];
          if (!transactionId && getConnectorRes[0].status == "Preparing" && rs485data_read[i].relayStatus == 1) {
            console.log("relay closed due to no transaction");
            rs485_default.turnOffRelay(smartMeterId);
          }
          if (getConnectorRes[0].status == "Charging" && rs485data_read[i].relayStatus == 0) {
            console.log("UpsertConnector and sending to smartDaily...");
            chargers_default.upsertConnector({
              chargerId: transfered_id,
              connectorId: 1,
              status: "Preparing",
              transactionId: null,
              voltage: null,
              current: null,
              power: null,
              last_update_time: currentTime
            });
            const StatusChange_body = {
              "DeviceId": transfered_id,
              "DeviceTime": rs485data_read[i].time,
              "ConnectorId": "1",
              "Status": STATUS_CODE_MAP["Preparing"].toString(),
              "ErrorCode": null,
              "VendorErrorCode": null
            };
            sendStatusChange(StatusChange_body);
          }
          if (rs485data_read[i].current != 0 && rs485data_read[i].relayStatus == 1) {
            console.log("hi6");
            chargers_default.upsertConnector({
              chargerId: transfered_id,
              connectorId: 1,
              status: "Charging",
              transactionId,
              voltage: rs485data_read[i].voltage,
              current: rs485data_read[i].current,
              power: rs485data_read[i].power,
              last_update_time: currentTime
            });
            const sendChargingInfo_body = {
              "DeviceId": transfered_id,
              "DeviceTime": rs485data_read[i].time,
              "ConnectorId": "1",
              "TransactionId": transactionId.toString(),
              "Voltage": rs485data_read[i].voltage,
              "Current": rs485data_read[i].current,
              "WH": 0,
              "soc": null
            };
            sendChargingInfo(sendChargingInfo_body);
          }
        }
        this.rs485Data = rs485data_read;
        this.countCurrent(this.transferedData);
      } else {
        this.rs485Data = [];
        this.transferedData = [];
      }
    } catch (err) {
      console.error("RS485 data update fail:", err);
      this.isConnected = false;
    }
  }
  startMonitoring() {
    setInterval(() => this.fetchRS485Data(), this.interval);
  }
  getRS485Data() {
    if (!this.isOpen) {
      return [];
    }
    return this.transferedData;
  }
  getRS485RawData() {
    if (!this.isOpen) {
      return [];
    }
    return this.rs485Data;
  }
};
var rs485Service = new RS485Service(6e4);
var rs485Service_default = rs485Service;

// api/ocpp/f002_remote_start_charging.js
var router = import_express.default.Router();
router.post("/remoteStartCharging", async (req, res) => {
  const API_KEY = "neopower_ocpp_key";
  const apiKey = req.headers["neopower-api-key"];
  if (apiKey !== API_KEY) {
    return res.status(403).json({ message: "Forbidden: Invalid API Key" });
  }
  const clients2 = getClients();
  const { chargerId } = req.body;
  if (!chargerId) {
    return res.status(400).json({ message: "chargerId is required" });
  }
  const idTag = idTags_default.findIdTagByChargerId(chargerId);
  if (!idTag) {
    return res.status(404).json({ message: `Please set the idTag for chargerId: ${chargerId}` });
  }
  const vendorId = chargers_default.getVendorByChargerId(chargerId);
  const maxPower = await getMaxPowerByVendorId(vendorId);
  if (!maxPower) {
    return res.status(404).json({ message: `Please set the maxPower of vendorId for: ${chargerId}` });
  }
  const isSmartMeter = chargerId.startsWith("SmartMeter");
  let client;
  if (isSmartMeter) {
    client = rs485Service_default.getRS485Data().find((chargers) => chargers.chargerId === chargerId);
  } else {
    client = clients2.find((c) => c.identity === chargerId);
  }
  if (!client) {
    return res.status(404).json({ message: `Can not find the client: ${chargerId}` });
  }
  const transactionId = chargers_default.getTransactionById(isSmartMeter ? client.chargerId : client.identity, 1);
  if (transactionId) {
    const waitingQueue = monitor_default.getQueueingData();
    const waitingData = waitingQueue.find((request) => request.transactionId === transactionId);
    if (waitingData) {
      return res.status(409).json({ message: `${isSmartMeter ? client.chargerId : client.identity} is already queueing with transactionId:${transactionId}` });
    }
    const chargingStatus = chargers_default.getChargerWithConnectorsById(isSmartMeter ? client.chargerId : client.identity);
    if (chargingStatus[0].status == "Charging") {
      return res.status(409).json({ message: `${isSmartMeter ? client.chargerId : client.identity} is already charging with transactionId:${transactionId}` });
    }
  }
  const newTransactionId = chargers_default.generateTransactionId(isSmartMeter ? client.chargerId : client.identity, 1);
  monitor_default.chargeOrQueue(isSmartMeter ? client.chargerId : client.identity, isSmartMeter, newTransactionId);
  return res.status(200).json({ message: "Start charging command sent successfully", status: "Accepted", transactionId: newTransactionId });
});
var f002_remote_start_charging_default = router;
