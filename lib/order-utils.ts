/**
 * Order revenue classification.
 *
 * - PAID: status is confirmado/entregue AND not fiado-pending.
 *   Counts as actual revenue.
 * - PENDING: status is pendente OR fiado-pending (delivered but unpaid).
 *   Counts as expected/pending revenue.
 * - CANCELLED: status is cancelado. Excluded from both.
 */

interface OrderLike {
  status: string;
  payment_method?: string;
  paid_at?: string | null;
}

function isFiadoPending(o: OrderLike): boolean {
  return o.payment_method === "fiado" && !o.paid_at;
}

export function isOrderPaid(o: OrderLike): boolean {
  if (o.status === "cancelado" || o.status === "pendente") return false;
  if (isFiadoPending(o)) return false;
  return true;
}

export function isOrderPendingRevenue(o: OrderLike): boolean {
  if (o.status === "cancelado") return false;
  if (o.status === "pendente") return true;
  return isFiadoPending(o);
}
