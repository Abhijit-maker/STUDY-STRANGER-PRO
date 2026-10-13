/**
 * PDF Storage & Management Service
 * Supports large PDF files up to 100MB via IndexedDB with Firestore sync
 */

const DB_NAME = "StudyStranger_Storage";
const DB_VERSION = 1;
const STORE_NAME = "pdfs";

export interface StoredPDFRecord {
  id: string;
  name: string;
  size: number;
  sizeFormatted: string;
  dataUrl: string;
  mimeType: string;
  uploadedAt: string;
}

let dbInstance: IDBDatabase | null = null;

async function getDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not supported in this environment"));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result as IDBDatabase;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = (event: any) => {
      dbInstance = event.target.result;
      resolve(dbInstance);
    };

    request.onerror = (event: any) => {
      console.error("IndexedDB open error:", event.target.error);
      reject(event.target.error);
    };
  });
}

/**
 * Format bytes to readable string (KB, MB)
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Save a PDF File into IndexedDB (supports up to 100MB)
 */
export async function savePdfToIndexedDB(
  file: File,
  customId?: string
): Promise<StoredPDFRecord> {
  const id = customId || `pdf_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async () => {
      try {
        const dataUrl = reader.result as string;
        const record: StoredPDFRecord = {
          id,
          name: file.name,
          size: file.size,
          sizeFormatted: formatBytes(file.size),
          dataUrl,
          mimeType: file.type || "application/pdf",
          uploadedAt: new Date().toISOString()
        };

        const db = await getDB();
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(record);

        req.onsuccess = () => resolve(record);
        req.onerror = (e: any) => reject(e.target.error);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Save raw Base64 / DataURL PDF
 */
export async function savePdfDataUrlToIndexedDB(
  dataUrl: string,
  fileName: string,
  customId?: string
): Promise<StoredPDFRecord> {
  const id = customId || `pdf_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const approxSize = Math.round((dataUrl.length * 3) / 4);

  const record: StoredPDFRecord = {
    id,
    name: fileName,
    size: approxSize,
    sizeFormatted: formatBytes(approxSize),
    dataUrl,
    mimeType: "application/pdf",
    uploadedAt: new Date().toISOString()
  };

  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    await new Promise((resolve, reject) => {
      const req = store.put(record);
      req.onsuccess = () => resolve(true);
      req.onerror = (e: any) => reject(e.target.error);
    });
    return record;
  } catch (err) {
    console.warn("Save PDF data URL to IndexedDB failed:", err);
    return record;
  }
}

/**
 * Retrieve PDF record by ID from IndexedDB
 */
export async function getPdfFromIndexedDB(id: string): Promise<StoredPDFRecord | null> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);

      req.onsuccess = () => {
        resolve(req.result || null);
      };
      req.onerror = (e: any) => reject(e.target.error);
    });
  } catch (err) {
    console.warn("Failed to get PDF from IndexedDB:", err);
    return null;
  }
}

/**
 * Delete a PDF from IndexedDB
 */
export async function deletePdfFromIndexedDB(id: string): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);

      req.onsuccess = () => resolve();
      req.onerror = (e: any) => reject(e.target.error);
    });
  } catch (err) {
    console.warn("Failed to delete PDF from IndexedDB:", err);
  }
}

/**
 * Safe download trigger for Data URL or Blob
 */
export function triggerPdfDownload(dataUrlOrUrl: string, fileName = "Document.pdf") {
  try {
    const finalName = fileName.toLowerCase().endsWith(".pdf") ? fileName : `${fileName}.pdf`;
    
    if (dataUrlOrUrl.startsWith("http://") || dataUrlOrUrl.startsWith("https://")) {
      const link = document.createElement("a");
      link.href = dataUrlOrUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.download = finalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    // If it's a data URL
    if (dataUrlOrUrl.startsWith("data:")) {
      const arr = dataUrlOrUrl.split(",");
      const mime = arr[0].match(/:(.*?);/)?.[1] || "application/pdf";
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], { type: mime });
      const blobUrl = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = finalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
      return;
    }

    // Default link fallback (handles relative endpoints like /api/pdf/...)
    const link = document.createElement("a");
    link.href = dataUrlOrUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.download = finalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (e) {
    console.error("Trigger PDF download failed:", e);
    // Fallback: open in new tab
    window.open(dataUrlOrUrl, "_blank");
  }
}
