import {
  f105_get_all_client_withRs485_default
} from "./chunk-XDQJX32D.js";
import {
  f104_delete_idTag_default
} from "./chunk-OM5I4KTK.js";
import {
  f001_get_charger_info_default
} from "./chunk-JQODCJJR.js";
import {
  f002_remote_start_charging_default
} from "./chunk-E27IFV2E.js";
import {
  f002_remote_start_charging2_default
} from "./chunk-WUVY4S7O.js";
import {
  f003_remote_stop_charging_default
} from "./chunk-DI56L6B7.js";
import {
  f004_set_charging_profile_default
} from "./chunk-CMB25S6W.js";
import {
  f005_set_charger_info_default
} from "./chunk-U4HWCCXQ.js";
import {
  f006_getCompositeSchedule_default
} from "./chunk-RXYUCGI2.js";
import {
  getWaitingQueue_default
} from "./chunk-FNSIIT3D.js";
import {
  maxPower_default
} from "./chunk-AXH7HQSF.js";
import {
  smartMeter_default
} from "./chunk-ZI67CCC3.js";
import {
  f101_create_idTag_default
} from "./chunk-7T3OE6PE.js";
import {
  f102_read_idTag_default
} from "./chunk-2EJXMVZG.js";
import {
  f103_update_idTag_default
} from "./chunk-MUSTAPFD.js";
import {
  chargingParameter_default
} from "./chunk-PWJ6BKAY.js";

// routes.js
import express from "express";
var router = express.Router();
router.use("/", f101_create_idTag_default);
router.use("/", f102_read_idTag_default);
router.use("/", f103_update_idTag_default);
router.use("/", f104_delete_idTag_default);
router.use("/", f001_get_charger_info_default);
router.use("/", f002_remote_start_charging_default);
router.use("/", f002_remote_start_charging2_default);
router.use("/", f003_remote_stop_charging_default);
router.use("/", f004_set_charging_profile_default);
router.use("/", f005_set_charger_info_default);
router.use("/", f105_get_all_client_withRs485_default);
router.use("/", f006_getCompositeSchedule_default);
router.use("/", chargingParameter_default);
router.use("/", getWaitingQueue_default);
router.use("/", smartMeter_default);
router.use("/", maxPower_default);
var routes_default = router;

export {
  routes_default
};
