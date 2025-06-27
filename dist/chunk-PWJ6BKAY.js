import {
  createChargingParameter,
  getChargingParameter,
  updateChargingParameter
} from "./chunk-CRM4X7FN.js";

// api/charging/chargingParameter.js
import express from "express";
var router = express.Router();
router.get("/chargingParameter", (req, res) => {
  const API_KEY = "neopower_ocpp_key";
  const apiKey = req.headers["neopower-api-key"];
  if (apiKey !== API_KEY) {
    return res.status(403).json({ message: "Forbidden: Invalid API Key" });
  }
  try {
    const chargingParameter = getChargingParameter()[0];
    if (!chargingParameter) {
      return res.status(404).json({
        message: "Charging parameter not exists"
      });
    }
    res.status(200).json({
      message: "Charging parameter retrieved successfully",
      data: chargingParameter
    });
  } catch (err) {
    res.status(500).json({
      message: "Error retrieving charging parameter",
      error: err.message
    });
  }
});
router.post("/chargingParameter", (req, res) => {
  const API_KEY = "neopower_ocpp_key";
  const apiKey = req.headers["neopower-api-key"];
  if (apiKey !== API_KEY) {
    return res.status(403).json({ message: "Forbidden: Invalid API Key" });
  }
  const { contract_capacity, smart_meter_num, charging_mode, reserve_value } = req.body;
  if (!contract_capacity || !smart_meter_num || !charging_mode || !reserve_value) {
    return res.status(400).json({ message: "contract_capacity, smart_meter_num, charging_mode, reserve_value are required" });
  }
  try {
    const chargingParameter = getChargingParameter()[0];
    if (chargingParameter) {
      updateChargingParameter(contract_capacity, smart_meter_num, charging_mode, reserve_value);
      res.status(200).json({ message: "Charging parameter updated successfully" });
    } else {
      createChargingParameter(contract_capacity, smart_meter_num, charging_mode, reserve_value);
      res.status(201).json({ message: "Charging parameter created successfully" });
    }
  } catch (err) {
    res.status(500).json({
      message: "Error creating charging parameter",
      error: err.message
    });
  }
});
var chargingParameter_default = router;

export {
  chargingParameter_default
};
