/**
 * Translation database for Telegram bot.
 * Type-safe translations matching addon structure.
 */

export type TransDB = {
  [key: string]: {
    en: string
    ar: string
    id: string
    fr: string
    nl: string
    zh_CN: string
    zh_TW: string
    ms: string
    bn: string
  }
}

export const TRANSLATIONS = {
  safe: {
    en: "✓ This link appears to be safe",
    ar: "✓ يبدو أن هذا الرابط آمن",
    id: "✓ Tautan ini tampaknya aman",
    ms: "✓ Pautan ini kelihatan selamat",
    bn: "✓ এই লিঙ্কটি নিরাপদ বলে মনে হচ্ছে",
    fr: "✓ Ce lien semble être sûr",
    nl: "✓ Deze link lijkt veilig te zijn",
    zh_CN: "✓ 此链接似乎是安全的",
    zh_TW: "✓ 此連結似乎是安全的"
  },
  "flagged.header": {
    en: "⚠️ Flagged",
    ar: "⚠️ محظور",
    id: "⚠️ Ditandai",
    ms: "⚠️ Ditandai",
    bn: "⚠️ চিহ্নিত",
    fr: "⚠️ Signalé",
    nl: "⚠️ Gemarkeerd",
    zh_CN: "⚠️ 已标记",
    zh_TW: "⚠️ 已標記"
  },
  "flagged.learnMore": {
    en: "Learn more: https://the-wall.win",
    ar: "اعرف المزيد: https://the-wall.win",
    id: "Pelajari lebih lanjut: https://the-wall.win",
    ms: "Ketahui lebih lanjut: https://the-wall.win",
    bn: "আরও জানুন: https://the-wall.win",
    fr: "En savoir plus : https://the-wall.win",
    nl: "Meer informatie: https://the-wall.win",
    zh_CN: "了解更多：https://the-wall.win",
    zh_TW: "了解更多：https://the-wall.win"
  },
  "hint.header": {
    en: "💡 Hint",
    ar: "💡 تلميح",
    id: "💡 Petunjuk",
    ms: "💡 Petua",
    bn: "💡 ইঙ্গিত",
    fr: "💡 Indice",
    nl: "💡 Hint",
    zh_CN: "💡 提示",
    zh_TW: "💡 提示"
  },
  "hint.israeliWebsite": {
    en: "Psst, this is an Israeli website.",
    ar: "تنبيه: هذا موقع إسرائيلي.",
    id: "Hei, ini adalah situs web Israel.",
    ms: "Hei, ini adalah laman web Israel.",
    bn: "জানিয়ে রাখি, এটি একটি ইসরাইলী ওয়েবসাইট।",
    fr: "Psst, c'est un site web israélien.",
    nl: "Psst, dit is een Israëlische website.",
    zh_CN: "提示：这是一个以色列网站。",
    zh_TW: "提示：這是一個以色列網站。"
  },
  "hint.israeliWebsiteName": {
    en: "Israeli Website",
    ar: "موقع إسرائيلي",
    id: "Situs Web Israel",
    ms: "Laman Web Israel",
    bn: "ইসরাইলী ওয়েবসাইট",
    fr: "Site web israélien",
    nl: "Israëlische website",
    zh_CN: "以色列网站",
    zh_TW: "以色列網站"
  },
  "reasons.h": {
    en: "Headquarters is in Israel",
    ar: "المقر الرئيسي يقع في الكيان الصهيوني",
    id: "Kantor pusat berada di Israel",
    ms: "Ibu pejabat berada di Israel",
    bn: "কেন্দ্রীয় দফতর ইসরাইলে",
    fr: "Le siège se trouve en Israël",
    nl: "Het hoofdkantoor bevindt zich in Israël",
    zh_CN: "总部位于以色列",
    zh_TW: "總部位於以色列"
  },
  "reasons.f": {
    en: "One or more founders are connected to Israel",
    ar: "أحد المؤسسين من الكيان الصهيوني",
    id: "Satu atau lebih pendiri terhubung dengan Israel",
    ms: "Satu atau lebih pengasas terhubung dengan Israel",
    bn: "এক বা একাধিক প্রতিষ্ঠাতা ইসরাইলের সাথে সংযুক্ত",
    fr: "Un ou plusieurs fondateurs sont liés à Israël",
    nl: "Een of meer oprichters hebben banden met Israël",
    zh_CN: "一个或多个创始人与以色列有关",
    zh_TW: "一個或多個創始人與以色列有關"
  },
  "reasons.i": {
    en: "One or more investors are connected to Israel",
    ar: "أحد المستثمرين من الكيان الصهيوني",
    id: "Satu atau lebih investor terhubung dengan Israel",
    ms: "Satu atau lebih pelabur terhubung dengan Israel",
    bn: "এক বা একাধিক বিনিয়োগকারী ইসরাইলের সাথে সংযুক্ত",
    fr: "Un ou plusieurs investisseurs sont liés à Israël",
    nl: "Een of meer investeerders hebben banden met Israël",
    zh_CN: "一个或多个投资者与以色列有关",
    zh_TW: "一個或多個投資者與以色列有關"
  },
  "reasons.u": {
    en: "This URL ends with .il, This means it's an Israeli website!",
    ar: "هذا الموقع من الكيان الصهيوني لأنه ينتهي بـ .il",
    id: "URL ini diakhiri dengan .il, ini berarti ini adalah situs web Israel!",
    ms: "URL ini diakhiri dengan .il, ini bermakna ini adalah laman web Israel!",
    bn: "এই URL এর শেষে .il আছে, এটি একটি ইসরাইলী ওয়েবসাইটের অর্থ!",
    fr: "Cette URL se termine par .il, ce qui signifie qu'il s'agit d'un site web israélien !",
    nl: "Deze URL eindigt op .il, wat betekent dat het een Israëlische website is!",
    zh_CN: "这个网址以.il结尾，这意味着这是一个以色列网站！",
    zh_TW: "這個網址以.il結尾，這意味著這是一個以色列網站！"
  },
  "reasons.BDS_PRIO": {
    en: "Priority target on the BDS Boycott list",
    ar: "هدف أولوي في قائمة المقاطعة الخاصة بحركة BDS",
    id: "Target prioritas dalam daftar Boikot BDS",
    ms: "Sasaran keutamaan dalam daftar Boikot BDS",
    bn: "BDS বয়কট তালিকায় অগ্রাধিকার লক্ষ্য",
    fr: "Cible prioritaire sur la liste du boycott BDS",
    nl: "Prioritair doelwit op de BDS-Boycotlijst",
    zh_CN: "BDS抵制名单上的优先目标",
    zh_TW: "BDS抵制名單上的優先目標"
  },
  "reasons.BDS_GRASS": {
    en: "Grassroots target on the BDS Boycott list",
    ar: "هدف شعبي في قائمة المقاطعة الخاصة بحركة BDS",
    id: "Target akar rumput dalam daftar Boikot BDS",
    ms: "Sasaran akar umbi dalam daftar Boikot BDS",
    bn: "BDS বয়কট তালিকায় তৃণমূল লক্ষ্য",
    fr: "Cible populaire sur la liste du boycott BDS",
    nl: "Grassroots doelwit op de BDS-Boycotlijst",
    zh_CN: "BDS抵制名单上的草根目标",
    zh_TW: "BDS抵制名單上的草根目標"
  },
  "reasons.BDS_PRESSURE": {
    en: "Pressure target on the BDS Boycott list",
    ar: "هدف ضغط في قائمة المقاطعة الخاصة بحركة BDS",
    id: "Target tekanan dalam daftar Boikot BDS",
    ms: "Sasaran tekanan dalam daftar Boikot BDS",
    bn: "BDS বয়কট তালিকায় চাপ লক্ষ্য",
    fr: "Cible de pression sur la liste du boycott BDS",
    nl: "Drukdoelwit op de BDS-Boycotlijst",
    zh_CN: "BDS抵制名单上的施压目标",
    zh_TW: "BDS抵制名單上的施壓目標"
  },
  "reasons.c": {
    en: "Custom boycott reason",
    ar: "سبب مقاطعة مخصص",
    id: "Alasan boikot khusus",
    ms: "Sebab boikot tersuai",
    bn: "কাস্টম বয়কট কারণ",
    fr: "Raison de boycott personnalisée",
    nl: "Aangepaste boycotreden",
    zh_CN: "自定义抵制原因",
    zh_TW: "自定義抵制原因"
  },
  "reasons.short.h": {
    en: "HQ in Israel",
    ar: "المقر في الكيان الصهيوني",
    id: "Kantor pusat di Israel",
    ms: "Ibu pejabat di Israel",
    bn: "ইসরাইলে সদর দফতর",
    fr: "Siège en Israël",
    nl: "Hoofdkantoor in Israël",
    zh_CN: "总部在以色列",
    zh_TW: "總部在以色列"
  },
  "reasons.short.f": {
    en: "Founder in Israel",
    ar: "مؤسس من الكيان الصهيوني",
    id: "Pendiri di Israel",
    ms: "Pengasas di Israel",
    bn: "ইসরাইলে প্রতিষ্ঠাতা",
    fr: "Fondateur en Israël",
    nl: "Oprichter in Israël",
    zh_CN: "创始人在以色列",
    zh_TW: "創始人在以色列"
  },
  "reasons.short.i": {
    en: "Investor in Israel",
    ar: "مستثمر من الكيان الصهيوني",
    id: "Investor di Israel",
    ms: "Pelabur di Israel",
    bn: "ইসরাইলে বিনিয়োগকারী",
    fr: "Investisseur en Israël",
    nl: "Investeerder in Israël",
    zh_CN: "投资者在以色列",
    zh_TW: "投資者在以色列"
  },
  "reasons.short.u": {
    en: "Israeli website",
    ar: "موقع إسرائيلي",
    id: "Situs web Israel",
    ms: "Laman web Israel",
    bn: "ইসরাইলী ওয়েবসাইট",
    fr: "Site web israélien",
    nl: "Israëlische website",
    zh_CN: "以色列网站",
    zh_TW: "以色列網站"
  },
  "reasons.short.BDS_PRIO": {
    en: "BDS Priority",
    ar: "أولوية BDS",
    id: "Prioritas BDS",
    ms: "Keutamaan BDS",
    bn: "BDS অগ্রাধিকার",
    fr: "Priorité BDS",
    nl: "BDS-prioriteit",
    zh_CN: "BDS优先",
    zh_TW: "BDS優先"
  },
  "reasons.short.BDS_GRASS": {
    en: "BDS Grassroots",
    ar: "BDS شعبي",
    id: "BDS Akar Rumput",
    ms: "BDS Akar Umbi",
    bn: "BDS তৃণমূল",
    fr: "BDS Populaire",
    nl: "BDS-grassroots",
    zh_CN: "BDS草根",
    zh_TW: "BDS草根"
  },
  "reasons.short.BDS_PRESSURE": {
    en: "BDS Pressure",
    ar: "ضغط BDS",
    id: "Tekanan BDS",
    ms: "Tekanan BDS",
    bn: "BDS চাপ",
    fr: "Pression BDS",
    nl: "BDS-druk",
    zh_CN: "BDS施压",
    zh_TW: "BDS施壓"
  },
  "reasons.short.c": {
    en: "Custom",
    ar: "مخصص",
    id: "Khusus",
    ms: "Tersuai",
    bn: "কাস্টম",
    fr: "Personnalisé",
    nl: "Aangepast",
    zh_CN: "自定义",
    zh_TW: "自定義"
  },
  "help.noUrl": {
    en: "Please send me a URL to check. I can check if a link is safe or flagged.",
    ar: "يرجى إرسال رابط للتحقق. يمكنني التحقق مما إذا كان الرابط آمناً أم محظوراً.",
    id: "Silakan kirimkan URL untuk diperiksa. Saya dapat memeriksa apakah tautan aman atau ditandai.",
    ms: "Sila hantar URL untuk diperiksa. Saya boleh memeriksa sama ada pautan selamat atau ditandai.",
    bn: "অনুগ্রহ করে একটি URL পাঠান যাচাই করার জন্য। আমি পরীক্ষা করতে পারি যে একটি লিঙ্ক নিরাপদ নাকি চিহ্নিত।",
    fr: "Veuillez m'envoyer une URL à vérifier. Je peux vérifier si un lien est sûr ou signalé.",
    nl: "Stuur me een URL om te controleren. Ik kan controleren of een link veilig is of gemarkeerd.",
    zh_CN: "请发送一个URL让我检查。我可以检查链接是否安全或已标记。",
    zh_TW: "請發送一個URL讓我檢查。我可以檢查連結是否安全或已標記。"
  },
  "help.usage": {
    en: "Send me a URL or mention me in a group with a URL to check it.",
    ar: "أرسل لي رابطاً أو اذكرني في مجموعة مع رابط للتحقق منه.",
    id: "Kirimkan saya URL atau sebutkan saya dalam grup dengan URL untuk memeriksanya.",
    ms: "Hantar saya URL atau sebutkan saya dalam kumpulan dengan URL untuk memeriksanya.",
    bn: "আমাকে একটি URL পাঠান বা একটি URL সহ একটি গ্রুপে আমাকে উল্লেখ করুন যাচাই করার জন্য।",
    fr: "Envoyez-moi une URL ou mentionnez-moi dans un groupe avec une URL pour la vérifier.",
    nl: "Stuur me een URL of vermeld me in een groep met een URL om het te controleren.",
    zh_CN: "发送给我一个URL或在群组中用URL提及我来检查它。",
    zh_TW: "發送給我一個URL或在群組中用URL提及我來檢查它。"
  },
  "error.invalidUrl": {
    en: "Invalid URL format. Please send a valid URL.",
    ar: "تنسيق URL غير صالح. يرجى إرسال رابط صالح.",
    id: "Format URL tidak valid. Silakan kirimkan URL yang valid.",
    ms: "Format URL tidak sah. Sila hantar URL yang sah.",
    bn: "অবৈধ URL ফরম্যাট। অনুগ্রহ করে একটি বৈধ URL পাঠান।",
    fr: "Format d'URL invalide. Veuillez envoyer une URL valide.",
    nl: "Ongeldig URL-formaat. Stuur een geldige URL.",
    zh_CN: "无效的URL格式。请发送有效的URL。",
    zh_TW: "無效的URL格式。請發送有效的URL。"
  },
  "error.checkFailed": {
    en: "Failed to check URL. Please try again.",
    ar: "فشل التحقق من الرابط. يرجى المحاولة مرة أخرى.",
    id: "Gagal memeriksa URL. Silakan coba lagi.",
    ms: "Gagal memeriksa URL. Sila cuba lagi.",
    bn: "URL পরীক্ষা করতে ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।",
    fr: "Échec de la vérification de l'URL. Veuillez réessayer.",
    nl: "URL-controle mislukt. Probeer het opnieuw.",
    zh_CN: "检查URL失败。请重试。",
    zh_TW: "檢查URL失敗。請重試。"
  },
  "inline.safe": {
    en: "Safe",
    ar: "آمن",
    id: "Aman",
    ms: "Selamat",
    bn: "নিরাপদ",
    fr: "Sûr",
    nl: "Veilig",
    zh_CN: "安全",
    zh_TW: "安全"
  },
  "inline.noIssues": {
    en: "No issues found",
    ar: "لم يتم العثور على مشاكل",
    id: "Tidak ada masalah ditemukan",
    ms: "Tiada isu ditemui",
    bn: "কোন সমস্যা পাওয়া যায়নি",
    fr: "Aucun problème trouvé",
    nl: "Geen problemen gevonden",
    zh_CN: "未发现问题",
    zh_TW: "未發現問題"
  },
  "formatter.reasons": {
    en: "Reasons:",
    ar: "الأسباب:",
    id: "Alasan:",
    ms: "Sebab:",
    bn: "কারণ:",
    fr: "Raisons :",
    nl: "Redenen:",
    zh_CN: "原因：",
    zh_TW: "原因："
  },
  "formatter.alternatives": {
    en: "Alternatives:",
    ar: "البدائل:",
    id: "Alternatif:",
    ms: "Alternatif:",
    bn: "বিকল্প:",
    fr: "Alternatives :",
    nl: "Alternatieven:",
    zh_CN: "替代品：",
    zh_TW: "替代品："
  },
  "domainHint.header": {
    en: "Consider switching platforms",
    ar: "فكر في تغيير المنصة",
    id: "Pertimbangkan untuk beralih platform",
    ms: "Pertimbangkan untuk beralih platform",
    bn: "প্ল্যাটফর্ম পরিবর্তন করার কথা বিবেচনা করুন",
    fr: "Envisagez de changer de plateforme",
    nl: "Overweeg om van platform te wisselen",
    zh_CN: "考虑更换平台",
    zh_TW: "考慮更換平台"
  },
  "advertising.addon": {
    en: "Do you like this bot? You will LOVE the browser addon! Download it now from the-wall.win 🧱🍉",
    ar: "هل يعجبك البوت؟ ستحب إضافة المتصفح! حمّل الآن من the-wall.win 🧱🍉",
    id: "Apakah Anda menyukai bot ini? Anda akan menyukai addon browser! Unduh sekarang dari the-wall.win 🧱🍉",
    ms: "Adakah anda suka bot ini? Anda akan suka addon pelayar! Muat turun sekarang dari the-wall.win 🧱🍉",
    bn: "আপনি কি বটটি পছন্দ করেন? আপনি ব্রাউজার অ্যাডঅনটি পছন্দ করবেন! এখনই the-wall.win থেকে ডাউনলোড করুন 🧱🍉",
    fr: "Vous aimez le bot ? Vous allez adorer l'extension de navigateur ! Téléchargez maintenant depuis the-wall.win 🧱🍉",
    nl: "Vind je de bot leuk? Je zult de browseradd-on geweldig vinden! Download nu van the-wall.win 🧱🍉",
    zh_CN: "你喜欢这个机器人吗？你会爱上浏览器插件！立即从 the-wall.win 下载 🧱🍉",
    zh_TW: "你喜歡這個機器人嗎？你會愛上瀏覽器插件！立即從 the-wall.win 下載 🧱🍉"
  },
  "advertising.share": {
    en: "💬 Share this result with others to help them stay informed!",
    ar: "💬 شارك هذه النتيجة مع الآخرين لمساعدتهم على البقاء على اطلاع!",
    id: "💬 Bagikan hasil ini dengan orang lain untuk membantu mereka tetap terinformasi!",
    ms: "💬 Kongsi hasil ini dengan orang lain untuk membantu mereka kekal dimaklumkan!",
    bn: "💬 অন্যদের সাথে এই ফলাফল শেয়ার করুন যাতে তারা অবগত থাকতে পারে!",
    fr: "💬 Partagez ce résultat avec d'autres pour les aider à rester informés !",
    nl: "💬 Deel dit resultaat met anderen om hen geïnformeerd te houden!",
    zh_CN: "💬 与他人分享此结果，帮助他们保持了解！",
    zh_TW: "💬 與他人分享此結果，幫助他們保持了解！"
  }
} satisfies TransDB

// Auto-generate translation keys from the TRANSLATIONS object
export type TranslationKey = keyof typeof TRANSLATIONS

// Language code type
export type LanguageCode = keyof TransDB[string]
