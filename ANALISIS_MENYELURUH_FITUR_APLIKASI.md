# Analisis Menyeluruh Fitur Aplikasi MedTrack AU

Dokumen ini merangkum **seluruh fitur yang saat ini benar-benar terimplementasi** pada kode sumber, termasuk alur bisnis, interaksi antar-modul, otomatisasi, validasi data, dan cakupan pengujian.

---

## 1) Gambaran Umum Produk

MedTrack AU adalah aplikasi command center kesehatan berbasis React + TypeScript dengan pola **single-page application (SPA)**. Aplikasi memusatkan pemantauan operasi rumah sakit militer (pasien, stok, SDM, distribusi, jadwal, insiden, laporan) dalam satu dashboard terpadu.

### Karakteristik inti
- Navigasi multi-modul tanpa reload halaman.
- Dukungan mode terang/gelap dengan persistensi preferensi pengguna.
- Konteks global untuk data operasional lintas fitur (notifikasi, incident, task board).
- Simulasi data live pada dashboard untuk kebutuhan monitoring dan latihan skenario respons.

---

## 2) Arsitektur Aplikasi & Fondasi Teknis

### 2.1 Provider dan state global
Aplikasi menggunakan tiga konteks utama:
1. **ThemeContext**
   - Menyimpan tema (`light` / `dark`) ke `localStorage`.
   - Sinkronkan kelas tema pada root document.
2. **NavigationContext**
   - Menentukan `activeView` antar modul.
3. **OpsContext**
   - Menyimpan data lintas modul: notifikasi, task board, incident.
   - Menjalankan otomatisasi pembuatan incident + task dari notifikasi severity tinggi/kritis.

### 2.2 Modul utama yang tersedia
- Dashboard
- Logistik & Stok
- Pelayanan Medis
- SDM & Personel
- Riwayat Pasien
- Distribusi
- Jadwal & Tugas
- Incident Management
- Laporan & Analitik

---

## 3) Dashboard (Pusat Komando)

Dashboard adalah modul paling kaya otomasi karena memadukan KPI, simulasi live, alerting, dan panel notifikasi.

### 3.1 KPI ringkas dan panel operasional
Menampilkan:
- Total pasien aktif.
- Persentase stok obat/alkes.
- Kapasitas RS.
- Distribusi logistik.
- Metrik pasien (admission/discharge/inpatient/LOS).
- Tabel status RS (bed, IGD, kamar operasi, ambulans).
- Utilisasi SDM.
- Tren logistik.
- Low stock table.

### 3.2 Simulasi live update
Setiap interval, data dashboard diperbarui secara dinamis:
- Nilai KPI berubah (bounded/terkendali agar realistis).
- Kapasitas bed/OR/ambulans berubah dan memengaruhi status IGD.
- Data SDM dan tren logistik ikut berubah.
- Item low stock berubah stoknya.
- Menampilkan indikator status `Live` / `Updating` + timestamp pembaruan.

### 3.3 Otomatisasi alert dari perubahan kondisi
Dashboard dapat menghasilkan notifikasi baru saat kondisi transisi kritikal terjadi:
- **IGD berubah ke Kritis** → notifikasi severity kritis.
- **Status stok berubah jadi Kritis** → notifikasi severity tinggi.

Notifikasi baru dikirim ke panel notifikasi global melalui `OpsContext`, sehingga modul lain ikut terdampak.

---

## 4) Notifikasi & Peringatan (Lintas Modul)

Panel notifikasi memiliki fitur operasional lengkap:

### 4.1 Lifecycle notifikasi
Setiap notifikasi memiliki status:
- `new`
- `acknowledged`
- `escalated`
- `resolved`

Transisi lifecycle dibatasi aturan valid (state machine sederhana) agar tidak lompat status secara tidak sah.

### 4.2 Mode critical-only
- Toggle untuk hanya menampilkan notifikasi kritikal.
- Mendukung shortcut keyboard (`Alt+C`).

### 4.3 One-click action & deep-link view
- Tombol aksi cepat dapat:
  - menandai notifikasi sebagai `acknowledged`,
  - mengarahkan user ke modul target (berdasarkan parsing judul notifikasi).
- Mapping target modul berbasis kata kunci (`stok`, `pengiriman`, `jadwal`, `kritis/icu/darah`).

### 4.4 Shortcut keyboard operasional
- `Alt+Enter`: jalankan aksi cepat.
- `Alt+A`: acknowledge.
- `Alt+E`: escalate.
- `Alt+R`: resolve.

---

## 5) Incident Management (Otomatis dari Alert)

Ini adalah salah satu nilai utama sistem: notifikasi severity tinggi/kritis memicu alur incident.

