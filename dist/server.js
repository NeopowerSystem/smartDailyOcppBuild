import {
  routes_default
} from "./chunk-OYP7EHEL.js";
import "./chunk-XDQJX32D.js";
import "./chunk-OM5I4KTK.js";
import "./chunk-JQODCJJR.js";
import "./chunk-E27IFV2E.js";
import "./chunk-WUVY4S7O.js";
import "./chunk-DI56L6B7.js";
import "./chunk-CMB25S6W.js";
import "./chunk-U4HWCCXQ.js";
import "./chunk-RXYUCGI2.js";
import "./chunk-FNSIIT3D.js";
import "./chunk-AXH7HQSF.js";
import "./chunk-ZI67CCC3.js";
import {
  rs485Service_default
} from "./chunk-4NTWRYNR.js";
import {
  monitor_default
} from "./chunk-UEXAQPDG.js";
import "./chunk-GUS623SA.js";
import "./chunk-7T3OE6PE.js";
import "./chunk-2EJXMVZG.js";
import "./chunk-MUSTAPFD.js";
import {
  addClient,
  getClients,
  initializeClients,
  removeClient
} from "./chunk-A4FYCZN7.js";
import {
  idTags_default
} from "./chunk-6NBZXGOP.js";
import "./chunk-2OZU7TSS.js";
import "./chunk-QEA4XCZI.js";
import "./chunk-CW3GZA5T.js";
import "./chunk-PWJ6BKAY.js";
import "./chunk-CRM4X7FN.js";
import {
  sendAlert
} from "./chunk-ZPUKD3A5.js";
import {
  sendChargingInfo
} from "./chunk-6QLEUG4B.js";
import {
  sendStatusChange
} from "./chunk-KS63OYKI.js";
import "./chunk-ZWLPHOEW.js";
import {
  chargers_default
} from "./chunk-OJ7DMOMU.js";
import "./chunk-FI3RUCZS.js";
import "./chunk-7LYFSOHO.js";

// server.js
import { RPCServer } from "ocpp-rpc";
import express from "express";
import path from "path";

// utils/callClients.js
var call_connecting_clients = () => {
  const clients = getClients();
  const timestamp2 = /* @__PURE__ */ new Date();
  const utc8Timestamp = new Date(timestamp2.getTime() + 8 * 60 * 60 * 1e3).toISOString().replace("T", " ").replace("Z", "");
  console.log("Connecting clients:");
  if (!clients.length) {
    console.log("no client connecting...");
  } else {
    clients.forEach((client) => {
      console.log(`Client Identity: ${client.identity}`);
      try {
        if (client.connectors) {
          Object.keys(client.connectors).forEach((connectorId) => {
            if (connectorId === "0") return;
            const connector = client.connectors[connectorId];
            console.log(`  Connector ID: ${connectorId}`);
            console.log(`    Status: ${connector.status}`);
            if (connector.transactionId !== null && connector.transactionId !== void 0) {
              console.log(`    Transaction ID: ${connector.transactionId}`);
            } else {
              console.log(`    No active transaction`);
            }
          });
        } else {
          console.log(`  No connectors found for this client.`);
        }
      } catch (error) {
        console.error("callClients error : ", error.message);
      }
    });
  }
};
var callClients_default = call_connecting_clients;

