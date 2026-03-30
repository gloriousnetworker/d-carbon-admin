**Project:** dcarbon-webapp
**Branch:** `refactor-fix`
**Server:** `refactor-fix` deployed at `https://api.dev.dcarbon.solutions`
**Priority:** P0 — Go-live blockers

## Context

The admin dashboard now has Agreement Management and Document Configuration pages that write to the server. The server has seeded 6 agreement templates and 12 document types with proper user type mappings. The webapp currently has hardcoded agreements and document lists — these need to be replaced with dynamic API-driven content.

---

## W-AGR-1: Dynamic Agreement Rendering During Registration

### Current state (BROKEN)

The agreement pages use hardcoded text. For example:

**File:** `src/components/commercial/commercial-owner-registration/AgreementForm.jsx`
- Contains 3 hardcoded agreements with Lorem Ipsum placeholder text
- Uses local `checked1`, `checked2`, `checked3` state
- No API call to fetch actual agreement content

**Other agreement files to check:**
- `src/app/(auth)/register/residence-user-registration/agreement/page.jsx`
- Any partner/operator agreement pages
- `src/components/partner/agreements/` directory

### What it should do

1. **On mount**, fetch agreements for the current user's type:
   ```js
   const userType = localStorage.getItem("userType"); // e.g., "RESIDENTIAL", "COMMERCIAL", "PARTNER"
   // Map PARTNER → check partnerType to determine if EPC_PARTNER, SALES_AGENT, or FINANCE_PARTNER
   const response = await axiosInstance.get(`/api/admin/agreement-templates/user-type/${userType}`);
   const agreements = response.data.data || response.data || [];
   ```

2. **Render each agreement** dynamically:
   ```jsx
   {agreements.map((agr) => (
     <div key={agr.id} className="border rounded-lg p-4 mb-4">
       <h3 className="font-semibold text-lg mb-2">{agr.name}</h3>
       <div className="text-sm text-gray-600 whitespace-pre-wrap max-h-60 overflow-y-auto border p-3 rounded bg-gray-50">
         {agr.content}
       </div>
       <label className="flex items-center gap-2 mt-3">
         <input
           type="checkbox"
           checked={checkedAgreements[agr.id] || false}
           onChange={() => toggleAgreement(agr.id)}
           required={!agr.isOptional}
         />
         <span className="text-sm">
           {agr.isOptional ? "I acknowledge this agreement (optional)" : "I agree to the terms above *"}
         </span>
       </label>
     </div>
   ))}
   ```

3. **Block submission** unless all required (non-optional) agreements are checked:
   ```js
   const allRequiredChecked = agreements
     .filter(a => !a.isOptional)
     .every(a => checkedAgreements[a.id]);
   ```

4. **On submit**, call the existing agreement acceptance endpoint as before.

### Server response shape

```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "name": "Information Release Agreement",
      "content": "Full agreement text...",
      "workflow": "SIGNUP",
      "isOptional": false,
      "version": "1.0",
      "status": "PUBLISHED"
    },
    {
      "id": "uuid",
      "name": "Residential Solar REC Generation Agreement",
      "content": "Full agreement text...",
      "workflow": "SIGNUP",
      "isOptional": false,
      "version": "1.0",
      "status": "PUBLISHED"
    }
  ]
}
```

### User type mapping

The webapp stores `userType` as: `RESIDENTIAL`, `COMMERCIAL`, `PARTNER`, `OPERATOR`.
The server expects: `RESIDENTIAL`, `COMMERCIAL`, `OPERATOR`, `EPC_PARTNER`, `FINANCE_PARTNER`, `SALES_AGENT`.

For PARTNER users, map using `partnerType` from localStorage or user data:
- `partnerType === "EPC"` or `"INSTALLER"` → `EPC_PARTNER`
- `partnerType === "SALES_AGENT"` → `SALES_AGENT`
- `partnerType === "FINANCE"` → `FINANCE_PARTNER`
- Default → `EPC_PARTNER`

### Files to modify

Find ALL agreement rendering files — search for:
```bash
grep -r "agreement" src/ --include="*.jsx" -l | grep -i -E "agreement|terms"
```

