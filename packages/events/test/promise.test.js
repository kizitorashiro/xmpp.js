"use strict";

const { promise } = require("..");
const EventEmitter = require("events");

class Socket extends EventEmitter {
  constructor(fn) {
    super();
    this.fn = fn;
  }

  async connect() {
    if (!this.fn) return;
    await Promise.resolve();
    this.fn();
  }
}

test('resolves if "event" is emitted', async () => {
  const value = {};
  // eslint-disable-next-line func-names
  const socket = new Socket(function () {
    this.emit("connect", value);
  });
  expect(socket.listenerCount("error")).toBe(0);
  expect(socket.listenerCount("connect")).toBe(0);
  socket.connect();
  const p = promise(socket, "connect");
  expect(socket.listenerCount("error")).toBe(1);
  expect(socket.listenerCount("connect")).toBe(1);
  const result = await p;
  expect(result).toBe(value);
  expect(socket.listenerCount("error")).toBe(0);
  expect(socket.listenerCount("connect")).toBe(0);
});

test('rejects if "errorEvent" is emitted', () => {
  const error = new Error("foobar");
  // eslint-disable-next-line func-names
  const socket = new Socket(function () {
    this.emit("error", error);
  });
  expect(socket.listenerCount("error")).toBe(0);
  expect(socket.listenerCount("connect")).toBe(0);
  socket.connect();
  const p = promise(socket, "connect", "error");
  expect(socket.listenerCount("error")).toBe(1);
  expect(socket.listenerCount("connect")).toBe(1);
  return p.catch((err) => {
    expect(err).toBe(error);
    expect(socket.listenerCount("error")).toBe(0);
    expect(socket.listenerCount("connect")).toBe(0);
  });
});
