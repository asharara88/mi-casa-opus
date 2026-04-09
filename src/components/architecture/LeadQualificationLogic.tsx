import type { ReactNode } from "react";
import { CheckCircle2, AlertTriangle, Bot, Workflow, ArrowDown, ShieldX } from "lucide-react";

const SectionHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div className="flex items-start justify-between gap-3">
    <div>
      <h2 className="text-lg md:text-xl font-semibold text-slate-900">{title}</h2>
      {subtitle && <p className="text-xs md:text-sm text-slate-500 mt-1">{subtitle}</p>}
    </div>
  </div>
);

const Table = ({ children }: { children: ReactNode }) => (
  <div className="overflow-x-auto border border-slate-200 rounded-xl">
    <table className="min-w-full text-left text-xs md:text-sm">
      {children}
    </table>
  </div>
);

const HeadCell = ({ children }: { children: ReactNode }) => (
  <th className="px-3 py-2 bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
    {children}
  </th>
);

const Cell = ({ children }: { children: ReactNode }) => (
  <td className="px-3 py-2 border-b border-slate-200 text-slate-700">{children}</td>
);

export const LeadQualificationLogic = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-10 text-slate-900">
      <div className="text-center mb-6 md:mb-10">
        <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-semibold">
          MiCasa B2C Qualification Algorithm
        </div>
        <h1 className="text-2xl md:text-4xl font-bold mt-3">Prospect → Lead → Deal → Close</h1>
        <p className="text-xs md:text-sm text-slate-500 mt-2 max-w-3xl mx-auto">
          Deterministic rules only. AI is advisory and writes to separate fields; rules decide all stage changes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
        <div className="lg:col-span-2 border border-slate-200 rounded-xl p-4 md:p-5">
          <SectionHeader title="Assumptions (explicit parameters)" />
          <ul className="mt-3 space-y-2 text-xs md:text-sm text-slate-600">
            <li>MIN_UNIT_PRICE_AED = lowest active unit price in inventory (system-calculated nightly).</li>
            <li>TARGET_BUDGET_RANGE_AED = ops-defined target band for priority follow-up.</li>
            <li>Eligible-to-buy = passes UAE legal eligibility checks when applicable.</li>
            <li>Timeframe options = 0–3, 3–6, 6–12, 12+ months (required for lead conversion).</li>
          </ul>
        </div>
        <div className="border border-slate-200 rounded-xl p-4 md:p-5">
          <SectionHeader title="AI Field Policy" subtitle="AI advises; rules execute" />
          <ul className="mt-3 space-y-2 text-xs md:text-sm text-slate-600">
            <li>AI writes: ai_intent_label, ai_summary, ai_risk_flags, ai_recommended_action.</li>
            <li>AI cannot: promote stages, create deals, or disqualify.</li>
          </ul>
        </div>
      </div>

      <div className="border border-slate-200 rounded-xl p-4 md:p-6 mb-6">
        <SectionHeader title="Flow (deterministic)" subtitle="No stage change without required fields" />
        <div className="mt-4 grid grid-cols-1 md:grid-cols-5 gap-3 items-center text-xs md:text-sm">
          {[
            "Prospect New",
            "Prospect Verified",
            "Lead Qualified",
            "Deal Open",
            "Closed Won/Lost",
          ].map((step, index) => (
            <div key={step} className="flex flex-col items-center text-center gap-2">
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 w-full">
                <span className="font-semibold text-slate-700">{step}</span>
              </div>
              {index < 4 && <ArrowDown className="w-4 h-4 text-slate-400" />}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div className="border border-slate-200 rounded-xl p-4 md:p-6">
          <SectionHeader title="Lead stages" />
          <div className="mt-4">
            <Table>
              <thead>
                <tr>
                  <HeadCell>Stage</HeadCell>
                  <HeadCell>Definition</HeadCell>
                  <HeadCell>Entry Rule</HeadCell>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <Cell>Prospect New</Cell>
                  <Cell>Raw inbound with valid contact method.</Cell>
                  <Cell>source ∈ {`{"Website", "WhatsApp", "Referral", "Phone", "Portal"}`} AND phone/email exists.</Cell>
                </tr>
                <tr>
                  <Cell>Prospect Verified</Cell>
                  <Cell>Minimum data captured.</Cell>
                  <Cell>buyer_type, budget_range, timeframe all present.</Cell>
                </tr>
                <tr>
                  <Cell>Lead Interested</Cell>
                  <Cell>Shows behavioral intent.</Cell>
                  <Cell>Intent score ≥ 40.</Cell>
                </tr>
                <tr>
                  <Cell>Lead Qualified</Cell>
                  <Cell>Worth advisor time.</Cell>
                  <Cell>Total score ≥ 60 AND timeframe ≤ 12 months.</Cell>
                </tr>
                <tr>
                  <Cell>Lead High-Intent</Cell>
                  <Cell>Priority follow-up.</Cell>
                  <Cell>Total score ≥ 75 AND timeframe ≤ 6 months.</Cell>
                </tr>
                <tr>
                  <Cell>Deal Open</Cell>
                  <Cell>Active sales process.</Cell>
                  <Cell>Lead Qualified or High-Intent AND no active deal exists.</Cell>
                </tr>
                <tr>
                  <Cell>Closed Won/Lost</Cell>
                  <Cell>Final outcome captured.</Cell>
                  <Cell>SPA + payment milestone (won) or explicit loss reason (lost).</Cell>
                </tr>
              </tbody>
            </Table>
          </div>
        </div>

        <div className="border border-slate-200 rounded-xl p-4 md:p-6">
          <SectionHeader title="Qualification criteria" />
          <div className="mt-4">
            <Table>
              <thead>
                <tr>
                  <HeadCell>Category</HeadCell>
                  <HeadCell>Deterministic Signals</HeadCell>
                  <HeadCell>Required For</HeadCell>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <Cell>Identity & Eligibility</Cell>
                  <Cell>buyer_type, residency status, legal eligibility, nationality (if needed)</Cell>
                  <Cell>Prospect Verified</Cell>
                </tr>
                <tr>
                  <Cell>Budget</Cell>
                  <Cell>budget_min, budget_max, financing_method, mortgage pre-approval</Cell>
                  <Cell>Lead Qualified</Cell>
                </tr>
                <tr>
                  <Cell>Timing</Cell>
                  <Cell>timeframe bucket (0–3 / 3–6 / 6–12 / 12+)</Cell>
                  <Cell>Lead Qualified & High-Intent</Cell>
                </tr>
                <tr>
                  <Cell>Behavioral Intent</Cell>
                  <Cell>price list request, WhatsApp chat started, brochure download, repeat visit</Cell>
                  <Cell>Lead Interested+</Cell>
                </tr>
                <tr>
                  <Cell>AI Advisory</Cell>
                  <Cell>ai_intent_label, ai_risk_flags (e.g., broker masking)</Cell>
                  <Cell>Decision support only</Cell>
                </tr>
              </tbody>
            </Table>
          </div>
        </div>

        <div className="border border-slate-200 rounded-xl p-4 md:p-6">
          <SectionHeader title="Lead scoring model" subtitle="Fit + Intent, max 100" />
          <div className="mt-4">
            <Table>
              <thead>
                <tr>
                  <HeadCell>Factor</HeadCell>
                  <HeadCell>Points</HeadCell>
                  <HeadCell>Notes</HeadCell>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <Cell>Budget within target range</Cell>
                  <Cell>+20</Cell>
                  <Cell>Target range defined by ops.</Cell>
                </tr>
                <tr>
                  <Cell>Cash buyer</Cell>
                  <Cell>+10</Cell>
                  <Cell>Financing method = Cash.</Cell>
                </tr>
                <tr>
                  <Cell>Mortgage pre-approval</Cell>
                  <Cell>+10</Cell>
                  <Cell>Verified document flag.</Cell>
                </tr>
                <tr>
                  <Cell>End-user (not broker)</Cell>
                  <Cell>+10</Cell>
                  <Cell>Buyer type = End-user.</Cell>
                </tr>
                <tr>
                  <Cell>Price list requested</Cell>
                  <Cell>+15</Cell>
                  <Cell>Explicit request or form field.</Cell>
                </tr>
                <tr>
                  <Cell>WhatsApp conversation started</Cell>
                  <Cell>+15</Cell>
                  <Cell>Inbound message sent/received.</Cell>
                </tr>
                <tr>
                  <Cell>Brochure / floor plan download</Cell>
                  <Cell>+10</Cell>
                  <Cell>Tracked event.</Cell>
                </tr>
                <tr>
                  <Cell>Repeat visit within 7 days</Cell>
                  <Cell>+10</Cell>
                  <Cell>Tracked event.</Cell>
                </tr>
              </tbody>
            </Table>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs md:text-sm">
            <div className="border border-emerald-200 bg-emerald-50 rounded-lg p-3">
              <p className="font-semibold text-emerald-800">Qualified Buyer</p>
              <p className="text-emerald-700">Score ≥ 60 AND timeframe ≤ 12 months.</p>
            </div>
            <div className="border border-amber-200 bg-amber-50 rounded-lg p-3">
              <p className="font-semibold text-amber-800">High-Intent</p>
              <p className="text-amber-700">Score ≥ 75 AND timeframe ≤ 6 months.</p>
            </div>
            <div className="border border-slate-200 bg-slate-50 rounded-lg p-3">
              <p className="font-semibold text-slate-700">Interested</p>
              <p className="text-slate-600">Score ≥ 40.</p>
            </div>
          </div>
        </div>

        <div className="border border-slate-200 rounded-xl p-4 md:p-6">
          <SectionHeader title="Disqualification logic" subtitle="Hard vs. soft disqualifiers" />
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm">
            <div className="border border-red-200 bg-red-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <ShieldX className="w-4 h-4 text-red-600" />
                <p className="font-semibold text-red-700">Hard disqualifiers (auto)</p>
              </div>
              <ul className="space-y-1 text-red-700">
                <li>budget_max &lt; MIN_UNIT_PRICE_AED</li>
                <li>legal eligibility = false</li>
                <li>buyer_type = Broker</li>
                <li>spam / test / fake contact</li>
              </ul>
            </div>
            <div className="border border-amber-200 bg-amber-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <p className="font-semibold text-amber-700">Soft disqualifiers (recycle)</p>
              </div>
              <ul className="space-y-1 text-amber-700">
                <li>timeframe = 12+ months</li>
                <li>no response after 30 days (move to nurture)</li>
                <li>price-only inquiry without follow-up intent</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border border-slate-200 rounded-xl p-4 md:p-6">
          <SectionHeader title="Automation & routing rules" subtitle="Optimize for low false-positive SQLs" />
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm">
            <div className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Workflow className="w-4 h-4 text-slate-600" />
                <p className="font-semibold text-slate-700">When a lead becomes MQL/SQL</p>
              </div>
              <ul className="space-y-1 text-slate-600">
                <li>MQL = Score ≥ 40 AND minimum data captured.</li>
                <li>SQL = Score ≥ 60 AND timeframe ≤ 12 months AND no hard disqualifier.</li>
              </ul>
            </div>
            <div className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <p className="font-semibold text-slate-700">Routing</p>
              </div>
              <ul className="space-y-1 text-slate-600">
                <li>SQL routed to advisor by segment + round robin.</li>
                <li>High-Intent triggers SLA timer (first response &lt; 15 min).</li>
                <li>Nurture queue for 12+ month timeframe leads.</li>
              </ul>
            </div>
            <div className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Bot className="w-4 h-4 text-violet-600" />
                <p className="font-semibold text-slate-700">AI-assisted automations</p>
              </div>
              <ul className="space-y-1 text-slate-600">
                <li>Extract budget, timeframe, intent from free-text messages.</li>
                <li>Generate advisor summary + next-best-action suggestion.</li>
                <li>Flag broker masking and price-only shoppers.</li>
              </ul>
            </div>
            <div className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <p className="font-semibold text-slate-700">Recycle/Archive</p>
              </div>
              <ul className="space-y-1 text-slate-600">
                <li>No response for 30 days → Nurture.</li>
                <li>Explicit “not buying” → Disqualified with reason code.</li>
                <li>Every disqualification requires a reason.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border border-slate-200 rounded-xl p-4 md:p-6">
          <SectionHeader title="Pseudo-logic (automation-ready)" />
          <pre className="mt-4 bg-slate-950 text-slate-100 rounded-lg p-4 text-[11px] md:text-xs whitespace-pre-wrap">
{`IF source IN (website, whatsapp, referral, phone, portal)
AND (phone OR email) EXISTS
THEN create Prospect (status = NEW)

IF duplicate_contact THEN merge AND EXIT
IF spam OR fake THEN DISQUALIFY(reason=SPAM)

IF buyer_type AND budget_range AND timeframe EXISTS
AND buyer_type != Broker
THEN promote to Prospect Verified
ELSE IF buyer_type == Broker THEN DISQUALIFY(reason=BROKER)

IF budget_max < MIN_UNIT_PRICE_AED THEN DISQUALIFY(reason=BELOW_BUDGET)
IF legal_eligibility == false THEN DISQUALIFY(reason=INELIGIBLE)

FIT_SCORE = 0
IF budget_in_target_range THEN FIT_SCORE += 20
IF financing_method == Cash THEN FIT_SCORE += 10
IF mortgage_preapproval == true THEN FIT_SCORE += 10
IF buyer_type == EndUser THEN FIT_SCORE += 10

INTENT_SCORE = 0
IF price_list_requested THEN INTENT_SCORE += 15
IF whatsapp_started THEN INTENT_SCORE += 15
IF brochure_downloaded THEN INTENT_SCORE += 10
IF repeat_visit_7d THEN INTENT_SCORE += 10

TOTAL_SCORE = FIT_SCORE + INTENT_SCORE

IF TOTAL_SCORE >= 40 THEN stage = Lead Interested
IF TOTAL_SCORE >= 60 AND timeframe <= 12m THEN stage = Lead Qualified
IF TOTAL_SCORE >= 75 AND timeframe <= 6m THEN stage = Lead High-Intent

IF stage IN (Qualified, High-Intent) AND no_active_deal
THEN create Deal (status=Open) AND route advisor

IF no_response >= 30d THEN move to Nurture
IF buyer_withdraws OR financing_failed THEN Deal = Closed_Lost`}
          </pre>
        </div>

        <div className="border border-slate-200 rounded-xl p-4 md:p-6">
          <SectionHeader title="Risks & edge cases" subtitle="Where false positives hide" />
          <ul className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs md:text-sm text-slate-600">
            <li className="border border-slate-200 rounded-lg p-3">Broker masking as buyer → use AI risk flag + manual verification.</li>
            <li className="border border-slate-200 rounded-lg p-3">Budget band mismatch due to currency conversion → normalize to AED.</li>
            <li className="border border-slate-200 rounded-lg p-3">Duplicate contact across portals → dedupe before scoring.</li>
            <li className="border border-slate-200 rounded-lg p-3">High-intent actions with missing budget → keep in Prospect Verified until captured.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
