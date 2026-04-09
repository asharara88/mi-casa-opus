import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TEMPLATE_SCHEMAS, TemplateSchema } from "@/lib/template-schemas";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

interface GeneratedDocument {
  documentId: string;
  referenceNumber: string;
  title: string;
  body: string;
  templateId: string;
  formData: Record<string, unknown>;
  createdAt: string;
}

interface UseStaticFormFillerReturn {
  saveDocument: (
    templateId: string,
    formData: Record<string, unknown>,
    filledContent: string,
    entityType?: string,
    entityId?: string
  ) => Promise<GeneratedDocument | null>;
  createFollowUpTask: (templateId: string, documentId: string, entityId?: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

// Map template IDs to evidence types
const TEMPLATE_EVIDENCE_MAP: Record<string, string> = {
  '01_seller_landlord_authorization': 'Contract',
  '02_buyer_tenant_representation_agreement': 'Contract',
  '07_offer_letter_expression_of_interest': 'Contract',
  '08_memorandum_of_understanding_pre_spa': 'Contract',
  '09_reservation_booking_form': 'Contract',
  '12_commission_vat_invoice': 'PaymentProof',
};

// Generate SHA-256 hash for document integrity
async function generateContentHash(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generate sequential reference number: MC-YYYY-NNNNNN
function generateReferenceNumber(): string {
  const year = new Date().getFullYear();
  const storageKey = `micasa_ref_counter_${year}`;
  
  // Get current counter from localStorage
  let counter = parseInt(localStorage.getItem(storageKey) || "0", 10);
  counter++;
  
  // Store updated counter
  localStorage.setItem(storageKey, counter.toString());
  
  // Format: MC-2026-000001
  const paddedCounter = counter.toString().padStart(6, "0");
  return `MC-${year}-${paddedCounter}`;
}

export function useStaticFormFiller(): UseStaticFormFillerReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveDocument = useCallback(async (
    templateId: string,
    formData: Record<string, unknown>,
    filledContent: string,
    entityType: string = "deal",
    entityId?: string
  ): Promise<GeneratedDocument | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const schema = TEMPLATE_SCHEMAS[templateId];
      if (!schema) {
        throw new Error("Template schema not found");
      }
      
      const referenceNumber = generateReferenceNumber();
      const documentId = `DOC-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      
      // Add reference number to the document content
      const contentWithRef = `**Reference: ${referenceNumber}**\n\n${filledContent}`;
      
      // Generate content hash for integrity verification
      const contentHash = await generateContentHash(contentWithRef);
      
      // Determine entity ID
      const finalEntityId = entityId || formData.deal_crm_id as string || crypto.randomUUID();
      
      // Save to generated_documents table
      const { data, error: dbError } = await supabase
        .from("generated_documents")
        .insert([{
          document_id: documentId,
          prompt_id: templateId,
          entity_type: entityType,
          entity_id: finalEntityId,
          input_payload: formData as unknown as Json,
          output: { 
            reference_number: referenceNumber,
            template_version: "1.0",
            filled_at: new Date().toISOString(),
            content_hash: contentHash
          } as Json,
          document_title: `${schema.title} - ${referenceNumber}`,
          document_body: contentWithRef,
          status: "Draft" as const
        }])
        .select()
        .single();
      
      if (dbError) {
        // If RLS blocks, try without auth context
        console.warn("DB insert warning:", dbError);
      }
      
      // Dual-write: Create document_instance linking to deal/lead
      if (entityId && (entityType === 'deal' || entityType === 'lead')) {
        const instanceId = `INST-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
        
        await supabase.from("document_instances").insert([{
          document_id: instanceId,
          template_id: crypto.randomUUID(), // Placeholder for template reference
          entity_type: entityType,
          entity_id: entityId,
          status: 'Draft' as const,
          data_snapshot: formData as unknown as Json,
          data_snapshot_hash: contentHash,
        }]);
        
        // Create evidence record for audit trail
        const evidenceType = TEMPLATE_EVIDENCE_MAP[templateId] || 'Other';
        const evidenceId = `EVD-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
        
        await supabase.from("evidence_objects").insert([{
          evidence_id: evidenceId,
          entity_type: entityType,
          entity_id: entityId,
          evidence_type: evidenceType as any,
          source: `document_generator:${templateId}`,
          immutability_class: 'System' as const,
          captured_by: 'system',
          file_hash: contentHash,
          metadata: {
            document_id: documentId,
            reference_number: referenceNumber,
            template_id: templateId,
            generated_at: new Date().toISOString(),
          },
        }]);
      }
      
      const result: GeneratedDocument = {
        documentId,
        referenceNumber,
        title: `${schema.title} - ${referenceNumber}`,
        body: contentWithRef,
        templateId,
        formData,
        createdAt: new Date().toISOString()
      };
      
      // Also save to localStorage for offline access
      const localDocs = JSON.parse(localStorage.getItem("micasa_generated_docs") || "[]");
      localDocs.push(result);
      localStorage.setItem("micasa_generated_docs", JSON.stringify(localDocs.slice(-50))); // Keep last 50
      
      toast.success("Document generated", {
        description: `Reference: ${referenceNumber}`
      });
      
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save document";
      setError(message);
      toast.error("Failed to generate document", { description: message });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createFollowUpTask = useCallback(async (
    templateId: string,
    documentId: string,
    entityId?: string
  ) => {
    const schema = TEMPLATE_SCHEMAS[templateId];
    if (!schema?.followUpTask) return;
    
    try {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + schema.followUpTask.daysUntilDue);
      
      // Create event log entry for the follow-up task
      const eventId = `EVT-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      
      await supabase.from("event_log_entries").insert({
        event_id: eventId,
        entity_type: "document",
        entity_id: documentId,
        action: "follow_up_created",
        decision: "auto_generated",
        after_state: {
          task_title: schema.followUpTask.title,
          due_date: dueDate.toISOString(),
          template_id: templateId,
          linked_entity: entityId
        }
      });
      
      // Also store in localStorage for the task tracker
      const tasks = JSON.parse(localStorage.getItem("micasa_follow_up_tasks") || "[]");
      tasks.push({
        id: eventId,
        title: schema.followUpTask.title,
        dueDate: dueDate.toISOString(),
        templateId,
        documentId,
        entityId,
        status: "pending",
        createdAt: new Date().toISOString()
      });
      localStorage.setItem("micasa_follow_up_tasks", JSON.stringify(tasks.slice(-100)));
      
      toast.info("Follow-up task created", {
        description: `Due: ${dueDate.toLocaleDateString()}`
      });
    } catch (err) {
      console.error("Failed to create follow-up task:", err);
    }
  }, []);

