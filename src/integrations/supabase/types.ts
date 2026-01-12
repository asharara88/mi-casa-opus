export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ai_insights: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          insight_type: string
          is_authoritative: boolean
          next_best_action: string | null
          rationale: Json | null
          score: number | null
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          insight_type: string
          is_authoritative?: boolean
          next_best_action?: string | null
          rationale?: Json | null
          score?: number | null
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          insight_type?: string
          is_authoritative?: boolean
          next_best_action?: string | null
          rationale?: Json | null
          score?: number | null
        }
        Relationships: []
      }
      approvals: {
        Row: {
          after_state: Json | null
          approval_type: Database["public"]["Enums"]["approval_type"]
          before_state: Json | null
          entity_id: string
          entity_type: string
          id: string
          notes: string | null
          requested_at: string
          requested_by: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["approval_status"]
        }
        Insert: {
          after_state?: Json | null
          approval_type: Database["public"]["Enums"]["approval_type"]
          before_state?: Json | null
          entity_id: string
          entity_type: string
          id?: string
          notes?: string | null
          requested_at?: string
          requested_by: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["approval_status"]
        }
        Update: {
          after_state?: Json | null
          approval_type?: Database["public"]["Enums"]["approval_type"]
          before_state?: Json | null
          entity_id?: string
          entity_type?: string
          id?: string
          notes?: string | null
          requested_at?: string
          requested_by?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["approval_status"]
        }
        Relationships: []
      }
      broker_profiles: {
        Row: {
          broker_id: string
          broker_status: Database["public"]["Enums"]["broker_status"]
          created_at: string
          ica_document_id: string | null
          id: string
          license_validity: string | null
          personal_license_no: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          broker_id: string
          broker_status?: Database["public"]["Enums"]["broker_status"]
          created_at?: string
          ica_document_id?: string | null
          id?: string
          license_validity?: string | null
          personal_license_no?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          broker_id?: string
          broker_status?: Database["public"]["Enums"]["broker_status"]
          created_at?: string
          ica_document_id?: string | null
          id?: string
          license_validity?: string | null
          personal_license_no?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      brokerage_context: {
        Row: {
          brokerage_id: string
          created_at: string
          id: string
          legal_name: string
          license_context: Json | null
          trade_name: string
          updated_at: string
        }
        Insert: {
          brokerage_id: string
          created_at?: string
          id?: string
          legal_name: string
          license_context?: Json | null
          trade_name: string
          updated_at?: string
        }
        Update: {
          brokerage_id?: string
          created_at?: string
          id?: string
          legal_name?: string
          license_context?: Json | null
          trade_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      commission_records: {
        Row: {
          broker_id: string
          calculation_trace: Json | null
          commission_id: string
          created_at: string
          deal_id: string
          gross_amount: number | null
          id: string
          net_amount: number | null
          split_percent: number | null
          status: Database["public"]["Enums"]["commission_status"]
          updated_at: string
        }
        Insert: {
          broker_id: string
          calculation_trace?: Json | null
          commission_id: string
          created_at?: string
          deal_id: string
          gross_amount?: number | null
          id?: string
          net_amount?: number | null
          split_percent?: number | null
          status?: Database["public"]["Enums"]["commission_status"]
          updated_at?: string
        }
        Update: {
          broker_id?: string
          calculation_trace?: Json | null
          commission_id?: string
          created_at?: string
          deal_id?: string
          gross_amount?: number | null
          id?: string
          net_amount?: number | null
          split_percent?: number | null
          status?: Database["public"]["Enums"]["commission_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "commission_records_broker_id_fkey"
            columns: ["broker_id"]
            isOneToOne: false
            referencedRelation: "broker_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commission_records_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_brokers: {
        Row: {
          assigned_at: string
          broker_id: string
          commission_split_percent: number | null
          deal_id: string
          id: string
          role: string | null
        }
        Insert: {
          assigned_at?: string
          broker_id: string
          commission_split_percent?: number | null
          deal_id: string
          id?: string
          role?: string | null
        }
        Update: {
          assigned_at?: string
          broker_id?: string
          commission_split_percent?: number | null
          deal_id?: string
          id?: string
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deal_brokers_broker_id_fkey"
            columns: ["broker_id"]
            isOneToOne: false
            referencedRelation: "broker_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_brokers_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_parties: {
        Row: {
          created_at: string
          deal_id: string
          id: string
          identity_document_id: string | null
          party_email: string | null
          party_name: string
          party_phone: string | null
          party_role: Database["public"]["Enums"]["party_role"]
        }
        Insert: {
          created_at?: string
          deal_id: string
          id?: string
          identity_document_id?: string | null
          party_email?: string | null
          party_name: string
          party_phone?: string | null
          party_role: Database["public"]["Enums"]["party_role"]
        }
        Update: {
          created_at?: string
          deal_id?: string
          id?: string
          identity_document_id?: string | null
          party_email?: string | null
          party_name?: string
          party_phone?: string | null
          party_role?: Database["public"]["Enums"]["party_role"]
        }
        Relationships: [
          {
            foreignKeyName: "deal_parties_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          created_at: string
          deal_economics: Json | null
          deal_id: string
          deal_state: Database["public"]["Enums"]["deal_state"]
          deal_type: Database["public"]["Enums"]["deal_type"]
          id: string
          linked_lead_id: string | null
          listing_id: string | null
          lost_at: string | null
          lost_reason: Database["public"]["Enums"]["lost_reason"] | null
          lost_reason_notes: string | null
          notes: string | null
          property_id: string | null
          registry_actions: Json | null
          side: Database["public"]["Enums"]["deal_side"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          deal_economics?: Json | null
          deal_id: string
          deal_state?: Database["public"]["Enums"]["deal_state"]
          deal_type: Database["public"]["Enums"]["deal_type"]
          id?: string
          linked_lead_id?: string | null
          listing_id?: string | null
          lost_at?: string | null
          lost_reason?: Database["public"]["Enums"]["lost_reason"] | null
          lost_reason_notes?: string | null
          notes?: string | null
          property_id?: string | null
          registry_actions?: Json | null
          side: Database["public"]["Enums"]["deal_side"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          deal_economics?: Json | null
          deal_id?: string
          deal_state?: Database["public"]["Enums"]["deal_state"]
          deal_type?: Database["public"]["Enums"]["deal_type"]
          id?: string
          linked_lead_id?: string | null
          listing_id?: string | null
          lost_at?: string | null
          lost_reason?: Database["public"]["Enums"]["lost_reason"] | null
          lost_reason_notes?: string | null
          notes?: string | null
          property_id?: string | null
          registry_actions?: Json | null
          side?: Database["public"]["Enums"]["deal_side"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deals_linked_lead_id_fkey"
            columns: ["linked_lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      document_instances: {
        Row: {
          created_at: string
          data_snapshot: Json
          data_snapshot_hash: string | null
          document_id: string
          entity_id: string
          entity_type: string
          executed_at: string | null
          id: string
          rendered_artifact_hash: string | null
          rendered_artifact_url: string | null
          status: Database["public"]["Enums"]["document_status"]
          template_id: string
        }
        Insert: {
          created_at?: string
          data_snapshot?: Json
          data_snapshot_hash?: string | null
          document_id: string
          entity_id: string
          entity_type: string
          executed_at?: string | null
          id?: string
          rendered_artifact_hash?: string | null
          rendered_artifact_url?: string | null
          status?: Database["public"]["Enums"]["document_status"]
          template_id: string
        }
        Update: {
          created_at?: string
          data_snapshot?: Json
          data_snapshot_hash?: string | null
          document_id?: string
          entity_id?: string
          entity_type?: string
          executed_at?: string | null
          id?: string
          rendered_artifact_hash?: string | null
          rendered_artifact_url?: string | null
          status?: Database["public"]["Enums"]["document_status"]
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_instances_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "document_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      document_templates: {
        Row: {
          created_at: string
          data_binding_schema: Json | null
          doc_type: Database["public"]["Enums"]["doc_type"]
          effective_from: string
          id: string
          name: string
          published_at: string | null
          required_signers_schema: Json | null
          status: Database["public"]["Enums"]["template_status"]
          template_content: string | null
          template_id: string
          template_version: string
        }
        Insert: {
          created_at?: string
          data_binding_schema?: Json | null
          doc_type: Database["public"]["Enums"]["doc_type"]
          effective_from?: string
          id?: string
          name: string
          published_at?: string | null
          required_signers_schema?: Json | null
          status?: Database["public"]["Enums"]["template_status"]
          template_content?: string | null
          template_id: string
          template_version: string
        }
        Update: {
          created_at?: string
          data_binding_schema?: Json | null
          doc_type?: Database["public"]["Enums"]["doc_type"]
          effective_from?: string
          id?: string
          name?: string
          published_at?: string | null
          required_signers_schema?: Json | null
          status?: Database["public"]["Enums"]["template_status"]
          template_content?: string | null
          template_id?: string
          template_version?: string
        }
        Relationships: []
      }
      event_log_entries: {
        Row: {
          action: string
          actor_role: Database["public"]["Enums"]["app_role"] | null
          actor_user_id: string | null
          after_state: Json | null
          before_state: Json | null
          block_reasons: Json | null
          decision: string | null
          entity_id: string
          entity_type: string
          event_hash: string | null
          event_id: string
          id: string
          prev_event_hash: string | null
          rule_set_version: string | null
          timestamp: string
        }
        Insert: {
          action: string
          actor_role?: Database["public"]["Enums"]["app_role"] | null
          actor_user_id?: string | null
          after_state?: Json | null
          before_state?: Json | null
          block_reasons?: Json | null
          decision?: string | null
          entity_id: string
          entity_type: string
          event_hash?: string | null
          event_id: string
          id?: string
          prev_event_hash?: string | null
          rule_set_version?: string | null
          timestamp?: string
        }
        Update: {
          action?: string
          actor_role?: Database["public"]["Enums"]["app_role"] | null
          actor_user_id?: string | null
          after_state?: Json | null
          before_state?: Json | null
          block_reasons?: Json | null
          decision?: string | null
          entity_id?: string
          entity_type?: string
          event_hash?: string | null
          event_id?: string
          id?: string
          prev_event_hash?: string | null
          rule_set_version?: string | null
          timestamp?: string
        }
        Relationships: []
      }
      evidence_objects: {
        Row: {
          captured_at: string
          captured_by: string | null
          entity_id: string | null
          entity_type: string | null
          evidence_id: string
          evidence_type: Database["public"]["Enums"]["evidence_type"]
          file_hash: string | null
          file_url: string | null
          id: string
          immutability_class: Database["public"]["Enums"]["immutability_class"]
          metadata: Json | null
          source: string | null
        }
        Insert: {
          captured_at?: string
          captured_by?: string | null
          entity_id?: string | null
          entity_type?: string | null
          evidence_id: string
          evidence_type: Database["public"]["Enums"]["evidence_type"]
          file_hash?: string | null
          file_url?: string | null
          id?: string
          immutability_class?: Database["public"]["Enums"]["immutability_class"]
          metadata?: Json | null
          source?: string | null
        }
        Update: {
          captured_at?: string
          captured_by?: string | null
          entity_id?: string | null
          entity_type?: string | null
          evidence_id?: string
          evidence_type?: Database["public"]["Enums"]["evidence_type"]
          file_hash?: string | null
          file_url?: string | null
          id?: string
          immutability_class?: Database["public"]["Enums"]["immutability_class"]
          metadata?: Json | null
          source?: string | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          assigned_broker_id: string | null
          consents: Json | null
          contact_email: string | null
          contact_name: string
          contact_phone: string | null
          created_at: string
          id: string
          lead_id: string
          lead_state: Database["public"]["Enums"]["lead_state"]
          lost_at: string | null
          lost_reason: Database["public"]["Enums"]["lost_reason"] | null
          lost_reason_notes: string | null
          notes: string | null
          qualification_data: Json | null
          source: Database["public"]["Enums"]["lead_source"]
          updated_at: string
        }
        Insert: {
          assigned_broker_id?: string | null
          consents?: Json | null
          contact_email?: string | null
          contact_name: string
          contact_phone?: string | null
          created_at?: string
          id?: string
          lead_id: string
          lead_state?: Database["public"]["Enums"]["lead_state"]
          lost_at?: string | null
          lost_reason?: Database["public"]["Enums"]["lost_reason"] | null
          lost_reason_notes?: string | null
          notes?: string | null
          qualification_data?: Json | null
          source?: Database["public"]["Enums"]["lead_source"]
          updated_at?: string
        }
        Update: {
          assigned_broker_id?: string | null
          consents?: Json | null
          contact_email?: string | null
          contact_name?: string
          contact_phone?: string | null
          created_at?: string
          id?: string
          lead_id?: string
          lead_state?: Database["public"]["Enums"]["lead_state"]
          lost_at?: string | null
          lost_reason?: Database["public"]["Enums"]["lost_reason"] | null
          lost_reason_notes?: string | null
          notes?: string | null
          qualification_data?: Json | null
          source?: Database["public"]["Enums"]["lead_source"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_assigned_broker_id_fkey"
            columns: ["assigned_broker_id"]
            isOneToOne: false
            referencedRelation: "broker_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          approved_faqs: Json | null
          asking_terms: Json | null
          created_at: string
          id: string
          listing_attributes: Json | null
          listing_id: string
          listing_type: Database["public"]["Enums"]["listing_type"]
          mandate_agreement_id: string | null
          owner_party_id: string | null
          property_id: string | null
          status: Database["public"]["Enums"]["listing_status"]
          updated_at: string
        }
        Insert: {
          approved_faqs?: Json | null
          asking_terms?: Json | null
          created_at?: string
          id?: string
          listing_attributes?: Json | null
          listing_id: string
          listing_type: Database["public"]["Enums"]["listing_type"]
          mandate_agreement_id?: string | null
          owner_party_id?: string | null
          property_id?: string | null
          status?: Database["public"]["Enums"]["listing_status"]
          updated_at?: string
        }
        Update: {
          approved_faqs?: Json | null
          asking_terms?: Json | null
          created_at?: string
          id?: string
          listing_attributes?: Json | null
          listing_id?: string
          listing_type?: Database["public"]["Enums"]["listing_type"]
          mandate_agreement_id?: string | null
          owner_party_id?: string | null
          property_id?: string | null
          status?: Database["public"]["Enums"]["listing_status"]
          updated_at?: string
        }
        Relationships: []
      }
      payout_batches: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          batch_id: string
          created_at: string
          created_by: string
          executed_at: string | null
          id: string
          payment_evidence_id: string | null
          status: Database["public"]["Enums"]["payout_status"]
          total_amount: number | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          batch_id: string
          created_at?: string
          created_by: string
          executed_at?: string | null
          id?: string
          payment_evidence_id?: string | null
          status?: Database["public"]["Enums"]["payout_status"]
          total_amount?: number | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          batch_id?: string
          created_at?: string
          created_by?: string
          executed_at?: string | null
          id?: string
          payment_evidence_id?: string | null
          status?: Database["public"]["Enums"]["payout_status"]
          total_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "payout_batches_payment_evidence_id_fkey"
            columns: ["payment_evidence_id"]
            isOneToOne: false
            referencedRelation: "evidence_objects"
            referencedColumns: ["id"]
          },
        ]
      }
      payout_lines: {
        Row: {
          amount: number
          batch_id: string
          commission_id: string
          id: string
          status: string | null
        }
        Insert: {
          amount: number
          batch_id: string
          commission_id: string
          id?: string
          status?: string | null
        }
        Update: {
          amount?: number
          batch_id?: string
          commission_id?: string
          id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payout_lines_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "payout_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payout_lines_commission_id_fkey"
            columns: ["commission_id"]
            isOneToOne: false
            referencedRelation: "commission_records"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      signature_envelopes: {
        Row: {
          authority_checks: Json | null
          completed_at: string | null
          created_at: string
          document_id: string
          envelope_id: string
          execution_evidence: Json | null
          id: string
          signers: Json
          status: Database["public"]["Enums"]["signature_status"]
        }
        Insert: {
          authority_checks?: Json | null
          completed_at?: string | null
          created_at?: string
          document_id: string
          envelope_id: string
          execution_evidence?: Json | null
          id?: string
          signers?: Json
          status?: Database["public"]["Enums"]["signature_status"]
        }
        Update: {
          authority_checks?: Json | null
          completed_at?: string | null
          created_at?: string
          document_id?: string
          envelope_id?: string
          execution_evidence?: Json | null
          id?: string
          signers?: Json
          status?: Database["public"]["Enums"]["signature_status"]
        }
        Relationships: [
          {
            foreignKeyName: "signature_envelopes_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "document_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "Operator" | "LegalOwner" | "Broker" | "Investor"
      approval_status: "Pending" | "Approved" | "Rejected"
      approval_type:
        | "EconomicsOverride"
        | "PayoutBatch"
        | "ComplianceWaiver"
        | "TemplatePublish"
      broker_status: "Pending" | "Active" | "Suspended" | "Terminated"
      commission_status: "Expected" | "Earned" | "Received" | "Paid" | "Voided"
      deal_side: "Buy" | "Sell" | "Lease" | "Let"
      deal_state:
        | "Created"
        | "Qualified"
        | "Viewing"
        | "Offer"
        | "Reservation"
        | "SPA"
        | "ClosedWon"
        | "ClosedLost"
      deal_type: "Sale" | "Lease" | "OffPlan"
      doc_type:
        | "MOU"
        | "SPA"
        | "Reservation"
        | "Mandate"
        | "ICA"
        | "NDA"
        | "POA"
        | "CommissionInvoice"
        | "Receipt"
        | "Other"
      document_status: "Draft" | "Pending" | "Executed" | "Voided"
      evidence_type:
        | "DARI"
        | "TAMM"
        | "PaymentProof"
        | "Identity"
        | "TruthPack"
        | "Photo"
        | "Email"
        | "Contract"
        | "Other"
      immutability_class: "External" | "Internal" | "System"
      lead_source:
        | "Website"
        | "Referral"
        | "Portal"
        | "WalkIn"
        | "SocialMedia"
        | "Event"
        | "Other"
      lead_state:
        | "New"
        | "Contacted"
        | "Qualified"
        | "Disqualified"
        | "Converted"
      listing_status: "Draft" | "Active" | "Reserved" | "Sold" | "Withdrawn"
      listing_type: "Sale" | "Lease" | "OffPlan"
      lost_reason:
        | "NoContact"
        | "NotQualified"
        | "BudgetMismatch"
        | "TimelineMismatch"
        | "ChoseCompetitor"
        | "PropertyUnavailable"
        | "FinancingFailed"
        | "ClientWithdrew"
        | "DuplicateLead"
        | "Other"
      party_role:
        | "Buyer"
        | "Seller"
        | "Lessor"
        | "Lessee"
        | "Representative"
        | "Developer"
      payout_status:
        | "Draft"
        | "PendingApproval"
        | "Approved"
        | "Executed"
        | "Voided"
      signature_status: "Pending" | "Signed" | "Declined" | "Expired"
      template_status: "Draft" | "Published" | "Deprecated"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["Operator", "LegalOwner", "Broker", "Investor"],
      approval_status: ["Pending", "Approved", "Rejected"],
      approval_type: [
        "EconomicsOverride",
        "PayoutBatch",
        "ComplianceWaiver",
        "TemplatePublish",
      ],
      broker_status: ["Pending", "Active", "Suspended", "Terminated"],
      commission_status: ["Expected", "Earned", "Received", "Paid", "Voided"],
      deal_side: ["Buy", "Sell", "Lease", "Let"],
      deal_state: [
        "Created",
        "Qualified",
        "Viewing",
        "Offer",
        "Reservation",
        "SPA",
        "ClosedWon",
        "ClosedLost",
      ],
      deal_type: ["Sale", "Lease", "OffPlan"],
      doc_type: [
        "MOU",
        "SPA",
        "Reservation",
        "Mandate",
        "ICA",
        "NDA",
        "POA",
        "CommissionInvoice",
        "Receipt",
        "Other",
      ],
      document_status: ["Draft", "Pending", "Executed", "Voided"],
      evidence_type: [
        "DARI",
        "TAMM",
        "PaymentProof",
        "Identity",
        "TruthPack",
        "Photo",
        "Email",
        "Contract",
        "Other",
      ],
      immutability_class: ["External", "Internal", "System"],
      lead_source: [
        "Website",
        "Referral",
        "Portal",
        "WalkIn",
        "SocialMedia",
        "Event",
        "Other",
      ],
      lead_state: [
        "New",
        "Contacted",
        "Qualified",
        "Disqualified",
        "Converted",
      ],
      listing_status: ["Draft", "Active", "Reserved", "Sold", "Withdrawn"],
      listing_type: ["Sale", "Lease", "OffPlan"],
      lost_reason: [
        "NoContact",
        "NotQualified",
        "BudgetMismatch",
        "TimelineMismatch",
        "ChoseCompetitor",
        "PropertyUnavailable",
        "FinancingFailed",
        "ClientWithdrew",
        "DuplicateLead",
        "Other",
      ],
      party_role: [
        "Buyer",
        "Seller",
        "Lessor",
        "Lessee",
        "Representative",
        "Developer",
      ],
      payout_status: [
        "Draft",
        "PendingApproval",
        "Approved",
        "Executed",
        "Voided",
      ],
      signature_status: ["Pending", "Signed", "Declined", "Expired"],
      template_status: ["Draft", "Published", "Deprecated"],
    },
  },
} as const
