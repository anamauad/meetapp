import express, { json } from 'express';

class App {
  constructor() {
    this.connection = express();
    this.connection.use(json());

    this.routes();
  }

  routes() {
    this.connection.get('/', (req, res) => res.json({ msg: 'server up and reloading with EC6..' }));
  }
}
module.exports = new App().connection;
