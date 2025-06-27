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

// api/ocpp/f006_getCompositeSchedule.js
var f006_getCompositeSchedule_exports = {};
__export(f006_getCompositeSchedule_exports, {
  default: () => f006_getCompositeSchedule_default
});
module.exports = __toCommonJS(f006_getCompositeSchedule_exports);
var import_express = __toESM(require("express"), 1);

// controller/clients.js
var clients = [];
var getClients = () => clients;

// api/ocpp/f006_getCompositeSchedule.js
var router = import_express.default.Router();
router.post("/getCompositeSchedule", (req, res) => {
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
    }).then((response) => {
      console.log("GetCompositeScheduleResponse received:", response);
      res.json({ message: "GetCompositeSchedule command sent", response });
    }).catch((error) => {
      console.error("GetCompositeSchedule failed:", error);
      res.status(500).json({ message: "GetCompositeSchedule failed", error });
    });
  } else {
    return res.status(400).json({ message: "Missing required parameters (chargerId, connectorId, duration, or chargingRateUnit)" });
  }
});
var f006_getCompositeSchedule_default = router;
