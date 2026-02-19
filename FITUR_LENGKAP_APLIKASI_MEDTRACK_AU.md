# Fitur Lengkap Aplikasi MedTrack AU

Dokumen ini merangkum fitur yang sudah tersedia saat ini pada aplikasi.

---

## 1. Fondasi Aplikasi

- Arsitektur SPA React + TypeScript.
- Navigasi berbasis view utama (dashboard komando dan 7 modul operasional).
- Dukungan tema terang/gelap (light/dark) dengan persistensi preferensi.
- Layout responsif: sidebar, header, dan area konten utama.

---

## 2. Modul Dashboard (Pusat Komando)

### 2.1 KPI Ringkas
- Total pasien aktif.
- Persentase stok obat/alkes.
- Kapasitas rumah sakit.
- Jumlah distribusi logistik.

### 2.2 Monitoring Status RS
- Ketersediaan tempat tidur.
- Status IGD (Normal/Sibuk/Kritis).
- Utilisasi kamar operasi.
- Kesiapan ambulans.

### 2.3 Notifikasi Prioritas
- Prioritas notifikasi: rendah/sedang/tinggi.
- Menampilkan waktu kejadian, deskripsi, dan lokasi.
- Update notifikasi dinamis berdasarkan kondisi kritis.

### 2.4 Kinerja SDM dan Logistik
- Distribusi personel.
- Utilisasi rata-rata personel.
- Tren logistik per kategori.
- Tabel item stok rendah/kritis.

### 2.5 Live Update Simulation
- Indikator status live/updating.
- Timestamp pembaruan terakhir.
- Simulasi perubahan data periodik untuk observasi operasional.

---

## 3. Modul Logistik & Stok

- Daftar inventaris dengan kategori (obat, alkes, bahan medis, APD).
- Informasi stok saat ini, kapasitas, threshold kritis, dan update terakhir.
- Kemampuan filter/pencarian item.
- Riwayat pergerakan stok (masuk/keluar) per item.
- Indikator visual level stok untuk prioritas restock.

---

## 4. Modul Pelayanan Medis

- Jadwal operasi harian.
- Status operasi (terjadwal, berlangsung, selesai, batal).
- Daftar dokter spesialis beserta status ketersediaan.
- Filter berdasarkan status.
- Penambahan jadwal operasi baru melalui modal form.

---

## 5. Modul SDM & Personel

- Daftar personel medis/nonmedis.
- Status personel (aktif/cuti).
- Informasi peran, departemen, dan kontak.
- Fitur manajemen data personel (lihat/filter/update sesuai UI yang tersedia).

---

## 6. Modul Riwayat Pasien

- Data profil pasien (identitas, kontak, emergency contact).
- Riwayat kunjungan medis.
- Riwayat diagnosis, catatan dokter, dan rencana terapi.
- Data resep obat pada setiap kunjungan.
- Riwayat hasil laboratorium dan alert medis.

---

## 7. Modul Distribusi

- Pelacakan pengiriman logistik dari asal ke tujuan.
- Status pengiriman (menunggu, dalam perjalanan, terkirim, terlambat).
- Data ETA dan petugas/driver pengiriman.
- Kontrol operasional untuk melihat prioritas distribusi.

---

## 8. Modul Jadwal & Tugas

- Manajemen tugas tim operasional.
- Informasi PIC, deskripsi, dan due date.
- Penjadwalan event mingguan.
- Dukungan interaksi manajemen tugas berbasis UI (termasuk alur drag-drop jika tersedia di halaman).

---

## 9. Modul Laporan & Analitik

- Daftar laporan periodik.
- Metadata laporan (jenis, tanggal generate, format).
- Dukungan format ekspor (PDF/CSV/XLSX).
- Analitik indikator bulanan (contoh: BOR, LOS).

---

## 10. Komponen UI & UX Pendukung

- Sidebar dengan menu dan badge notifikasi.
- Header dengan identitas pengguna, notifikasi, pengaturan, dan toggle tema.
- Komponen reusable: card statistik, tabel status, panel notifikasi, modal, grafik/tren.
- Tema visual modern berbasis utility classes dan dark mode compatibility.

---

## 11. Kesiapan Pengembangan Lanjutan

Aplikasi ini sudah memiliki fondasi modul yang lengkap untuk command center kesehatan, dan siap ditingkatkan ke tahap produksi melalui:
- Integrasi backend real-time.
- Penguatan keamanan & audit.
- Otomasi alert dan orkestrasi insiden.
- Penguatan testing dan observability.

