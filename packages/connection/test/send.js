"use strict";

const xml = require("@xmpp/xml");
const Connection = require("..");

test("send", () => {
  expect.assertions(3);
  const conn = new Connection();
  conn.root = xml("root");

  const foo = xml("foo");

  conn.socket = {
    write(str) {
      expect(str).toBe("<foo/>");
    },
  };

  expect(foo.attrs.parent).toBe(undefined);

  conn.send(foo);

  expect(foo.parent).toBe(conn.root);

  conn.on("send", (element) => {
    expect(element).toBe(foo);
  });
});