  return {
    saveDocument,
    createFollowUpTask,
    isLoading,
    error
  };
}

// Hook to get documents by entity
export function useEntityDocuments(entityType: string, entityId: string) {
  const [documents, setDocuments] = useState<GeneratedDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await supabase
        .from("generated_documents")
        .select("*")
        .eq("entity_type", entityType)
        .eq("entity_id", entityId)
        .order("created_at", { ascending: false });
      
      if (data) {
        setDocuments(data.map(d => ({
          documentId: d.document_id,
          referenceNumber: (d.output as any)?.reference_number || "N/A",
          title: d.document_title,
          body: d.document_body,
          templateId: d.prompt_id,
          formData: d.input_payload as Record<string, unknown>,
          createdAt: d.created_at
        })));
      }
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    } finally {
      setIsLoading(false);
    }
  }, [entityType, entityId]);

  return { documents, isLoading, fetchDocuments };
}

// Hook to get pending follow-up tasks
export function useFollowUpTasks() {
  const getTasks = useCallback(() => {
    const tasks = JSON.parse(localStorage.getItem("micasa_follow_up_tasks") || "[]");
    return tasks.filter((t: any) => t.status === "pending");
  }, []);

  const completeTask = useCallback((taskId: string) => {
    const tasks = JSON.parse(localStorage.getItem("micasa_follow_up_tasks") || "[]");
    const updated = tasks.map((t: any) => 
      t.id === taskId ? { ...t, status: "completed", completedAt: new Date().toISOString() } : t
    );
    localStorage.setItem("micasa_follow_up_tasks", JSON.stringify(updated));
  }, []);

  return { getTasks, completeTask };
}
