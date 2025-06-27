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
  sendChargingInfo
} from "./chunk-6QLEUG4B.js";
import {
  sendStatusChange
} from "./chunk-KS63OYKI.js";
import {
  chargers_default
} from "./chunk-OJ7DMOMU.js";
import {
  getCurrentTimestamp
} from "./chunk-7LYFSOHO.js";

// utils/rs485Service.js
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
var RS485Service = class {
  constructor(interval = 5e3) {
    this.isConnected = false;
    this.rs485Data = [];
    this.transferedData = [];
    this.zeroCurrentCount = [];
    this.interval = interval;
    this.startMonitoring();
    this.isOpen = true;
  }
  // 設定是否開啟讀取電表資料
  setIsOpen(isOpen) {
    this.isOpen = isOpen;
  }
  // 觀測所有rs485設備電流狀況
  countCurrent(newData) {
    newData.forEach((charger) => {
      var _a, _b, _c;
      const chargerId = charger.chargerId;
      const status = ((_a = charger.connectors[0]) == null ? void 0 : _a.status) ?? null;
      const transactionId = ((_b = charger.connectors[0]) == null ? void 0 : _b.transactionId) ?? null;
      const current = ((_c = charger.connectors[0]) == null ? void 0 : _c.current) ?? null;
      let existingEntry = this.zeroCurrentCount.find((item) => item.chargerId === chargerId);
      if (status == "Preparing") {
        if (existingEntry && existingEntry.current_count > 0) {
          existingEntry.current_count = 0;
          existingEntry.transactionId = null;
          existingEntry.status = "Preparing";
          monitor_default.smartMeterPool.splice(monitor_default.smartMeterPool.findIndex((item) => item.chargerId === chargerId), 1);
          deleteSmartMeterPool(chargerId);
        }
        return;
      }
      if (!existingEntry) {
        this.zeroCurrentCount.push({
          chargerId,
          status,
          transactionId,
          current_count: 0
        });
      } else {
        if (current == null || current < 0.5) {
          existingEntry.current_count++;
          console.log(`\u5145\u96FB\u6A01 ${chargerId} \u76EE\u524D\u8B80\u4E0D\u5230\u96FB\u6D41\uFF0C\u5DF2\u6AA2\u67E5${existingEntry.current_count * 1}\u5206\u9418...`);
          if (existingEntry.current_count >= 5) {
            console.log(`\u5145\u96FB\u6A01 ${chargerId} \u9023\u7E8C 5 \u5206\u9418\u8B80\u4E0D\u5230\u96FB\u6D41\uFF0C\u89F8\u767C\u95DC\u9589\u7E7C\u96FB\u5668\uFF01`);
            const smartMeterId = chargerId.match(/\d+$/)[0];
            rs485_default.turnOffRelay(smartMeterId);
            chargers_default.stopCharging(transactionId, getCurrentTimestamp());
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
            monitor_default.smartMeterPool.splice(monitor_default.smartMeterPool.findIndex((item) => item.chargerId === chargerId), 1);
            deleteSmartMeterPool(chargerId);
            sendStatusChange(StatusChange_body);
          }
        } else {
          existingEntry.current_count = 0;
        }
      }
    });
  }
  async fetchRS485Data() {
    try {
      if (!this.isOpen || rs485_default.getRelayAction()) {
        return;
      }
      const rs485data_read = await rs485_default.readAllPowerMeter();
      if (rs485data_read.length) {
        this.transferedData = [];
        for (let i = 0; i < rs485data_read.length; i++) {
          const transfered_id = "SmartMeter" + rs485data_read[i].id;
          const currentTime = getCurrentTimestamp();
          if (!chargers_default.getChargerById(transfered_id)) {
            chargers_default.insertCharger(transfered_id);
            chargers_default.updateCharger(transfered_id, { vendorId: rs485data_read[i].vendorId });
          }
          const getConnectorRes = chargers_default.getChargerWithConnectorsById(transfered_id);
          if (getConnectorRes.vendorId != rs485data_read[i].vendorId) {
            chargers_default.updateCharger(transfered_id, { vendorId: rs485data_read[i].vendorId });
          }
          const transformedData = getConnectorRes.reduce((acc, curr) => {
            let charger = acc.find((item) => item.chargerId === curr.chargerId);
            if (!charger) {
              charger = {
                chargerId: curr.chargerId,
                vendorId: curr.vendorId,
                connectors: []
              };
              acc.push(charger);
            }
            charger.connectors.push({
              connectorId: curr.connectorId,
              status: curr.status,
              transactionId: curr.transactionId ?? null,
              voltage: curr.voltage ?? null,
              current: curr.current ?? null,
              power: curr.power ?? null,
              last_update_time: curr.last_update_time
            });
            return acc;
          }, []);
          this.transferedData.push(...transformedData);
          if (!getConnectorRes[0].connectorId) {
            chargers_default.upsertConnector({
              chargerId: transfered_id,
              connectorId: 1,
              last_update_time: currentTime
            });
          }
          if (getConnectorRes[0].status == "Unknown" && rs485data_read[i].relayStatus != null) {
            chargers_default.upsertConnector({
              chargerId: transfered_id,
              connectorId: 1,
              status: rs485data_read[i].relayStatus == 0 ? "Preparing" : "Charging",
              last_update_time: currentTime
            });
          }
          const transactionId = chargers_default.getTransactionById(transfered_id, 1);
          const smartMeterId = transfered_id.match(/\d+$/)[0];
          if (!transactionId && getConnectorRes[0].status == "Preparing" && rs485data_read[i].relayStatus == 1) {
            console.log("relay closed due to no transaction");
            rs485_default.turnOffRelay(smartMeterId);
          }
          if (getConnectorRes[0].status == "Charging" && rs485data_read[i].relayStatus == 0) {
            console.log("UpsertConnector and sending to smartDaily...");
            chargers_default.upsertConnector({
              chargerId: transfered_id,
              connectorId: 1,
              status: "Preparing",
              transactionId: null,
              voltage: null,
              current: null,
              power: null,
              last_update_time: currentTime
            });
            const StatusChange_body = {
              "DeviceId": transfered_id,
              "DeviceTime": rs485data_read[i].time,
              "ConnectorId": "1",
              "Status": STATUS_CODE_MAP["Preparing"].toString(),
              "ErrorCode": null,
              "VendorErrorCode": null
            };
            sendStatusChange(StatusChange_body);
          }
          if (rs485data_read[i].current != 0 && rs485data_read[i].relayStatus == 1) {
            console.log("hi6");
            chargers_default.upsertConnector({
              chargerId: transfered_id,
              connectorId: 1,
              status: "Charging",
              transactionId,
              voltage: rs485data_read[i].voltage,
              current: rs485data_read[i].current,
              power: rs485data_read[i].power,
              last_update_time: currentTime
            });
            const sendChargingInfo_body = {
              "DeviceId": transfered_id,
              "DeviceTime": rs485data_read[i].time,
              "ConnectorId": "1",
              "TransactionId": transactionId.toString(),
              "Voltage": rs485data_read[i].voltage,
              "Current": rs485data_read[i].current,
              "WH": 0,
              "soc": null
            };
            sendChargingInfo(sendChargingInfo_body);
          }
        }
        this.rs485Data = rs485data_read;
        this.countCurrent(this.transferedData);
      } else {
        this.rs485Data = [];
        this.transferedData = [];
      }
    } catch (err) {
      console.error("RS485 data update fail:", err);
      this.isConnected = false;
    }
  }
  startMonitoring() {
    setInterval(() => this.fetchRS485Data(), this.interval);
  }
  getRS485Data() {
    if (!this.isOpen) {
      return [];
    }
    return this.transferedData;
  }
  getRS485RawData() {
    if (!this.isOpen) {
      return [];
    }
    return this.rs485Data;
  }
};
var rs485Service = new RS485Service(6e4);
var rs485Service_default = rs485Service;

export {
  rs485Service_default
};
