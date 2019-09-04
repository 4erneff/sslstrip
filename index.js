const http = require("http");

class Server {

  constructor(port) {
    this.port = port;
  }

  start() {

    const server = http.createServer();

    server.on('request', this.handle.bind(this));

    // handle errors
    server.on('clientError', (err, socket) => {
      console.log('clientError:', err);
    });
    server.on('error', err => {
      console.log('serverError:', err);
    });

    // listen
    server.listen(this.port, () => {
      console.log('SSLstrip Server Listen Port:', this.port);
    });
  }

  handle(req, res) {
    console.log(req);
  }
}

const server = new Server(process.env.npm_config_port || 8001);
server.start();