# Analisis Proyek Save Editor Online (Diperbarui)

Dokumen ini memberikan analisis mendalam tentang arsitektur, fungsi, fitur, dan peningkatan terbaru untuk proyek Save Editor Online.

## 1. Penjelasan Fungsi dan Fitur

Save Editor Online adalah alat berbasis web yang memungkinkan pengguna untuk mengedit file simpanan (*save files*) game secara langsung di browser.

### Fitur Utama:
*   **Privasi 100%**: Semua pemrosesan file dilakukan di sisi klien (browser pengguna) menggunakan JavaScript dan WebAssembly. File simpanan tidak pernah diunggah ke server.
*   **Dukungan Universal**: Mendukung berbagai engine game populer (RPG Maker, Unity, Ren'Py, Unreal, Godot, dll.).
*   **Deteksi Heuristik (Baru)**: Sistem sekarang menggunakan *magic bytes* untuk mendeteksi engine game dengan akurasi tinggi, bahkan jika ekstensi filenya tidak umum.
*   **Pengeditan Batch (Baru)**: Fitur "⚡ Batch Actions" memungkinkan modifikasi massal seperti memaksimalkan emas atau level semua karakter dengan satu klik.
*   **Backup Otomatis (Baru)**: Menyarankan unduhan cadangan file asli sebelum menyimpan perubahan untuk mencegah korupsi data.
*   **Dukungan Mobile (Baru)**: Terintegrasi dengan Capacitor untuk mendukung aplikasi Android (APK/AAB).

## 2. Arsitektur Kode dan Inovasi Terbaru

Proyek ini telah direfaktorisasi untuk meningkatkan modularitas dan performa.

### Struktur Folder Utama:
*   `src/lib/parsers/`: Logika parsing engine.
    *   `registry.ts`: **(Pusat Navigasi)** Menggunakan pola *Strategy* untuk mendaftarkan dan memilih parser berdasarkan ekstensi atau heuristik.
*   `src/lib/workers/`: **(Optimasi Performa)** Menggunakan Web Workers untuk menangani parsing file besar (>5MB) di background thread, menjaga UI tetap responsif.
*   `src/lib/detection/`: Logika deteksi biner (heuristik).
*   `src/components/BatchEditor.tsx`: Menangani logika modifikasi massal berdasarkan format file.

### Alur Kerja Deteksi & Parsing:
1.  File dipilih oleh pengguna.
2.  `SaveEditor.tsx` memanggil `getParserForFile` dari Registry.
3.  Registry memeriksa byte awal file (heuristik) atau ekstensi.
4.  Jika file besar, Web Worker dipanggil. Jika kecil, parsing dilakukan langsung.
5.  Data JSON dikirim ke UI untuk diedit.

## 3. Detail Implementasi Engine (Contoh)

### Godot Engine:
Mendukung format `.save` (JSON), `.res`, dan `.tres` (TextResource). Deteksi dilakukan dengan mencari string `[gd_resource]` atau `[gd_scene]`.

### Unreal Engine (GVAS):
Mendukung format `.sav`. Menggunakan pustaka `uesavetool` untuk konversi GVAS ke JSON. Menangani berbagai jenis kompresi (zlib, gzip).

## 4. Peningkatan Masa Depan

*   **Peningkatan WebAssembly**: Menggunakan modul WASM untuk dekompresi file yang lebih cepat.
*   **Cloud Sync (Opsional)**: Integrasi dengan Google Drive/Dropbox untuk menyimpan file cadangan secara otomatis (dengan izin pengguna).
*   **Dukungan Plugin**: Memungkinkan komunitas menambahkan parser mereka sendiri melalui file konfigurasi JSON sederhana.

## 5. Kesimpulan
Dengan implementasi Registry, Web Workers, dan Heuristik biner, Save Editor Online kini lebih tangguh, cepat, dan mudah dikembangkan. Penambahan fitur Backup dan Batch meningkatkan pengalaman pengguna secara signifikan.
