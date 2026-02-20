# Interoperability API (FHIR Mapping Layer)

Dokumen ini menjelaskan kontrak endpoint untuk transformasi data internal ke resource FHIR.

## Ringkasan Endpoint

Base path: `/api/interoperability`

| Endpoint | Method | Input Internal | Output FHIR |
|---|---|---|---|
| `/patients/transform` | POST | `InternalPatient` | `Patient` |
| `/visits/transform` | POST | `InternalVisit` | `Encounter` |
| `/lab-results/transform` | POST | `InternalLabResult` | `Observation` |
| `/inventory/transform` | POST | `InternalInventory` | `InventoryItem` |

## Kontrak Request/Response

### 1) Transform Patient

**Request body (`InternalPatient`)**

```json
{
  "id": "pat-001",
  "nationalId": "3173xxxxxxxxxxxx",
  "fullName": "Dewi Lestari",
  "gender": "female",
  "birthDate": "1992-05-21",
  "phone": "081234567890",
  "address": "Jakarta"
}
```

**Success response**

```json
{
  "ok": true,
  "data": {
    "resourceType": "Patient",
    "id": "pat-001",
    "identifier": [{ "system": "https://faskes.example.id/identifier/nik", "value": "3173xxxxxxxxxxxx" }],
    "name": [{ "text": "Dewi Lestari" }],
    "gender": "female",
    "birthDate": "1992-05-21"
  }
}
```

### 2) Transform Visit

**Request body (`InternalVisit`)**

```json
{
  "id": "enc-010",
  "patientId": "pat-001",
  "visitDate": "2026-01-15T08:30:00Z",
  "status": "arrived",
  "department": "Poli Umum",
  "practitionerName": "dr. Andika"
}
```

**Success response**: `Encounter`.

### 3) Transform Lab Result

**Request body (`InternalLabResult`)**

```json
{
  "id": "lab-100",
  "patientId": "pat-001",
  "visitId": "enc-010",
  "testCode": "718-7",
  "testName": "Hemoglobin",
  "value": 12.6,
  "unit": "g/dL",
  "observedAt": "2026-01-15T09:15:00Z",
  "interpretation": "N"
}
```

**Success response**: `Observation`.

### 4) Transform Inventory

**Request body (`InternalInventory`)**

```json
{
  "id": "inv-022",
  "itemCode": "OBT-PCT-500",
  "itemName": "Paracetamol 500mg",
  "category": "medicine",
  "quantity": 2400,
  "unit": "tablet",
  "lastUpdated": "2026-01-15T11:00:00Z",
  "location": "Gudang Farmasi"
}
```

**Success response**: `InventoryItem` (FHIR R5).

## Error Handling Standar

Jika validasi gagal atau mapping bermasalah:

```json
{
  "ok": false,
  "error": {
    "name": "MappingValidationError",
    "message": "Validasi mapping gagal untuk resource Patient",
    "issues": [
      { "field": "birthDate", "message": "Format tanggal tidak valid." }
    ]
  }
}
```

## Aturan Validasi Utama

- Semua identifier wajib terisi (`id`, `patientId`, `itemCode`, dll).
- Tanggal harus format ISO 8601 yang valid (`birthDate`, `visitDate`, `observedAt`, `lastUpdated`).
- Nilai numerik tidak boleh negatif (`value`, `quantity`).
- Mapping melempar hasil error terstruktur agar mudah ditindaklanjuti oleh integrator.
