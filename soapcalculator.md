# Soap Calculator

Dokumentasi sumber untuk **Soap Calculator (Multiple Oils)** berdasarkan file HTML terlampir.

## 1. Identitas

- **Judul:** Soap Calculator (Multiple Oils)
- **Jenis:** Kalkulator resep sabun berbasis web
- **Bahasa antarmuka:** Inggris dengan beberapa label Bahasa Indonesia
- **Input utama:** jenis minyak, berat minyak, jenis sabun, dan persentase parfum kustom.

## 2. Daftar Minyak dan Nilai SAP NaOH

Nilai berikut diambil dari atribut `value` pada pilihan minyak di sumber:

| Minyak | SAP NaOH |
|---|---:|
| Palm | 0.141 |
| Coconut (refined) | 0.190 |
| Olive Oil | 0.134 |
| Sunflower | 0.134 |
| Almond (Sweet) | 0.136 |
| Apricot kernel | 0.135 |
| Arachis | 0.136 |
| Avocado | 0.133 |
| Babassu | 0.175 |
| Beef Tallow | 0.1405 |
| Borage Oil | 0.136 |
| Brazil Nut Oil | 0.175 |
| Butterfat (cow) | 0.1619 |
| Butterfat (goat) | 0.1672 |
| Camelia oil | 0.136 |
| Castor | 0.1286 |
| Chicken fat | 0.1389 |
| Chinese Bean | 0.135 |
| Cocoa Butter | 0.137 |
| Coconut (virgin) | 0.1946 |
| Cod Liver Oil | 0.1326 |
| Coffee Seed Oil | 0.130 |
| Colza | 0.124 |
| Corn (Maize) | 0.136 |
| Cottonseed | 0.1386 |
| Deer Tallow | 0.1379 |
| Earthnut | 0.136 |
| Emu oil | 0.135 |
| Evening Primrose | 0.136 |
| Flaxseed | 0.1357 |
| Gigely Tree | 0.133 |
| Goat Tallow | 0.1383 |
| Goose Fat | 0.1369 |
| Grapeseed | 0.1265 |
| Grapefruit Seed Oil | 0.123 |
| Hazelnut | 0.1356 |
| Hemp Seed | 0.1345 |
| Herring Oil | 0.136 |
| Illippe Butter | 0.136 |
| Jojoba | 0.069 |
| Kapok | 0.137 |
| Katchung | 0.136 |
| Kokum Butter | 0.134 |
| Kukui Nut | 0.135 |
| Lard | 0.138 |
| Linseed | 0.1357 |
| Loccu | 0.134 |
| Macadamia Nut | 0.139 |
| Mango Butter | 0.135 |
| Mink Oil | 0.140 |
| Moringa | 0.136 |
| Mustard Seed Oil | 0.1241 |
| Myrtle oil | 0.069 |
| Neat’s Foot Oil | 0.1359 |
| Neem | 0.1387 |
| Niger Seed Oil | 0.1355 |
| Nutmeg Butter | 0.116 |
| Olive Butter | 0.185 |
| Palm Kernel | 0.156 |
| Peanut | 0.136 |
| Perilla | 0.1369 |
| Pistachio Oil | 0.135 |
| Poppy Seed Oil | 0.1383 |
| Pork Tallow | 0.138 |
| Pumpkin Seed | 0.1331 |
| Ramic | 0.124 |
| Rape Seed (Canola) | 0.124 |
| Rice Bran | 0.128 |
| Ricinus | 0.1286 |
| Safflower | 0.136 |
| Sardine Oil | 0.135 |
| Sesame Seed | 0.133 |
| Shea (Karite) Butter | 0.128 |
| Sheeps Tallow | 0.1383 |
| Soybean | 0.135 |
| Tung | 0.1377 |
| Vegetable Shortening | 0.136 |
| Venison Fat | 0.139 |
| Walnut | 0.1353 |
| Wheatgerm | 0.131 |
| Beeswax | 0.069 |
| Carnauba Wax | 0.069 |
| Lanolin | 0.0741 |

