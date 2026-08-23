export type Lang = "tr" | "en";

export const dict = {
  en: {
    title: "CronLab",
    subtitle: "Build, explain and preview cron expressions.",
    footer: "by WaweUp",
    backAria: "Back to waweup.com",
    langAria: "Language",
    themeToDark: "Switch to dark theme",
    themeToLight: "Switch to light theme",
    privacyLink: "Privacy",
    privacyTitle: "Privacy",
    privacy1:
      "CronLab runs entirely in your browser. Expressions you type, the schedules generated from them and your timezone selection are processed locally on your device.",
    privacy2:
      "Nothing you enter is sent to a server, stored, or shared. There are no accounts, no analytics cookies and no tracking.",
    privacy3: "Your input never leaves your browser.",
    // Tool
    modeBuild: "Build",
    modeExplain: "Explain",
    modeAria: "Mode",
    expressionLabel: "Cron expression",
    expressionPlaceholder: "*/15 9-17 * * MON-FRI",
    invalidPrefix: "Invalid expression",
    explanationTitle: "Explanation",
    nextRunsTitle: "Next runs",
    timezoneLabel: "Timezone",
    copy: "Copy",
    copied: "Copied",
    fieldMinute: "Minute",
    fieldHour: "Hour",
    fieldDom: "Day of month",
    fieldMonth: "Month",
    fieldDow: "Day of week",
    optEvery: "Every",
    optCustom: "Custom…",
    weekdays: "Weekdays (Mon–Fri)",
    weekend: "Weekend (Sat–Sun)",
    unsupportedNote:
      "Standard 5-field cron only. Provider-specific formats (Quartz seconds, @yearly, L / W / #) are not supported.",
    // FAQ
    faqTitle: "Frequently asked questions",
    faqQ1: "Which cron format does CronLab support?",
    faqA1:
      "CronLab supports the standard 5-field cron format: minute, hour, day of month, month and day of week — including ranges (1-5), lists (1,3,5), steps (*/15) and names (JAN, MON). Provider-specific extensions such as Quartz seconds or L/W/# are intentionally not supported.",
    faqQ2: "How are the next run times calculated?",
    faqA2:
      "CronLab evaluates your expression minute by minute in the timezone you select, using your browser's built-in timezone database. Daylight saving time transitions are taken into account by the timezone conversion.",
    faqQ3: "What does the day-of-month / day-of-week rule mean?",
    faqA3:
      "Following the classic cron convention, when both the day-of-month and day-of-week fields are restricted, a run happens when either of them matches. When only one is restricted, only that one is used.",
    faqQ4: "Is my expression sent to a server?",
    faqA4:
      "No. Parsing, explanation and run-time preview all happen locally in your browser. Nothing you type leaves your device.",
    faqQ5: "Is CronLab free?",
    faqA5:
      "Yes. CronLab is a free tool by WaweUp — no sign-up, no limits, and no data collection.",
  },
  tr: {
    title: "CronLab",
    subtitle: "Cron ifadeleri oluşturun, açıklayın ve önizleyin.",
    footer: "WaweUp tarafından",
    backAria: "waweup.com'a geri dön",
    langAria: "Dil",
    themeToDark: "Koyu temaya geç",
    themeToLight: "Açık temaya geç",
    privacyLink: "Gizlilik",
    privacyTitle: "Gizlilik",
    privacy1:
      "CronLab tamamen tarayıcınızda çalışır. Yazdığınız ifadeler, oluşturulan zamanlamalar ve saat dilimi seçiminiz cihazınızda yerel olarak işlenir.",
    privacy2:
      "Girdiğiniz hiçbir veri sunucuya gönderilmez, saklanmaz veya paylaşılmaz. Hesap yok, analitik çerez yok, takip yok.",
    privacy3: "Girdiniz tarayıcınızdan asla çıkmaz.",
    // Tool
    modeBuild: "Oluştur",
    modeExplain: "Açıkla",
    modeAria: "Mod",
    expressionLabel: "Cron ifadesi",
    expressionPlaceholder: "*/15 9-17 * * MON-FRI",
    invalidPrefix: "Geçersiz ifade",
    explanationTitle: "Açıklama",
    nextRunsTitle: "Sonraki çalışmalar",
    timezoneLabel: "Saat dilimi",
    copy: "Kopyala",
    copied: "Kopyalandı",
    fieldMinute: "Dakika",
    fieldHour: "Saat",
    fieldDom: "Ayın günü",
    fieldMonth: "Ay",
    fieldDow: "Haftanın günü",
    optEvery: "Her",
    optCustom: "Özel…",
    weekdays: "Hafta içi (Pzt–Cum)",
    weekend: "Hafta sonu (Cmt–Paz)",
    unsupportedNote:
      "Yalnızca standart 5 alanlı cron desteklenir. Sağlayıcıya özel formatlar (Quartz saniye, @yearly, L / W / #) desteklenmez.",
    // FAQ
    faqTitle: "Sıkça sorulan sorular",
    faqQ1: "CronLab hangi cron formatını destekliyor?",
    faqA1:
      "CronLab standart 5 alanlı cron formatını destekler: dakika, saat, ayın günü, ay ve haftanın günü — aralıklar (1-5), listeler (1,3,5), adımlar (*/15) ve isimler (JAN, MON) dahil. Quartz saniyeleri veya L/W/# gibi sağlayıcıya özel uzantılar bilinçli olarak desteklenmez.",
    faqQ2: "Sonraki çalışma zamanları nasıl hesaplanıyor?",
    faqA2:
      "CronLab, ifadenizi seçtiğiniz saat diliminde tarayıcınızın yerleşik saat dilimi veritabanını kullanarak dakika dakika değerlendirir. Yaz saati geçişleri saat dilimi dönüşümü tarafından dikkate alınır.",
    faqQ3: "Ayın günü / haftanın günü kuralı ne anlama geliyor?",
    faqA3:
      "Klasik cron kuralına göre, hem ayın günü hem haftanın günü alanları kısıtlandığında ikisinden biri eşleşirse çalışma gerçekleşir. Yalnızca biri kısıtlıysa sadece o alan kullanılır.",
    faqQ4: "İfadem bir sunucuya gönderiliyor mu?",
    faqA4:
      "Hayır. Ayrıştırma, açıklama ve zaman önizlemesi tamamen tarayıcınızda gerçekleşir. Yazdığınız hiçbir şey cihazınızdan çıkmaz.",
    faqQ5: "CronLab ücretsiz mi?",
    faqA5:
      "Evet. CronLab, WaweUp tarafından sunulan ücretsiz bir araçtır — kayıt yok, sınır yok, veri toplama yok.",
  },
} as const satisfies Record<Lang, Record<string, string>>;

export type DictKey = keyof (typeof dict)["en"];

export const FAQ_ITEMS: { q: DictKey; a: DictKey }[] = [
  { q: "faqQ1", a: "faqA1" },
  { q: "faqQ2", a: "faqA2" },
  { q: "faqQ3", a: "faqA3" },
  { q: "faqQ4", a: "faqA4" },
  { q: "faqQ5", a: "faqA5" },
];

export const PRIVACY_KEYS: DictKey[] = ["privacy1", "privacy2", "privacy3"];
