import JSZip from "jszip";
import { saveAs } from "file-saver";

/**
 * Fetches a file from a URL and returns it as a Blob.
 * Falls back to a proxy approach if direct fetch fails due to CORS.
 */
async function fetchBlob(url) {
  const res = await fetch(url, { mode: "cors" });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.blob();
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

  // Generate and save ZIP
  const facilitySlug = sanitizeFilename(
    facilityInfo.facilityName || facilityInfo.id || "facility"
  );
  const zipBlob = await zip.generateAsync({ type: "blob" });
  saveAs(zipBlob, `${facilitySlug}_documents.zip`);

  return { success, failed, skipped };
}
