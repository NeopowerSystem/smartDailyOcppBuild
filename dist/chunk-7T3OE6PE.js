import {
  idTags_default
} from "./chunk-6NBZXGOP.js";

// api/idTags/f101_create_idTag.js
import express from "express";
var router = express.Router();
router.post("/idTags", (req, res) => {
  const API_KEY = "neopower_ocpp_key";
  const apiKey = req.headers["neopower-api-key"];
  if (apiKey !== API_KEY) {
    return res.status(403).json({ message: "Forbidden: Invalid API Key" });
  }
  const { idTag, chargerId } = req.body;
  if (!idTag || !chargerId) {
    return res.status(400).json({ message: "idTag and chargerId are required" });
  }
  const existingTag = idTags_default.findIdTag(idTag);
  if (existingTag) {
    return res.status(409).json({ message: "idTag already exists" });
  }
  try {
    idTags_default.saveIdTag(idTag, chargerId);
    res.status(201).json({ message: "idTag created", idTag, chargerId });
  } catch (err) {
    res.status(500).json({ message: "Error saving idTag", error: err.message });
  }
});
var f101_create_idTag_default = router;

export {
  f101_create_idTag_default
};
