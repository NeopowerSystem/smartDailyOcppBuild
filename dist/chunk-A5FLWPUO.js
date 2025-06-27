import {
  rs485Service_default
} from "./chunk-OWYJXJ3N.js";
import {
  deleteSmartMeter,
  getSmartMeterByHost,
  getSmartMeterById,
  getSmartMeters,
  insertSmartMeter,
  updateSmartMeter
} from "./chunk-FI3RUCZS.js";

// api/charging/smartMeter.js
import express from "express";
var router = express.Router();
router.get("/smartMeter", async (req, res) => {
  const API_KEY = "neopower_ocpp_key";
  const apiKey = req.headers["neopower-api-key"];
  if (apiKey !== API_KEY) {
    return res.status(403).json({ message: "Forbidden: Invalid API Key" });
  }
  try {
    const smartMeters = await getSmartMeters();
    res.status(200).json({ message: "Smart meter retrieved successfully", data: smartMeters });
  } catch (err) {
    res.status(500).json({ message: "Error retrieving smart meters", error: err.message });
  }
});
router.post("/smartMeter", async (req, res) => {
  const API_KEY = "neopower_ocpp_key";
  const apiKey = req.headers["neopower-api-key"];
  if (apiKey !== API_KEY) {
    return res.status(403).json({ message: "Forbidden: Invalid API Key" });
  }
  const { deviceId, host, port, vendorId } = req.body;
  if (!deviceId || !host || !port || !vendorId) {
    return res.status(400).json({ message: "deviceId, host, port, vendorId are required" });
  }
  const existingSmartMeter = await getSmartMeterByHost(host);
  if (existingSmartMeter) {
    return res.status(409).json({ message: "Smart meter host already exists" });
  }
  try {
    await insertSmartMeter(deviceId, host, port, vendorId);
    res.status(201).json({ message: "Smart meter created successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error creating smart meter", error: err.message });
  }
});
router.put("/smartMeter/:id", async (req, res) => {
  const API_KEY = "neopower_ocpp_key";
  const apiKey = req.headers["neopower-api-key"];
  if (apiKey !== API_KEY) {
    return res.status(403).json({ message: "Forbidden: Invalid API Key" });
  }
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: "id is required" });
  }
  const body = req.body;
  if (Object.keys(body).length === 0) {
    return res.status(400).json({ message: "body is required" });
  }
  const existingSmartMeter = await getSmartMeterById(id);
  if (!existingSmartMeter) {
    return res.status(404).json({ message: "Smart meter id not found" });
  }
  try {
    await updateSmartMeter(id, body);
    res.status(200).json({ message: "Smart meter updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error updating smart meter", error: err.message });
  }
});
router.delete("/smartMeter/:id", async (req, res) => {
  const API_KEY = "neopower_ocpp_key";
  const apiKey = req.headers["neopower-api-key"];
  if (apiKey !== API_KEY) {
    return res.status(403).json({ message: "Forbidden: Invalid API Key" });
  }
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: "id is required" });
  }
  const existingSmartMeter = await getSmartMeterById(id);
  if (!existingSmartMeter) {
    return res.status(404).json({ message: "Smart meter id not found" });
  }
  try {
    await deleteSmartMeter(id);
    res.status(200).json({ message: "Smart meter deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting smart meter", error: err.message });
  }
});
router.put("/smartMeter/isOpen/:params", async (req, res) => {
  let { params } = req.params;
  if (params != 0 && params != 1) {
    return res.status(400).json({ message: "params must be 0 or 1" });
  }
  if (params == 1) {
    params = true;
    rs485Service_default.setIsOpen(params);
    res.status(200).json({ message: "Smart meter is Open successfully" });
  }
  if (params == 0) {
    params = false;
    rs485Service_default.setIsOpen(params);
    res.status(200).json({ message: "Smart meter is Close successfully" });
  }
});
var smartMeter_default = router;

export {
  smartMeter_default
};
