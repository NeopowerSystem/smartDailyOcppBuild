// emit_smartDaily/sendStatusChange.js
import axios from "axios";
function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === "x" ? r : r & 3 | 8;
    return v.toString(16);
  });
}
function convertToTimezoneUTC8(utcDateString) {
  const utcDate = new Date(utcDateString);
  if (isNaN(utcDate.getTime())) {
    throw new Error("Invalid UTC date string");
  }
  const localTime = new Date(utcDate.getTime());
  const year = localTime.getFullYear();
  const month = String(localTime.getMonth() + 1).padStart(2, "0");
  const day = String(localTime.getDate()).padStart(2, "0");
  const hours = String(localTime.getHours()).padStart(2, "0");
  const minutes = String(localTime.getMinutes()).padStart(2, "0");
  const seconds = String(localTime.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+08:00`;
}
async function sendStatusChange({ DeviceId, DeviceTime, ConnectorId, Status, ErrorCode, VendorErrorCode }) {
  const RequestId = generateUUID();
  const date = /* @__PURE__ */ new Date();
  const RequestTime = convertToTimezoneUTC8(date);
  const body = {
    DeviceId,
    RequestId,
    RequestTime,
    DeviceTime,
    ConnectorId,
    Status,
    ErrorCode,
    VendorErrorCode
  };
  console.log("Sending statusChange to smartDaily...");
  const url = "http://localhost:30080/api/v1/EvCharging/Event/StatusChange";
  try {
    const response = await axios.put(url, body, {
      headers: {
        "Authorization": "Bearer zaxb20C3jlV6dX8Dqvy2CpOvcnU7oqsK6mE4HigH",
        "Content-Type": "application/json"
      }
    });
    console.log("Sending statusChange to smartDaily response status code:", response.status);
  } catch (error) {
    console.error("Sending statusChange to smartDaily error:", error.response ? error.response.data : error.message);
  }
}

export {
  sendStatusChange
};
