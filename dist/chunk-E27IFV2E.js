import {
  rs485Service_default
} from "./chunk-4NTWRYNR.js";
import {
  monitor_default
} from "./chunk-UEXAQPDG.js";
import {
  getClients
} from "./chunk-A4FYCZN7.js";
import {
  idTags_default
} from "./chunk-6NBZXGOP.js";
import {
  getMaxPowerByVendorId
} from "./chunk-2OZU7TSS.js";
import {
  chargers_default
} from "./chunk-OJ7DMOMU.js";

// api/ocpp/f002_remote_start_charging.js
import express from "express";
var router = express.Router();
router.post("/remoteStartCharging", async (req, res) => {
  const API_KEY = "neopower_ocpp_key";
  const apiKey = req.headers["neopower-api-key"];
  if (apiKey !== API_KEY) {
    return res.status(403).json({ message: "Forbidden: Invalid API Key" });
  }
  const clients = getClients();
  const { chargerId } = req.body;
  if (!chargerId) {
    return res.status(400).json({ message: "chargerId is required" });
  }
  const idTag = idTags_default.findIdTagByChargerId(chargerId);
  if (!idTag) {
    return res.status(404).json({ message: `Please set the idTag for chargerId: ${chargerId}` });
  }
  const vendorId = chargers_default.getVendorByChargerId(chargerId);
  const maxPower = await getMaxPowerByVendorId(vendorId);
  if (!maxPower) {
    return res.status(404).json({ message: `Please set the maxPower of vendorId for: ${chargerId}` });
  }
  const isSmartMeter = chargerId.startsWith("SmartMeter");
  let client;
  if (isSmartMeter) {
    client = rs485Service_default.getRS485Data().find((chargers) => chargers.chargerId === chargerId);
  } else {
    client = clients.find((c) => c.identity === chargerId);
  }
  if (!client) {
    return res.status(404).json({ message: `Can not find the client: ${chargerId}` });
  }
  const transactionId = chargers_default.getTransactionById(isSmartMeter ? client.chargerId : client.identity, 1);
  if (transactionId) {
    const waitingQueue = monitor_default.getQueueingData();
    const waitingData = waitingQueue.find((request) => request.transactionId === transactionId);
    if (waitingData) {
      return res.status(409).json({ message: `${isSmartMeter ? client.chargerId : client.identity} is already queueing with transactionId:${transactionId}` });
    }
    const chargingStatus = chargers_default.getChargerWithConnectorsById(isSmartMeter ? client.chargerId : client.identity);
    if (chargingStatus[0].status == "Charging") {
      return res.status(409).json({ message: `${isSmartMeter ? client.chargerId : client.identity} is already charging with transactionId:${transactionId}` });
    }
  }
  const newTransactionId = chargers_default.generateTransactionId(isSmartMeter ? client.chargerId : client.identity, 1);
  monitor_default.chargeOrQueue(isSmartMeter ? client.chargerId : client.identity, isSmartMeter, newTransactionId);
  return res.status(200).json({ message: "Start charging command sent successfully", status: "Accepted", transactionId: newTransactionId });
});
var f002_remote_start_charging_default = router;

export {
  f002_remote_start_charging_default
};
