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

// api/idTags/f103_update_idTag.js
var f103_update_idTag_exports = {};
__export(f103_update_idTag_exports, {
  default: () => f103_update_idTag_default
});
module.exports = __toCommonJS(f103_update_idTag_exports);
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

// api/idTags/f103_update_idTag.js
var router = import_express.default.Router();
router.put("/idTags/:idTag", (req, res) => {
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
var f103_update_idTag_default = router;
