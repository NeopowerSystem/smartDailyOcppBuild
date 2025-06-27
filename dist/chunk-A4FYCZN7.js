// controller/clients.js
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

export {
  getClients,
  initializeClients,
  addClient,
  updateClient,
  removeClient
};
