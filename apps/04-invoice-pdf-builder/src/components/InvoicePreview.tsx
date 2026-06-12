import type { Invoice } from "../types";
import { calcTotals, formatMoney, lineTotal } from "../services/invoiceService";

export function InvoicePreview({ invoice }: { invoice: Invoice }) {
  const totals = calcTotals(invoice);

  return (
    <div
      className="rounded-lg overflow-hidden shadow-xl"
      style={{ background: "#ffffff", color: "#0f172a", fontFamily: "Inter, system-ui, sans-serif" }}
    >
      {/* Header band */}
      <div className="flex items-end justify-between px-8 py-6" style={{ background: "#f59e0b", color: "#ffffff" }}>
        <div className="flex items-center gap-3">
          <div className="rounded-lg flex items-center justify-center"
            style={{ width: 38, height: 38, background: "rgba(255,255,255,.18)", fontSize: 22 }}>
            {invoice.business.logoEmoji || "🧾"}
          </div>
          <div>
            <p className="text-2xl font-bold tracking-tight leading-none">INVOICE</p>
            <p className="text-xs mt-1 opacity-90">{invoice.business.name || "Your business name"}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold">{invoice.number || "INV-—"}</p>
          <p className="text-xs opacity-80">{invoice.currency}</p>
        </div>
      </div>

      <div className="p-8 text-sm">
        {/* From / To */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <Block label="FROM">
            <p className="font-semibold mb-1">{invoice.business.name || "—"}</p>
            <p className="whitespace-pre-line text-xs leading-snug" style={{ color: "#475569" }}>
              {invoice.business.address || "—"}
            </p>
            {invoice.business.email && (
              <p className="text-xs mt-1" style={{ color: "#64748b" }}>{invoice.business.email}</p>
            )}
          </Block>
          <Block label="BILL TO">
            <p className="font-semibold mb-1">{invoice.client.name || "—"}</p>
            <p className="whitespace-pre-line text-xs leading-snug" style={{ color: "#475569" }}>
              {invoice.client.address || "—"}
            </p>
            {invoice.client.email && (
              <p className="text-xs mt-1" style={{ color: "#64748b" }}>{invoice.client.email}</p>
            )}
          </Block>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-3 gap-3 mb-6 text-xs">
          <DateBox label="ISSUE DATE" value={invoice.issueDate || "—"} />
          <DateBox label="DUE DATE"   value={invoice.dueDate   || "—"} />
          <DateBox label="CURRENCY"   value={invoice.currency} />
        </div>

        {/* Line items */}
        <div className="rounded-md overflow-hidden mb-6" style={{ border: "1px solid #e2e8f0" }}>
          <div className="grid px-4 py-2 text-xs font-semibold tracking-wide"
            style={{ background: "#fffbeb", color: "#78350f", gridTemplateColumns: "1fr 60px 90px 90px" }}>
            <span>DESCRIPTION</span>
            <span className="text-right">QTY</span>
            <span className="text-right">UNIT</span>
            <span className="text-right">TOTAL</span>
          </div>
          {invoice.lineItems.length === 0 ? (
            <div className="px-4 py-6 text-center text-xs" style={{ color: "#94a3b8" }}>
              No line items yet — add one in the editor.
            </div>
          ) : invoice.lineItems.map((it, i) => (
            <div key={it.id}
              className="grid px-4 py-2 text-xs"
              style={{
                gridTemplateColumns: "1fr 60px 90px 90px",
                borderTop: i === 0 ? "none" : "1px solid #e2e8f0",
              }}>
              <span className="break-words pr-2 whitespace-pre-line">{it.description || "—"}</span>
              <span className="text-right" style={{ color: "#475569" }}>{it.quantity}</span>
              <span className="text-right" style={{ color: "#475569" }}>{formatMoney(it.unitPrice, invoice.currency)}</span>
              <span className="text-right font-semibold">{formatMoney(lineTotal(it), invoice.currency)}</span>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-6">
          <div style={{ width: 260 }}>
            <Row label="Subtotal" value={formatMoney(totals.subtotal, invoice.currency)} />
            {invoice.discount > 0 && (
              <Row label={`Discount (${invoice.discount}%)`}
                value={"−" + formatMoney(totals.discountAmt, invoice.currency)} />
            )}
            {invoice.taxRate > 0 && (
              <Row label={`Tax (${invoice.taxRate}%)`} value={formatMoney(totals.taxAmt, invoice.currency)} />
            )}
            <div className="flex justify-between items-baseline pt-2 mt-2"
              style={{ borderTop: "1px solid #e2e8f0" }}>
              <span className="text-xs font-semibold tracking-wide" style={{ color: "#0f172a" }}>TOTAL</span>
              <span className="text-lg font-bold" style={{ color: "#d97706" }}>
                {formatMoney(totals.total, invoice.currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes.trim().length > 0 && (
          <div>
            <p className="text-xs font-semibold tracking-wide mb-1" style={{ color: "#475569" }}>NOTES / PAYMENT TERMS</p>
            <p className="text-xs whitespace-pre-line leading-relaxed" style={{ color: "#0f172a" }}>
              {invoice.notes}
            </p>
          </div>
        )}

        <p className="text-xs mt-8 text-center" style={{ color: "#94a3b8" }}>
          Generated by Invoice PDF Builder
        </p>
      </div>
    </div>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold tracking-wide mb-1.5" style={{ color: "#94a3b8" }}>{label}</p>
      {children}
    </div>
  );
}

function DateBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md px-3 py-2" style={{ border: "1px solid #e2e8f0" }}>
      <p className="text-[10px] font-semibold tracking-wide" style={{ color: "#94a3b8" }}>{label}</p>
      <p className="text-sm font-medium mt-0.5">{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-baseline py-1 text-xs">
      <span style={{ color: "#64748b" }}>{label}</span>
      <span>{value}</span>
    </div>
  );
}
