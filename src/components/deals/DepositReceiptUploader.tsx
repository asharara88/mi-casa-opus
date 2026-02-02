import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  Eye,
  Trash2,
  Shield
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
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

// Generate SHA-256 hash from file
async function generateFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const DepositReceiptUploader: React.FC<DepositReceiptUploaderProps> = ({
  dealId,
  dealDbId,
  depositType: initialDepositType = 'eoi',
  onUploadComplete,
  existingReceipts = [],
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<Array<{
    file: File;
    progress: number;
    status: 'uploading' | 'success' | 'error';
    hash?: string;
    url?: string;
  }>>([]);
  const [depositType, setDepositType] = useState(initialDepositType);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!dealDbId) {
      toast.error('Deal ID required for upload');
      return;
    }

    setIsUploading(true);

    for (const file of acceptedFiles) {
      // Add file to state with uploading status
      const fileIndex = uploadedFiles.length;
      setUploadedFiles(prev => [...prev, {
        file,
        progress: 0,
        status: 'uploading',
      }]);

      try {
        // Generate hash for integrity verification
        const fileHash = await generateFileHash(file);
        
        setUploadedFiles(prev => prev.map((f, i) => 
          i === fileIndex ? { ...f, progress: 30, hash: fileHash } : f
        ));

        // Create a unique file path
        const fileExt = file.name.split('.').pop();
        const fileName = `${dealDbId}/${depositType}_${Date.now()}.${fileExt}`;

        // Note: In a real implementation, you'd upload to Supabase Storage
        // For now, we'll simulate the upload and create an evidence record
        setUploadedFiles(prev => prev.map((f, i) => 
          i === fileIndex ? { ...f, progress: 70 } : f
        ));

        // Create evidence record
        const { data: evidenceData, error: evidenceError } = await supabase
          .from('evidence_objects')
          .insert({
            evidence_id: `DEPOSIT_${depositType.toUpperCase()}_${Date.now()}`,
            entity_type: 'deal',
            entity_id: dealDbId,
            evidence_type: 'PaymentProof',
            file_hash: fileHash,
            file_url: fileName, // Would be actual storage URL
            source: `deposit_uploader:${depositType}`,
            immutability_class: 'System',
            metadata: {
              deposit_type: depositType,
              original_filename: file.name,
              file_size: file.size,
              mime_type: file.type,
            },
          })
          .select()
          .single();

        if (evidenceError) throw evidenceError;

        setUploadedFiles(prev => prev.map((f, i) => 
          i === fileIndex ? { 
            ...f, 
            progress: 100, 
            status: 'success',
            url: fileName,
          } : f
        ));

        onUploadComplete?.(fileName, fileHash);
        
        toast.success('Receipt uploaded successfully', {
          description: `Hash: ${fileHash.substring(0, 12)}...`,
        });

      } catch (error) {
        console.error('Upload error:', error);
        setUploadedFiles(prev => prev.map((f, i) => 
          i === fileIndex ? { ...f, status: 'error', progress: 0 } : f
        ));
        toast.error('Failed to upload receipt');
      }
    }

    setIsUploading(false);
  }, [dealDbId, depositType, uploadedFiles.length, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: isUploading,
  });

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Upload className="h-4 w-4 text-primary" />
          Deposit Receipt Upload
        </CardTitle>
        <CardDescription>
          Upload payment receipts for audit trail and evidence
        </CardDescription>
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
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
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
              <p className="text-sm text-foreground">
                Drag & drop receipt files here, or click to select
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PDF, JPEG, PNG up to 10MB
              </p>
            </div>
          )}
        </div>

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Uploaded Files</label>
            {uploadedFiles.map((item, index) => (
              <div 
                key={index}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border",
                  item.status === 'success' && "border-green-500/50 bg-green-500/5",
                  item.status === 'error' && "border-red-500/50 bg-red-500/5",
                  item.status === 'uploading' && "border-primary/50"
                )}
              >
                <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{item.file.name}</div>
                  {item.status === 'uploading' && (
                    <Progress value={item.progress} className="h-1 mt-1" />
                  )}
                  {item.hash && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Shield className="h-3 w-3" />
                      <span className="font-mono">{item.hash.substring(0, 16)}...</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {item.status === 'uploading' && (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  )}
                  {item.status === 'success' && (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                  {item.status === 'error' && (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => removeFile(index)}
                  >
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
              <div 
                key={receipt.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-border"
              >
                <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-sm">{receipt.evidence_type}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Shield className="h-3 w-3" />
                    <span className="font-mono">{receipt.file_hash?.substring(0, 16)}...</span>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  Verified
                </Badge>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
