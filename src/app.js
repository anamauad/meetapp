import express, { json } from 'express';
import { resolve } from 'path';
import routes from './routes';
import './database';

class App {
  constructor() {
    this.server = express();
    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.server.use(json());
    this.server.use((req, res, next) => {
      console.log(
        `Request method: ${req.method} ${req.httpVersion} ${req.headers.host}${
          req.url
        } ${req.headers['user-agent']}`
      );
      return next();
    });
    this.server.use(
      '/files',
      express.static(resolve(__dirname, '..', 'tmp', 'uploads'))
    );
  }

  routes() {
    this.server.use(routes);
  }
}
module.exports = new App().server;
