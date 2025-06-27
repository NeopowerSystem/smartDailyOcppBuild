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
  sendStatusChange
} from "./chunk-KS63OYKI.js";
import {
  chargers_default
} from "./chunk-OJ7DMOMU.js";
import {
  getClients
} from "./chunk-A4FYCZN7.js";
import {
  getCurrentTimestamp
} from "./chunk-7LYFSOHO.js";

// api/ocpp/f002_remote_start_charging2.js
import express from "express";
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
var router = express.Router();
router.post("/remoteStartCharging2", (req, res) => {
  const API_KEY = "neopower_ocpp_key";
  const apiKey = req.headers["neopower-api-key"];
  if (apiKey !== API_KEY) {
    return res.status(403).json({ message: "\u7981\u6B62\u5B58\u53D6: \u7121\u6548\u7684 API Key" });
  }
  const clients = getClients();
  const { chargerId, idTag, connectorId, chargingRate, chargingRateUnit } = req.body;
  if (!chargerId || !idTag || !connectorId) {
    return res.status(400).json({ message: "chargerId, connectorId \u548C idTag \u662F\u5FC5\u9700\u7684\u53C3\u6578", received: `${chargerId},${idTag},${connectorId}` });
  }
  let transactionId;
  let client = rs485Service_default.getRS485Data().find((chargers) => chargers.chargerId === chargerId);
  if (client) {
    const currentTime = getCurrentTimestamp();
    const smartMeterId = client.chargerId.match(/\d+$/)[0];
    rs485_default.turnOnRelay(smartMeterId).then(() => {
      chargers_default.startCharging(client.chargerId, 1, currentTime);
      console.log(`Charger ${client.chargerId} successfully started.`);
      const device = rs485Service_default.getRS485RawData().find((item) => item.id == smartMeterId);
      const StatusChange_body = {
        "DeviceId": chargerId,
        "DeviceTime": device.time,
        "ConnectorId": "1",
        "Status": STATUS_CODE_MAP["Charging"].toString(),
        "ErrorCode": null,
        "VendorErrorCode": null
      };
      sendStatusChange(StatusChange_body);
      transactionId = chargers_default.getTransactionById(client.chargerId, 1);
      const waitingQueue = monitor_default.getQueueingData();
      const waitingData = waitingQueue.find((request) => request.transactionId === transactionId);
      if (waitingData) {
        try {
          console.log(`Removing ${transactionId} from waiting queue...`);
          monitor_default.shiftQueueingData(transactionId);
        } catch (e) {
          console.error("Removing waitingData error : ", e.message);
        }
      }
      rs485Service_default.fetchRS485Data().then(() => {
        console.log("Start charging, updated rs485 status");
      }).catch((err) => {
        console.error("Updated rs485 status error:", err);
      });
    }).catch((error) => {
      console.error("turnOnRelay at startCharging2 error : ", error);
    });
    return;
  } else
    client = clients.find((c) => c.identity === chargerId);
  if (!client) {
    return res.status(404).json({ message: `\u627E\u4E0D\u5230\u6307\u5B9A\u7684\u5BA2\u6236\u7AEF: ${chargerId}` });
  }
  const remoteStartParams = {
    connectorId,
    idTag
  };
  transactionId = chargers_default.getTransactionById(client.identity, 1);
  const vendorId = chargers_default.getVendorByChargerId(client.identity);
  if (chargingRate) {
    if (vendorId == "Zerova") {
      console.log("start 1 ");
      remoteStartParams.chargingProfile = {
        chargingProfileId: 1,
        transactionId,
        stackLevel: 0,
        // 配置的優先級
        chargingProfilePurpose: "TxProfile",
        // 交易配置
        chargingProfileKind: "Absolute",
        // 注意都不行帶startSchedule
        validFrom: (/* @__PURE__ */ new Date()).toISOString(),
        // 從現在開始生效
        chargingSchedule: {
          duration: 3600,
          // 持續一小時
          // startSchedule: new Date().toISOString(),
          chargingRateUnit,
          // 單位
          chargingSchedulePeriod: [
            {
              startPeriod: 0,
              // 開始時間
              limit: chargingRate,
              // 充電速率
              numberPhases: 1
            }
          ]
        }
      };
    } else {
      console.log("start 2 ");
      remoteStartParams.chargingProfile = {
        chargingProfileId: 1,
        transactionId,
        stackLevel: 0,
        // 配置的優先級
        chargingProfilePurpose: "TxProfile",
        // 交易配置
        chargingProfileKind: "Absolute",
        // 
        validFrom: (/* @__PURE__ */ new Date()).toISOString(),
        // 從現在開始生效
        chargingSchedule: {
          duration: 3600,
          // 持續一小時
          startSchedule: (/* @__PURE__ */ new Date()).toISOString(),
          //正常Absolute都需要帶此欄位，代表現在開始使用此計畫
          chargingRateUnit,
          // 單位
          chargingSchedulePeriod: [
            {
              startPeriod: 0,
              // 開始時間
              limit: chargingRate,
              // 充電速率
              numberPhases: 1
            }
          ]
        }
      };
    }
  }
  console.log("RemoteStartTransaction request params : ", JSON.stringify(remoteStartParams, null, 2));
  client.call("RemoteStartTransaction", remoteStartParams).then(async (response) => {
    console.log("RemoteStartTransactionResponse \u6536\u5230:", response);
    if (response.status == "Accepted") {
      const waitingQueue = monitor_default.getQueueingData();
      const waitingData = waitingQueue.find((request) => request.transactionId === transactionId);
      if (waitingData) {
        try {
          monitor_default.shiftQueueingData(transactionId);
        } catch (e) {
          console.error("Removing waitingData error : ", e.message);
        }
      }
    }
  }).catch((error) => {
    console.error("RemoteStartTransaction \u5931\u6557:", error);
    res.status(500).json({ message: "\u555F\u52D5\u5145\u96FB\u5931\u6557", error });
  });
});
var f002_remote_start_charging2_default = router;

export {
  f002_remote_start_charging2_default
};
