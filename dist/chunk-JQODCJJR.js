import {
  rs485Service_default
} from "./chunk-4NTWRYNR.js";
import {
  getClients
} from "./chunk-A4FYCZN7.js";

// api/ocpp/f001_get_charger_info.js
import express from "express";
var router = express.Router();
router.post("/getChargerInfo", async (req, res) => {
  const API_KEY = "neopower_ocpp_key";
  const apiKey = req.headers["neopower-api-key"];
  if (apiKey !== API_KEY) {
    return res.status(403).json({ message: "Forbidden: Invalid API Key" });
  }
  const { chargerId, keys } = req.body;
  const keysArray = keys ? keys.split(",") : [];
  const clients = getClients();
  if (chargerId) {
    const selectedRs485Client = await rs485Service_default.getRS485Data().find((chargers) => chargers.chargerId === chargerId);
    if (selectedRs485Client) {
      return res.status(409).json({ message: `Charger with ID ${chargerId} is smart meter...` });
    }
    const selectedClient = clients.find((client) => client.identity === chargerId);
    if (!selectedClient) {
      return res.status(404).json({ message: `Charger with ID ${chargerId} not found` });
    }
    selectedClient.call("GetConfiguration", {
      key: keysArray
      // 使用提供的 keysArray 或空數組
    }).then((response) => {
      res.status(200).json({ message: "GetChargerInfo command sent", response });
    }).catch((error) => {
      res.status(500).json({ message: "GetChargerInfo failed", error });
    });
  } else {
    const responses = [];
    const promises = clients.map(
      (client) => client.call("GetConfiguration", {
        key: keysArray
        // 使用提供的 keysArray 或空數組
      }).then((response) => {
        responses.push({ chargerId: client.identity, response });
      }).catch((error) => {
        responses.push({ chargerId: client.identity, error });
      })
    );
    Promise.all(promises).then(() => {
      res.status(200).json({ message: "GetChargerInfo command sent to all chargers", responses });
    }).catch((error) => {
      res.status(500).json({ message: "GetChargerInfo failed", error });
    });
  }
});
var f001_get_charger_info_default = router;

export {
  f001_get_charger_info_default
};
