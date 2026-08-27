Tolong buatkan kode website Landing Page / Single Page Application (SPA) Multi-Produk Katalog & Listing Wilayah dengan desain Tailwind CSS identik (Modern Navy/Royal Blue #1e3a8a & Brand Orange #f97316).

Silakan buatkan website ini untuk wilayah: [GANTI: NAMA KOTA / KABUPATEN, contoh: Kota Depok / Kabupaten Bogor / Kota Bekasi / DKI Jakarta]

Berikut adalah spesifikasi teknis dan aturan logika yang WAJIB diterapkan:

1. ARSITEKTUR 3 DATA EKSTERNAL (CSV):
Website harus memuat dan mengurai (parse) 3 endpoint CSV eksternal via fetch (dengan fallback data lokal jika offline):
- CSV Produk (URL: [GANTI URL/Gunakan Default]): Berisi data produk sabun deterjen, parfum laundry grade A, pelembut, pelicin setrika, dan kimia pembersih (kolom: id, slug, title, category, price, unit, image, description, fitur).
- CSV Nomor Telepon/CS (URL: [GANTI URL/Gunakan Default]): Berisi nomor WhatsApp kontak resmi CS (kolom: id, namaKontak, nomorWA, formatted, area, status).
- CSV Wilayah (URL: [GANTI URL/Gunakan Default]): Berisi daftar seluruh kecamatan dan desa/kelurahan di [NAMA WILAYAH TARGET] (kolom: kota, kecamatan, kelurahan, isJakarta, deskripsi).

2. TEMA DAN NARASI UTAMA (HOMEPAGE):
- Halaman beranda menceritakan tentang pusat penjualan/distribusi sabun deterjen cair matic konsentrat dan parfum laundry grade A (wangi tahan hingga 14 hari, standar hotel/laundry kiloan).
- Hero section, badge keunggulan, dan FAQ berfokus pada suplai kebutuhan laundry, hotel, dan rumah tangga di [NAMA WILAYAH TARGET].

3. LOGIKA ROUTING DAN NAVIGASI PERSISTEN DUA ARAH (TWO-WAY STATE PERSISTENCE):
- Jika pengguna memilih lokasi (Kecamatan atau Desa/Kelurahan), state lokasi tersebut harus tersimpan. Saat pengguna mengklik salah satu produk, halaman detail produk langsung menampilkan target wilayah tersebut tanpa menghilangkan lokasi yang sudah dipilih.
- Sebaliknya, jika pengguna membuka detail produk terlebih dahulu lalu memilih kecamatan/desa, detail produk langsung menyesuaikan teks penawaran, judul, dan link pemesanan WhatsApp untuk lokasi tersebut tanpa me-reset halaman dari awal.
- Tombol order WhatsApp di sidebar/kartu otomatis menyusun format pesan lengkap dengan nama produk, harga, dan wilayah tujuan yang dipilih.

4. PAGINATION DINAMIS (DOUBLE & SINGLE ARROW):
- Katalog produk di halaman beranda memiliki kontrol pagination dinamis dengan pembatasan maksimal 3 halaman.
- Tombol pagination wajib memiliki kontrol lengkap:
  * Double Arrow Left (« First Page)
  * Single Arrow Left (‹ Prev Page)
  * Angka Halaman (1, 2, 3)
  * Single Arrow Right (› Next Page)
  * Double Arrow Right (» Last Page)

5. ATURAN FOOTER AREA WILAYAH:
- Pada bagian footer grid daftar kecamatan, HANYA tampilkan nama kecamatannya saja (contoh: [Kecamatan A] • [Kecamatan B] • [Kecamatan C]), TANPA kata tambahan seperti "Laundry" di depannya.
- Setiap nama kecamatan di footer dapat diklik untuk membuka halaman detail kecamatan tersebut beserta daftar desa/kelurahannya.

6. SEO DINAMIS & OPENGRAPH SOCIAL META:
- Meta title, meta description, OpenGraph (og:title, og:description, og:image, og:url), dan Twitter Cards harus diperbarui secara real-time via JavaScript mengikuti produk dan wilayah yang sedang aktif dibuka pengguna. Format title: [Nomor CS] [Nama Produk / Layanan] Di [Kelurahan] [Kecamatan] [Kota/Kabupaten].

7. FLOATING WHATSAPP WIDGET & POPUP ORDER:
- Widget WhatsApp mengambang di pojok kanan bawah dengan form pemesanan interaktif (Nama, No WA, Dropdown Produk, Dropdown Kecamatan [NAMA WILAYAH TARGET], Catatan Alamat).
- Saat tombol kirim ditekan, form otomatis membuka WhatsApp API dengan pesan terformat rapi.

Mohon berikan:
1. Kode lengkap satu file HTML (lengkap dengan CSS Tailwind, JavaScript Router, CSV Parser, dan fallback data lengkap untuk seluruh kecamatan di [NAMA WILAYAH TARGET]).
2. Struktur data CSV Wilayah ([NAMA WILAYAH TARGET]) dengan daftar kecamatan dan kelurahan lengkapnya.
