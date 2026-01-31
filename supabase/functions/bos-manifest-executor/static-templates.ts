// =====================================================
// STATIC DOCUMENT TEMPLATES
// Hard-coded documents that are returned exactly as-is
// NO AI modification - pulled directly from this file
// =====================================================

export interface StaticTemplate {
  title: string;
  body: string;
}

// Map of prompt_id to static document content
export const STATIC_TEMPLATES: Record<string, StaticTemplate> = {
  
  // =====================================================
  // ADM FORM A - SALES BROKERAGE AUTHORITY
  // =====================================================
  "STATIC_ADM_FORM_A": {
    title: "ADM Form A – Sales Brokerage Authority",
    body: `ABU DHABI MUNICIPALITY
DEPARTMENT OF MUNICIPAL AFFAIRS
REAL ESTATE REGULATORY AUTHORITY

FORM A – EXCLUSIVE / NON-EXCLUSIVE SALES BROKERAGE AUTHORITY

This Agreement is entered into on _________________ (Date)

BETWEEN:

PROPERTY OWNER / AUTHORIZED SELLER ("Principal")
Name: _________________________________________
Emirates ID / Passport No.: _______________________
Address: _______________________________________
Mobile: ________________________________________
Email: _________________________________________

AND

LICENSED REAL ESTATE BROKER ("Broker")
Brokerage Name: MiCasa Real Estate LLC
Broker License No.: _____________________________
ORN: __________________________________________
Address: _______________________________________
Contact Person: _________________________________
Mobile: ________________________________________
Email: _________________________________________

PROPERTY DETAILS:
Property Type: __________________________________
Location / Community: ___________________________
Unit / Plot No.: _________________________________
Title Deed No.: _________________________________
Area (sq.ft): ___________________________________
Asking Price (AED): _____________________________

TERMS OF AUTHORITY:

1. AUTHORITY TYPE:
   [ ] EXCLUSIVE – Principal appoints Broker as sole agent
   [ ] NON-EXCLUSIVE – Principal may appoint multiple agents

2. DURATION:
   Start Date: ___________________________________
   End Date: ____________________________________

3. COMMISSION:
   Commission Rate: ______% of final sale price
   OR Fixed Amount: AED ________________________
   Commission Payable By: [ ] Seller  [ ] Buyer
   Commission Due Upon: Transfer of ownership at DLD/DARI

4. BROKER OBLIGATIONS:
   - Market the property professionally
   - Verify buyer credentials and financial capacity
   - Facilitate viewings and negotiations
   - Coordinate with DLD/DARI for transfer
   - Maintain confidentiality of transaction details

5. PRINCIPAL OBLIGATIONS:
   - Provide accurate property information
   - Ensure clear title and authority to sell
   - Cooperate with viewings and inspections
   - Not circumvent Broker for introduced buyers
   - Pay agreed commission upon successful sale

6. NON-CIRCUMVENTION:
   Principal agrees not to negotiate directly with any buyer introduced by Broker for a period of 12 months after this agreement ends.

7. GOVERNING LAW:
   This Agreement is governed by the laws of the UAE and regulations of Abu Dhabi Municipality.

SIGNATURES:

_________________________          _________________________
Principal                          Date

_________________________          _________________________
Broker Representative              Date

ADM Ref: _____________________
`
  },

  // =====================================================
  // ADM FORM B - LEASING BROKERAGE AUTHORITY
  // =====================================================
  "STATIC_ADM_FORM_B": {
    title: "ADM Form B – Leasing Brokerage Authority",
    body: `ABU DHABI MUNICIPALITY
DEPARTMENT OF MUNICIPAL AFFAIRS
REAL ESTATE REGULATORY AUTHORITY

FORM B – LEASING BROKERAGE AUTHORITY

This Agreement is entered into on _________________ (Date)

BETWEEN:

PROPERTY OWNER / AUTHORIZED LANDLORD ("Principal")
Name: _________________________________________
Emirates ID / Passport No.: _______________________
Address: _______________________________________
Mobile: ________________________________________
Email: _________________________________________

AND

LICENSED REAL ESTATE BROKER ("Broker")
Brokerage Name: MiCasa Real Estate LLC
Broker License No.: _____________________________
ORN: __________________________________________
Address: _______________________________________
Contact Person: _________________________________
Mobile: ________________________________________
Email: _________________________________________

PROPERTY DETAILS:
Property Type: __________________________________
Location / Community: ___________________________
Unit No.: ______________________________________
Title Deed No.: _________________________________
Area (sq.ft): ___________________________________
Annual Rent (AED): _____________________________

TERMS OF AUTHORITY:

1. DURATION:
   Start Date: ___________________________________
   End Date: ____________________________________

2. COMMISSION (ONE PARTY ONLY):
   Commission Amount: AED _____________________
   OR Percentage: ______% of annual rent
   
   COMMISSION PAYABLE BY (select one):
   [ ] LANDLORD
   [ ] TENANT
   
   ⚠️ NOTE: Under ADM regulations, commission may only be charged to ONE party.

3. COMMISSION DUE UPON:
   Signing of Tawtheeq-registered tenancy contract

4. BROKER OBLIGATIONS:
   - Market the property professionally
   - Screen prospective tenants
   - Verify tenant identity and references
   - Facilitate Tawtheeq registration
   - Maintain confidentiality

5. PRINCIPAL OBLIGATIONS:
   - Provide accurate property information
   - Ensure property is fit for habitation
   - Cooperate with viewings
   - Not circumvent Broker for introduced tenants
   - Pay agreed commission upon successful lease

6. NON-CIRCUMVENTION:
   Principal agrees not to negotiate directly with any tenant introduced by Broker for a period of 6 months after this agreement ends.

7. GOVERNING LAW:
   This Agreement is governed by the laws of the UAE and regulations of Abu Dhabi Municipality.

SIGNATURES:

_________________________          _________________________
Principal (Landlord)               Date

_________________________          _________________________
Broker Representative              Date

ADM Ref: _____________________
`
  },

  // =====================================================
  // STANDARD NDA - NON-DISCLOSURE AGREEMENT
  // =====================================================
  "STATIC_NDA": {
    title: "Non-Disclosure Agreement (NDA)",
    body: `NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement ("Agreement") is entered into as of _________________ ("Effective Date")

BETWEEN:

DISCLOSING PARTY:
Name: _________________________________________
Company: MiCasa Real Estate LLC
Address: _______________________________________

AND

RECEIVING PARTY:
Name: _________________________________________
Company: ______________________________________
Address: _______________________________________

RECITALS:
The Disclosing Party possesses certain confidential and proprietary information relating to real estate transactions, client data, property details, and business operations ("Confidential Information") that it wishes to disclose to the Receiving Party for the purpose of:

_______________________________________________ ("Purpose")

AGREEMENT:

1. DEFINITION OF CONFIDENTIAL INFORMATION
   "Confidential Information" includes but is not limited to:
   - Client names, contact details, and financial information
   - Property details, valuations, and transaction terms
   - Commission structures and fee arrangements
   - Business strategies and marketing plans
   - Any information marked as "Confidential"

2. OBLIGATIONS OF RECEIVING PARTY
   The Receiving Party agrees to:
   a) Keep all Confidential Information strictly confidential
   b) Not disclose to any third party without prior written consent
   c) Use Confidential Information solely for the Purpose
   d) Protect Confidential Information with reasonable care
   e) Return or destroy all materials upon request

3. EXCLUSIONS
   This Agreement does not apply to information that:
   a) Is publicly available through no fault of Receiving Party
   b) Was known to Receiving Party prior to disclosure
   c) Is required to be disclosed by law

4. TERM
   This Agreement shall remain in effect for _____ years from the Effective Date.

5. REMEDIES
   The Receiving Party acknowledges that breach may cause irreparable harm, and the Disclosing Party shall be entitled to seek injunctive relief.

6. GOVERNING LAW
   This Agreement is governed by the laws of the United Arab Emirates.

SIGNATURES:

_________________________          _________________________
Disclosing Party                   Date

_________________________          _________________________
Receiving Party                    Date
`
  },

  // =====================================================
  // VIEWING CONFIRMATION RECEIPT
  // =====================================================
  "STATIC_VIEWING_RECEIPT": {
    title: "Property Viewing Confirmation Receipt",
    body: `PROPERTY VIEWING CONFIRMATION RECEIPT

MiCasa Real Estate LLC
Licensed Real Estate Broker

Date: _______________________
Reference No.: VR-___________

VIEWING DETAILS:

Property Viewed:
Address: ______________________________________
Unit/Villa No.: ________________________________
Property Type: _________________________________

Viewing Date: __________________________________
Viewing Time: __________________________________

VIEWER DETAILS:

Name: _________________________________________
Emirates ID / Passport: ________________________
Mobile: _______________________________________
Email: ________________________________________

ACCOMPANIED BY:

Agent Name: ___________________________________
Agent BRN: ____________________________________
Mobile: _______________________________________

CONFIRMATION:

I confirm that I have viewed the above property on the date and time specified. I understand that:

1. MiCasa Real Estate LLC introduced me to this property
2. Any direct negotiation with the owner/landlord regarding this property must be conducted through MiCasa Real Estate LLC
3. This viewing confirmation is valid for a period of 6 months from the date above
4. I agree to the non-circumvention terms of the viewing

Property Condition Notes:
_______________________________________________
_______________________________________________
_______________________________________________

Interest Level:
[ ] High - Ready to proceed
[ ] Medium - Considering
[ ] Low - Not suitable

SIGNATURES:

_________________________          _________________________
Viewer                             Date

_________________________          _________________________
MiCasa Agent                       Date

For office use only:
Entered in CRM: [ ] Yes  Date: _________
Follow-up scheduled: [ ] Yes  Date: _________
`
  },

  // =====================================================
  // COMMISSION PAYMENT RECEIPT
  // =====================================================
  "STATIC_COMMISSION_RECEIPT": {
    title: "Commission Payment Receipt",
    body: `COMMISSION PAYMENT RECEIPT

MiCasa Real Estate LLC
Licensed Real Estate Broker
License No.: _________________

OFFICIAL RECEIPT

Receipt No.: CR-_____________
Date: _______________________

RECEIVED FROM:

Name: _________________________________________
Company (if applicable): _______________________
Emirates ID / Trade License: ___________________
Address: ______________________________________
Mobile: _______________________________________

TRANSACTION DETAILS:

Property Reference: ____________________________
Property Address: ______________________________
Transaction Type: [ ] Sale  [ ] Lease
Transaction Date: ______________________________
Transaction Value: AED _________________________

PAYMENT DETAILS:

Description                          Amount (AED)
─────────────────────────────────────────────────
Commission Amount:                   ____________
VAT (if applicable):                 ____________
─────────────────────────────────────────────────
TOTAL RECEIVED:                      ____________

Payment Method: [ ] Bank Transfer  [ ] Cheque  [ ] Cash
Cheque No. / Transfer Ref.: ____________________
Bank: _________________________________________
Date Received: _________________________________

ACKNOWLEDGMENT:

MiCasa Real Estate LLC acknowledges receipt of the above payment as full and final settlement of commission for the referenced transaction.

This receipt is issued subject to clearance of funds.

_________________________
Authorized Signatory
MiCasa Real Estate LLC

Company Stamp:



For queries: accounts@micasa.ae | +971 XX XXX XXXX
`
  },

  // =====================================================
  // HANDOVER CHECKLIST
  // =====================================================
  "STATIC_HANDOVER_CHECKLIST": {
    title: "Property Handover Checklist",
    body: `PROPERTY HANDOVER CHECKLIST

MiCasa Real Estate LLC

Date: _______________________
Property: ____________________
Unit No.: ____________________

PARTIES PRESENT:

Outgoing Party: _______________________________ 
Incoming Party: _______________________________
MiCasa Representative: ________________________

CHECKLIST:

KEYS & ACCESS
[ ] Main door keys (Qty: ___)
[ ] Bedroom keys (Qty: ___)
[ ] Mailbox key
[ ] Parking access card/remote
[ ] Building access card
[ ] Gate remote

UTILITIES
[ ] DEWA/ADDC meter reading: ___________________
[ ] District cooling reading: __________________
[ ] Internet router returned: [ ] Yes [ ] N/A

GENERAL CONDITION
[ ] Walls - clean, no marks/holes
[ ] Flooring - good condition
[ ] Windows - clean, functioning
[ ] Doors - all present, functioning
[ ] Light fixtures - all working
[ ] AC units - functioning

KITCHEN
[ ] Cabinets - clean, intact
[ ] Countertops - clean, undamaged
[ ] Appliances - clean, working
[ ] Sink/faucet - no leaks
[ ] Hood/exhaust - clean

BATHROOMS
[ ] Fixtures - clean, no leaks
[ ] Tiles - clean, no cracks
[ ] Shower/tub - clean, draining
[ ] Mirror - clean, intact
[ ] Exhaust fan - working

OUTDOOR (if applicable)
[ ] Balcony - clean
[ ] Garden - maintained
[ ] Pool - clean (if private)

DAMAGES NOTED:
_______________________________________________
_______________________________________________
_______________________________________________

METER READINGS:
Electricity: _________________________________
Water: _______________________________________
District Cooling: ____________________________

SECURITY DEPOSIT:
Amount Held: AED _____________________________
Deductions: AED ______________________________
Refund Due: AED ______________________________

SIGNATURES:

_________________________          _________________________
Outgoing Party                     Date

_________________________          _________________________
Incoming Party                     Date

_________________________          _________________________
MiCasa Representative              Date
`
  },

  // =====================================================
  // RESERVATION AGREEMENT
  // =====================================================
  "STATIC_RESERVATION": {
    title: "Property Reservation Agreement",
    body: `PROPERTY RESERVATION AGREEMENT

This Reservation Agreement is made on _________________ ("Date")

BETWEEN:

SELLER / LANDLORD ("Owner"):
Name: _________________________________________
Contact: ______________________________________

AND

BUYER / TENANT ("Reserving Party"):
Name: _________________________________________
Emirates ID: __________________________________
Contact: ______________________________________

THROUGH:

BROKER:
MiCasa Real Estate LLC
Agent: ________________________________________

PROPERTY DETAILS:
Address: ______________________________________
Unit No.: _____________________________________
Type: _________________________________________
Size: _________ sq.ft

RESERVATION TERMS:

1. RESERVATION AMOUNT
   Amount: AED _________________________________
   Payment Method: _____________________________
   Date Paid: __________________________________

2. RESERVATION PERIOD
   Valid From: _________________________________
   Valid Until: ________________________________
   Duration: ___ days

3. TRANSACTION TERMS
   Transaction Type: [ ] Sale  [ ] Lease
   Agreed Price/Rent: AED _____________________
   
   For Sale:
   - Deposit Due: AED __________________________
   - Balance Due: Upon transfer

   For Lease:
   - Security Deposit: AED _____________________
   - Cheques: __________________________________
   - Start Date: _______________________________

4. CONDITIONS
   [ ] Subject to mortgage approval
   [ ] Subject to property inspection
   [ ] Subject to: _____________________________

5. REFUND POLICY
   If Reserving Party withdraws: Reservation amount is [ ] Refundable [ ] Non-refundable
   If Owner withdraws: Full refund plus AED _____ compensation

6. CONVERSION
   Upon proceeding, reservation amount will be credited toward:
   [ ] Purchase deposit
   [ ] Security deposit
   [ ] First rent payment

ACKNOWLEDGMENT:

Both parties acknowledge that this reservation creates a binding obligation to proceed with the transaction on the terms above, subject to the stated conditions.

SIGNATURES:

_________________________          _________________________
Owner / Authorized Rep             Date

_________________________          _________________________
Reserving Party                    Date

_________________________          _________________________
MiCasa Representative              Date

Reservation Receipt No.: RES-_____________________
`
  }
};

// List of all static template IDs
export const STATIC_TEMPLATE_IDS = Object.keys(STATIC_TEMPLATES);

// Check if a prompt is a static template
export function isStaticTemplate(promptId: string): boolean {
  return promptId in STATIC_TEMPLATES;
}

// Get static template content
export function getStaticTemplate(promptId: string): StaticTemplate | null {
  return STATIC_TEMPLATES[promptId] || null;
}
