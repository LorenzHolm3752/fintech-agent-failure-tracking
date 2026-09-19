import test from "node:test";
import assert from "node:assert/strict";
import { decideRisk } from "./payment_agent.ts";

test("repeated attempts enter manual review", () => {
  assert.equal(decideRisk({ paymentId: "p1", accountId: "a1", amountCents: 1200, currency: "USD", attempts: 2 }), "review");
});

test("non-positive payments are declined", () => {
  assert.equal(decideRisk({ paymentId: "p2", accountId: "a1", amountCents: 0, currency: "USD", attempts: 1 }), "decline");
});
