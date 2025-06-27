var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// controller/clients.js
var clients_exports = {};
__export(clients_exports, {
  addClient: () => addClient,
  getClients: () => getClients,
  initializeClients: () => initializeClients,
  removeClient: () => removeClient,
  updateClient: () => updateClient
});
module.exports = __toCommonJS(clients_exports);
var clients = [];
var getClients = () => clients;
var initializeClients = () => {
  clients = [];
};
var addClient = (clientObj) => {
  clients.push(clientObj);
};
var updateClient = (identity, newClientData) => {
  const index = clients.findIndex((client) => client.identity === identity);
  if (index !== -1) {
    clients[index] = { ...clients[index], ...newClientData };
  }
};
var removeClient = (identity) => {
  clients = clients.filter((client) => client.identity !== identity);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  addClient,
  getClients,
  initializeClients,
  removeClient,
  updateClient
});
