import {
  monitor_default
} from "./chunk-UEXAQPDG.js";

// api/charging/getWaitingQueue.js
import express from "express";
var router = express.Router();
router.get("/getWaitingQueue", (req, res) => {
  const API_KEY = "neopower_ocpp_key";
  const apiKey = req.headers["neopower-api-key"];
  if (apiKey !== API_KEY) {
    return res.status(403).json({ message: "Forbidden: Invalid API Key" });
  }
  try {
    const waitingQueue = monitor_default.waitingQueue;
    if (!waitingQueue || waitingQueue.length === 0) {
      return res.status(200).json({ message: "Waiting queue is empty..." });
    }
    res.status(200).json({ message: "Waiting queue retrieved successfully", data: waitingQueue });
  } catch (err) {
    res.status(500).json({ message: "Error retrieving waiting queue", error: err.message });
  }
});
var getWaitingQueue_default = router;

export {
  getWaitingQueue_default
};
