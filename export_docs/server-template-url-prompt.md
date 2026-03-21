**Project:** dcarbon-server
**Branch:** `phillip-fix3`
**Priority:** MEDIUM — enhances document configuration

## Add `templateUrl` field to DocumentConfig model

### Schema change

In `prisma/schema.prisma`, add `templateUrl` to the `DocumentConfig` model:

```prisma
model DocumentConfig {
  // ... existing fields ...
  templateUrl  String?   // URL to example/template document uploaded by admin
  // ... rest of fields ...
}
```

### Migration

```bash
npx prisma migrate dev --name add_template_url_to_document_config
```

### Service changes

In the document config service (wherever `create` and `update` are handled):
- Accept `templateUrl` as an optional field in create/update
- Return `templateUrl` in all GET responses (it's already included if using `findMany()` without explicit `select`)

No new endpoints needed — the admin uploads the file via the existing `POST /api/file-storage/upload/:prefer_file_name` endpoint, gets back a URL, and saves it to the DocumentConfig via the existing `PUT /api/admin/document-configs/:id`.

### What the admin does

1. Admin opens Document Configuration → expands a doc type → checks "Downloadable Template"
2. An upload area appears → admin uploads a PDF/image example
3. The file goes to `POST /api/file-storage/upload/template-{docKey}` → returns a GCS URL
4. Admin clicks "Save Changes" → `PUT /api/admin/document-configs/:id` with `templateUrl: "https://storage.googleapis.com/..."`

### What the webapp uses

When fetching `GET /api/admin/document-configs/type/:userType`, each doc with `downloadable: true` and `templateUrl` set will show a "Download Example" link to the user during registration.

Build and push to `phillip-fix3`.
