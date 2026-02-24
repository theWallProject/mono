import { ManualOverrideFields } from "../../types"

export const manualOverrides: Record<
  string,
  | ManualOverrideFields
  | { _processed: true }
  | { _processed: "auto" }
  | (ManualOverrideFields & { _processed: true })
  | (ManualOverrideFields & { _processed: "auto" })
  | (ManualOverrideFields & { urls?: string[] })
  | (ManualOverrideFields & { _processed: true; urls?: string[] })
  | (ManualOverrideFields & { _processed: "auto"; urls?: string[] })
> = {
  "01 Founders": { li: "https://www.linkedin.com/school/01-founders/" },
  "AI21 Labs": {
    ws: ["https://www.ai21.com"],
    li: ["https://www.linkedin.com/company/ai21"],
    fb: ["https://www.facebook.com/AI21Labs"],
    tw: ["https://x.com/AI21Labs"],
    gh: ["https://github.com/AI21Labs", "https://github.com/AI21X", "https://github.com/mangate"],
    ytp: ["https://www.youtube.com/@ai21labs"],
    urls: [
      "https://apps.apple.com/us/developer/ai21-labs-inc/id1628773286",
      "https://aws.amazon.com/bedrock/ai21",
      "https://cloud.google.com/customers/ai21",
      "https://discord.com/app/invite-with-guild-onboarding/cKzg6GEAyB",
      "https://discord.com/invite/cKzg6GEAyB",
      "https://finance.yahoo.com/news/nvidia-google-back-ai21-labs-140222256.html",
      "https://huggingface.co/ai21labs",
      "https://www.youtube.com/watch?v=DyE0YkoFFEE"
    ],
    alt: [
      { n: "Mistral AI", ws: "https://mistral.ai/" },
      { n: "Cohere", ws: "https://cohere.com/" },
      { n: "Aleph Alpha", ws: "https://www.aleph-alpha.com/" },
      { n: "Stability AI", ws: "https://stability.ai/" }
    ],
    _processed: true
  },
  AU10TIX: {
    li: ["https://www.linkedin.com/company/au10tix-limited"],
    fb: ["https://www.facebook.com/Au10tix"],
    tw: ["https://x.com/AU10TIXLimited"],
    ig: ["https://www.instagram.com/life_at_au10tix"],
    gh: ["https://github.com/au10tixmobile"],
    urls: ["https://play.google.com/store/apps/developer?id=Au10tix"],
    android_dev_id: "com.au10tix",
    _processed: true
  },
  Aidoc: {
    fb: ["https://www.facebook.com/aidocmed"],
    tw: ["https://x.com/aidocmed"],
    ytp: ["https://www.youtube.com/@AidocAI"],
    urls: ["https://apps.apple.com/us/developer/aidoc-medical-ltd/id1459219008"],
    _processed: true
  },
  Appcharge: {
    ws: ["https://www.appcharge.com/"],
    li: ["https://www.linkedin.com/company/appcharge"],
    ytp: ["https://www.youtube.com/@Appcharge-HQ"],
    urls: [
      "https://www.facebook.com/profile.php?id=61561199398476",
      "https://business.safety.google/privacy",
      "https://dashboard.appcharge.com",
      "https://docs.appcharge.com/api-reference/checkout/finance-and-analytics/analytics-reporting-api",
      "https://docs.appcharge.com/api-reference/introduction",
      "https://docs.appcharge.com/guides/events/about-the-events-center",
      "https://docs.appcharge.com/guides/introduction",
      "https://docs.appcharge.com/guides/publisher-dashboard/set-up-your-publisher-dashboard",
      "https://docs.appcharge.com/guides/publisher-dashboard/view-blocked-players#view-blocked-players",
      "https://docs.appcharge.com/merchant-of-record/finance/supported-regions",
      "https://docs.appcharge.com/merchant-of-record/policies/about-compliance-at-appcharge#about-compliance-at-appcharge",
      "https://docs.appcharge.com/sdks/introduction",
      "https://help.appcharge.com/hc/en-us",
      "https://jubilant-cherry-dce38aff6a.media.strapiapp.com/Frame_2117131574_2_6500e2ff83.svg",
      "https://jubilant-cherry-dce38aff6a.media.strapiapp.com/Frame_2117131576_6ad8fdaabc.svg",
      "https://jubilant-cherry-dce38aff6a.media.strapiapp.com/Vector_4_8686ef3dcf.svg",
      "https://jubilant-cherry-dce38aff6a.media.strapiapp.com/Warstwa_2_1_31022a79bd.svg",
      "https://support.comeet.co/section/terms-and-policies",
      "https://www.cookiebot.com",
      "https://www.cookiebot.com/en/what-is-behind-powered-by-cookiebot/?utm_source=banner_cb&utm_medium=referral&utm_content=v2",
      "https://www.google.com/recaptcha/api.js?render=6Lc4DdQrAAAAAALzOxmnL_NT9tI0mkqJHDuz-4Kh"
    ],
    _processed: "auto"
  },
  BioCatch: {
    li: ["https://www.linkedin.com/company/biocatch"],
    fb: ["https://www.facebook.com/behvioral"],
    tw: ["https://x.com/biocatch"],
    gh: ["https://github.com/biocatchltd"],
    ytp: ["https://www.youtube.com/@biocatch.official"],
    ytc: ["https://www.youtube.com/channel/UCGHkBeKgH_6-B8CjRcCqm-A"],
    urls: [
      "https://marketplace.microsoft.com/en-gb/product/saas/biocatch.biocatch_behavioral_biometrics?tab=Overview",
      "https://medium.com/@BioCatchTechBlog",
      "https://play.google.com/store/apps/developer?id=BioCatch+Ltd.",
      "https://www.comeet.com/jobs/biocatch/03.00E/data-engineer/0C.759"
    ],
    android_dev_id: "com.biocatch.biometric",
    _processed: true
  },
  Bluesky: {
    ws: ["https://bsky.social", "https://bsky.app"],
    gh: ["https://github.com/bluesky-social"],
    urls: [
      "https://apps.apple.com/us/developer/bluesky-pbllc/id1654243552",
      "https://play.google.com/store/apps/developer?id=Bluesky+PBLLC"
    ],
    android_dev_id: "xyz.blueskyweb",
    _processed: true
  },
  Cellebrite: {
    li: ["https://www.linkedin.com/company/cellebrite", "http://www.linkedin.com/company/100045"],
    fb: ["https://www.facebook.com/cellebritedigitalintelligence"],
    ytp: [
      "https://www.youtube.com/@cellebrite",
      "https://www.youtube.com/@cellebrite-deutsch",
      "https://www.youtube.com/@cellebrite-espanol",
      "https://www.youtube.com/@cellebrite-francais",
      "https://www.youtube.com/@cellebrite-portugues",
      "https://www.youtube.com/@companycellebrite",
      "https://www.youtube.com/@lifeatcellebrite7735"
    ],
    urls: [
      "https://www.facebook.com/groups/1143744623008587",
      "https://www.facebook.com/groups/571246666951707",
      "https://www.facebook.com/groups/746270377207022",
      "https://www.linkedin.com/showcase/cellebrite-careers",
      "https://www.linkedin.com/showcase/cellebrite-enterprise-solutions",
      "https://cellebrite.my.site.com/PartnerCommunity/s/login/?language=en_US"
    ],
    _processed: true
  },
  "Classiq Technologies": {
    ws: ["https://www.classiq.io"],
    li: ["https://www.linkedin.com/company/classiq-technologies"],
    fb: ["https://www.facebook.com/ClassiqTech"],
    tw: ["https://x.com/classiqtech"],
    gh: ["https://github.com/Classiq"],
    ytp: ["https://www.youtube.com/@ClassiqTechnologies"],
    tt: ["https://www.tiktok.com/@classiqtech"],
    urls: ["https://classiq-community.slack.com/join/shared_invite/zt-39du2mz80-fE_GBGxMaDxBFRBr_4nrjw"],
    _processed: true
  },
  Cyera: {
    ws: "https://www.cyera.com",
    ytp: ["https://www.youtube.com/@CyeraSecurity"],
    ytc: ["https://www.youtube.com/channel/UCQZhCZIe6xRDjCkfzzwPBCg"],
    urls: [
      "https://marketplace.microsoft.com/de-de/product/web-apps/cyera1658314682323.cyera_cloud_data_security?tab=overview",
      "https://www.elastic.co/docs/reference/integrations/cyera"
    ],
    _processed: true
  },
  "D-Fend Solutions": {
    li: ["https://www.linkedin.com/company/d-fend-solutions"],
    fb: ["https://www.facebook.com/DFendSolutions"],
    tw: ["https://x.com/DFendSolutions"],
    ig: ["https://www.instagram.com/d_fend_solutions"],
    ytp: ["https://www.youtube.com/@DFendSolutions", "https://www.youtube.com/@zoharhalachmi5784"],
    urls: ["https://d-fendsolutions.com"],
    _processed: true
  },
  Earnix: {
    fb: ["https://www.facebook.com/earnix"],
    tw: ["https://x.com/Earnix_Inc"],
    ig: ["https://www.instagram.com/earnix_inc"],
    gh: ["https://github.com/Earnix"],
    ytp: ["https://www.youtube.com/@Earnix_Inc"],
    urls: ["https://play.google.com/store/apps/developer?id=Earnix+Ltd"],
    android_dev_id: "mobile.app1hh7BC4Jb6",
    _processed: true
  },
  Empathy: {
    tw: ["https://x.com/empathy"],
    ig: ["https://www.instagram.com/empathy_com"],
    th: ["https://www.threads.com/@empathy_com"],
    urls: [
      "https://apps.apple.com/us/developer/empathy/id1536395194",
      "https://play.google.com/store/apps/dev?id=7573398188169424467",
      "https://sprout.link/empathy_com"
    ],
    android_dev_id: "com.empathy",
    _processed: true
  },
  Fiverr: {
    ws: ["https://www.fiverr.com", "https://www.clearvoice.com", "https://www.autods.com"],
    li: [
      "https://www.linkedin.com/company/fiverr-com",
      "https://www.linkedin.com/showcase/fiverr-affiliates",
      "https://www.linkedin.com/showcase/fiverr-learn",
      "https://www.linkedin.com/showcase/fiverr-us",
      "https://www.linkedin.com/company/clearvoice"
    ],
    fb: ["https://www.facebook.com/Fiverr", "https://www.facebook.com/ClearVoiceContent"],
    tw: ["https://x.com/fiverr", "https://x.com/ClearVoice"],
    ig: ["https://www.instagram.com/fiverr", "https://www.instagram.com/clearvoicecontent"],
    ytp: ["https://www.youtube.com/@fiverr"],
    ytc: ["https://www.youtube.com/channel/UC3uRppA1nJm53HMVauBS-tw"],
    tt: ["https://www.tiktok.com/@fiverr"],
    urls: [
      "https://play.google.com/store/apps/developer?id=Fiverr",
      "https://sprout.link/fiverr",
      "https://www.linkedin.com/products/fiverr-com-fiverr",
      "https://www.pinterest.com/fiverr",
      "https://www.pinterest.com/fiverr/brand-style-guides-brand-identity"
    ],
    android_dev_id: "com.fiverr"
  },
  Hirundo: { ws: ["https://www.hirundo.io/"], li: ["https://www.linkedin.com/company/gethirundo"], _processed: "auto" },
  Hypernative: {
    ws: ["https://www.hypernative.io", "https://app.hypernative.xyz"],
    li: ["https://www.linkedin.com/company/hypernative"],
    tw: ["https://x.com/HypernativeLabs"],
    gh: ["https://github.com/Hypernative-Labs"],
    ytp: ["https://www.youtube.com/@hypernative-io"],
    urls: [
      "https://aptosnetwork.com/ecosystem/directory/hypernative",
      "https://ballisticventures.com/why-we-invested-in-hypernative",
      "https://cryptorank.io/price/hypernative",
      "https://docs.linea.build/get-started/tooling/security/hypernative",
      "https://hackernoon.com/hypernative-and-flare-form-strategic-alliance-to-fortify-web3-security",
      "https://medium.com/@Hypernative/about",
      "https://moralis.com/web3-wiki/hypernative",
      "https://www.businesswire.com/news/home/20250610162307/en/Hypernative-Raises-%2440M-Series-B-to-Remove-Security-Barriers-to-Web3-Mass-Adoption",
      "https://www.comeet.com/jobs/hypernative/8A.00E",
      "https://www.hypernative.io",
      "https://www.yahoo.com/news/crypto-security-startup-hypernative-raises-130027102.html"
    ],
    _processed: true
  },
  "Innoviz Technologies": {
    ws: ["https://innoviz.tech", "https://ir.innoviz.tech"],
    li: ["https://www.linkedin.com/company/innoviz-technologies"],
    fb: ["https://www.facebook.com/InnovizTechnologies"],
    tw: ["https://twitter.com/InnovizLiDAR"],
    ytc: ["https://www.youtube.com/channel/UCVc1KFsu2eb20M8pKFwGiFQ"],
    ytp: ["https://www.youtube.com/@innoviztechnologies3315"],
    urls: ["https://twitter.com/KeilafOmer"],
    _processed: "auto"
  },
  LayerX: {
    li: ["https://www.linkedin.com/company/layerx-security"],
    tw: ["https://x.com/LayerxSecurity"],
    gh: ["https://github.com/Mirovia-Security"],
    ytp: ["https://www.youtube.com/@LayerXSecurity"],
    urls: ["https://www.facebook.com/people/LayerX-Security/100063772826342"],
    _processed: true
  },
  Lightricks: {
    ws: ["https://lightricks.com", "https://ltx.io"],
    li: ["https://www.linkedin.com/company/lightricks"],
    tw: ["https://x.com/Lightricks"],
    ig: ["https://www.instagram.com/lightricks"],
    ytc: ["https://www.youtube.com/channel/UCKWhLS9QMr1oNthZL1fZB4A"],
    _processed: "auto"
  },
  Lightrun: {
    ws: ["https://lightrun.com/"],
    li: ["https://www.linkedin.com/company/lightrun"],
    tw: ["https://twitter.com/Lightruntech"],
    ig: ["https://www.instagram.com/lightruncommunity"],
    gh: ["https://github.com/lightrun-platform/koolkits"],
    ytc: ["https://www.youtube.com/channel/UC9KnFnprep7q5LThL7u2c1w"],
    urls: [
      "https://app.lightrun.com",
      "https://aws.amazon.com",
      "https://docs.lightrun.com",
      "https://gmpg.org",
      "https://go.lightrun.com",
      "https://landscape.cncf.io",
      "https://playground.lightrun.com",
      "https://trust.lightrun.com",
      "https://www.facebook.com",
      "https://www.g2.com"
    ],
    _processed: "auto"
  },
  Lumen: {
    ws: ["https://www.lumen.me/"],
    fb: ["https://www.facebook.com/Lumen.me"],
    tw: ["https://x.com/LumenMetabolism"],
    ig: ["https://www.instagram.com/lumen.me"],
    ytc: ["https://www.youtube.com/channel/UC3XkEyGUMXfRhZcB0Ve_fQQ?view_as=subscriber"],
    urls: ["https://help.lumen.me/s", "https://help.lumen.me/s/contactsupport", "https://www.pinterest.com/MyLumen"],
    _processed: "auto"
  },
  "Maris Tech Ltd.": { fb: "https://www.facebook.com/MarisTech" },
  "Metis Technologies": { fb: "", tw: "" },
  MoonPay: {
    ig: ["https://www.instagram.com/moonpay"],
    ytp: ["https://www.youtube.com/@moonpayhq"],
    ytc: ["https://www.youtube.com/channel/UC9hQtWpGGNaZ8yiwFsBkRBg"],
    th: ["https://www.threads.com/@moonpay"],
    urls: [
      "https://apps.apple.com/us/developer/moonpay/id1635031434",
      "https://play.google.com/store/apps/developer?id=MoonPay"
    ],
    android_dev_id: "com.moonpay",
    _processed: true
  },
  MyHeritage: { li: "https://www.linkedin.com/company/myheritage" },
  "Nanox Imaging": {
    ws: ["https://www.nanox.vision/"],
    li: ["https://www.linkedin.com/company/nanox-imaging"],
    fb: ["https://www.facebook.com/NanoxVision"],
    tw: ["https://x.com/nanox_vision"],
    urls: ["https://investors.nanox.vision", "https://nanoxvision.zendesk.com"],
    _processed: "auto"
  },
  "Nebius Group": {
    ws: [
      "https://nebius.com",
      "https://tripleten.com",
      "https://toloka.ai",
      "https://www.avride.ai",
      "https://tracto.ai"
    ],
    li: [
      "https://www.linkedin.com/company/avrideai",
      "https://www.linkedin.com/company/nebius",
      "https://www.linkedin.com/company/toloka",
      "https://www.linkedin.com/company/tractoai"
    ],
    fb: [
      "https://www.facebook.com/globaltoloka",
      "https://www.facebook.com/nebiusofficial",
      "https://www.facebook.com/tripleten.tech"
    ],
    tw: [
      "https://x.com/TripleTenTech",
      "https://x.com/avrideai",
      "https://x.com/nebiusai",
      "https://x.com/tolokaai",
      "https://x.com/tractoai"
    ],
    ig: ["https://www.instagram.com/avride.ai", "https://www.instagram.com/tripleten.tech"],
    gh: ["https://github.com/Toloka", "https://github.com/nebius", "https://github.com/tractoai"],
    ytp: [
      "https://www.youtube.com/@TripleTenTech",
      "https://www.youtube.com/@nebiusofficial",
      "https://www.youtube.com/@TolokaAi"
    ],
    ytc: [
      "https://www.youtube.com/channel/UCGvsgFPVyOwuN8aJJbMem9A",
      "https://www.youtube.com/channel/UCCIwsFWZNuugtW1U2X89t7A",
      "https://www.youtube.com/channel/UCGvsgFPVyOwuN8aJJbMem9A"
    ],
    tt: ["https://www.tiktok.com/@tripleten.tech"],
    th: ["https://www.threads.com/@tripleten.tech"],
    urls: [
      "https://clickhouse.com",
      "https://de.finance.yahoo.com/quote/NBIS",
      "https://discord.com/login",
      "https://linktr.ee/TripleTen",
      "https://linktr.ee/TripleTen.Tech",
      "https://medium.com/nebius",
      "https://open.spotify.com/user/31wd6uyi4z7s3no2ll2anlssxplq?utm_campaign=Spotify&utm_medium=Organic&utm_source=Linktree&utm_term=SocialMedia&utm_content=Music",
      "https://podcasts.apple.com/us/podcast/techstart/id1711188418",
      "https://www.google.com/search?q=Nebius+Group+N.V.&rlz=1C1MMCH_enDE1105DE1105&sourceid=chrome&ie=UTF-8&sei=FssGadmOBrmH7NYPu4iEqAQ",
      "https://www.linkedin.com/school/tripleten"
    ],
    _processed: true
  },
  Noma: {
    li: ["https://www.linkedin.com/company/noma-security"],
    tw: ["https://x.com/NomaSecurity"],
    gh: ["https://github.com/Noma-Security"],
    ytp: ["https://www.youtube.com/@NomaSecurity"],
    urls: ["https://noma.security"],
    alt: [
      { n: "Holistic AI", ws: "https://www.holisticai.com/" },
      { n: "Securiti", ws: "https://securiti.ai/" },
      { n: "Credo AI", ws: "https://www.credo.ai/" },
      { n: "Protect AI", ws: "https://protectai.com/" }
    ],
    _processed: true
  },
  "Od Podcast": { ws: "", li: "https://www.linkedin.com/company/guykatsovichpodcast" },
  "Omada Health": {
    ig: ["https://www.instagram.com/omadahealth"],
    ytp: ["https://www.youtube.com/@Omadahealth", "https://www.youtube.com/omadahealth"],
    urls: [
      "https://play.google.com/store/apps/developer?id=Omada+Health",
      "https://apps.apple.com/us/developer/omada-health-inc/id805711011",
      "https://www.cnbc.com/quotes/OMDA",
      "https://vimeo.com/weareomadahealth",
      "https://job-boards.greenhouse.io/omadahealth"
    ],
    android_dev_id: "com.healthcoda",
    _processed: true
  },
  Onebeat: {
    li: ["https://www.linkedin.com/company/1beat"],
    fb: ["https://www.facebook.com/1beatretail"],
    tw: ["https://twitter.com/Onebeat4retail"],
    ytp: ["https://www.youtube.com/@onebeat8428"],
    _processed: "auto"
  },
  "Ox Security": {
    li: ["https://www.linkedin.com/company/ox-security"],
    tw: ["https://x.com/OX__Security"],
    ig: ["https://www.instagram.com/lifeatox"],
    gh: ["https://github.com/oxsecurity"],
    ytp: ["https://www.youtube.com/@OXSecurity"],
    urls: [
      "https://aws.amazon.com/marketplace/seller-profile?id=a25fc18e-8294-4c7d-83ed-0c6feaa8f203",
      "https://github.com/marketplace/actions/ox-security-scan",
      "https://hub.docker.com/r/oxsecurity/megalinter-only-typescript_prettier",
      "https://hub.docker.com/u/oxsecurity",
      "https://marketplace.microsoft.com/en-us/product/saas/oxappsecsecurityltd1676898384401.ox_appsec_security",
      "https://megalinter.io",
      "https://www.g2.com/products/ox-security",
      "https://www.youtube.com/watch?v=NKmSq_IP6lU",
      "https://www.facebook.com/profile.php?id=61567333454839"
    ],
    _processed: true
  },
  Playtika: {
    li: ["https://il.linkedin.com/company/playtika"],
    fb: [
      "https://apps.facebook.com/pokerheat",
      "https://apps.facebook.com/vegas_downtown_slots",
      "https://www.facebook.com/AnimalsandCoins",
      "https://www.facebook.com/Playtika"
    ],
    tw: ["https://twitter.com/playtika_ltd?lang=he"],
    ig: ["https://www.instagram.com/playtika"],
    urls: [
      "https://play.google.com/store/apps/details?id=air.com.buffalo_studios.newflashbingo",
      "https://play.google.com/store/apps/details?id=air.com.playtika.cvs",
      "https://play.google.com/store/apps/details?id=air.com.playtika.slotomania",
      "https://play.google.com/store/apps/details?id=com.Seriously.BestFiends&hl=en",
      "https://play.google.com/store/apps/details?id=com.bigblueparrot.pokerfriends",
      "https://play.google.com/store/apps/details?id=com.innplaylabs.animalkingdomraid&hl=en&gl=US",
      "https://play.google.com/store/apps/details?id=com.jellybtn.boardkings&hl=iw&gl=US",
      "https://play.google.com/store/apps/details?id=com.jellybtn.cashkingmobile",
      "https://play.google.com/store/apps/details?id=com.pacificinteractive.HouseOfFun",
      "https://play.google.com/store/apps/details?id=com.playtika.caesarscasino",
      "https://play.google.com/store/apps/details?id=com.playtika.wsop.gp",
      "https://play.google.com/store/apps/details?id=com.screenshake.dominodreams",
      "https://play.google.com/store/apps/details?id=com.superplaystudios.dicedreams",
      "https://play.google.com/store/apps/details?id=com.superplaystudios.disneysolitairedreams&hl=en",
      "https://play.google.com/store/apps/details?id=com.youdagames.gop3multiplayer&hl=en_US",
      "https://play.google.com/store/apps/details?id=com.youdagames.monopolypoker&hl=en_US",
      "https://play.google.com/store/apps/details?id=fi.reworks.redecor&hl=en&gl=US",
      "https://play.google.com/store/apps/details?id=net.supertreat.solitaire",
      "https://play.google.com/store/apps/details?id=net.supertreat.solitaire&hl=en"
    ],
    android_app_ids: [
      "air.com.buffalo_studios.newflashbingo",
      "air.com.playtika.cvs",
      "air.com.playtika.slotomania",
      "com.Seriously.BestFiends",
      "com.bigblueparrot.pokerfriends",
      "com.innplaylabs.animalkingdomraid",
      "com.jellybtn.boardkings",
      "com.jellybtn.cashkingmobile",
      "com.pacificinteractive.HouseOfFun",
      "com.playtika.caesarscasino",
      "com.playtika.wsop.gp",
      "com.screenshake.dominodreams",
      "com.superplaystudios.dicedreams",
      "com.superplaystudios.disneysolitairedreams",
      "com.youdagames.gop3multiplayer",
      "com.youdagames.monopolypoker",
      "fi.reworks.redecor",
      "net.supertreat.solitaire"
    ],
    _processed: true
  },
  "Protect AI": {
    gh: ["https://github.com/protectai"],
    ytp: ["https://www.youtube.com/@protectai"],
    urls: ["https://mlsecops.slack.com/signup#/domain-signup"],
    _processed: true
  },
  "Red Alert": { ws: "" },
  Semperis: {
    ws: ["https://www.hipconf.com", "https://www.semperis.com"],
    li: [
      "https://www.linkedin.com/company/hybrid-identity-protection-conference",
      "https://www.linkedin.com/company/semperis"
    ],
    fb: ["https://www.facebook.com/semperistech", "https://www.facebook.com/HIPConf"],
    tw: ["https://x.com/hipconf", "https://x.com/semperistech"],
    ig: ["https://www.instagram.com/hipconf"],
    ytp: ["https://www.youtube.com/@semperistech"],
    ytc: ["https://www.youtube.com/channel/UCycrWXhxOTaUQ0sidlyN9SA"],
    th: ["https://www.threads.com/@semperistech"],
    urls: [
      "https://hipconf.slack.com",
      "https://marketplace.microsoft.com/en-us/product/saas/semperis.semperis-hybrid-active-directory-protection"
    ],
    _processed: true
  },
  SentinelOne: {
    li: [
      "https://www.linkedin.com/company/sentinelone-dach",
      "https://www.linkedin.com/company/sentinelone-france",
      "https://www.linkedin.com/showcase/sentinelone-apj",
      "https://www.linkedin.com/company/sentinelone"
    ],
    gh: ["https://github.com/Sentinel-One"],
    ytp: ["https://www.youtube.com/@Sentinelone-inc"],
    ytc: ["https://www.youtube.com/channel/UCm-vzfQy1lNglsXRBY6Vu5w"],
    urls: ["https://play.google.com/store/apps/developer?id=Zimperium+INC."],
    android_dev_id: "com.sentinelone",
    _processed: true
  },
  Sentra: {
    gh: ["https://github.com/sentraio"],
    ytp: ["https://www.youtube.com/@sentra_security"],
    urls: ["https://www.facebook.com/profile.php?id=100091748057784"],
    alt: [
      { n: "Securiti", ws: "https://securiti.ai/" },
      { n: "OneTrust", ws: "https://www.onetrust.com/" },
      { n: "Netwrix", ws: "https://www.netwrix.com/" }
    ],
    _processed: true
  },
  Silverfort: {
    ig: ["https://www.instagram.com/life_at_silverfort"],
    gh: ["https://github.com/silverfort-open-source"],
    ytp: ["https://www.youtube.com/@silverfort"],
    urls: [
      "https://apps.apple.com/us/developer/silverfort/id1227704144",
      "https://chromewebstore.google.com/detail/silverfort/pehheafegmblicfcnkpacblgfeabpgim",
      "https://play.google.com/store/apps/developer?id=Silverfort+Inc."
    ],
    android_dev_id: "com.silverfort",
    alt: [
      { n: "Keycloak", ws: "https://www.keycloak.org/" },
      { n: "BeyondTrust", ws: "https://www.beyondtrust.com/" },
      { n: "One Identity", ws: "https://www.oneidentity.com/" }
    ],
    _processed: true
  },
  Somite: { tw: "https://x.com/somiteai" },
  Sorbet: { ws: ["https://advance.getsorbet.com/login"], _processed: "auto" },
  Speedata: {
    li: ["https://www.linkedin.com/company/speedataio"],
    fb: ["https://www.facebook.com/speedata.io"],
    gh: ["https://github.com/Speedata-io"],
    ytp: ["https://www.youtube.com/@Speedata-io"],
    alt: [
      { n: "ARM Neoverse", ws: "https://www.arm.com/products/silicon-ip-cpu/neoverse/" },
      { n: "Xilinx Versal ACAP", ws: "https://www.xilinx.com/products/silicon-platforms/versal.html" }
    ],
    _processed: true
  },
  Team8: {
    li: "https://www.linkedin.com/company/team8group",
    tw: "https://x.com/team8group",
    ig: ["https://www.instagram.com/team8group"],
    ytp: ["https://www.youtube.com/@team8group"],
    ytc: ["https://www.youtube.com/channel/UCyHEyZPo7EMoHcWyDtMxMFA"],
    th: ["https://www.threads.com/@team8group"],
    urls: [
      "https://medium.com/@fleur.s",
      "https://medium.com/@galia.beer.gabel",
      "https://medium.com/@liran_grinberg",
      "https://medium.com/@omridam",
      "https://medium.com/team8",
      "https://play.google.com/store/apps/details?id=com.eventcadence.team8",
      "https://vimeo.com/443398567",
      "https://www.comeet.com/jobs/team8/61.003"
    ],
    android_app_ids: ["com.eventcadence.team8"],
    alt: [
      { n: "Rocket Internet", ws: "https://www.rocket-internet.com/" },
      { n: "Atomico", ws: "https://www.atomico.com/" },
      { n: "Balderton Capital", ws: "https://www.balderton.com/" }
    ],
    _processed: true
  },
  "The Agro Exchange": { ws: "https://www.agrox.io" },
  ThetaRay: {
    ws: ["https://thetaray.com"],
    li: ["https://www.linkedin.com/company/thetaray"],
    fb: ["https://www.facebook.com/thetaray"],
    tw: ["https://x.com/ThetaRayTeam"],
    ig: ["https://www.instagram.com/thetaray"],
    ytp: ["https://www.youtube.com/@thetaray5752"],
    ytc: ["https://www.youtube.com/channel/UCnygTgxdaLM9mUcGUThTrxQ"],
    urls: [
      "https://marketplace.microsoft.com/en-us/product/saas/thetaray.tr-aml-cb-saas",
      "https://open.spotify.com/show/0WORVS3Noo9CqL3FWNLjqY"
    ],
    _processed: true
  },
  Torq: {
    fb: ["https://www.facebook.com/torqhq"],
    tw: ["https://x.com/torq_io"],
    ig: ["https://www.instagram.com/torq_io"],
    gh: ["https://github.com/torqio"],
    ytp: ["https://www.youtube.com/@torq_io"],
    tt: ["https://www.tiktok.com/@torq.io"],
    urls: ["https://job-boards.greenhouse.io/torq"],
    alt: [
      { n: "Tines", ws: "https://www.tines.com/" },
      { n: "D3 Security", ws: "https://d3security.com/" },
      { n: "Swimlane", ws: "https://swimlane.com/" }
    ],
    _processed: true
  },
  Traceloop: {
    ws: ["https://traceloop.com/"],
    li: ["https://www.linkedin.com/company/traceloop"],
    tw: ["https://twitter.com/traceloopdev"],
    gh: ["https://github.com/traceloop/hub", "https://github.com/traceloop/openllmetry"],
    urls: ["https://app.traceloop.com", "https://status.traceloop.com", "https://trust.traceloop.com"],
    _processed: "auto"
  },
  "Tre Capital GP Ltd": { tw: [""] },
  "VAST Data": {
    gh: ["https://github.com/vast-data"],
    ytp: ["https://www.youtube.com/vastdata", "https://www.youtube.com/@VASTData"],
    urls: [
      "https://aws.amazon.com/marketplace/seller-profile?id=seller-rhponql53yee4",
      "https://www.carahsoft.com/vast"
    ],
    _processed: true
  },
  Wix: {
    ws: ["https://www.wix.com", "https://stylable.io", "https://wix.github.io"],
    li: ["https://www.linkedin.com/company/wix-com", "https://www.linkedin.com/showcase/wix-engineering"],
    fb: ["https://www.facebook.com/wix"],
    tw: [
      "https://x.com/WixEng",
      "https://x.com/WixHelp",
      "https://x.com/reactnativenav",
      "https://x.com/rnuilib",
      "https://x.com/wix"
    ],
    ig: ["https://www.instagram.com/wix"],
    gh: ["https://github.com/wix", "https://github.com/wix-academy", "https://github.com/wix-incubator"],
    ytp: ["https://www.youtube.com/@Wix", "https://www.youtube.com/@WixStudio"],
    tt: ["https://www.tiktok.com/@wix"],
    th: ["https://www.threads.com/@wix"],
    urls: [
      "https://central.sonatype.com/namespace/com.wix",
      "https://chromewebstore.google.com/detail/wix-studio-tab/gfcgnonhmndaodgdnjajnpmaknjgkgpg",
      "https://marketplace.visualstudio.com/publishers/wix",
      "https://play.google.com/store/apps/developer?id=Wix.com,+INC.",
      "https://apps.apple.com/us/developer/wix-com-inc/id407141669",
      "https://www.npmjs.com/package/@stylable/core",
      "https://www.npmjs.com/package/react-native-calendars",
      "https://www.npmjs.com/package/react-native-navigation",
      "https://www.npmjs.com/package/react-native-ui-lib",
      "https://www.pinterest.com/wixcom"
    ],
    alt: [
      { n: "Boon Digital Solutions", ws: "https://boondigitalsolutions.com" },
      { n: "Sndian", ws: "https://sndian.com" },
      { n: "wuilt", ws: "https://wuilt.com" },
      { n: "JIMDO", ws: "https://www.jimdo.com" },
      { n: "Webnode", ws: "https://www.webnode.com/" },
      { n: "Tilda", ws: "https://tilda.cc" }
    ],
    android_dev_id: "com.wix",
    _processed: true
  },
  Zenity: {
    li: ["https://www.linkedin.com/company/zenitysec"],
    tw: ["https://x.com/zenitysec"],
    gh: ["https://github.com/zenitysec"],
    ytp: ["https://www.youtube.com/@ZenitySecurity"],
    urls: ["https://github.com/zenitysec/sphinx-rego"],
    _processed: true
  },
  "Zero Networks": {
    ws: ["https://zeronetworks.com/"],
    li: ["https://www.linkedin.com/company/zeronetworks"],
    fb: ["https://www.facebook.com/ZeroNetworksSec"],
    tw: ["https://x.com/zeronetworks"],
    ytp: ["https://www.youtube.com/@zeronetworks4848"],
    urls: ["https://minus273celsius.slack.com", "https://partners.zeronetworks.com"],
    _processed: "auto"
  },
  eToro: {
    ws: ["https://www.etoro.com", "https://etoropartners.com"],
    fb: [
      "https://www.facebook.com/eToroDEofficial",
      "https://www.facebook.com/106007086252277",
      "https://www.facebook.com/183379648361597",
      "https://www.facebook.com/152479438248050"
    ],
    tw: ["https://x.com/eToroES", "https://x.com/eToroAr", "https://x.com/eToroItalia"],
    ig: ["https://www.instagram.com/etoro_italia", "https://www.instagram.com/etoro_official"],
    ytp: [
      "https://www.youtube.com/@etoro",
      "https://www.youtube.com/@eToroItalia",
      "https://www.youtube.com/@eToroAR",
      "https://www.youtube.com/@eToro_ES",
      "https://www.youtube.com/@eToroDE",
      "https://www.youtube.com/@etorofrance877",
      "https://www.youtube.com/eToroDeutsch"
    ],
    tt: ["https://www.tiktok.com/@etoro_official"],
    th: ["https://www.threads.com/@etoro_official"],
    urls: [
      "https://apps.apple.com/us/developer/etoro/id491658374",
      "https://play.google.com/store/apps/developer?id=eToro"
    ],
    android_dev_id: "com.etoro",
    alt: [
      { n: "Trading 212", ws: "https://www.trading212.com/" },
      { n: "DEGIRO", ws: "https://www.degiro.eu/" },
      { n: "IG Group", ws: "https://www.ig.com/" },
      { n: "XTB", ws: "https://www.xtb.com/" },
      { n: "Freedom24", ws: "https://freedom24.com/" },
      { n: "Mubasher", ws: "https://english.mubasher.info/" },
      { n: "AZAforex", ws: "https://www.azaforex.com/" }
    ],
    _processed: true
  },
  "monday.com": {
    ws: ["https://monday.com", "https://www.mondayert.org", "https://www.workcanvas.com"],
    li: ["https://www.linkedin.com/company/mondaydotcom/", "https://www.linkedin.com/company/2525169"],
    tw: ["https://x.com/mondaydotcom", "https://x.com/mondaysupport"],
    ig: [
      "https://www.instagram.com/mondaydotcom",
      "https://www.instagram.com/monday.com.design",
      "https://www.instagram.com/monday.com_engineering",
      "https://www.instagram.com/peopleofmonday"
    ],
    ytp: [
      "https://www.youtube.com/@mondaydotcom",
      "https://www.youtube.com/@mastering-monday",
      "https://www.youtube.com/@mondayappdeveloper",
      "https://www.youtube.com/@tryvechannel"
    ],
    ytc: ["https://www.youtube.com/channel/UCA9UvBiKHly15rN8u_Km3BQ"],
    tt: ["https://www.tiktok.com/@mondayinsights"],
    th: ["https://www.threads.com/@mondaydotcom"],
    urls: [
      "https://www.facebook.com/groups/monday.community",
      "https://www.facebook.com/groups/183295877306250",
      "https://www.facebook.com/groups/1160555395113889",
      "https://www.facebook.com/groups/192373903899712",
      "https://www.facebook.com/groups/monday.com.forenterprise",
      "https://linktr.ee/mondaydotcom",
      "https://play.google.com/store/apps/developer?id=monday.com",
      "https://apps.apple.com/us/developer/monday-com-ltd/id964740028",
      "https://sprout.link/mondaydotcom",
      "https://www.reddit.com/r/mondaydotcom",
      "https://www.linkedin.com/products/mondaydotcom-monday-sales-crm",
      "https://www.linkedin.com/products/mondaydotcom-monday-dev",
      "https://www.linkedin.com/products/mondaydotcom-mondaycom"
    ],
    android_dev_id: "com.monday",
    android_app_ids: ["com.monday.elevate", "com.work_contacts.client", "ai.taka.app"],
    alt: [
      { n: "Zoho Projects", ws: "https://www.zoho.com/projects/" },
      { n: "OpenProject", ws: "https://www.openproject.org/" },
      { n: "Wrike", ws: "https://www.wrike.com/" },
      { n: "Teamwork", ws: "https://www.teamwork.com/" },
      { n: "Basecamp", ws: "https://basecamp.com/" },
      { n: "Quire", ws: "https://quire.io/" },
      { n: "Bitrix24", ws: "https://www.bitrix24.com/" }
    ],
    _processed: true
  }
}
