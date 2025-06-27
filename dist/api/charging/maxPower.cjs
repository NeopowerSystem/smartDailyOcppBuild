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

// api/charging/maxPower.js
var maxPower_exports = {};
__export(maxPower_exports, {
  default: () => maxPower_default
});
module.exports = __toCommonJS(maxPower_exports);
var import_express = __toESM(require("express"), 1);

// controller/maxPower.js
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

// controller/maxPower.js
var import_meta = {};
var db = new import_better_sqlite3.default(new URL("../sqlite/app.db", import_meta.url).pathname);
async function getMaxPower() {
  const stmt = db.prepare(`SELECT * FROM maxPower`);
  return stmt.all();
}
async function insertMaxPower(vendorId, unit, kw_limit) {
  const stmt = db.prepare(`INSERT INTO maxPower(vendorId, unit, kw_limit,last_update)
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
  const stmt = db.prepare(`UPDATE maxPower SET ${setClause} WHERE vendorId = ?`);
  stmt.run(...values, vendorId);
}
async function deleteMaxPower(vendorId) {
  const stmt = db.prepare(`DELETE FROM maxPower WHERE vendorId = ?`);
  stmt.run(vendorId);
}
async function getMaxPowerByVendorId(vendorId) {
  const stmt = db.prepare(`SELECT * FROM maxPower WHERE vendorId = ?`);
  return stmt.get(vendorId);
}

// api/charging/maxPower.js
var router = import_express.default.Router();
router.get("/maxPower", async (req, res) => {
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
router.post("/maxPower", async (req, res) => {
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
router.put("/maxPower/:vendorId", async (req, res) => {
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
router.delete("/maxPower/:vendorId", async (req, res) => {
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
var maxPower_default = router;
