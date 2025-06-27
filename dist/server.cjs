var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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

// server.js
var import_ocpp_rpc = require("ocpp-rpc");
var import_express18 = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);

// routes.js
var import_express17 = __toESM(require("express"), 1);

// api/idTags/f101_create_idTag.js
var import_express = __toESM(require("express"), 1);

// controller/idTags.js
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

// controller/idTags.js
var import_meta = {};
var db = new import_better_sqlite3.default(new URL("../sqlite/app.db", import_meta.url).pathname);
function loadIdTags() {
  try {
    const stmt = db.prepare("SELECT * FROM idTags");
    const rows = stmt.all();
    return rows;
  } catch (err) {
    console.error("Error reading idTags from database:", err);
    throw err;
  }
}
function findIdTag(idTag) {
  try {
    const stmt = db.prepare("SELECT * FROM idTags WHERE idTag = ?");
    const row = stmt.get(idTag);
    return row;
  } catch (err) {
    console.error("Error finding idTag:", err);
    throw err;
  }
}
function findIdTagByChargerId(chargerId) {
  try {
    const stmt = db.prepare("SELECT * FROM idTags WHERE chargerId = ? LIMIT 1");
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
      const stmt = db.prepare(`
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
    const stmt = db.prepare(`
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
    const stmt = db.prepare("DELETE FROM idTags WHERE idTag = ?");
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

// api/idTags/f101_create_idTag.js
var router = import_express.default.Router();
router.post("/idTags", (req, res) => {
  const API_KEY = "neopower_ocpp_key";
  const apiKey = req.headers["neopower-api-key"];
  if (apiKey !== API_KEY) {
    return res.status(403).json({ message: "Forbidden: Invalid API Key" });
  }
  const { idTag, chargerId } = req.body;
  if (!idTag || !chargerId) {
    return res.status(400).json({ message: "idTag and chargerId are required" });
  }
  const existingTag = idTags_default.findIdTag(idTag);
  if (existingTag) {
    return res.status(409).json({ message: "idTag already exists" });
  }
  try {
    idTags_default.saveIdTag(idTag, chargerId);
    res.status(201).json({ message: "idTag created", idTag, chargerId });
  } catch (err) {
    res.status(500).json({ message: "Error saving idTag", error: err.message });
  }
});
var f101_create_idTag_default = router;

// api/idTags/f102_read_idTag.js
var import_express2 = __toESM(require("express"), 1);
var router2 = import_express2.default.Router();
router2.get("/idTags", (req, res) => {
  const API_KEY = "neopower_ocpp_key";
  const apiKey = req.headers["neopower-api-key"];
  if (apiKey !== API_KEY) {
    return res.status(403).json({ message: "Forbidden: Invalid API Key" });
  }
  try {
    const idTags = idTags_default.loadIdTags();
    res.status(200).json({ idTags });
  } catch (err) {
    res.status(500).json({ message: "Error loading idTags", error: err.message });
  }
});
var f102_read_idTag_default = router2;

// api/idTags/f103_update_idTag.js
var import_express3 = __toESM(require("express"), 1);
var router3 = import_express3.default.Router();
router3.put("/idTags/:idTag", (req, res) => {
  const API_KEY = "neopower_ocpp_key";
  const apiKey = req.headers["neopower-api-key"];
  if (apiKey !== API_KEY) {
    return res.status(403).json({ message: "Forbidden: Invalid API Key" });
  }
  const { idTag } = req.params;
  const existingTag = idTags_default.findIdTag(idTag);
  if (!existingTag) {
    return res.status(404).json({ message: "idTag not found" });
  }
  const { status } = req.body;
  try {
    idTags_default.updateIdTagStatus(idTag, status);
    res.status(200).json({ message: "idTag status updated", idTag, status });
  } catch (err) {
    res.status(500).json({ message: "Error updating idTag status", error: err.message });
  }
});
var f103_update_idTag_default = router3;

// api/idTags/f104_delete_idTag.js
var import_express4 = __toESM(require("express"), 1);
var router4 = import_express4.default.Router();
router4.delete("/idTags/:idTag", (req, res) => {
  const API_KEY = "neopower_ocpp_key";
  const apiKey = req.headers["neopower-api-key"];
  if (apiKey !== API_KEY) {
    return res.status(403).json({ message: "Forbidden: Invalid API Key" });
  }
  const { idTag } = req.params;
  const existingTag = idTags_default.findIdTag(idTag);
  if (!existingTag) {
    return res.status(404).json({ message: "idTag not found" });
  }
  try {
    idTags_default.deleteIdTag(idTag);
    res.status(200).json({ message: "idTag deleted", idTag });
  } catch (err) {
    res.status(500).json({ message: "Error deleting idTag", error: err.message });
  }
});
var f104_delete_idTag_default = router4;

// api/ocpp/f001_get_charger_info.js
var import_express5 = __toESM(require("express"), 1);

// controller/clients.js
var clients = [];
var getClients = () => clients;
var initializeClients = () => {
  clients = [];
};
var addClient = (clientObj) => {
  clients.push(clientObj);
};
var removeClient = (identity) => {
  clients = clients.filter((client) => client.identity !== identity);
};

// api/charging/rs485.js
var import_modbus_serial = __toESM(require("modbus-serial"), 1);

// controller/smartMeter.js
var import_better_sqlite32 = __toESM(require("better-sqlite3"), 1);
var import_meta2 = {};
var db2 = new import_better_sqlite32.default(new URL("../sqlite/app.db", import_meta2.url).pathname);
async function getSmartMeters() {
  const stmt = db2.prepare(`SELECT * FROM smartMeters`);
  return stmt.all();
}
async function insertSmartMeter(deviceId, host, port, vendorId) {
  const stmt = db2.prepare(`
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
  const stmt = db2.prepare(`UPDATE smartMeters SET ${setClause} WHERE id = ?`);
  stmt.run(...values, id);
}
async function deleteSmartMeter(id) {
  const stmt = db2.prepare(`
        DELETE FROM smartMeters WHERE id = ?
    `);
  stmt.run(id);
}
async function getSmartMeterById(id) {
  const stmt = db2.prepare(`
        SELECT * FROM smartMeters WHERE id = ?
    `);
  return stmt.get(id);
}
async function getSmartMeterByHost(host) {
  const stmt = db2.prepare(`
        SELECT * FROM smartMeters WHERE host = ?
    `);
  return stmt.get(host);
}
function getAllSmartMeterVendorId() {
  const stmt = db2.prepare(`SELECT DISTINCT vendorId FROM smartMeters`);
  return stmt.all().map((row) => row.vendorId);
}

// controller/maxPower.js
var import_better_sqlite33 = __toESM(require("better-sqlite3"), 1);
var import_meta3 = {};
var db3 = new import_better_sqlite33.default(new URL("../sqlite/app.db", import_meta3.url).pathname);
async function getMaxPower() {
  const stmt = db3.prepare(`SELECT * FROM maxPower`);
  return stmt.all();
}
async function insertMaxPower(vendorId, unit, kw_limit) {
  const stmt = db3.prepare(`INSERT INTO maxPower(vendorId, unit, kw_limit,last_update)
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
  const stmt = db3.prepare(`UPDATE maxPower SET ${setClause} WHERE vendorId = ?`);
  stmt.run(...values, vendorId);
}
async function deleteMaxPower(vendorId) {
  const stmt = db3.prepare(`DELETE FROM maxPower WHERE vendorId = ?`);
  stmt.run(vendorId);
}
async function getMaxPowerByVendorId(vendorId) {
  const stmt = db3.prepare(`SELECT * FROM maxPower WHERE vendorId = ?`);
  return stmt.get(vendorId);
}

// api/charging/rs485.js
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

// controller/chargers.js
var import_better_sqlite34 = __toESM(require("better-sqlite3"), 1);
var import_meta4 = {};
var db4 = new import_better_sqlite34.default(new URL("../sqlite/app.db", import_meta4.url).pathname);
function insertCharger(chargerId) {
  const stmt = db4.prepare(`
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
  const stmt = db4.prepare(sql);
  stmt.run(...values);
}
function getConnectorByChargerId(chargerId) {
  const stmt = db4.prepare(`
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
    const stmt = db4.prepare(sql);
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
    const lastTransactionStmt = db4.prepare(`SELECT MAX(transactionId) AS transactionId FROM transactions`);
    const lastTransaction = lastTransactionStmt.get();
    let transactionId = lastTransaction && lastTransaction.transactionId ? lastTransaction.transactionId + 1 : 1000000001;
    if (transactionId > 1999999999) {
      throw new Error("Transaction ID exceeded the limit of 1999999999");
    }
    const transactionStmt = db4.prepare(`
            INSERT INTO transactions (transactionId, chargerId, connectorId)
            VALUES ( ?, ?, ?)
        `);
    transactionStmt.run(transactionId, chargerId, connectorId);
    console.log(`New transaction created with ID: ${transactionId}`);
    const connectorStmt = db4.prepare(`
            UPDATE connectors
            SET transactionId = ?
            WHERE chargerId = ? AND connectorId = ?
        `);
    const result = connectorStmt.run(transactionId, chargerId, connectorId);
    console.log(`Connector update result:`, result);
    const verifyStmt = db4.prepare(`
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
    const transactionStmt = db4.prepare(`
            UPDATE transactions
            SET start_time = ?
            WHERE transactionId = ?
        `);
    const res = transactionStmt.run(startTime, transactionId);
    if (res.changes > 0) {
    } else {
      console.error(`Failed to update transaction ${transactionId}`);
    }
    const connectorStmt = db4.prepare(`
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
    const verifyStmt = db4.prepare(`
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
    const transactionStmt = db4.prepare(`
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
      const connectorStmt = db4.prepare(`
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
      const connectorStmt = db4.prepare(`
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
  const stmt = db4.prepare(`
        DELETE FROM chargers WHERE chargerId = ?
    `);
  stmt.run(chargerId);
}
function removeConnector(chargerId, connectorId) {
  const stmt = db4.prepare(`
        DELETE FROM connectors WHERE chargerId = ? AND connectorId = ?
    `);
  stmt.run(chargerId, connectorId);
}
function getAllChargers() {
  const stmt = db4.prepare(`
        SELECT * FROM chargers
    `);
  return stmt.all().map((charger) => {
    return Object.fromEntries(Object.entries(charger).filter(([key, value]) => value !== null));
  });
}
function getVendorByChargerId(chargerId) {
  const stmt = db4.prepare(`
        SELECT vendorId
        FROM chargers
        WHERE chargerId = ?
    `);
  const result = stmt.get(chargerId);
  return result ? result.vendorId : null;
}
function checkIfQueueing(chargerId, transactionId) {
  const stmt = db4.prepare(`
        SELECT COUNT(*) AS count
        FROM transactions
        WHERE chargerId = ? AND transactionId = ? AND start_time IS NULL
    `);
  const result = stmt.get(chargerId, transactionId);
  return result && result.count > 0;
}
function getChargerIdByTransactionId(transactionId) {
  const stmt = db4.prepare(`
        SELECT chargerId 
        FROM transactions
        WHERE transactionId = ?
    `);
  const result = stmt.get(transactionId);
  return result ? result.chargerId : null;
}
function getTransactionById(chargerId, connectorId) {
  const stmt = db4.prepare(`
        SELECT transactionId 
        FROM connectors 
        WHERE chargerId = ? 
        AND connectorId = ? 
    `);
  const result = stmt.get(chargerId, connectorId);
  return result ? result.transactionId : null;
}
function getChargerById(chargerId) {
  const stmt = db4.prepare(`
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
  const stmt = db4.prepare(`
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
  const stmt = db4.prepare(`
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

// emit_smartDaily/sendChargingInfo.js
var import_axios = __toESM(require("axios"), 1);
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
    const response2 = await import_axios.default.put(url, body, {
      headers: {
        "Authorization": "Bearer zaxb20C3jlV6dX8Dqvy2CpOvcnU7oqsK6mE4HigH",
        "Content-Type": "application/json"
      }
    });
    console.log("Sending ChargingInfo to smartDaily response status code:", response2.status);
  } catch (error) {
    console.error("Sending ChargingInfo to smartDaily error:", error.response ? error.response.data : error.message);
  }
}

// emit_smartDaily/sendStatusChange.js
var import_axios2 = __toESM(require("axios"), 1);
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
    const response2 = await import_axios2.default.put(url, body, {
      headers: {
        "Authorization": "Bearer zaxb20C3jlV6dX8Dqvy2CpOvcnU7oqsK6mE4HigH",
        "Content-Type": "application/json"
      }
    });
    console.log("Sending statusChange to smartDaily response status code:", response2.status);
  } catch (error) {
    console.error("Sending statusChange to smartDaily error:", error.response ? error.response.data : error.message);
  }
}

// controller/smartMeterPool.js
var import_better_sqlite35 = __toESM(require("better-sqlite3"), 1);
var import_meta5 = {};
var db5 = new import_better_sqlite35.default(new URL("../sqlite/app.db", import_meta5.url).pathname);
function insertSmartMeterPool(chargerId, vendorId, power) {
  const stmt = db5.prepare(`
        INSERT INTO SmartMeterPool (chargerId, vendorId, power)
        VALUES (?, ?, ?)
    `);
  stmt.run(chargerId, vendorId, power);
}
function getSmartMeterPool() {
  const stmt = db5.prepare(`SELECT * FROM SmartMeterPool`);
  return stmt.all();
}
function deleteSmartMeterPool(chargerId) {
  const stmt = db5.prepare(`
        DELETE FROM SmartMeterPool WHERE chargerId = ?
    `);
  stmt.run(chargerId);
}

// controller/charging.js
var import_better_sqlite36 = __toESM(require("better-sqlite3"), 1);
var import_meta6 = {};
var db6 = new import_better_sqlite36.default(new URL("../sqlite/app.db", import_meta6.url).pathname);
function getChargingParameter() {
  const stmt = db6.prepare(`SELECT * FROM charging_parameter`);
  return stmt.all();
}
function createChargingParameter(contract_capacity, smart_meter_num, charging_mode, reserve_value) {
  const stmt = db6.prepare(`
        INSERT INTO charging_parameter (contract_capacity, smart_meter_num, charging_mode, reserve_value)
        VALUES (?, ?, ?, ?)
    `);
  stmt.run(contract_capacity, smart_meter_num, charging_mode, reserve_value);
}
function updateChargingParameter(contract_capacity, smart_meter_num, charging_mode, reserve_value) {
  const stmt = db6.prepare(`
        UPDATE charging_parameter SET contract_capacity = ?, smart_meter_num = ?, charging_mode = ?, reserve_value = ?
    `);
  stmt.run(contract_capacity, smart_meter_num, charging_mode, reserve_value);
}

// controller/OCPPPool.js
var import_better_sqlite37 = __toESM(require("better-sqlite3"), 1);
var import_meta7 = {};
var db7 = new import_better_sqlite37.default(new URL("../sqlite/app.db", import_meta7.url).pathname);
function insertOCPPPool(chargerId) {
  const stmt = db7.prepare(`
        INSERT INTO OCPPPool (chargerId)
        VALUES (?)
    `);
  stmt.run(chargerId);
}
function getOCPPPool() {
  const stmt = db7.prepare(`SELECT * FROM OCPPPool`);
  return stmt.all();
}
function deleteOCPPPool2(chargerId) {
  const stmt = db7.prepare(`
        DELETE FROM OCPPPool WHERE chargerId = ?
    `);
  stmt.run(chargerId);
}

// controller/waitingQueue.js
var import_better_sqlite38 = __toESM(require("better-sqlite3"), 1);
var import_meta8 = {};
var db8 = new import_better_sqlite38.default(new URL("../sqlite/app.db", import_meta8.url).pathname);
function tableExists(tableName) {
  const db9 = new import_better_sqlite38.default("sqlite/app.db");
  const stmt = db9.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name = ?`);
  const result = stmt.get(tableName);
  db9.close();
  return !!result;
}
function getWaitingQueue() {
  const stmt = db8.prepare(`SELECT * FROM waitingQueue`);
  return stmt.all();
}
function insertWaitingQueue(chargerId, isSmartMeter, transactionId) {
  const isSmartMeterInt = isSmartMeter ? "true" : "false";
  const stmt = db8.prepare(`
        INSERT INTO waitingQueue (chargerId, isSmartMeter, transactionId)
        VALUES (?, ?, ?)
    `);
  stmt.run(chargerId, isSmartMeterInt, transactionId);
}
function deleteWaitingQueueByTransactionId(transactionId) {
  const stmt = db8.prepare(`
        DELETE FROM waitingQueue WHERE transactionId = ?
    `);
  stmt.run(transactionId);
}

// api/charging/monitor.js
var import_axios3 = __toESM(require("axios"), 1);
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
    this.apiClient = import_axios3.default.create({
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

// api/ocpp/f001_get_charger_info.js
var router5 = import_express5.default.Router();
router5.post("/getChargerInfo", async (req, res) => {
  const API_KEY = "neopower_ocpp_key";
  const apiKey = req.headers["neopower-api-key"];
  if (apiKey !== API_KEY) {
    return res.status(403).json({ message: "Forbidden: Invalid API Key" });
  }
  const { chargerId, keys } = req.body;
  const keysArray = keys ? keys.split(",") : [];
  const clients2 = getClients();
  if (chargerId) {
    const selectedRs485Client = await rs485Service_default.getRS485Data().find((chargers) => chargers.chargerId === chargerId);
    if (selectedRs485Client) {
      return res.status(409).json({ message: `Charger with ID ${chargerId} is smart meter...` });
    }
    const selectedClient = clients2.find((client) => client.identity === chargerId);
    if (!selectedClient) {
      return res.status(404).json({ message: `Charger with ID ${chargerId} not found` });
    }
    selectedClient.call("GetConfiguration", {
      key: keysArray
      // 使用提供的 keysArray 或空數組
    }).then((response2) => {
      res.status(200).json({ message: "GetChargerInfo command sent", response: response2 });
    }).catch((error) => {
      res.status(500).json({ message: "GetChargerInfo failed", error });
    });
  } else {
    const responses = [];
    const promises = clients2.map(
      (client) => client.call("GetConfiguration", {
        key: keysArray
        // 使用提供的 keysArray 或空數組
      }).then((response2) => {
        responses.push({ chargerId: client.identity, response: response2 });
      }).catch((error) => {
        responses.push({ chargerId: client.identity, error });
      })
    );
    Promise.all(promises).then(() => {
      res.status(200).json({ message: "GetChargerInfo command sent to all chargers", responses });
    }).catch((error) => {
      res.status(500).json({ message: "GetChargerInfo failed", error });
    });
  }
});
var f001_get_charger_info_default = router5;

// api/ocpp/f002_remote_start_charging.js
var import_express6 = __toESM(require("express"), 1);
var router6 = import_express6.default.Router();
router6.post("/remoteStartCharging", async (req, res) => {
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
var f002_remote_start_charging_default = router6;

// api/ocpp/f002_remote_start_charging2.js
var import_express7 = __toESM(require("express"), 1);
var STATUS_CODE_MAP2 = {
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
var router7 = import_express7.default.Router();
router7.post("/remoteStartCharging2", (req, res) => {
  const API_KEY = "neopower_ocpp_key";
  const apiKey = req.headers["neopower-api-key"];
  if (apiKey !== API_KEY) {
    return res.status(403).json({ message: "\u7981\u6B62\u5B58\u53D6: \u7121\u6548\u7684 API Key" });
  }
  const clients2 = getClients();
  const { chargerId, idTag, connectorId, chargingRate, chargingRateUnit } = req.body;
  if (!chargerId || !idTag || !connectorId) {
    return res.status(400).json({ message: "chargerId, connectorId \u548C idTag \u662F\u5FC5\u9700\u7684\u53C3\u6578", received: `${chargerId},${idTag},${connectorId}` });
  }
  let transactionId;
  let client = rs485Service_default.getRS485Data().find((chargers) => chargers.chargerId === chargerId);
  if (client) {
    const currentTime = getCurrentTimestamp();
    const smartMeterId = client.chargerId.match(/\d+$/)[0];
    rs485_default.turnOnRelay(smartMeterId).then(() => {
      chargers_default.startCharging(client.chargerId, 1, currentTime);
      console.log(`Charger ${client.chargerId} successfully started.`);
      const device = rs485Service_default.getRS485RawData().find((item) => item.id == smartMeterId);
      const StatusChange_body = {
        "DeviceId": chargerId,
        "DeviceTime": device.time,
        "ConnectorId": "1",
        "Status": STATUS_CODE_MAP2["Charging"].toString(),
        "ErrorCode": null,
        "VendorErrorCode": null
      };
      sendStatusChange(StatusChange_body);
      transactionId = chargers_default.getTransactionById(client.chargerId, 1);
      const waitingQueue = monitor_default.getQueueingData();
      const waitingData = waitingQueue.find((request) => request.transactionId === transactionId);
      if (waitingData) {
        try {
          console.log(`Removing ${transactionId} from waiting queue...`);
          monitor_default.shiftQueueingData(transactionId);
        } catch (e) {
          console.error("Removing waitingData error : ", e.message);
        }
      }
      rs485Service_default.fetchRS485Data().then(() => {
        console.log("Start charging, updated rs485 status");
      }).catch((err) => {
        console.error("Updated rs485 status error:", err);
      });
    }).catch((error) => {
      console.error("turnOnRelay at startCharging2 error : ", error);
    });
    return;
  } else
    client = clients2.find((c) => c.identity === chargerId);
  if (!client) {
    return res.status(404).json({ message: `\u627E\u4E0D\u5230\u6307\u5B9A\u7684\u5BA2\u6236\u7AEF: ${chargerId}` });
  }
  const remoteStartParams = {
    connectorId,
    idTag
  };
  transactionId = chargers_default.getTransactionById(client.identity, 1);
  const vendorId = chargers_default.getVendorByChargerId(client.identity);
  if (chargingRate) {
    if (vendorId == "Zerova") {
      console.log("start 1 ");
      remoteStartParams.chargingProfile = {
        chargingProfileId: 1,
        transactionId,
        stackLevel: 0,
        // 配置的優先級
        chargingProfilePurpose: "TxProfile",
        // 交易配置
        chargingProfileKind: "Absolute",
        // 注意都不行帶startSchedule
        validFrom: (/* @__PURE__ */ new Date()).toISOString(),
        // 從現在開始生效
        chargingSchedule: {
          duration: 3600,
          // 持續一小時
          // startSchedule: new Date().toISOString(),
          chargingRateUnit,
          // 單位
          chargingSchedulePeriod: [
            {
              startPeriod: 0,
              // 開始時間
              limit: chargingRate,
              // 充電速率
              numberPhases: 1
            }
          ]
        }
      };
    } else {
      console.log("start 2 ");
      remoteStartParams.chargingProfile = {
        chargingProfileId: 1,
        transactionId,
        stackLevel: 0,
        // 配置的優先級
        chargingProfilePurpose: "TxProfile",
        // 交易配置
        chargingProfileKind: "Absolute",
        // 
        validFrom: (/* @__PURE__ */ new Date()).toISOString(),
        // 從現在開始生效
        chargingSchedule: {
          duration: 3600,
          // 持續一小時
          startSchedule: (/* @__PURE__ */ new Date()).toISOString(),
          //正常Absolute都需要帶此欄位，代表現在開始使用此計畫
          chargingRateUnit,
          // 單位
          chargingSchedulePeriod: [
            {
              startPeriod: 0,
              // 開始時間
              limit: chargingRate,
              // 充電速率
              numberPhases: 1
            }
          ]
        }
      };
    }
  }
  console.log("RemoteStartTransaction request params : ", JSON.stringify(remoteStartParams, null, 2));
  client.call("RemoteStartTransaction", remoteStartParams).then(async (response2) => {
    console.log("RemoteStartTransactionResponse \u6536\u5230:", response2);
    if (response2.status == "Accepted") {
      const waitingQueue = monitor_default.getQueueingData();
      const waitingData = waitingQueue.find((request) => request.transactionId === transactionId);
      if (waitingData) {
        try {
          monitor_default.shiftQueueingData(transactionId);
        } catch (e) {
          console.error("Removing waitingData error : ", e.message);
        }
      }
    }
  }).catch((error) => {
    console.error("RemoteStartTransaction \u5931\u6557:", error);
    res.status(500).json({ message: "\u555F\u52D5\u5145\u96FB\u5931\u6557", error });
  });
});
var f002_remote_start_charging2_default = router7;

// api/ocpp/f003_remote_stop_charging.js
var import_express8 = __toESM(require("express"), 1);
var STATUS_CODE_MAP3 = {
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
function convertToTimezoneUTC84(utcDateString) {
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
var router8 = import_express8.default.Router();
router8.post("/remoteStopCharging", (req, res) => {
  const API_KEY = "neopower_ocpp_key";
  const apiKey = req.headers["neopower-api-key"];
  if (apiKey !== API_KEY) {
    return res.status(403).json({ message: "Forbidden: Invalid API Key" });
  }
  const { transactionId } = req.body;
  if (!transactionId) {
    return res.status(400).json({ message: "transactionId is required" });
  }
  const chargerId = chargers_default.getChargerIdByTransactionId(transactionId);
  if (!chargerId) {
    return res.status(404).json({ message: "Can not find the client to stop transaction" });
  }
  const waitingQueue = monitor_default.getQueueingData();
  const waitingData = waitingQueue.find((request) => request.transactionId === transactionId);
  if (waitingData) {
    try {
      const removeRes = monitor_default.shiftQueueingData(transactionId);
      if (removeRes.status === "success") {
        chargers_default.upsertConnector({
          chargerId,
          connectorId: 1,
          status: "Preparing",
          transactionId: null
        });
        const StatusChange_body = {
          "DeviceId": chargerId,
          "DeviceTime": convertToTimezoneUTC84((/* @__PURE__ */ new Date()).toISOString()),
          "ConnectorId": "1",
          "Status": STATUS_CODE_MAP3["Preparing"].toString(),
          "ErrorCode": null,
          "VendorErrorCode": null
        };
        sendStatusChange(StatusChange_body);
        return res.status(200).json({
          message: "StopCharging command sent, removed from waiting queue...",
          response: { status: "Accepted" }
        });
      }
    } catch (e) {
      return res.status(500).json({ message: "Stop charging command sent failed", error: e.message });
    }
  }
  const currentTime = getCurrentTimestamp();
  const clients2 = getClients();
  let stopClient;
  const vendorId = chargers_default.getVendorByChargerId(chargerId);
  const smartMeterVendorId = getAllSmartMeterVendorId();
  if (smartMeterVendorId.includes(vendorId)) {
    const smartMeterId = chargerId.match(/\d+$/)[0];
    rs485_default.turnOffRelay(smartMeterId);
    chargers_default.stopCharging(transactionId, currentTime);
    const StatusChange_body = {
      "DeviceId": chargerId,
      "DeviceTime": convertToTimezoneUTC84((/* @__PURE__ */ new Date()).toISOString()),
      "ConnectorId": "1",
      "Status": STATUS_CODE_MAP3["Preparing"].toString(),
      "ErrorCode": null,
      "VendorErrorCode": null
    };
    monitor_default.smartMeterPool.splice(monitor_default.smartMeterPool.findIndex((item) => item.chargerId === chargerId), 1);
    deleteSmartMeterPool(chargerId);
    sendStatusChange(StatusChange_body);
    rs485Service_default.fetchRS485Data().then(() => {
      console.log("Stop charging, updated rs485 status");
    }).catch((err) => {
      console.error("Updated rs485 status error:", err);
    });
    return res.status(200).json({
      message: "StopCharging command sent",
      response: { status: "Accepted" }
    });
  } else {
    clients2.forEach((client) => {
      for (const connId in client.connectors) {
        if (client.connectors[connId].transactionId == transactionId) {
          stopClient = client;
          break;
        }
      }
    });
    if (!stopClient) {
      return res.status(404).json({ message: "Can not find the client to stop transaction" });
    }
    stopClient.call("RemoteStopTransaction", {
      transactionId
    }).then((response2) => {
      if (response2.status == "Accepted") {
        monitor_default.removeOcppControlByChargerId(stopClient.identity);
        deleteOCPPPool2(stopClient.identity);
      }
      res.status(200).json({ message: "StopCharging command sent", response: response2 });
    }).catch((error) => {
      res.status(500).json({ message: "StopCharging command sent failed", error });
    });
  }
});
var f003_remote_stop_charging_default = router8;

// api/ocpp/f004_set_charging_profile.js
var import_express9 = __toESM(require("express"), 1);
var router9 = import_express9.default.Router();
router9.post("/setChargingProfile", (req, res) => {
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
    }).then((response2) => {
      console.log("SetChargingProfileResponse received:", response2);
      if (response2.status === "Rejected") {
        if (!monitor_default.smartMeterPool.find((item) => item.chargerId === chargerId)) {
          const connector = chargers_default.getConnectorByChargerId(chargerId);
          monitor_default.smartMeterPool.push({
            chargerId,
            limit: connector[0].power
          });
          monitor_default.removeOcppControlByChargerId(chargerId);
        }
      }
      res.status(200).json({ message: "SetChargingProfile command sent", response: response2 });
    }).catch((error) => {
      console.error("SetChargingProfile failed:", error);
      res.status(500).json({ message: "SetChargingProfile failed", error });
    });
  } catch (error) {
    console.error("SetChargingProfile failed:", error);
    res.status(500).json({ message: "SetChargingProfile failed", error });
  }
});
var f004_set_charging_profile_default = router9;

// api/ocpp/f005_set_charger_info.js
var import_express10 = __toESM(require("express"), 1);
var router10 = import_express10.default.Router();
router10.post("/set_charger_info", (req, res) => {
  const API_KEY = "neopower_ocpp_key";
  const apiKey = req.headers["neopower-api-key"];
  if (apiKey !== API_KEY) {
    return res.status(403).json({ message: "Forbidden: Invalid API Key" });
  }
  const clients2 = getClients();
  const { chargerId, key, value } = req.body;
  if (!key || !value) {
    return res.status(400).json({ message: "Both key and value must be provided" });
  }
  if (chargerId) {
    const selectedClient = clients2.find((client) => client.identity === chargerId);
    if (!selectedClient) {
      return res.status(404).json({ message: `Charger with ID ${chargerId} not found` });
    }
    selectedClient.call("ChangeConfiguration", { key, value }).then((response2) => {
      console.log("ChangeConfigurationResponse received:", response2);
      res.json({ message: "ChangeConfiguration command sent", response: response2 });
    }).catch((error) => {
      console.error("ChangeConfiguration failed:", error);
      res.status(500).json({ message: "ChangeConfiguration failed", error });
    });
  } else {
    const responses = [];
    const promises = clients2.map((client) => {
      return client.call("ChangeConfiguration", { key, value }).then((response2) => {
        console.log("ChangeConfigurationResponse received:", response2);
        responses.push({ clientId: client.identity, response: response2 });
      }).catch((error) => {
        console.error("ChangeConfiguration failed:", error);
        responses.push({ clientId: client.identity, error });
      });
    });
    Promise.all(promises).then(() => {
      res.json({
        message: "ChangeConfiguration command sent to all chargers",
        responses
      });
    }).catch((error) => {
      res.status(500).json({
        message: "ChangeConfiguration failed for one or more chargers",
        error
      });
    });
  }
});
var f005_set_charger_info_default = router10;

// api/ocpp/f105_get_all_client_withRs485.js
var import_express11 = __toESM(require("express"), 1);
var router11 = import_express11.default.Router();
var STATUS_CODE_MAP4 = {
  "Available": 0,
  "Preparing": 1,
  "Charging": 2,
  "Finishing": 3,
  "Unavailable": 4,
  "Faulted": 5,
  "Offline": 6,
  "SuspendedEVSE": 7,
  "SuspendedEV": 8,
  "Reserved": 9
};
router11.post("/getAllClient", async (req, res) => {
  const API_KEY = "neopower_ocpp_key";
  const apiKey = req.headers["neopower-api-key"];
  if (apiKey !== API_KEY) {
    return res.status(403).json({ message: "Forbidden: Invalid API Key" });
  }
  try {
    let chargers = chargers_default.getChargerWithConnectors();
    const clients2 = getClients();
    let formattedChargers = [];
    if (chargers.length) {
      chargers = chargers.filter(
        (charger) => clients2.some((client) => client.identity === charger.chargerId)
      );
      formattedChargers = chargers.reduce((acc, row) => {
        const {
          chargerId,
          vendorId,
          connectorId,
          status: connectorStatus,
          transactionId,
          voltage,
          current,
          WH,
          power,
          soc
        } = row;
        let charger = acc.find((item) => item.chargerId === chargerId);
        if (!charger) {
          charger = {
            chargerId,
            vendorId,
            connectors: []
          };
          acc.push(charger);
        }
        if (connectorId) {
          const statusCode = STATUS_CODE_MAP4[connectorStatus] ?? -1;
          const connectorInfo = {
            connectorId,
            status_code: statusCode,
            transactionId,
            voltage,
            current,
            WH,
            power,
            soc
          };
          const filteredConnectorInfo = Object.fromEntries(
            Object.entries(connectorInfo).filter(([_, value]) => value != null)
          );
          charger.connectors.push(filteredConnectorInfo);
        }
        return acc;
      }, []);
    }
    const rs485Raw = rs485Service_default.getRS485Data();
    const formattedRs485 = rs485Raw.map((data) => {
      const connectors = data.connectors && data.connectors.length > 0 ? data.connectors.map((connector) => {
        const formattedConnector = {};
        if (connector.connectorId != null) formattedConnector.connectorId = connector.connectorId;
        if (connector.status != null) formattedConnector.status_code = STATUS_CODE_MAP4[connector.status] ?? -1;
        if (connector.transactionId != null) formattedConnector.transactionId = connector.transactionId;
        if (connector.voltage != null) formattedConnector.voltage = connector.voltage;
        if (connector.current != null) formattedConnector.current = connector.current;
        if (connector.power != null) formattedConnector.power = connector.power;
        return formattedConnector;
      }) : [];
      return {
        chargerId: data.chargerId,
        vendorId: data.vendorId,
        connectors
        // 只有在 connectors 有資料時才加上 connectors
      };
    });
    formattedRs485.forEach((rs485Item) => {
      let charger = formattedChargers.find((item) => item.chargerId === rs485Item.chargerId);
      if (charger) {
        charger.connectors.push(...rs485Item.connectors);
      } else {
        formattedChargers.push(rs485Item);
      }
    });
    if (!formattedChargers.length) {
      return res.status(200).json({ message: "There is no charging station connected..." });
    }
    res.status(200).json(formattedChargers);
  } catch (err) {
    res.status(500).json({ message: "Can not get all client information", error: err.message });
  }
});
var f105_get_all_client_withRs485_default = router11;

// api/ocpp/f006_getCompositeSchedule.js
var import_express12 = __toESM(require("express"), 1);
var router12 = import_express12.default.Router();
router12.post("/getCompositeSchedule", (req, res) => {
  const API_KEY = "neopower_ocpp_key";
  const apiKey = req.headers["neopower-api-key"];
  if (apiKey !== API_KEY) {
    return res.status(403).json({ message: "Forbidden: Invalid API Key" });
  }
  const clients2 = getClients();
  const { chargerId, connectorId, duration, chargingRateUnit } = req.body;
  if (chargerId && connectorId !== void 0 && duration && chargingRateUnit) {
    const selectedClient = clients2.find((client) => client.identity === chargerId);
    if (!selectedClient) {
      return res.status(404).json({ message: `Charger with ID ${chargerId} not found` });
    }
    selectedClient.call("GetCompositeSchedule", {
      connectorId,
      // 指定查詢的 connectorId
      chargingRateUnit,
      // 使用查詢的單位
      duration
      // 設定查詢的持續時間（例如 1 小時）
    }).then((response2) => {
      console.log("GetCompositeScheduleResponse received:", response2);
      res.json({ message: "GetCompositeSchedule command sent", response: response2 });
    }).catch((error) => {
      console.error("GetCompositeSchedule failed:", error);
      res.status(500).json({ message: "GetCompositeSchedule failed", error });
    });
  } else {
    return res.status(400).json({ message: "Missing required parameters (chargerId, connectorId, duration, or chargingRateUnit)" });
  }
});
var f006_getCompositeSchedule_default = router12;

// api/charging/chargingParameter.js
var import_express13 = __toESM(require("express"), 1);
var router13 = import_express13.default.Router();
router13.get("/chargingParameter", (req, res) => {
  const API_KEY = "neopower_ocpp_key";
  const apiKey = req.headers["neopower-api-key"];
  if (apiKey !== API_KEY) {
    return res.status(403).json({ message: "Forbidden: Invalid API Key" });
  }
  try {
    const chargingParameter = getChargingParameter()[0];
    if (!chargingParameter) {
      return res.status(404).json({
        message: "Charging parameter not exists"
      });
    }
    res.status(200).json({
      message: "Charging parameter retrieved successfully",
      data: chargingParameter
    });
  } catch (err) {
    res.status(500).json({
      message: "Error retrieving charging parameter",
      error: err.message
    });
  }
});
router13.post("/chargingParameter", (req, res) => {
  const API_KEY = "neopower_ocpp_key";
  const apiKey = req.headers["neopower-api-key"];
  if (apiKey !== API_KEY) {
    return res.status(403).json({ message: "Forbidden: Invalid API Key" });
  }
  const { contract_capacity, smart_meter_num, charging_mode, reserve_value } = req.body;
  if (!contract_capacity || !smart_meter_num || !charging_mode || !reserve_value) {
    return res.status(400).json({ message: "contract_capacity, smart_meter_num, charging_mode, reserve_value are required" });
  }
  try {
    const chargingParameter = getChargingParameter()[0];
    if (chargingParameter) {
      updateChargingParameter(contract_capacity, smart_meter_num, charging_mode, reserve_value);
      res.status(200).json({ message: "Charging parameter updated successfully" });
    } else {
      createChargingParameter(contract_capacity, smart_meter_num, charging_mode, reserve_value);
      res.status(201).json({ message: "Charging parameter created successfully" });
    }
  } catch (err) {
    res.status(500).json({
      message: "Error creating charging parameter",
      error: err.message
    });
  }
});
var chargingParameter_default = router13;

// api/charging/getWaitingQueue.js
var import_express14 = __toESM(require("express"), 1);
var router14 = import_express14.default.Router();
router14.get("/getWaitingQueue", (req, res) => {
  const API_KEY = "neopower_ocpp_key";
  const apiKey = req.headers["neopower-api-key"];
  if (apiKey !== API_KEY) {
    return res.status(403).json({ message: "Forbidden: Invalid API Key" });
  }
  try {
    const waitingQueue = monitor_default.waitingQueue;
    if (!waitingQueue || waitingQueue.length === 0) {
      return res.status(200).json({ message: "Waiting queue is empty..." });
    }
    res.status(200).json({ message: "Waiting queue retrieved successfully", data: waitingQueue });
  } catch (err) {
    res.status(500).json({ message: "Error retrieving waiting queue", error: err.message });
  }
});
var getWaitingQueue_default = router14;

// api/charging/smartMeter.js
var import_express15 = __toESM(require("express"), 1);
var router15 = import_express15.default.Router();
router15.get("/smartMeter", async (req, res) => {
  const API_KEY = "neopower_ocpp_key";
  const apiKey = req.headers["neopower-api-key"];
  if (apiKey !== API_KEY) {
    return res.status(403).json({ message: "Forbidden: Invalid API Key" });
  }
  try {
    const smartMeters = await getSmartMeters();
    res.status(200).json({ message: "Smart meter retrieved successfully", data: smartMeters });
  } catch (err) {
    res.status(500).json({ message: "Error retrieving smart meters", error: err.message });
  }
});
router15.post("/smartMeter", async (req, res) => {
  const API_KEY = "neopower_ocpp_key";
  const apiKey = req.headers["neopower-api-key"];
  if (apiKey !== API_KEY) {
    return res.status(403).json({ message: "Forbidden: Invalid API Key" });
  }
  const { deviceId, host, port, vendorId } = req.body;
  if (!deviceId || !host || !port || !vendorId) {
    return res.status(400).json({ message: "deviceId, host, port, vendorId are required" });
  }
  const existingSmartMeter = await getSmartMeterByHost(host);
  if (existingSmartMeter) {
    return res.status(409).json({ message: "Smart meter host already exists" });
  }
  try {
    await insertSmartMeter(deviceId, host, port, vendorId);
    res.status(201).json({ message: "Smart meter created successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error creating smart meter", error: err.message });
  }
});
router15.put("/smartMeter/:id", async (req, res) => {
  const API_KEY = "neopower_ocpp_key";
  const apiKey = req.headers["neopower-api-key"];
  if (apiKey !== API_KEY) {
    return res.status(403).json({ message: "Forbidden: Invalid API Key" });
  }
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: "id is required" });
  }
  const body = req.body;
  if (Object.keys(body).length === 0) {
    return res.status(400).json({ message: "body is required" });
  }
  const existingSmartMeter = await getSmartMeterById(id);
  if (!existingSmartMeter) {
    return res.status(404).json({ message: "Smart meter id not found" });
  }
  try {
    await updateSmartMeter(id, body);
    res.status(200).json({ message: "Smart meter updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error updating smart meter", error: err.message });
  }
});
router15.delete("/smartMeter/:id", async (req, res) => {
  const API_KEY = "neopower_ocpp_key";
  const apiKey = req.headers["neopower-api-key"];
  if (apiKey !== API_KEY) {
    return res.status(403).json({ message: "Forbidden: Invalid API Key" });
  }
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: "id is required" });
  }
  const existingSmartMeter = await getSmartMeterById(id);
  if (!existingSmartMeter) {
    return res.status(404).json({ message: "Smart meter id not found" });
  }
  try {
    await deleteSmartMeter(id);
    res.status(200).json({ message: "Smart meter deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting smart meter", error: err.message });
  }
});
router15.put("/smartMeter/isOpen/:params", async (req, res) => {
  let { params } = req.params;
  if (params != 0 && params != 1) {
    return res.status(400).json({ message: "params must be 0 or 1" });
  }
  if (params == 1) {
    params = true;
    rs485Service_default.setIsOpen(params);
    res.status(200).json({ message: "Smart meter is Open successfully" });
  }
  if (params == 0) {
    params = false;
    rs485Service_default.setIsOpen(params);
    res.status(200).json({ message: "Smart meter is Close successfully" });
  }
});
var smartMeter_default = router15;

// api/charging/maxPower.js
var import_express16 = __toESM(require("express"), 1);
var router16 = import_express16.default.Router();
router16.get("/maxPower", async (req, res) => {
  const API_KEY = "neopower_ocpp_key";
  const apiKey = req.headers["neopower-api-key"];
  if (apiKey !== API_KEY) {
    return res.status(403).json({ message: "Forbidden: Invalid API Key" });
  }
  try {
    const maxpower = await getMaxPower();
    res.status(200).json({ message: "maxpower retrieved successfully", data: maxpower });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving maxpower", error: error.message });
  }
});
router16.post("/maxPower", async (req, res) => {
  const API_KEY = "neopower_ocpp_key";
  const apiKey = req.headers["neopower-api-key"];
  if (apiKey !== API_KEY) {
    return res.status(403).json({ message: "Forbidden: Invalid API Key" });
  }
  const { vendorId, unit, kw_limit } = req.body;
  if (!vendorId || !unit || !kw_limit) {
    return res.status(400).json({ message: "vendorId, unit, kw_limit are required" });
  }
  if (unit != "W" && unit != "A") {
    return res.status(400).json({ message: "unit must be W or A" });
  }
  if (kw_limit < 0 || kw_limit > 10) {
    return res.status(400).json({ message: "kw_limit must be between 0 and 10kw" });
  }
  const existingMaxPower = await getMaxPowerByVendorId(vendorId);
  if (existingMaxPower) {
    return res.status(409).json({ message: `${vendorId}'s maxpower already exists` });
  }
  try {
    await insertMaxPower(vendorId, unit, kw_limit);
    res.status(201).json({ message: "maxpower created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error creating maxpower", error: error.message });
  }
});
router16.put("/maxPower/:vendorId", async (req, res) => {
  const API_KEY = "neopower_ocpp_key";
  const apiKey = req.headers["neopower-api-key"];
  if (apiKey !== API_KEY) {
    return res.status(403).json({ message: "Forbidden: Invalid API Key" });
  }
  const { vendorId } = req.params;
  if (!vendorId) {
    return res.status(400).json({ message: "vendorId is required" });
  }
  const body = req.body;
  if (Object.keys(body).length === 0) {
    return res.status(400).json({ message: "body is required" });
  }
  const existingMaxPower = await getMaxPowerByVendorId(vendorId);
  if (!existingMaxPower) {
    return res.status(404).json({ message: "maxpower vendorId not found" });
  }
  try {
    await updateMaxPower(vendorId, body);
    res.status(200).json({ message: "maxpower updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating maxpower", error: error.message });
  }
});
router16.delete("/maxPower/:vendorId", async (req, res) => {
  const API_KEY = "neopower_ocpp_key";
  const apiKey = req.headers["neopower-api-key"];
  if (apiKey !== API_KEY) {
    return res.status(403).json({ message: "Forbidden: Invalid API Key" });
  }
  const { vendorId } = req.params;
  if (!vendorId) {
    return res.status(400).json({ message: "vendorId is required" });
  }
  const existingMaxPower = await getMaxPowerByVendorId(vendorId);
  if (!existingMaxPower) {
    return res.status(404).json({ message: "maxpower vendorId not found" });
  }
  try {
    await deleteMaxPower(vendorId);
    res.status(200).json({ message: "maxpower deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting maxpower", error: error.message });
  }
});
var maxPower_default = router16;

// routes.js
var router17 = import_express17.default.Router();
router17.use("/", f101_create_idTag_default);
router17.use("/", f102_read_idTag_default);
router17.use("/", f103_update_idTag_default);
router17.use("/", f104_delete_idTag_default);
router17.use("/", f001_get_charger_info_default);
router17.use("/", f002_remote_start_charging_default);
router17.use("/", f002_remote_start_charging2_default);
router17.use("/", f003_remote_stop_charging_default);
router17.use("/", f004_set_charging_profile_default);
router17.use("/", f005_set_charger_info_default);
router17.use("/", f105_get_all_client_withRs485_default);
router17.use("/", f006_getCompositeSchedule_default);
router17.use("/", chargingParameter_default);
router17.use("/", getWaitingQueue_default);
router17.use("/", smartMeter_default);
router17.use("/", maxPower_default);
var routes_default = router17;

// utils/callClients.js
var call_connecting_clients = () => {
  const clients2 = getClients();
  const timestamp2 = /* @__PURE__ */ new Date();
  const utc8Timestamp = new Date(timestamp2.getTime() + 8 * 60 * 60 * 1e3).toISOString().replace("T", " ").replace("Z", "");
  console.log("Connecting clients:");
  if (!clients2.length) {
    console.log("no client connecting...");
  } else {
    clients2.forEach((client) => {
      console.log(`Client Identity: ${client.identity}`);
      try {
        if (client.connectors) {
          Object.keys(client.connectors).forEach((connectorId) => {
            if (connectorId === "0") return;
            const connector = client.connectors[connectorId];
            console.log(`  Connector ID: ${connectorId}`);
            console.log(`    Status: ${connector.status}`);
            if (connector.transactionId !== null && connector.transactionId !== void 0) {
              console.log(`    Transaction ID: ${connector.transactionId}`);
            } else {
              console.log(`    No active transaction`);
            }
          });
        } else {
          console.log(`  No connectors found for this client.`);
        }
      } catch (error) {
        console.error("callClients error : ", error.message);
      }
    });
  }
};
var callClients_default = call_connecting_clients;

// utils/logger.js
var import_winston = __toESM(require("winston"), 1);
var import_winston_daily_rotate_file = __toESM(require("winston-daily-rotate-file"), 1);
var import_util = __toESM(require("util"), 1);
var { createLogger, format, transports } = import_winston.default;
var { combine, timestamp, json } = format;
var pileLogger = createLogger({
  level: "info",
  transports: [
    new import_winston_daily_rotate_file.default({
      level: "info",
      filename: "./logs/pileInfo/%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxFiles: "365d",
      maxSize: "10m",
      zippedArchive: true,
      format: combine(
        timestamp({
          format: () => (/* @__PURE__ */ new Date()).toLocaleString("zh-TW", {
            timeZone: "Asia/Taipei",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false
          }).replace(/\//g, "-")
        }),
        json()
      )
    })
  ]
});
var consoleLogger = createLogger({
  level: "info",
  transports: [
    new import_winston_daily_rotate_file.default({
      filename: "./logs/console/%DATE%.log",
      datePattern: "YYYY-MM-DD",
      level: "info",
      maxFiles: "365d",
      maxSize: "10m",
      zippedArchive: true,
      format: format.combine(
        format.timestamp({
          format: () => (/* @__PURE__ */ new Date()).toLocaleString("zh-TW", {
            timeZone: "Asia/Taipei",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false
          }).replace(/\//g, "-")
        }),
        format.printf(({ level, message, timestamp: timestamp2 }) => {
          if (level === "info") {
            return `[${timestamp2}] ${message}`;
          } else if (level === "error") {
            return `[${timestamp2}] ${message}`;
          } else {
            return `[${timestamp2}] ${message}`;
          }
        })
      )
    }),
    new import_winston_daily_rotate_file.default({
      filename: "./logs/error/%DATE%.log",
      datePattern: "YYYY-MM-DD",
      level: "error",
      maxFiles: "365d",
      maxSize: "10m",
      zippedArchive: true,
      format: format.combine(
        format.timestamp({
          format: () => (/* @__PURE__ */ new Date()).toLocaleString("zh-TW", {
            timeZone: "Asia/Taipei",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false
          }).replace(/\//g, "-")
        }),
        format.printf(({ level, message, timestamp: timestamp2 }) => {
          if (level === "info") {
            return `[${timestamp2}] ${message}`;
          } else if (level === "error") {
            return `[${timestamp2}] ${message}`;
          } else {
            return `[${timestamp2}] ${message}`;
          }
        })
      )
    }),
    new transports.Console({
      format: format.combine(
        format.timestamp({
          format: () => (/* @__PURE__ */ new Date()).toLocaleString("zh-TW", {
            timeZone: "Asia/Taipei",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false
          }).replace(/\//g, "-")
        }),
        format.printf(({ level, message }) => {
          if (level === "info") {
            return `\x1B[37m${message}\x1B[0m`;
          } else if (level === "error") {
            return `\x1B[31m${message}\x1B[0m`;
          } else {
            return message;
          }
        })
      )
    })
  ]
});
console.log = (...args) => {
  const msg = args.map(
    (arg) => typeof arg === "object" ? import_util.default.inspect(arg, { depth: null }) : arg
  ).join(" ");
  consoleLogger.info(msg);
};
console.error = (...args) => {
  const msg = args.map(
    (arg) => typeof arg === "object" ? import_util.default.inspect(arg, { depth: null }) : arg
  ).join(" ");
  consoleLogger.error(msg);
};
var logger_default = pileLogger;

// emit_smartDaily/sendAlert.js
var import_axios4 = __toESM(require("axios"), 1);
function generateUUID3() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === "x" ? r : r & 3 | 8;
    return v.toString(16);
  });
}
function convertToTimezoneUTC85(utcDateString) {
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
async function sendAlert({ DeviceId, DeviceTime, ConnectorId, AlertType, AlertData }) {
  const RequestId = generateUUID3();
  const date = /* @__PURE__ */ new Date();
  const RequestTime = convertToTimezoneUTC85(date);
  const body = {
    DeviceId,
    RequestId,
    RequestTime,
    DeviceTime,
    ConnectorId,
    AlertType,
    AlertData
  };
  console.log("Send alert to smartDaily : ", body);
  const url = "http://localhost:30080/api/v1/EvCharging/Event/Alert";
  try {
    const response2 = await import_axios4.default.put(url, body, {
      headers: {
        "Authorization": "Bearer zaxb20C3jlV6dX8Dqvy2CpOvcnU7oqsK6mE4HigH",
        "Content-Type": "application/json"
      }
    });
    console.log("Sending Alert to smartDaily response status code:", response2.status);
  } catch (error) {
    console.error("Sending Alert to smartDaily error:", error.response ? error.response.data : error.message);
  }
}

// sqlite/init.js
var import_better_sqlite39 = __toESM(require("better-sqlite3"), 1);
function initDb() {
  const db9 = new import_better_sqlite39.default("sqlite/app.db");
  db9.exec(`
    CREATE TABLE IF NOT EXISTS chargers (
      chargerId TEXT PRIMARY KEY,
      vendorId TEXT DEFAULT 'unknown'
    );
  `);
  db9.exec(`
    CREATE TABLE IF NOT EXISTS connectors (
      chargerId TEXT,
      connectorId INTEGER,
      voltage REAL,
      current REAL,
      power REAL,
      WH REAL,
      soc REAL,
      transactionId INTEGER,
      last_update_time DATETIME,
      status TEXT DEFAULT 'Unknown',
      PRIMARY KEY (chargerId, connectorId),
      FOREIGN KEY (chargerId) REFERENCES chargers(chargerId) ON DELETE CASCADE
    );
  `);
  db9.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
        transactionId INTEGER PRIMARY KEY,
        chargerId TEXT NOT NULL,
        connectorId INTEGER NOT NULL,
        start_time DATETIME,
        stop_time DATETIME,
        meterStart REAL,
        meterStop REAL,
        totalEnergyUsed REAL,
        chargingDuration TEXT
    );
  `);
  db9.exec(`
    CREATE TABLE IF NOT EXISTS idTags (
      idTag TEXT PRIMARY KEY,
      chargerId TEXT,
      created_at DATETIME 
    );
  `);
  db9.exec(`
    CREATE TABLE IF NOT EXISTS charging_parameter (
      contract_capacity REAL,
      smart_meter_num INTEGER,
      charging_mode INTEGER,
      reserve_value INTEGER
    );
  `);
  db9.exec(`
    CREATE TABLE IF NOT EXISTS smartMeters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      deviceId INTEGER,
      host TEXT,
      port INTEGER UNIQUE,
      vendorId TEXT,
      last_update DATETIME 
    );
  `);
  db9.exec(`
    CREATE TABLE IF NOT EXISTS maxPower(
      vendorId TEXT,
      unit TEXT,
      kw_limit REAL,
      last_update DATETIME 
    );
  `);
  db9.exec(`
    CREATE TABLE IF NOT EXISTS waitingQueue (
      chargerId TEXT,
      isSmartMeter TEXT,
      transactionId INTEGER
    );
  `);
  db9.exec(`
    CREATE TABLE IF NOT EXISTS OCPPPool (
      chargerId TEXT
    );
  `);
  db9.exec(`
    CREATE TABLE IF NOT EXISTS SmartMeterPool (
      chargerId TEXT,
      vendorId TEXT,
      power REAL
    );
  `);
  db9.close();
}

// server.js
var import_meta10 = {};
var __dirname = import_path.default.dirname(new URL(import_meta10.url).pathname);
var server = new import_ocpp_rpc.RPCServer({
  protocols: ["ocpp1.6"],
  callTimeoutMs: 1e3 * 30,
  pingIntervalMs: 1e3 * 30,
  strictMode: true
});
initializeClients();
var app = (0, import_express18.default)();
app.use(import_express18.default.json());
app.use("/ocppAPI", routes_default);
app.use("/ocpp", import_express18.default.static(import_path.default.join(__dirname, "public")));
function getCurrentTimeFormatted() {
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
var STATUS_CODE_MAP5 = {
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
function convertToTimezoneUTC86(utcDateString) {
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
server.on("client", (client) => {
  console.log(`Client connected: ${client.identity}`);
  client.handle(async (message) => {
    const loggerMessage = {
      "client": client.identity,
      "method": message.method,
      "params": message.params
    };
    logger_default.info(loggerMessage);
    if (!client.connectors) client.connectors = {};
    const idTagsList = idTags_default.loadIdTags();
    const currentTime = getCurrentTimeFormatted();
    if (message.method) {
      const { messageId, method: action, params: payload, reply } = message;
      console.log(`Received method from ${client.identity} :`, action);
      if (!chargers_default.getChargerById(client.identity))
        chargers_default.insertCharger(client.identity);
      try {
        let result;
        switch (action) {
          case "BootNotification":
            result = {
              status: "Accepted",
              currentTime: (/* @__PURE__ */ new Date()).toISOString(),
              interval: 30
              // 設定為每30秒傳送一次
            };
            break;
          case "Heartbeat":
            if (!client || !client.connectors || Object.keys(client.connectors).length === 0) {
              let charger = chargers_default.getChargerWithConnectorsById(client.identity);
              const connectorIds = charger.map((row) => row.connectorId);
              try {
                connectorIds.forEach((connectorId2) => {
                  const triggerMessagePayload = {
                    requestedMessage: "StatusNotification",
                    connectorId: connectorId2
                  };
                  client.call("TriggerMessage", triggerMessagePayload).then((response2) => {
                    console.log(`TriggerMessage \u56DE\u61C9\uFF08Connector ${connectorId2}\uFF09\uFF1A`, response2);
                  }).catch((error) => {
                    console.error(`TriggerMessage \u5931\u6557\uFF08Connector ${connectorId2}\uFF09\uFF1A`, error);
                  });
                });
              } catch (e) {
                console.log("triggerMessage \u932F\u8AA4\uFF1A", e.message);
              }
            }
            result = {
              currentTime: (/* @__PURE__ */ new Date()).toISOString()
            };
            break;
          case "Authorize":
            console.log("Authorize triggered!");
            console.log("payload.idTag:", payload.idTag);
            if (!payload.idTag || payload.idTag.trim() === "") {
              result = {
                idTagInfo: {
                  status: "Invalid"
                }
              };
              console.log("Empty or invalid idTag received.");
              break;
            }
            const foundIdTag = idTagsList.find((tag) => tag.idTag === payload.idTag);
            if (foundIdTag) {
              result = {
                idTagInfo: {
                  status: "Accepted"
                }
              };
            } else {
              result = {
                idTagInfo: {
                  status: "Invalid"
                }
              };
            }
            break;
          case "StartTransaction":
            const { connectorId, idTag, meterStart, timestamp: startTimestamp } = payload;
            try {
              const transactionIdTag = idTagsList.find((tag) => tag.idTag === idTag);
              if (!transactionIdTag) {
                result = {
                  idTagInfo: {
                    status: "Invalid"
                  }
                };
              } else {
                const transactionID = chargers_default.startCharging(client.identity, connectorId, currentTime);
                if (!client.connectors[connectorId]) {
                  client.connectors[connectorId] = {};
                }
                client.connectors[connectorId].transactionId = transactionID;
                client.connectors[connectorId].meterStart = meterStart;
                client.connectors[connectorId].startTimestamp = startTimestamp;
                client.connectors[connectorId].status = "Charging";
                result = {
                  idTagInfo: {
                    status: "Accepted"
                  },
                  transactionId: transactionID
                };
              }
            } catch (e) {
              console.error("StartTransaction error : ", e.message);
            }
            break;
          case "StopTransaction":
            const { transactionId, meterStop, timestamp: stopTimestamp } = payload;
            let stopConnectorId;
            for (const connId in client.connectors) {
              if (client.connectors[connId].transactionId === transactionId) {
                stopConnectorId = connId;
                break;
              }
            }
            if (stopConnectorId) {
              try {
                const meterStart2 = client.connectors[stopConnectorId].meterStart;
                const startTimestamp2 = client.connectors[stopConnectorId].startTimestamp;
                const totalEnergyUsed = meterStop - meterStart2;
                const chargingDuration = new Date(stopTimestamp) - new Date(startTimestamp2);
                const hours = Math.floor(chargingDuration / (1e3 * 60 * 60));
                const minutes = Math.floor(chargingDuration % (1e3 * 60 * 60) / (1e3 * 60));
                const seconds = Math.floor(chargingDuration % (1e3 * 60) / 1e3);
                const recordChargingDuration = `${hours}:${minutes}:${seconds}`;
                chargers_default.stopCharging(transactionId, currentTime, meterStart2, meterStop, totalEnergyUsed, recordChargingDuration);
                monitor_default.OCPPPool.splice(monitor_default.OCPPPool.findIndex((item) => item == client.identity), 1);
                deleteOCPPPool(client.identity);
                client.connectors[stopConnectorId].transactionId = null;
                client.connectors[stopConnectorId].status = "Finishing";
                result = {
                  idTagInfo: {
                    status: "Accepted"
                  }
                };
              } catch (e) {
                console.error("StopTransaction error : ", e.message);
              }
            } else {
              result = {
                idTagInfo: {
                  status: "Invalid"
                }
              };
            }
            break;
          case "StatusNotification":
            const { connectorId: statusConnectorId, status, errorCode, timestamp: statusTimestamp, vendorId, info, VendorErrorCode } = payload;
            try {
              const timestampToConvert = statusTimestamp ? statusTimestamp : (/* @__PURE__ */ new Date()).toISOString();
              const converted_time = convertToTimezoneUTC86(timestampToConvert);
              if (!client.connectors[statusConnectorId]) {
                client.connectors[statusConnectorId] = {};
              }
              if (statusConnectorId == 0) {
                ;
              }
              if (statusConnectorId != 0) {
                if (status == "Available") {
                  const transactionId2 = chargers_default.getTransactionById(client.identity, statusConnectorId);
                  const waitingQueue = monitor_default.getQueueingData();
                  const waitingData = waitingQueue.find((request) => request.transactionId === transactionId2);
                  if (waitingData) {
                    try {
                      const removeRes = monitor_default.shiftQueueingData(transactionId2);
                      if (removeRes.status === "success") {
                        console.log(`Successfully removed ${transactionId2} from waiting queue !`);
                      }
                    } catch (e) {
                      console.error("Removing waitingData error : ", e.message);
                    }
                  }
                  const charger_under_ocpp_control = monitor_default.getAllAvailableOCPPChargers().find((id) => id == client.identity);
                  if (charger_under_ocpp_control)
                    monitor_default.removeOcppControlByChargerId(charger_under_ocpp_control);
                  chargers_default.upsertConnector({
                    chargerId: client.identity,
                    connectorId: statusConnectorId,
                    status,
                    transactionId: null,
                    voltage: null,
                    current: null,
                    WH: null,
                    power: null,
                    soc: null,
                    last_update_time: currentTime
                  });
                } else {
                  const transactionId2 = await chargers_default.getTransactionById(client.identity, statusConnectorId);
                  client.connectors[statusConnectorId].transactionId = transactionId2;
                  chargers_default.upsertConnector({
                    chargerId: client.identity,
                    connectorId: statusConnectorId,
                    status,
                    transactionId: transactionId2,
                    last_update_time: currentTime
                  });
                }
                const StatusChange_body = {
                  "DeviceId": client.identity,
                  "DeviceTime": converted_time,
                  "ConnectorId": statusConnectorId != null ? statusConnectorId.toString() : null,
                  "Status": STATUS_CODE_MAP5[status] != null ? STATUS_CODE_MAP5[status].toString() : null,
                  "ErrorCode": errorCode != null ? errorCode.toString() : null,
                  "VendorErrorCode": VendorErrorCode != null ? VendorErrorCode.toString() : null
                };
                console.log("StatusChange_body : ", StatusChange_body);
                sendStatusChange(StatusChange_body);
              }
              client.connectors[statusConnectorId].status = status;
              if (vendorId) {
                const oldVendoId = chargers_default.getVendorByChargerId(client.identity);
                if (oldVendoId == "unknown" || vendorId != oldVendoId) {
                  chargers_default.updateCharger(
                    client.identity,
                    { vendorId }
                  );
                }
              }
              if (errorCode != "NoError") {
                const alert_body = {
                  "DeviceId": client.identity,
                  "DeviceTime": converted_time,
                  "ConnectorId": statusConnectorId.toString(),
                  "AlertType": errorCode.toString(),
                  "AlertData": info.toString() || null
                };
                sendAlert(alert_body);
              }
            } catch (err) {
              console.error("StatusNotification error: ", err.message);
            }
            result = {};
            break;
          case "MeterValues":
            const { connectorId: MeterValuesConnectorId } = payload;
            try {
              let getSampledValueByMeasurand = function(sampledValues, measurand) {
                return sampledValues.find((item) => item.measurand === measurand) || null;
              };
              if (!payload.transactionId) return;
              const current = getSampledValueByMeasurand(payload.meterValue[0].sampledValue, "Current.Import") || null;
              const voltage = getSampledValueByMeasurand(payload.meterValue[0].sampledValue, "Voltage") || null;
              const power = getSampledValueByMeasurand(payload.meterValue[0].sampledValue, "Power.Active.Import") || null;
              const WH = getSampledValueByMeasurand(payload.meterValue[0].sampledValue, "Energy.Active.Import.Register") || null;
              const soc = getSampledValueByMeasurand(payload.meterValue[0].sampledValue, "SoC") || null;
              try {
                const connectorData = {
                  chargerId: client.identity,
                  connectorId: MeterValuesConnectorId,
                  transactionId: payload.transactionId,
                  current: (current == null ? void 0 : current.value) != null && !isNaN(Number(current.value)) ? parseFloat(Number(current.value).toFixed(2)) : null,
                  voltage: (voltage == null ? void 0 : voltage.value) != null && !isNaN(Number(voltage.value)) ? parseFloat(Number(voltage.value).toFixed(2)) : null,
                  power: (power == null ? void 0 : power.value) != null && !isNaN(Number(power.value)) ? parseFloat(Number(power.unit === "W" ? power.value / 1e3 : power.value).toFixed(2)) : null,
                  WH: (WH == null ? void 0 : WH.value) != null && !isNaN(Number(WH.value)) ? parseFloat(Number(WH.unit === "Wh" ? WH.value / 1e3 : WH.value).toFixed(2)) : null,
                  soc: (soc == null ? void 0 : soc.value) != null && !isNaN(Number(soc.value)) ? Number(soc.value) : null,
                  last_update_time: currentTime
                };
                const filteredConnectorData = Object.fromEntries(
                  Object.entries(connectorData).filter(([_, value]) => value != null)
                  // 使用 != null 可同時過濾 null 和 undefined
                );
                chargers_default.upsertConnector(filteredConnectorData);
                const converted_time = convertToTimezoneUTC86(payload.meterValue[0].timestamp);
                const sendChargingInfo_body = {
                  "DeviceId": client.identity,
                  "DeviceTime": converted_time,
                  "ConnectorId": MeterValuesConnectorId.toString(),
                  "TransactionId": payload.transactionId ? payload.transactionId.toString() : null,
                  "Voltage": (voltage == null ? void 0 : voltage.value) != null && !isNaN(Number(voltage.value)) ? parseFloat(Number(voltage.value).toFixed(2)) : null,
                  "Current": (current == null ? void 0 : current.value) != null && !isNaN(Number(current.value)) ? parseFloat(Number(current.value).toFixed(2)) : null,
                  "WH": (WH == null ? void 0 : WH.value) != null && !isNaN(Number(WH.value)) ? parseFloat(Number(WH.unit === "Wh" ? WH.value / 1e3 : WH.value).toFixed(2)) : 0,
                  "soc": (soc == null ? void 0 : soc.value) != null && !isNaN(Number(soc.value)) ? Number(soc.value) : null
                };
                console.log("sendChargingInfo_body : ", sendChargingInfo_body);
                sendChargingInfo(sendChargingInfo_body);
              } catch (error) {
                console.log("connectorData error :", error.message);
              }
              if (!client || !client.connectors || Object.keys(client.connectors).length === 0) {
                let charger = chargers_default.getChargerWithConnectorsById(client.identity);
                const connectorIds = charger.map((row) => row.connectorId);
                try {
                  connectorIds.forEach((connectorId2) => {
                    console.log("connectorId : ", connectorId2);
                    const triggerMessagePayload = {
                      requestedMessage: "StatusNotification",
                      connectorId: connectorId2
                      // 這裡直接使用正確的 connectorId
                    };
                    client.call("TriggerMessage", triggerMessagePayload).then((response2) => {
                      console.log(`TriggerMessage \u56DE\u61C9\uFF08Connector ${connectorId2}\uFF09\uFF1A`, response2);
                    }).catch((error) => {
                      console.error(`TriggerMessage \u5931\u6557\uFF08Connector ${connectorId2}\uFF09\uFF1A`, error);
                    });
                  });
                } catch (e) {
                  console.error("triggerMessage \u932F\u8AA4\uFF1A", e.message);
                }
              }
            } catch (e) {
              console.error("MeterValues error : ", e.message);
            }
            result = {};
            break;
          case "DataTransfer":
            result = {
              status: "Accepted",
              data: "exampleResponseData"
            };
            break;
          case "SetChargingProfile":
            console.log("SetChargingProfile payload:", payload);
            result = {};
            break;
          default:
            throw new Error(`NotImplemented: Unable to handle '${action}' calls`);
        }
        console.log("Sending reply:", result);
        reply(result);
      } catch (error) {
        reply({ error: `NotImplemented: ${error.message}` });
      }
    } else {
      console.log("Received message is not an OCPP Call.");
    }
  });
  client.on("close", () => {
    console.log(`Client disconnected: ${client.identity}`);
    removeClient(client.identity);
  });
  addClient(client);
});
server.listen(5e3, "0.0.0.0").then(() => {
  console.log("OCPP server is listening on ws://0.0.0.0:5000");
  console.log("ws local connect: ws://localhost:5000/ocpp/ws");
  initDb();
  setInterval(() => {
    console.log("rs485 data : ", rs485Service_default.getRS485Data());
    const waitingQueue = monitor_default.getQueueingData();
    console.log(`WaitingQueue now: `, waitingQueue);
    callClients_default();
  }, 15e3);
}).catch((err) => {
  console.error("Failed to start server:", err);
});
app.listen(5001, () => {
  console.log("HTTP server is listening on http://0.0.0.0:5001");
  console.log("You can open controller on http://localhost:5001/ocpp/control.html");
});
