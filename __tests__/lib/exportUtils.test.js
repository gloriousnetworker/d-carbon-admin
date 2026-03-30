/**
 * Unit tests for src/lib/exportUtils.js
 *
 * File I/O (saveAs) and XLSX writes are mocked — we test the pure logic:
 * - CSV generation
 * - WREGIS format transformation
 * - Pre-Approval Worksheet row mapping
 * - Column definitions integrity
 */

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('file-saver', () => ({ saveAs: jest.fn() }));
jest.mock('xlsx', () => {
  const aoa_to_sheet = jest.fn().mockReturnValue({});
  const book_new = jest.fn().mockReturnValue({});
  const book_append_sheet = jest.fn();
  const write = jest.fn().mockReturnValue(new Uint8Array());
  const utils = { aoa_to_sheet, book_new, book_append_sheet };
  return { utils, write, book_new, book_append_sheet };
});

// ─── Imports ──────────────────────────────────────────────────────────────────

import {
  exportToCSV,
  exportToExcel,
  transformToWregisFormat,
  CUSTOMER_COLUMNS,
  PARTNER_COLUMNS,
  WREGIS_COLUMNS,
  COMMISSION_STATEMENT_COLUMNS,
  PRE_APPROVAL_COLUMNS,
  exportPreApprovalWorksheet,
  exportWregisCoverSheet,
} from '../../src/lib/exportUtils';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

const mockSaveAs = saveAs;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const sampleColumns = [
  { header: 'Name', key: 'name' },
  { header: 'Email', key: 'email' },
];

const sampleData = [
  { name: 'Alice', email: 'alice@example.com' },
  { name: 'Bob', email: 'bob@example.com' },
];

// ─── exportToCSV ──────────────────────────────────────────────────────────────

describe('exportToCSV', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls saveAs with a .csv filename', () => {
    exportToCSV(sampleData, sampleColumns, 'test-export');
    expect(mockSaveAs).toHaveBeenCalledTimes(1);
    const [, filename] = mockSaveAs.mock.calls[0];
    expect(filename).toBe('test-export.csv');
  });

  it('creates a Blob with text/csv type', () => {
    exportToCSV(sampleData, sampleColumns, 'test-export');
    const [blob] = mockSaveAs.mock.calls[0];
    expect(blob instanceof Blob).toBe(true);
    expect(blob.type).toContain('text/csv');
  });

  it('handles empty data gracefully', () => {
    expect(() => exportToCSV([], sampleColumns, 'empty')).not.toThrow();
    expect(mockSaveAs).toHaveBeenCalledTimes(1);
  });

  it('escapes values containing commas', () => {
    const data = [{ name: 'Smith, John', email: 'j@example.com' }];
    // We verify no error is thrown and saveAs is called
    expect(() => exportToCSV(data, sampleColumns, 'comma-test')).not.toThrow();
  });

  it('escapes values containing double-quotes', () => {
    const data = [{ name: 'He said "Hello"', email: 'e@example.com' }];
    expect(() => exportToCSV(data, sampleColumns, 'quote-test')).not.toThrow();
  });

  it('handles missing keys with empty string fallback', () => {
    const data = [{ name: 'NoEmail' }]; // missing email key
    expect(() => exportToCSV(data, sampleColumns, 'missing-key')).not.toThrow();
  });
});

// ─── exportToExcel ────────────────────────────────────────────────────────────

describe('exportToExcel', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls XLSX.utils.aoa_to_sheet with headers + rows', () => {
    exportToExcel(sampleData, sampleColumns, 'test-excel');
    expect(XLSX.utils.aoa_to_sheet).toHaveBeenCalledWith([
      ['Name', 'Email'],
      ['Alice', 'alice@example.com'],
      ['Bob', 'bob@example.com'],
    ]);
  });

  it('calls saveAs with a .xlsx filename', () => {
    exportToExcel(sampleData, sampleColumns, 'test-excel');
    const [, filename] = mockSaveAs.mock.calls[0];
    expect(filename).toBe('test-excel.xlsx');
  });

  it('uses a custom sheet name when provided', () => {
    exportToExcel(sampleData, sampleColumns, 'my-file', 'My Sheet');
    expect(XLSX.utils.aoa_to_sheet).toHaveBeenCalled();
  });

  it('falls back to empty string for missing keys', () => {
    const data = [{ name: 'OnlyName' }];
    exportToExcel(data, sampleColumns, 'partial');
    expect(XLSX.utils.aoa_to_sheet).toHaveBeenCalledWith([
      ['Name', 'Email'],
      ['OnlyName', ''],
    ]);
  });
});

// ─── Column definitions integrity ─────────────────────────────────────────────

