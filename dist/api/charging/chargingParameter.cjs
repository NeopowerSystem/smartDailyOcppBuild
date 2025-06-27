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

// api/charging/chargingParameter.js
var chargingParameter_exports = {};
__export(chargingParameter_exports, {
  default: () => chargingParameter_default
});
module.exports = __toCommonJS(chargingParameter_exports);
var import_express = __toESM(require("express"), 1);

// controller/charging.js
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

// api/charging/chargingParameter.js
var router = import_express.default.Router();
router.get("/chargingParameter", (req, res) => {
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
router.post("/chargingParameter", (req, res) => {
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
var chargingParameter_default = router;
