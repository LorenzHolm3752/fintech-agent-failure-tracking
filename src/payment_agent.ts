import { infrai } from "./infrai_client.ts";

export type PaymentEvent = { paymentId: string; accountId: string; amountCents: number; currency: string; attempts: number };
export type RiskDecision = "approve" | "review" | "decline";

export function decideRisk(event: PaymentEvent): RiskDecision {
  if (event.amountCents <= 0 || event.attempts > 3) return "decline";
  if (event.amountCents >= 100000 || event.attempts > 1) return "review";
  return "approve";
}

export async function processPayment(event: PaymentEvent): Promise<{ paymentId: string; decision: RiskDecision }> {
  try {
    const decision = decideRisk(event);
    return { paymentId: event.paymentId, decision };
  } catch (error) {
    await infrai.errors.capture({ title: "Payment agent failure", message: String(error), level: "error", fingerprint: ["payment-agent", event.paymentId], exception: String(error), context: event });
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  processPayment({ paymentId: "pay_demo_001", accountId: "acct_demo", amountCents: 12500, currency: "USD", attempts: 1 })
    .then(result => console.log(JSON.stringify(result)))
    .catch(error => { console.error(error); process.exitCode = 1; });
}