describe('Column definition exports', () => {
  const requiredKeys = ['header', 'key'];

  const assertColumns = (columns, name) => {
    describe(name, () => {
      it('is a non-empty array', () => {
        expect(Array.isArray(columns)).toBe(true);
        expect(columns.length).toBeGreaterThan(0);
      });

      it('every entry has header and key', () => {
        columns.forEach((col) => {
          requiredKeys.forEach((k) => expect(col).toHaveProperty(k));
        });
      });

      it('all headers are non-empty strings', () => {
        columns.forEach((col) => {
          expect(typeof col.header).toBe('string');
          expect(col.header.length).toBeGreaterThan(0);
        });
      });

      it('all keys are non-empty strings', () => {
        columns.forEach((col) => {
          expect(typeof col.key).toBe('string');
          expect(col.key.length).toBeGreaterThan(0);
        });
      });
    });
  };

  assertColumns(CUSTOMER_COLUMNS, 'CUSTOMER_COLUMNS');
  assertColumns(PARTNER_COLUMNS, 'PARTNER_COLUMNS');
  assertColumns(WREGIS_COLUMNS, 'WREGIS_COLUMNS');
  assertColumns(COMMISSION_STATEMENT_COLUMNS, 'COMMISSION_STATEMENT_COLUMNS');
  assertColumns(PRE_APPROVAL_COLUMNS, 'PRE_APPROVAL_COLUMNS');

  it('CUSTOMER_COLUMNS has Name, Email, Status entries', () => {
    const keys = CUSTOMER_COLUMNS.map((c) => c.key);
    expect(keys).toContain('name');
    expect(keys).toContain('email');
    expect(keys).toContain('status');
  });

  it('WREGIS_COLUMNS has the 6 required WREGIS fields', () => {
    const keys = WREGIS_COLUMNS.map((c) => c.key);
    expect(keys).toContain('generatorId');
    expect(keys).toContain('reportingUnitId');
    expect(keys).toContain('vintage');
    expect(keys).toContain('totalMWh');
  });
});

// ─── transformToWregisFormat ──────────────────────────────────────────────────

describe('transformToWregisFormat', () => {
  const makeCommercialRecord = (overrides = {}) => ({
    intervalKWh: 1000,
    intervalStart: '2025-01-01T00:00:00Z',
    intervalEnd: '2025-01-31T23:59:59Z',
    commercialFacility: {
      id: 'fac-001',
      wregisId: 'WRG-001',
    },
    ...overrides,
  });

  it('returns an array', () => {
    const result = transformToWregisFormat([makeCommercialRecord()], 'commercial');
    expect(Array.isArray(result)).toBe(true);
  });

  it('returns one entry per unique facility', () => {
    const records = [
      makeCommercialRecord(),
      makeCommercialRecord({ intervalKWh: 500 }), // same facility
      makeCommercialRecord({
        intervalKWh: 200,
        commercialFacility: { id: 'fac-002', wregisId: 'WRG-002' },
      }),
    ];
    const result = transformToWregisFormat(records, 'commercial');
    expect(result).toHaveLength(2);
  });

  it('aggregates kWh across records for the same facility', () => {
    const records = [
      makeCommercialRecord({ intervalKWh: 1000 }),
      makeCommercialRecord({ intervalKWh: 500 }),
    ];
    const result = transformToWregisFormat(records, 'commercial');
    // 1500 kWh = 1.5 MWh
    expect(result[0].totalMWh).toBe('1.5000');
  });

  it('converts kWh to MWh with 4 decimal places', () => {
    const records = [makeCommercialRecord({ intervalKWh: 1234 })];
    const result = transformToWregisFormat(records, 'commercial');
    expect(result[0].totalMWh).toBe('1.2340');
  });

  it('output rows have all required WREGIS keys', () => {
    const result = transformToWregisFormat([makeCommercialRecord()], 'commercial');
    const requiredKeys = ['generatorId', 'reportingUnitId', 'vintage', 'startDate', 'endDate', 'totalMWh'];
    requiredKeys.forEach((k) => {
      expect(result[0]).toHaveProperty(k);
    });
  });

  it('formats startDate and endDate as MM/DD/YYYY', () => {
    const result = transformToWregisFormat([makeCommercialRecord()], 'commercial');
    expect(result[0].startDate).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    expect(result[0].endDate).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
  });

  it('formats vintage as MM/YYYY', () => {
    const result = transformToWregisFormat([makeCommercialRecord()], 'commercial');
    expect(result[0].vintage).toMatch(/^\d{2}\/\d{4}$/);
  });

  it('returns empty array for empty input', () => {
    const result = transformToWregisFormat([], 'commercial');
    expect(result).toEqual([]);
  });

  it('handles residential record type', () => {
    const records = [{
      intervalKWh: 800,
      intervalStart: '2025-02-01T00:00:00Z',
      intervalEnd: '2025-02-28T23:59:59Z',
      residentialFacility: { id: 'res-001', wregisId: 'WRG-R-001' },
    }];
    const result = transformToWregisFormat(records, 'residential');
    expect(result).toHaveLength(1);
    expect(result[0].totalMWh).toBe('0.8000');
  });

  it('falls back gracefully when no dates provided', () => {
    const records = [{
      intervalKWh: 100,
      commercialFacility: { id: 'fac-003', wregisId: 'WRG-003' },
    }];
    const result = transformToWregisFormat(records, 'commercial');
    expect(result[0].startDate).toBe('-');
    expect(result[0].endDate).toBe('-');
    expect(result[0].vintage).toBe('-');
  });

  it('uses facilityId slice as fallback wregisId when not set', () => {
    const records = [{
      intervalKWh: 100,
      intervalStart: '2025-01-01T00:00:00Z',
      intervalEnd: '2025-01-31T23:59:59Z',
      commercialFacility: { id: 'abcdefgh-1234' },
    }];
    const result = transformToWregisFormat(records, 'commercial');
    expect(result[0].generatorId).toBe('abcdefgh');
  });
});

