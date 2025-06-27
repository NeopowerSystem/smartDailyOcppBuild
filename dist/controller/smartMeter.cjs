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

// controller/smartMeter.js
var smartMeter_exports = {};
__export(smartMeter_exports, {
  deleteSmartMeter: () => deleteSmartMeter,
  getAllSmartMeterVendorId: () => getAllSmartMeterVendorId,
  getSmartMeterByHost: () => getSmartMeterByHost,
  getSmartMeterById: () => getSmartMeterById,
  getSmartMeters: () => getSmartMeters,
  insertSmartMeter: () => insertSmartMeter,
  updateSmartMeter: () => updateSmartMeter
});
module.exports = __toCommonJS(smartMeter_exports);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  deleteSmartMeter,
  getAllSmartMeterVendorId,
  getSmartMeterByHost,
  getSmartMeterById,
  getSmartMeters,
  insertSmartMeter,
  updateSmartMeter
});
