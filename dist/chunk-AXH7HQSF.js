import {
  deleteMaxPower,
  getMaxPower,
  getMaxPowerByVendorId,
  insertMaxPower,
  updateMaxPower
} from "./chunk-2OZU7TSS.js";

// api/charging/maxPower.js
import express from "express";
var router = express.Router();
router.get("/maxPower", async (req, res) => {
  const API_KEY = "neopower_ocpp_key";
  const apiKey = req.headers["neopower-api-key"];
  if (apiKey !== API_KEY) {
    return res.status(403).json({ message: "Forbidden: Invalid API Key" });
  }
  try {
    const maxpower = await getMaxPower();
    res.status(200).json({ message: "maxpower retrieved successfully", data: maxpower });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving maxpower", error: error.message });
  }
});
router.post("/maxPower", async (req, res) => {
  const API_KEY = "neopower_ocpp_key";
  const apiKey = req.headers["neopower-api-key"];
  if (apiKey !== API_KEY) {
    return res.status(403).json({ message: "Forbidden: Invalid API Key" });
  }
  const { vendorId, unit, kw_limit } = req.body;
  if (!vendorId || !unit || !kw_limit) {
    return res.status(400).json({ message: "vendorId, unit, kw_limit are required" });
  }
  if (unit != "W" && unit != "A") {
    return res.status(400).json({ message: "unit must be W or A" });
  }
  if (kw_limit < 0 || kw_limit > 10) {
    return res.status(400).json({ message: "kw_limit must be between 0 and 10kw" });
  }
  const existingMaxPower = await getMaxPowerByVendorId(vendorId);
  if (existingMaxPower) {
    return res.status(409).json({ message: `${vendorId}'s maxpower already exists` });
  }
  try {
    await insertMaxPower(vendorId, unit, kw_limit);
    res.status(201).json({ message: "maxpower created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error creating maxpower", error: error.message });
  }
});
router.put("/maxPower/:vendorId", async (req, res) => {
  const API_KEY = "neopower_ocpp_key";
  const apiKey = req.headers["neopower-api-key"];
  if (apiKey !== API_KEY) {
    return res.status(403).json({ message: "Forbidden: Invalid API Key" });
  }
  const { vendorId } = req.params;
  if (!vendorId) {
    return res.status(400).json({ message: "vendorId is required" });
  }
  const body = req.body;
  if (Object.keys(body).length === 0) {
    return res.status(400).json({ message: "body is required" });
  }
  const existingMaxPower = await getMaxPowerByVendorId(vendorId);
  if (!existingMaxPower) {
    return res.status(404).json({ message: "maxpower vendorId not found" });
  }
  try {
    await updateMaxPower(vendorId, body);
    res.status(200).json({ message: "maxpower updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating maxpower", error: error.message });
  }
});
router.delete("/maxPower/:vendorId", async (req, res) => {
  const API_KEY = "neopower_ocpp_key";
  const apiKey = req.headers["neopower-api-key"];
  if (apiKey !== API_KEY) {
    return res.status(403).json({ message: "Forbidden: Invalid API Key" });
  }
  const { vendorId } = req.params;
  if (!vendorId) {
    return res.status(400).json({ message: "vendorId is required" });
  }
  const existingMaxPower = await getMaxPowerByVendorId(vendorId);
  if (!existingMaxPower) {
    return res.status(404).json({ message: "maxpower vendorId not found" });
  }
  try {
    await deleteMaxPower(vendorId);
    res.status(200).json({ message: "maxpower deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting maxpower", error: error.message });
  }
});
var maxPower_default = router;

export {
  maxPower_default
};
