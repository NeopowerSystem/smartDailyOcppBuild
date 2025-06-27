import {
  getCurrentTimestamp
} from "./chunk-7LYFSOHO.js";

// controller/idTags.js
import Database from "better-sqlite3";
var db = new Database(new URL("../sqlite/app.db", import.meta.url).pathname);
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

export {
  idTags_default
};
