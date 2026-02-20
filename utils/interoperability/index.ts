export interface ValidationIssue {
  field: string;
  message: string;
}

export class MappingValidationError extends Error {
  public readonly issues: ValidationIssue[];

  constructor(resource: string, issues: ValidationIssue[]) {
    super(`Validasi mapping gagal untuk resource ${resource}`);
    this.name = 'MappingValidationError';
    this.issues = issues;
  }
}

export interface InternalPatient {
  id: string;
  nationalId: string;
  fullName: string;
  gender: 'male' | 'female' | 'other' | 'unknown';
  birthDate: string;
  phone?: string;
  address?: string;
}

export interface InternalVisit {
  id: string;
  patientId: string;
  visitDate: string;
  status: 'planned' | 'arrived' | 'in-progress' | 'finished' | 'cancelled';
  department: string;
  practitionerName?: string;
  diagnosisText?: string;
}

export interface InternalLabResult {
  id: string;
  patientId: string;
  visitId?: string;
  testCode: string;
  testName: string;
  value: number;
  unit: string;
  observedAt: string;
  interpretation?: 'L' | 'N' | 'H' | 'HH' | 'LL';
}

export interface InternalInventory {
  id: string;
  itemCode: string;
  itemName: string;
  category: 'medicine' | 'medical-device' | 'consumable' | 'ppe';
  quantity: number;
  unit: string;
  lastUpdated: string;
  location?: string;
}

export interface FhirIdentifier {
  system?: string;
  value: string;
}

export interface FhirCodeableConcept {
  text?: string;
  coding?: Array<{
    system?: string;
    code?: string;
    display?: string;
  }>;
}

export interface FhirPatient {
  resourceType: 'Patient';
  id: string;
  identifier: FhirIdentifier[];
  name: Array<{ text: string }>;
  gender: InternalPatient['gender'];
  birthDate: string;
  telecom?: Array<{ system: 'phone'; value: string }>;
  address?: Array<{ text: string }>;
}

export interface FhirEncounter {
  resourceType: 'Encounter';
  id: string;
  status: 'planned' | 'arrived' | 'in-progress' | 'finished' | 'cancelled';
  class: {
    system: string;
    code: string;
    display: string;
  };
  subject: {
    reference: string;
  };
  period: {
    start: string;
  };
  serviceType?: FhirCodeableConcept;
  participant?: Array<{
    individual: { display: string };
  }>;
  reasonCode?: FhirCodeableConcept[];
}

export interface FhirObservation {
  resourceType: 'Observation';
  id: string;
  status: 'final';
  code: FhirCodeableConcept;
  subject: {
    reference: string;
  };
  encounter?: {
    reference: string;
  };
  effectiveDateTime: string;
  valueQuantity: {
    value: number;
    unit: string;
  };
  interpretation?: Array<{ text: string }>;
}

export interface FhirInventoryItem {
  resourceType: 'InventoryItem';
  id: string;
  identifier: FhirIdentifier[];
  name: Array<{
    nameType: 'trade';
    language: string;
    name: string;
  }>;
  category: FhirCodeableConcept[];
  status: 'active';
  netContent?: {
    value: number;
    unit: string;
  };
  location?: string;
  lastModified: string;
}

const isIsoDate = (value: string): boolean => !Number.isNaN(Date.parse(value));

const requireText = (field: string, value: string | undefined, issues: ValidationIssue[]) => {
  if (!value || !value.trim()) {
    issues.push({ field, message: 'Wajib diisi.' });
  }
};

const requireNonNegative = (field: string, value: number, issues: ValidationIssue[]) => {
  if (!Number.isFinite(value) || value < 0) {
    issues.push({ field, message: 'Harus angka >= 0.' });
  }
};

export const validatePatient = (payload: InternalPatient): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  requireText('id', payload.id, issues);
  requireText('nationalId', payload.nationalId, issues);
  requireText('fullName', payload.fullName, issues);
  if (!isIsoDate(payload.birthDate)) {
    issues.push({ field: 'birthDate', message: 'Format tanggal tidak valid.' });
  }
  return issues;
};

export const validateVisit = (payload: InternalVisit): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  requireText('id', payload.id, issues);
  requireText('patientId', payload.patientId, issues);
  requireText('department', payload.department, issues);
  if (!isIsoDate(payload.visitDate)) {
    issues.push({ field: 'visitDate', message: 'Format tanggal tidak valid.' });
  }
  return issues;
};

export const validateLabResult = (payload: InternalLabResult): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  requireText('id', payload.id, issues);
  requireText('patientId', payload.patientId, issues);
  requireText('testCode', payload.testCode, issues);
  requireText('testName', payload.testName, issues);
  requireText('unit', payload.unit, issues);
  requireNonNegative('value', payload.value, issues);
  if (!isIsoDate(payload.observedAt)) {
    issues.push({ field: 'observedAt', message: 'Format tanggal tidak valid.' });
  }
  return issues;
};

