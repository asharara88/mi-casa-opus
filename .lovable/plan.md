

# Mi Casa BOS — Internal Product Overview Deck

## Reframing

The previous deck was pitched as an investor/sales deck (TAM, competitive matrix, fundraising). This deck should instead be an **internal team onboarding and reference deck** — "here's the system we built, here's how it works, here's how you use it."

## Design Philosophy

Same MiCasa branding (Navy `#1A365D`, Gold `#D4A574`, Georgia/Calibri). Professional but practical — no sales language, no market sizing, no competitive positioning.

## Proposed 10-Slide Structure

1. **Title Slide** — "Mi Casa BOS — Brokerage Operating System" / Internal Product Guide / MiCasa logo
2. **What is BOS?** — One-liner definition: a single system replacing spreadsheets, WhatsApp groups, and disconnected tools. Role-based workspaces (Operator, Broker, Owner, Investor).
3. **System Overview** — The 4-layer architecture diagram (Lead Acquisition → Regulatory Verification → Automation & Intelligence → Execution & Analytics) adapted from InvestorArchitectureDiagram.
4. **Daily Operations — Pipeline & CRM** — Prospects → Leads → Deals workflow. Pipeline views, lead scoring, deal state rail, aging alerts.
5. **Listings & Marketing** — Listing management, portal publishing (Property Finder, Bayut), campaign builder, ads manager, marketing copy AI.
6. **Documents & Compliance** — 18 document templates, form wizard, signature tracking, KYC/AML checks, compliance gates (DARI, Madmoun, ADREC).
7. **Commissions & Finance** — Commission ledger, payout batch builder, VAT invoicing, broker split management.
8. **AI Capabilities** — Mi AI assistant: lead qualification, property matching, listing FAQ, marketing copy, follow-up drafting. "AI drafts, humans approve" principle.
9. **Team & Communication** — Team directory, meetings, WhatsApp (WABA), SMS, email campaigns, viewing scheduler.
10. **Roles & Navigation Guide** — What each role sees: Operator (full control room), Broker (my-day, my-leads, my-deals, my-earnings), Owner (oversight), Investor (profile, shortlists, deal room).

## Technical Approach

- Generate `.pptx` using `pptxgenjs` via script
- Navy/Gold palette, Georgia headers, Calibri body
- Embed MiCasa logo from `src/assets/micasa-logo.png`
- Each slide uses icons/diagrams rather than bullet walls
- QA via LibreOffice PDF conversion + `pdftoppm` inspection
- Output to `/mnt/documents/Mi_Casa_BOS_Internal_Deck.pptx`