> Catatan: sumber juga memiliki beberapa pilihan minyak yang muncul lebih dari sekali pada HTML. Tabel di atas merangkum nama/nilai yang unik.

## 3. Jenis Sabun

Kalkulator menyediakan dua pilihan:

1. **Sabun Mandi Batang**
   - Menggunakan NaOH.
   - Air = `total NaOH × 2.5`.
   - Parfum default = 3% dari total minyak.

2. **Sabun Mandi Cair**
   - Menggunakan KOH.
   - Konversi KOH dari kebutuhan NaOH menggunakan faktor `1.403`.
   - Air = `total KOH × 2.0`.
   - Parfum default = 1.5% dari total minyak.

## 4. Input Minyak

Setiap entri minyak memiliki:

- **Oil Type**
- **Weight (grams)**

Tombol **+ Add Another Oil** menggandakan blok input minyak sehingga pengguna dapat memasukkan beberapa jenis minyak.

## 5. Perhitungan

Untuk setiap minyak:

```text
NaOH untuk minyak = SAP NaOH × berat minyak
```

Total:

```text
Total Oil = jumlah seluruh berat minyak
Total NaOH = jumlah seluruh (SAP NaOH × berat minyak)
```

Untuk sabun cair:

```text
Total KOH = Total NaOH × 1.403
```

### Air

Sabun batang:

```text
Air = Total NaOH × 2.5
```

Sabun cair:

```text
Air = Total KOH × 2.0
```

### Parfum

Jika pengguna tidak menggunakan persentase kustom:

```text
Sabun batang = Total Oil × 3%
Sabun cair   = Total Oil × 1.5%
```

Jika persentase kustom diaktifkan:

```text
Parfum = Total Oil × (persentase parfum / 100)
```

## 6. Output

Hasil kalkulator menampilkan:

- Total Oil
- NaOH (untuk sabun batang) atau KOH (untuk sabun cair)
- Required Water
- Required Fragrance

Semua hasil ditampilkan dengan dua angka desimal.

## 7. Logika Utama

Pseudocode:

```text
ambil jenis sabun
ambil pilihan parfum kustom

totalOil = 0
totalLye = 0
totalKOH = 0

untuk setiap minyak:
    baca SAP NaOH
    baca berat minyak

    jika berat > 0:
        totalLye += SAP × berat
        totalKOH += (SAP × berat) × 1.403
        totalOil += berat

jika parfum kustom aktif:
    fragrancePercent = input / 100
jika tidak:
    jika sabun batang:
        fragrancePercent = 0.03
    jika sabun cair:
        fragrancePercent = 0.015

fragrance = totalOil × fragrancePercent

jika sabun batang:
    lye = totalLye
    water = totalLye × 2.5
    gunakan NaOH
jika sabun cair:
    lye = totalKOH
    water = totalKOH × 2.0
    gunakan KOH

tampilkan hasil
```

## 8. Catatan Sumber

Dokumen ini merupakan ekstraksi dan penyusunan ulang isi file HTML sumber. Rumus, faktor konversi, nilai SAP, jenis sabun, serta persentase parfum dipertahankan sebagaimana terdapat pada sumber dan tidak divalidasi atau dikoreksi terhadap referensi formulasi eksternal.

Sumber HTML mendefinisikan judul sebagai **“Soap Calculator (Multiple Oils)”** dan menyediakan input minyak serta berat dalam gram. fileciteturn0file0L69-L85

Logika perhitungan sumber menggunakan SAP untuk menghitung NaOH, faktor `1.403` untuk KOH, rasio air `2.5` untuk NaOH dan `2.0` untuk KOH, serta parfum default 3% untuk sabun batang dan 1.5% untuk sabun cair. fileciteturn0file0L213-L245
