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

// emit_smartDaily/sendChargingInfo.js
var sendChargingInfo_exports = {};
__export(sendChargingInfo_exports, {
  sendChargingInfo: () => sendChargingInfo
});
module.exports = __toCommonJS(sendChargingInfo_exports);
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
    const response = await import_axios.default.put(url, body, {
      headers: {
        "Authorization": "Bearer zaxb20C3jlV6dX8Dqvy2CpOvcnU7oqsK6mE4HigH",
        "Content-Type": "application/json"
      }
    });
    console.log("Sending ChargingInfo to smartDaily response status code:", response.status);
  } catch (error) {
    console.error("Sending ChargingInfo to smartDaily error:", error.response ? error.response.data : error.message);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  sendChargingInfo
});
