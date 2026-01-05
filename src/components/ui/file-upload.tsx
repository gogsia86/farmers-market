/**
 * 🌟 File Upload Component - Divine File Management
 * Comprehensive file upload with drag-and-drop, preview, and validation
 * Following: 08_UX_DESIGN_CONSCIOUSNESS, 12_ERROR_HANDLING_VALIDATION
 */

"use client";

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import {
  AlertCircle,
  Check,
  File,
  FileImage,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import * as React from "react";
import { useDropzone } from "react-dropzone";

// ============================================================================
// FILE UPLOAD VARIANTS
// ============================================================================

const fileUploadVariants = cva(
  "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed transition-all duration-200",
  {
    variants: {
      variant: {
        default: "border-gray-300 hover:border-gray-400",
        error: "border-red-500 bg-red-50/50",
        success: "border-green-500 bg-green-50/50",
        agricultural: "border-green-400 hover:border-green-500",
      },
      uploadSize: {
        sm: "p-4 min-h-[120px]",
        default: "p-6 min-h-[180px]",
        lg: "p-8 min-h-[240px]",
      },
      state: {
        idle: "",
        active: "border-primary bg-primary/5 scale-[1.02]",
        disabled: "opacity-50 cursor-not-allowed",
      },
    },
    defaultVariants: {
      variant: "default",
      uploadSize: "default",
      state: "idle",
    },
  }
);

// ============================================================================
// FILE TYPE & INTERFACES
// ============================================================================

export interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  progress?: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
}

export interface FileUploadProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange">,
  VariantProps<typeof fileUploadVariants> {
  maxFiles?: number;
  maxSize?: number; // in bytes
  accept?: Record<string, string[]>;
  multiple?: boolean;
  disabled?: boolean;
  value?: UploadedFile[];
  onChange?: (files: UploadedFile[]) => void;
  onUpload?: (files: File[]) => Promise<void>;
  showPreview?: boolean;
  showProgress?: boolean;
  consciousness?: "DIVINE" | "AGRICULTURAL" | "STANDARD";
}

// ============================================================================
// FILE UPLOAD COMPONENT
// ============================================================================

