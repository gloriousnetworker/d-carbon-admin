# Backend Endpoints Needed — Admin Portal

Two report endpoints are required to complete the **Reporting** section of the admin portal. Both are read-only, admin-authenticated, and should return paginated or full dataset responses.

---

## 1. WREGIS Generation Report

### Background
WREGIS (Western Renewable Energy Generation Information System) is the official US registry for Renewable Energy Certificates (RECs) in the western electricity grid. Every time a registered generator produces 1 MWh of electricity, it earns 1 WREGIS-certified REC. D-Carbon must periodically submit generation records to WREGIS to officially certify the RECs before they can be sold.

The WREGIS Generation Report gives the admin a view of what has been or should be submitted to WREGIS — essentially a compliance and audit report that rolls up per-generator energy generation data into the format WREGIS expects.

### What the endpoint should return

**Method:** `GET`
**Path:** `/api/admin/wregis-report` (or `/api/admin/reports/wregis`)
**Auth:** Admin Bearer token required
**Query params:** `page`, `limit`, optional `startDate` / `endDate` / `generatorId`

**Response shape:**
```json
{
  "status": "success",
  "data": {
    "records": [
      {
        "generatorId": "GEN-001",
        "reportingUnitId": "RU-001",
        "vintage": "2024",
        "startDate": "2024-01-01",
        "endDate": "2024-12-31",
        "totalMWh": "150.000",
        "facilityName": "Smith Residence",
        "utilityProvider": "Pacific Gas & Electric",
        "state": "CA",
        "submittedToWregis": true,
        "wregisSubmissionDate": "2025-01-15T00:00:00.000Z"
      }
    ],
    "metadata": {
      "total": 120,
      "page": 1,
      "limit": 50,
      "totalPages": 3,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### Key fields explained

| Field | Source | Notes |
|---|---|---|
| `generatorId` | Facility's WREGIS registration ID | Assigned when facility registers with WREGIS |
| `reportingUnitId` | WREGIS reporting unit | A generator may have multiple reporting units |
| `vintage` | Year of energy generation | RECs are vintage-locked to the year generated |
| `startDate` / `endDate` | Billing period start/end | Typically quarterly or monthly |
| `totalMWh` | Sum of `intervalKWh / 1000` from meter records | Aggregated from `meter_records` table |
| `facilityName` | From `commercial_facility.facilityName` or `residential_facility.address` | The physical location |
| `submittedToWregis` | Boolean — has this record been officially filed | Used for compliance tracking |
| `wregisSubmissionDate` | Timestamp of WREGIS submission | Null if not yet submitted |

### Implementation notes
- The source data lives in the `meter_records` table (same as `/api/admin/meter-records/commercial` and `/api/admin/meter-records/residential`)
- Aggregate by: `generatorId` + `vintage` + period (quarter or year)
- Sum `intervalKWh` values and convert to MWh (`/ 1000`)
- The `generatorId` and `reportingUnitId` fields need to be stored on the facility record (if not already — this may require a schema addition)
- Filter: optionally by date range and generatorId
- If a `submittedToWregis` flag doesn't exist yet on the model, a simple boolean field on the meter_record or a separate `wregis_submissions` table can track this

---

## 2. Partner Performance Report

### Background
Partners (SALES_AGENT, INSTALLER, PARTNER, FINANCE_COMPANY) bring customers into the D-Carbon platform. The Partner Performance report shows the admin how productive each partner is — how many customers they recruited, how much energy their customer base generated, how many RECs were sold, and how much they have earned in commissions.

This report is used to:
- Evaluate and rank partners
- Cross-verify commission payout amounts
- Identify underperforming or top-performing partners

### What the endpoint should return

**Method:** `GET`
**Path:** `/api/admin/partner-performance` (or `/api/admin/reports/partner-performance`)
**Auth:** Admin Bearer token required
**Query params:** `page`, `limit`, optional `partnerId` / `partnerType` / `startDate` / `endDate`

**Response shape:**
```json
{
  "status": "success",
  "data": {
    "records": [
      {
        "partnerId": "uuid-here",
        "partnerName": "John Partner",
        "partnerEmail": "john@example.com",
        "partnerType": "SALES_AGENT",
        "referralCode": "ABC123",
        "activeCommercialGenerators": 5,
        "activeResidentialGenerators": 25,
        "totalCommercialGenerationMWh": 150.42,
        "totalResidentialGenerationMWh": 12.85,
        "totalRecsSold": 1200,
        "totalCommissionEarned": 14400.00,
        "pendingCommissionPayout": 2400.00,
        "joinedDate": "2024-06-01T00:00:00.000Z"
      }
    ],
    "metadata": {
      "total": 42,
      "page": 1,
      "limit": 50,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

### Key fields explained

| Field | Source | Notes |
|---|---|---|
| `partnerId` | `users.id` where `userType IN ('PARTNER','SALES_AGENT','INSTALLER','FINANCE_COMPANY')` | |
| `partnerName` | `users.firstName + users.lastName` | |
| `partnerType` | `users.partnerType` | SALES_AGENT, INSTALLER, etc. |
| `referralCode` | `users.referralCode` | Used to link referred customers |
| `activeCommercialGenerators` | Count of commercial facilities whose owner was referred by this partner, where `facility.status = 'ACTIVE'` | Join: users → referrals → commercial_facility |
| `activeResidentialGenerators` | Count of residential facilities in same condition | Join: users → referrals → residential_facility |
| `totalCommercialGenerationMWh` | Sum of `meter_records.intervalKWh / 1000` for all active commercial facilities belonging to this partner's referrals | |
| `totalResidentialGenerationMWh` | Same for residential | |
| `totalRecsSold` | Sum of RECs sold from their customers' generation | Depends on how REC sales are tracked |
| `totalCommissionEarned` | Sum of approved/paid commission payouts for this partner | From `payout_requests` or commission table |
| `pendingCommissionPayout` | Sum of PENDING payout requests for this partner | Used to show what's owed |

### Join logic (SQL concept)
```
partners = users WHERE userType IN (PARTNER, SALES_AGENT, INSTALLER, FINANCE_COMPANY)

For each partner:
  referred_users = referrals WHERE inviterId = partner.id AND status = 'ACCEPTED'

  commercial_count = COUNT(commercial_facility)
    WHERE commercial_facility.userId IN (referred_users.inviteeEmail → user lookup)
    AND facility.status = 'ACTIVE'

  residential_count = COUNT(residential_facility) same logic

  total_mwh = SUM(meter_records.intervalKWh / 1000)
    WHERE meter_record.facilityId IN (above facility IDs)

  commission = SUM(payout_request.amountRequested)
    WHERE payout_request.userId = partner.id AND payout_request.status = 'PAID'
```

### Implementation notes
- The `referrals` table links partners to the customers they invited (via `inviterId` = partner's user ID)
- Partners are identified by `userType` ∈ {PARTNER, SALES_AGENT, INSTALLER, FINANCE_COMPANY}
- Date filtering (startDate/endDate) should filter on `meter_records.intervalStart` for generation aggregation
- This will likely be a heavy aggregation query — recommend caching or a materialized view for production
- If commission tracking is in a separate table, adapt the `totalCommissionEarned` join accordingly

---

## Summary

| Endpoint | Priority | Data Source |
|---|---|---|
| `GET /api/admin/wregis-report` | Medium — compliance/audit | meter_records + facility table (needs `generatorId`/`reportingUnitId` fields) |
| `GET /api/admin/partner-performance` | High — used for commission auditing | users + referrals + commercial/residential_facility + meter_records + payout_requests |
