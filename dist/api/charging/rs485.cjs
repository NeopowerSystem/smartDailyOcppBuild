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

// api/charging/rs485.js
var rs485_exports = {};
__export(rs485_exports, {
  default: () => rs485_default
});
module.exports = __toCommonJS(rs485_exports);
var import_modbus_serial = __toESM(require("modbus-serial"), 1);

// controller/smartMeter.js
var import_better_sqlite3 = __toESM(require("better-sqlite3"), 1);
var import_meta = {};
var db = new import_better_sqlite3.default(new URL("../sqlite/app.db", import_meta.url).pathname);
async function getSmartMeters() {
  const stmt = db.prepare(`SELECT * FROM smartMeters`);
  return stmt.all();
}

// controller/maxPower.js
var import_better_sqlite32 = __toESM(require("better-sqlite3"), 1);
var import_meta2 = {};
var db2 = new import_better_sqlite32.default(new URL("../sqlite/app.db", import_meta2.url).pathname);
async function getMaxPowerByVendorId(vendorId) {
  const stmt = db2.prepare(`SELECT * FROM maxPower WHERE vendorId = ?`);
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
