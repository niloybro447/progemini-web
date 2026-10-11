import { apiClient, saveBlobAsFile } from "./apiClient";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export interface DownloadPdfOptions {
  elementId?: string;
  element?: HTMLElement | null;
  filename?: string;
  certificateId?: string;
  certificateData?: {
    studentName: string;
    courseTitle: string;
    grade?: string | null;
    issueDate?: string | Date | null;
    learningHours?: string | null;
    studentId?: string | null;
    certificateId?: string | null;
    encryptedToken?: string | null;
    verificationUrl?: string | null;
  };
}

/**
 * Download Certificate of Completion as a high-resolution A4 PDF.
 * Uses backend Headless Chrome engine for pristine vector text, exact borders, and uncompromised spacing.
 * Falls back to client-side canvas capture if backend is unreachable.
 */
export async function downloadCertificatePdf(options: DownloadPdfOptions = {}): Promise<void> {
  const {
    elementId = "progemini-official-certificate",
    element = null,
    filename = "Progemini_Academy_Certificate.pdf",
    certificateId,
    certificateData,
  } = options;

  // 1. Primary: Use Backend Chromium Generation
  try {
    let blob: Blob | null = null;
    if (certificateData) {
      blob = await apiClient.postBlob("/v1/certificates/pdf", certificateData);
    } else if (certificateId) {
      blob = await apiClient.downloadBlob(`/v1/certificates/${certificateId}/pdf`);
    }

    if (blob && blob.size > 1000) {
      saveBlobAsFile(blob, filename);
      return;
    }
  } catch (err) {
    console.warn("Backend certificate PDF generation unavailable, falling back to client capture:", err);
  }

  // 2. Fallback: Client-side capture
  const targetElement = element || (document.getElementById(elementId) as HTMLElement | null);

  if (!targetElement) {
    throw new Error(`Certificate element #${elementId} not found in DOM`);
  }

  if (typeof document !== "undefined" && document.fonts) {
    try {
      await document.fonts.ready;
    } catch {}
  }

  const canvas = await html2canvas(targetElement, {
    scale: 2.5,
    useCORS: true,
    allowTaint: true,
    backgroundColor: "#ffffff",
    logging: false,
    imageTimeout: 15000,
    scrollX: 0,
    scrollY: 0,
    onclone: (clonedDoc) => {
      const clonedTarget =
        clonedDoc.getElementById(targetElement.id) ||
        clonedDoc.querySelector("#progemini-official-certificate");

      if (clonedTarget instanceof HTMLElement) {
        clonedTarget.style.width = "800px";
        clonedTarget.style.minWidth = "800px";
        clonedTarget.style.maxWidth = "800px";
        clonedTarget.style.height = "1131.4px";
        clonedTarget.style.minHeight = "1131.4px";
        clonedTarget.style.maxHeight = "1131.4px";
        clonedTarget.style.aspectRatio = "800 / 1131.42";
        clonedTarget.style.boxShadow = "none";
        clonedTarget.style.margin = "0";
        clonedTarget.style.transform = "none";

        const certStatement =
          clonedTarget.querySelector<HTMLElement>(".cert-statement") ||
          clonedTarget.querySelector<HTMLElement>("#cert-coursework-statement");
        if (certStatement) {
          certStatement.style.fontSize = "20px";
        }

        const parent = clonedTarget.parentElement;
        if (parent) {
          parent.style.padding = "0";
          parent.style.margin = "0";
          parent.style.background = "#ffffff";
        }
      }
    },
  });

  const imgData = canvas.toDataURL("image/png", 1.0);
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  pdf.addImage(imgData, "PNG", 0, 0, 210, 297, undefined, "FAST");
  pdf.save(filename);
}
