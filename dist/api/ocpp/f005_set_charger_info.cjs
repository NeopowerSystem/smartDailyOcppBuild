var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// api/ocpp/f005_set_charger_info.js
var f005_set_charger_info_exports = {};
__export(f005_set_charger_info_exports, {
  default: () => f005_set_charger_info_default
});
module.exports = __toCommonJS(f005_set_charger_info_exports);
var import_express = __toESM(require("express"), 1);

// controller/clients.js
var clients = [];
var getClients = () => clients;

// api/ocpp/f005_set_charger_info.js
var router = import_express.default.Router();
router.post("/set_charger_info", (req, res) => {
  const API_KEY = "neopower_ocpp_key";
  const apiKey = req.headers["neopower-api-key"];
  if (apiKey !== API_KEY) {
    return res.status(403).json({ message: "Forbidden: Invalid API Key" });
  }
  const clients2 = getClients();
  const { chargerId, key, value } = req.body;
  if (!key || !value) {
    return res.status(400).json({ message: "Both key and value must be provided" });
  }
  if (chargerId) {
    const selectedClient = clients2.find((client) => client.identity === chargerId);
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
    const promises = clients2.map((client) => {
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
