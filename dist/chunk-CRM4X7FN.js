// controller/charging.js
import Database from "better-sqlite3";
var db = new Database(new URL("../sqlite/app.db", import.meta.url).pathname);
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

export {
  getChargingParameter,
  createChargingParameter,
  updateChargingParameter
};
