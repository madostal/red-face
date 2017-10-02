const socket = require("socket.io-client")("http://localhost:4200");

class Api {

  getSocket() {
    return socket;
  }

  constructor(options) {
    //
  }

  socketRequest(method, params) {
    socket.emit(method, params);
  }
}

export default new Api();
