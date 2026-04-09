import React, { useState, useCallback, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDropzone } from 'react-dropzone';
import {
  Loader2,
  ImageIcon,
  Star,
  GripVertical,
  Trash2,
  Maximize2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useStorageUpload } from '@/hooks/useStorageUpload';
import {
  useListingMedia,
  useInsertListingMedia,
  useDeleteListingMedia,
  useReorderListingMedia,
  useSetPrimaryMedia,
  type ListingMediaRow,
} from '@/hooks/useListingMedia';
import { toast } from 'sonner';

// Re-export for backward compat
export interface PhotoItem {
  id: string;
  url: string;
  path: string;
  isPrimary: boolean;
  order: number;
}

interface ListingPhotoGalleryProps {
  listingId: string;
  /** @deprecated — gallery now self-manages via DB */
  photos?: PhotoItem[];
  /** @deprecated */
  onPhotosChange?: (photos: PhotoItem[]) => void;
  readOnly?: boolean;
}

// --- Sortable thumbnail ---
function SortablePhoto({
  photo,
  onSetPrimary,
  onRemove,
  onPreview,
  readOnly,
}: {
  photo: ListingMediaRow;
  onSetPrimary: () => void;
  onRemove: () => void;
  onPreview: () => void;
  readOnly?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: photo.id, disabled: readOnly });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative group aspect-square rounded-lg overflow-hidden border',
        photo.is_primary ? 'border-primary ring-2 ring-primary/30' : 'border-border',
        isDragging && 'shadow-xl'
      )}
    >
      <img
        src={photo.public_url}
        alt={photo.caption || ''}
        className="w-full h-full object-cover"
        loading="lazy"
      />

      {photo.is_primary && (
        <Badge className="absolute top-1.5 left-1.5 text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 gap-1">
          <Star className="h-2.5 w-2.5 fill-current" />
          Primary
        </Badge>
      )}

      {!readOnly && (
        <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
          <button
            {...attributes}
            {...listeners}
            className="p-1.5 rounded bg-card/80 hover:bg-card cursor-grab active:cursor-grabbing"
            title="Drag to reorder"
          >
            <GripVertical className="h-4 w-4 text-foreground" />
          </button>

          <button onClick={onPreview} className="p-1.5 rounded bg-card/80 hover:bg-card" title="Preview">
            <Maximize2 className="h-4 w-4 text-foreground" />
          </button>

          {!photo.is_primary && (
            <button onClick={onSetPrimary} className="p-1.5 rounded bg-card/80 hover:bg-card" title="Set as primary">
              <Star className="h-4 w-4 text-accent" />
            </button>
          )}

          <button onClick={onRemove} className="p-1.5 rounded bg-destructive/80 hover:bg-destructive" title="Remove photo">
            <Trash2 className="h-3.5 w-3.5 text-destructive-foreground" />
          </button>
        </div>
      )}
    </div>
  );
}

// --- Main Gallery ---
export function ListingPhotoGallery({
  listingId,
  readOnly = false,
}: ListingPhotoGalleryProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { uploadingFiles, isUploading, upload, clearFiles } = useStorageUpload('listing-photos');

  const { data: photos = [], isLoading } = useListingMedia(listingId);
  const insertMedia = useInsertListingMedia();
  const deleteMedia = useDeleteListingMedia();
  const reorderMedia = useReorderListingMedia();
  const setPrimary = useSetPrimaryMedia();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const photoIds = useMemo(() => photos.map((p) => p.id), [photos]);

  // --- Upload handler ---
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const startOrder = photos.length;
      const results = await upload(acceptedFiles, `listings/${listingId}`);

      if (results.length > 0) {
        const rows = results.map((r, i) => ({
          listing_id: listingId,
          storage_path: r.path,
          public_url: r.url,
          caption: null,
          display_order: startOrder + i,
          is_primary: photos.length === 0 && i === 0,
          file_hash: r.hash,
        }));

        await insertMedia.mutateAsync(rows);
        clearFiles();
        toast.success(`${results.length} photo${results.length > 1 ? 's' : ''} uploaded`);
      }
    },
    [listingId, photos.length, upload, clearFiles, insertMedia]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxSize: 10 * 1024 * 1024,
    disabled: isUploading || readOnly,
  });

  // --- Drag end (reorder) ---
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = photos.findIndex((p) => p.id === active.id);
      const newIndex = photos.findIndex((p) => p.id === over.id);
      const reordered = arrayMove(photos, oldIndex, newIndex);

      const orderedIds = reordered.map((p, i) => ({
        id: p.id,
        display_order: i,
        is_primary: p.is_primary,
      }));

      reorderMedia.mutate({ listingId, orderedIds });
    },
    [photos, listingId, reorderMedia]
  );

  // --- Set primary ---
  const handleSetPrimary = useCallback(
    (id: string) => {
      setPrimary.mutate({ id, listingId });
    },
    [listingId, setPrimary]
  );

  // --- Remove ---
  const handleRemove = useCallback(
    (photo: ListingMediaRow) => {
      deleteMedia.mutate({ id: photo.id, listingId, storagePath: photo.storage_path });
    },
    [listingId, deleteMedia]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {photos.length > 0 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {photos.length} photo{photos.length !== 1 ? 's' : ''}
          </span>
          <span className="text-xs text-muted-foreground">
            Drag to reorder · Click star to set primary
          </span>
        </div>
      )}

      {photos.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={photoIds} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {photos.map((photo) => (
                <SortablePhoto
                  key={photo.id}
                  photo={photo}
                  readOnly={readOnly}
                  onSetPrimary={() => handleSetPrimary(photo.id)}
                  onRemove={() => handleRemove(photo)}
                  onPreview={() => setPreviewUrl(photo.public_url)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {uploadingFiles.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {uploadingFiles.map((item, i) => (
            <div
              key={i}
              className={cn(
                'relative aspect-square rounded-lg overflow-hidden border flex items-center justify-center bg-muted/30',
                item.status === 'success' && 'border-emerald-500/50',
                item.status === 'error' && 'border-destructive/50',
                item.status === 'uploading' && 'border-primary/50'
              )}
            >
              {item.status === 'uploading' ? (
                <div className="flex flex-col items-center gap-1">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span className="text-xs text-muted-foreground">{item.progress}%</span>
                </div>
              ) : item.status === 'error' ? (
                <span className="text-xs text-destructive px-1 text-center">Upload failed</span>
              ) : null}
            </div>
          ))}
        </div>
      )}

      {!readOnly && (
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
            isDragActive && 'border-primary bg-primary/5',
            isUploading && 'cursor-not-allowed opacity-50',
            !isDragActive && !isUploading && 'border-muted-foreground/25 hover:border-primary/50'
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 rounded-full bg-muted">
              <ImageIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {isDragActive ? 'Drop photos here…' : 'Drag & drop listing photos'}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                JPEG, PNG, WebP · Up to 10 MB each · First photo becomes primary
              </p>
            </div>
          </div>
        </div>
      )}

      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent className="max-w-4xl p-0 bg-background/95 border-border">
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Photo preview"
              className="w-full h-auto max-h-[85vh] object-contain rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
