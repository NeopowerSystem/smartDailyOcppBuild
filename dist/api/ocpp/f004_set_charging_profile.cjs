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

// api/ocpp/f004_set_charging_profile.js
var f004_set_charging_profile_exports = {};
__export(f004_set_charging_profile_exports, {
  default: () => f004_set_charging_profile_default
});
module.exports = __toCommonJS(f004_set_charging_profile_exports);
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

// api/ocpp/f004_set_charging_profile.js
var router = import_express.default.Router();
router.post("/setChargingProfile", (req, res) => {
  const API_KEY = "neopower_ocpp_key";
  const apiKey = req.headers["neopower-api-key"];
  if (apiKey !== API_KEY) {
    return res.status(403).json({ message: "Forbidden: Invalid API Key" });
  }
  const clients2 = getClients();
  const { chargerId, connectorId, limit, control_unit } = req.body;
  if (!chargerId || !limit || !connectorId || !control_unit) {
    return res.status(400).json({ message: "chargerId, connectorId, limit, and control_unit are required" });
  }
  const client = clients2.find((c) => c.identity === chargerId);
  if (!client) {
    return res.status(404).json({ message: `Cannot find the specified client: ${chargerId}` });
  }
  try {
    let transactionId = chargers_default.getTransactionById(chargerId, connectorId);
    transactionId = parseInt(transactionId, 10);
    const csChargingProfiles = (
      // {
      //     // chargingProfileId: chargingProfile.chargingProfileId, // 使用現有計畫的 ID
      //     chargingProfileId: 1234, 
      //     stackLevel: 6,
      //     chargingProfilePurpose : "TxProfile",
      //     chargingProfileKind: "Absolute",
      //     chargingSchedule: {
      //         duration: 1800,
      //         startSchedule: new Date().toISOString(),
      //         chargingRateUnit: control_unit, // 使用功率 (W) 或 (A)
      //         chargingSchedulePeriod: [
      //             {
      //                 startPeriod: 0,
      //                 limit: limit // 設置功率限制
      //             }
      //         ]
      //     }
      // };
      // {
      //     "chargingProfileId": chargingProfile.chargingProfileId,
      //     "stackLevel": 0,
      //     "chargingProfilePurpose": "TxDefaultProfile",
      //     "chargingProfileKind": "Recurring",
      //     "recurrencyKind": "Daily",
      //     "chargingSchedule": {
      //       "startSchedule": new Date().toISOString(),
      //       "duration": 86400,
      //       "chargingRateUnit": control_unit,
      //       "chargingSchedulePeriod": [
      //         {
      //           "startPeriod": 0,
      //           "limit": limit
      //         }
      //       ]
      //     }
      //   }
      // { //這個大多都能使用，但有些廠牌只支援TxProfile且必須帶transactionId
      //     "chargingProfileId": chargingProfile.chargingProfileId,
      //     "stackLevel": 0,
      //     "chargingProfilePurpose": "TxDefaultProfile",
      //     "chargingProfileKind": "Relative",
      //     "chargingSchedule": {
      //       "chargingRateUnit": control_unit,
      //       "chargingSchedulePeriod": [
      //         {
      //           "startPeriod": 0,
      //           "limit": limit,
      //           "numberPhases" : 1 //看是否需要拿掉
      //         }
      //       ]
      //     }
      // }
      // { // 以後別用這個， Relative是相對的，所以limit這邊應該換成+-多少，假設要增加就帶正整數ex:5，減少就加負號ex:-6
      //     "chargingProfileId": chargingProfile.chargingProfileId,
      //     "stackLevel": 0,
      //     "chargingProfilePurpose": "TxProfile",
      //     "chargingProfileKind": "Relative",
      //     "transactionId":transactionId,
      //     "chargingSchedule": {
      //       "chargingRateUnit": control_unit,
      //       "chargingSchedulePeriod": [
      //         {
      //           "startPeriod": 0,
      //           "limit": limit,
      //           "numberPhases" : 1 //看是否需要拿掉
      //         }
      //       ]
      //     }
      // }
      {
        // 2025.03.12調整,模擬器可以用這個調整
        "chargingProfileId": 1,
        "stackLevel": 0,
        "chargingProfilePurpose": "TxProfile",
        "chargingProfileKind": "Absolute",
        "transactionId": transactionId,
        "chargingSchedule": {
          "chargingRateUnit": control_unit,
          "duration": 3600,
          // 持續一小時
          "startSchedule": (/* @__PURE__ */ new Date()).toISOString(),
          //正常Absolute都需要帶此欄位，代表現在開始使用此計畫
          "chargingSchedulePeriod": [
            {
              "startPeriod": 0,
              "limit": limit,
              "numberPhases": 1
            }
          ]
        }
      }
    );
    client.call("SetChargingProfile", {
      connectorId: parseInt(connectorId, 10),
      // 將 connectorId 轉為整數
      csChargingProfiles
    }).then((response) => {
      console.log("SetChargingProfileResponse received:", response);
      if (response.status === "Rejected") {
        if (!monitor_default.smartMeterPool.find((item) => item.chargerId === chargerId)) {
          const connector = chargers_default.getConnectorByChargerId(chargerId);
          monitor_default.smartMeterPool.push({
            chargerId,
            limit: connector[0].power
          });
          monitor_default.removeOcppControlByChargerId(chargerId);
        }
      }
      res.status(200).json({ message: "SetChargingProfile command sent", response });
    }).catch((error) => {
      console.error("SetChargingProfile failed:", error);
      res.status(500).json({ message: "SetChargingProfile failed", error });
    });
  } catch (error) {
    console.error("SetChargingProfile failed:", error);
    res.status(500).json({ message: "SetChargingProfile failed", error });
  }
});
var f004_set_charging_profile_default = router;
