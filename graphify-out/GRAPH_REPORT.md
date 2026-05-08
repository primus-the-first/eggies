# Graph Report - .  (2026-05-07)

## Corpus Check
- Corpus is ~9,987 words - fits in a single context window. You may not need a graph.

## Summary
- 124 nodes · 128 edges · 28 communities (22 shown, 6 thin omitted)
- Extraction: 80% EXTRACTED · 20% INFERRED · 0% AMBIGUOUS · INFERRED: 26 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_UI Components & Domain Enums|UI Components & Domain Enums]]
- [[_COMMUNITY_App Shell & Routing|App Shell & Routing]]
- [[_COMMUNITY_Dashboard & Data Layer|Dashboard & Data Layer]]
- [[_COMMUNITY_Reports & PDF Export|Reports & PDF Export]]
- [[_COMMUNITY_Egg Pricing System|Egg Pricing System]]
- [[_COMMUNITY_Credit Management|Credit Management]]
- [[_COMMUNITY_Static Assets & Config|Static Assets & Config]]
- [[_COMMUNITY_Build Tooling|Build Tooling]]
- [[_COMMUNITY_Card Primitive|Card Primitive]]
- [[_COMMUNITY_Input Primitive|Input Primitive]]
- [[_COMMUNITY_Icon Sprites|Icon Sprites]]

## God Nodes (most connected - your core abstractions)
1. `Dashboard Page` - 9 edges
2. `App Root Component` - 8 edges
3. `Reports Page` - 8 edges
4. `PDF Report Generator` - 7 edges
5. `Bootstrap fetchAll (parallel fetch all data)` - 7 edges
6. `Bottom Navigation Component` - 6 edges
7. `Zustand Global Store (useStore)` - 6 edges
8. `Badge Variant Styles (cash, momo, credit, broken, received, payment, delivery, small, large)` - 5 edges
9. `useStore (Zustand Global Store)` - 5 edges
10. `Credit Page` - 5 edges

## Surprising Connections (you probably didn't know these)
- `README: Vite + React Template Info` --references--> `Vite Logo SVG Asset`  [INFERRED]
  README.md → src/assets/vite.svg
- `README: Vite + React Template Info` --references--> `React Logo SVG Asset`  [INFERRED]
  README.md → src/assets/react.svg
- `Favicon SVG (purple lightning-bolt / Vite-style icon)` --semantically_similar_to--> `Vite Logo SVG Asset`  [INFERRED] [semantically similar]
  public/favicon.svg → src/assets/vite.svg
- `Badge Variant Styles (cash, momo, credit, broken, received, payment, delivery, small, large)` --conceptually_related_to--> `Inventory Entry Type Domain (received, broken, discarded)`  [INFERRED]
  src/components/Badge.jsx → supabase_schema.sql
- `Badge Variant Styles (cash, momo, credit, broken, received, payment, delivery, small, large)` --conceptually_related_to--> `Credit Transaction Type Domain (delivery, payment)`  [INFERRED]
  src/components/Badge.jsx → supabase_schema.sql

## Hyperedges (group relationships)
- **UI Primitive Components** — component_badge, component_button, component_card, component_fab, component_input, component_sheet [INFERRED 0.95]
- **Application Page Routes** — page_dashboard, page_sales, page_credit, page_inventory, page_reports [EXTRACTED 1.00]
- **Supabase Database Schema Tables** — supabase_schema_sales, supabase_schema_credit_customers, supabase_schema_credit_transactions, supabase_schema_inventory_entries [EXTRACTED 1.00]
- **Domain Enum/Constrained Types** — domain_payment_method, domain_egg_size, domain_inventory_type, domain_credit_transaction_type, domain_customer_type [INFERRED 0.90]
- **All Pages Consume Zustand Store** — page_dashboard, page_sales, page_inventory, page_credit, page_reports, usestore_zustand_store [EXTRACTED 1.00]
- **Store Slices Map 1:1 to Supabase Tables** — usestore_sales_slice, usestore_prices_slice, usestore_credit_customers_slice, usestore_credit_transactions_slice, usestore_inventory_slice, supabase_sales_table, supabase_prices_table, supabase_credit_customers_table, supabase_credit_transactions_table, supabase_inventory_entries_table [EXTRACTED 1.00]
- **Credit Balance Calculation Replicated in Credit, Dashboard, Reports** — credit_balance_formula, dashboard_credit_summary, reports_top_creditors [INFERRED 0.95]
- **Egg Size Pricing Used in Both Sales and Credit Transaction Entry** — sales_egg_size_price_lookup, credit_add_transaction_sheet, usestore_prices_slice, concept_egg_size_pricing [INFERRED 0.95]
- **Dashboard and Reports Aggregate the Same Store Data (sales, inventory, credit)** — page_dashboard, page_reports, usestore_sales_slice, usestore_inventory_slice, usestore_credit_customers_slice, usestore_credit_transactions_slice [INFERRED 0.95]

