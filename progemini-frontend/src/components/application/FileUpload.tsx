'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, File, X, CheckCircle, AlertCircle, Eye, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getFileUrl } from '@/lib/utils';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export type FileType = 
  | 'ADMISSION_DOCUMENT'
  | 'PROFILE_PICTURE'
  | 'TRANSCRIPT'
  | 'CERTIFICATE'
  | 'RECOMMENDATION_LETTER'
  | 'OTHER';

interface UploadedFile {
  id: string;
  originalName: string;
  fileSize: number;
  fileType: FileType;
  mimeType: string;
  fullUrl: string;
  uploadedAt: string;
  isTemporary: boolean;
}

interface FileUploadProps {
  fileType: FileType;
  applicationId?: string;
  maxFiles?: number;
  maxSizePerFile?: number; // in bytes
  acceptedMimeTypes?: string[];
  onFilesChange?: (files: UploadedFile[]) => void;
  initialFiles?: UploadedFile[];
  className?: string;
}

const DEFAULT_MAX_SIZE = 5 * 1024 * 1024; // 5MB
const DEFAULT_ACCEPTED_TYPES = {
  ADMISSION_DOCUMENT: ['application/pdf', 'application/zip', 'application/x-zip-compressed', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'],
  PROFILE_PICTURE: ['image/jpeg', 'image/png', 'image/webp'],
  TRANSCRIPT: ['application/pdf'],
  CERTIFICATE: ['application/pdf', 'image/jpeg', 'image/png'],
  RECOMMENDATION_LETTER: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  OTHER: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'],
};

export const FileUpload: React.FC<FileUploadProps> = ({
  fileType,
  applicationId,
  maxFiles = 5,
  maxSizePerFile = DEFAULT_MAX_SIZE,
  acceptedMimeTypes = DEFAULT_ACCEPTED_TYPES[fileType],
  onFilesChange,
  initialFiles = [],
  className = '',
}) => {
  const [files, setFiles] = useState<UploadedFile[]>(initialFiles);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);

  // Only sync with initialFiles if it's truly changed and non-empty
  useEffect(() => {
    if (initialFiles.length > 0 && JSON.stringify(initialFiles) !== JSON.stringify(files)) {
      console.log("Syncing with initialFiles:", initialFiles.length);
      setFiles(initialFiles);
    }
  }, [initialFiles]);

  // Call onFilesChange when files change, but use ref to avoid dependency issues
  const onFilesChangeRef = React.useRef(onFilesChange);
  useEffect(() => {
    onFilesChangeRef.current = onFilesChange;
  }, [onFilesChange]);

  useEffect(() => {
    console.log("Files state changed, notifying parent. Count:", files.length);
    onFilesChangeRef.current?.(files);
  }, [files]);

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileType', fileType);
    if (applicationId) {
      formData.append('applicationId', applicationId);
    } else {
      // Mark as temporary if no application ID yet
      formData.append('isTemporary', 'true');
    }

    return new Promise<UploadedFile>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(prev => ({ ...prev, [file.name]: progress }));
        }
      });

      xhr.onload = () => {
        if (xhr.status === 200 || xhr.status === 201) {
          try {
            const response = JSON.parse(xhr.responseText);
            setUploadProgress(prev => {
              const newProgress = { ...prev };
              delete newProgress[file.name];
              return newProgress;
            });
            const fileObj = response.data || response.file || response;
            if (fileObj) {
              resolve(fileObj);
            } else {
              reject(new Error('Invalid response format: no file data'));
            }
          } catch (parseError: any) {
            reject(new Error(`Failed to parse response: ${parseError.message}`));
          }
        } else {
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            reject(new Error(errorResponse.error || `Upload failed with status ${xhr.status}`));
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network error during upload'));
      };

      xhr.open('POST', `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api'}/v1/files`);
      xhr.send(formData);
    });
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    console.log("=== File Drop Started ===");
    console.log("Accepted files:", acceptedFiles.length);
    console.log("Current files in state:", files.length);
    
    if (files.length + acceptedFiles.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setUploading(true);
    const promises = acceptedFiles.map(async (file) => {
      try {
        if (file.size > maxSizePerFile) {
          throw new Error(`File ${file.name} is too large. Maximum size: ${Math.round(maxSizePerFile / (1024 * 1024))}MB`);
        }
        
        if (!acceptedMimeTypes.includes(file.type)) {
          throw new Error(`File type ${file.type} not supported`);
        }

        console.log(`Uploading file: ${file.name}`);
        const uploadedFile = await uploadFile(file);
        console.log(`File uploaded successfully:`, uploadedFile.id);
        toast.success(`${file.name} uploaded successfully`);
        return uploadedFile;
      } catch (error) {
        console.error(`Upload failed for ${file.name}:`, error);
        toast.error(error instanceof Error ? error.message : 'Upload failed');
        return null;
      }
    });

    const results = await Promise.all(promises);
    const successfulUploads = results.filter((file): file is UploadedFile => file !== null);
    
    console.log("Successful uploads:", successfulUploads.length);
    console.log("Adding files to state...");
    setFiles(prev => {
      const newFiles = [...prev, ...successfulUploads];
      console.log("New files state:", newFiles.length);
      return newFiles;
    });
    setUploading(false);
    console.log("=== File Drop Completed ===");
  }, [files.length, maxFiles, maxSizePerFile, acceptedMimeTypes, fileType, applicationId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedMimeTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize: maxSizePerFile,
    disabled: uploading || files.length >= maxFiles,
  });

  // Download a file directly to the browser using a blob URL
  // (needed because MinIO presigned URLs are cross-origin, so <a download> alone won't work)
  const downloadFile = async (file: UploadedFile) => {
    try {
      // Get a fresh presigned URL
      const res = await fetch(`${API_BASE}/api/v1/files/${file.id}`);
      if (!res.ok) throw new Error('Failed to get file URL');
      const data = await res.json();

      // Fetch the actual file bytes
      const fileRes = await fetch(data.downloadUrl);
      if (!fileRes.ok) throw new Error('Failed to fetch file');
      const blob = await fileRes.blob();

      // Trigger browser download
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = file.originalName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file');
    }
  };

  const removeFile = async (fileId: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/files/${fileId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete file');
      }

      setFiles(prev => prev.filter(f => f.id !== fileId));
      toast.success('File deleted successfully');
    } catch (error) {
      toast.error('Failed to delete file');
      console.error('Delete error:', error);
    }
  };

  const previewFileHandler = (file: UploadedFile) => {
    setPreviewFile(file);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeLabel = (type: FileType) => {
    const labels: Record<FileType, string> = {
      ADMISSION_DOCUMENT: 'Admission Document',
      PROFILE_PICTURE: 'Profile Picture',
      TRANSCRIPT: 'Academic Transcript',
      CERTIFICATE: 'Certificate',
      RECOMMENDATION_LETTER: 'Recommendation Letter',
      OTHER: 'Other Document',
    };
    return labels[type];
  };

  return (
    <div className={`file-upload-container ${className}`}>
      {/* Upload Area: pass onKeyDown into getRootProps so it is properly merged.
          stopPropagation prevents Enter/Space from bubbling to a parent form. */}
      <div
        {...getRootProps({
          onKeyDown: (e: React.KeyboardEvent) => e.stopPropagation(),
        })}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${uploading || files.length >= maxFiles ? 'cursor-not-allowed opacity-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        
        {isDragActive ? (
          <p className="text-blue-600">Drop files here...</p>
        ) : (
          <div>
            <p className="text-lg font-medium text-gray-900 mb-2">
              Upload {getFileTypeLabel(fileType)}
            </p>
            <p className="text-sm text-gray-500 mb-2">
              Drag and drop files here, or click to browse
            </p>
            <p className="text-xs text-gray-400">
              Max {maxFiles} files, up to {Math.round(maxSizePerFile / (1024 * 1024))}MB each
            </p>
            <p className="text-xs text-gray-400">
              Supported formats: {acceptedMimeTypes.map(type => type.split('/')[1]).join(', ')}
            </p>
          </div>
        )}
      </div>

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="mt-4 space-y-2">
          {Object.entries(uploadProgress).map(([fileName, progress]) => (
            <div key={fileName} className="p-3 border rounded-lg bg-gray-50">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700 truncate">{fileName}</span>
                <span className="text-sm text-gray-500">{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          ))}
        </div>
      )}

      {/* Uploaded Files List */}
      {files.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Uploaded Files ({files.length}/{maxFiles})
          </h4>
          <div className="space-y-2">
            {files.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                <div className="flex items-center space-x-3">
                  <File className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                      {file.originalName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.fileSize)} • {file.isTemporary ? 'Temporary' : 'Saved'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {file.isTemporary ? (
                    <span title="Temporary file">
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                    </span>
                  ) : (
                    <span title="Saved">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </span>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    title="Preview"
                    onClick={() => previewFileHandler(file)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    title="Download"
                    onClick={() => downloadFile(file)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    title="Delete"
                    onClick={() => removeFile(file.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-lg font-medium">{previewFile.originalName}</h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setPreviewFile(null)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-4">
              {previewFile.mimeType.startsWith('image/') ? (
                <img
                  src={getFileUrl(previewFile.fullUrl)}
                  alt={previewFile.originalName}
                  className="max-w-full h-auto mx-auto"
                />
              ) : (
                <div className="text-center p-8">
                  <File className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    Preview not available for this file type
                  </p>
                  <Button type="button" onClick={() => downloadFile(previewFile)}>
                    Download File
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;