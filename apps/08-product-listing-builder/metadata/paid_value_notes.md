# Paid Value Notes — Product Listing Builder

## Current state (v1.0 — free)
- Full editor with 12+ fields, reorderable feature bullets, tag chips, SEO scorer
- Per-platform formatter for 6 marketplaces with title-length caps and warnings
- SEO score (0–100) with actionable suggestions
- Listings vault with search, 4 filters, 4 sort modes
- CSV bulk importer with preview table
- 3 built-in templates + user templates
- Export TXT / JSON per listing or per batch
- Premium UI from day one (splash, onboarding, page transitions, skeletons, activity chart)
- Privacy-first local-only storage

## What justifies a paid price in a future version

### Must-have for paid tier:
- Tauri-bundled image attach (real image files instead of placeholder slots)
- Direct posting to Amazon SP-API (OAuth + signed requests)
- Direct posting to eBay Inventory API
- Direct posting to Etsy Open API
- Direct posting to Shopify Admin GraphQL
- Direct posting to WooCommerce REST
- Two-way sync — pull existing listings, push edits

### Value-add features for paid tier:
- AI title and description rewriter (local model or BYO API key)
- Smart category mapper per marketplace
- Inventory pricing rules (e.g. "MSRP × 0.85" formula)
- Variations / SKU matrix editor (size × colour)
- Bulk export to marketplace-specific CSV formats
- Image optimisation (resize / compress before attach)
- Listing analytics imported from each marketplace

## Suggested pricing when ready for paid:
- $24.99–$49.99 one-time purchase per major marketplace integration
- Or $79–$149 bundle for all six
- No subscription model
- No ads in paid version (same as free)

## Store strategy:
- Launch free with the local editor and CSV bulk import to gather users
- Paid upgrades come per-marketplace as each API integration ships
