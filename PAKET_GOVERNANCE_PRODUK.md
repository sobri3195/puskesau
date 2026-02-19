# Paket Governance Produk MedTrack AU

## 1) Roadmap 3 Fase

### Fase 1 — Quick Wins (0–6 minggu)
**Tujuan:** Meningkatkan reliabilitas operasional harian dengan perbaikan berdampak cepat.

**Inisiatif prioritas:**
1. Standardisasi skema alert & severity (`info`, `warning`, `critical`) untuk semua modul notifikasi.
2. Penetapan baseline KPI dan dashboard monitoring KPI mingguan.
3. Hardening validasi data input untuk stok, distribusi, dan data pasien.
4. SOP operator versi 1.0 untuk alur monitoring, eskalasi, dan pelaporan insiden.
5. Penyusunan katalog API inti (endpoint, kontrak payload, kode error).

**Deliverable:**
- KPI baseline + target kuartal.
- Runbook insiden singkat (L1/L2).
- Dokumen arsitektur high-level versi awal.

---

### Fase 2 — Stabilization (6–16 minggu)
**Tujuan:** Menurunkan variasi performa, meningkatkan kualitas data, dan mempercepat penyelesaian insiden.

**Inisiatif prioritas:**
1. Implementasi observability standar: log terstruktur, metrics, dan tracing di modul kritikal.
2. Otomasi quality gate data (validasi duplikasi, missing fields, anomaly check).
3. SLA closure incident berbasis severity + workflow eskalasi lintas fungsi.
4. Versi 2 dokumentasi API (versioning, backward compatibility, changelog).
5. SOP komando (command center) untuk skenario gangguan sistem mayor.

**Deliverable:**
- Dashboard SLO/SLA real-time.
- Incident review bulanan + RCA template.
- API governance board (cadence review 2 mingguan).

---

### Fase 3 — Scale (4–12 bulan)
**Tujuan:** Menyiapkan pertumbuhan multi-site, reliability tingkat enterprise, dan tata kelola lintas unit.

**Inisiatif prioritas:**
1. Multi-tenant readiness (konfigurasi site, role-based access, dan data partitioning).
2. Advanced alerting berbasis prediksi (trend stok kritis, lonjakan insiden operasional).
3. Kontrak data lintas sistem (integrasi HIS/ERP/BI) dengan kebijakan kualitas data terpadu.
4. Audit compliance berkala (security, audit trail, data governance).
5. Program kapabilitas tim: playbook simulasi insiden dan sertifikasi operator.

**Deliverable:**
- Enterprise architecture blueprint.
- Service catalog + ownership model final.
- Governance scorecard kuartalan untuk direksi/komando.

---

## 2) KPI Utama Produk

| KPI | Definisi Operasional | Rumus Pengukuran | Target Quick Wins | Target Stabilization | Target Scale | Owner Utama |
|---|---|---|---:|---:|---:|---|
| **Response Time Alert** | Waktu dari alert terbit hingga alert diakui operator | median/p95 `(ack_time - alert_time)` | P50 ≤ 5 menit, P95 ≤ 15 menit | P50 ≤ 3 menit, P95 ≤ 10 menit | P50 ≤ 2 menit, P95 ≤ 5 menit | Ops Command Center |
| **Accuracy Data** | Persentase data valid tanpa error material pada field kritikal | `(record_valid / total_record_sampled) x 100%` | ≥ 97.0% | ≥ 98.5% | ≥ 99.5% | Data Steward + Product |
| **SLA Incident Closure** | Persentase insiden closed dalam batas SLA per severity | `(incident_closed_on_sla / total_incident_closed) x 100%` | ≥ 90% | ≥ 95% | ≥ 97% | Incident Manager |

### Klasifikasi SLA Closure per Severity
- **Sev-1 (kritikal):** maksimal 4 jam.
- **Sev-2 (tinggi):** maksimal 8 jam.
- **Sev-3 (menengah):** maksimal 24 jam.
- **Sev-4 (rendah):** maksimal 3 hari kerja.

### Cadence Review KPI
- **Harian:** monitoring operasional (ops).
- **Mingguan:** review tren + tindakan korektif (product + engineering + ops).
- **Bulanan:** governance review + perubahan target/kapasitas (leadership).

---

## 3) Paket Dokumentasi Wajib

