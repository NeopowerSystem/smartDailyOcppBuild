import {
  idTags_default
} from "./chunk-6NBZXGOP.js";

// api/idTags/f104_delete_idTag.js
import express from "express";
var router = express.Router();
router.delete("/idTags/:idTag", (req, res) => {
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
  try {
    idTags_default.deleteIdTag(idTag);
    res.status(200).json({ message: "idTag deleted", idTag });
  } catch (err) {
    res.status(500).json({ message: "Error deleting idTag", error: err.message });
  }
});
var f104_delete_idTag_default = router;

export {
  f104_delete_idTag_default
};
