/**
 * Notification abstraction layer.
 *
 * All business events flow through `notify()`. In the current environment
 * events are persisted to the server log; when Resend (or any other provider)
 * is connected later, implement the delivery inside `dispatch()` — the call
 * sites (order creation, password reset, newsletter…) stay unchanged.
 *
 * The provider API key must be read from process.env (e.g. RESEND_API_KEY)
 * and never exposed to the client.
 */

export type NotifyEvent =
  | "order.created"
  | "order.status_changed"
  | "password.reset_requested"
  | "newsletter.subscribed"
  | "contact.message";

export type NotifyContext = {
  toEmail?: string;
  subject?: string;
  data?: Record<string, unknown>;
};

type DeliveryProvider = (event: NotifyEvent, ctx: NotifyContext) => Promise<void>;

/** Future: register Resend, VNPay webhook mail, etc. here. */
const providers: DeliveryProvider[] = [logProvider];

async function logProvider(event: NotifyEvent, ctx: NotifyContext) {
  const payload = {
    event,
    to: ctx.toEmail ?? "admin",
    subject: ctx.subject ?? "",
    data: ctx.data ?? {},
    at: new Date().toISOString(),
  };
  try {
    console.info(`[notify] ${event} → ${payload.to} | ${payload.subject}`, JSON.stringify(payload.data).slice(0, 400));
  } catch {
    /* noop */
  }
}

export async function notify(event: NotifyEvent, ctx: NotifyContext): Promise<void> {
  for (const p of providers) {
    try {
      await p(event, ctx);
    } catch (err) {
      // A failing notification provider must never break the business flow.
      console.error(`[notify] provider failed for ${event}`, err);
    }
  }
}

export const ORDER_NOTIFY_SUBJECTS: Record<string, string> = {
  created: "Viễn Thông Quang Thắng — Xác nhận đơn hàng {code}",
  status: "Viễn Thông Quang Thắng — Cập nhật trạng thái đơn hàng {code}",
};