export const validateInventory = (payload: InternalInventory): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  requireText('id', payload.id, issues);
  requireText('itemCode', payload.itemCode, issues);
  requireText('itemName', payload.itemName, issues);
  requireText('unit', payload.unit, issues);
  requireNonNegative('quantity', payload.quantity, issues);
  if (!isIsoDate(payload.lastUpdated)) {
    issues.push({ field: 'lastUpdated', message: 'Format tanggal tidak valid.' });
  }
  return issues;
};

const toEncounterClass = (department: string) => ({
  system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
  code: 'AMB',
  display: department,
});

const inventoryCategoryDisplay: Record<InternalInventory['category'], string> = {
  medicine: 'Medicine',
  'medical-device': 'Medical Device',
  consumable: 'Consumable',
  ppe: 'Personal Protective Equipment',
};

export const mapPatientToFhir = (payload: InternalPatient): FhirPatient => ({
  resourceType: 'Patient',
  id: payload.id,
  identifier: [
    {
      system: 'https://faskes.example.id/identifier/nik',
      value: payload.nationalId,
    },
  ],
  name: [{ text: payload.fullName }],
  gender: payload.gender,
  birthDate: payload.birthDate,
  telecom: payload.phone ? [{ system: 'phone', value: payload.phone }] : undefined,
  address: payload.address ? [{ text: payload.address }] : undefined,
});

export const mapVisitToFhir = (payload: InternalVisit): FhirEncounter => ({
  resourceType: 'Encounter',
  id: payload.id,
  status: payload.status,
  class: toEncounterClass(payload.department),
  subject: {
    reference: `Patient/${payload.patientId}`,
  },
  period: {
    start: payload.visitDate,
  },
  serviceType: {
    text: payload.department,
  },
  participant: payload.practitionerName
    ? [{ individual: { display: payload.practitionerName } }]
    : undefined,
  reasonCode: payload.diagnosisText ? [{ text: payload.diagnosisText }] : undefined,
});

export const mapLabResultToFhir = (payload: InternalLabResult): FhirObservation => ({
  resourceType: 'Observation',
  id: payload.id,
  status: 'final',
  code: {
    coding: [
      {
        system: 'http://loinc.org',
        code: payload.testCode,
        display: payload.testName,
      },
    ],
    text: payload.testName,
  },
  subject: {
    reference: `Patient/${payload.patientId}`,
  },
  encounter: payload.visitId ? { reference: `Encounter/${payload.visitId}` } : undefined,
  effectiveDateTime: payload.observedAt,
  valueQuantity: {
    value: payload.value,
    unit: payload.unit,
  },
  interpretation: payload.interpretation ? [{ text: payload.interpretation }] : undefined,
});

export const mapInventoryToFhir = (payload: InternalInventory): FhirInventoryItem => ({
  resourceType: 'InventoryItem',
  id: payload.id,
  identifier: [
    {
      system: 'https://faskes.example.id/inventory-code',
      value: payload.itemCode,
    },
  ],
  name: [
    {
      nameType: 'trade',
      language: 'id-ID',
      name: payload.itemName,
    },
  ],
  category: [
    {
      coding: [
        {
          system: 'https://faskes.example.id/codes/inventory-category',
          code: payload.category,
          display: inventoryCategoryDisplay[payload.category],
        },
      ],
      text: inventoryCategoryDisplay[payload.category],
    },
  ],
  status: 'active',
  netContent: {
    value: payload.quantity,
    unit: payload.unit,
  },
  location: payload.location,
  lastModified: payload.lastUpdated,
});

export type MappingResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: MappingValidationError };

const adapt = <TInput, TOutput>(
  resourceName: string,
  payload: TInput,
  validator: (input: TInput) => ValidationIssue[],
  mapper: (input: TInput) => TOutput,
): MappingResult<TOutput> => {
  const issues = validator(payload);
  if (issues.length > 0) {
    return {
      ok: false,
      error: new MappingValidationError(resourceName, issues),
    };
  }

  try {
    return {
      ok: true,
      data: mapper(payload),
    };
  } catch {
    return {
      ok: false,
      error: new MappingValidationError(resourceName, [
        {
          field: 'general',
          message: 'Terjadi kesalahan internal saat proses mapping.',
        },
      ]),
    };
  }
};

export const adaptPatientToFhir = (payload: InternalPatient) =>
  adapt('Patient', payload, validatePatient, mapPatientToFhir);

export const adaptVisitToFhir = (payload: InternalVisit) =>
  adapt('Encounter', payload, validateVisit, mapVisitToFhir);

export const adaptLabResultToFhir = (payload: InternalLabResult) =>
  adapt('Observation', payload, validateLabResult, mapLabResultToFhir);

export const adaptInventoryToFhir = (payload: InternalInventory) =>
  adapt('InventoryItem', payload, validateInventory, mapInventoryToFhir);
