import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Generate SHA-256 hash from content
async function generateSHA256(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generate evidence ID
function generateEvidenceId(): string {
  return `EVD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export interface DocumentEvidencePayload {
  documentId: string;
  documentTitle: string;
  documentBody: string;
  entityType: string;
  entityId: string;
  promptId: string;
  source?: string;
}

export interface LinkedEvidence {
  id: string;
  evidence_id: string;
  entity_type: string;
  entity_id: string;
  evidence_type: string;
  file_hash: string;
  source: string;
  captured_at: string;
  metadata: Record<string, unknown>;
}

// Hook to link a generated document to evidence with integrity hash
export function useLinkDocumentToEvidence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: DocumentEvidencePayload) => {
      const {
        documentId,
        documentTitle,
        documentBody,
        entityType,
        entityId,
        promptId,
        source = 'document_generator',
      } = payload;

      // 1. Generate SHA-256 hash of document content
      const contentHash = await generateSHA256(documentBody);
      
      // 2. Generate metadata hash (includes all identifying info)
      const metadataString = JSON.stringify({
        documentId,
        documentTitle,
        entityType,
        entityId,
        promptId,
        timestamp: new Date().toISOString(),
      });
      const metadataHash = await generateSHA256(metadataString);

      // 3. Create combined integrity hash
      const integrityHash = await generateSHA256(contentHash + metadataHash);

      // 4. Update the generated_document with content_hash
      const { error: docUpdateError } = await supabase
        .from('generated_documents')
        .update({
          content_hash: contentHash,
          evidence_type: 'GeneratedDocument',
        })
        .eq('document_id', documentId);

      if (docUpdateError) {
        console.error('Failed to update document hash:', docUpdateError);
      }

      // 5. Create evidence_objects record
      const evidenceId = generateEvidenceId();
      const { data: evidence, error: evidenceError } = await supabase
        .from('evidence_objects')
        .insert([{
          evidence_id: evidenceId,
          entity_type: entityType,
          entity_id: entityId,
          evidence_type: 'Other' as const, // Map to valid enum
          file_hash: integrityHash,
          source,
          immutability_class: 'System' as const,
          captured_by: 'system',
          metadata: {
            document_id: documentId,
            document_title: documentTitle,
            prompt_id: promptId,
            content_hash: contentHash,
            metadata_hash: metadataHash,
            integrity_hash: integrityHash,
            hash_algorithm: 'SHA-256',
            linked_at: new Date().toISOString(),
            dual_write: true,
          },
        }])
        .select()
        .single();

      if (evidenceError) {
        throw new Error(`Failed to create evidence record: ${evidenceError.message}`);
      }

      // 6. Create document_instances record for formal document tracking
      const { data: docInstance, error: instanceError } = await supabase
        .from('document_instances')
        .insert([{
          document_id: `DOC-${documentId}`,
          template_id: await getOrCreateTemplateId(promptId),
          entity_type: entityType,
          entity_id: entityId,
          data_snapshot: {
            title: documentTitle,
            generated_document_id: documentId,
            prompt_id: promptId,
          },
          data_snapshot_hash: metadataHash,
          rendered_artifact_hash: contentHash,
          status: 'Draft' as const,
        }])
        .select()
        .single();

      if (instanceError) {
        console.error('Failed to create document instance:', instanceError);
        // Don't throw - evidence was already created successfully
      }

      return {
        evidenceId,
        contentHash,
        integrityHash,
        documentInstanceId: docInstance?.id,
      };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['evidence'] });
      queryClient.invalidateQueries({ queryKey: ['generated_documents'] });
      queryClient.invalidateQueries({ queryKey: ['document_instances'] });
      
      toast.success('Document linked to evidence trail', {
        description: `Hash: ${result.contentHash.slice(0, 16)}...`,
      });
    },
    onError: (error) => {
      toast.error('Failed to link document', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    },
  });
}

// Helper to get or create a template ID for document_instances
async function getOrCreateTemplateId(promptId: string): Promise<string> {
  // Check if template exists
  const { data: existing } = await supabase
    .from('document_templates')
    .select('id')
    .eq('template_id', promptId)
    .single();

  if (existing) {
    return existing.id;
  }

  // Create a minimal template record
  const { data: created, error } = await supabase
    .from('document_templates')
    .insert([{
      template_id: promptId,
      name: promptId.replace(/_/g, ' '),
      doc_type: 'Other' as const,
      template_version: '1.0',
      status: 'Published' as const,
    }])
    .select('id')
    .single();

  if (error) {
    // If it fails (e.g., race condition), try to fetch again
    const { data: retry } = await supabase
      .from('document_templates')
      .select('id')
      .eq('template_id', promptId)
      .single();
    
    return retry?.id || promptId;
  }

  return created?.id || promptId;
}

// Hook to verify document integrity
export function useVerifyDocumentIntegrity() {
  return useMutation({
    mutationFn: async (params: { documentId: string; currentContent: string }) => {
      const { documentId, currentContent } = params;

      // Fetch the stored hash
      const { data: doc, error } = await supabase
        .from('generated_documents')
        .select('content_hash, document_title')
        .eq('document_id', documentId)
        .single();

      if (error || !doc) {
        throw new Error('Document not found');
      }

      if (!doc.content_hash) {
        return { verified: false, reason: 'No hash stored for this document' };
      }

      // Calculate current content hash
      const currentHash = await generateSHA256(currentContent);

      // Compare
      const isValid = currentHash === doc.content_hash;

      return {
        verified: isValid,
        storedHash: doc.content_hash,
        currentHash,
        documentTitle: doc.document_title,
        reason: isValid ? 'Content matches stored hash' : 'Content has been modified',
      };
    },
  });
}

// Hook to fetch evidence for a specific entity
export function useEntityEvidence(entityType: string | null, entityId: string | null) {
  return useQuery({
    queryKey: ['entity_evidence', entityType, entityId],
    queryFn: async () => {
      if (!entityType || !entityId) return { evidence: [], documents: [] };

      // Fetch evidence objects
      const { data: evidence, error: evidenceError } = await supabase
        .from('evidence_objects')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('captured_at', { ascending: false });

      if (evidenceError) throw evidenceError;

      // Fetch generated documents
      const { data: documents, error: docsError } = await supabase
        .from('generated_documents')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('created_at', { ascending: false });

      if (docsError) throw docsError;

      // Calculate integrity stats
      const totalDocs = documents?.length || 0;
      const hashedDocs = documents?.filter(d => d.content_hash).length || 0;
      const evidenceCount = evidence?.length || 0;
      const verifiedEvidence = evidence?.filter(e => e.file_hash).length || 0;

      return {
        evidence: evidence || [],
        documents: documents || [],
        stats: {
          totalDocuments: totalDocs,
          hashedDocuments: hashedDocs,
          totalEvidence: evidenceCount,
          verifiedEvidence,
          integrityScore: totalDocs > 0 ? Math.round((hashedDocs / totalDocs) * 100) : 100,
        },
      };
    },
    enabled: !!entityType && !!entityId,
  });
}

// Hook to batch link multiple documents
export function useBatchLinkDocuments() {
  const linkDocument = useLinkDocumentToEvidence();

  return useMutation({
    mutationFn: async (documents: DocumentEvidencePayload[]) => {
      const results = [];
      
      for (const doc of documents) {
        try {
          const result = await linkDocument.mutateAsync(doc);
          results.push({ success: true, documentId: doc.documentId, ...result });
        } catch (error) {
          results.push({ 
            success: false, 
            documentId: doc.documentId, 
            error: error instanceof Error ? error.message : 'Failed' 
          });
        }
      }

      return results;
    },
  });
}
