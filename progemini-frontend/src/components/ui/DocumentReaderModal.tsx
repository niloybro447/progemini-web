"use client";

import { useEffect, useMemo, useState } from "react";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import { X } from "lucide-react";

export interface DocumentReaderSource {
  url: string;
  fileName: string;
  mimeType?: string | null;
}

interface DocumentReaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  source: DocumentReaderSource | null;
}

function getFileExtension(fileName: string, mimeType?: string | null) {
  const normalizedName = fileName.toLowerCase();
  const directExtension = normalizedName.split(".").pop();

  if (directExtension && directExtension !== normalizedName) {
    return directExtension;
  }

  // Check MIME type for common document formats
  if (mimeType?.includes("pdf")) return "pdf";
  if (mimeType?.includes("msword") || mimeType?.includes("word")) return "doc";
  if (mimeType?.includes("wordprocessingml")) return "docx";
  
  // Check MIME type for image formats (more flexible matching)
  if (mimeType?.startsWith("image/")) {
    if (mimeType.includes("png")) return "png";
    if (mimeType.includes("webp")) return "webp";
    if (mimeType.includes("gif")) return "gif";
    if (mimeType.includes("jpeg") || mimeType.includes("jpg")) return "jpg";
    // Default to jpg for generic image types
    return "jpg";
  }

  // Default to jpg for unknown types (safer than pdf for images)
  return "jpg";
}

function isImageType(fileType: string, mimeType?: string | null) {
  const imageExtensions = ["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg"];
  return mimeType?.startsWith("image/") || imageExtensions.includes(fileType.toLowerCase());
}

function isSameOriginUrl(url: string) {
  if (url.startsWith("/")) {
    return true;
  }

  if (typeof window === "undefined") {
    return false;
  }

  try {
    const parsed = new URL(url, window.location.origin);
    return parsed.origin === window.location.origin;
  } catch {
    return false;
  }
}

export default function DocumentReaderModal({
  isOpen,
  onClose,
  title,
  source,
}: DocumentReaderModalProps) {
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileType = useMemo(() => getFileExtension(source?.fileName || "document", source?.mimeType), [source]);
  const imageType = useMemo(() => isImageType(fileType, source?.mimeType), [fileType, source]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !source) {
      return;
    }

    let revokedUrl: string | null = null;
    let cancelled = false;

    setLoading(true);
    setError(null);

    const loadDocument = async () => {
      try {
        if (isSameOriginUrl(source.url)) {
          const response = await fetch(source.url, { credentials: "include" });
          if (!response.ok) {
            throw new Error(`Failed to load document (${response.status})`);
          }

          const blob = await response.blob();
          const objectUrl = URL.createObjectURL(blob);
          revokedUrl = objectUrl;

          if (!cancelled) {
            setResolvedUrl(objectUrl);
          }
        } else if (!cancelled) {
          setResolvedUrl(source.url);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load document");
          setResolvedUrl(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadDocument();

    return () => {
      cancelled = true;
      if (revokedUrl) {
        URL.revokeObjectURL(revokedUrl);
      }
      setResolvedUrl(null);
    };
  }, [isOpen, source]);

  if (!isOpen || !source) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end bg-stone-950/70 p-0 backdrop-blur-sm md:items-center md:justify-center md:p-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="flex h-[92vh] w-full flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl md:h-[90vh] md:max-w-6xl md:rounded-[28px] relative">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-[100] inline-flex h-10 w-10 items-center justify-center rounded-full bg-white border border-stone-300 text-stone-700 transition hover:bg-stone-100 shadow-md"
          aria-label="Close document reader"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="min-h-0 flex-1 overflow-auto bg-stone-100 p-3 md:p-6">
          {loading ? (
            <div className="flex h-full items-center justify-center rounded-[24px] border border-stone-200 bg-white">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-stone-300 border-t-stone-800" />
            </div>
          ) : error ? (
            <div className="flex h-full flex-col items-center justify-center rounded-[24px] border border-rose-200 bg-rose-50 px-6 text-center">
              <p className="text-base font-semibold text-rose-800">Unable to preview this document</p>
              <p className="mt-2 text-sm text-rose-700">{error}</p>
            </div>
          ) : resolvedUrl ? (
            <div className="mx-auto flex min-h-full w-full items-start justify-center overflow-auto rounded-[24px] border border-stone-200 bg-white p-2 md:p-4">
              <div className="scale-100 w-full min-h-full">
                {imageType ? (
                  <img src={resolvedUrl} alt={source.fileName} className="mx-auto h-auto max-w-full" />
                ) : (
                  <div className="h-[68vh] md:h-[72vh]">
                    <DocViewer
                      documents={[
                        {
                          uri: resolvedUrl,
                          fileName: source.fileName,
                          fileType,
                        },
                      ]}
                      pluginRenderers={DocViewerRenderers}
                      config={{
                        header: {
                          disableHeader: true,
                          disableFileName: true,
                          retainURLParams: false,
                        },
                      }}
                      style={{ height: "100%", width: "100%" }}
                    />
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}