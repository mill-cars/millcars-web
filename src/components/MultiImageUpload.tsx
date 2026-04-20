import React, { useRef, useCallback } from 'react';
import {
  Upload,
  X,
  Crown,
  AlertCircle,
  GripVertical,
  ImagePlus,
} from 'lucide-react';
import {
  ManagedImage,
  validateImageFile,
  canAddMoreImages,
  MAX_IMAGES,
  MAX_FILE_SIZE_MB,
} from '../services/imageService';

// ─── Props ────────────────────────────────────────────────────────────────────

interface MultiImageUploadProps {
  images: ManagedImage[];
  onChange: (images: ManagedImage[]) => void;
  error?: string | null;
  onErrorChange?: (error: string | null) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateTempId(): string {
  return `temp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export const MultiImageUpload: React.FC<MultiImageUploadProps> = ({
  images,
  onChange,
  error,
  onErrorChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragItemRef = useRef<number | null>(null);
  const dragOverItemRef = useRef<number | null>(null);

  // ── Add files ─────────────────────────────────────────────────────────────
  const handleFilesSelected = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const available = MAX_IMAGES - images.length;

      if (available <= 0) {
        onErrorChange?.(`Máximo ${MAX_IMAGES} imágenes por vehículo.`);
        return;
      }

      const toProcess = fileArray.slice(0, available);
      const newImages: ManagedImage[] = [];

      for (const file of toProcess) {
        const validationError = validateImageFile(file);
        if (validationError) {
          onErrorChange?.(validationError);
          return;
        }

        const dataUrl = await readFileAsDataUrl(file);
        newImages.push({
          id: generateTempId(),
          url: dataUrl,
          file,
          isCover: images.length === 0 && newImages.length === 0, // First image is cover by default
          sortOrder: images.length + newImages.length,
          isPersisted: false,
        });
      }

      onErrorChange?.(null);
      onChange([...images, ...newImages]);

      if (fileArray.length > available) {
        onErrorChange?.(
          `Solo se agregaron ${available} imagen(es). Máximo ${MAX_IMAGES} por vehículo.`
        );
      }
    },
    [images, onChange, onErrorChange]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFilesSelected(e.target.files);
      e.target.value = ''; // Reset to allow re-selecting same file
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer.files.length > 0) {
        handleFilesSelected(e.dataTransfer.files);
      }
    },
    [handleFilesSelected]
  );

  // ── Remove image ──────────────────────────────────────────────────────────
  const handleRemove = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    // If removed image was cover, set first remaining as cover
    if (images[index].isCover && updated.length > 0) {
      updated[0] = { ...updated[0], isCover: true };
    }
    // Recalculate sort orders
    const reordered = updated.map((img, i) => ({ ...img, sortOrder: i }));
    onChange(reordered);
    onErrorChange?.(null);
  };

  // ── Set cover ─────────────────────────────────────────────────────────────
  const handleSetCover = (index: number) => {
    const updated = images.map((img, i) => ({
      ...img,
      isCover: i === index,
    }));
    onChange(updated);
  };

  // ── Drag & Drop reorder ───────────────────────────────────────────────────
  const handleDragStart = (index: number) => {
    dragItemRef.current = index;
  };

  const handleDragEnter = (index: number) => {
    dragOverItemRef.current = index;
  };

  const handleDragEnd = () => {
    if (dragItemRef.current === null || dragOverItemRef.current === null) return;
    if (dragItemRef.current === dragOverItemRef.current) return;

    const updated = [...images];
    const draggedItem = updated[dragItemRef.current];
    updated.splice(dragItemRef.current, 1);
    updated.splice(dragOverItemRef.current, 0, draggedItem);

    const reordered = updated.map((img, i) => ({ ...img, sortOrder: i }));
    onChange(reordered);

    dragItemRef.current = null;
    dragOverItemRef.current = null;
  };

  const canAdd = canAddMoreImages(images.length);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Image grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {images.map((img, index) => (
            <div
              key={img.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
              className={`relative group rounded-xl overflow-hidden border-2 transition-all cursor-grab active:cursor-grabbing ${
                img.isCover
                  ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-lg shadow-blue-500/10'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              {/* Image */}
              <div className="aspect-[4/3] relative bg-slate-100 dark:bg-slate-800">
                <img
                  src={img.url}
                  alt={`Imagen ${index + 1}`}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200" />

                {/* Drag handle */}
                <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-black/60 backdrop-blur-sm rounded-lg p-1">
                    <GripVertical className="w-4 h-4 text-white" />
                  </div>
                </div>

                {/* Cover badge */}
                {img.isCover && (
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg">
                    <Crown className="w-3 h-3" />
                    Principal
                  </div>
                )}

                {/* Action buttons (visible on hover) */}
                <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {/* Remove */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(index);
                    }}
                    className="w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center shadow-lg transition-colors"
                    title="Eliminar imagen"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Set as cover button (visible on hover, only for non-cover) */}
                {!img.isCover && (
                  <div className="absolute bottom-2 inset-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetCover(index);
                      }}
                      className="w-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-700 dark:text-slate-200 text-[10px] font-bold uppercase tracking-wider py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors border border-slate-200/50 dark:border-slate-600/50"
                    >
                      <Crown className="w-3 h-3" />
                      Hacer principal
                    </button>
                  </div>
                )}
              </div>

              {/* Image info footer */}
              <div className="px-2.5 py-2 bg-white dark:bg-slate-900 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {index + 1}/{images.length}
                </span>
                {img.file && (
                  <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 truncate max-w-[80px]">
                    {(img.file.size / 1024 / 1024).toFixed(1)} MB
                  </span>
                )}
                {!img.file && img.isPersisted && (
                  <span className="text-[9px] font-bold text-green-500 uppercase tracking-wider">
                    Guardada
                  </span>
                )}
              </div>
            </div>
          ))}

          {/* Add more button (inline in grid) */}
          {canAdd && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-[4/3] rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 flex flex-col items-center justify-center gap-2 transition-all group/add cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 group-hover/add:bg-blue-100 dark:group-hover/add:bg-blue-900/30 flex items-center justify-center transition-colors">
                <ImagePlus className="w-5 h-5 text-slate-400 group-hover/add:text-blue-500 transition-colors" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {images.length}/{MAX_IMAGES}
              </span>
            </button>
          )}
        </div>
      )}

      {/* Empty state / Drop zone */}
      {images.length === 0 && (
        <div
          role="button"
          tabIndex={0}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
          className={`relative w-full h-64 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all group overflow-hidden ${
            error
              ? 'border-red-400 bg-red-50 dark:bg-red-900/10'
              : 'border-slate-300 dark:border-slate-600 hover:border-blue-400 hover:bg-blue-50/30 dark:hover:border-blue-500 dark:hover:bg-blue-900/10'
          }`}
        >
          <div className="flex flex-col items-center gap-4 px-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
              <Upload className="w-8 h-8 text-slate-400 group-hover:text-blue-500 transition-colors" />
            </div>
            <div>
              <p className="text-base font-bold text-slate-700 dark:text-slate-300">
                Arrastra imágenes o haz clic para seleccionar
              </p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                JPG, PNG, WebP · Máx. {MAX_FILE_SIZE_MB} MB · Hasta {MAX_IMAGES} imágenes
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1.5 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </p>
      )}

      {/* Helper text */}
      {images.length > 0 && (
        <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
          <span className="font-bold">Arrastra</span> para reordenar ·{' '}
          <span className="font-bold">Crown</span> para definir la principal ·{' '}
          La primera imagen será la portada del catálogo
        </p>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  );
};
