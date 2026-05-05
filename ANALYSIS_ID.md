# Analisis Proyek Save Editor Online

Dokumen ini memberikan analisis mendalam tentang arsitektur, fungsi, fitur, dan potensi peningkatan untuk proyek Save Editor Online.

## 1. Penjelasan Fungsi dan Fitur

Save Editor Online adalah alat berbasis web yang memungkinkan pengguna untuk mengedit file simpanan (*save files*) game secara langsung di browser.

### Fitur Utama:
*   **Privasi 100%**: Semua pemrosesan file dilakukan di sisi klien (browser pengguna) menggunakan JavaScript dan WebAssembly. File simpanan tidak pernah diunggah ke server.
*   **Dukungan Universal**: Mendukung berbagai engine game populer:
    *   **RPG Maker** (MV/MZ: `.rpgsave`, `.rmmzsave`)
    *   **Unity** (PlayerPrefs dalam format XML/Plist)
    *   **Ren'Py** (format `.save` berbasis Python pickle - Eksperimental)
    *   **Unreal Engine** (format `.sav` GVAS)
    *   **GameMaker** (format `.ini`, `.json`)
    *   **NaniNovel** (format `.nson`)
*   **Editor Visual**: Menyediakan antarmuka visual (Tree View) untuk mengedit variabel seperti emas (gold), status karakter, item, dan variabel lainnya tanpa perlu keahlian pemrograman.
*   **Deteksi Otomatis**: Sistem dapat mendeteksi engine game berdasarkan ekstensi file dan kontennya.
*   **Multibahasa**: Mendukung berbagai bahasa (Inggris, Jepang, Korea, dll.) dan akan segera mendukung Bahasa Indonesia.

## 2. Arsitektur Kode (Perspektif Pengembangan)

Proyek ini dibangun menggunakan **Astro** sebagai framework web dan **React** untuk komponen interaktif (editor).

### Struktur Folder Utama:
*   `src/pages/`: Berisi rute halaman web. Astro menangani routing statis dan dinamis (berdasarkan bahasa).
*   `src/components/`: Berisi komponen UI React.
    *   `EditorApp.tsx`: Komponen utama yang menangani unggahan file.
    *   `SaveEditor.tsx`: Menangani logika parsing file dan pemilihan editor yang sesuai.
    *   `JsonEditor.tsx`: Komponen untuk mengedit struktur data JSON secara visual.
*   `src/lib/parsers/`: Inti dari logika aplikasi. Setiap engine memiliki parser sendiri (misal: `rpgmaker.ts`, `unity.ts`).
*   `src/i18n/`: Berisi konfigurasi dan kamus terjemahan untuk internasionalisasi.

### Cara Menambahkan Parser Baru:
1.  Buat file parser baru di `src/lib/parsers/NamaEngine.ts`.
2.  Implementasikan fungsi `parseNamaEngine(file: File)` yang mengembalikan `Promise<ParseOutcome>`.
3.  Implementasikan fungsi `buildNamaEngine(originalFile: File, data: any)` untuk mengonversi data kembali ke format aslinya.
4.  Daftarkan engine baru di `src/lib/parsers/types.ts` dalam tipe `ParserEngine`.
5.  Tambahkan logika deteksi di `src/components/SaveEditor.tsx` di dalam `useEffect` yang memanggil fungsi parse tersebut.

## 3. Peningkatan yang Disarankan

Berdasarkan analisis kode, berikut adalah beberapa area yang dapat ditingkatkan:

### Peningkatan Deteksi File (Permintaan Pengguna):
*   **Heuristik Konten**: Selain ekstensi file, tingkatkan deteksi berdasarkan tanda tangan biner (magic bytes) di awal file. Contoh: File Unreal Engine selalu dimulai dengan "GVAS".
*   **Dukungan Engine Tambahan**: Menambahkan parser untuk engine seperti Godot (format `.tres`/`.res` atau konfigurasi khusus) atau engine lama seperti RPG Maker VX Ace (yang saat ini masih sulit diedit di browser karena format Ruby Marshal).

### Optimasi Performa:
*   **Web Workers**: Untuk file yang sangat besar (seperti save file Palworld yang bisa mencapai puluhan MB), pemrosesan di main thread dapat membuat browser membeku. Memindahkan logika parsing ke Web Worker akan menjaga UI tetap responsif.
*   **Virtual Scrolling**: Gunakan virtual scrolling pada editor JSON jika struktur data sangat dalam atau besar agar rendering lebih cepat.

### Kualitas Kode (Refactoring):
*   **Abstraksi Parser**: Saat ini `SaveEditor.tsx` memiliki blok `if-else` yang besar untuk mendeteksi file. Ini bisa direfaktorisasi menggunakan pola *Strategy* atau *Registry* agar lebih modular.
*   **Validasi Skema**: Gunakan pustaka validasi seperti `Zod` untuk memastikan data yang diedit tetap sesuai dengan skema yang diharapkan oleh game, guna meminimalkan risiko file korup.

### Fitur Baru:
*   **Backup Otomatis**: Secara otomatis mengunduh salinan asli file sebelum edisi pertama diterapkan.
*   **Batch Editing**: Kemampuan untuk mengubah banyak nilai sekaligus (misalnya "Set semua stats ke 99").

## 4. Kesimpulan
Proyek ini memiliki fondasi yang kuat untuk menjadi alat editor save file yang universal. Fokus utama selanjutnya adalah meningkatkan cakupan deteksi otomatis dan memastikan stabilitas saat menangani file berukuran besar.
