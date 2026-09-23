import assert from "node:assert/strict";
import test from "node:test";
import runMetrics from "../.pi/extensions/run-metrics.js";

function setup(hasUI = true) {
  const handlers = new Map();
  const statuses = new Map([["other-extension", "keep me"]]);
  const timers = new Map();
  let time = 0;
  let nextTimer = 0;
  let idle = true;
  const ctx = { hasUI, isIdle: () => idle, ui: {
    setStatus: (key, value) => value === undefined ? statuses.delete(key) : statuses.set(key, value),
  } };
  runMetrics({ on: (name, handler) => handlers.set(name, handler) }, {
    now: () => time,
    every: (fn) => { timers.set(++nextTimer, fn); return nextTimer; },
    cancel: (id) => timers.delete(id),
  });
  return {
    emit: (name, event = {}) => handlers.get(name)?.(event, ctx),
    advance: (ms) => { time += ms; for (const fn of timers.values()) fn(); },
    idle: (value) => { idle = value; },
    text: () => statuses.get("run-metrics"), statuses, timers,
  };
}

const response = (output, stopReason = "stop") => ({
  message: { role: "assistant", usage: { output }, stopReason },
});

test("elapsed includes tools; throughput weights finalized output by model time only", () => {
  const r = setup();
  r.emit("agent_start");
  r.emit("turn_start");
  r.advance(2000);
  r.emit("message_end", response(100, "toolUse"));
  assert.equal(r.text(), "Run 2.0s (running) | Model 50.0 tok/s");
  r.advance(10000); // Tool work must not dilute the model rate.
  r.emit("message_end", { message: { role: "toolResult", usage: { output: 999 } } });
  assert.equal(r.text(), "Run 12.0s (running) | Model 50.0 tok/s");
  r.emit("turn_start");
  r.advance(3000);
  r.emit("message_end", response(300));
  r.emit("agent_settled");
  assert.equal(r.text(), "Run 15.0s (finished) | Model 80.0 tok/s");
  assert.equal(r.timers.size, 0);
  r.advance(60000);
  assert.equal(r.text(), "Run 15.0s (finished) | Model 80.0 tok/s");
  assert.equal(r.statuses.get("other-extension"), "keep me");
});

test("automatic continuation retains total duration until settled; next prompt resets", () => {
  const r = setup();
  r.emit("agent_start");
  r.emit("turn_start");
  r.advance(2000);
  r.emit("message_end", response(100, "error"));
  r.emit("agent_end"); // Pi may still retry or compact after this event.
  r.advance(60000);
  r.emit("agent_start");
  r.emit("turn_start");
  r.advance(2000);
  r.emit("message_end", response(100));
  r.emit("agent_settled");
  assert.equal(r.text(), "Run 1m 4s (finished) | Model 50.0 tok/s");
  r.emit("agent_start");
  assert.equal(r.text(), "Run 0.0s (running) | Model n/a tok/s");
  assert.equal(r.timers.size, 1);
  r.emit("session_shutdown");
});

test("missing, zero, invalid, or untimed usage never produces a made-up speed", () => {
  for (const output of [undefined, 0, -1, NaN, Infinity, "100"]) {
    const r = setup();
    r.emit("agent_start");
    r.emit("turn_start");
    r.advance(1000);
    r.emit("message_end", response(output));
    // A later good response must not conceal an incomplete run measurement.
    r.emit("turn_start");
    r.advance(1000);
    r.emit("message_end", response(100));
    r.emit("agent_settled");
    assert.equal(r.text(), "Run 2.0s (finished) | Model n/a tok/s");
  }
  for (const start of [false, true]) {
    const r = setup();
    r.emit("agent_start");
    if (start) r.emit("turn_start");
    r.emit("message_end", response(100));
    r.emit("agent_settled");
    assert.match(r.text(), /n\/a tok\/s$/);
  }
});

test("failure and cancellation are labeled; a subsequent run does not inherit them", () => {
  const r = setup();
  for (const reason of ["error", "aborted", "stop"]) {
    r.emit("agent_start");
    r.emit("turn_start");
    r.advance(1000);
    r.emit("message_end", response(30, reason));
    r.emit("agent_settled");
    assert.equal(r.text(), `Run 1.0s (${reason === "stop" ? "finished" : reason}) | Model 30.0 tok/s`);
    assert.equal(r.timers.size, 0);
  }
});

test("navigation and shutdown clear timers and only this extension's status", () => {
  for (const name of ["session_start", "session_tree", "session_shutdown"]) {
    const r = setup();
    r.emit("agent_start");
    r.advance(1000);
    r.emit(name);
    r.emit("message_end", response(100));
    r.emit("agent_settled");
    assert.equal(r.text(), undefined);
    assert.equal(r.timers.size, 0);
    assert.equal(r.statuses.get("other-extension"), "keep me");
  }
});

test("print mode starts no timer or status; settled does not interrupt another run", () => {
  const silent = setup(false);
  silent.emit("agent_start");
  silent.emit("turn_start");
  silent.advance(1000);
  silent.emit("message_end", response(100));
  silent.emit("agent_settled");
  assert.equal(silent.text(), undefined);
  assert.equal(silent.timers.size, 0);
  const r = setup();
  r.emit("agent_start");
  r.idle(false);
  r.emit("agent_settled");
  r.advance(1000);
  assert.match(r.text(), /Run 1.0s \(running\)/);
  assert.equal(r.timers.size, 1);
  r.idle(true);
  r.emit("agent_settled");
  assert.equal(r.timers.size, 0);
});