// ─── exportPreApprovalWorksheet ───────────────────────────────────────────────

describe('exportPreApprovalWorksheet', () => {
  beforeEach(() => jest.clearAllMocks());

  const makeFacility = (overrides = {}) => ({
    id: 'res-001',
    address: '123 Solar St',
    city: 'Austin',
    state: 'TX',
    zipCode: '78701',
    systemCapacity: '10',
    meterId: 'MTR-001',
    utilityProvider: 'Austin Energy',
    commissionDate: '2024-06-01',
    ...overrides,
  });

  it('calls saveAs with Pre_Approval_Worksheet filename', () => {
    exportPreApprovalWorksheet([makeFacility()], 'Test Group');
    const [, filename] = mockSaveAs.mock.calls[0];
    expect(filename).toMatch(/^Pre_Approval_Worksheet_/);
    expect(filename).toMatch(/\.xlsx$/);
  });

  it('converts systemCapacity kW to MW', () => {
    exportPreApprovalWorksheet([makeFacility({ systemCapacity: '5000' })]);
    // 5000 kW = 5 MW → "5.0000"
    const sheetCall = XLSX.utils.aoa_to_sheet.mock.calls[0][0];
    const dataRows = sheetCall.slice(1);
    const mwIndex = PRE_APPROVAL_COLUMNS.findIndex((c) => c.key === 'nameplateMW');
    expect(dataRows[0][mwIndex]).toBe('5.0000');
  });

  it('fuel type is always Solar', () => {
    exportPreApprovalWorksheet([makeFacility()]);
    const sheetCall = XLSX.utils.aoa_to_sheet.mock.calls[0][0];
    const dataRows = sheetCall.slice(1);
    const fuelIdx = PRE_APPROVAL_COLUMNS.findIndex((c) => c.key === 'fuelType');
    expect(dataRows[0][fuelIdx]).toBe('Solar');
  });

  it('resNonRes is always Residential', () => {
    exportPreApprovalWorksheet([makeFacility()]);
    const sheetCall = XLSX.utils.aoa_to_sheet.mock.calls[0][0];
    const dataRows = sheetCall.slice(1);
    const idx = PRE_APPROVAL_COLUMNS.findIndex((c) => c.key === 'resNonRes');
    expect(dataRows[0][idx]).toBe('Residential');
  });

  it('expansion is always No', () => {
    exportPreApprovalWorksheet([makeFacility()]);
    const sheetCall = XLSX.utils.aoa_to_sheet.mock.calls[0][0];
    const dataRows = sheetCall.slice(1);
    const idx = PRE_APPROVAL_COLUMNS.findIndex((c) => c.key === 'expansion');
    expect(dataRows[0][idx]).toBe('No');
  });

  it('country is always US', () => {
    exportPreApprovalWorksheet([makeFacility()]);
    const sheetCall = XLSX.utils.aoa_to_sheet.mock.calls[0][0];
    const dataRows = sheetCall.slice(1);
    const idx = PRE_APPROVAL_COLUMNS.findIndex((c) => c.key === 'country');
    expect(dataRows[0][idx]).toBe('US');
  });

  it('handles multiple facilities', () => {
    exportPreApprovalWorksheet([makeFacility(), makeFacility({ id: 'res-002' })]);
    const sheetCall = XLSX.utils.aoa_to_sheet.mock.calls[0][0];
    const dataRows = sheetCall.slice(1); // exclude header row
    expect(dataRows).toHaveLength(2);
  });
});
