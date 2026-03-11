import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle2, Loader2, Trash2, Shield, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useStorageUpload } from '@/hooks/useStorageUpload';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface KYCDocumentUploaderProps {
  dealId: string;
  partyId: string;
  partyName: string;
  onUploadComplete?: (fileUrl: string, fileHash: string) => void;
  existingDocuments?: Array<{
    id: string;
    file_url: string;
    label: string;
    uploaded_at: string;
  }>;
}

export const KYCDocumentUploader: React.FC<KYCDocumentUploaderProps> = ({
  dealId,
  partyId,
  partyName,
  onUploadComplete,
  existingDocuments = [],
}) => {
  const { uploadingFiles, isUploading, upload, removeFile } = useStorageUpload('kyc-documents');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const folderPath = `deals/${dealId}/parties/${partyId}`;
    await upload(acceptedFiles, folderPath, (result) => {
      // Create evidence record
      supabase
        .from('evidence_objects')
        .insert({
          evidence_id: `KYC_${partyId}_${Date.now()}`,
          entity_type: 'deal_party',
          entity_id: partyId,
          evidence_type: 'IdentityDocument',
          file_hash: result.hash,
          file_url: result.url,
          source: `kyc_uploader:${partyName}`,
          immutability_class: 'System',
          metadata: { deal_id: dealId, party_name: partyName },
        })
        .select()
        .single()
        .then(({ error }) => {
          if (error) console.error('Evidence record error:', error);
        });

      onUploadComplete?.(result.url, result.hash);
      toast.success('KYC document uploaded', {
        description: `SHA-256: ${result.hash.substring(0, 12)}...`,
      });
    });
  }, [dealId, partyId, partyName, upload, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf'],
    },
    maxSize: 10 * 1024 * 1024,
    disabled: isUploading,
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          KYC Documents — {partyName}
        </CardTitle>
        <CardDescription>Upload identity documents for compliance verification</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-colors",
            isDragActive && "border-primary bg-primary/5",
            isUploading && "cursor-not-allowed opacity-50",
            !isDragActive && !isUploading && "border-muted-foreground/25 hover:border-primary/50"
          )}
        >
          <input {...getInputProps()} />
          <Upload className="h-7 w-7 mx-auto mb-1.5 text-muted-foreground" />
          <p className="text-sm text-foreground">
            {isDragActive ? 'Drop files here...' : 'Drag & drop KYC documents'}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Emirates ID, Passport, Visa — PDF, JPEG, PNG up to 10MB
          </p>
        </div>

        {/* Uploading files */}
        {uploadingFiles.length > 0 && (
          <div className="space-y-2">
            {uploadingFiles.map((item, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border",
                  item.status === 'success' && "border-green-500/50 bg-green-500/5",
                  item.status === 'error' && "border-destructive/50 bg-destructive/5",
                  item.status === 'uploading' && "border-primary/50"
                )}
              >
                <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{item.file.name}</div>
                  {item.status === 'uploading' && (
                    <Progress value={item.progress} className="h-1 mt-1" />
                  )}
                  {item.result?.hash && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Shield className="h-3 w-3" />
                      <span className="font-mono">{item.result.hash.substring(0, 16)}...</span>
                    </div>
                  )}
                </div>
                {item.status === 'uploading' && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                {item.status === 'success' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeFile(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Existing docs */}
        {existingDocuments.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Verified Documents</label>
            {existingDocuments.map((doc) => (
              <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-sm">{doc.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(doc.uploaded_at).toLocaleDateString()}
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">Verified</Badge>
                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                  <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                    <Eye className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
