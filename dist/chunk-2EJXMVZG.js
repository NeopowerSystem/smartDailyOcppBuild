import {
  idTags_default
} from "./chunk-6NBZXGOP.js";

// api/idTags/f102_read_idTag.js
import express from "express";
var router = express.Router();
router.get("/idTags", (req, res) => {
  const API_KEY = "neopower_ocpp_key";
  const apiKey = req.headers["neopower-api-key"];
  if (apiKey !== API_KEY) {
    return res.status(403).json({ message: "Forbidden: Invalid API Key" });
  }
  try {
    const idTags = idTags_default.loadIdTags();
    res.status(200).json({ idTags });
  } catch (err) {
    res.status(500).json({ message: "Error loading idTags", error: err.message });
  }
});
var f102_read_idTag_default = router;

export {
  f102_read_idTag_default
};
