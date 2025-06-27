import {
  getClients
} from "./chunk-A4FYCZN7.js";

// api/ocpp/f006_getCompositeSchedule.js
import express from "express";
var router = express.Router();
router.post("/getCompositeSchedule", (req, res) => {
  const API_KEY = "neopower_ocpp_key";
  const apiKey = req.headers["neopower-api-key"];
  if (apiKey !== API_KEY) {
    return res.status(403).json({ message: "Forbidden: Invalid API Key" });
  }
  const clients = getClients();
  const { chargerId, connectorId, duration, chargingRateUnit } = req.body;
  if (chargerId && connectorId !== void 0 && duration && chargingRateUnit) {
    const selectedClient = clients.find((client) => client.identity === chargerId);
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

export {
  f006_getCompositeSchedule_default
};