### 5.1 Auto-create incident
Saat notifikasi severity `tinggi` atau `kritis` masuk:
- Sistem membuat incident baru.
- Menentukan tim default berdasarkan severity.
- Menghitung SLA otomatis:
  - kritis: 60 menit,
  - tinggi: 180 menit.

### 5.2 Auto-create task terhubung incident
Bersamaan dengan incident, sistem membuat task lanjutan di kolom **Tugas Baru** agar tindak lanjut langsung masuk workflow eksekusi.

### 5.3 Monitoring SLA dan status
- Incident dapat difilter severity.
- Ada hitung mundur SLA (sisa waktu / terlambat).
- Status incident dapat diubah (`open`, `triage`, `in-progress`, `resolved`, `closed`).

---

## 6) Jadwal & Tugas

Modul ini menggabungkan kalender tim medis dan papan tugas gaya kanban.

### 6.1 Kalender mingguan
- Menampilkan event per hari (Sen–Min).
- Klik hari membuka modal detail + form tambah event.
- Event tipe: `meeting`, `consultation`, `surgery`.

### 6.2 Task board drag-and-drop
- Kolom tugas (`Tugas Baru`, `Sedang Dikerjakan`, `Selesai`).
- Task dapat dipindahkan antar kolom dengan drag-and-drop.
- Menampilkan PIC, due date, deskripsi.
- Task yang berasal dari incident menampilkan `Linked Incident ID`.

---

## 7) Logistik & Stok

Modul ini menyediakan kontrol inventaris yang relatif lengkap pada sisi UI.

### 7.1 Monitoring inventaris
- Data item: ID, nama, kategori, stok, kapasitas, threshold, timestamp update.
- Status stok dihitung otomatis:
  - Aman
  - Perlu Perhatian
  - Kritis
- Bar progres stok terhadap kapasitas.

### 7.2 Fitur analisis data inventaris
- Pencarian berdasarkan nama/ID.
- Filter status.
- Sorting kolom (nama, kategori, stok, threshold).
- KPI ringkas: total item, jumlah item kritis, total unit stok.

### 7.3 Manajemen threshold
- Modal edit threshold per item.
- Update threshold otomatis menambahkan entri riwayat audit.

### 7.4 Riwayat stok dan update manual
- Modal riwayat item.
- Input update stok manual + alasan perubahan.
- Menyimpan jejak historis (tanggal, alasan, delta, stok akhir).
- Menampilkan grafik tren stok berbasis riwayat.

---

## 8) Pelayanan Medis

### 8.1 Jadwal operasi
- Tabel jadwal operasi harian.
- Filter berdasarkan status operasi.
- Status: terjadwal, berlangsung, selesai, batal.
- Modal untuk menambahkan jadwal operasi baru.

### 8.2 Ketersediaan spesialis
- Grid profil dokter/spesialis.
- Filter status ketersediaan (tersedia/on-call/libur).

---

## 9) SDM & Personel

### 9.1 Direktori personel
- Menyimpan identitas personel (ID, nama, peran, departemen, status, kontak).
- Statistik cepat: personel aktif, total departemen, personel cuti.

### 9.2 Fitur manajemen data
- Search ID/nama (dengan highlight teks hasil cari).
- Filter peran.
- Filter departemen.
- Sorting per kolom.
- Tambah personel baru via modal (ID auto-generate).

---

## 10) Distribusi Logistik

### 10.1 Network map / command nodes
- Menyajikan node distribusi (RS, gudang, unit distribusi) lintas wilayah.
- Menampilkan informasi node: stok, BOR, status IGD, ETA, jenis logistik.

### 10.2 Rute distribusi
- Rute pengiriman terdefinisi antar node.
- Warna rute merepresentasikan status pengiriman.

### 10.3 Operasional pengiriman
- Tabel status pengiriman (ID, asal, tujuan, driver, ETA, status).
- Filter status.
- Form kirim logistik baru (modal).
- KPI panel inventaris gudang menggunakan progress bar per kategori.

---

## 11) Riwayat Pasien (Sub-aplikasi terstruktur)

Modul ini paling kompleks pada manajemen rekam medis simulasi.

### 11.1 Struktur navigasi internal
Menggunakan routing internal untuk area:
- Daftar pasien,
- Profil pasien,
- Riwayat kunjungan,
- Hasil laboratorium.

### 11.2 Data pasien dan clinical context
Mencakup:
- Identitas dan kontak.
- Kontak darurat.
- Alert klinis (mis. alergi, komorbid).
- Riwayat kunjungan lengkap (anamnesis, temuan, rencana terapi).
- Riwayat resep per kunjungan.
- Riwayat hasil lab.

