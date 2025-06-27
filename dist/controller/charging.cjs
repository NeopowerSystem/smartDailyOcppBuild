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

// controller/charging.js
var charging_exports = {};
__export(charging_exports, {
  createChargingParameter: () => createChargingParameter,
  getChargingParameter: () => getChargingParameter,
  updateChargingParameter: () => updateChargingParameter
});
module.exports = __toCommonJS(charging_exports);
var import_better_sqlite3 = __toESM(require("better-sqlite3"), 1);
var import_meta = {};
var db = new import_better_sqlite3.default(new URL("../sqlite/app.db", import_meta.url).pathname);
function getChargingParameter() {
  const stmt = db.prepare(`SELECT * FROM charging_parameter`);
  return stmt.all();
}
function createChargingParameter(contract_capacity, smart_meter_num, charging_mode, reserve_value) {
  const stmt = db.prepare(`
        INSERT INTO charging_parameter (contract_capacity, smart_meter_num, charging_mode, reserve_value)
        VALUES (?, ?, ?, ?)
    `);
  stmt.run(contract_capacity, smart_meter_num, charging_mode, reserve_value);
}
function updateChargingParameter(contract_capacity, smart_meter_num, charging_mode, reserve_value) {
  const stmt = db.prepare(`
        UPDATE charging_parameter SET contract_capacity = ?, smart_meter_num = ?, charging_mode = ?, reserve_value = ?
    `);
  stmt.run(contract_capacity, smart_meter_num, charging_mode, reserve_value);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createChargingParameter,
  getChargingParameter,
  updateChargingParameter
});
