import { describe, expect, it } from 'vitest';
import {
  adaptInventoryToFhir,
  adaptLabResultToFhir,
  adaptPatientToFhir,
  adaptVisitToFhir,
} from '../../utils/interoperability';

describe('interoperability adapters', () => {
  it('memetakan data pasien internal ke FHIR Patient', () => {
    const result = adaptPatientToFhir({
      id: 'pat-001',
      nationalId: '3173123412341234',
      fullName: 'Dewi Lestari',
      gender: 'female',
      birthDate: '1992-05-21',
      phone: '081234567890',
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.data.resourceType).toBe('Patient');
    expect(result.data.identifier[0].value).toBe('3173123412341234');
    expect(result.data.name[0].text).toBe('Dewi Lestari');
  });

  it('mengembalikan error validasi terstruktur saat payload lab tidak valid', () => {
    const result = adaptLabResultToFhir({
      id: '',
      patientId: '',
      testCode: '',
      testName: '',
      value: -1,
      unit: '',
      observedAt: 'not-a-date',
    });

    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }

    expect(result.error.name).toBe('MappingValidationError');
    expect(result.error.issues.length).toBeGreaterThan(0);
    expect(result.error.issues.map((item) => item.field)).toContain('observedAt');
  });

  it('memetakan kunjungan ke Encounter dan inventory ke InventoryItem', () => {
    const visitResult = adaptVisitToFhir({
      id: 'enc-010',
      patientId: 'pat-001',
      visitDate: '2026-01-15T08:30:00Z',
      status: 'arrived',
      department: 'Poli Umum',
      practitionerName: 'dr. Andika',
    });

    const inventoryResult = adaptInventoryToFhir({
      id: 'inv-022',
      itemCode: 'OBT-PCT-500',
      itemName: 'Paracetamol 500mg',
      category: 'medicine',
      quantity: 2400,
      unit: 'tablet',
      lastUpdated: '2026-01-15T11:00:00Z',
      location: 'Gudang Farmasi',
    });

    expect(visitResult.ok).toBe(true);
    expect(inventoryResult.ok).toBe(true);

    if (!visitResult.ok || !inventoryResult.ok) {
      return;
    }

    expect(visitResult.data.resourceType).toBe('Encounter');
    expect(visitResult.data.subject.reference).toBe('Patient/pat-001');
    expect(inventoryResult.data.resourceType).toBe('InventoryItem');
    expect(inventoryResult.data.netContent?.value).toBe(2400);
  });
});
