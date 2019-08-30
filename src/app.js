const express = require("express");

class App {
  constructor() {
    this.connection = express();
    this.connection.use(express.json());

    this.routes();
  }

  routes() {
    this.connection.get("/", (req, res) => {
      return res.json({ msg: "server up" });
    });
  }
}
module.exports = new App().connection;
