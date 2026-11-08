// All user-facing text lives here (Bahasa Indonesia). Code and comments stay in English.

export const id = {
  appName: "Berangkat Tepat Waktu",

  nav: {
    home: "Beranda",
    pet: "Pet Saya",
    history: "Riwayat",
    settings: "Pengaturan",
  },

  common: {
    save: "Simpan",
    cancel: "Batal",
    edit: "Ubah",
    delete: "Hapus",
  },

  // Index 0 = Sunday .. 6 = Saturday, matching Date.getDay().
  days: ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"],

  shell: {
    mainNavLabel: "Navigasi utama",
    demoBanner: "MODE DEMO aktif: check-in disimulasikan, bukan dari GPS.",
    storageWarning:
      "Data tidak bisa disimpan di browser ini. Perubahan akan hilang saat halaman ditutup.",
    loadIssuesWarning: "Sebagian data tersimpan rusak dan dikembalikan ke awal.",
  },

  validation: {
    required: "Wajib diisi.",
    invalidTime: "Format jam harus JJ:MM, contoh 08:30.",
    invalidNumber: "Isi dengan angka.",
    latitudeRange: "Lintang harus antara -90 dan 90.",
    longitudeRange: "Bujur harus antara -180 dan 180.",
    radiusPositive: "Radius harus lebih dari 0 meter.",
    travelNegative: "Waktu perjalanan tidak boleh negatif.",
    invalidDay: "Pilih hari.",
    campusRequired: "Atur lokasi kampus dulu di bagian Kampus sebelum menambah jadwal.",
  },

  settings: {
    title: "Pengaturan",
    campusTitle: "Kampus",
    campusHint:
      "Titik kampus dipakai untuk cuaca dan untuk memeriksa apakah kamu sudah sampai.",
    campusName: "Nama kampus",
    latitude: "Lintang (latitude)",
    longitude: "Bujur (longitude)",
    radius: "Radius (meter)",
    defaultTravel: "Waktu perjalanan bawaan (menit)",
    useMyLocation: "Pakai lokasi saya",
    locating: "Membaca lokasi…",
    locationUnsupported: "Browser ini tidak mendukung lokasi.",
    saved: "Tersimpan.",
    campusOutOfSync: "Beberapa jadwal masih memakai titik kampus yang lama.",
    applyToSchedules: (count: number) => `Terapkan ke ${count} jadwal`,
    appliedToSchedules: "Titik kampus diterapkan ke semua jadwal.",

    scheduleTitle: "Jadwal Kuliah",
    scheduleEmpty: "Belum ada jadwal kuliah.",
    scheduleAdd: "Tambah jadwal",
    scheduleAddTitle: "Tambah jadwal",
    scheduleEditTitle: "Ubah jadwal",
    courseName: "Nama mata kuliah",
    dayOfWeek: "Hari",
    startTime: "Jam mulai",
    scheduleCampusName: "Nama kampus",
    travelMinutes: "Waktu perjalanan (menit)",
    travelSummary: (minutes: number) => `${minutes} menit perjalanan`,
    deleteTitle: (course: string) => `Hapus jadwal ${course}?`,
    deleteMessage: "Riwayat check-in untuk kelas ini tetap tersimpan.",
    editAria: (course: string) => `Ubah jadwal ${course}`,
    deleteAria: (course: string) => `Hapus jadwal ${course}`,

    autoGpsTitle: "GPS Otomatis",
    autoGpsToggle: "Aktifkan GPS otomatis",
    autoGpsWindow: (before: number, after: number) =>
      `Jendela check-in: mulai ${before} menit sebelum kelas sampai ${after} menit setelah kelas dimulai. Di luar jendela itu, lokasi tidak dibaca sama sekali.`,
    autoGpsConfirm:
      "Saat kamu terdeteksi di area kampus, kamu tetap harus mengetuk konfirmasi. Check-in tidak pernah dicatat otomatis.",
    autoGpsPermission: "Browser akan meminta izin lokasi saat GPS otomatis mulai membaca.",
    autoGpsDemoNote: "Mode Demo sedang menyala, jadi GPS otomatis tidak berjalan.",

    demoTitle: "Mode Demo",
    demoToggle: "Aktifkan Mode Demo",
    demoExplanation:
      "Mode Demo mensimulasikan posisi di dalam area kampus supaya alur XP dan pet bisa dicoba tanpa GPS. Check-in Demo selalu diberi label DEMO dan tidak pernah dianggap terverifikasi GPS. Jendela waktu check-in tetap berlaku.",

    dataTitle: "Data",
    sampleButton: "Muat data contoh",
    sampleHint:
      "Mengisi aplikasi dengan data contoh (pet Telur 75/100 XP, streak 3 hari, satu kelas hari ini) untuk mencoba tampilan. Ini bukan data nyata.",
    sampleTitle: "Muat data contoh?",
    sampleMessage:
      "Data contoh akan mengganti jadwal, check-in, XP, dan pet yang ada sekarang. Semua check-in contoh diberi label DEMO dan bukan dari GPS. Ekspor dulu data lama kalau masih dibutuhkan.",
    sampleConfirm: "Ya, muat contoh",
    sampleDone: "Data contoh dimuat. Aktifkan Mode Demo untuk mencoba check-in tanpa GPS.",
    clearButton: "Hapus semua data",
    clearTitle: "Hapus semua data?",
    clearMessage:
      "Semua jadwal, check-in, XP, dan pengaturan di browser ini akan dihapus. Tindakan ini tidak bisa dibatalkan.",
    clearConfirm: "Ya, hapus semua",

    aboutTitle: "Tentang aplikasi ini",
    aboutMotivation:
      "Berangkat Tepat Waktu adalah alat motivasi, bukan sistem absensi resmi. XP dan pet tidak bisa ditukar dengan nilai atau uang.",
    aboutSpoof:
      "GPS di browser bisa dipalsukan. Aplikasi ini hanya memakai pemeriksaan sederhana (jendela waktu, akurasi, kesegaran data, satu check-in per kelas per hari, dan penanda perjalanan tidak wajar). Tidak ada verifikasi WiFi, deteksi lokasi palsu, atau verifikasi server.",
    aboutReAdd:
      "Satu check-in per kelas per hari berlaku untuk kelas yang sama. Kalau sebuah kelas dihapus lalu ditambahkan lagi, kelas itu dihitung sebagai kelas baru, jadi check-in kedua di hari yang sama tidak diblokir. Kamu juga menyusun jadwalmu sendiri, sehingga kelas tambahan bisa dibuat kapan saja. Karena itu XP di sini hanya penyemangat, bukan bukti kehadiran.",
    aboutPrivacy:
      "Semua data tersimpan hanya di browser ini. Tidak ada akun dan tidak ada server. Satu-satunya permintaan jaringan adalah cuaca dari Open-Meteo, dengan titik kampus yang dibulatkan. Posisi kamu tidak pernah disimpan.",
  },

  // Month names, index 0 = January.
  months: [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ],

  // Index 0 = Sunday, matching Date.getDay().
  daysShort: ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"],

  home: {
    checkInButton: "Saya sudah sampai",
    reading: "Membaca lokasi…",
    noClassesToday: "Tidak ada kuliah hari ini.",
    addClassLink: "Tambah jadwal kuliah",
    noSchedulesYet: "Belum ada jadwal kuliah.",
    firstRunTitle: "Mulai dari sini",
    firstRunBody:
      "Atur lokasi kampus dan tambahkan jadwal kuliah supaya aplikasi bisa menghitung jam berangkat.",
    openSettings: "Buka Pengaturan",
    todayTitle: "Tugas hari ini",
    streakChip: (days: number) => `Streak ${days} hari`,
    streakWeekLabel: "Streak 7 hari terakhir",
    weekStatus: {
      good: "tepat waktu",
      missed: "terlewat",
      none: "tidak ada kuliah",
      pending: "belum check-in",
    },
    taskState: {
      selesai: "Selesai",
      berikutnya: "Berikutnya",
      nanti: "Nanti",
      terlewat: "Terlewat",
    },
    departAt: (time: string) => `Berangkat pukul ${time}`,
    departPassed: (time: string) => `Seharusnya berangkat pukul ${time}. Berangkat sekarang!`,
    classStarted: "Kelas sudah dimulai.",
    travelOnly: (travel: number) => `${travel} menit perjalanan`,
    travelWithRain: (travel: number, buffer: number) =>
      `${travel} menit perjalanan + ${buffer} menit cadangan hujan`,
    checkInOpensAt: (time: string) => `Check-in dibuka pukul ${time}.`,
    windowClosed: "Jendela check-in sudah ditutup. Tidak ada check-in tercatat.",
    demoNote: "Mode Demo: posisi disimulasikan, bukan dari GPS.",
    gpsFallback: "Tidak bisa memakai GPS?",
    tryDemo: "Coba Mode Demo di Pengaturan",
    dismiss: "Tutup",
    startsAt: (time: string) => `Mulai ${time}`,
  },

  weather: {
    heading: "Cuaca sekarang",
    loading: "Memuat cuaca…",
    unavailable: "Cuaca tidak tersedia, pakai waktu normal",
    reload: "Muat ulang cuaca",
    precipitation: (mm: string) => `${mm} mm`,
    rainBuffer: (minutes: number) => `+${minutes} menit karena hujan`,
    categories: {
      clear: "Cerah",
      cloudy: "Berawan",
      fog: "Berkabut",
      drizzle: "Gerimis",
      rain: "Hujan",
      showers: "Hujan deras",
      thunder: "Badai petir",
      snow: "Salju",
      unknown: "Cuaca tidak dikenal",
    },
  },

  result: {
    title: "Hasil check-in",
    arrivedAt: (time: string) => `Tiba pukul ${time}`,
    early: (minutes: number) => `${minutes} menit lebih awal`,
    onTime: "Tepat waktu",
    late: (minutes: number) => `Terlambat ${minutes} menit`,
    xp: (xp: number) => `+${xp} XP`,
    xpZero: "0 XP",
    xpBase: (xp: number) => `Dasar ${xp} XP`,
    xpRain: (xp: number) => `Bonus hujan +${xp} XP`,
    xpStreak: (xp: number) => `Bonus streak 5 hari +${xp} XP`,
    newBadge: (name: string) => `Lencana baru: ${name}`,
    stageUp: (stage: string) => `Pet-mu naik tahap: ${stage}!`,
    reactionLate: "Pet-mu sedih. Besok coba berangkat lebih awal ya.",
    reactionVeryEarly: "Pet-mu melompat senang! Kamu datang sangat awal.",
    reactionGood: "Pet-mu senang kamu datang tepat waktu.",
    demoLine: "Check-in simulasi dari Mode Demo, bukan dari GPS.",
    positionLine: "Posisi terbaca di dalam area kampus.",
    lateNoStreak: "Check-in terlambat tidak menambah streak.",
    classDeleted: "Kelas dihapus",
  },

  // Check-in failure messages (spec section 6.3 and 6.7). 0 XP for all of these.
  checkInErrors: {
    outsideRadius:
      "Kamu belum di dalam area kampus. Coba lagi saat sudah benar-benar sampai.",
    permissionDenied:
      "Izin lokasi ditolak. Aktifkan izin lokasi di browser lalu coba lagi.",
    positionUnavailable: "Lokasi tidak bisa dibaca sekarang. Coba lagi sebentar.",
    lowAccuracy:
      "Akurasi lokasi terlalu rendah. Coba lagi di tempat yang sinyal GPS-nya lebih baik.",
    stalePosition: "Data lokasi sudah kedaluwarsa. Coba lagi.",
    outsideWindow: (before: number, after: number) =>
      `Check-in hanya bisa dilakukan mulai ${before} menit sebelum kelas sampai ${after} menit setelah kelas dimulai.`,
    alreadyCheckedIn: "Kamu sudah check-in untuk kelas ini hari ini.",
    unsupported: "Browser ini tidak mendukung lokasi.",
  },

  autoGps: {
    indicator: "GPS aktif, mencari posisi kampus",
    stop: "Berhenti",
    confirmPrompt: "Kamu sudah di area kampus, check-in sekarang?",
    explanation:
      "GPS otomatis hanya berjalan saat halaman Beranda terbuka dan hanya di jendela check-in. Tidak berjalan di latar belakang.",
    confirm: "Ya, check-in sekarang",
    decline: "Belum",
    confirming: "Mencatat…",
    confirmNote: "Check-in baru dicatat setelah kamu mengetuk konfirmasi.",
    forClass: (course: string) => `Kelas: ${course}`,
    idle: (time: string) => `GPS otomatis menunggu jendela check-in (mulai pukul ${time}). Lokasi belum dibaca.`,
    stopped: "GPS otomatis dihentikan sementara.",
    resume: "Aktifkan lagi",
    denied:
      "Izin lokasi ditolak atau dicabut, jadi GPS otomatis berhenti. Kamu tetap bisa mengetuk “Saya sudah sampai”.",
    retry: "Coba lagi",
    unsupported: "Browser ini tidak mendukung lokasi, jadi GPS otomatis tidak bisa dipakai.",
    resultNote: "Terdeteksi otomatis dan dicatat setelah kamu konfirmasi.",
  },

  history: {
    title: "Riwayat",
    suspiciousLabel: "Perjalanan tidak wajar",
    demoLabel: "DEMO",
    realArrivalsOnlyNote: "Hanya kedatangan nyata, tidak termasuk DEMO.",
    totalXpIncludesDemoNote: "Total XP termasuk XP dari DEMO.",
    deletedClass: "Kelas dihapus",
    statsTitle: "Statistik",
    onTimeMonth: "Tepat waktu bulan ini",
    averageArrival: "Rata-rata kedatangan",
    longestStreak: "Streak terpanjang",
    totalXp: "Total XP",
    noData: "Belum ada data",
    percent: (value: number) => `${value}%`,
    averageEarly: (minutes: string) => `${minutes} menit lebih awal`,
    averageLate: (minutes: string) => `${minutes} menit terlambat`,
    days: (count: number) => `${count} hari`,
    listTitle: "Daftar check-in",
    empty: "Belum ada check-in.",
    emptyHint: "Check-in pertamamu akan muncul di sini.",
    goHome: "Ke Beranda",
    weatherAt: (label: string) => `Cuaca: ${label}`,
    weatherNone: "Cuaca: tidak tersedia",
  },

  petScreen: {
    streakLabel: "Streak saat ini",
    streakValue: (days: number) => `${days} hari`,
    growsNote: "Pet-mu tumbuh dari check-in tepat waktu.",
    stagesTitle: "Tahap pet",
    stageStart: (xp: number) => `mulai ${xp} XP`,
    stageReached: "Tercapai",
    stageCurrent: "Sekarang",
    stageLocked: "Belum",
    badgesTitle: "Lencana",
    earned: "Sudah diraih",
    earnedOn: (date: string) => `Diraih ${date}`,
    earnedNoDate: "Tanggal tidak tercatat",
    fromDemo: "dari DEMO",
    locked: "Belum diraih",
    badgeHints: {
      pagi_buta: "Check-in 30 menit atau lebih sebelum kelas dimulai.",
      streak_5_hari: "Check-in tepat waktu 5 hari kuliah berturut-turut.",
      hujan_pemberani: "Check-in tepat waktu saat hujan.",
    },
  },

  backup: {
    unrecognised: "File backup tidak dikenali.",
    invalid: "File backup rusak atau tidak sesuai format. Data kamu tidak diubah.",
    tooLarge: "File backup terlalu besar. Data kamu tidak diubah.",
    replaceWarning:
      "Impor akan mengganti data yang ada sekarang. Ekspor dulu data lama kalau masih dibutuhkan.",
    unchanged: "Data kamu tidak diubah.",
    readFailed: "File tidak bisa dibaca. Data kamu tidak diubah.",
    title: "Cadangan dan pindah HP",
    intro:
      "Data kamu hanya tersimpan di browser ini. Tidak ada akun dan tidak ada sinkronisasi otomatis. Untuk pindah HP: ekspor di HP lama, kirim file ke dirimu sendiri (chat, email, atau penyimpanan cloud milikmu), lalu impor di HP baru.",
    included:
      "Isi file: jadwal, riwayat check-in, XP, streak, lencana, dan pet. Pengaturan (titik kampus, GPS otomatis, Mode Demo) tidak ikut, jadi cek lagi di perangkat baru.",
    notProof:
      "File backup adalah data milikmu sendiri dan bisa diubah. Jangan dipakai sebagai bukti kehadiran.",
    exportButton: "Ekspor data",
    importButton: "Impor data",
    reading: "Membaca file…",
    exported: (fileName: string) => `Data diekspor ke file ${fileName}.`,
    summaryTitle: "Impor data backup?",
    fileContains: (classes: number, checkIns: number, xp: number) =>
      `Isi file: ${classes} kelas, ${checkIns} check-in, total ${xp} XP.`,
    exportedOn: (date: string) => `File ini diekspor pada ${date}.`,
    currentData: (classes: number, checkIns: number, xp: number) =>
      `Data sekarang: ${classes} kelas, ${checkIns} check-in, total ${xp} XP.`,
    confirm: "Ya, ganti data",
    imported: (classes: number, checkIns: number, xp: number) =>
      `Impor berhasil: ${classes} kelas, ${checkIns} check-in, total ${xp} XP.`,
    campusFromFile:
      "Titik kampus diambil dari jadwal di file, karena perangkat ini belum punya titik kampus.",
    saveFailed:
      "Data berhasil diimpor tetapi tidak bisa disimpan di browser ini. Perubahan akan hilang saat halaman ditutup.",
  },

  pet: {
    stages: {
      telur: "Telur",
      bayi: "Bayi",
      remaja: "Remaja",
      dewasa: "Dewasa",
      legenda: "Legenda",
    },
    moods: {
      senang: "senang",
      biasa: "tenang",
      sedih: "sedih",
    },
    artLabel: (stage: string, mood: string) => `Pet tahap ${stage}, ${mood}`,
    xpProgress: (xp: number, nextMin: number) => `${xp}/${nextMin} XP`,
    xpOnly: (xp: number) => `${xp} XP`,
    xpToNext: (xp: number, stage: string) => `${xp} XP lagi jadi ${stage}`,
    maxStage: "Tahap tertinggi tercapai",
    progressText: (into: number, span: number) => `${into} dari ${span} XP tahap ini`,
  },

  badges: {
    pagi_buta: "Pagi Buta",
    streak_5_hari: "Streak 5 Hari",
    hujan_pemberani: "Hujan Pemberani",
  },
} as const;
