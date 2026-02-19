# Analisis Detail Tambahan Fitur + Prompt Implementasi

Dokumen ini memetakan **fitur lanjutan yang paling berdampak** untuk aplikasi MedTrack AU berdasarkan arsitektur saat ini (dashboard komando berbasis data simulasi dengan modul logistik, medis, SDM, distribusi, jadwal, laporan, dan riwayat pasien).

---

## 1) Integrasi Data Real-Time dari Backend (Prioritas Tinggi)

### Kenapa penting
Aplikasi saat ini sudah menampilkan data “live” berbasis simulasi interval. Ini fondasi yang bagus untuk migrasi ke data nyata dari rumah sakit/satuan.

### Ruang lingkup fitur
- Ganti data mock menjadi data API.
- Gunakan polling adaptif / websocket untuk panel kritikal.
- Tambahkan status koneksi (online/offline/degraded).
- Tambahkan mekanisme retry + fallback cache.

### Dampak bisnis
- Komando memperoleh situasi lapangan aktual.
- Notifikasi kritis menjadi actionable, bukan sekadar demo.

### Prompt implementasi
```text
Anda adalah software engineer senior TypeScript React.
Tugas:
1) Refactor seluruh sumber data mock pada Dashboard, Logistik, Medis, SDM, Distribusi, Jadwal, Laporan, dan Riwayat Pasien menjadi API-driven.
2) Buat lapisan service terpisah per domain (misal services/dashboardService.ts, services/logisticsService.ts).
3) Implementasikan status koneksi: online, offline, degraded.
4) Tambahkan retry exponential backoff untuk request gagal.
5) Tambahkan cache sementara di localStorage/sessionStorage untuk data terakhir agar UI tetap berisi saat API gagal.
6) Pertahankan UX saat ini (loading skeleton, status live, notifikasi) semaksimal mungkin.
Output yang diharapkan:
- Daftar file yang diubah.
- Penjelasan arsitektur data flow.
- Catatan edge case (timeout, stale data, partial data).
```

---

## 2) Rule Engine Alert & Eskalasi Otomatis

### Kenapa penting
Notifikasi saat ini berbasis kondisi sederhana. Perlu rule engine agar keputusan alert konsisten, dapat diaudit, dan bisa dieksekusi otomatis.

### Ruang lingkup fitur
- Definisi aturan ambang lintas modul (BOR, stok kritis, keterlambatan distribusi).
- Multi-level severity + matriks eskalasi per role.
- Aksi otomatis (buat tugas, kirim notifikasi internal, tandai unit prioritas).

### Dampak bisnis
- Mengurangi keterlambatan respon insiden.
- Membantu komando prioritisasi secara objektif.

### Prompt implementasi
```text
Rancang dan implementasikan Alert Rule Engine di aplikasi React TypeScript ini.
Kebutuhan:
- Rule bersifat terkonfigurasi (threshold, operator, cooldown, target modul).
- Severity: rendah/sedang/tinggi/kritis.
- Eskalasi otomatis ke role tertentu saat rule aktif lebih dari X menit.
- Hindari alert spam dengan dedup + cooldown.
- Sediakan halaman konfigurasi rule sederhana (CRUD rule).
Tambahkan contoh minimal 6 rule lintas modul (Dashboard, Logistik, Distribusi, SDM).
```

---

## 3) RBAC + Audit Trail (Keamanan Operasional)

### Kenapa penting
Aplikasi kesehatan militer harus punya kontrol akses ketat dan jejak perubahan.

### Ruang lingkup fitur
- Role: Komando, Kepala RS, Admin Logistik, Operator, Auditor.
- Pembatasan aksi per view dan per tombol (add/edit/export).
- Audit trail immutable untuk perubahan data sensitif.

### Dampak bisnis
- Kepatuhan dan forensik lebih kuat.
- Menurunkan risiko kebocoran/penyalahgunaan data.

