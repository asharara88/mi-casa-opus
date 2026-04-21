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
      activities: {
        Row: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          body: string | null
          channel: string | null
          contact_id: string | null
          created_at: string
          created_by: string | null
          direction: Database["public"]["Enums"]["activity_direction_v2"]
          duration_seconds: number | null
          external_id: string | null
          id: string
          metadata: Json | null
          occurred_at: string
          opportunity_id: string | null
          status: string | null
          subject: string | null
        }
        Insert: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          body?: string | null
          channel?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          direction?: Database["public"]["Enums"]["activity_direction_v2"]
          duration_seconds?: number | null
          external_id?: string | null
          id?: string
          metadata?: Json | null
          occurred_at?: string
          opportunity_id?: string | null
          status?: string | null
          subject?: string | null
        }
        Update: {
          activity_type?: Database["public"]["Enums"]["activity_type"]
          body?: string | null
          channel?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          direction?: Database["public"]["Enums"]["activity_direction_v2"]
          duration_seconds?: number | null
          external_id?: string | null
          id?: string
          metadata?: Json | null
          occurred_at?: string
          opportunity_id?: string | null
          status?: string | null
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_conversations: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
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
      ai_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          mode: string | null
          role: string
        }
        Insert: {
          content?: string
          conversation_id: string
          created_at?: string
          id?: string
          mode?: string | null
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          mode?: string | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
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
      bos_manifest_prompts: {
        Row: {
          created_at: string
          depends_on: string[]
          group_name: string
          id: string
          input_schema: Json
          is_active: boolean
          output_schema: Json
          prompt: string
          prompt_id: string
          purpose: string
          refusal_policy: Json | null
          sort_order: number
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          depends_on?: string[]
          group_name: string
          id?: string
          input_schema?: Json
          is_active?: boolean
          output_schema?: Json
          prompt: string
          prompt_id: string
          purpose: string
          refusal_policy?: Json | null
          sort_order?: number
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          depends_on?: string[]
          group_name?: string
          id?: string
          input_schema?: Json
          is_active?: boolean
          output_schema?: Json
          prompt?: string
          prompt_id?: string
          purpose?: string
          refusal_policy?: Json | null
          sort_order?: number
          tags?: string[]
          title?: string
          updated_at?: string
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
      communication_logs: {
        Row: {
          channel: Database["public"]["Enums"]["communication_channel"]
          content: string
          created_at: string
          created_by: string | null
          delivered_at: string | null
          direction: Database["public"]["Enums"]["message_direction"]
          entity_id: string
          entity_type: string
          error_message: string | null
          external_id: string | null
          id: string
          metadata: Json | null
          read_at: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["message_status"]
          subject: string | null
          template_used: string | null
        }
        Insert: {
          channel: Database["public"]["Enums"]["communication_channel"]
          content: string
          created_at?: string
          created_by?: string | null
          delivered_at?: string | null
          direction?: Database["public"]["Enums"]["message_direction"]
          entity_id: string
          entity_type: string
          error_message?: string | null
          external_id?: string | null
          id?: string
          metadata?: Json | null
          read_at?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["message_status"]
          subject?: string | null
          template_used?: string | null
        }
        Update: {
          channel?: Database["public"]["Enums"]["communication_channel"]
          content?: string
          created_at?: string
          created_by?: string | null
          delivered_at?: string | null
          direction?: Database["public"]["Enums"]["message_direction"]
          entity_id?: string
          entity_type?: string
          error_message?: string | null
          external_id?: string | null
          id?: string
          metadata?: Json | null
          read_at?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["message_status"]
          subject?: string | null
          template_used?: string | null
        }
        Relationships: []
      }
      compliance_modules: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          jurisdiction: string
          module_id: string
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          jurisdiction?: string
          module_id: string
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          jurisdiction?: string
          module_id?: string
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      compliance_overrides: {
        Row: {
          approved_at: string
          approved_by: string | null
          authorization_document_url: string | null
          compliance_result_id: string
          created_at: string
          id: string
          overrider_name: string
          reason: string
        }
        Insert: {
          approved_at?: string
          approved_by?: string | null
          authorization_document_url?: string | null
          compliance_result_id: string
          created_at?: string
          id?: string
          overrider_name: string
          reason: string
        }
        Update: {
          approved_at?: string
          approved_by?: string | null
          authorization_document_url?: string | null
          compliance_result_id?: string
          created_at?: string
          id?: string
          overrider_name?: string
          reason?: string
        }
        Relationships: [
          {
            foreignKeyName: "compliance_overrides_compliance_result_id_fkey"
            columns: ["compliance_result_id"]
            isOneToOne: false
            referencedRelation: "compliance_results"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_results: {
        Row: {
          context_type: Database["public"]["Enums"]["compliance_context_type"]
          created_at: string
          entity_id: string
          entity_type: string
          escalation_reason: string | null
          evaluated_at: string
          evaluated_by: string | null
          failed_modules: string[]
          failed_rules: string[]
          id: string
          modules_detail: Json
          payload_snapshot: Json
          required_actions: string[]
          status: Database["public"]["Enums"]["compliance_status"]
        }
        Insert: {
          context_type: Database["public"]["Enums"]["compliance_context_type"]
          created_at?: string
          entity_id: string
          entity_type: string
          escalation_reason?: string | null
          evaluated_at?: string
          evaluated_by?: string | null
          failed_modules?: string[]
          failed_rules?: string[]
          id?: string
          modules_detail?: Json
          payload_snapshot?: Json
          required_actions?: string[]
          status?: Database["public"]["Enums"]["compliance_status"]
        }
        Update: {
          context_type?: Database["public"]["Enums"]["compliance_context_type"]
          created_at?: string
          entity_id?: string
          entity_type?: string
          escalation_reason?: string | null
          evaluated_at?: string
          evaluated_by?: string | null
          failed_modules?: string[]
          failed_rules?: string[]
          id?: string
          modules_detail?: Json
          payload_snapshot?: Json
          required_actions?: string[]
          status?: Database["public"]["Enums"]["compliance_status"]
        }
        Relationships: []
      }
      compliance_rules: {
        Row: {
          action_on_fail: Json
          applies_to: Database["public"]["Enums"]["compliance_context_type"][]
          created_at: string
          id: string
          is_active: boolean
          module_id: string
          name: string
          requirements: Json
          rule_id: string
          severity: Database["public"]["Enums"]["compliance_rule_severity"]
          sort_order: number
          type: string
          updated_at: string
        }
        Insert: {
          action_on_fail?: Json
          applies_to?: Database["public"]["Enums"]["compliance_context_type"][]
          created_at?: string
          id?: string
          is_active?: boolean
          module_id: string
          name: string
          requirements?: Json
          rule_id: string
          severity?: Database["public"]["Enums"]["compliance_rule_severity"]
          sort_order?: number
          type: string
          updated_at?: string
        }
        Update: {
          action_on_fail?: Json
          applies_to?: Database["public"]["Enums"]["compliance_context_type"][]
          created_at?: string
          id?: string
          is_active?: boolean
          module_id?: string
          name?: string
          requirements?: Json
          rule_id?: string
          severity?: Database["public"]["Enums"]["compliance_rule_severity"]
          sort_order?: number
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "compliance_rules_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "compliance_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          alt_phone: string | null
          company: string | null
          consents: Json | null
          contact_type: Database["public"]["Enums"]["contact_type"]
          created_at: string
          created_by: string | null
          custom_fields: Json | null
          email: string | null
          full_name: string
          id: string
          last_contacted_at: string | null
          lifecycle_stage: Database["public"]["Enums"]["lifecycle_stage"]
          nationality: string | null
          notes: string | null
          owner_user_id: string | null
          phone: string | null
          preferred_language: string | null
          source: string | null
          tags: string[] | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          alt_phone?: string | null
          company?: string | null
          consents?: Json | null
          contact_type?: Database["public"]["Enums"]["contact_type"]
          created_at?: string
          created_by?: string | null
          custom_fields?: Json | null
          email?: string | null
          full_name: string
          id?: string
          last_contacted_at?: string | null
          lifecycle_stage?: Database["public"]["Enums"]["lifecycle_stage"]
          nationality?: string | null
          notes?: string | null
          owner_user_id?: string | null
          phone?: string | null
          preferred_language?: string | null
          source?: string | null
          tags?: string[] | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          alt_phone?: string | null
          company?: string | null
          consents?: Json | null
          contact_type?: Database["public"]["Enums"]["contact_type"]
          created_at?: string
          created_by?: string | null
          custom_fields?: Json | null
          email?: string | null
          full_name?: string
          id?: string
          last_contacted_at?: string | null
          lifecycle_stage?: Database["public"]["Enums"]["lifecycle_stage"]
          nationality?: string | null
          notes?: string | null
          owner_user_id?: string | null
          phone?: string | null
          preferred_language?: string | null
          source?: string | null
          tags?: string[] | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      contract_events: {
        Row: {
          actor_id: string | null
          actor_name: string | null
          actor_type: string | null
          contract_id: string
          escrow_id: string | null
          event_data: Json | null
          event_hash: string
          event_id: string
          event_type: string
          id: string
          prev_event_hash: string | null
          timestamp: string
        }
        Insert: {
          actor_id?: string | null
          actor_name?: string | null
          actor_type?: string | null
          contract_id: string
          escrow_id?: string | null
          event_data?: Json | null
          event_hash: string
          event_id: string
          event_type: string
          id?: string
          prev_event_hash?: string | null
          timestamp?: string
        }
        Update: {
          actor_id?: string | null
          actor_name?: string | null
          actor_type?: string | null
          contract_id?: string
          escrow_id?: string | null
          event_data?: Json | null
          event_hash?: string
          event_id?: string
          event_type?: string
          id?: string
          prev_event_hash?: string | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "contract_events_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "smart_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_events_escrow_id_fkey"
            columns: ["escrow_id"]
            isOneToOne: false
            referencedRelation: "payment_escrow"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_enquiries: {
        Row: {
          assigned_to: string | null
          bedrooms_max: number | null
          bedrooms_min: number | null
          budget_max: number | null
          budget_min: number | null
          client_email: string | null
          client_name: string
          client_phone: string | null
          company: string | null
          created_at: string
          id: string
          key_requirements: string | null
          notes: string | null
          preferred_location: string | null
          property_type: string | null
          source: string | null
          status: string
          updated_at: string
          urgency: string | null
        }
        Insert: {
          assigned_to?: string | null
          bedrooms_max?: number | null
          bedrooms_min?: number | null
          budget_max?: number | null
          budget_min?: number | null
          client_email?: string | null
          client_name: string
          client_phone?: string | null
          company?: string | null
          created_at?: string
          id?: string
          key_requirements?: string | null
          notes?: string | null
          preferred_location?: string | null
          property_type?: string | null
          source?: string | null
          status?: string
          updated_at?: string
          urgency?: string | null
        }
        Update: {
          assigned_to?: string | null
          bedrooms_max?: number | null
          bedrooms_min?: number | null
          budget_max?: number | null
          budget_min?: number | null
          client_email?: string | null
          client_name?: string
          client_phone?: string | null
          company?: string | null
          created_at?: string
          id?: string
          key_requirements?: string | null
          notes?: string | null
          preferred_location?: string | null
          property_type?: string | null
          source?: string | null
          status?: string
          updated_at?: string
          urgency?: string | null
        }
        Relationships: []
      }
      crm_enquiry_followups: {
        Row: {
          body: string
          completed: boolean
          created_at: string
          enquiry_id: string
          follow_up_date: string | null
          follow_up_type: string
          id: string
        }
        Insert: {
          body: string
          completed?: boolean
          created_at?: string
          enquiry_id: string
          follow_up_date?: string | null
          follow_up_type: string
          id?: string
        }
        Update: {
          body?: string
          completed?: boolean
          created_at?: string
          enquiry_id?: string
          follow_up_date?: string | null
          follow_up_type?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_enquiry_followups_enquiry_id_fkey"
            columns: ["enquiry_id"]
            isOneToOne: false
            referencedRelation: "crm_enquiries"
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
          aml_flags: Json | null
          aml_risk_level: Database["public"]["Enums"]["aml_risk_level"] | null
          compliance_status:
            | Database["public"]["Enums"]["compliance_status"]
            | null
          construction_milestone: string | null
          created_at: string
          deal_economics: Json | null
          deal_id: string
          deal_state: Database["public"]["Enums"]["deal_state"]
          deal_type: Database["public"]["Enums"]["deal_type"]
          developer_id: string | null
          developer_project_id: string | null
          developer_project_name: string | null
          eoi_amount: number | null
          eoi_paid_at: string | null
          handover_date: string | null
          id: string
          linked_lead_id: string | null
          listing_id: string | null
          lost_at: string | null
          lost_reason: Database["public"]["Enums"]["lost_reason"] | null
          lost_reason_notes: string | null
          mortgage_pre_approval_at: string | null
          mortgage_provider: string | null
          mortgage_status: string | null
          next_action: Database["public"]["Enums"]["next_action_type"] | null
          next_action_due: string | null
          next_action_owner: string | null
          noc_obtained_at: string | null
          noc_reference: string | null
          noc_status: string | null
          notes: string | null
          offplan_dead_reason:
            | Database["public"]["Enums"]["offplan_dead_reason"]
            | null
          offplan_state:
            | Database["public"]["Enums"]["offplan_deal_state"]
            | null
          payment_plan_type: string | null
          pipeline: Database["public"]["Enums"]["deal_pipeline"] | null
          property_id: string | null
          registry_actions: Json | null
          secondary_dead_reason:
            | Database["public"]["Enums"]["secondary_dead_reason"]
            | null
          secondary_state:
            | Database["public"]["Enums"]["secondary_deal_state"]
            | null
          side: Database["public"]["Enums"]["deal_side"]
          transfer_date: string | null
          transfer_number: string | null
          updated_at: string
        }
        Insert: {
          aml_flags?: Json | null
          aml_risk_level?: Database["public"]["Enums"]["aml_risk_level"] | null
          compliance_status?:
            | Database["public"]["Enums"]["compliance_status"]
            | null
          construction_milestone?: string | null
          created_at?: string
          deal_economics?: Json | null
          deal_id: string
          deal_state?: Database["public"]["Enums"]["deal_state"]
          deal_type: Database["public"]["Enums"]["deal_type"]
          developer_id?: string | null
          developer_project_id?: string | null
          developer_project_name?: string | null
          eoi_amount?: number | null
          eoi_paid_at?: string | null
          handover_date?: string | null
          id?: string
          linked_lead_id?: string | null
          listing_id?: string | null
          lost_at?: string | null
          lost_reason?: Database["public"]["Enums"]["lost_reason"] | null
          lost_reason_notes?: string | null
          mortgage_pre_approval_at?: string | null
          mortgage_provider?: string | null
          mortgage_status?: string | null
          next_action?: Database["public"]["Enums"]["next_action_type"] | null
          next_action_due?: string | null
          next_action_owner?: string | null
          noc_obtained_at?: string | null
          noc_reference?: string | null
          noc_status?: string | null
          notes?: string | null
          offplan_dead_reason?:
            | Database["public"]["Enums"]["offplan_dead_reason"]
            | null
          offplan_state?:
            | Database["public"]["Enums"]["offplan_deal_state"]
            | null
          payment_plan_type?: string | null
          pipeline?: Database["public"]["Enums"]["deal_pipeline"] | null
          property_id?: string | null
          registry_actions?: Json | null
          secondary_dead_reason?:
            | Database["public"]["Enums"]["secondary_dead_reason"]
            | null
          secondary_state?:
            | Database["public"]["Enums"]["secondary_deal_state"]
            | null
          side: Database["public"]["Enums"]["deal_side"]
          transfer_date?: string | null
          transfer_number?: string | null
          updated_at?: string
        }
        Update: {
          aml_flags?: Json | null
          aml_risk_level?: Database["public"]["Enums"]["aml_risk_level"] | null
          compliance_status?:
            | Database["public"]["Enums"]["compliance_status"]
            | null
          construction_milestone?: string | null
          created_at?: string
          deal_economics?: Json | null
          deal_id?: string
          deal_state?: Database["public"]["Enums"]["deal_state"]
          deal_type?: Database["public"]["Enums"]["deal_type"]
          developer_id?: string | null
          developer_project_id?: string | null
          developer_project_name?: string | null
          eoi_amount?: number | null
          eoi_paid_at?: string | null
          handover_date?: string | null
          id?: string
          linked_lead_id?: string | null
          listing_id?: string | null
          lost_at?: string | null
          lost_reason?: Database["public"]["Enums"]["lost_reason"] | null
          lost_reason_notes?: string | null
          mortgage_pre_approval_at?: string | null
          mortgage_provider?: string | null
          mortgage_status?: string | null
          next_action?: Database["public"]["Enums"]["next_action_type"] | null
          next_action_due?: string | null
          next_action_owner?: string | null
          noc_obtained_at?: string | null
          noc_reference?: string | null
          noc_status?: string | null
          notes?: string | null
          offplan_dead_reason?:
            | Database["public"]["Enums"]["offplan_dead_reason"]
            | null
          offplan_state?:
            | Database["public"]["Enums"]["offplan_deal_state"]
            | null
          payment_plan_type?: string | null
          pipeline?: Database["public"]["Enums"]["deal_pipeline"] | null
          property_id?: string | null
          registry_actions?: Json | null
          secondary_dead_reason?:
            | Database["public"]["Enums"]["secondary_dead_reason"]
            | null
          secondary_state?:
            | Database["public"]["Enums"]["secondary_deal_state"]
            | null
          side?: Database["public"]["Enums"]["deal_side"]
          transfer_date?: string | null
          transfer_number?: string | null
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
      developer_projects: {
        Row: {
          amenities: Json | null
          available_units: number | null
          brochure_url: string | null
          commission_percent: number | null
          community: string | null
          created_at: string | null
          developer_id: string
          expected_handover: string | null
          floor_plans_url: string | null
          id: string
          is_active: boolean | null
          launch_date: string | null
          location: string | null
          name: string
          payment_plan_details: Json | null
          price_from: number | null
          price_to: number | null
          project_id: string
          project_type: string | null
          status: string | null
          total_units: number | null
          updated_at: string | null
        }
        Insert: {
          amenities?: Json | null
          available_units?: number | null
          brochure_url?: string | null
          commission_percent?: number | null
          community?: string | null
          created_at?: string | null
          developer_id: string
          expected_handover?: string | null
          floor_plans_url?: string | null
          id?: string
          is_active?: boolean | null
          launch_date?: string | null
          location?: string | null
          name: string
          payment_plan_details?: Json | null
          price_from?: number | null
          price_to?: number | null
          project_id: string
          project_type?: string | null
          status?: string | null
          total_units?: number | null
          updated_at?: string | null
        }
        Update: {
          amenities?: Json | null
          available_units?: number | null
          brochure_url?: string | null
          commission_percent?: number | null
          community?: string | null
          created_at?: string | null
          developer_id?: string
          expected_handover?: string | null
          floor_plans_url?: string | null
          id?: string
          is_active?: boolean | null
          launch_date?: string | null
          location?: string | null
          name?: string
          payment_plan_details?: Json | null
          price_from?: number | null
          price_to?: number | null
          project_id?: string
          project_type?: string | null
          status?: string | null
          total_units?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "developer_projects_developer_id_fkey"
            columns: ["developer_id"]
            isOneToOne: false
            referencedRelation: "developers"
            referencedColumns: ["id"]
          },
        ]
      }
      developers: {
        Row: {
          address: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          developer_id: string
          id: string
          is_active: boolean | null
          legal_name: string | null
          logo_url: string | null
          name: string
          rera_number: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          developer_id: string
          id?: string
          is_active?: boolean | null
          legal_name?: string | null
          logo_url?: string | null
          name: string
          rera_number?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          developer_id?: string
          id?: string
          is_active?: boolean | null
          legal_name?: string | null
          logo_url?: string | null
          name?: string
          rera_number?: string | null
          updated_at?: string | null
        }
        Relationships: []
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
      generated_documents: {
        Row: {
          content_hash: string | null
          created_at: string
          deal_id: string | null
          document_body: string
          document_id: string
          document_title: string
          entity_id: string
          entity_type: string
          evidence_type: string | null
          finalized_at: string | null
          generated_at: string
          generated_by: string | null
          id: string
          input_payload: Json
          lead_id: string | null
          output: Json
          prompt_id: string
          status: Database["public"]["Enums"]["generated_document_status"]
          updated_at: string
          void_reason: string | null
          voided_at: string | null
        }
        Insert: {
          content_hash?: string | null
          created_at?: string
          deal_id?: string | null
          document_body: string
          document_id: string
          document_title: string
          entity_id: string
          entity_type: string
          evidence_type?: string | null
          finalized_at?: string | null
          generated_at?: string
          generated_by?: string | null
          id?: string
          input_payload?: Json
          lead_id?: string | null
          output?: Json
          prompt_id: string
          status?: Database["public"]["Enums"]["generated_document_status"]
          updated_at?: string
          void_reason?: string | null
          voided_at?: string | null
        }
        Update: {
          content_hash?: string | null
          created_at?: string
          deal_id?: string | null
          document_body?: string
          document_id?: string
          document_title?: string
          entity_id?: string
          entity_type?: string
          evidence_type?: string | null
          finalized_at?: string | null
          generated_at?: string
          generated_by?: string | null
          id?: string
          input_payload?: Json
          lead_id?: string | null
          output?: Json
          prompt_id?: string
          status?: Database["public"]["Enums"]["generated_document_status"]
          updated_at?: string
          void_reason?: string | null
          voided_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "generated_documents_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_documents_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
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
          next_action: Database["public"]["Enums"]["next_action_type"] | null
          next_action_due: string | null
          next_action_owner: string | null
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
          next_action?: Database["public"]["Enums"]["next_action_type"] | null
          next_action_due?: string | null
          next_action_owner?: string | null
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
          next_action?: Database["public"]["Enums"]["next_action_type"] | null
          next_action_due?: string | null
          next_action_owner?: string | null
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
      listing_media: {
        Row: {
          caption: string | null
          created_at: string
          display_order: number
          file_hash: string | null
          id: string
          is_primary: boolean
          listing_id: string
          public_url: string
          storage_path: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          display_order?: number
          file_hash?: string | null
          id?: string
          is_primary?: boolean
          listing_id: string
          public_url: string
          storage_path: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          display_order?: number
          file_hash?: string | null
          id?: string
          is_primary?: boolean
          listing_id?: string
          public_url?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_media_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          approved_faqs: Json | null
          asking_terms: Json | null
          compliance_status:
            | Database["public"]["Enums"]["compliance_status"]
            | null
          created_at: string
          id: string
          listing_attributes: Json | null
          listing_id: string
          listing_type: Database["public"]["Enums"]["listing_type"]
          madhmoun_listing_id: string | null
          madhmoun_status: Database["public"]["Enums"]["madhmoun_status"] | null
          mandate_agreement_id: string | null
          owner_party_id: string | null
          property_id: string | null
          status: Database["public"]["Enums"]["listing_status"]
          updated_at: string
        }
        Insert: {
          approved_faqs?: Json | null
          asking_terms?: Json | null
          compliance_status?:
            | Database["public"]["Enums"]["compliance_status"]
            | null
          created_at?: string
          id?: string
          listing_attributes?: Json | null
          listing_id: string
          listing_type: Database["public"]["Enums"]["listing_type"]
          madhmoun_listing_id?: string | null
          madhmoun_status?:
            | Database["public"]["Enums"]["madhmoun_status"]
            | null
          mandate_agreement_id?: string | null
          owner_party_id?: string | null
          property_id?: string | null
          status?: Database["public"]["Enums"]["listing_status"]
          updated_at?: string
        }
        Update: {
          approved_faqs?: Json | null
          asking_terms?: Json | null
          compliance_status?:
            | Database["public"]["Enums"]["compliance_status"]
            | null
          created_at?: string
          id?: string
          listing_attributes?: Json | null
          listing_id?: string
          listing_type?: Database["public"]["Enums"]["listing_type"]
          madhmoun_listing_id?: string | null
          madhmoun_status?:
            | Database["public"]["Enums"]["madhmoun_status"]
            | null
          mandate_agreement_id?: string | null
          owner_party_id?: string | null
          property_id?: string | null
          status?: Database["public"]["Enums"]["listing_status"]
          updated_at?: string
        }
        Relationships: []
      }
      marketing_ads: {
        Row: {
          ad_content: Json | null
          ad_id: string
          budget: number | null
          campaign_id: string | null
          clicks: number | null
          created_at: string
          dari_permit_no: string | null
          end_date: string | null
          id: string
          impressions: number | null
          leads_generated: number | null
          listing_id: string | null
          name: string
          permit_status: Database["public"]["Enums"]["permit_status"]
          permit_valid_from: string | null
          permit_valid_until: string | null
          platform: Database["public"]["Enums"]["ad_platform"]
          spend: number | null
          start_date: string | null
          status: Database["public"]["Enums"]["ad_status"]
          type: string | null
          updated_at: string
        }
        Insert: {
          ad_content?: Json | null
          ad_id: string
          budget?: number | null
          campaign_id?: string | null
          clicks?: number | null
          created_at?: string
          dari_permit_no?: string | null
          end_date?: string | null
          id?: string
          impressions?: number | null
          leads_generated?: number | null
          listing_id?: string | null
          name: string
          permit_status?: Database["public"]["Enums"]["permit_status"]
          permit_valid_from?: string | null
          permit_valid_until?: string | null
          platform: Database["public"]["Enums"]["ad_platform"]
          spend?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["ad_status"]
          type?: string | null
          updated_at?: string
        }
        Update: {
          ad_content?: Json | null
          ad_id?: string
          budget?: number | null
          campaign_id?: string | null
          clicks?: number | null
          created_at?: string
          dari_permit_no?: string | null
          end_date?: string | null
          id?: string
          impressions?: number | null
          leads_generated?: number | null
          listing_id?: string | null
          name?: string
          permit_status?: Database["public"]["Enums"]["permit_status"]
          permit_valid_from?: string | null
          permit_valid_until?: string | null
          platform?: Database["public"]["Enums"]["ad_platform"]
          spend?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["ad_status"]
          type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_ads_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "marketing_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_ads_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_campaigns: {
        Row: {
          budget: number | null
          campaign_id: string
          channel: Database["public"]["Enums"]["campaign_channel"]
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          metrics: Json | null
          name: string
          spend: number | null
          start_date: string | null
          status: Database["public"]["Enums"]["campaign_status"]
          target_audience: Json | null
          type: Database["public"]["Enums"]["campaign_type"]
          updated_at: string
        }
        Insert: {
          budget?: number | null
          campaign_id: string
          channel: Database["public"]["Enums"]["campaign_channel"]
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          metrics?: Json | null
          name: string
          spend?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["campaign_status"]
          target_audience?: Json | null
          type: Database["public"]["Enums"]["campaign_type"]
          updated_at?: string
        }
        Update: {
          budget?: number | null
          campaign_id?: string
          channel?: Database["public"]["Enums"]["campaign_channel"]
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          metrics?: Json | null
          name?: string
          spend?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["campaign_status"]
          target_audience?: Json | null
          type?: Database["public"]["Enums"]["campaign_type"]
          updated_at?: string
        }
        Relationships: []
      }
      marketing_events: {
        Row: {
          actual_attendees: number | null
          budget: number | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          end_date: string | null
          end_time: string | null
          event_date: string
          event_id: string
          expected_attendees: number | null
          id: string
          leads_captured: number | null
          location: string | null
          name: string
          notes: string | null
          organizer: string | null
          registered_attendees: number | null
          spend: number | null
          start_time: string | null
          status: Database["public"]["Enums"]["event_status"]
          type: Database["public"]["Enums"]["event_type"]
          updated_at: string
          venue: string | null
        }
        Insert: {
          actual_attendees?: number | null
          budget?: number | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          end_date?: string | null
          end_time?: string | null
          event_date: string
          event_id: string
          expected_attendees?: number | null
          id?: string
          leads_captured?: number | null
          location?: string | null
          name: string
          notes?: string | null
          organizer?: string | null
          registered_attendees?: number | null
          spend?: number | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["event_status"]
          type: Database["public"]["Enums"]["event_type"]
          updated_at?: string
          venue?: string | null
        }
        Update: {
          actual_attendees?: number | null
          budget?: number | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          end_date?: string | null
          end_time?: string | null
          event_date?: string
          event_id?: string
          expected_attendees?: number | null
          id?: string
          leads_captured?: number | null
          location?: string | null
          name?: string
          notes?: string | null
          organizer?: string | null
          registered_attendees?: number | null
          spend?: number | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["event_status"]
          type?: Database["public"]["Enums"]["event_type"]
          updated_at?: string
          venue?: string | null
        }
        Relationships: []
      }
      mortgage_scenarios: {
        Row: {
          created_at: string
          deal_id: string | null
          id: string
          inputs: Json
          name: string
          results: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deal_id?: string | null
          id?: string
          inputs?: Json
          name: string
          results?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deal_id?: string | null
          id?: string
          inputs?: Json
          name?: string
          results?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mortgage_scenarios_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          message: string | null
          notification_type: string
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          message?: string | null
          notification_type: string
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          message?: string | null
          notification_type?: string
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      opportunities: {
        Row: {
          bedrooms_max: number | null
          bedrooms_min: number | null
          budget_max: number | null
          budget_min: number | null
          closed_at: string | null
          contact_id: string
          created_at: string
          created_by: string | null
          currency: string
          custom_fields: Json | null
          deal_id: string | null
          expected_close_date: string | null
          financing: Database["public"]["Enums"]["financing_type"] | null
          id: string
          key_requirements: string | null
          listing_id: string | null
          listing_type: string | null
          lost_reason: string | null
          mortgage_pre_approved: boolean | null
          notes: string | null
          owner_user_id: string | null
          preferred_locations: string[] | null
          probability: number | null
          property_type: string | null
          reference: string
          source: string | null
          stage_changed_at: string | null
          stage_id: string
          timeframe: string | null
          title: string
          unit_count: number | null
          updated_at: string
          urgency: string | null
          value: number | null
        }
        Insert: {
          bedrooms_max?: number | null
          bedrooms_min?: number | null
          budget_max?: number | null
          budget_min?: number | null
          closed_at?: string | null
          contact_id: string
          created_at?: string
          created_by?: string | null
          currency?: string
          custom_fields?: Json | null
          deal_id?: string | null
          expected_close_date?: string | null
          financing?: Database["public"]["Enums"]["financing_type"] | null
          id?: string
          key_requirements?: string | null
          listing_id?: string | null
          listing_type?: string | null
          lost_reason?: string | null
          mortgage_pre_approved?: boolean | null
          notes?: string | null
          owner_user_id?: string | null
          preferred_locations?: string[] | null
          probability?: number | null
          property_type?: string | null
          reference: string
          source?: string | null
          stage_changed_at?: string | null
          stage_id: string
          timeframe?: string | null
          title: string
          unit_count?: number | null
          updated_at?: string
          urgency?: string | null
          value?: number | null
        }
        Update: {
          bedrooms_max?: number | null
          bedrooms_min?: number | null
          budget_max?: number | null
          budget_min?: number | null
          closed_at?: string | null
          contact_id?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          custom_fields?: Json | null
          deal_id?: string | null
          expected_close_date?: string | null
          financing?: Database["public"]["Enums"]["financing_type"] | null
          id?: string
          key_requirements?: string | null
          listing_id?: string | null
          listing_type?: string | null
          lost_reason?: string | null
          mortgage_pre_approved?: boolean | null
          notes?: string | null
          owner_user_id?: string | null
          preferred_locations?: string[] | null
          probability?: number | null
          property_type?: string | null
          reference?: string
          source?: string | null
          stage_changed_at?: string | null
          stage_id?: string
          timeframe?: string | null
          title?: string
          unit_count?: number | null
          updated_at?: string
          urgency?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "pipeline_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_escrow: {
        Row: {
          bank_reference: string | null
          conditions_met: Json | null
          created_at: string
          created_by: string | null
          currency: string
          deal_id: string | null
          document_instance_id: string | null
          due_date: string | null
          escrow_id: string
          funded_amount: number
          funded_at: string | null
          id: string
          payee_email: string | null
          payee_name: string
          payer_email: string | null
          payer_name: string
          payment_reference: string | null
          payment_type: string
          property_token_id: string | null
          release_conditions: Json | null
          released_amount: number
          released_at: string | null
          status: Database["public"]["Enums"]["escrow_status"]
          total_amount: number
          updated_at: string
        }
        Insert: {
          bank_reference?: string | null
          conditions_met?: Json | null
          created_at?: string
          created_by?: string | null
          currency?: string
          deal_id?: string | null
          document_instance_id?: string | null
          due_date?: string | null
          escrow_id: string
          funded_amount?: number
          funded_at?: string | null
          id?: string
          payee_email?: string | null
          payee_name: string
          payer_email?: string | null
          payer_name: string
          payment_reference?: string | null
          payment_type: string
          property_token_id?: string | null
          release_conditions?: Json | null
          released_amount?: number
          released_at?: string | null
          status?: Database["public"]["Enums"]["escrow_status"]
          total_amount: number
          updated_at?: string
        }
        Update: {
          bank_reference?: string | null
          conditions_met?: Json | null
          created_at?: string
          created_by?: string | null
          currency?: string
          deal_id?: string | null
          document_instance_id?: string | null
          due_date?: string | null
          escrow_id?: string
          funded_amount?: number
          funded_at?: string | null
          id?: string
          payee_email?: string | null
          payee_name?: string
          payer_email?: string | null
          payer_name?: string
          payment_reference?: string | null
          payment_type?: string
          property_token_id?: string | null
          release_conditions?: Json | null
          released_amount?: number
          released_at?: string | null
          status?: Database["public"]["Enums"]["escrow_status"]
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_escrow_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_escrow_document_instance_id_fkey"
            columns: ["document_instance_id"]
            isOneToOne: false
            referencedRelation: "document_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_escrow_property_token_id_fkey"
            columns: ["property_token_id"]
            isOneToOne: false
            referencedRelation: "property_tokens"
            referencedColumns: ["id"]
          },
        ]
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
      pipeline_stages: {
        Row: {
          color: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          probability: number
          sort_order: number
          stage_type: Database["public"]["Enums"]["opportunity_stage_type"]
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          probability?: number
          sort_order?: number
          stage_type?: Database["public"]["Enums"]["opportunity_stage_type"]
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          probability?: number
          sort_order?: number
          stage_type?: Database["public"]["Enums"]["opportunity_stage_type"]
        }
        Relationships: []
      }
      portal_inquiries: {
        Row: {
          created_at: string
          created_by: string | null
          external_listing_ref: string | null
          id: string
          inquirer_email: string | null
          inquirer_name: string
          inquirer_phone: string | null
          inquiry_id: string
          inquiry_type: string | null
          lead_id: string | null
          listing_id: string | null
          message: string | null
          portal: Database["public"]["Enums"]["portal_name"]
          processed_at: string | null
          raw_payload: Json | null
          received_at: string
          source_type: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          external_listing_ref?: string | null
          id?: string
          inquirer_email?: string | null
          inquirer_name: string
          inquirer_phone?: string | null
          inquiry_id: string
          inquiry_type?: string | null
          lead_id?: string | null
          listing_id?: string | null
          message?: string | null
          portal: Database["public"]["Enums"]["portal_name"]
          processed_at?: string | null
          raw_payload?: Json | null
          received_at?: string
          source_type?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          external_listing_ref?: string | null
          id?: string
          inquirer_email?: string | null
          inquirer_name?: string
          inquirer_phone?: string | null
          inquiry_id?: string
          inquiry_type?: string | null
          lead_id?: string | null
          listing_id?: string | null
          message?: string | null
          portal?: Database["public"]["Enums"]["portal_name"]
          processed_at?: string | null
          raw_payload?: Json | null
          received_at?: string
          source_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portal_inquiries_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_inquiries_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_publications: {
        Row: {
          created_at: string
          created_by: string | null
          error_message: string | null
          external_ref: string | null
          id: string
          last_synced_at: string | null
          listing_id: string
          portal: Database["public"]["Enums"]["portal_name"]
          portal_url: string | null
          published_at: string | null
          status: Database["public"]["Enums"]["portal_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          external_ref?: string | null
          id?: string
          last_synced_at?: string | null
          listing_id: string
          portal: Database["public"]["Enums"]["portal_name"]
          portal_url?: string | null
          published_at?: string | null
          status?: Database["public"]["Enums"]["portal_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          external_ref?: string | null
          id?: string
          last_synced_at?: string | null
          listing_id?: string
          portal?: Database["public"]["Enums"]["portal_name"]
          portal_url?: string | null
          published_at?: string | null
          status?: Database["public"]["Enums"]["portal_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "portal_publications_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      price_alerts: {
        Row: {
          alert_id: string
          alert_type: Database["public"]["Enums"]["price_alert_type"]
          created_at: string
          current_price: number | null
          external_ref: string | null
          id: string
          image_url: string | null
          is_dismissed: boolean
          is_read: boolean
          portal: Database["public"]["Enums"]["portal_name"]
          previous_price: number | null
          price_change_percent: number | null
          title: string | null
          url: string | null
          watch_id: string
        }
        Insert: {
          alert_id: string
          alert_type: Database["public"]["Enums"]["price_alert_type"]
          created_at?: string
          current_price?: number | null
          external_ref?: string | null
          id?: string
          image_url?: string | null
          is_dismissed?: boolean
          is_read?: boolean
          portal: Database["public"]["Enums"]["portal_name"]
          previous_price?: number | null
          price_change_percent?: number | null
          title?: string | null
          url?: string | null
          watch_id: string
        }
        Update: {
          alert_id?: string
          alert_type?: Database["public"]["Enums"]["price_alert_type"]
          created_at?: string
          current_price?: number | null
          external_ref?: string | null
          id?: string
          image_url?: string | null
          is_dismissed?: boolean
          is_read?: boolean
          portal?: Database["public"]["Enums"]["portal_name"]
          previous_price?: number | null
          price_change_percent?: number | null
          title?: string | null
          url?: string | null
          watch_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "price_alerts_watch_id_fkey"
            columns: ["watch_id"]
            isOneToOne: false
            referencedRelation: "price_watches"
            referencedColumns: ["id"]
          },
        ]
      }
      price_snapshots: {
        Row: {
          bathrooms: number | null
          bedrooms: number | null
          captured_at: string
          currency: string | null
          external_ref: string
          id: string
          image_url: string | null
          is_active: boolean
          portal: Database["public"]["Enums"]["portal_name"]
          price: number
          sqft: number | null
          title: string | null
          url: string | null
          watch_id: string
        }
        Insert: {
          bathrooms?: number | null
          bedrooms?: number | null
          captured_at?: string
          currency?: string | null
          external_ref: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          portal: Database["public"]["Enums"]["portal_name"]
          price: number
          sqft?: number | null
          title?: string | null
          url?: string | null
          watch_id: string
        }
        Update: {
          bathrooms?: number | null
          bedrooms?: number | null
          captured_at?: string
          currency?: string | null
          external_ref?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          portal?: Database["public"]["Enums"]["portal_name"]
          price?: number
          sqft?: number | null
          title?: string | null
          url?: string | null
          watch_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "price_snapshots_watch_id_fkey"
            columns: ["watch_id"]
            isOneToOne: false
            referencedRelation: "price_watches"
            referencedColumns: ["id"]
          },
        ]
      }
      price_watches: {
        Row: {
          bedrooms: number | null
          city: string
          community: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          last_checked_at: string | null
          listing_type: string | null
          max_price: number | null
          min_price: number | null
          name: string
          portals: Database["public"]["Enums"]["portal_name"][]
          property_type: string | null
          updated_at: string
          user_id: string
          watch_id: string
        }
        Insert: {
          bedrooms?: number | null
          city?: string
          community: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          last_checked_at?: string | null
          listing_type?: string | null
          max_price?: number | null
          min_price?: number | null
          name: string
          portals?: Database["public"]["Enums"]["portal_name"][]
          property_type?: string | null
          updated_at?: string
          user_id: string
          watch_id: string
        }
        Update: {
          bedrooms?: number | null
          city?: string
          community?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          last_checked_at?: string | null
          listing_type?: string | null
          max_price?: number | null
          min_price?: number | null
          name?: string
          portals?: Database["public"]["Enums"]["portal_name"][]
          property_type?: string | null
          updated_at?: string
          user_id?: string
          watch_id?: string
        }
        Relationships: []
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
      property_tokens: {
        Row: {
          accredited_only: boolean
          chain_network: string | null
          contract_address: string | null
          created_at: string
          created_by: string | null
          currency: string
          deal_id: string | null
          decimals: number
          deployment_tx_hash: string | null
          id: string
          kyc_required: boolean
          legal_structure: string | null
          listing_id: string | null
          location: string | null
          minimum_investment: number | null
          minted_at: string | null
          property_id: string
          property_type: string | null
          property_valuation: number
          regulatory_jurisdiction: string | null
          status: Database["public"]["Enums"]["token_status"]
          token_id: string
          token_name: string
          token_price: number | null
          token_symbol: string
          total_supply: number
          updated_at: string
        }
        Insert: {
          accredited_only?: boolean
          chain_network?: string | null
          contract_address?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          deal_id?: string | null
          decimals?: number
          deployment_tx_hash?: string | null
          id?: string
          kyc_required?: boolean
          legal_structure?: string | null
          listing_id?: string | null
          location?: string | null
          minimum_investment?: number | null
          minted_at?: string | null
          property_id: string
          property_type?: string | null
          property_valuation: number
          regulatory_jurisdiction?: string | null
          status?: Database["public"]["Enums"]["token_status"]
          token_id: string
          token_name: string
          token_price?: number | null
          token_symbol: string
          total_supply?: number
          updated_at?: string
        }
        Update: {
          accredited_only?: boolean
          chain_network?: string | null
          contract_address?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          deal_id?: string | null
          decimals?: number
          deployment_tx_hash?: string | null
          id?: string
          kyc_required?: boolean
          legal_structure?: string | null
          listing_id?: string | null
          location?: string | null
          minimum_investment?: number | null
          minted_at?: string | null
          property_id?: string
          property_type?: string | null
          property_valuation?: number
          regulatory_jurisdiction?: string | null
          status?: Database["public"]["Enums"]["token_status"]
          token_id?: string
          token_name?: string
          token_price?: number | null
          token_symbol?: string
          total_supply?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_tokens_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_tokens_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      prospects: {
        Row: {
          assigned_broker_id: string | null
          brochure_downloaded: boolean | null
          budget_max: number | null
          budget_min: number | null
          buyer_type: string | null
          campaign_id: string | null
          city: string | null
          contact_attempts: number | null
          country: string | null
          created_at: string
          created_by: string | null
          crm_confidence_level: string | null
          crm_created_date: string | null
          crm_customer_id: string | null
          crm_stage: string | null
          disqualification_reason: string | null
          disqualified_at: string | null
          email: string | null
          event_id: string | null
          first_name: string | null
          fit_score: number | null
          full_name: string
          id: string
          intent_score: number | null
          is_cash_buyer: boolean | null
          language: string | null
          last_contacted_at: string | null
          last_name: string | null
          linked_lead_id: string | null
          mortgage_preapproval: boolean | null
          notes: string | null
          outreach_status: string | null
          phone: string | null
          price_list_requested: boolean | null
          prospect_status: string | null
          referral_source_id: string | null
          repeat_visit_7d: boolean | null
          source: string | null
          timeframe: string | null
          total_score: number | null
          updated_at: string
          whatsapp_started: boolean | null
        }
        Insert: {
          assigned_broker_id?: string | null
          brochure_downloaded?: boolean | null
          budget_max?: number | null
          budget_min?: number | null
          buyer_type?: string | null
          campaign_id?: string | null
          city?: string | null
          contact_attempts?: number | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          crm_confidence_level?: string | null
          crm_created_date?: string | null
          crm_customer_id?: string | null
          crm_stage?: string | null
          disqualification_reason?: string | null
          disqualified_at?: string | null
          email?: string | null
          event_id?: string | null
          first_name?: string | null
          fit_score?: number | null
          full_name: string
          id?: string
          intent_score?: number | null
          is_cash_buyer?: boolean | null
          language?: string | null
          last_contacted_at?: string | null
          last_name?: string | null
          linked_lead_id?: string | null
          mortgage_preapproval?: boolean | null
          notes?: string | null
          outreach_status?: string | null
          phone?: string | null
          price_list_requested?: boolean | null
          prospect_status?: string | null
          referral_source_id?: string | null
          repeat_visit_7d?: boolean | null
          source?: string | null
          timeframe?: string | null
          total_score?: number | null
          updated_at?: string
          whatsapp_started?: boolean | null
        }
        Update: {
          assigned_broker_id?: string | null
          brochure_downloaded?: boolean | null
          budget_max?: number | null
          budget_min?: number | null
          buyer_type?: string | null
          campaign_id?: string | null
          city?: string | null
          contact_attempts?: number | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          crm_confidence_level?: string | null
          crm_created_date?: string | null
          crm_customer_id?: string | null
          crm_stage?: string | null
          disqualification_reason?: string | null
          disqualified_at?: string | null
          email?: string | null
          event_id?: string | null
          first_name?: string | null
          fit_score?: number | null
          full_name?: string
          id?: string
          intent_score?: number | null
          is_cash_buyer?: boolean | null
          language?: string | null
          last_contacted_at?: string | null
          last_name?: string | null
          linked_lead_id?: string | null
          mortgage_preapproval?: boolean | null
          notes?: string | null
          outreach_status?: string | null
          phone?: string | null
          price_list_requested?: boolean | null
          prospect_status?: string | null
          referral_source_id?: string | null
          repeat_visit_7d?: boolean | null
          source?: string | null
          timeframe?: string | null
          total_score?: number | null
          updated_at?: string
          whatsapp_started?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "prospects_assigned_broker_id_fkey"
            columns: ["assigned_broker_id"]
            isOneToOne: false
            referencedRelation: "broker_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prospects_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "marketing_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prospects_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "marketing_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prospects_linked_lead_id_fkey"
            columns: ["linked_lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prospects_referral_source_id_fkey"
            columns: ["referral_source_id"]
            isOneToOne: false
            referencedRelation: "referral_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_sources: {
        Row: {
          commission_percent: number | null
          company_name: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          deals_closed: number | null
          id: string
          leads_generated: number | null
          name: string
          notes: string | null
          source_id: string
          status: string | null
          total_commission_paid: number | null
          type: Database["public"]["Enums"]["referral_type"]
          updated_at: string
        }
        Insert: {
          commission_percent?: number | null
          company_name?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          deals_closed?: number | null
          id?: string
          leads_generated?: number | null
          name: string
          notes?: string | null
          source_id: string
          status?: string | null
          total_commission_paid?: number | null
          type: Database["public"]["Enums"]["referral_type"]
          updated_at?: string
        }
        Update: {
          commission_percent?: number | null
          company_name?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          deals_closed?: number | null
          id?: string
          leads_generated?: number | null
          name?: string
          notes?: string | null
          source_id?: string
          status?: string | null
          total_commission_paid?: number | null
          type?: Database["public"]["Enums"]["referral_type"]
          updated_at?: string
        }
        Relationships: []
      }
      signature_envelopes: {
        Row: {
          authority_checks: Json | null
          completed_at: string | null
          created_at: string
          document_id: string
          docusign_envelope_id: string | null
          docusign_status: string | null
          envelope_id: string
          execution_evidence: Json | null
          id: string
          sent_at: string | null
          signers: Json
          status: Database["public"]["Enums"]["signature_status"]
          void_reason: string | null
          voided_at: string | null
        }
        Insert: {
          authority_checks?: Json | null
          completed_at?: string | null
          created_at?: string
          document_id: string
          docusign_envelope_id?: string | null
          docusign_status?: string | null
          envelope_id: string
          execution_evidence?: Json | null
          id?: string
          sent_at?: string | null
          signers?: Json
          status?: Database["public"]["Enums"]["signature_status"]
          void_reason?: string | null
          voided_at?: string | null
        }
        Update: {
          authority_checks?: Json | null
          completed_at?: string | null
          created_at?: string
          document_id?: string
          docusign_envelope_id?: string | null
          docusign_status?: string | null
          envelope_id?: string
          execution_evidence?: Json | null
          id?: string
          sent_at?: string | null
          signers?: Json
          status?: Database["public"]["Enums"]["signature_status"]
          void_reason?: string | null
          voided_at?: string | null
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
      smart_contracts: {
        Row: {
          all_signed: boolean
          blockchain_tx_hash: string | null
          clauses: Json | null
          content_hash: string | null
          contract_id: string
          contract_name: string
          contract_terms: Json | null
          contract_type: string
          created_at: string
          created_by: string | null
          deal_id: string | null
          document_instance_id: string | null
          docusign_envelope_id: string | null
          effective_date: string | null
          executed_at: string | null
          execution_method: string | null
          expiry_date: string | null
          id: string
          ipfs_cid: string | null
          listing_id: string | null
          parties: Json
          property_token_id: string | null
          status: Database["public"]["Enums"]["contract_execution_status"]
          template_id: string | null
          updated_at: string
          version: string
        }
        Insert: {
          all_signed?: boolean
          blockchain_tx_hash?: string | null
          clauses?: Json | null
          content_hash?: string | null
          contract_id: string
          contract_name: string
          contract_terms?: Json | null
          contract_type: string
          created_at?: string
          created_by?: string | null
          deal_id?: string | null
          document_instance_id?: string | null
          docusign_envelope_id?: string | null
          effective_date?: string | null
          executed_at?: string | null
          execution_method?: string | null
          expiry_date?: string | null
          id?: string
          ipfs_cid?: string | null
          listing_id?: string | null
          parties?: Json
          property_token_id?: string | null
          status?: Database["public"]["Enums"]["contract_execution_status"]
          template_id?: string | null
          updated_at?: string
          version?: string
        }
        Update: {
          all_signed?: boolean
          blockchain_tx_hash?: string | null
          clauses?: Json | null
          content_hash?: string | null
          contract_id?: string
          contract_name?: string
          contract_terms?: Json | null
          contract_type?: string
          created_at?: string
          created_by?: string | null
          deal_id?: string | null
          document_instance_id?: string | null
          docusign_envelope_id?: string | null
          effective_date?: string | null
          executed_at?: string | null
          execution_method?: string | null
          expiry_date?: string | null
          id?: string
          ipfs_cid?: string | null
          listing_id?: string | null
          parties?: Json
          property_token_id?: string | null
          status?: Database["public"]["Enums"]["contract_execution_status"]
          template_id?: string | null
          updated_at?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "smart_contracts_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smart_contracts_document_instance_id_fkey"
            columns: ["document_instance_id"]
            isOneToOne: false
            referencedRelation: "document_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smart_contracts_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smart_contracts_property_token_id_fkey"
            columns: ["property_token_id"]
            isOneToOne: false
            referencedRelation: "property_tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          contact_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_at: string | null
          id: string
          opportunity_id: string | null
          priority: Database["public"]["Enums"]["task_priority"]
          reminder_at: string | null
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_at?: string | null
          id?: string
          opportunity_id?: string | null
          priority?: Database["public"]["Enums"]["task_priority"]
          reminder_at?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_at?: string | null
          id?: string
          opportunity_id?: string | null
          priority?: Database["public"]["Enums"]["task_priority"]
          reminder_at?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      team_meeting_participants: {
        Row: {
          id: string
          invited_at: string
          is_required: boolean
          meeting_id: string
          responded_at: string | null
          rsvp_status: Database["public"]["Enums"]["rsvp_status"]
          user_id: string
        }
        Insert: {
          id?: string
          invited_at?: string
          is_required?: boolean
          meeting_id: string
          responded_at?: string | null
          rsvp_status?: Database["public"]["Enums"]["rsvp_status"]
          user_id: string
        }
        Update: {
          id?: string
          invited_at?: string
          is_required?: boolean
          meeting_id?: string
          responded_at?: string | null
          rsvp_status?: Database["public"]["Enums"]["rsvp_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_meeting_participants_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "team_meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      team_meetings: {
        Row: {
          created_at: string
          description: string | null
          duration_minutes: number
          id: string
          location: string | null
          meeting_id: string
          meeting_type: Database["public"]["Enums"]["meeting_type"]
          organizer_id: string
          recurrence: Json | null
          scheduled_at: string
          status: Database["public"]["Enums"]["meeting_status"]
          title: string
          updated_at: string
          zoom_host_url: string | null
          zoom_join_url: string | null
          zoom_meeting_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          location?: string | null
          meeting_id: string
          meeting_type?: Database["public"]["Enums"]["meeting_type"]
          organizer_id: string
          recurrence?: Json | null
          scheduled_at: string
          status?: Database["public"]["Enums"]["meeting_status"]
          title: string
          updated_at?: string
          zoom_host_url?: string | null
          zoom_join_url?: string | null
          zoom_meeting_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          location?: string | null
          meeting_id?: string
          meeting_type?: Database["public"]["Enums"]["meeting_type"]
          organizer_id?: string
          recurrence?: Json | null
          scheduled_at?: string
          status?: Database["public"]["Enums"]["meeting_status"]
          title?: string
          updated_at?: string
          zoom_host_url?: string | null
          zoom_join_url?: string | null
          zoom_meeting_id?: string | null
        }
        Relationships: []
      }
      token_ownership: {
        Row: {
          average_cost_basis: number | null
          created_at: string
          created_by: string | null
          frozen_reason: string | null
          id: string
          invested_amount: number
          is_active: boolean
          kyc_document_id: string | null
          kyc_verified: boolean
          owner_email: string | null
          owner_name: string
          owner_type: string
          owner_wallet_address: string | null
          ownership_percentage: number | null
          token_balance: number
          token_id: string
          updated_at: string
        }
        Insert: {
          average_cost_basis?: number | null
          created_at?: string
          created_by?: string | null
          frozen_reason?: string | null
          id?: string
          invested_amount?: number
          is_active?: boolean
          kyc_document_id?: string | null
          kyc_verified?: boolean
          owner_email?: string | null
          owner_name: string
          owner_type?: string
          owner_wallet_address?: string | null
          ownership_percentage?: number | null
          token_balance?: number
          token_id: string
          updated_at?: string
        }
        Update: {
          average_cost_basis?: number | null
          created_at?: string
          created_by?: string | null
          frozen_reason?: string | null
          id?: string
          invested_amount?: number
          is_active?: boolean
          kyc_document_id?: string | null
          kyc_verified?: boolean
          owner_email?: string | null
          owner_name?: string
          owner_type?: string
          owner_wallet_address?: string | null
          ownership_percentage?: number | null
          token_balance?: number
          token_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "token_ownership_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "property_tokens"
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
      viewing_bookings: {
        Row: {
          agent_id: string | null
          cal_booking_id: string | null
          cancelled_at: string | null
          cancelled_reason: string | null
          confirmation_sent: boolean | null
          created_at: string
          created_by: string | null
          deal_id: string | null
          duration_minutes: number
          feedback_notes: string | null
          feedback_score: number | null
          id: string
          listing_id: string | null
          location: string | null
          notes: string | null
          prospect_id: string | null
          reminder_sent: boolean | null
          scheduled_at: string
          status: Database["public"]["Enums"]["viewing_status"]
          updated_at: string
        }
        Insert: {
          agent_id?: string | null
          cal_booking_id?: string | null
          cancelled_at?: string | null
          cancelled_reason?: string | null
          confirmation_sent?: boolean | null
          created_at?: string
          created_by?: string | null
          deal_id?: string | null
          duration_minutes?: number
          feedback_notes?: string | null
          feedback_score?: number | null
          id?: string
          listing_id?: string | null
          location?: string | null
          notes?: string | null
          prospect_id?: string | null
          reminder_sent?: boolean | null
          scheduled_at: string
          status?: Database["public"]["Enums"]["viewing_status"]
          updated_at?: string
        }
        Update: {
          agent_id?: string | null
          cal_booking_id?: string | null
          cancelled_at?: string | null
          cancelled_reason?: string | null
          confirmation_sent?: boolean | null
          created_at?: string
          created_by?: string | null
          deal_id?: string | null
          duration_minutes?: number
          feedback_notes?: string | null
          feedback_score?: number | null
          id?: string
          listing_id?: string | null
          location?: string | null
          notes?: string | null
          prospect_id?: string | null
          reminder_sent?: boolean | null
          scheduled_at?: string
          status?: Database["public"]["Enums"]["viewing_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "viewing_bookings_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viewing_bookings_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viewing_bookings_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_gate_results: {
        Row: {
          created_at: string
          deal_id: string
          documents_present: string[]
          evaluated_at: string
          evaluated_by: string | null
          evaluation_notes: string | null
          gate_id: string
          id: string
          missing: string[]
          next_allowed_actions: string[]
          requested_action: string
          result_id: string
          status: Database["public"]["Enums"]["workflow_gate_status"]
        }
        Insert: {
          created_at?: string
          deal_id: string
          documents_present?: string[]
          evaluated_at?: string
          evaluated_by?: string | null
          evaluation_notes?: string | null
          gate_id: string
          id?: string
          missing?: string[]
          next_allowed_actions?: string[]
          requested_action: string
          result_id: string
          status?: Database["public"]["Enums"]["workflow_gate_status"]
        }
        Update: {
          created_at?: string
          deal_id?: string
          documents_present?: string[]
          evaluated_at?: string
          evaluated_by?: string | null
          evaluation_notes?: string | null
          gate_id?: string
          id?: string
          missing?: string[]
          next_allowed_actions?: string[]
          requested_action?: string
          result_id?: string
          status?: Database["public"]["Enums"]["workflow_gate_status"]
        }
        Relationships: [
          {
            foreignKeyName: "workflow_gate_results_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      pipeline_kpis: {
        Row: {
          active_deals: number | null
          avg_days_to_close: number | null
          lost_deals: number | null
          pipeline: Database["public"]["Enums"]["deal_pipeline"] | null
          total_deals: number | null
          win_rate: number | null
          won_deals: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_entity_counts: {
        Args: never
        Returns: {
          by_state: Json
          entity_type: string
          total_count: number
        }[]
      }
      get_team_metrics: {
        Args: never
        Returns: {
          avg_deal_cycle_days: number
          broker_id: string
          broker_name: string
          conversion_rate: number
          deal_count: number
          lead_count: number
          total_commission: number
          user_id: string
          won_deals: number
        }[]
      }
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
      is_contract_participant: {
        Args: { _contract_id: string; _user_id: string }
        Returns: boolean
      }
      is_deal_participant: {
        Args: { _deal_id: string; _user_id: string }
        Returns: boolean
      }
      is_escrow_participant: {
        Args: { _escrow_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      activity_direction_v2: "inbound" | "outbound" | "internal"
      activity_type:
        | "call"
        | "email"
        | "whatsapp"
        | "sms"
        | "meeting"
        | "note"
        | "viewing"
        | "system"
      ad_platform:
        | "Bayut"
        | "PropertyFinder"
        | "Dubizzle"
        | "Instagram"
        | "Facebook"
        | "LinkedIn"
        | "Google"
        | "TikTok"
        | "YouTube"
        | "Print"
        | "Billboard"
        | "Brochure"
      ad_status:
        | "Draft"
        | "PendingApproval"
        | "Active"
        | "Paused"
        | "Expired"
        | "Rejected"
      aml_risk_level: "LOW" | "MEDIUM" | "HIGH"
      app_role: "Manager" | "Owner" | "Broker" | "Agent"
      approval_status: "Pending" | "Approved" | "Rejected"
      approval_type:
        | "EconomicsOverride"
        | "PayoutBatch"
        | "ComplianceWaiver"
        | "TemplatePublish"
        | "RoleChange"
        | "UserApproval"
      broker_status: "Pending" | "Active" | "Suspended" | "Terminated"
      campaign_channel:
        | "Email"
        | "SMS"
        | "WhatsApp"
        | "Instagram"
        | "Facebook"
        | "LinkedIn"
        | "Google"
        | "Bayut"
        | "PropertyFinder"
        | "Dubizzle"
        | "Print"
        | "Billboard"
        | "Event"
      campaign_status: "Draft" | "Active" | "Paused" | "Completed" | "Cancelled"
      campaign_type:
        | "Email"
        | "SMS"
        | "WhatsApp"
        | "Social"
        | "Display"
        | "Search"
        | "Print"
        | "Event"
      commission_status: "Expected" | "Earned" | "Received" | "Paid" | "Voided"
      communication_channel: "whatsapp" | "sms" | "email"
      compliance_context_type: "listing" | "transaction" | "marketing"
      compliance_rule_severity: "BLOCK" | "ESCALATE"
      compliance_status: "APPROVED" | "BLOCKED" | "ESCALATED"
      contact_type: "Person" | "Company"
      contract_execution_status:
        | "Draft"
        | "Pending"
        | "Executed"
        | "Voided"
        | "Expired"
      deal_pipeline: "OffPlan" | "Secondary"
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
      escrow_status:
        | "Created"
        | "Funded"
        | "PartiallyFunded"
        | "Released"
        | "Refunded"
        | "Disputed"
      event_status:
        | "Planning"
        | "Confirmed"
        | "InProgress"
        | "Completed"
        | "Cancelled"
        | "Postponed"
      event_type:
        | "Roadshow"
        | "PropertyLaunch"
        | "Exhibition"
        | "Networking"
        | "Seminar"
        | "OpenHouse"
        | "Other"
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
      financing_type: "cash" | "mortgage" | "mixed" | "unknown"
      generated_document_status: "Draft" | "Finalized" | "Voided"
      immutability_class: "External" | "Internal" | "System"
      lead_source:
        | "Website"
        | "Referral"
        | "Portal"
        | "WalkIn"
        | "SocialMedia"
        | "Event"
        | "Other"
        | "PropertyFinder"
        | "Bayut"
        | "Dubizzle"
      lead_state:
        | "New"
        | "Contacted"
        | "Qualified"
        | "Disqualified"
        | "Converted"
      lifecycle_stage:
        | "Lead"
        | "Prospect"
        | "Customer"
        | "Past_Customer"
        | "Disqualified"
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
      madhmoun_status: "DRAFT" | "PENDING" | "VERIFIED" | "REJECTED"
      meeting_status: "scheduled" | "in_progress" | "completed" | "cancelled"
      meeting_type: "zoom" | "in_person" | "phone" | "video_call"
      message_direction: "outbound" | "inbound"
      message_status: "pending" | "sent" | "delivered" | "failed" | "read"
      next_action_type:
        | "Call"
        | "WhatsApp"
        | "Email"
        | "Meeting"
        | "Viewing"
        | "FollowUp"
        | "SendOffer"
        | "CollectDocs"
        | "Other"
      offplan_dead_reason:
        | "BudgetMismatch"
        | "KYCFailed"
        | "ClientWithdrew"
        | "PaymentDefault"
        | "ProjectCancelled"
        | "Other"
      offplan_deal_state:
        | "LeadQualified"
        | "EOISubmitted"
        | "EOIPaid"
        | "SPASigned"
        | "PaymentPlan"
        | "Construction"
        | "Handover"
        | "ClosedWon"
        | "ClosedLost"
      opportunity_stage_type: "active" | "won" | "lost"
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
      permit_status:
        | "NotRequired"
        | "Pending"
        | "Approved"
        | "Expired"
        | "Rejected"
      portal_name: "PropertyFinder" | "Bayut" | "Dubizzle"
      portal_status: "pending" | "published" | "paused" | "removed" | "error"
      price_alert_type:
        | "new_listing"
        | "price_drop"
        | "price_increase"
        | "listing_removed"
      referral_type:
        | "Broker"
        | "Developer"
        | "Bank"
        | "Agency"
        | "Individual"
        | "Corporate"
        | "Other"
      rsvp_status: "pending" | "accepted" | "declined" | "tentative"
      secondary_dead_reason:
        | "NoSuitableProperty"
        | "BudgetMismatch"
        | "MortgageRejected"
        | "ClientWithdrew"
        | "SellerWithdrew"
        | "NOCRejected"
        | "LegalIssue"
        | "Other"
      secondary_deal_state:
        | "RequirementsCaptured"
        | "ViewingScheduled"
        | "ViewingCompleted"
        | "OfferSubmitted"
        | "OfferAccepted"
        | "MOUSigned"
        | "NOCObtained"
        | "TransferBooked"
        | "TransferComplete"
        | "ClosedWon"
        | "ClosedLost"
      signature_status: "Pending" | "Signed" | "Declined" | "Expired"
      task_priority: "low" | "medium" | "high" | "urgent"
      task_status: "open" | "in_progress" | "completed" | "cancelled"
      template_status: "Draft" | "Published" | "Deprecated"
      token_status: "Draft" | "Minted" | "Active" | "Frozen" | "Burned"
      viewing_status:
        | "scheduled"
        | "confirmed"
        | "completed"
        | "cancelled"
        | "no_show"
        | "rescheduled"
      workflow_gate_status: "APPROVED" | "BLOCKED"
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
      activity_direction_v2: ["inbound", "outbound", "internal"],
      activity_type: [
        "call",
        "email",
        "whatsapp",
        "sms",
        "meeting",
        "note",
        "viewing",
        "system",
      ],
      ad_platform: [
        "Bayut",
        "PropertyFinder",
        "Dubizzle",
        "Instagram",
        "Facebook",
        "LinkedIn",
        "Google",
        "TikTok",
        "YouTube",
        "Print",
        "Billboard",
        "Brochure",
      ],
      ad_status: [
        "Draft",
        "PendingApproval",
        "Active",
        "Paused",
        "Expired",
        "Rejected",
      ],
      aml_risk_level: ["LOW", "MEDIUM", "HIGH"],
      app_role: ["Manager", "Owner", "Broker", "Agent"],
      approval_status: ["Pending", "Approved", "Rejected"],
      approval_type: [
        "EconomicsOverride",
        "PayoutBatch",
        "ComplianceWaiver",
        "TemplatePublish",
        "RoleChange",
        "UserApproval",
      ],
      broker_status: ["Pending", "Active", "Suspended", "Terminated"],
      campaign_channel: [
        "Email",
        "SMS",
        "WhatsApp",
        "Instagram",
        "Facebook",
        "LinkedIn",
        "Google",
        "Bayut",
        "PropertyFinder",
        "Dubizzle",
        "Print",
        "Billboard",
        "Event",
      ],
      campaign_status: ["Draft", "Active", "Paused", "Completed", "Cancelled"],
      campaign_type: [
        "Email",
        "SMS",
        "WhatsApp",
        "Social",
        "Display",
        "Search",
        "Print",
        "Event",
      ],
      commission_status: ["Expected", "Earned", "Received", "Paid", "Voided"],
      communication_channel: ["whatsapp", "sms", "email"],
      compliance_context_type: ["listing", "transaction", "marketing"],
      compliance_rule_severity: ["BLOCK", "ESCALATE"],
      compliance_status: ["APPROVED", "BLOCKED", "ESCALATED"],
      contact_type: ["Person", "Company"],
      contract_execution_status: [
        "Draft",
        "Pending",
        "Executed",
        "Voided",
        "Expired",
      ],
      deal_pipeline: ["OffPlan", "Secondary"],
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
      escrow_status: [
        "Created",
        "Funded",
        "PartiallyFunded",
        "Released",
        "Refunded",
        "Disputed",
      ],
      event_status: [
        "Planning",
        "Confirmed",
        "InProgress",
        "Completed",
        "Cancelled",
        "Postponed",
      ],
      event_type: [
        "Roadshow",
        "PropertyLaunch",
        "Exhibition",
        "Networking",
        "Seminar",
        "OpenHouse",
        "Other",
      ],
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
      financing_type: ["cash", "mortgage", "mixed", "unknown"],
      generated_document_status: ["Draft", "Finalized", "Voided"],
      immutability_class: ["External", "Internal", "System"],
      lead_source: [
        "Website",
        "Referral",
        "Portal",
        "WalkIn",
        "SocialMedia",
        "Event",
        "Other",
        "PropertyFinder",
        "Bayut",
        "Dubizzle",
      ],
      lead_state: [
        "New",
        "Contacted",
        "Qualified",
        "Disqualified",
        "Converted",
      ],
      lifecycle_stage: [
        "Lead",
        "Prospect",
        "Customer",
        "Past_Customer",
        "Disqualified",
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
      madhmoun_status: ["DRAFT", "PENDING", "VERIFIED", "REJECTED"],
      meeting_status: ["scheduled", "in_progress", "completed", "cancelled"],
      meeting_type: ["zoom", "in_person", "phone", "video_call"],
      message_direction: ["outbound", "inbound"],
      message_status: ["pending", "sent", "delivered", "failed", "read"],
      next_action_type: [
        "Call",
        "WhatsApp",
        "Email",
        "Meeting",
        "Viewing",
        "FollowUp",
        "SendOffer",
        "CollectDocs",
        "Other",
      ],
      offplan_dead_reason: [
        "BudgetMismatch",
        "KYCFailed",
        "ClientWithdrew",
        "PaymentDefault",
        "ProjectCancelled",
        "Other",
      ],
      offplan_deal_state: [
        "LeadQualified",
        "EOISubmitted",
        "EOIPaid",
        "SPASigned",
        "PaymentPlan",
        "Construction",
        "Handover",
        "ClosedWon",
        "ClosedLost",
      ],
      opportunity_stage_type: ["active", "won", "lost"],
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
      permit_status: [
        "NotRequired",
        "Pending",
        "Approved",
        "Expired",
        "Rejected",
      ],
      portal_name: ["PropertyFinder", "Bayut", "Dubizzle"],
      portal_status: ["pending", "published", "paused", "removed", "error"],
      price_alert_type: [
        "new_listing",
        "price_drop",
        "price_increase",
        "listing_removed",
      ],
      referral_type: [
        "Broker",
        "Developer",
        "Bank",
        "Agency",
        "Individual",
        "Corporate",
        "Other",
      ],
      rsvp_status: ["pending", "accepted", "declined", "tentative"],
      secondary_dead_reason: [
        "NoSuitableProperty",
        "BudgetMismatch",
        "MortgageRejected",
        "ClientWithdrew",
        "SellerWithdrew",
        "NOCRejected",
        "LegalIssue",
        "Other",
      ],
      secondary_deal_state: [
        "RequirementsCaptured",
        "ViewingScheduled",
        "ViewingCompleted",
        "OfferSubmitted",
        "OfferAccepted",
        "MOUSigned",
        "NOCObtained",
        "TransferBooked",
        "TransferComplete",
        "ClosedWon",
        "ClosedLost",
      ],
      signature_status: ["Pending", "Signed", "Declined", "Expired"],
      task_priority: ["low", "medium", "high", "urgent"],
      task_status: ["open", "in_progress", "completed", "cancelled"],
      template_status: ["Draft", "Published", "Deprecated"],
      token_status: ["Draft", "Minted", "Active", "Frozen", "Burned"],
      viewing_status: [
        "scheduled",
        "confirmed",
        "completed",
        "cancelled",
        "no_show",
        "rescheduled",
      ],
      workflow_gate_status: ["APPROVED", "BLOCKED"],
    },
  },
} as const
