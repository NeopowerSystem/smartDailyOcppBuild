import {
  rs485Service_default
} from "./chunk-OWYJXJ3N.js";
import {
  monitor_default
} from "./chunk-DWTA6T53.js";
import {
  rs485_default
} from "./chunk-RBJHZYUU.js";
import {
  deleteSmartMeterPool
} from "./chunk-QEA4XCZI.js";
import {
  sendStatusChange
} from "./chunk-KS63OYKI.js";
import {
  deleteOCPPPool
} from "./chunk-ZWLPHOEW.js";
import {
  chargers_default
} from "./chunk-OJ7DMOMU.js";
import {
  getAllSmartMeterVendorId
} from "./chunk-FI3RUCZS.js";
import {
  getClients
} from "./chunk-A4FYCZN7.js";
import {
  getCurrentTimestamp
} from "./chunk-7LYFSOHO.js";

// api/ocpp/f003_remote_stop_charging.js
import express, { response } from "express";
var STATUS_CODE_MAP = {
  "Available": 0,
  //灰白色
  "Preparing": 1,
  //淺藍色
  "Charging": 2,
  //紫色
  "Finishing": 3,
  //綠色
  "Unavailable": 4,
  //紅色
  "Faulted": 5,
  //橘色
  "Offline": 6,
  //灰黑色
  "SuspendedEVSE": 7,
  "SuspendedEV": 8,
  "Reserved": 9
};
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
var router = express.Router();
router.post("/remoteStopCharging", (req, res) => {
  const API_KEY = "neopower_ocpp_key";
  const apiKey = req.headers["neopower-api-key"];
  if (apiKey !== API_KEY) {
    return res.status(403).json({ message: "Forbidden: Invalid API Key" });
  }
  const { transactionId } = req.body;
  if (!transactionId) {
    return res.status(400).json({ message: "transactionId is required" });
  }
  const chargerId = chargers_default.getChargerIdByTransactionId(transactionId);
  if (!chargerId) {
    return res.status(404).json({ message: "Can not find the client to stop transaction" });
  }
  const waitingQueue = monitor_default.getQueueingData();
  const waitingData = waitingQueue.find((request) => request.transactionId === transactionId);
  if (waitingData) {
    try {
      const removeRes = monitor_default.shiftQueueingData(transactionId);
      if (removeRes.status === "success") {
        chargers_default.upsertConnector({
          chargerId,
          connectorId: 1,
          status: "Preparing",
          transactionId: null
        });
        const StatusChange_body = {
          "DeviceId": chargerId,
          "DeviceTime": convertToTimezoneUTC8((/* @__PURE__ */ new Date()).toISOString()),
          "ConnectorId": "1",
          "Status": STATUS_CODE_MAP["Preparing"].toString(),
          "ErrorCode": null,
          "VendorErrorCode": null
        };
        sendStatusChange(StatusChange_body);
        return res.status(200).json({
          message: "StopCharging command sent, removed from waiting queue...",
          response: { status: "Accepted" }
        });
      }
    } catch (e) {
      return res.status(500).json({ message: "Stop charging command sent failed", error: e.message });
    }
  }
  const currentTime = getCurrentTimestamp();
  const clients = getClients();
  let stopClient;
  const vendorId = chargers_default.getVendorByChargerId(chargerId);
  const smartMeterVendorId = getAllSmartMeterVendorId();
  if (smartMeterVendorId.includes(vendorId)) {
    const smartMeterId = chargerId.match(/\d+$/)[0];
    rs485_default.turnOffRelay(smartMeterId);
    chargers_default.stopCharging(transactionId, currentTime);
    const StatusChange_body = {
      "DeviceId": chargerId,
      "DeviceTime": convertToTimezoneUTC8((/* @__PURE__ */ new Date()).toISOString()),
      "ConnectorId": "1",
      "Status": STATUS_CODE_MAP["Preparing"].toString(),
      "ErrorCode": null,
      "VendorErrorCode": null
    };
    monitor_default.smartMeterPool.splice(monitor_default.smartMeterPool.findIndex((item) => item.chargerId === chargerId), 1);
    deleteSmartMeterPool(chargerId);
    sendStatusChange(StatusChange_body);
    rs485Service_default.fetchRS485Data().then(() => {
      console.log("Stop charging, updated rs485 status");
    }).catch((err) => {
      console.error("Updated rs485 status error:", err);
    });
    return res.status(200).json({
      message: "StopCharging command sent",
      response: { status: "Accepted" }
    });
  } else {
    clients.forEach((client) => {
      for (const connId in client.connectors) {
        if (client.connectors[connId].transactionId == transactionId) {
          stopClient = client;
          break;
        }
      }
    });
    if (!stopClient) {
      return res.status(404).json({ message: "Can not find the client to stop transaction" });
    }
    stopClient.call("RemoteStopTransaction", {
      transactionId
    }).then((response2) => {
      if (response2.status == "Accepted") {
        monitor_default.removeOcppControlByChargerId(stopClient.identity);
        deleteOCPPPool(stopClient.identity);
      }
      res.status(200).json({ message: "StopCharging command sent", response: response2 });
    }).catch((error) => {
      res.status(500).json({ message: "StopCharging command sent failed", error });
    });
  }
});
var f003_remote_stop_charging_default = router;

export {
  f003_remote_stop_charging_default
};
