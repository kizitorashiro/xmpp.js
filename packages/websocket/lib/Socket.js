import WS from "ws";

// eslint-disable-next-line n/no-unsupported-features/node-builtins
const WebSocket = globalThis.WebSocket || WS;

import { EventEmitter } from "@xmpp/events";

const CODE = "ECONNERROR";

export default class Socket extends EventEmitter {
  constructor() {
    super();
    this.listeners = Object.create(null);
  }

  connect(url) {
    this.url = url;
    this._attachSocket(new WebSocket(url, ["xmpp"]));
  }

  _attachSocket(socket) {
    this.socket = socket;
    const { listeners } = this;
    listeners.open = () => {
      this.emit("connect");
    };

    listeners.message = ({ data }) => this.emit("data", data);
    listeners.error = (event) => {
      const { url } = this;
      // WS
      let { error } = event;
      // DOM
      if (!error) {
        error = new Error(`WebSocket ${CODE} ${url}`);
        error.errno = CODE;
        error.code = CODE;
      }

      error.event = event;
      error.url = url;
      this.emit("error", error);
    };

    listeners.close = (event) => {
      this._detachSocket();
      this.emit("close", !event.wasClean, event);
    };

    this.socket.addEventListener("open", listeners.open);
    this.socket.addEventListener("message", listeners.message);
    this.socket.addEventListener("error", listeners.error);
    this.socket.addEventListener("close", listeners.close);
  }

  _detachSocket() {
    delete this.url;
    const { socket, listeners } = this;
    for (const k of Object.getOwnPropertyNames(listeners)) {
      socket.removeEventListener(k, listeners[k]);
      delete listeners[k];
    }
    delete this.socket;
  }

  end() {
    this.socket.close();
  }

  write(data, fn) {
    if (WebSocket === WS) {
      this.socket.send(data, fn);
    } else {
      this.socket.send(data);
      fn();
    }
  }
}