## 3.1 Dokumentasi Arsitektur
**Konten minimal:**
1. **Context Diagram:** aktor, sistem eksternal, batas sistem.
2. **Container Diagram:** frontend, API layer, data processing, database, message/notification service.
3. **Component Diagram:** modul fungsional (`Dashboard`, `Notifications`, `Logistics`, `Distribution`, `HR`, `Medical Services`, `Reports`).
4. **Data Flow Diagram:** alur alert, update stok, dan sinkronisasi data.
5. **NFR Appendix:** ketersediaan, keamanan, performa, backup/restore.

**Standar governance:**
- Versioned (`vX.Y`), ada owner, tanggal update, dan daftar perubahan.
- Review arsitektur minimal per kuartal.

## 3.2 Dokumentasi API
**Konten minimal per endpoint:**
1. Tujuan endpoint & domain modul.
2. Request schema + contoh payload.
3. Response schema + contoh sukses/gagal.
4. Error code taxonomy + tindakan mitigasi.
5. SLA endpoint (latensi, throughput), rate limit, dan auth scope.

**Standar governance:**
- Semver API (`v1`, `v2`) dan kebijakan deprecation.
- Changelog wajib sebelum rilis.
- Contract test wajib untuk endpoint kritikal.

## 3.3 SOP Operator
**Cakupan SOP Operator (L1/L2):**
1. Login dan validasi status awal dashboard.
2. Prioritisasi alert berdasarkan severity.
3. Triage awal: cek data, cek dampak, cek modul terdampak.
4. Acknowledge & assign tiket insiden.
5. Eskalasi ke tim teknis jika melewati threshold waktu.
6. Penutupan insiden + eviden + update knowledge base.

**Lampiran wajib:**
- Checklist shift.
- Template handover antar shift.
- Template laporan insiden harian.

## 3.4 SOP Komando (Command SOP)
**Cakupan SOP Komando untuk major incident:**
1. Aktivasi mode komando (trigger Sev-1 / outage lintas modul).
2. Penunjukan peran: Incident Commander, Ops Lead, Comms Lead, Tech Lead.
3. Jalur komunikasi resmi (war room, update periodik 15–30 menit).
4. Keputusan taktis: rollback, feature freeze, failover.
5. Kriteria recovery & de-escalation.
6. Post-Incident Review (PIR) + RCA maksimal H+2.

**Artefak wajib:**
- Timeline insiden.
- Decision log.
- Action item owner + due date.

---

## 4) RACI Matrix Ownership Modul

### Definisi peran
- **A (Accountable):** penanggung jawab akhir.
- **R (Responsible):** eksekutor utama.
- **C (Consulted):** dimintai masukan.
- **I (Informed):** diberi informasi.

| Modul / Domain | Product Manager | Engineering Lead | QA Lead | Ops Command Center | Data Steward | Security/Compliance | Incident Manager |
|---|---|---|---|---|---|---|---|
| Dashboard & Monitoring | A | R | C | R | C | I | I |
| Notifications & Alerting | C | R | C | A/R | C | I | C |
| Logistics & Stock | A | R | C | C | R | I | I |
| Distribution | A | R | C | C | R | I | I |
| HR & Personnel | A | R | C | I | C | C | I |
| Medical Services | A | R | C | C | R | C | I |
| Reports & Analytics | A | R | C | I | A/R | C | I |
| API Platform | C | A/R | C | I | C | C | I |
| Data Quality Controls | C | R | C | I | A/R | C | I |
| Incident Management | I | C | I | R | I | I | A |
| SOP Operator Governance | C | C | C | A/R | I | I | C |
| SOP Komando Governance | I | C | I | R | I | C | A |

---

## 5) Mekanisme Tata Kelola Eksekusi

1. **Governance Meeting Mingguan (60 menit)**
   - Review KPI, backlog risiko, dan blocker lintas modul.
2. **Change Advisory Board (2 mingguan)**
   - Validasi perubahan API, arsitektur, dan SOP.
3. **Monthly Service Review**
   - Evaluasi SLA, kualitas data, major incident, dan prioritas roadmap berikutnya.
4. **Quarterly Strategy Review**
   - Kalibrasi target scale, kapasitas tim, dan investasi platform.

## 6) Definition of Done Governance
Setiap inisiatif governance dinyatakan selesai jika:
1. Dokumen tersedia, ter-versioning, dan sudah di-review owner terkait.
2. KPI terukur otomatis pada dashboard yang bisa diaudit.
3. SOP diuji lewat simulasi/table-top minimal 1 kali.
4. Tindak lanjut audit/insiden memiliki PIC dan due date yang jelas.

