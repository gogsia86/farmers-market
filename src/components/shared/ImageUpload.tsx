/**
 * 📸 IMAGE UPLOAD COMPONENT - DRAG & DROP IMAGE UPLOADER
 *
 * Reusable image upload component with Cloudinary integration
 *
 * Features:
 * - Drag-and-drop interface
 * - Multiple file support
 * - Image preview with thumbnails
 * - Upload progress tracking
 * - File validation (size, type)
 * - Cloudinary integration
 *
 * @module ImageUpload
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Upload, X, Loader2, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface ImageUploadProps {
  maxFiles?: number;
  folder: string;
  existingImages?: string[];
  onUploadComplete: (urls: string[]) => void;
  disabled?: boolean;
  acceptedTypes?: string[];
  maxSize?: number; // in MB
  className?: string;
}

interface UploadingFile {
  file: File;
  preview: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
  url?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_MAX_FILES = 3;
const DEFAULT_MAX_SIZE = 5; // 5MB
const DEFAULT_ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// ============================================================================
// COMPONENT
// ============================================================================

export const ImageUpload: React.FC<ImageUploadProps> = ({
  maxFiles = DEFAULT_MAX_FILES,
  folder,
  existingImages = [],
  onUploadComplete,
  disabled = false,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  maxSize = DEFAULT_MAX_SIZE,
  className,
}) => {
  const { toast } = useToast();
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>(existingImages);

  // Update parent component when URLs change
  useEffect(() => {
    if (uploadedUrls.length > 0 || existingImages.length === 0) {
      onUploadComplete(uploadedUrls);
    }
  }, [uploadedUrls, onUploadComplete]);

  // Upload single file to Cloudinary
  const uploadToCloudinary = async (
    file: File,
    fileIndex: number
  ): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await response.json();

      // Update progress to 100%
      setUploadingFiles((prev) =>
        prev.map((f, i) =>
          i === fileIndex
            ? { ...f, progress: 100, status: 'success', url: data.url }
            : f
        )
      );

      return data.url;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Upload failed';

      // Update status to error
      setUploadingFiles((prev) =>
        prev.map((f, i) =>
          i === fileIndex
            ? { ...f, status: 'error', error: errorMessage }
            : f
        )
      );

      throw error;
    }
  };

  // Handle file drop
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (disabled) return;

      const totalFiles = uploadedUrls.length + uploadingFiles.length + acceptedFiles.length;

      if (totalFiles > maxFiles) {
        toast({
          title: 'Too Many Files',
          description: `Maximum ${maxFiles} images allowed`,
          variant: 'destructive',
        });
        return;
      }

      // Validate files
      const validFiles: File[] = [];
      for (const file of acceptedFiles) {
        // Check file type
        if (!acceptedTypes.includes(file.type)) {
          toast({
            title: 'Invalid File Type',
            description: `${file.name} is not a supported image format`,
            variant: 'destructive',
          });
          continue;
        }

        // Check file size
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > maxSize) {
          toast({
            title: 'File Too Large',
            description: `${file.name} exceeds ${maxSize}MB limit`,
            variant: 'destructive',
          });
          continue;
        }

        validFiles.push(file);
      }

      if (validFiles.length === 0) return;

      // Create preview objects
      const newFiles: UploadingFile[] = validFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        progress: 0,
        status: 'uploading',
      }));

      setUploadingFiles((prev) => [...prev, ...newFiles]);

      // Upload files
      const uploadPromises = validFiles.map((file, index) => {
        const fileIndex = uploadingFiles.length + index;
        return uploadToCloudinary(file, fileIndex);
      });

      try {
        const urls = await Promise.all(uploadPromises);
        setUploadedUrls((prev) => [...prev, ...urls]);

        toast({
          title: 'Upload Successful',
          description: `${urls.length} image(s) uploaded successfully`,
        });

        // Clear uploading files after a delay
        setTimeout(() => {
          setUploadingFiles([]);
        }, 1000);
      } catch (error) {
        console.error('Upload error:', error);
        toast({
          title: 'Upload Failed',
          description: 'Some images failed to upload. Please try again.',
          variant: 'destructive',
        });
      }
    },
    [
      disabled,
      uploadedUrls.length,
      uploadingFiles.length,
      maxFiles,
      acceptedTypes,
      maxSize,
      folder,
      toast,
    ]
  );

  // Setup dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce(
      (acc, type) => ({ ...acc, [type]: [] }),
      {}
    ),
    maxFiles,
    disabled,
    multiple: maxFiles > 1,
  });

  // Remove uploaded image
  const removeImage = (index: number) => {
    setUploadedUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // Remove uploading file
  const removeUploadingFile = (index: number) => {
    setUploadingFiles((prev) => {
      const file = prev[index];
      if (file && file.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  // Retry failed upload
  const retryUpload = async (index: number) => {
    const fileToRetry = uploadingFiles[index];
    if (!fileToRetry) return;

    setUploadingFiles((prev) =>
      prev.map((f, i) =>
        i === index ? { ...f, status: 'uploading', progress: 0, error: undefined } : f
      )
    );

    try {
      const url = await uploadToCloudinary(fileToRetry.file, index);
      setUploadedUrls((prev) => [...prev, url]);

      setTimeout(() => {
        setUploadingFiles((prev) => prev.filter((_, i) => i !== index));
      }, 1000);
    } catch (error) {
      console.error('Retry upload error:', error);
    }
  };

  const canUploadMore =
    uploadedUrls.length + uploadingFiles.length < maxFiles && !disabled;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Dropzone */}
      {canUploadMore && (
        <div
          {...getRootProps()}
          className={cn(
            'relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer',
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-gray-300 hover:border-gray-400',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center text-center space-y-2">
            <Upload className="h-10 w-10 text-gray-400" />
            <div className="text-sm text-gray-600">
              {isDragActive ? (
                <p className="font-medium">Drop images here</p>
              ) : (
                <>
                  <p className="font-medium">
                    Drag & drop images, or{' '}
                    <span className="text-primary">browse</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Max {maxFiles} files • Up to {maxSize}MB each • JPG, PNG, WEBP
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Uploaded Images Grid */}
      {uploadedUrls.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {uploadedUrls.map((url, index) => (
            <div
              key={url}
              className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group"
            >
              <Image
                src={url}
                alt={`Uploaded image ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  aria-label="Remove image"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-3">
          {uploadingFiles.map((file, index) => (
            <div
              key={file.preview}
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg"
            >
              {/* Preview Thumbnail */}
              <div className="relative h-16 w-16 flex-shrink-0 rounded overflow-hidden border border-gray-200">
                {file.preview ? (
                  <Image
                    src={file.preview}
                    alt={file.file.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {file.file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(file.file.size / 1024 / 1024).toFixed(2)} MB
                </p>

                {/* Progress Bar */}
                {file.status === 'uploading' && (
                  <Progress value={file.progress} className="mt-2 h-1" />
                )}

                {/* Error Message */}
                {file.status === 'error' && file.error && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {file.error}
                  </p>
                )}
              </div>

              {/* Status Icon / Actions */}
              <div className="flex-shrink-0">
                {file.status === 'uploading' && (
                  <Loader2 className="h-5 w-5 text-primary animate-spin" />
                )}
                {file.status === 'success' && (
                  <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                    <svg
                      className="h-3 w-3 text-white"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                {file.status === 'error' && (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => retryUpload(index)}
                      className="h-8 px-2"
                    >
                      Retry
                    </Button>
                    <button
                      type="button"
                      onClick={() => removeUploadingFile(index)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      aria-label="Remove"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {uploadedUrls.length === 0 && uploadingFiles.length === 0 && !canUploadMore && (
        <div className="text-center py-8 text-gray-500 text-sm">
          No images uploaded
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
