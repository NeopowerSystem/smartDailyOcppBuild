import {
  rs485Service_default
} from "./chunk-OWYJXJ3N.js";
import {
  chargers_default
} from "./chunk-OJ7DMOMU.js";
import {
  getClients
} from "./chunk-A4FYCZN7.js";

// api/ocpp/f105_get_all_client_withRs485.js
import express from "express";
var router = express.Router();
var STATUS_CODE_MAP = {
  "Available": 0,
  "Preparing": 1,
  "Charging": 2,
  "Finishing": 3,
  "Unavailable": 4,
  "Faulted": 5,
  "Offline": 6,
  "SuspendedEVSE": 7,
  "SuspendedEV": 8,
  "Reserved": 9
};
router.post("/getAllClient", async (req, res) => {
  const API_KEY = "neopower_ocpp_key";
  const apiKey = req.headers["neopower-api-key"];
  if (apiKey !== API_KEY) {
    return res.status(403).json({ message: "Forbidden: Invalid API Key" });
  }
  try {
    let chargers = chargers_default.getChargerWithConnectors();
    const clients = getClients();
    let formattedChargers = [];
    if (chargers.length) {
      chargers = chargers.filter(
        (charger) => clients.some((client) => client.identity === charger.chargerId)
      );
      formattedChargers = chargers.reduce((acc, row) => {
        const {
          chargerId,
          vendorId,
          connectorId,
          status: connectorStatus,
          transactionId,
          voltage,
          current,
          WH,
          power,
          soc
        } = row;
        let charger = acc.find((item) => item.chargerId === chargerId);
        if (!charger) {
          charger = {
            chargerId,
            vendorId,
            connectors: []
          };
          acc.push(charger);
        }
        if (connectorId) {
          const statusCode = STATUS_CODE_MAP[connectorStatus] ?? -1;
          const connectorInfo = {
            connectorId,
            status_code: statusCode,
            transactionId,
            voltage,
            current,
            WH,
            power,
            soc
          };
          const filteredConnectorInfo = Object.fromEntries(
            Object.entries(connectorInfo).filter(([_, value]) => value != null)
          );
          charger.connectors.push(filteredConnectorInfo);
        }
        return acc;
      }, []);
    }
    const rs485Raw = rs485Service_default.getRS485Data();
    const formattedRs485 = rs485Raw.map((data) => {
      const connectors = data.connectors && data.connectors.length > 0 ? data.connectors.map((connector) => {
        const formattedConnector = {};
        if (connector.connectorId != null) formattedConnector.connectorId = connector.connectorId;
        if (connector.status != null) formattedConnector.status_code = STATUS_CODE_MAP[connector.status] ?? -1;
        if (connector.transactionId != null) formattedConnector.transactionId = connector.transactionId;
        if (connector.voltage != null) formattedConnector.voltage = connector.voltage;
        if (connector.current != null) formattedConnector.current = connector.current;
        if (connector.power != null) formattedConnector.power = connector.power;
        return formattedConnector;
      }) : [];
      return {
        chargerId: data.chargerId,
        vendorId: data.vendorId,
        connectors
        // 只有在 connectors 有資料時才加上 connectors
      };
    });
    formattedRs485.forEach((rs485Item) => {
      let charger = formattedChargers.find((item) => item.chargerId === rs485Item.chargerId);
      if (charger) {
        charger.connectors.push(...rs485Item.connectors);
      } else {
        formattedChargers.push(rs485Item);
      }
    });
    if (!formattedChargers.length) {
      return res.status(200).json({ message: "There is no charging station connected..." });
    }
    res.status(200).json(formattedChargers);
  } catch (err) {
    res.status(500).json({ message: "Can not get all client information", error: err.message });
  }
});
var f105_get_all_client_withRs485_default = router;

export {
  f105_get_all_client_withRs485_default
};
