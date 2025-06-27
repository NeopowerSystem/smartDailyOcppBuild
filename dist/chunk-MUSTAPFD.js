import {
  idTags_default
} from "./chunk-6NBZXGOP.js";

// api/idTags/f103_update_idTag.js
import express from "express";
var router = express.Router();
router.put("/idTags/:idTag", (req, res) => {
  const API_KEY = "neopower_ocpp_key";
  const apiKey = req.headers["neopower-api-key"];
  if (apiKey !== API_KEY) {
    return res.status(403).json({ message: "Forbidden: Invalid API Key" });
  }
  const { idTag } = req.params;
  const existingTag = idTags_default.findIdTag(idTag);
  if (!existingTag) {
    return res.status(404).json({ message: "idTag not found" });
  }
  const { status } = req.body;
  try {
    idTags_default.updateIdTagStatus(idTag, status);
    res.status(200).json({ message: "idTag status updated", idTag, status });
  } catch (err) {
    res.status(500).json({ message: "Error updating idTag status", error: err.message });
  }
});
var f103_update_idTag_default = router;

export {
  f103_update_idTag_default
};
