# Proyek Pengelolaan Basis Data Transaksi

Proyek ini adalah aplikasi web full-stack yang dibangun menggunakan Next.js dan Prisma untuk mengelola data transaksi, pelanggan, dan stok produk, sesuai dengan skenario tugas "Pengelolaan Basis Data".

## Fitur Utama

- **Manajemen Produk**: CRUD (Create, Read, Update, Delete) untuk data produk.
- **Manajemen Pelanggan**: CRUD (Create, Read, Update, Delete) untuk data pelanggan.
- **Pencatatan Penjualan**: Antarmuka kasir untuk membuat transaksi penjualan yang melibatkan banyak produk.
- **Kontrol Stok**: Stok produk divalidasi dan diperbarui secara otomatis setiap kali transaksi berhasil.
- **Laporan Penjualan**: Halaman untuk melihat riwayat transaksi.

---

## Struktur Basis Data (ERD)

Basis data ini terdiri dari empat entitas utama:

1.  **Pelanggan**: Menyimpan data pelanggan.
    - `id` (PK)
    - `nama`
    - `email`

2.  **Produk**: Menyimpan data produk.
    - `id` (PK)
    - `nama`
    - `harga`
    - `stok`

3.  **Penjualan**: Menyimpan data transaksi utama.
    - `id` (PK)
    - `tanggal`
    - `pelangganId` (FK ke Pelanggan)

4.  **DetailPenjualan**: Menyimpan rincian produk untuk setiap transaksi.
    - `id` (PK)
    - `penjualanId` (FK ke Penjualan)
    - `produkId` (FK ke Produk)
    - `jumlah`
    - `subtotal`

Relasi antar tabel sudah diatur menggunakan *foreign keys* dan `onDelete: Cascade` untuk menjaga integritas data.

---

## Panduan Instalasi dan Penggunaan

### 1. Prasyarat

- Node.js
- npm / yarn / pnpm
- PostgreSQL (atau database lain yang didukung Prisma)

### 2. Instalasi

- Clone repositori ini.
- Salin file `.env.example` menjadi `.env` dan sesuaikan `DATABASE_URL` dengan koneksi database Anda.
  ```
  DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
  ```
- Install dependensi:
  ```bash
  npm install
  ```

### 3. Migrasi Database

Jalankan migrasi untuk membuat tabel di database Anda sesuai dengan skema Prisma.

```bash
npm prisma migrate dev
```

### 4. Seeding Data (Opsional)

Isi database dengan data sampel untuk pengujian.

```bash
npm run prisma:seed
```

### 5. Menjalankan Aplikasi

Jalankan server pengembangan.

```bash
npm run dev
```

Aplikasi akan tersedia di [http://localhost:3000](http://localhost:3000).

---

## Alur Transaksi

Berikut adalah alur data saat sebuah transaksi penjualan dibuat melalui sistem:

1.  **Pemilihan Pelanggan & Produk**: Pengguna memilih pelanggan dan menambahkan satu atau lebih produk ke dalam keranjang belanja di halaman 'Create New Sale'.
2.  **Pengiriman Data**: Saat tombol 'Submit Sale' ditekan, frontend mengirim data `pelangganId` dan array `detail` (keranjang belanja) ke API endpoint `POST /api/penjualan`.
3.  **Validasi di Backend**: API menerima data dan memulai `prisma.$transaction` untuk memastikan semua proses berjalan atau gagal bersamaan.
4.  **Pengecekan Stok**: Sistem melakukan iterasi pada setiap item di keranjang dan memeriksa apakah `stok` di tabel `Produk` mencukupi. Jika ada satu saja produk yang stoknya kurang, seluruh transaksi dibatalkan dan pesan error dikirim kembali.
5.  **Pembuatan Record**: 
    - Sebuah record baru dibuat di tabel `Penjualan` dengan `pelangganId` dan `total` harga.
    - Untuk setiap item di keranjang, sebuah record baru dibuat di tabel `DetailPenjualan`, menyimpan `penjualanId`, `produkId`, `jumlah`, `hargaSatuan` saat itu, dan `subtotal`.
6.  **Update Stok**: Setelah detail penjualan dibuat, sistem mengurangi (`decrement`) nilai `stok` pada tabel `Produk` sesuai dengan jumlah yang dibeli.
7.  **Konfirmasi**: Jika semua langkah di atas berhasil, transaksi di-commit ke database dan frontend menerima respons sukses, lalu membersihkan keranjang.

