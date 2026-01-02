# Aplikasi Keuangan Studio Foto (Berbasis Google Sheets)

Dokumen ini adalah **ringkasan final sistem** sekaligus **desain halaman aplikasi** (app-like) sesuai seluruh kebutuhan yang sudah kita bahas. Tujuannya: Google Sheets terasa seperti aplikasi operasional harian studio foto.

---

## 1️⃣ Struktur Halaman Aplikasi (Sheet Utama)

### 🏠 1. Dashboard (HOME)

**Fungsi:** Halaman utama owner

**Isi utama:**

* Total Omzet Bulan Ini
* Laba Bersih Bulan Ini
* Jumlah Klien
* Rata-rata Omzet / Klien
* Total Gaji + Bonus

**Grafik:**

* Omzet vs Laba (Bulanan)
* Komposisi Biaya (Fix Cost, Gaji+Bonus, Variabel)
* Top 5 Invoice Paling Untung
* Tambahan Paling Laku

➡️ *Read-only, owner only*

---

### 🛒 2. Master Produk & Layanan

(Sheet: `Master_Produk`)

**Fungsi:** Daftar seluruh paket & tambahan yang bisa dijual ke klien

**Kolom inti:**

* ID_Produk
* Nama_Produk
* Kategori (Paket / Tambahan)
* Harga_Jual
* Satuan (Paket / Orang / File / Cetak)
* Aktif (YA / TIDAK)

**Contoh isi:**

* P001 | Paket Studio Basic | Paket | 300.000 | Paket | YA
* T001 | Tambah Orang | Tambahan | 50.000 | Orang | YA
* T002 | Tambah Edit | Tambahan | 30.000 | File | YA
* T003 | Cetak 10R | Tambahan | 20.000 | Cetak | YA

➡️ *Owner only*

---

### 🧾 3. Input Transaksi Klien

(Sheet: `Transaksi_Penjualan`)

**Dipakai oleh:** Admin

**Konsep:** 1 Invoice = Banyak Baris (item)

**Perubahan penting:**

* `ID_Produk` dipilih dari **Master_Produk (dropdown)**
* Harga & Jenis_Item **otomatis terisi**

**Kolom penting:**

* Tanggal
* No_Invoice
* ID_Klien
* ID_Produk
* Nama_Produk (auto)
* Jenis_Item (auto)
* Qty
* Harga_Satuan (auto)
* Total_Tagihan

**Aturan penting:**

* Paket dasar = 1 baris
* Tambahan orang / edit / cetak = baris terpisah

➡️ Data ini jadi dasar omzet, profit invoice, dan dashboard

---

### 🧾 2. Input Transaksi Klien

(Sheet: `Transaksi_Penjualan`)

**Dipakai oleh:** Admin

**Konsep:** 1 Invoice = Banyak Baris (item)

**Kolom penting:**

* Tanggal
* No_Invoice
* ID_Klien
* Paket / Nama Item
* Jenis_Item (Paket / Tambahan)
* Harga
* Diskon
* Total_Tagihan

**Aturan penting:**

* Paket dasar = 1 baris
* Tambahan orang / edit / cetak = baris terpisah

➡️ Data ini jadi dasar omzet, profit invoice, dan dashboard

---

### 👥 3. Database Klien

(Sheet: `Database_Klien`)

**Fungsi:** Master data klien

**Hanya diisi sekali**, lalu dipanggil otomatis saat transaksi

---

### 📋 4. Log Tugas & Bonus (Harian)

(Sheet: `Log_Tugas`)

**Dipakai oleh:** Admin

**Fungsi:** Mencatat pekerjaan nyata yang selesai

**Kolom inti:**

* Tanggal
* Periode (Jan-2025)
* ID_Karyawan
* ID_Tugas
* Jumlah Tugas
* Bonus_Terhitung (otomatis)
* Status (Pending / Approved)

➡️ Bonus **hanya dihitung jika Approved oleh Owner**

---

### 💼 5. Master Tugas

(Sheet: `Master_Tugas`)

**Fungsi:** Daftar jenis pekerjaan + nilai bonus

**Contoh:**

* Foto studio selesai
* Editing tambahan
* Tambah orang
* Event khusus

➡️ Owner only

---

### 🧑‍💼 6. Penggajian Bulanan

(Sheet: `Penggajian`)

**Fungsi:** Rekap gaji tetap + bonus bulanan

**Alur:**

* Gaji pokok → dari `Master_Karyawan`
* Bonus → otomatis dari `Log_Tugas`
* Total gaji → masuk laporan laba rugi

➡️ Dibuat otomatis per bulan (Generate Payroll)

---

### 💸 7. Biaya Operasional

(Sheet: `Biaya_Operasional`)

**Untuk biaya variabel & vendor**

**Kolom tambahan penting:**

* Ref_Invoice (jika biaya terkait klien tertentu)

**Contoh:**

* Freelance fotografer
* Cetak ke vendor

---

### 🏢 8. Fix Cost

(Sheet: `Fix_Cost`)

**Fungsi:** Biaya tetap bulanan

**Contoh:**

* Sewa
* Internet
* Software

➡️ Diposting otomatis tiap bulan

---

### 📈 9. Profit per Invoice

(Sheet: `Profit_Invoice`)

**Fungsi:** Analisa keuntungan tiap invoice

**Perhitungan:**

* Total pendapatan invoice
* Total biaya terkait invoice
* Profit invoice

➡️ Owner bisa tahu invoice mana sehat / tidak

---

### 📊 10. Laporan Laba Rugi

(Sheet: `Laporan_Laba_Rugi`)

**Otomatis & real-time**

**Komponen:**

* Pendapatan
* Fix Cost
* Biaya Operasional
* Gaji + Bonus
* Laba Bersih

---

## 2️⃣ Hak Akses (App-like)

| Peran | Akses                                |
| ----- | ------------------------------------ |
| Admin | Input transaksi, log tugas, biaya    |
| Owner | Approve, payroll, laporan, dashboard |

➡️ Gunakan *Protect Sheet & Range*

---

## 3️⃣ Alur Operasional Singkat

**Harian:**

* Admin input transaksi & log tugas

**Akhir Bulan:**

* Owner approve bonus
* Generate payroll
* Cek dashboard & laba rugi

⏱️ ±10–15 menit / bulan

---

## 4️⃣ Hasil Akhir Sistem

✅ Terasa seperti aplikasi
✅ Transparan & audit-friendly
✅ Bonus adil berbasis kerja nyata
✅ Owner pegang kendali penuh

---

**Status Sistem:**

> ✔ Siap Go-Live
