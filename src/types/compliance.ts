// Compliance Engine Types for Abu Dhabi Real Estate BOS

export type ComplianceStatus = "APPROVED" | "BLOCKED" | "ESCALATED";
export type RuleSeverity = "BLOCK" | "ESCALATE";
export type ContextType = "listing" | "transaction" | "marketing";
export type AmlRiskLevel = "LOW" | "MEDIUM" | "HIGH";
export type MadhmounStatus = "DRAFT" | "PENDING" | "VERIFIED" | "REJECTED";

// Rule evaluation result
export interface RuleResult {
  ruleId: string;
  ruleName: string;
  passed: boolean;
  severity: RuleSeverity;
  message?: string;
  requiredAction?: string;
}

// Module evaluation result
export interface ModuleResult {
  moduleId: string;
  moduleName: string;
  passed: boolean;
  rules: RuleResult[];
}

// Full compliance evaluation result
export interface ComplianceResult {
  id?: string;
  entityType: string;
  entityId: string;
  contextType: ContextType;
  status: ComplianceStatus;
  failedModules: string[];
  failedRules: string[];
  requiredActions: string[];
  escalationReason?: string | null;
  modules: ModuleResult[];
  evaluatedAt?: string;
  evaluatedBy?: string;
}

// Override request payload
export interface OverridePayload {
  name: string;
  reason: string;
  authorizationDocumentUrl?: string;
}

// AML Flags structure
export interface AmlFlags {
  cashInvolved?: boolean;
  foreignPEP?: boolean;
  thirdPartyPayments?: boolean;
  sanctionedCountry?: boolean;
  unusualTransaction?: boolean;
}

// Brokerage data for compliance evaluation
export interface BrokerageData {
  id?: string;
  tradeLicense?: {
    url?: string;
    expiryDate?: string;
  };
  adrecRegistration?: {
    url?: string;
    expiryDate?: string;
  };
}

// Broker data for compliance evaluation
export interface BrokerData {
  id?: string;
  name?: string;
  licenseNumber?: string;
  brokerageId?: string;
  brokerCard?: {
    url?: string;
    expiryDate?: string;
  };
}

// Owner data for compliance evaluation
export interface OwnerData {
  passport?: { url?: string };
  emiratesId?: { url?: string };
}

// Property data for compliance evaluation
export interface PropertyData {
  projectName?: string;
  unitNumber?: string;
  sizeSqm?: number;
  titleDeed?: { url?: string };
  developerAuthorization?: { url?: string };
  isOffPlan?: boolean;
}

// Listing data for compliance evaluation
export interface ListingData {
  price?: number;
  listingAgreement?: {
    url?: string;
    signed?: boolean;
  };
}

// Madhmoun registry data
export interface MadhmounData {
  listingId?: string;
  status?: MadhmounStatus;
}

// Counterparty (Buyer/Tenant) data
export interface CounterpartyData {
  isResident?: boolean;
  passport?: { url?: string };
  emiratesId?: { url?: string };
  sourceOfFundsDeclaration?: { url?: string };
}

// AML evaluation data
export interface AmlData {
  riskLevel?: AmlRiskLevel;
  flags?: AmlFlags;
}

// Advertisement data for marketing compliance
export interface AdData {
  brokerageLicenseNumber?: string;
  brokerName?: string;
  brokerLicenseNumber?: string;
  madhmounListingId?: string;
  priceText?: string;
  channel?: string;
  permitId?: string;
  permitExpiryDate?: string;
  developerApproval?: { url?: string };
}

// Entity linking data
export interface EntityLinks {
  listingToBroker?: boolean;
  listingToOwner?: boolean;
  listingToProperty?: boolean;
}

// Audit log data
export interface AuditLogData {
  createdAt?: string;
  entriesCount?: number;
}

// Transaction data
export interface TransactionData {
  stage?: string;
  createdInBOS?: boolean;
  mou?: { url?: string };
}

// Override data
export interface OverrideData {
  approved?: boolean;
  approvedBy?: string;
  approvedAt?: string;
}

// Reference pricing data
export interface ReferencePricing {
  price?: number;
  source?: string;
}

// Full compliance payload for evaluation
export interface CompliancePayload {
  brokerage?: BrokerageData;
  assignedBroker?: BrokerData;
  owner?: OwnerData;
  property?: PropertyData;
  listing?: ListingData;
  madhmoun?: MadhmounData;
  counterparty?: CounterpartyData;
  aml?: AmlData;
  ad?: AdData;
  links?: EntityLinks;
  auditLog?: AuditLogData;
  transaction?: TransactionData;
  override?: OverrideData;
  referencePricing?: ReferencePricing;
}

// Database types for compliance module
export interface ComplianceModule {
  id: string;
  moduleId: string;
  name: string;
  jurisdiction: string;
  isActive: boolean;
  sortOrder: number;
}

// Database types for compliance rule
export interface ComplianceRule {
  id: string;
  ruleId: string;
  moduleId: string;
  name: string;
  type: string;
  severity: RuleSeverity;
  appliesTo: ContextType[];
  requirements: unknown[];
  actionOnFail: {
    status: ComplianceStatus;
    requiredAction: string;
  };
  isActive: boolean;
  sortOrder: number;
}

// Compliance evaluation request
export interface ComplianceEvaluationRequest {
  contextType: ContextType;
  entityType: string;
  entityId: string;
  payload: CompliancePayload;
}

// Compliance evaluation response
export interface ComplianceEvaluationResponse {
  success: boolean;
  result?: ComplianceResult;
  error?: string;
}