// utils/logger.js
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import util from "util";
var { createLogger, format, transports } = winston;
var { combine, timestamp, json } = format;
var pileLogger = createLogger({
  level: "info",
  transports: [
    new DailyRotateFile({
      level: "info",
      filename: "./logs/pileInfo/%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxFiles: "365d",
      maxSize: "10m",
      zippedArchive: true,
      format: combine(
        timestamp({
          format: () => (/* @__PURE__ */ new Date()).toLocaleString("zh-TW", {
            timeZone: "Asia/Taipei",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false
          }).replace(/\//g, "-")
        }),
        json()
      )
    })
  ]
});
var consoleLogger = createLogger({
  level: "info",
  transports: [
    new DailyRotateFile({
      filename: "./logs/console/%DATE%.log",
      datePattern: "YYYY-MM-DD",
      level: "info",
      maxFiles: "365d",
      maxSize: "10m",
      zippedArchive: true,
      format: format.combine(
        format.timestamp({
          format: () => (/* @__PURE__ */ new Date()).toLocaleString("zh-TW", {
            timeZone: "Asia/Taipei",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false
          }).replace(/\//g, "-")
        }),
        format.printf(({ level, message, timestamp: timestamp2 }) => {
          if (level === "info") {
            return `[${timestamp2}] ${message}`;
          } else if (level === "error") {
            return `[${timestamp2}] ${message}`;
          } else {
            return `[${timestamp2}] ${message}`;
          }
        })
      )
    }),
    new DailyRotateFile({
      filename: "./logs/error/%DATE%.log",
      datePattern: "YYYY-MM-DD",
      level: "error",
      maxFiles: "365d",
      maxSize: "10m",
      zippedArchive: true,
      format: format.combine(
        format.timestamp({
          format: () => (/* @__PURE__ */ new Date()).toLocaleString("zh-TW", {
            timeZone: "Asia/Taipei",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false
          }).replace(/\//g, "-")
        }),
        format.printf(({ level, message, timestamp: timestamp2 }) => {
          if (level === "info") {
            return `[${timestamp2}] ${message}`;
          } else if (level === "error") {
            return `[${timestamp2}] ${message}`;
          } else {
            return `[${timestamp2}] ${message}`;
          }
        })
      )
    }),
    new transports.Console({
      format: format.combine(
        format.timestamp({
          format: () => (/* @__PURE__ */ new Date()).toLocaleString("zh-TW", {
            timeZone: "Asia/Taipei",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false
          }).replace(/\//g, "-")
        }),
        format.printf(({ level, message }) => {
          if (level === "info") {
            return `\x1B[37m${message}\x1B[0m`;
          } else if (level === "error") {
            return `\x1B[31m${message}\x1B[0m`;
          } else {
            return message;
          }
        })
      )
    })
  ]
});
console.log = (...args) => {
  const msg = args.map(
    (arg) => typeof arg === "object" ? util.inspect(arg, { depth: null }) : arg
  ).join(" ");
  consoleLogger.info(msg);
};
console.error = (...args) => {
  const msg = args.map(
    (arg) => typeof arg === "object" ? util.inspect(arg, { depth: null }) : arg
  ).join(" ");
  consoleLogger.error(msg);
};
var logger_default = pileLogger;

// sqlite/init.js
import Database from "better-sqlite3";
function initDb() {
  const db = new Database("sqlite/app.db");
  db.exec(`
    CREATE TABLE IF NOT EXISTS chargers (
      chargerId TEXT PRIMARY KEY,
      vendorId TEXT DEFAULT 'unknown'
    );
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS connectors (
      chargerId TEXT,
      connectorId INTEGER,
      voltage REAL,
      current REAL,
      power REAL,
      WH REAL,
      soc REAL,
      transactionId INTEGER,
      last_update_time DATETIME,
      status TEXT DEFAULT 'Unknown',
      PRIMARY KEY (chargerId, connectorId),
      FOREIGN KEY (chargerId) REFERENCES chargers(chargerId) ON DELETE CASCADE
    );
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
        transactionId INTEGER PRIMARY KEY,
        chargerId TEXT NOT NULL,
        connectorId INTEGER NOT NULL,
        start_time DATETIME,
        stop_time DATETIME,
        meterStart REAL,
        meterStop REAL,
        totalEnergyUsed REAL,
        chargingDuration TEXT
    );
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS idTags (
      idTag TEXT PRIMARY KEY,
      chargerId TEXT,
      created_at DATETIME 
    );
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS charging_parameter (
      contract_capacity REAL,
      smart_meter_num INTEGER,
      charging_mode INTEGER,
      reserve_value INTEGER
    );
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS smartMeters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      deviceId INTEGER,
      host TEXT,
      port INTEGER UNIQUE,
      vendorId TEXT,
      last_update DATETIME 
    );
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS maxPower(
      vendorId TEXT,
      unit TEXT,
      kw_limit REAL,
      last_update DATETIME 
    );
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS waitingQueue (
      chargerId TEXT,
      isSmartMeter TEXT,
      transactionId INTEGER
    );
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS OCPPPool (
      chargerId TEXT
    );
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS SmartMeterPool (
      chargerId TEXT,
      vendorId TEXT,
      power REAL
    );
  `);
  db.close();
}

// server.js
var __dirname = path.dirname(new URL(import.meta.url).pathname);
var server = new RPCServer({
  protocols: ["ocpp1.6"],
  callTimeoutMs: 1e3 * 30,
  pingIntervalMs: 1e3 * 30,
  strictMode: true
});
initializeClients();
var app = express();
app.use(express.json());
app.use("/ocppAPI", routes_default);
app.use("/ocpp", express.static(path.join(__dirname, "public")));
function getCurrentTimeFormatted() {
  return (/* @__PURE__ */ new Date()).toLocaleString("zh-TW", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).replace(/\//g, "-");
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
server.on("client", (client) => {
  console.log(`Client connected: ${client.identity}`);
  client.handle(async (message) => {
    const loggerMessage = {
      "client": client.identity,
      "method": message.method,
      "params": message.params
    };
    logger_default.info(loggerMessage);
    if (!client.connectors) client.connectors = {};
    const idTagsList = idTags_default.loadIdTags();
    const currentTime = getCurrentTimeFormatted();
    if (message.method) {
      const { messageId, method: action, params: payload, reply } = message;
      console.log(`Received method from ${client.identity} :`, action);
      if (!chargers_default.getChargerById(client.identity))
        chargers_default.insertCharger(client.identity);
      try {
        let result;
        switch (action) {
          case "BootNotification":
            result = {
              status: "Accepted",
              currentTime: (/* @__PURE__ */ new Date()).toISOString(),
              interval: 30
              // 設定為每30秒傳送一次
            };
            break;
          case "Heartbeat":
            if (!client || !client.connectors || Object.keys(client.connectors).length === 0) {
              let charger = chargers_default.getChargerWithConnectorsById(client.identity);
              const connectorIds = charger.map((row) => row.connectorId);
              try {
                connectorIds.forEach((connectorId2) => {
                  const triggerMessagePayload = {
                    requestedMessage: "StatusNotification",
                    connectorId: connectorId2
                  };
                  client.call("TriggerMessage", triggerMessagePayload).then((response) => {
                    console.log(`TriggerMessage \u56DE\u61C9\uFF08Connector ${connectorId2}\uFF09\uFF1A`, response);
                  }).catch((error) => {
                    console.error(`TriggerMessage \u5931\u6557\uFF08Connector ${connectorId2}\uFF09\uFF1A`, error);
                  });
                });
              } catch (e) {
                console.log("triggerMessage \u932F\u8AA4\uFF1A", e.message);
              }
            }
            result = {
              currentTime: (/* @__PURE__ */ new Date()).toISOString()
            };
            break;
          case "Authorize":
            console.log("Authorize triggered!");
            console.log("payload.idTag:", payload.idTag);
            if (!payload.idTag || payload.idTag.trim() === "") {
              result = {
                idTagInfo: {
                  status: "Invalid"
                }
              };
              console.log("Empty or invalid idTag received.");
              break;
            }
            const foundIdTag = idTagsList.find((tag) => tag.idTag === payload.idTag);
            if (foundIdTag) {
              result = {
                idTagInfo: {
                  status: "Accepted"
                }
              };
            } else {
              result = {
                idTagInfo: {
                  status: "Invalid"
                }
              };
            }
            break;
          case "StartTransaction":
            const { connectorId, idTag, meterStart, timestamp: startTimestamp } = payload;
            try {
              const transactionIdTag = idTagsList.find((tag) => tag.idTag === idTag);
              if (!transactionIdTag) {
                result = {
                  idTagInfo: {
                    status: "Invalid"
                  }
                };
              } else {
                const transactionID = chargers_default.startCharging(client.identity, connectorId, currentTime);
                if (!client.connectors[connectorId]) {
                  client.connectors[connectorId] = {};
                }
                client.connectors[connectorId].transactionId = transactionID;
                client.connectors[connectorId].meterStart = meterStart;
                client.connectors[connectorId].startTimestamp = startTimestamp;
                client.connectors[connectorId].status = "Charging";
                result = {
                  idTagInfo: {
                    status: "Accepted"
                  },
                  transactionId: transactionID
                };
              }
            } catch (e) {
              console.error("StartTransaction error : ", e.message);
            }
            break;
          case "StopTransaction":
            const { transactionId, meterStop, timestamp: stopTimestamp } = payload;
            let stopConnectorId;
            for (const connId in client.connectors) {
              if (client.connectors[connId].transactionId === transactionId) {
                stopConnectorId = connId;
                break;
              }
            }
            if (stopConnectorId) {
              try {
                const meterStart2 = client.connectors[stopConnectorId].meterStart;
                const startTimestamp2 = client.connectors[stopConnectorId].startTimestamp;
                const totalEnergyUsed = meterStop - meterStart2;
                const chargingDuration = new Date(stopTimestamp) - new Date(startTimestamp2);
                const hours = Math.floor(chargingDuration / (1e3 * 60 * 60));
                const minutes = Math.floor(chargingDuration % (1e3 * 60 * 60) / (1e3 * 60));
                const seconds = Math.floor(chargingDuration % (1e3 * 60) / 1e3);
                const recordChargingDuration = `${hours}:${minutes}:${seconds}`;
                chargers_default.stopCharging(transactionId, currentTime, meterStart2, meterStop, totalEnergyUsed, recordChargingDuration);
                monitor_default.OCPPPool.splice(monitor_default.OCPPPool.findIndex((item) => item == client.identity), 1);
                deleteOCPPPool(client.identity);
                client.connectors[stopConnectorId].transactionId = null;
                client.connectors[stopConnectorId].status = "Finishing";
                result = {
                  idTagInfo: {
                    status: "Accepted"
                  }
                };
              } catch (e) {
                console.error("StopTransaction error : ", e.message);
              }
            } else {
              result = {
                idTagInfo: {
                  status: "Invalid"
                }
              };
            }
            break;
          case "StatusNotification":
            const { connectorId: statusConnectorId, status, errorCode, timestamp: statusTimestamp, vendorId, info, VendorErrorCode } = payload;
            try {
              const timestampToConvert = statusTimestamp ? statusTimestamp : (/* @__PURE__ */ new Date()).toISOString();
              const converted_time = convertToTimezoneUTC8(timestampToConvert);
              if (!client.connectors[statusConnectorId]) {
                client.connectors[statusConnectorId] = {};
              }
              if (statusConnectorId == 0) {
                ;
              }
              if (statusConnectorId != 0) {
                if (status == "Available") {
                  const transactionId2 = chargers_default.getTransactionById(client.identity, statusConnectorId);
                  const waitingQueue = monitor_default.getQueueingData();
                  const waitingData = waitingQueue.find((request) => request.transactionId === transactionId2);
                  if (waitingData) {
                    try {
                      const removeRes = monitor_default.shiftQueueingData(transactionId2);
                      if (removeRes.status === "success") {
                        console.log(`Successfully removed ${transactionId2} from waiting queue !`);
                      }
                    } catch (e) {
                      console.error("Removing waitingData error : ", e.message);
                    }
                  }
                  const charger_under_ocpp_control = monitor_default.getAllAvailableOCPPChargers().find((id) => id == client.identity);
                  if (charger_under_ocpp_control)
                    monitor_default.removeOcppControlByChargerId(charger_under_ocpp_control);
                  chargers_default.upsertConnector({
                    chargerId: client.identity,
                    connectorId: statusConnectorId,
                    status,
                    transactionId: null,
                    voltage: null,
                    current: null,
                    WH: null,
                    power: null,
                    soc: null,
                    last_update_time: currentTime
                  });
                } else {
                  const transactionId2 = await chargers_default.getTransactionById(client.identity, statusConnectorId);
                  client.connectors[statusConnectorId].transactionId = transactionId2;
                  chargers_default.upsertConnector({
                    chargerId: client.identity,
                    connectorId: statusConnectorId,
                    status,
                    transactionId: transactionId2,
                    last_update_time: currentTime
                  });
                }
                const StatusChange_body = {
                  "DeviceId": client.identity,
                  "DeviceTime": converted_time,
                  "ConnectorId": statusConnectorId != null ? statusConnectorId.toString() : null,
                  "Status": STATUS_CODE_MAP[status] != null ? STATUS_CODE_MAP[status].toString() : null,
                  "ErrorCode": errorCode != null ? errorCode.toString() : null,
                  "VendorErrorCode": VendorErrorCode != null ? VendorErrorCode.toString() : null
                };
                console.log("StatusChange_body : ", StatusChange_body);
                sendStatusChange(StatusChange_body);
              }
              client.connectors[statusConnectorId].status = status;
              if (vendorId) {
                const oldVendoId = chargers_default.getVendorByChargerId(client.identity);
                if (oldVendoId == "unknown" || vendorId != oldVendoId) {
                  chargers_default.updateCharger(
                    client.identity,
                    { vendorId }
                  );
                }
              }
              if (errorCode != "NoError") {
                const alert_body = {
                  "DeviceId": client.identity,
                  "DeviceTime": converted_time,
                  "ConnectorId": statusConnectorId.toString(),
                  "AlertType": errorCode.toString(),
                  "AlertData": info.toString() || null
                };
                sendAlert(alert_body);
              }
            } catch (err) {
              console.error("StatusNotification error: ", err.message);
            }
            result = {};
            break;
          case "MeterValues":
            const { connectorId: MeterValuesConnectorId } = payload;
            try {
              let getSampledValueByMeasurand = function(sampledValues, measurand) {
                return sampledValues.find((item) => item.measurand === measurand) || null;
              };
              if (!payload.transactionId) return;
              const current = getSampledValueByMeasurand(payload.meterValue[0].sampledValue, "Current.Import") || null;
              const voltage = getSampledValueByMeasurand(payload.meterValue[0].sampledValue, "Voltage") || null;
              const power = getSampledValueByMeasurand(payload.meterValue[0].sampledValue, "Power.Active.Import") || null;
              const WH = getSampledValueByMeasurand(payload.meterValue[0].sampledValue, "Energy.Active.Import.Register") || null;
              const soc = getSampledValueByMeasurand(payload.meterValue[0].sampledValue, "SoC") || null;
              try {
                const connectorData = {
                  chargerId: client.identity,
                  connectorId: MeterValuesConnectorId,
                  transactionId: payload.transactionId,
                  current: (current == null ? void 0 : current.value) != null && !isNaN(Number(current.value)) ? parseFloat(Number(current.value).toFixed(2)) : null,
                  voltage: (voltage == null ? void 0 : voltage.value) != null && !isNaN(Number(voltage.value)) ? parseFloat(Number(voltage.value).toFixed(2)) : null,
                  power: (power == null ? void 0 : power.value) != null && !isNaN(Number(power.value)) ? parseFloat(Number(power.unit === "W" ? power.value / 1e3 : power.value).toFixed(2)) : null,
                  WH: (WH == null ? void 0 : WH.value) != null && !isNaN(Number(WH.value)) ? parseFloat(Number(WH.unit === "Wh" ? WH.value / 1e3 : WH.value).toFixed(2)) : null,
                  soc: (soc == null ? void 0 : soc.value) != null && !isNaN(Number(soc.value)) ? Number(soc.value) : null,
                  last_update_time: currentTime
                };
                const filteredConnectorData = Object.fromEntries(
                  Object.entries(connectorData).filter(([_, value]) => value != null)
                  // 使用 != null 可同時過濾 null 和 undefined
                );
                chargers_default.upsertConnector(filteredConnectorData);
                const converted_time = convertToTimezoneUTC8(payload.meterValue[0].timestamp);
                const sendChargingInfo_body = {
                  "DeviceId": client.identity,
                  "DeviceTime": converted_time,
                  "ConnectorId": MeterValuesConnectorId.toString(),
                  "TransactionId": payload.transactionId ? payload.transactionId.toString() : null,
                  "Voltage": (voltage == null ? void 0 : voltage.value) != null && !isNaN(Number(voltage.value)) ? parseFloat(Number(voltage.value).toFixed(2)) : null,
                  "Current": (current == null ? void 0 : current.value) != null && !isNaN(Number(current.value)) ? parseFloat(Number(current.value).toFixed(2)) : null,
                  "WH": (WH == null ? void 0 : WH.value) != null && !isNaN(Number(WH.value)) ? parseFloat(Number(WH.unit === "Wh" ? WH.value / 1e3 : WH.value).toFixed(2)) : 0,
                  "soc": (soc == null ? void 0 : soc.value) != null && !isNaN(Number(soc.value)) ? Number(soc.value) : null
                };
                console.log("sendChargingInfo_body : ", sendChargingInfo_body);
                sendChargingInfo(sendChargingInfo_body);
              } catch (error) {
                console.log("connectorData error :", error.message);
              }
              if (!client || !client.connectors || Object.keys(client.connectors).length === 0) {
                let charger = chargers_default.getChargerWithConnectorsById(client.identity);
                const connectorIds = charger.map((row) => row.connectorId);
                try {
                  connectorIds.forEach((connectorId2) => {
                    console.log("connectorId : ", connectorId2);
                    const triggerMessagePayload = {
                      requestedMessage: "StatusNotification",
                      connectorId: connectorId2
                      // 這裡直接使用正確的 connectorId
                    };
                    client.call("TriggerMessage", triggerMessagePayload).then((response) => {
                      console.log(`TriggerMessage \u56DE\u61C9\uFF08Connector ${connectorId2}\uFF09\uFF1A`, response);
                    }).catch((error) => {
                      console.error(`TriggerMessage \u5931\u6557\uFF08Connector ${connectorId2}\uFF09\uFF1A`, error);
                    });
                  });
                } catch (e) {
                  console.error("triggerMessage \u932F\u8AA4\uFF1A", e.message);
                }
              }
            } catch (e) {
              console.error("MeterValues error : ", e.message);
            }
            result = {};
            break;
          case "DataTransfer":
            result = {
              status: "Accepted",
              data: "exampleResponseData"
            };
            break;
          case "SetChargingProfile":
            console.log("SetChargingProfile payload:", payload);
            result = {};
            break;
          default:
            throw new Error(`NotImplemented: Unable to handle '${action}' calls`);
        }
        console.log("Sending reply:", result);
        reply(result);
      } catch (error) {
        reply({ error: `NotImplemented: ${error.message}` });
      }
    } else {
      console.log("Received message is not an OCPP Call.");
    }
  });
  client.on("close", () => {
    console.log(`Client disconnected: ${client.identity}`);
    removeClient(client.identity);
  });
  addClient(client);
});
server.listen(5e3, "0.0.0.0").then(() => {
  console.log("OCPP server is listening on ws://0.0.0.0:5000");
  console.log("ws local connect: ws://localhost:5000/ocpp/ws");
  initDb();
  setInterval(() => {
    console.log("rs485 data : ", rs485Service_default.getRS485Data());
    const waitingQueue = monitor_default.getQueueingData();
    console.log(`WaitingQueue now: `, waitingQueue);
    callClients_default();
  }, 15e3);
}).catch((err) => {
  console.error("Failed to start server:", err);
});
app.listen(5001, () => {
  console.log("HTTP server is listening on http://0.0.0.0:5001");
  console.log("You can open controller on http://localhost:5001/ocpp/control.html");
});
