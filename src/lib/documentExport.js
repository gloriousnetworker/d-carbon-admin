import JSZip from "jszip";
import { saveAs } from "file-saver";
import CONFIG from "@/lib/config";

/**
 * Fetches a file from a URL and returns it as a Blob.
 * Routes GCS URLs through the server proxy to avoid CORS issues.
 */
async function fetchBlob(url) {
  const authToken = localStorage.getItem("authToken");

  // Strategy 1: Proxy through server for GCS URLs (avoids CORS)
  if (url.startsWith("https://storage.googleapis.com/") && authToken) {
    const proxyUrl = `${CONFIG.API_BASE_URL}/api/admin/proxy-document?url=${encodeURIComponent(url)}`;
    const res = await fetch(proxyUrl, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    if (res.ok) return res.blob();
    // If proxy fails, fall through to direct fetch
  }

  // Strategy 2: Direct fetch (works if CORS is configured)
  const res = await fetch(url);
  if (res.ok) return res.blob();

  throw new Error(`Failed to fetch document`);
}

/**
 * Determines file extension from a URL.
 */
function getExtension(url) {
  if (!url) return "";
  const path = url.split("?")[0]; // strip query params
  const ext = path.split(".").pop().toLowerCase();
  return ext.length <= 5 ? ext : "";
}

/**
 * Sanitize a string for use as a filename.
 */
function sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9_\-. ]/g, "_").replace(/\s+/g, "_");
}

/**
 * Export all facility documents as a ZIP package.
 *
 * @param {Object[]} documents - Array of { name, url, status, type }
 * @param {Object} facilityInfo - { facilityName, address, id, ownerName }
 * @param {Function} [onProgress] - Optional callback (completed, total) for progress
 * @returns {Promise<{ success: number, failed: number, skipped: number }>}
 */
export async function exportDocumentPackage(documents, facilityInfo, onProgress) {
  const zip = new JSZip();
  const docsFolder = zip.folder("documents");

  // Filter to documents that have a URL (uploaded)
  const uploadedDocs = documents.filter((d) => d.url);
  const skipped = documents.length - uploadedDocs.length;

  let success = 0;
  let failed = 0;

  // Generate a checklist text file
  const checklistLines = [
    `WREGIS Document Checklist — ${facilityInfo.facilityName || "Facility"}`,
    `Address: ${facilityInfo.address || "N/A"}`,
    `Facility ID: ${facilityInfo.id || "N/A"}`,
    `Owner: ${facilityInfo.ownerName || "N/A"}`,
    `Export Date: ${new Date().toLocaleDateString("en-US")}`,
    "",
    "Document".padEnd(45) + "Status".padEnd(14) + "Included",
    "-".repeat(70),
  ];

  for (let i = 0; i < documents.length; i++) {
    const doc = documents[i];
    const included = doc.url ? "Yes" : "No";
    checklistLines.push(
      (doc.name || "Unknown").padEnd(45) +
        (doc.status || "REQUIRED").padEnd(14) +
        included
    );
  }

  zip.file("WREGIS_Document_Checklist.txt", checklistLines.join("\n"));

  // Download each document and add to ZIP
  for (let i = 0; i < uploadedDocs.length; i++) {
    const doc = uploadedDocs[i];
    const ext = getExtension(doc.url);
    const idx = String(i + 1).padStart(2, "0");
    const safeName = sanitizeFilename(doc.name);
    const filename = ext ? `${idx}_${safeName}.${ext}` : `${idx}_${safeName}`;

    try {
      const blob = await fetchBlob(doc.url);
      docsFolder.file(filename, blob);
      success++;
    } catch {
      // Add a placeholder text file for failed downloads
      docsFolder.file(
        `${idx}_${safeName}_DOWNLOAD_FAILED.txt`,
        `Failed to download: ${doc.name}\nURL: ${doc.url}\n\nPlease download this document manually.`
      );
      failed++;
    }

    if (onProgress) onProgress(i + 1, uploadedDocs.length);
  }

  // If all downloads failed (likely CORS), offer individual downloads instead
  if (failed === uploadedDocs.length && uploadedDocs.length > 0) {
    return { success: 0, failed, skipped, corsFallback: true };
  }

  // Generate and save ZIP
  const facilitySlug = sanitizeFilename(
    facilityInfo.facilityName || facilityInfo.id || "facility"
  );
  const zipBlob = await zip.generateAsync({ type: "blob" });
  saveAs(zipBlob, `${facilitySlug}_documents.zip`);

  return { success, failed, skipped, corsFallback: false };
}

/**
 * Fallback: open each document URL in a new tab for individual download.
 * Used when CORS blocks the ZIP packaging approach.
 */
export function downloadDocumentsIndividually(documents) {
  const uploadedDocs = documents.filter((d) => d.url);
  let opened = 0;
  for (const doc of uploadedDocs) {
    window.open(doc.url, "_blank");
    opened++;
  }
  return opened;
}