const FileUpload = React.forwardRef<HTMLDivElement, FileUploadProps>(
  (
    {
      className,
      variant,
      uploadSize,
      maxFiles = 5,
      maxSize = 10 * 1024 * 1024, // 10MB default
      accept = {
        "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
      },
      multiple = true,
      disabled = false,
      value = [],
      onChange,
      onUpload,
      showPreview = true,
      showProgress = true,
      consciousness = "STANDARD",
      ...props
    },
    ref
  ) => {
    const [files, setFiles] = React.useState<UploadedFile[]>(value);
    const [error, setError] = React.useState<string | null>(null);

    // Update internal state when value prop changes
    React.useEffect(() => {
      setFiles(value);
    }, [value]);

    const generateFileId = () => `file-${Date.now()}-${Math.random()}`;

    const createUploadedFile = (file: File): UploadedFile => {
      const id = generateFileId();
      const isImage = file.type.startsWith("image/");

      return {
        id,
        file,
        preview: isImage ? URL.createObjectURL(file) : undefined,
        progress: 0,
        status: "pending",
      };
    };

    const onDrop = React.useCallback(
      async (acceptedFiles: File[], rejectedFiles: any[]) => {
        setError(null);

        // Handle rejected files
        if (rejectedFiles.length > 0) {
          const errors = rejectedFiles
            .map((f) => f.errors.map((e: any) => e.message).join(", "))
            .join("; ");
          setError(errors);
          return;
        }

        // Check max files
        if (files.length + acceptedFiles.length > maxFiles) {
          setError(`Maximum ${maxFiles} files allowed`);
          return;
        }

        // Create uploaded file objects
        const newFiles = acceptedFiles.map(createUploadedFile);
        const updatedFiles = [...files, ...newFiles];
        setFiles(updatedFiles);
        onChange?.(updatedFiles);

        // Handle upload if onUpload provided
        if (onUpload) {
          try {
            // Update status to uploading
            const uploadingFiles = updatedFiles.map((f) =>
              newFiles.find((nf) => nf.id === f.id)
                ? { ...f, status: "uploading" as const }
                : f
            );
            setFiles(uploadingFiles);
            onChange?.(uploadingFiles);

            // Perform upload
            await onUpload(acceptedFiles);

            // Update status to success
            const successFiles = updatedFiles.map((f) =>
              newFiles.find((nf) => nf.id === f.id)
                ? { ...f, status: "success" as const, progress: 100 }
                : f
            );
            setFiles(successFiles);
            onChange?.(successFiles);
          } catch (err) {
            // Update status to error
            const errorFiles = updatedFiles.map((f) =>
              newFiles.find((nf) => nf.id === f.id)
                ? {
                  ...f,
                  status: "error" as const,
                  error: err instanceof Error ? err.message : "Upload failed",
                }
                : f
            );
            setFiles(errorFiles);
            onChange?.(errorFiles);
          }
        }
      },
      [files, maxFiles, onChange, onUpload]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
      accept,
      maxSize,
      multiple,
      disabled: disabled || files.length >= maxFiles,
    });

    const removeFile = (id: string) => {
      const updatedFiles = files.filter((f) => f.id !== id);
      setFiles(updatedFiles);
      onChange?.(updatedFiles);
      setError(null);
    };

    const retryUpload = async (id: string) => {
      const file = files.find((f) => f.id === id);
      if (!file || !onUpload) return;

      try {
        const updatedFiles = files.map((f) =>
          f.id === id ? { ...f, status: "uploading" as const, error: undefined } : f
        );
        setFiles(updatedFiles);
        onChange?.(updatedFiles);

        await onUpload([file.file]);

        const successFiles = files.map((f) =>
          f.id === id ? { ...f, status: "success" as const, progress: 100 } : f
        );
        setFiles(successFiles);
        onChange?.(successFiles);
      } catch (err) {
        const errorFiles = files.map((f) =>
          f.id === id
            ? {
              ...f,
              status: "error" as const,
              error: err instanceof Error ? err.message : "Upload failed",
            }
            : f
        );
        setFiles(errorFiles);
        onChange?.(errorFiles);
      }
    };

    const consciousnessStyles = {
      DIVINE: "bg-gradient-to-br from-purple-50 to-blue-50",
      AGRICULTURAL: "bg-gradient-to-br from-green-50 to-emerald-50",
      STANDARD: "bg-background",
    };

    const canUploadMore = files.length < maxFiles && !disabled;

    return (
      <div ref={ref} className={cn("space-y-4", className)} {...props}>
        {/* Drop Zone */}
        {canUploadMore && (
          <div
            {...getRootProps()}
            className={cn(
              fileUploadVariants({
                variant: error ? "error" : variant,
                uploadSize,
                state: disabled
                  ? "disabled"
                  : isDragActive
                    ? "active"
                    : "idle",
              }),
              consciousnessStyles[consciousness],
              "cursor-pointer"
            )}
          >
            <input {...getInputProps()} />

            <div className="flex flex-col items-center justify-center text-center space-y-2">
              <div
                className={cn(
                  "rounded-full p-3 transition-all duration-200",
                  isDragActive
                    ? "bg-primary text-primary-foreground scale-110"
                    : "bg-gray-100 text-gray-600"
                )}
              >
                <Upload className="h-6 w-6" />
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {isDragActive ? (
                    <span className="text-primary">Drop files here</span>
                  ) : (
                    <span>
                      Drag & drop files here, or{" "}
                      <span className="text-primary underline">browse</span>
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {multiple
                    ? `Up to ${maxFiles} files, max ${formatFileSize(maxSize)} each`
                    : `Max ${formatFileSize(maxSize)}`}
                </p>
              </div>

              {/* Accepted file types */}
              <div className="text-xs text-muted-foreground">
                {Object.values(accept)
                  .flat()
                  .map((ext) => ext.toUpperCase())
                  .join(", ")}
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-start gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">
                Uploaded Files ({files.length}/{maxFiles})
              </h4>
              {files.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setFiles([]);
                    onChange?.([]);
                  }}
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="space-y-2">
              {files.map((file) => (
                <FilePreview
                  key={file.id}
                  file={file}
                  showPreview={showPreview}
                  showProgress={showProgress}
                  onRemove={() => removeFile(file.id)}
                  onRetry={() => retryUpload(file.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
);
FileUpload.displayName = "FileUpload";

// ============================================================================
// FILE PREVIEW COMPONENT
// ============================================================================

interface FilePreviewProps {
  file: UploadedFile;
  showPreview: boolean;
  showProgress: boolean;
  onRemove: () => void;
  onRetry: () => void;
}

function FilePreview({
  file,
  showPreview,
  showProgress,
  onRemove,
  onRetry,
}: FilePreviewProps) {
  const statusIcons = {
    pending: <File className="h-4 w-4 text-gray-400" />,
    uploading: <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />,
    success: <Check className="h-4 w-4 text-green-500" />,
    error: <AlertCircle className="h-4 w-4 text-red-500" />,
  };

  const statusColors = {
    pending: "border-gray-300 bg-gray-50",
    uploading: "border-blue-300 bg-blue-50",
    success: "border-green-300 bg-green-50",
    error: "border-red-300 bg-red-50",
  };

  return (
    <div
      className={cn(
        "relative flex items-center gap-3 p-3 rounded-lg border transition-all duration-200",
        statusColors[file.status]
      )}
    >
      {/* Preview or Icon */}
      {showPreview && file.preview ? (
        <div className="relative h-12 w-12 flex-shrink-0 rounded overflow-hidden bg-gray-100">
          <img
            src={file.preview}
            alt={file.file.name}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="flex h-12 w-12 items-center justify-center flex-shrink-0 rounded bg-gray-100">
          <FileImage className="h-6 w-6 text-gray-400" />
        </div>
      )}

      {/* File Info */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate">{file.file.name}</p>
          {statusIcons[file.status]}
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{formatFileSize(file.file.size)}</span>
          {file.status === "success" && <span>• Uploaded</span>}
          {file.status === "error" && file.error && (
            <span className="text-red-600">• {file.error}</span>
          )}
        </div>

        {/* Progress Bar */}
        {showProgress &&
          file.status === "uploading" &&
          file.progress !== undefined && (
            <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${file.progress}%` }}
              />
            </div>
          )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {file.status === "error" && (
          <button
            type="button"
            onClick={onRetry}
            className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
            title="Retry upload"
          >
            <Upload className="h-4 w-4" />
          </button>
        )}
        <button
          type="button"
          onClick={onRemove}
          className="p-1 text-gray-600 hover:bg-gray-200 rounded transition-colors"
          title="Remove file"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// UTILITIES
// ============================================================================

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

// ============================================================================
// AGRICULTURAL FILE UPLOAD (DIVINE PATTERN)
// ============================================================================

export interface AgriculturalFileUploadProps
  extends Omit<FileUploadProps, "consciousness"> {
  farmId?: string;
  productId?: string;
  category?: "product" | "farm" | "certification" | "document";
}

const AgriculturalFileUpload = React.forwardRef<
  HTMLDivElement,
  AgriculturalFileUploadProps
>(({ category = "product", variant = "agricultural", ...props }, ref) => {
  const categoryLabels = {
    product: "Product Images",
    farm: "Farm Photos",
    certification: "Certifications & Documents",
    document: "Documents",
  };

  const categoryAccept = {
    product: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    farm: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    certification: {
      "image/*": [".png", ".jpg", ".jpeg"],
      "application/pdf": [".pdf"],
    },
    document: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
  };

  return (
    <div ref={ref} className="space-y-2">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-medium text-green-900">
          {categoryLabels[category]}
        </h3>
        <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
          Agricultural Conscious
        </span>
      </div>
      <FileUpload
        {...props}
        variant={variant}
        accept={categoryAccept[category]}
        consciousness="AGRICULTURAL"
      />
    </div>
  );
});
AgriculturalFileUpload.displayName = "AgriculturalFileUpload";

// ============================================================================
// EXPORTS
// ============================================================================

export { AgriculturalFileUpload, FileUpload };
