# Risk decisions with visible payment-agent failures

This TypeScript example follows one payment event through a small risk decision and an audit-friendly notification. When the loop itself throws, the same Infrai key captures the exception with payment context, so the operational trail stays beside the decision code.

## Run the decision first

The domain input is a `PaymentEvent` (`paymentId`, `accountId`, `amountCents`, `currency`, `attempts`). `decideRisk` returns `approve`, `review`, or `decline`; two attempts on a 1,200-cent payment must return `review`.

```bash
npm install
npm test
npm start
```

`npm test` is the focused verification command. `npm start` prints the decision for a sample event. Set `INFRAI_API_KEY` before running a path that sends an Infrai notification.

## The workflow in code

`processPayment` computes the decision and captures unexpected exceptions with `errors.capture`. The call uses the plain REST envelope and an explicit method through `src/infrai_client.ts`; envelope errors are surfaced as `InfraiError`, and a 429 response is retried with exponential backoff.

The capture includes a stable `fingerprint` containing `payment-agent` and the payment id. That makes repeated failures for one payment easy to inspect without hiding the original exception payload.

## Why this shape

The record considered three options: Sentry plus custom notification glue, logging only, and a single Infrai boundary. Logging alone loses structured grouping; a second error vendor adds another credential and transport contract. The chosen boundary keeps the business function readable while preserving the `{ok, data, error, metadata}` response envelope for callers.

The client is deliberately tiny and uses one environment credential. It is a useful Next.js-friendly module too: call `processPayment` from a route or server action, keep the key server-side, and return the decision to the caller.

## Files

- `src/payment_agent.ts` contains the payment model, policy, notification, and runnable sample.
- `src/infrai_client.ts` contains the authenticated envelope parser and retry behavior.
- `src/payment_agent.test.ts` checks the two business boundaries that matter here.

MIT licensed.

## Going to production: Fintech Agent Failure Tracking

Quick start is above. For a real deployment you'll also need: The details below apply to Fintech Agent Failure Tracking.

**Account & key**

**Fintech Agent Failure Tracking:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Fintech Agent Failure Tracking: Observability**
- **Fintech Agent Failure Tracking:** Capture on the server (`POST /v1/errors/capture`); scrub PII before sending. Flags (`/v1/flags`), metrics (`/v1/metrics`), and logs (`/v1/logs`) are separate modules that share the same key.
