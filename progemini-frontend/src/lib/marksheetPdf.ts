import { apiClient, saveBlobAsFile } from "./apiClient";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export interface DownloadMarkSheetPdfOptions {
  elementId?: string;
  element?: HTMLElement | null;
  filename?: string;
  marksheetId?: string;
  marksheetData?: {
    studentName: string;
    studentId: string;
    qualification: string;
    mainFieldOfStudy: string;
    level?: string;
    language?: string;
    modeOfStudy?: string;
    programmeLength?: string;
    creditRequirement?: string;
    overallAverage?: string;
    classification?: string;
    totalUkCredits?: number;
    totalEctsCredits?: number;
    issueDate?: string | Date | null;
    modules?: any[];
    encryptedToken?: string | null;
    verificationUrl?: string | null;
  };
}

/**
 * Download Official Mark Sheet as a high-resolution A4 PDF.
 * Uses backend Headless Chrome engine with native CSS printing and vector typography.
 * Falls back to client-side canvas rasterization if backend is unreachable.
 */
export async function downloadMarkSheetPdf(options: DownloadMarkSheetPdfOptions = {}): Promise<void> {
  const {
    elementId = "progemini-official-marksheet",
    element = null,
    filename = "Progemini_Academy_Mark_Sheet.pdf",
    marksheetId,
    marksheetData,
  } = options;

  // 1. Primary: Use Backend Chromium Generation
  try {
    let blob: Blob | null = null;
    if (marksheetData) {
      blob = await apiClient.postBlob("/v1/marksheets/pdf", marksheetData);
    } else if (marksheetId) {
      blob = await apiClient.downloadBlob(`/v1/marksheets/${marksheetId}/pdf`);
    }

    if (blob && blob.size > 1000) {
      saveBlobAsFile(blob, filename);
      return;
    }
  } catch (err) {
    console.warn("Backend PDF generation unavailable, falling back to client-side capture:", err);
  }

  // 2. Fallback: Client-side capture
  const targetElement = element || (document.getElementById(elementId) as HTMLElement | null);
  if (!targetElement) {
    throw new Error(`Mark sheet element #${elementId} not found in DOM`);
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
    windowWidth: 800,
    windowHeight: 1132,
    onclone: (clonedDoc) => {
      const clonedTarget =
        clonedDoc.getElementById(targetElement.id) ||
        clonedDoc.querySelector("#progemini-official-marksheet");

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
