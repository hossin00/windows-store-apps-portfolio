# Paid Value Notes — Invoice PDF Builder

## Current state (v1.0 — free)
- Full invoice editor with live preview
- Real PDF export using pdf-lib (A4, embedded Helvetica)
- Multi-currency (USD, EUR, GBP, MAD)
- Auto-increment numbering with custom prefix and sequence
- Save drafts, duplicate, edit, delete
- Local invoice history with search
- Default business profile in Settings
- Privacy-first local-only storage
- Dark / light / system theme

## What justifies a paid price in a future version

### Must-have for paid tier:
- Native Windows file save dialog via Tauri (write directly to chosen folder)
- Client database (save clients once, pick from a dropdown)
- Recurring invoices (monthly retainer template)
- Custom template builder (logo upload, accent colour picker, header layout)
- Multiple tax lines (e.g. VAT + GST, or per-item tax)

### Value-add features for paid tier:
- PDF/A export for archival compliance
- Bank details / payment instructions block with template
- Payment status tracker (issued / sent / paid)
- Export invoice list as CSV / XLSX for accountants
- Email invoice via system mail client (no smtp accounts inside the app)
- Markdown notes with light formatting
- Customisable column set on the line items table (hours vs units, hourly rate)
- Quote → Invoice conversion

## Suggested pricing when ready for paid:
- $24.99–$39.99 one-time purchase
- No subscription model
- No ads in paid version (same as free)

## Store strategy:
- Launch free to build user base + reviews
- Move to paid once client database + recurring invoices + template builder land
- Keep a free version available with the v1.0 feature set if possible