## Communities (28 total, 6 thin omitted)

### Community 0 - "UI Components & Domain Enums"
Cohesion: 0.15
Nodes (19): Badge Variant Styles (cash, momo, credit, broken, received, payment, delivery, small, large), Button Variant Styles (primary, secondary, dark, danger, ghost), Badge Component, Button Component, FAB (Floating Action Button) Component, PriceSettings Component, Sheet (Bottom Sheet Modal) Component, Credit Transaction Type Domain (delivery, payment) (+11 more)

### Community 1 - "App Shell & Routing"
Cohesion: 0.16
Nodes (18): App Root Component, React Router BrowserRouter Routing, Bottom Navigation Component, Mobile Money (MoMo) Payment Method, Credit Balance Formula (delivered - paid), Low Stock Alert (threshold < 20 eggs), Application Entry Point, Credit Page (+10 more)

### Community 2 - "Dashboard & Data Layer"
Cohesion: 0.13
Nodes (17): Hero Image (isometric layered card / app UI mockup), Ghana Cedis (GHâ‚µ) Currency Context, Dashboard Outstanding Credit Summary, Dashboard PriceSettings Modal Trigger, Dashboard Current Stock Calculation, Dashboard Today's Revenue Display, Current Stock Formula (received - sold - broken - discarded), Dashboard Page (+9 more)

### Community 4 - "Egg Pricing System"
Cohesion: 0.33
Nodes (7): Egg Size Pricing Concept (small/large with per-crate price), AddTransactionSheet Component (delivery or payment entry), CustomerSheet Component (customer detail + transactions), Credit Transaction Uses Prices Store for Egg Pricing, Egg Size Price Lookup in Sales Form, Supabase 'prices' Table, Prices State Slice (fetchPrices, updatePrice)

### Community 7 - "Static Assets & Config"
Cohesion: 0.33
Nodes (6): React Logo SVG Asset, Vite Logo SVG Asset, Favicon SVG (purple lightning-bolt / Vite-style icon), HTML Entry Point (index.html), Google Fonts (Plus Jakarta Sans + Inter), README: Vite + React Template Info

## Knowledge Gaps
- **26 isolated node(s):** `ESLint Configuration`, `Vite Build Configuration`, `React Router BrowserRouter Routing`, `Application Entry Point`, `Badge Component` (+21 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Reports Page` connect `App Shell & Routing` to `UI Components & Domain Enums`, `Dashboard & Data Layer`, `Reports & PDF Export`?**
  _High betweenness centrality (0.184) - this node is a cross-community bridge._
- **Why does `PDF Report Generator` connect `UI Components & Domain Enums` to `App Shell & Routing`?**
  _High betweenness centrality (0.124) - this node is a cross-community bridge._
- **Why does `Bootstrap fetchAll (parallel fetch all data)` connect `Dashboard & Data Layer` to `App Shell & Routing`, `Egg Pricing System`?**
  _High betweenness centrality (0.099) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `PDF Report Generator` (e.g. with `Reports Page` and `Inventory Entries Table (Supabase)`) actually correct?**
  _`PDF Report Generator` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `ESLint Configuration`, `Vite Build Configuration`, `React Router BrowserRouter Routing` to the rest of the system?**
  _26 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Dashboard & Data Layer` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._