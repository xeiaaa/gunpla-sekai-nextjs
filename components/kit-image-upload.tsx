"use client"

import { useState, useEffect, useRef } from "react"
import { AlertCircleIcon, ImageIcon, UploadIcon, XIcon, Loader2 } from "lucide-react"
import { useFileUpload } from "@/hooks/use-file-upload"
import { Button } from "@/components/ui/button"
import { KitImageType } from "@/generated/prisma"
import { getUploadSignature, uploadToCloudinary } from "@/lib/upload-client"
import { createUpload, createKitUpload, deleteKitUpload } from "@/lib/actions/uploads"

interface KitImageUploadProps {
  kitId: string;
  initialFiles?: Array<{
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
  }>;
  maxFiles?: number;
  maxSizeMB?: number;
  onUploadComplete?: () => void;
  onFilesChange?: (files: Array<{ id: string; isUploaded: boolean; isUploading: boolean }>) => void;
  onRemovedFilesChange?: (removedFileIds: string[]) => void;
}

export function KitImageUpload({
  kitId,
  initialFiles = [],
  maxFiles = 6,
  maxSizeMB = 5,
  onUploadComplete,
  onFilesChange,
  onRemovedFilesChange
}: KitImageUploadProps) {
  const maxSize = maxSizeMB * 1024 * 1024
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set())
  const [uploadedFiles, setUploadedFiles] = useState<Set<string>>(new Set(initialFiles.map(f => f.id)))
  const [removedFiles, setRemovedFiles] = useState<Set<string>>(new Set())

  // Use ref to avoid dependency issues
  const onRemovedFilesChangeRef = useRef(onRemovedFilesChange)
  onRemovedFilesChangeRef.current = onRemovedFilesChange

  // Notify parent when removed files change
  useEffect(() => {
    if (onRemovedFilesChangeRef.current) {
      console.log('Notifying parent of removed files:', Array.from(removedFiles));
      onRemovedFilesChangeRef.current(Array.from(removedFiles))
    }
  }, [removedFiles])

  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      getInputProps,
    },
  ] = useFileUpload({
    accept: "image/svg+xml,image/png,image/jpeg,image/jpg,image/gif",
    maxSize,
    multiple: true,
    maxFiles,
    initialFiles: initialFiles.map(file => ({
      ...file,
      id: file.id,
    })),
    onFilesAdded: async (newFiles) => {
      // Auto-upload new files
      for (const fileWithPreview of newFiles) {
        if (fileWithPreview.file instanceof File) {
          uploadFile(fileWithPreview.file, fileWithPreview.id)
        }
      }
    },
  })

  const uploadFile = async (file: File, fileId: string) => {
    try {
      // Mark file as uploading
      setUploadingFiles(prev => new Set([...prev, fileId]))

      // Notify parent component about file state changes
      notifyFilesChange()

      // Get upload signature
      const signature = await getUploadSignature("kit-images")

      // Upload to Cloudinary
      const cloudinaryResult = await uploadToCloudinary(file, signature, "kit-images")

      // Create upload record in database
      const upload = await createUpload({
        cloudinaryAssetId: cloudinaryResult.asset_id,
        publicId: cloudinaryResult.public_id,
        url: cloudinaryResult.secure_url,
        eagerUrl: cloudinaryResult.eager?.[0]?.secure_url,
        format: cloudinaryResult.format,
        resourceType: cloudinaryResult.resource_type,
        size: cloudinaryResult.bytes,
        originalFilename: cloudinaryResult.original_filename,
        uploadedAt: new Date(cloudinaryResult.created_at),
        uploadedById: "", // Will be set by the server action
      })

      // Create kit upload relationship
      await createKitUpload({
        kitId,
        uploadId: upload.id,
        type: 'PRODUCT_SHOTS',
        caption: undefined,
        order: files.length,
      })

      // Mark file as uploaded
      setUploadingFiles(prev => {
        const newSet = new Set(prev)
        newSet.delete(fileId)
        return newSet
      })
      setUploadedFiles(prev => new Set([...prev, fileId]))

      // Notify parent component about file state changes
      notifyFilesChange()

      onUploadComplete?.()
    } catch (error) {
      console.error("Error uploading file:", error)
      // Remove the file from the list on error
      removeFile(fileId)
      setUploadingFiles(prev => {
        const newSet = new Set(prev)
        newSet.delete(fileId)
        return newSet
      })
      notifyFilesChange()
    }
  }

  const notifyFilesChange = () => {
    if (onFilesChange) {
      const fileStates = files.map(file => ({
        id: file.id,
        isUploaded: uploadedFiles.has(file.id),
        isUploading: uploadingFiles.has(file.id)
      }))
      onFilesChange(fileStates)
    }
  }

  // Expose removed files to parent component
  const getRemovedFiles = () => {
    return Array.from(removedFiles)
  }

  const handleRemoveFile = (fileId: string) => {
    // Check if this is an existing uploaded file
    const isExistingFile = initialFiles.some(f => f.id === fileId)
    console.log(`Removing file ${fileId}, isExistingFile: ${isExistingFile}`);

    if (isExistingFile) {
      // Mark for removal from database
      setRemovedFiles(prev => {
        const newSet = new Set([...prev, fileId]);
        console.log('Updated removed files set:', Array.from(newSet));
        return newSet;
      })
    }

    // Remove from UI
    removeFile(fileId)

    // Update state
    setUploadedFiles(prev => {
      const newSet = new Set(prev)
      newSet.delete(fileId)
      return newSet
    })
    setUploadingFiles(prev => {
      const newSet = new Set(prev)
      newSet.delete(fileId)
      return newSet
    })

    notifyFilesChange()
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Drop area */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        data-dragging={isDragging || undefined}
        data-files={files.length > 0 || undefined}
        className="border-input data-[dragging=true]:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 relative flex min-h-52 flex-col items-center overflow-hidden rounded-xl border border-dashed p-4 transition-colors not-data-[files]:justify-center has-[input:focus]:ring-[3px]"
      >
        <input
          {...getInputProps()}
          className="sr-only"
          aria-label="Upload image file"
        />
        {files.length > 0 ? (
          <div className="flex w-full flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="truncate text-sm font-medium">
                Uploaded Files ({files.length})
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={openFileDialog}
                disabled={files.length >= maxFiles}
              >
                <UploadIcon
                  className="-ms-0.5 size-3.5 opacity-60"
                  aria-hidden="true"
                />
                Add more
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {files.map((file) => {
                const isUploading = uploadingFiles.has(file.id)
                const isUploaded = uploadedFiles.has(file.id)

                return (
                  <div
                    key={file.id}
                    className="bg-accent relative aspect-square rounded-md"
                  >
                    <img
                      src={file.preview}
                      alt={file.file.name}
                      className="size-full rounded-[inherit] object-cover"
                    />

                    {/* Loading overlay */}
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/50 rounded-[inherit] flex items-center justify-center">
                        <Loader2 className="h-6 w-6 text-white animate-spin" />
                      </div>
                    )}

                    {/* Upload success indicator */}
                    {isUploaded && !isUploading && (
                      <div className="absolute top-2 left-2 bg-green-500 text-white rounded-full p-1">
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}

                    <Button
                      type="button"
                      onClick={() => handleRemoveFile(file.id)}
                      size="icon"
                      className="border-background focus-visible:border-background absolute -top-2 -right-2 size-6 rounded-full border-2 shadow-none"
                      aria-label="Remove image"
                      disabled={isUploading}
                    >
                      <XIcon className="size-3.5" />
                    </Button>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
            <div
              className="bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border"
              aria-hidden="true"
            >
              <ImageIcon className="size-4 opacity-60" />
            </div>
            <p className="mb-1.5 text-sm font-medium">Drop your images here</p>
            <p className="text-muted-foreground text-xs">
              SVG, PNG, JPG or GIF (max. {maxSizeMB}MB)
            </p>
            <Button type="button" variant="outline" className="mt-4" onClick={openFileDialog}>
              <UploadIcon className="-ms-1 opacity-60" aria-hidden="true" />
              Select images
            </Button>
          </div>
        )}
      </div>

      {errors.length > 0 && (
        <div
          className="text-destructive flex items-center gap-1 text-xs"
          role="alert"
        >
          <AlertCircleIcon className="size-3 shrink-0" />
          <span>{errors[0]}</span>
        </div>
      )}
    </div>
  )
}
