import { useMemo } from "react";

/**
 * Default MiCasa company information for form prefilling
 */
export interface MiCasaDefaults {
  legal_name: string;
  license_no: string;
  trn: string;
  vat_registered: boolean;
  address: string;
  email: string;
  phone: string;
}

/**
 * Default assigned agent placeholder
 */
export interface AgentDefaults {
  full_name: string;
  agent_id_or_brn: string;
  email: string;
  mobile: string;
}

/**
 * Hook to get default MiCasa company data for form prefilling
 */
export function useMiCasaDefaults() {
  const micasaDefaults: MiCasaDefaults = useMemo(() => ({
    legal_name: "MiCasa Real Estate LLC",
    license_no: "CN-1234567", // Placeholder - should come from brokerage_context
    trn: "", // Tax Registration Number - optional
    vat_registered: false,
    address: "Abu Dhabi, UAE",
    email: "info@micasa.ae",
    phone: "+971 2 XXX XXXX"
  }), []);

  const agentDefaults: AgentDefaults = useMemo(() => ({
    full_name: "",
    agent_id_or_brn: "",
    email: "",
    mobile: ""
  }), []);

  /**
   * Get prefilled form data for a given template
   */
  const getPrefilledData = (promptId: string): Record<string, unknown> => {
    const baseData: Record<string, unknown> = {
      micasa: micasaDefaults,
      assigned_agent: agentDefaults
    };

    // Add template-specific prefills
    switch (promptId) {
      case "DOC_BROKERAGE_SALES":
        return {
          ...baseData,
          client_role: "",
          contract_term: {
            non_exclusive: true
          }
        };
      case "DOC_BROKERAGE_LEASING":
        return {
          ...baseData,
          client_role: "",
          contract_term: {
            non_exclusive: true
          }
        };
      case "DOC_COMMISSION_INVOICE":
        return {
          supplier: micasaDefaults,
          amounts: {
            currency: "AED"
          }
        };
      default:
        return baseData;
    }
  };

  return {
    micasaDefaults,
    agentDefaults,
    getPrefilledData
  };
}

/**
 * Recent templates storage utilities
 */
export interface RecentTemplate {
  prompt_id: string;
  title: string;
  usedAt: string;
}

const RECENT_TEMPLATES_KEY = "micasa_recent_templates";
const MAX_RECENT_TEMPLATES = 5;

export function getRecentTemplates(): RecentTemplate[] {
  try {
    const stored = localStorage.getItem(RECENT_TEMPLATES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function addRecentTemplate(prompt_id: string, title: string): void {
  try {
    const recent = getRecentTemplates().filter(t => t.prompt_id !== prompt_id);
    recent.unshift({
      prompt_id,
      title,
      usedAt: new Date().toISOString()
    });
    localStorage.setItem(
      RECENT_TEMPLATES_KEY, 
      JSON.stringify(recent.slice(0, MAX_RECENT_TEMPLATES))
    );
  } catch {
    // Ignore localStorage errors
  }
}