### 11.3 CRUD kunjungan dan lab
- Tambah/edit/hapus kunjungan (dengan modal konfirmasi hapus).
- Tambah/edit/hapus hasil lab.
- Filter hasil lab berdasarkan tanggal/nama tes/hasil.

---

## 12) Laporan & Analitik

### 12.1 Generator laporan
- Form pembangkitan laporan dengan jenis dan format.
- Spesifikasi input dinamis menyesuaikan tipe laporan.
- Konfirmasi sebelum laporan benar-benar ditambahkan.

### 12.2 Manajemen laporan tersimpan
- List laporan dengan metadata (nama, tanggal, jenis, format).
- Filter berdasarkan jenis dan rentang tanggal.
- Tombol aksi unduh (UI).

### 12.3 Analitik visual
- Grafik kombinasi BOR vs LOS bulanan.
- Komponen forecasting operasional terintegrasi (lihat bagian berikut).

---

## 13) Forecasting Operasional

Fitur forecasting merupakan modul analitik prediktif yang menonjol.

### 13.1 Prediksi kebutuhan stok 30 hari
Untuk tiap item:
- Prediksi kebutuhan 30 hari (`dailyUsage * 30`).
- Confidence band (low/high) dari volatilitas.
- Proyeksi saldo akhir.
- Penentuan alert berdasarkan threshold.
- Rekomendasi tindakan otomatis berbasis kondisi saldo.

### 13.2 Prediksi BOR 4 minggu
Untuk tiap RS:
- Proyeksi BOR mingguan dari baseline + tren.
- Confidence band berbasis variabilitas.
- Penanda apakah melebihi threshold.
- Rekomendasi mitigasi kapasitas otomatis.

### 13.3 Visualisasi & explainability
- Chart prediksi stok + band.
- Chart BOR per RS + garis threshold.
- Tabel alasan rekomendasi (reason list) untuk transparansi keputusan.

---

## 14) Lapisan Interoperabilitas Data Kesehatan (FHIR)

Tersedia utility adapter internal→FHIR untuk integrasi eksternal.

### 14.1 Resource yang didukung
- Patient
- Encounter
- Observation
- InventoryItem

### 14.2 Kemampuan utama
- Definisi tipe internal dan tipe FHIR.
- Validasi input per resource.
- Mapping data ke struktur FHIR yang relevan.
- Penanganan error terstruktur dengan `MappingValidationError` + daftar issue.
- API adaptasi yang mengembalikan hasil union aman (`ok: true/false`).

---

## 15) UX, Aksesibilitas, dan Kesiapan Operasional

### 15.1 UX patterns
- Konsisten memakai card, table, badge, modal.
- Banyak aksi kritikal memakai indikator warna/status.
- Responsif untuk layar kecil-besar.

### 15.2 Efisiensi interaksi
- Shortcut keyboard di panel notifikasi.
- Aksi cepat dari notifikasi ke modul tujuan.
- Drag-and-drop untuk manajemen tugas.

### 15.3 Keterkaitan antar-modul
- Dashboard → Notifikasi → Incident → Task board merupakan alur end-to-end utama yang sudah terhubung.

---

## 16) Cakupan Pengujian

Repository sudah menyertakan:
- **Unit test** untuk logic forecasting.
- **Unit test** untuk logic notifikasi/lifecycle.
- **Unit test** untuk interoperability adapters.
- **Integration test** panel notifikasi.
- **E2E test** alur operasional.

Ini menunjukkan fondasi QA sudah meng-cover business logic inti dan sebagian user journey penting.

---

## 17) Batasan Implementasi Saat Ini (Temuan Analitis)

Walau fiturnya lengkap secara modul, saat ini mayoritas data masih berbasis mock/in-memory, sehingga:
- Belum ada persistensi backend nyata.
- Belum ada autentikasi/otorisasi berbasis peran.
- Belum ada audit trail terpusat lintas modul (di luar history lokal pada fitur tertentu).
- Fitur unduh laporan masih representasi UI.
- Integrasi FHIR tersedia di layer util, namun belum dipasang ke endpoint real-time.

---

## 18) Kesimpulan

Secara fungsional, aplikasi ini sudah memiliki kerangka **command center kesehatan yang lengkap**:
- Monitoring operasional real-time (simulatif),
- Alerting + lifecycle response,
- Incident management terhubung task execution,
- Manajemen logistik, medis, SDM, distribusi, rekam pasien,
- Pelaporan + analitik + forecasting,
- Fondasi interoperabilitas FHIR,
- Serta basis testing yang baik.

Untuk naik ke tahap produksi, fokus berikutnya paling strategis adalah: integrasi backend, hardening security, observability, dan orkestrasi otomatis yang terhubung sistem eksternal.
