# Product Listing Builder

> App 08 in the KART L Windows Store Apps Portfolio
> Premium Windows desktop tool for marketplace-ready product listings with per-platform live preview.

---

## Setup (PowerShell — from portfolio root)

```powershell
.\scripts\install-app.ps1 -AppSlug "08-product-listing-builder"
.\scripts\run-app.ps1     -AppSlug "08-product-listing-builder"
.\scripts\build-app.ps1   -AppSlug "08-product-listing-builder"
```

Or directly:

```powershell
cd apps\08-product-listing-builder
npm install
npm run dev        # http://localhost:1427
npm run build      # dist/
```

---

## Features

| Feature | Status |
|---------|--------|
| Editor: name, description, category, condition, SKU, business name | ✅ |
| Price + compare-at price, 6 currencies | ✅ |
| Reorderable feature bullets, deletable | ✅ |
| Comma-separated tag chips | ✅ |
| Image slot grid (1–8 placeholders) | ✅ |
| SEO title + meta description with sweet-spot counters | ✅ |
| Real SEO score (0–100) + suggestions | ✅ |
| Per-platform live preview (6 marketplaces) | ✅ |
| Title-length warnings per platform | ✅ |
| Listings vault with search + 3 filters + 4 sort modes | ✅ |
| Duplicate, edit, delete listings | ✅ |
| Export single listing as TXT or JSON | ✅ |
| Bulk CSV importer with preview table | ✅ |
| Export all listings as JSON | ✅ |
| 3 built-in templates + user templates | ✅ |
| Premium UI (splash, onboarding, page transitions, skeletons, activity chart, micro-interactions) | ✅ |
| Privacy / About / Help pages | ✅ |
| Direct posting to marketplace APIs | ⬜ Future paid tier — see `src/services/listingService.ts` |

---

## Listing engine

`src/services/listingService.ts` ships:

- `emptyListing(settings)` — seeded blank listing from defaults
- `saveListing / deleteListing / duplicateListing / searchListings` — local CRUD
- `formatForPlatform(listing, platform)` — title-length cap + description shape per platform
- `seoScore(listing)` — 0–100 with per-part breakdown and suggestions
- `parseCsv(text, settings)` — pipe-separated feature/tag cells, validation warnings
- 3 built-in templates plus `saveTemplate / deleteTemplate / listingFromTemplate`
- `listingToJson / listingToTxt / allListingsToJson / downloadString`

The file's top comment documents the integration path for direct posting to Amazon SP-API, eBay Inventory API, Etsy Open API, Shopify Admin GraphQL, and WooCommerce REST in the Tauri-bundled paid build.

---

## Package Details

| Key | Value |
|-----|-------|
| App Number | 08 |
| App Slug | product-listing-builder |
| Package ID | com.kartdev.productlistingbuilder |
| Platform | Windows (Tauri + React + TypeScript) |
| Dev Port | 1427 |
| Accent | Sky blue `#0ea5e9` |
| Store | Microsoft Store |
| Price | Free at launch |

---

## Privacy

Listings, templates, and settings stay on your device. No marketplace API is contacted in this version. See `metadata/privacy_policy.md` for full details.
