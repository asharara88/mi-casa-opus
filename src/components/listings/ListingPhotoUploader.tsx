import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Loader2, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useStorageUpload } from '@/hooks/useStorageUpload';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ListingPhotoUploaderProps {
  listingId: string;
  existingPhotos?: string[];
  onPhotosChange?: (urls: string[]) => void;
}

export const ListingPhotoUploader: React.FC<ListingPhotoUploaderProps> = ({
  listingId,
  existingPhotos = [],
  onPhotosChange,
}) => {
  const { uploadingFiles, isUploading, upload, removeFile } = useStorageUpload('listing-photos');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const results = await upload(acceptedFiles, `listings/${listingId}`, (result) => {
      onPhotosChange?.([...existingPhotos, result.url]);
    });
  }, [listingId, existingPhotos, onPhotosChange, upload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxSize: 10 * 1024 * 1024,
    disabled: isUploading,
  });

  const handleRemoveExisting = async (url: string) => {
    // Extract path from URL
    const path = url.split('/listing-photos/').pop();
    if (path) {
      const { error } = await supabase.storage.from('listing-photos').remove([path]);
      if (error) {
        toast.error('Failed to delete photo');
        return;
      }
    }
    onPhotosChange?.(existingPhotos.filter(p => p !== url));
    toast.success('Photo removed');
  };

  return (
    <div className="space-y-3">
      {/* Existing photos grid */}
      {existingPhotos.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {existingPhotos.map((url, i) => (
            <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-border">
              <img src={url} alt={`Listing photo ${i + 1}`} className="w-full h-full object-cover" />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemoveExisting(url)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Uploading files */}
      {uploadingFiles.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {uploadingFiles.map((item, i) => (
            <div key={i} className={cn(
              "relative aspect-square rounded-lg overflow-hidden border flex items-center justify-center",
              item.status === 'success' && "border-green-500/50",
              item.status === 'error' && "border-destructive/50",
              item.status === 'uploading' && "border-primary/50"
            )}>
              {item.status === 'success' && item.result ? (
                <img src={item.result.url} alt="" className="w-full h-full object-cover" />
              ) : item.status === 'uploading' ? (
                <div className="flex flex-col items-center gap-1">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span className="text-xs text-muted-foreground">{item.progress}%</span>
                </div>
              ) : (
                <span className="text-xs text-destructive">Error</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors",
          isDragActive && "border-primary bg-primary/5",
          isUploading && "cursor-not-allowed opacity-50",
          !isDragActive && !isUploading && "border-muted-foreground/25 hover:border-primary/50"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-1">
          <ImageIcon className="h-6 w-6 text-muted-foreground" />
          <p className="text-sm text-foreground">
            {isDragActive ? 'Drop photos here...' : 'Drag & drop listing photos'}
          </p>
          <p className="text-xs text-muted-foreground">JPEG, PNG, WebP up to 10MB</p>
        </div>
      </div>
    </div>
  );
};
