import {
  getClients
} from "./chunk-A4FYCZN7.js";

// api/ocpp/f005_set_charger_info.js
import express from "express";
var router = express.Router();
router.post("/set_charger_info", (req, res) => {
  const API_KEY = "neopower_ocpp_key";
  const apiKey = req.headers["neopower-api-key"];
  if (apiKey !== API_KEY) {
    return res.status(403).json({ message: "Forbidden: Invalid API Key" });
  }
  const clients = getClients();
  const { chargerId, key, value } = req.body;
  if (!key || !value) {
    return res.status(400).json({ message: "Both key and value must be provided" });
  }
  if (chargerId) {
    const selectedClient = clients.find((client) => client.identity === chargerId);
    if (!selectedClient) {
      return res.status(404).json({ message: `Charger with ID ${chargerId} not found` });
    }
    selectedClient.call("ChangeConfiguration", { key, value }).then((response) => {
      console.log("ChangeConfigurationResponse received:", response);
      res.json({ message: "ChangeConfiguration command sent", response });
    }).catch((error) => {
      console.error("ChangeConfiguration failed:", error);
      res.status(500).json({ message: "ChangeConfiguration failed", error });
    });
  } else {
    const responses = [];
    const promises = clients.map((client) => {
      return client.call("ChangeConfiguration", { key, value }).then((response) => {
        console.log("ChangeConfigurationResponse received:", response);
        responses.push({ clientId: client.identity, response });
      }).catch((error) => {
        console.error("ChangeConfiguration failed:", error);
        responses.push({ clientId: client.identity, error });
      });
    });
    Promise.all(promises).then(() => {
      res.json({
        message: "ChangeConfiguration command sent to all chargers",
        responses
      });
    }).catch((error) => {
      res.status(500).json({
        message: "ChangeConfiguration failed for one or more chargers",
        error
      });
    });
  }
});
var f005_set_charger_info_default = router;

export {
  f005_set_charger_info_default
};
