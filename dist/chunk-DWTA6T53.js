import {
  getSmartMeterPool,
  insertSmartMeterPool
} from "./chunk-QEA4XCZI.js";
import {
  deleteWaitingQueueByTransactionId,
  getWaitingQueue,
  insertWaitingQueue,
  tableExists
} from "./chunk-CW3GZA5T.js";
import {
  getOCPPPool,
  insertOCPPPool
} from "./chunk-ZWLPHOEW.js";
import {
  chargers_default
} from "./chunk-OJ7DMOMU.js";
import {
  getChargingParameter
} from "./chunk-CRM4X7FN.js";
import {
  idTags_default
} from "./chunk-6NBZXGOP.js";
import {
  getMaxPower
} from "./chunk-2OZU7TSS.js";
import {
  getCurrentTimestamp
} from "./chunk-7LYFSOHO.js";

// api/charging/monitor.js
import axios from "axios";
import dotenv from "dotenv";
var Monitor = class {
  constructor(intervalTime = 5e3) {
    this.interval = null;
    this.chargerInfoUrl = "/ocppAPI/getAllClient";
    this.Allchargers = [];
    this.OCPPPool = [];
    this.smartMeterPool = [];
    this.waitingQueue = [];
    this.config = [];
    this.apiClient = axios.create({
      baseURL: "http://localhost:5001",
      headers: {
        "Content-Type": "application/json",
        "neopower-api-key": "neopower_ocpp_key"
      }
    });
    this.initializeFromDB();
  }
  // Monitor 開始運作時，從資料庫初始化狀態，避免程式重啟後，狀態消失
  async initializeFromDB() {
    try {
      if (!tableExists("waitingQueue") || !tableExists("OCPPPool") || !tableExists("SmartMeterPool")) {
        console.warn("waitinQueue\u521D\u59CB\u5316\u7565\u904E\uFF0C\u56E0\u70BA\u90E8\u5206\u8CC7\u6599\u8868\u5C1A\u672A\u5EFA\u7ACB\u3002");
        return;
      }
      const waitingQueueData = getWaitingQueue();
      if (waitingQueueData && waitingQueueData.length > 0) {
        this.waitingQueue = waitingQueueData;
        console.log("\u5DF2\u5F9E\u8CC7\u6599\u5EAB\u6062\u5FA9 waitingQueue \u72C0\u614B");
      }
      const ocppPoolData = getOCPPPool();
      if (ocppPoolData && ocppPoolData.length > 0) {
        this.OCPPPool = ocppPoolData.map((item) => item.chargerId);
        console.log("\u5DF2\u5F9E\u8CC7\u6599\u5EAB\u6062\u5FA9 OCPPPool \u72C0\u614B");
      }
      const smartMeterPoolData = getSmartMeterPool();
      if (smartMeterPoolData && smartMeterPoolData.length > 0) {
        this.smartMeterPool = smartMeterPoolData.map((item) => ({
          chargerId: item.chargerId,
          limit: item.power
        }));
        console.log("\u5DF2\u5F9E\u8CC7\u6599\u5EAB\u6062\u5FA9 smartMeterPool \u72C0\u614B");
        this.checkChargingParameters();
      }
    } catch (error) {
      console.error("\u5F9E\u8CC7\u6599\u5EAB\u521D\u59CB\u5316\u72C0\u614B\u6642\u767C\u751F\u932F\u8AA4\uFF1A", error);
    }
  }
  async fetchChargingConfig() {
    try {
      const chargersResponse = await this.apiClient.post(this.chargerInfoUrl);
      if (chargersResponse.data && chargersResponse.data[0].chargerId) {
        const filteredChargers = chargersResponse.data.map((charger) => ({
          chargerId: charger.chargerId,
          vendorId: charger.vendorId,
          firstConnector: charger.connectors[0]
          // 只取第一個 connector
        }));
        this.Allchargers = filteredChargers;
      }
      this.config = getChargingParameter()[0];
      if (!this.config) {
        console.log("\u5145\u96FB\u53C3\u6578\u5C1A\u672A\u914D\u7F6E\uFF0C\u8ACB\u67E5\u770B\u914D\u7F6E\u60C5\u6CC1\u6216\u524D\u5F80http://localhost:5001/ocpp/dashbord.html\u9032\u884C\u914D\u7F6E....");
        return;
      }
      this.checkChargingParameters();
    } catch (error) {
      console.error(`${getCurrentTimestamp()} Error fetching data:`, error.message);
    }
  }
  //演算法
  async checkChargingParameters() {
    this.processWaitingQueue();
    const chargers_unarranged = this.Allchargers.filter(
      (charger) => this.OCPPPool.includes(charger.chargerId)
      // 檢查this.Allchargers中的chargerId是否存在於chargerIds陣列
    );
    if (chargers_unarranged.length || this.smartMeterPool.length) {
      const available_power = this.config.contract_capacity - this.config.reserve_value - this.calSmartMeterPower();
      console.log(`\u76EE\u524D\u5951\u7D04\u5BB9\u91CF:-\u9810\u7559\u503C: ${this.config.contract_capacity} - ${this.config.reserve_value} =`, this.config.contract_capacity - this.config.reserve_value, "kW");
      console.log("\u76EE\u524DOCPP\u53EF\u7528\u96FB\u91CF : ", available_power, "kW");
      console.log("\u76EE\u524D\u96FB\u8868\u4F7F\u7528\u72C0\u6CC1 : ", this.smartMeterPool);
      console.log("\u76EE\u524DOCPP\u4F7F\u7528\u72C0\u6CC1 : ", this.OCPPPool);
      if (this.config.charging_mode == 0) {
        return;
      }
      if (this.config.charging_mode == 1) {
        const charging_chargers = chargers_unarranged.filter(
          (charger) => charger.firstConnector && charger.firstConnector.status_code == 2
        );
        const preparing_chargers = chargers_unarranged.filter(
          (charger) => charger.firstConnector && charger.firstConnector.status_code == 1
        );
        const maxPowerArray = await getMaxPower();
        const maxChargingPower = charging_chargers.reduce(async (sum, charger) => {
          const vendorId = charger.vendorId;
          const limit = await this.getPowerLimit(vendorId, maxPowerArray);
          return sum + limit;
        }, 0);
        const maxPreparingPower = preparing_chargers.reduce(async (sum, charger) => {
          const vendorId = charger.vendorId;
          const limit = await this.getPowerLimit(vendorId, maxPowerArray);
          return sum + limit;
        }, 0);
        const totalMaxPower = maxChargingPower + maxPreparingPower;
        const totalChargerCount = charging_chargers.length + preparing_chargers.length;
        const arrange_power = available_power / totalChargerCount;
        if (charging_chargers.length && preparing_chargers.length && available_power > 0) {
          if (available_power > totalMaxPower) {
            this.startCharging(preparing_chargers);
            this.setCharging(charging_chargers);
          } else {
            charging_chargers.forEach(async (charger) => {
              const vendorId = charger.vendorId;
              const limit = await this.getPowerLimit(vendorId, maxPowerArray);
              const power = Math.min(arrange_power, limit);
              this.setCharging([charger], power.toFixed(2));
            });
            preparing_chargers.forEach(async (charger) => {
              const vendorId = charger.vendorId;
              const limit = await this.getPowerLimit(vendorId, maxPowerArray);
              const power = Math.min(arrange_power, limit);
              this.startCharging([charger], power.toFixed(2));
            });
          }
        }
        if (charging_chargers.length && !preparing_chargers.length && available_power > 0) {
          if (available_power > totalMaxPower) {
            this.setCharging(charging_chargers);
          } else {
            charging_chargers.forEach(async (charger) => {
              const vendorId = charger.vendorId;
              const limit = await this.getPowerLimit(vendorId, maxPowerArray);
              const power = Math.min(arrange_power, limit);
              this.setCharging([charger], power.toFixed(2));
            });
          }
        }
        if (!charging_chargers.length && preparing_chargers.length && available_power > 0) {
          if (available_power > totalMaxPower) {
            this.startCharging(preparing_chargers);
          } else {
            preparing_chargers.forEach(async (charger) => {
              const vendorId = charger.vendorId;
              const limit = await this.getPowerLimit(vendorId, maxPowerArray);
              const power = Math.min(arrange_power, limit);
              this.startCharging([charger], power.toFixed(2));
            });
          }
        }
      }
      if (this.config.charging_mode == 2) {
        return;
      }
    }
  }
  // 依照 vendorId 及 arrangePower 轉換成充電資訊(W或A)
  async getChargingRate(vendorId, arrangePower) {
    try {
      const maxPowerArray = await getMaxPower();
      const vendorConfig = maxPowerArray.find(
        (item) => item.vendorId === vendorId
      );
      if (!vendorConfig) {
        console.error(`\u672A\u914D\u7F6E ${vendorId} \u7684\u529F\u7387\u9650\u5236`);
        return { rate: 0, unit: "W" };
      }
      if (arrangePower !== null && arrangePower !== void 0) {
        if (vendorConfig.unit === "W") {
          return { rate: Math.floor(arrangePower * 1e3), unit: "W" };
        } else if (vendorConfig.unit === "A") {
          return { rate: Math.floor(arrangePower * 1e3 / 220), unit: "A" };
        }
      }
      if (vendorConfig.unit === "W") {
        return { rate: vendorConfig.kw_limit * 1e3, unit: "W" };
      } else {
        return { rate: Math.floor(vendorConfig.kw_limit * 1e3 / 220), unit: "A" };
      }
    } catch (error) {
      console.error(`\u7372\u53D6\u5145\u96FB\u7387\u6642\u767C\u751F\u932F\u8AA4: ${error.message}`);
      return { rate: 0, unit: "W" };
    }
  }
  // 啟動充電
  async startCharging(prepareChargers, arrangePower = null) {
    try {
      for (let i = 0; i < prepareChargers.length; i++) {
        const idTag = await idTags_default.findIdTagByChargerId(prepareChargers[i].chargerId).idTag;
        const chargingRate = await this.getChargingRate(prepareChargers[i].vendorId, arrangePower);
        const requestData = {
          chargerId: prepareChargers[i].chargerId,
          idTag,
          connectorId: 1,
          chargingRate: chargingRate.rate,
          chargingRateUnit: chargingRate.unit
        };
        console.log("startCharging requestData:", requestData);
        await this.apiClient.post("/ocppAPI/remoteStartCharging2", requestData);
      }
    } catch (error) {
      console.error(`${getCurrentTimestamp()} Error starting charger:`, error.message);
    }
  }
  // 設定充電
  async setCharging(chargingChargers, arrangePower = null) {
    try {
      for (let i = 0; i < chargingChargers.length; i++) {
        const chargingRate = await this.getChargingRate(chargingChargers[i].vendorId, arrangePower);
        const requestData = {
          chargerId: chargingChargers[i].chargerId,
          connectorId: 1,
          control_unit: chargingRate.unit,
          limit: chargingRate.rate
        };
        console.log("setCharging requestData:", requestData);
        await this.apiClient.post("/ocppAPI/setChargingProfile", requestData);
      }
    } catch (error) {
      console.error(`${getCurrentTimestamp()} Error setting charging profile for charger:`, error.message);
    }
  }
  // 充電或排隊
  async chargeOrQueue(chargerId, isSmartMeter = false, transactionId) {
    if (isSmartMeter) {
      const isCharging = this.smartMeterPool.some((item) => item.chargerId === chargerId);
      if (isCharging) {
        return;
      }
    } else {
      const isCharging = this.OCPPPool.includes(chargerId);
      if (isCharging) {
        return;
      }
    }
    const isQueuing = this.waitingQueue.some((item) => item.chargerId === chargerId);
    if (isQueuing) {
      return;
    }
    const newRequest = { chargerId, isSmartMeter, transactionId };
    this.waitingQueue.push(newRequest);
    insertWaitingQueue(chargerId, isSmartMeter, transactionId);
    const result = await this.processWaitingQueue(chargerId);
    return result;
  }
  // 取得最大功率限制
  async getPowerLimit(vendorId, maxPowerArray) {
    try {
      const vendorConfig = maxPowerArray.find((item) => item.vendorId === vendorId);
      if (!vendorConfig) {
        console.error(`\u672A\u914D\u7F6E ${vendorId} \u7684\u529F\u7387\u9650\u5236`);
        return 0;
      }
      return vendorConfig.kw_limit;
    } catch (error) {
      console.error(`\u7372\u53D6 ${vendorId} \u529F\u7387\u9650\u5236\u6642\u767C\u751F\u932F\u8AA4:`, error.message);
      return 0;
    }
  }
  async processWaitingQueue(chargerId = null) {
    if (this.waitingQueue.length == 0) {
      console.log("There is no car in queue ...");
      return;
    }
    if (this.isProcessing) {
      console.log("ProcessWaitingQueue is processing in progress, please wait...");
      return;
    }
    const totalPower = await this.calTotalPower();
    const totalPower2 = await this.calTotalPower2();
    const maxPowerArray = await getMaxPower();
    const availableCapacity = this.config.contract_capacity - this.config.reserve_value;
    console.log("\u7576\u524D\u53EF\u7528\u529F\u7387 : ", this.calculateAvailablePower());
    console.log("totalPower : ", totalPower);
    console.log("totalPower2 : ", totalPower2);
    console.log("availableCapacity : ", availableCapacity);
    let smartMeterQueue = this.waitingQueue.filter((q) => q.isSmartMeter);
    let nonSmartMeterQueue = this.waitingQueue.filter((q) => !q.isSmartMeter);
    const nextChargerVendorId = chargers_default.getVendorByChargerId(this.waitingQueue[0].chargerId);
    const nextChargerMaxPower = await this.getPowerLimit(nextChargerVendorId, maxPowerArray);
    if (availableCapacity - totalPower > nextChargerMaxPower) {
      const nextSmartMeter = smartMeterQueue[0];
      if (smartMeterQueue.length > 0) {
        const vendorId = chargers_default.getVendorByChargerId(nextSmartMeter.chargerId);
        const limit = await this.getPowerLimit(vendorId, maxPowerArray);
        this.startCharging([{ chargerId: nextSmartMeter.chargerId, vendorId }], limit);
        this.smartMeterPool.push({
          chargerId: nextSmartMeter.chargerId,
          vendorId,
          limit
        });
        insertSmartMeterPool(nextSmartMeter.chargerId, vendorId, limit);
        return;
      } else {
        const nextNonSmartMeter = nonSmartMeterQueue[0];
        const newChargers = this.Allchargers.filter((charger) => charger.chargerId == nextNonSmartMeter.chargerId).map((charger) => charger.chargerId).filter((chargerId2) => !this.OCPPPool.includes(chargerId2));
        this.OCPPPool.push(...newChargers);
        await Promise.all(newChargers.map((chargerId2) => insertOCPPPool(chargerId2)));
        return;
      }
    }
    console.log("---------------- \u96FB\u91CF\u4E0D\u8DB3\uFF0C\u4F7F\u7528\u5747\u6D41\u6392\u7A0B --------------------");
    if (smartMeterQueue.length > 0 && this.smartMeterPool.length < this.config.smart_meter_num) {
      const nextSmartMeterVendorId = chargers_default.getVendorByChargerId(smartMeterQueue[0].chargerId);
      if (availableCapacity - totalPower2 >= await this.getPowerLimit(nextSmartMeterVendorId, maxPowerArray)) {
        const nextSmartMeter = smartMeterQueue[0];
        const vendorId = chargers_default.getVendorByChargerId(nextSmartMeter.chargerId);
        const limit = await this.getPowerLimit(vendorId, maxPowerArray);
        this.startCharging([{ chargerId: nextSmartMeter.chargerId, vendorId }], limit);
        this.smartMeterPool.push({
          chargerId: nextSmartMeter.chargerId,
          vendorId,
          limit
        });
        insertSmartMeterPool(nextSmartMeter.chargerId, vendorId, limit);
        if (chargerId) {
          if (chargerId == nextSmartMeter.chargerId)
            return { message: `${chargerId} ready to start...` };
          else
            return { message: `Add ${chargerId} into waiting queue...` };
        }
        this.isProcessing = true;
        console.log("Processing started, locking function for 60 seconds to wait rs485 refresh...");
        setTimeout(() => {
          this.isProcessing = false;
          console.log("Function unlocked, ready to process again.");
        }, 6e4);
      } else {
        if (chargerId)
          return { message: `Add ${chargerId} into waiting queue...` };
      }
    } else {
      if (nonSmartMeterQueue.length > 0) {
        if (availableCapacity - this.calSmartMeterPower() - 2 * this.OCPPPool.length >= 2) {
          const nextNonSmartMeter = nonSmartMeterQueue[0];
          const newChargers = this.Allchargers.filter((charger) => charger.chargerId == nextNonSmartMeter.chargerId).map((charger) => charger.chargerId).filter((chargerId2) => !this.OCPPPool.includes(chargerId2));
          this.OCPPPool.push(...newChargers);
          await Promise.all(newChargers.map((chargerId2) => insertOCPPPool(chargerId2)));
          if (chargerId)
            return { message: `${chargerId} ready to start...` };
        } else {
          if (chargerId)
            return { message: `Add ${chargerId} into waiting queue...` };
        }
      }
    }
    return true;
  }
  // OCPP樁數最大用量總和 + 智慧電表容量總和
  async calTotalPower() {
    let totalOCPPPower = 0;
    const totalSmartMeterPower = this.calSmartMeterPower();
    const maxPowerArray = await getMaxPower();
    for (const charger of this.Allchargers) {
      if (this.OCPPPool.includes(charger.chargerId)) {
        const limit = await this.getPowerLimit(charger.vendorId, maxPowerArray);
        totalOCPPPower += limit;
      }
    }
    return totalOCPPPower + totalSmartMeterPower;
  }
  // OCPP樁數*2 + 智慧電表容量總和
  async calTotalPower2() {
    const totalSmartMeterPower = this.calSmartMeterPower();
    let totalOCPPPower = 0;
    for (const charger of this.Allchargers) {
      if (this.OCPPPool.includes(charger.chargerId)) {
        totalOCPPPower += 2;
      }
    }
    return totalOCPPPower + totalSmartMeterPower;
  }
  // 計算當前可用功率
  calculateAvailablePower() {
    let available_power = this.config.contract_capacity - this.config.reserve_value;
    this.Allchargers.forEach((charger) => {
      if (this.OCPPPool.includes(charger.chargerId)) {
        available_power -= charger.firstConnector.power;
      }
    });
    this.smartMeterPool.forEach((smartMeter) => {
      if (smartMeter.limit) {
        available_power -= smartMeter.limit;
      }
    });
    return available_power;
  }
  // 計算智慧電表容量總和
  calSmartMeterPower() {
    let power = 0;
    this.smartMeterPool.forEach((smartMeter) => {
      power += smartMeter.limit;
    });
    return power;
  }
  // 計算OCPP樁數總和
  calOCPPPower() {
    let power = 0;
    this.Allchargers.forEach((charger) => {
      this.OCPPPool.forEach((id) => {
        if (id == charger.chargerId) {
          power += charger.firstConnector.power;
        }
      });
    });
    return power;
  }
  // // 計算當前使用功率
  // calculateUsingPower() {
  //   let power =0;
  //   this.Allchargers.forEach(charger => {
  //     if (charger.firstConnector && charger.firstConnector.power) {
  //       power += charger.firstConnector.power;
  //     }
  //   });
  //   return power;
  // }
  getQueueingData() {
    return this.waitingQueue;
  }
  getAllOCPPPool() {
    return this.OCPPPool;
  }
  // 將充電樁從 OCPPPool 中移除
  removeOcppControlByChargerId(chargerId) {
    this.OCPPPool = this.OCPPPool.filter((id) => id !== chargerId);
  }
  shiftQueueingData(transactionId) {
    const index = this.waitingQueue.findIndex((request) => request.transactionId === transactionId);
    if (index !== -1) {
      this.waitingQueue.splice(index, 1);
      deleteWaitingQueueByTransactionId(transactionId);
      return {
        status: "success",
        message: `${transactionId} has been removed from waiting queue.`
      };
    } else {
      return {
        status: "error",
        message: `${transactionId} not found in waiting queue.`
      };
    }
  }
  start(intervalTime = 5e3) {
    if (this.interval) {
      console.warn("Monitor is already running.");
      return;
    }
    this.fetchChargingConfig().then(() => {
      this.interval = setInterval(() => this.fetchChargingConfig(), intervalTime);
    });
  }
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      console.log(`${getCurrentTimestamp()} Monitor stopped.`);
    } else {
      console.log(`${getCurrentTimestamp()} Monitor is not running.`);
    }
  }
};
var monitorInstance = new Monitor();
monitorInstance.start(15e3);
var monitor_default = monitorInstance;
if (import.meta.url === "file://" + process.argv[1]) {
  monitorInstance.start(15e3);
}

export {
  monitor_default
};