Each one needs the same pattern: fetch → render → checkbox → validate.

---

## W-DOC-1: Dynamic Document Upload List From Server Config

### Current state (HARDCODED)

Document upload modals (e.g., `UploadFacilityDocumentModal.jsx`, `ResidentialDocumentsModal.jsx`) have hardcoded lists of required documents. When a document type is added or removed in the admin Document Configuration page, the webapp doesn't reflect it.

### What it should do

1. **Fetch document requirements** for the user's type on mount:
   ```js
   const userType = mapUserType(); // Same mapping as agreements
   const response = await axiosInstance.get(`/api/admin/document-configs/type/${userType}`);
   const requiredDocs = response.data.data || response.data || [];
   ```

2. **Apply conditions** client-side. Each doc may have a `conditions` JSON field:
   ```js
   // Example: { "financeType": { "not": "CASH" } }
   const filteredDocs = requiredDocs.filter(doc => {
     if (!doc.conditions) return true;
     for (const [field, rule] of Object.entries(doc.conditions)) {
       const userValue = facilityData[field]; // e.g., facilityData.financeType
       if (typeof rule === 'object' && rule.not !== undefined) {
         if (userValue === rule.not) return false; // Hide this doc
       } else {
         if (userValue !== rule) return false; // Hide if doesn't match
       }
     }
     return true;
   });
   ```

3. **Filter out admin-only docs** (user shouldn't see `adminOnly: true` docs):
   ```js
   const userVisibleDocs = filteredDocs.filter(doc => !doc.adminOnly);
   ```

4. **Render the document list** dynamically instead of hardcoding:
   ```jsx
   {userVisibleDocs.map(doc => (
     <div key={doc.docKey}>
       <label>{doc.docName} {doc.required && <span className="text-red-500">*</span>}</label>
       {doc.downloadable && <a href={templateUrl}>Download Template</a>}
       <input type="file" onChange={(e) => handleFileUpload(doc.docKey, e.target.files[0])} />
     </div>
   ))}
   ```

### Server response shape

```json
[
  {
    "id": "uuid",
    "userType": "RESIDENTIAL",
    "docKey": "installationContract",
    "docName": "Installation Contract",
    "required": true,
    "adminOnly": false,
    "downloadable": false,
    "workflow": "REGISTRATION",
    "conditions": null,
    "sortOrder": 5
  },
  {
    "id": "uuid",
    "userType": "RESIDENTIAL",
    "docKey": "financeAgreement",
    "docName": "Finance Agreement",
    "required": false,
    "adminOnly": false,
    "downloadable": false,
    "workflow": "REGISTRATION",
    "conditions": { "financeType": { "not": "CASH" } },
    "sortOrder": 4
  }
]
```

### Files to modify

Find ALL document upload components:
```bash
grep -r "UploadFacilityDocument\|documentTypes\|docTypes\|REQUIRED_DOCS" src/ --include="*.jsx" -l
```

Each file that has a hardcoded document list needs to be updated to fetch from the API instead.

### Important: backward compatibility

The document `docKey` values in the server config match the existing field names on the facility model (e.g., `financeAgreement` → `facility.financeAgreementUrl`). So the upload logic can use `docKey` to build the correct upload field name.

### Template download links

Some documents have `downloadable: true` and a `templateUrl` field. When rendering these, show a "Download Example" link so users know exactly what format/content is expected:

```jsx
{doc.downloadable && doc.templateUrl && (
  <a
    href={doc.templateUrl}
    target="_blank"
    rel="noopener noreferrer"
    className="text-xs text-[#039994] hover:underline flex items-center gap-1"
  >
    <Download className="h-3 w-3" /> Download Example
  </a>
)}
```

The `templateUrl` is a GCS URL uploaded by the admin through the Document Configuration page. If `templateUrl` is null/empty but `downloadable` is true, just skip the link (the admin hasn't uploaded a template yet).

---

## Execution Order

```
W-AGR-1 (agreements) → W-DOC-1 (document config)
```

W-AGR-1 is simpler and more visible to users. W-DOC-1 is more complex due to conditions logic.

Build-verify after each. Commit and push to `refactor-fix`.
