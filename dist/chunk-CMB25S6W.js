import {
  monitor_default
} from "./chunk-UEXAQPDG.js";
import {
  getClients
} from "./chunk-A4FYCZN7.js";
import {
  chargers_default
} from "./chunk-OJ7DMOMU.js";

// api/ocpp/f004_set_charging_profile.js
import express from "express";
var router = express.Router();
router.post("/setChargingProfile", (req, res) => {
  const API_KEY = "neopower_ocpp_key";
  const apiKey = req.headers["neopower-api-key"];
  if (apiKey !== API_KEY) {
    return res.status(403).json({ message: "Forbidden: Invalid API Key" });
  }
  const clients = getClients();
  const { chargerId, connectorId, limit, control_unit } = req.body;
  if (!chargerId || !limit || !connectorId || !control_unit) {
    return res.status(400).json({ message: "chargerId, connectorId, limit, and control_unit are required" });
  }
  const client = clients.find((c) => c.identity === chargerId);
  if (!client) {
    return res.status(404).json({ message: `Cannot find the specified client: ${chargerId}` });
  }
  try {
    let transactionId = chargers_default.getTransactionById(chargerId, connectorId);
    transactionId = parseInt(transactionId, 10);
    const csChargingProfiles = (
      // {
      //     // chargingProfileId: chargingProfile.chargingProfileId, // 使用現有計畫的 ID
      //     chargingProfileId: 1234, 
      //     stackLevel: 6,
      //     chargingProfilePurpose : "TxProfile",
      //     chargingProfileKind: "Absolute",
      //     chargingSchedule: {
      //         duration: 1800,
      //         startSchedule: new Date().toISOString(),
      //         chargingRateUnit: control_unit, // 使用功率 (W) 或 (A)
      //         chargingSchedulePeriod: [
      //             {
      //                 startPeriod: 0,
      //                 limit: limit // 設置功率限制
      //             }
      //         ]
      //     }
      // };
      // {
      //     "chargingProfileId": chargingProfile.chargingProfileId,
      //     "stackLevel": 0,
      //     "chargingProfilePurpose": "TxDefaultProfile",
      //     "chargingProfileKind": "Recurring",
      //     "recurrencyKind": "Daily",
      //     "chargingSchedule": {
      //       "startSchedule": new Date().toISOString(),
      //       "duration": 86400,
      //       "chargingRateUnit": control_unit,
      //       "chargingSchedulePeriod": [
      //         {
      //           "startPeriod": 0,
      //           "limit": limit
      //         }
      //       ]
      //     }
      //   }
      // { //這個大多都能使用，但有些廠牌只支援TxProfile且必須帶transactionId
      //     "chargingProfileId": chargingProfile.chargingProfileId,
      //     "stackLevel": 0,
      //     "chargingProfilePurpose": "TxDefaultProfile",
      //     "chargingProfileKind": "Relative",
      //     "chargingSchedule": {
      //       "chargingRateUnit": control_unit,
      //       "chargingSchedulePeriod": [
      //         {
      //           "startPeriod": 0,
      //           "limit": limit,
      //           "numberPhases" : 1 //看是否需要拿掉
      //         }
      //       ]
      //     }
      // }
      // { // 以後別用這個， Relative是相對的，所以limit這邊應該換成+-多少，假設要增加就帶正整數ex:5，減少就加負號ex:-6
      //     "chargingProfileId": chargingProfile.chargingProfileId,
      //     "stackLevel": 0,
      //     "chargingProfilePurpose": "TxProfile",
      //     "chargingProfileKind": "Relative",
      //     "transactionId":transactionId,
      //     "chargingSchedule": {
      //       "chargingRateUnit": control_unit,
      //       "chargingSchedulePeriod": [
      //         {
      //           "startPeriod": 0,
      //           "limit": limit,
      //           "numberPhases" : 1 //看是否需要拿掉
      //         }
      //       ]
      //     }
      // }
      {
        // 2025.03.12調整,模擬器可以用這個調整
        "chargingProfileId": 1,
        "stackLevel": 0,
        "chargingProfilePurpose": "TxProfile",
        "chargingProfileKind": "Absolute",
        "transactionId": transactionId,
        "chargingSchedule": {
          "chargingRateUnit": control_unit,
          "duration": 3600,
          // 持續一小時
          "startSchedule": (/* @__PURE__ */ new Date()).toISOString(),
          //正常Absolute都需要帶此欄位，代表現在開始使用此計畫
          "chargingSchedulePeriod": [
            {
              "startPeriod": 0,
              "limit": limit,
              "numberPhases": 1
            }
          ]
        }
      }
    );
    client.call("SetChargingProfile", {
      connectorId: parseInt(connectorId, 10),
      // 將 connectorId 轉為整數
      csChargingProfiles
    }).then((response) => {
      console.log("SetChargingProfileResponse received:", response);
      if (response.status === "Rejected") {
        if (!monitor_default.smartMeterPool.find((item) => item.chargerId === chargerId)) {
          const connector = chargers_default.getConnectorByChargerId(chargerId);
          monitor_default.smartMeterPool.push({
            chargerId,
            limit: connector[0].power
          });
          monitor_default.removeOcppControlByChargerId(chargerId);
        }
      }
      res.status(200).json({ message: "SetChargingProfile command sent", response });
    }).catch((error) => {
      console.error("SetChargingProfile failed:", error);
      res.status(500).json({ message: "SetChargingProfile failed", error });
    });
  } catch (error) {
    console.error("SetChargingProfile failed:", error);
    res.status(500).json({ message: "SetChargingProfile failed", error });
  }
});
var f004_set_charging_profile_default = router;

export {
  f004_set_charging_profile_default
};
