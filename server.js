require("dotenv").config();

const favilances = require("./src/favilances.js");
const conf = require("./config/conf.json");
const Client = new favilances();

Client.start({
});

