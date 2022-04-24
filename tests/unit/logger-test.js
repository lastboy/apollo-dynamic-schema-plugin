import assert from "assert";
import logger from "../../lib/logger.js";

const loggerPrefixMessage = "[dynamic schema plugin]";

describe("logger", () => {
  describe("with log message", () => {
    it("should start with prefix", () => {
      const { method, args } = logger.log("log testing log message", {
        test: "test",
      });
      assert.equal(method, "log");
      assert.equal(args[0], loggerPrefixMessage);
    });
  });
  describe("with debug message", () => {
    it("should start with prefix", () => {
      const { method, args } = logger.debug("debug testing log message");
      assert.equal(method, "debug");
      assert.equal(args[0], loggerPrefixMessage);
    });
  });
  describe("with warn message", () => {
    it("should start with prefix", () => {
      const message = "warn testing log message";
      const { method, args } = logger.warn(message);
      assert.equal(method, "warn");
      assert.equal(args[0], "\x1b[33m");
      assert.equal(args[1], loggerPrefixMessage);
      assert.equal(args[2], message);
      assert.equal(args[3], "\x1b[0m");
    });
    describe("with error message", () => {
      it("should start with prefix", () => {
        const message = "error testing log message";
        const { method, args } = logger.error(message);
        assert.equal(method, "error");
        assert.equal(args[0], "\x1b[31m");
        assert.equal(args[1], loggerPrefixMessage);
        assert.equal(args[2], message);
        assert.equal(args[3], "\x1b[0m");
      });
    });
  });
});