### Prompt implementasi
```text
Implementasikan Role-Based Access Control (RBAC) dan audit trail.
Rincian:
1) Definisikan permission matrix per role untuk setiap modul dan aksi.
2) Buat guard komponen dan guard route berbasis permission.
3) Semua aksi mutasi data (create/update/delete/export) harus menghasilkan entri audit.
4) Tampilkan halaman Audit Trail dengan filter (waktu, user, aksi, modul).
5) Berikan contoh akun dummy untuk setiap role.
Gunakan TypeScript ketat dan pastikan UI tetap responsif.
```

---

## 4) Command Center Map (Geospasial Distribusi & Kapasitas)

### Kenapa penting
Modul distribusi akan jauh lebih kuat bila divisualkan di peta (asal-tujuan, ETA, bottleneck).

### Ruang lingkup fitur
- Peta titik RS/gudang/lanud.
- Jalur pengiriman + status warna (normal/terlambat/kritis).
- Layer kapasitas RS dan stok kritis per wilayah.

### Dampak bisnis
- Komando dapat melakukan redistribusi lebih cepat.

### Prompt implementasi
```text
Tambahkan fitur Command Center Map.
Spesifikasi:
- Integrasi peta (bebas memilih library open-source).
- Marker untuk RS, gudang, dan unit distribusi.
- Polyline rute distribusi dengan pewarnaan berdasarkan status keterlambatan.
- Panel samping berisi detail node yang dipilih (stok, BOR, IGD status, ETA).
- Filter berdasarkan wilayah dan jenis logistik.
Buat fallback non-map view jika tile map gagal dimuat.
```

---

## 5) Workflow Incident & Task Orchestration

### Kenapa penting
Saat ini tugas/jadwal sudah ada, namun belum terikat penuh ke kejadian insiden lintas modul.

### Ruang lingkup fitur
- Incident dibentuk dari alert.
- Otomatis membuat task multi-tim.
- SLA timer dan progres insiden end-to-end.

### Prompt implementasi
```text
Buat modul Incident Management terhubung dengan notifikasi dan tugas.
Kebutuhan:
- Incident dapat dibuat otomatis dari alert severity tinggi/kritis.
- Incident memiliki status (open, triage, in-progress, resolved, closed).
- Saat incident dibuat, sistem membuat task default untuk tim terkait.
- Tampilkan SLA countdown dan indikator keterlambatan penyelesaian.
- Hubungkan ke modul Jadwal & Tugas yang sudah ada.
```

---

## 6) Prediksi Kebutuhan Stok & Kapasitas (AI/Forecasting)

### Kenapa penting
Nilai strategis terbesar hadir saat sistem bisa prediktif, bukan hanya reaktif.

### Ruang lingkup fitur
- Forecast konsumsi obat/alkes per periode.
- Prediksi lonjakan BOR/IGD.
- Rekomendasi redistribusi berbasis risiko.

### Prompt implementasi
```text
Tambahkan fitur forecasting operasional.
Detail:
- Prediksi kebutuhan stok obat/alkes 30 hari ke depan.
- Prediksi BOR mingguan per rumah sakit.
- Tampilkan confidence band dan alasan rekomendasi.
- Jika prediksi melewati threshold, buat rekomendasi tindakan otomatis.
- Visualisasi sederhana namun jelas untuk pengambil keputusan.
```

---

## 7) Interoperabilitas Standar Medis (FHIR/HL7) – Tahap Lanjutan

### Kenapa penting
Agar mudah terhubung dengan HIS/LIS/RIS eksternal.

### Prompt implementasi
```text
Siapkan lapisan interoperabilitas data kesehatan.
Target:
- Adapter untuk data pasien, kunjungan, lab result, dan inventory.
- Mapping data internal ke struktur standar (misal FHIR resource yang relevan).
- Validasi skema dan error handling mapping.
- Dokumentasi endpoint dan kontrak data.
```

---

## Urutan Implementasi yang Disarankan
1. Integrasi API real-time.
2. RBAC + audit trail.
3. Rule engine alert + incident workflow.
4. Command center map.
5. Forecasting.
6. Interoperabilitas standar.

Urutan ini menyeimbangkan **nilai cepat** (operasional langsung) dengan **skala jangka panjang**.
