import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle2, XCircle, Loader2, Eye, Trash2, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useStorageUpload } from '@/hooks/useStorageUpload';
import { toast } from 'sonner';

interface DepositReceiptUploaderProps {
  dealId: string;
  dealDbId?: string;
  depositType?: 'eoi' | 'booking' | 'security' | 'first_payment';
  onUploadComplete?: (fileUrl: string, fileHash: string) => void;
  existingReceipts?: Array<{
    id: string;
    file_url: string;
    file_hash: string;
    evidence_type: string;
    captured_at: string;
  }>;
}

const DEPOSIT_TYPES = [
  { value: 'eoi', label: 'EOI / Expression of Interest' },
  { value: 'booking', label: 'Booking Deposit' },
  { value: 'security', label: 'Security Deposit' },
  { value: 'first_payment', label: 'First Installment' },
];

export const DepositReceiptUploader: React.FC<DepositReceiptUploaderProps> = ({
  dealId,
  dealDbId,
  depositType: initialDepositType = 'eoi',
  onUploadComplete,
  existingReceipts = [],
}) => {
  const [depositType, setDepositType] = useState(initialDepositType);
  const { uploadingFiles, isUploading, upload, removeFile } = useStorageUpload('evidence-uploads');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!dealDbId) {
      toast.error('Deal ID required for upload');
      return;
    }

    const folderPath = `deals/${dealDbId}/deposits`;
    await upload(acceptedFiles, folderPath, (result) => {
      // Create evidence record
      supabase
        .from('evidence_objects')
        .insert({
          evidence_id: `DEPOSIT_${depositType.toUpperCase()}_${Date.now()}`,
          entity_type: 'deal',
          entity_id: dealDbId,
          evidence_type: 'PaymentProof' as const,
          file_hash: result.hash,
          file_url: result.url,
          source: `deposit_uploader:${depositType}`,
          immutability_class: 'System' as const,
          metadata: {
            deposit_type: depositType,
            deal_id: dealId,
          },
        })
        .select()
        .single()
        .then(({ error }) => {
          if (error) console.error('Evidence record error:', error);
        });

      onUploadComplete?.(result.url, result.hash);
      toast.success('Receipt uploaded successfully', {
        description: `Hash: ${result.hash.substring(0, 12)}...`,
      });
    });
  }, [dealDbId, dealId, depositType, upload, onUploadComplete]);

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
          <Upload className="h-4 w-4 text-primary" />
          Deposit Receipt Upload
        </CardTitle>
        <CardDescription>Upload payment receipts for audit trail and evidence</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Deposit Type Selection */}
        <div className="grid gap-2">
          <label className="text-sm font-medium">Deposit Type</label>
          <Select value={depositType} onValueChange={(v: any) => setDepositType(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DEPOSIT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
            isDragActive && "border-primary bg-primary/5",
            isUploading && "cursor-not-allowed opacity-50",
            !isDragActive && !isUploading && "border-muted-foreground/25 hover:border-primary/50"
          )}
        >
          <input {...getInputProps()} />
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          {isDragActive ? (
            <p className="text-primary">Drop the files here...</p>
          ) : (
            <div>
              <p className="text-sm text-foreground">Drag & drop receipt files here, or click to select</p>
              <p className="text-xs text-muted-foreground mt-1">PDF, JPEG, PNG up to 10MB</p>
            </div>
          )}
        </div>

        {/* Uploaded Files List */}
        {uploadingFiles.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Uploaded Files</label>
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
                  {item.status === 'uploading' && <Progress value={item.progress} className="h-1 mt-1" />}
                  {item.result?.hash && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Shield className="h-3 w-3" />
                      <span className="font-mono">{item.result.hash.substring(0, 16)}...</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {item.status === 'uploading' && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                  {item.status === 'success' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                  {item.status === 'error' && <XCircle className="h-4 w-4 text-destructive" />}
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeFile(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Existing Receipts */}
        {existingReceipts.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Existing Evidence</label>
            {existingReceipts.map((receipt) => (
              <div key={receipt.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-sm">{receipt.evidence_type}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Shield className="h-3 w-3" />
                    <span className="font-mono">{receipt.file_hash?.substring(0, 16)}...</span>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">Verified</Badge>
                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                  <a href={receipt.file_url} target="_blank" rel="noopener noreferrer">
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
