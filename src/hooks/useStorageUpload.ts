import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UploadResult {
  path: string;
  url: string;
  hash: string;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  result?: UploadResult;
}

async function generateFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function useStorageUpload(bucket: string) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const upload = useCallback(async (
    files: File[],
    folderPath: string,
    onComplete?: (result: UploadResult) => void
  ) => {
    setIsUploading(true);
    const results: UploadResult[] = [];

    for (const file of files) {
      const idx = uploadingFiles.length + results.length;
      setUploadingFiles(prev => [...prev, { file, progress: 0, status: 'uploading' }]);

      try {
        const hash = await generateFileHash(file);
        setUploadingFiles(prev => prev.map((f, i) =>
          i === idx ? { ...f, progress: 30 } : f
        ));

        const ext = file.name.split('.').pop();
        const path = `${folderPath}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(path, file, { upsert: false });

        if (uploadError) throw uploadError;

        setUploadingFiles(prev => prev.map((f, i) =>
          i === idx ? { ...f, progress: 80 } : f
        ));

        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
        const url = urlData.publicUrl;

        const result: UploadResult = { path, url, hash };
        results.push(result);

        setUploadingFiles(prev => prev.map((f, i) =>
          i === idx ? { ...f, progress: 100, status: 'success', result } : f
        ));

        onComplete?.(result);
      } catch (error: any) {
        console.error('Upload error:', error);
        setUploadingFiles(prev => prev.map((f, i) =>
          i === idx ? { ...f, status: 'error', progress: 0 } : f
        ));
        toast.error(`Failed to upload ${file.name}`, { description: error.message });
      }
    }

    setIsUploading(false);
    return results;
  }, [bucket, uploadingFiles.length]);

  const removeFile = useCallback((index: number) => {
    setUploadingFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearFiles = useCallback(() => {
    setUploadingFiles([]);
  }, []);

  return { uploadingFiles, isUploading, upload, removeFile, clearFiles };
}
