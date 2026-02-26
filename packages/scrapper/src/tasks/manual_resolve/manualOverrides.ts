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
  "01 Founders": { li: "https://www.linkedin.com/school/01-founders" },
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
      { n: "Mistral AI", ws: "https://mistral.ai" },
      { n: "Cohere", ws: "https://cohere.com" },
      { n: "Aleph Alpha", ws: "https://www.aleph-alpha.com" },
      { n: "Stability AI", ws: "https://stability.ai" }
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
  "Aim Security": {
    ws: [
      "https://www.catonetworks.com",
      "https://cc.catonetworks.com",
      "https://cc2.catonetworks.com",
      "https://connect.catonetworks.com",
      "https://partners.catonetworks.com"
    ],
    li: ["https://www.linkedin.com/company/cato-networks"],
    fb: ["https://www.facebook.com/CatoNetworks"],
    tw: ["https://twitter.com/CatoNetworks"],
    _processed: "auto"
  },
  "Alpha Tau Medical": {
    ws: ["https://www.alphatau.com"],
    li: ["https://www.linkedin.com/company/10538741"],
    fb: ["https://www.facebook.com/AlphaTauMedical"],
    ytc: ["http://www.youtube.com/channel/UCMmWvVwo1iEaQbncaIrK1PQ"],
    _processed: "auto"
  },
  Appcharge: {
    ws: ["https://www.appcharge.com"],
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
      "https://support.comeet.co/section/terms-and-policies"
    ],
    _processed: "auto"
  },
  "Astrix Security": {
    ws: ["https://astrix.security"],
    li: ["https://www.linkedin.com/company/astrix-security"],
    tw: ["https://x.com/AstrixSecurity"],
    ytp: ["https://www.youtube.com/@astrix-security"],
    _processed: "auto"
  },
  Atera: {
    ws: ["https://www.atera.com"],
    li: ["https://www.linkedin.com/company/atera-networks"],
    fb: ["https://www.facebook.com/AteraCloud"],
    tw: ["https://twitter.com/ateracloud"],
    ytc: ["https://www.youtube.com/channel/UCvyHUS2lapDWiBYvwuYwUsg"],
    urls: [
      "https://academy.atera.com",
      "https://app.atera.com/login",
      "https://apps.apple.com/il/app/atera/id1478043603",
      "https://community.atera.com",
      "https://discord.gg/uMvU3D8wuZ",
      "https://status.atera.com",
      "https://support.atera.com",
      "https://trust.atera.com",
      "https://www.reddit.com/r/atera",
      "https://zapier.com/apps/atera-1/integrations"
    ],
    android_app_ids: ["com.atera.ateramobileapp"],
    _processed: "auto"
  },
  "Aurora Labs": {
    ws: ["https://www.auroralabs.com"],
    li: ["https://www.linkedin.com/company/auroralabs"],
    fb: ["https://www.facebook.com/TheAuroraLabs"],
    tw: ["https://x.com/TheAuroraLabs"],
    gh: ["https://github.com/auroralabs-loci"],
    urls: [
      "https://www.auroralabs.com/about-us",
      "https://www.auroralabs.com/awards",
      "https://www.auroralabs.com/blog",
      "https://www.auroralabs.com/brochures-papers",
      "https://www.auroralabs.com/careers",
      "https://www.auroralabs.com/contact",
      "https://www.auroralabs.com/events",
      "https://www.auroralabs.com/knowledge-center",
      "https://www.auroralabs.com/news-articles",
      "https://www.auroralabs.com/our-team",
      "https://www.auroralabs.com/privacy-policy",
      "https://www.auroralabs.com/terms",
      "https://www.auroralabs.com/videos"
    ],
    _processed: "auto"
  },
  Balance: {
    ws: ["https://www.getbalance.com"],
    li: ["https://www.linkedin.com/company/getbalance"],
    tw: ["https://twitter.com/GetBalanceHQ"],
    urls: ["https://dashboard.getbalance.com", "https://updates.getbalance.com"],
    _processed: "auto"
  },
  "Beyond Oil": {
    ws: ["https://www.beyondoil.co"],
    li: ["https://www.linkedin.com/company/beyond-oil"],
    fb: ["https://www.facebook.com/beyondoil.ltd"],
    tw: ["https://twitter.com/oil_beyond"],
    ytp: ["https://www.youtube.com/@beyond-oil"],
    tt: ["https://www.tiktok.com/@beyond_oil"],
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
      "https://marketplace.microsoft.com/en-gb/product/saas/biocatch.biocatch_behavioral_biometrics",
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
  Buildots: {
    ws: ["https://buildots.com"],
    li: ["https://www.linkedin.com/company/buildots"],
    fb: ["https://www.facebook.com/buildots"],
    ig: ["https://www.instagram.com/buildots"],
    ytp: ["https://www.youtube.com/@Buildots"],
    urls: ["https://app.bldts.io", "https://buildots.net"],
    _processed: "auto"
  },
  "Cato Networks": {
    ws: ["https://www.catonetworks.com"],
    li: ["https://www.linkedin.com/company/cato-networks"],
    fb: ["https://www.facebook.com/CatoNetworks"],
    tw: ["https://twitter.com/CatoNetworks"],
    urls: ["https://cc.catonetworks.com", "https://connect.catonetworks.com", "https://partners.catonetworks.com"],
    _processed: "auto"
  },
  Cellebrite: {
    li: [
      "https://www.linkedin.com/company/cellebrite",
      "http://www.linkedin.com/company/100045",
      "https://www.linkedin.com/showcase/cellebrite-careers",
      "https://www.linkedin.com/showcase/cellebrite-enterprise-solutions"
    ],
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
      "https://cellebrite.my.site.com"
    ],
    _processed: true
  },
  Chargeflow: {
    ws: ["https://www.chargeflow.io"],
    li: ["https://www.linkedin.com/company/chargeflowhq"],
    tw: ["https://x.com/chargeflow", "https://x.com/chargeflowhq"],
    ytp: ["https://www.youtube.com/@ChargeflowHQ"],
    tt: ["https://www.tiktok.com/@chargeflow"],
    urls: [
      "https://app.chargeflow.io",
      "https://apps.shopify.com/chargeflow",
      "https://docs.chargeflow.io",
      "https://help.chargeflow.io",
      "https://marketplace.stripe.com/apps/chargeflow",
      "https://status.chargeflow.io",
      "https://trust.chargeflow.io",
      "https://www.g2.com/products/chargeflow-inc-chargeflow/reviews",
      "https://www.producthunt.com/products/chargeflow",
      "https://www.trustpilot.com/review/chargeflow.io"
    ],
    _processed: "auto"
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
  Cognyte: {
    ws: ["https://www.cognyte.com"],
    li: ["https://www.linkedin.com/company/cognyte"],
    tw: ["https://twitter.com/Cognyte"],
    ytc: ["https://www.youtube.com/channel/UCqIvlQRaVQ38kr03p5QTDWA"],
    urls: ["https://www.glassdoor.com/Overview/Working-at-Cognyte-EI_IE4430257.11,18.htm"],
    _processed: "auto"
  },
  CropX: {
    ws: ["https://cropx.com"],
    li: ["https://www.linkedin.com/company/10147582"],
    fb: ["https://www.facebook.com/CropXGlobal"],
    tw: ["https://twitter.com/crop_x"],
    ig: ["https://www.instagram.com/cropx_global"],
    ytc: ["https://www.youtube.com/channel/UCcwU6dNzM7KsNLrP1b4u0iw"],
    urls: ["https://help.cropx.com", "https://help.cropx.com/portal/en/home", "https://myfarm.cropx.com/login"],
    _processed: "auto"
  },
  Cyabra: {
    ws: ["https://cyabra.com"],
    li: ["https://www.linkedin.com/company/cyabra"],
    tw: ["https://x.com/thecyabra"],
    ytp: ["https://www.youtube.com/@cyabra"],
    urls: ["https://errol.cyabra.com", "https://open.spotify.com/show/3gMZQTgbe3Wajzm9bDyJSW"],
    _processed: "auto"
  },
  Cycode: {
    ws: ["https://cycode.com"],
    li: ["https://www.linkedin.com/company/cycode"],
    fb: ["https://www.facebook.com/Life.at.Cycode"],
    tw: ["https://twitter.com/CycodeHQ"],
    ig: ["https://www.instagram.com/life_at_cycode"],
    urls: [
      "https://app.cycode.com/account/login",
      "https://dribbble.com/cycode-design",
      "https://generatepress.com",
      "https://status.cycode.com"
    ],
    _processed: "auto"
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
  Cymulate: {
    ws: ["https://cymulate.com", "https://app.cymulate.com", "https://partner.cymulate.com"],
    li: ["https://www.linkedin.com/company/cymulate"],
    ig: ["https://www.instagram.com/cymulate"],
    ytp: ["https://www.youtube.com/@cymulateltd"],
    _processed: "auto"
  },
  Cynomi: {
    ws: ["https://cynomi.com"],
    li: ["https://www.linkedin.com/company/cynomi"],
    ytc: ["https://www.youtube.com/channel/UCWPWKFH5pJ6gdyp7WpATdVg"],
    urls: [
      "https://cynomi.com/about",
      "https://cynomi.com/academy",
      "https://cynomi.com/blog",
      "https://cynomi.com/careers",
      "https://cynomi.com/contact-us",
      "https://cynomi.com/events-and-webinar",
      "https://cynomi.com/news",
      "https://cynomi.com/partners",
      "https://cynomi.com/product-login",
      "https://cynomi.com/resources",
      "https://cynomi.com/resources/testimonials",
      "https://cynomi.com/security",
      "https://cynomi.com/solutions/cyber-resilience-management",
      "https://cynomi.com/solutions/risk-management",
      "https://cynomi.com/solutions/third-party-risk-management",
      "https://cynomi.com/solutions/vciso-services",
      "https://cynomi.com/terms-conditions",
      "https://cynomi.com/vciso-platform",
      "https://partners.cynomi.com"
    ],
    _processed: "auto"
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
  "D-ID": {
    ws: ["https://www.d-id.com"],
    li: ["https://www.linkedin.com/company/deidentification"],
    fb: ["https://www.facebook.com/deidentification"],
    tw: ["https://twitter.com/D_ID_"],
    ig: ["https://www.instagram.com/d_id.ai"],
    ytp: ["https://www.youtube.com/@d-id"],
    tt: ["https://www.tiktok.com/@d_id.studio"],
    urls: [
      "https://docs.d-id.com/docs/quickstart",
      "https://docs.d-id.com/reference/get-started",
      "https://help.d-id.com/hc/en-us",
      "https://studio.d-id.com",
      "https://studio.d-id.com/login",
      "https://www.d-id.com/about-us",
      "https://www.d-id.com/ai-agents",
      "https://www.d-id.com/ai-avatars",
      "https://www.d-id.com/ai-videos",
      "https://www.d-id.com/api",
      "https://www.d-id.com/blog",
      "https://www.d-id.com/careers",
      "https://www.d-id.com/contact-us",
      "https://www.d-id.com/creative-reality-studio",
      "https://www.d-id.com/creative-reality-studio-mobile-app",
      "https://www.d-id.com/customer-experience",
      "https://www.d-id.com/elearning-and-corporate-training-talking-heads",
      "https://www.d-id.com/ethics-in-ai",
      "https://www.d-id.com/faqs",
      "https://www.d-id.com/integrations",
      "https://www.d-id.com/liveportrait-4",
      "https://www.d-id.com/marketing-suite",
      "https://www.d-id.com/natural-user-interface",
      "https://www.d-id.com/news",
      "https://www.d-id.com/partner/microsoft",
      "https://www.d-id.com/pricing/api",
      "https://www.d-id.com/pricing/studio",
      "https://www.d-id.com/privacy-policy",
      "https://www.d-id.com/resources",
      "https://www.d-id.com/resources/glossary",
      "https://www.d-id.com/sales-solutions",
      "https://www.d-id.com/security-and-privacy-compliance",
      "https://www.d-id.com/speaking-portrait",
      "https://www.d-id.com/video-campaigns",
      "https://www.d-id.com/video-translate"
    ],
    _processed: "auto"
  },
  "Dream Security": {
    ws: ["https://dreamgroup.com"],
    li: ["https://www.linkedin.com/company/dreamsecurity"],
    _processed: "auto"
  },
  DriveNets: {
    ws: [
      "https://drivenets.com",
      "https://docs.drivenets.com",
      "https://get.drivenets.com",
      "https://japan.drivenets.com"
    ],
    li: ["https://www.linkedin.com/company/drivenets"],
    fb: ["https://www.facebook.com/drivenets"],
    tw: ["https://twitter.com/drivenets"],
    ytc: ["https://www.youtube.com/channel/UCCZNSjVqjAT_3f5MjzUZJ7A"],
    urls: ["https://medium.com/dn-techbites"],
    _processed: "auto"
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
  Explorium: {
    ws: ["https://www.explorium.ai"],
    li: ["https://www.linkedin.com/company/explorium-ai"],
    urls: [
      "https://admin.explorium.ai/login",
      "https://chat.openai.com",
      "https://claude.ai/new",
      "https://developers.explorium.ai",
      "https://developers.explorium.ai/reference/quick-starts",
      "https://docs.google.com/forms/d/e/1FAIpQLSfqfyymNSzKuuNGqFTky9c4u7w9R99PgvCSZegJClyQyg_OCw/viewform",
      "https://www.comeet.com/jobs/explorium/B4.00E",
      "https://www.explorium.ai",
      "https://www.google.com/search",
      "https://www.perplexity.ai/search/new"
    ],
    _processed: "auto"
  },
  Faye: {
    ws: ["https://www.withfaye.com"],
    li: ["https://www.linkedin.com/company/fayetravelinsurance"],
    fb: ["https://www.facebook.com/FayeTravelInsurance"],
    tw: ["https://twitter.com/FayeTravel"],
    ig: ["https://www.instagram.com/faye.travel"],
    tt: ["https://www.tiktok.com/@fayetravelinsurance"],
    urls: [
      "https://advisors.withfaye.com",
      "https://assets.withfaye.com/android",
      "https://assets.withfaye.com/ios",
      "https://blog.withfaye.com"
    ],
    _processed: "auto"
  },
  Finout: {
    ws: ["https://www.finout.io"],
    li: ["https://www.linkedin.com/company/finout-io"],
    fb: ["https://www.facebook.com/finout.io"],
    tw: ["https://x.com/finout_io"],
    urls: [
      "https://docs.finout.io",
      "https://dribbble.com/Finout",
      "https://start-chat.com/slack/finout/HwVAXB",
      "https://www.g2.com/products/finout/reviews"
    ],
    _processed: "auto"
  },
  Firebolt: {
    ws: ["https://www.firebolt.io", "https://www.selectfrom.shop"],
    li: ["https://www.linkedin.com/company/firebolt"],
    fb: ["https://www.facebook.com/firebolthq"],
    tw: ["https://twitter.com/FireboltHQ"],
    gh: ["https://github.com/firebolt-db/firebolt-core"],
    ytc: [
      "https://www.youtube.com/channel/UC2ZltczfvIIJPmSYqtzv_mA",
      "https://www.youtube.com/channel/UCR94oA7VkFpsriGzwkpYbAA"
    ],
    urls: [
      "https://docs.firebolt.io/godocs",
      "https://go.firebolt.io",
      "https://go.firebolt.io/signup",
      "https://hi.firebolt.io/lp/hands-on-firebolt-workshop",
      "https://status.firebolt.io"
    ],
    _processed: "auto"
  },
  Firefly: {
    ws: ["https://www.firefly.ai"],
    li: ["https://www.linkedin.com/company/fireflyai"],
    tw: ["https://x.com/fireflydotai"],
    ytp: ["https://www.youtube.com/@fireflyaicloud"],
    urls: [
      "https://aiac.dev",
      "https://deny.cloud",
      "https://docs.firefly.ai",
      "https://security.gofirefly.io",
      "https://start-chat.com/slack/firefly/2IC9fX",
      "https://start-chat.com/slack/firefly/8VdQHm",
      "https://start-chat.com/slack/firefly/SW3SAs",
      "https://start-chat.com/slack/firefly/bjBDTQ",
      "https://start-chat.com/slack/firefly/lOJ4OD",
      "https://www.validiac.com"
    ],
    _processed: "auto"
  },
  "Firefly Neuroscience": {
    ws: ["https://fireflyneuro.com/"],
    li: ["https://ca.linkedin.com/company/fireflyneuroscience"],
    tw: ["https://twitter.com/whatsyourbna"],
    urls: ["http://investors.fireflyneuro.com", "https://operaticagency.com", "https://www.mybna.com"],
    _processed: "auto"
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
  Gauzy: {
    ws: ["https://www.gauzy.com"],
    li: ["https://www.linkedin.com/company/2860964"],
    fb: ["https://www.facebook.com/GauzyLTD"],
    tw: ["https://x.com/Gauzycorp"],
    ig: ["https://www.instagram.com/gauzycorp"],
    ytc: ["https://www.youtube.com/channel/UC0itHds1xz1FR5bDJIqOANA"],
    urls: ["https://investors.gauzy.com", "https://vsc.gsa.gov/drupal/node/138"],
    _processed: "auto"
  },
  "Grip Security": {
    ws: ["https://www.grip.security"],
    li: ["https://www.linkedin.com/company/grip-security"],
    urls: ["https://get.grip.security/demo-request.html", "https://help.grip.security"],
    _processed: "auto"
  },
  Hailo: {
    ws: ["https://hailo.ai"],
    li: ["https://www.linkedin.com/company/hailo-ai"],
    fb: ["https://www.facebook.com/HailoTech"],
    tw: ["https://twitter.com/Hailo_ai"],
    ig: ["https://www.instagram.com/life_at_hailo"],
    ytc: ["https://www.youtube.com/channel/UCJyQfXEbUVHhiXM_Lc9e2aw"],
    urls: ["https://community.hailo.ai", "https://community.hailo.ai/session/sso"],
    _processed: "auto"
  },
  Hirundo: { ws: ["https://www.hirundo.io"], li: ["https://www.linkedin.com/company/gethirundo"], _processed: "auto" },
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
  IONIX: {
    ws: ["https://www.ionix.io"],
    li: ["https://www.linkedin.com/company/ionix-security"],
    tw: ["https://twitter.com/ionix_io"],
    urls: ["https://portal.ionix.io/login"],
    _processed: "auto"
  },
  Infinidat: {
    ws: ["https://www.infinidat.com/en"],
    li: ["https://www.linkedin.com/company/infinidat"],
    fb: ["https://www.facebook.com/infinidat"],
    tw: ["https://x.com/infinidat"],
    urls: [
      "https://code.infinidat.com",
      "https://info.infinidat.com/Americas-Outsmarting_Cyberthreats-EN_RegistrationLP.html",
      "https://info.infinidat.com/Future_of_Storage_G4-EN_Webinar_RecordingLP.html",
      "https://info.infinidat.com/G4_Highlights-EN_CentralLP.html",
      "https://info.infinidat.com/contact_us.html",
      "https://info.infinidat.com/request_a_demo.html",
      "https://partner.infinidat.com/PartnerApplication",
      "https://partner.infinidat.com/s/login",
      "https://support.infinidat.com/hc/en-us"
    ],
    _processed: "auto"
  },
  "Innoviz Technologies": {
    ws: ["https://innoviz.tech", "https://ir.innoviz.tech"],
    li: ["https://www.linkedin.com/company/innoviz-technologies"],
    fb: ["https://www.facebook.com/InnovizTechnologies"],
    tw: ["https://twitter.com/InnovizLiDAR"],
    ytc: ["https://www.youtube.com/channel/UCVc1KFsu2eb20M8pKFwGiFQ"],
    ytp: ["https://www.youtube.com/@innoviztechnologies3315"],

    _processed: "auto"
  },
  "Inspira Technologies": {
    ws: ["https://inspira-technologies.com/"],
    li: ["https://www.linkedin.com/company/18356393"],
    fb: ["https://www.facebook.com/InspiraTechnologiesO2"],
    tw: ["https://twitter.com/InspiraTechnol1"],
    urls: [
      "https://inspira-technologies.com/about",
      "https://inspira-technologies.com/art",
      "https://inspira-technologies.com/careers",
      "https://inspira-technologies.com/hyla",
      "https://inspira-technologies.com/inspira-art100",
      "https://inspira-technologies.com/investor-relations",
      "https://inspira-technologies.com/news",
      "https://inspira-technologies.com/qms",
      "https://inspira-technologies.com/wp-content/uploads/2021/10/Code-of-Business-Ethics.pdf",
      "https://inspira-technologies.com/wp-content/uploads/2021/10/Privacy-Policy.pdf",
      "https://inspira-technologies.com/wp-content/uploads/2021/10/Terms-of-Use.pdf",
      "https://inspira-technologies.com/wp-content/uploads/2025/01/Inspira-Investor-Presentation-IINN_November-2024_Final-filed.pdf",
      "https://policies.google.com/privacy",
      "https://policies.google.com/terms",
      "https://www.pearlcom.co.il"
    ],
    _processed: "auto"
  },
  "Israel Innovation Authority": {
    ws: ["https://innovationisrael.org.il"],
    li: ["https://www.linkedin.com/company/5094726/admin"],
    fb: ["https://www.facebook.com/InnovationAuthority"],
    ytc: ["https://www.youtube.com/channel/UCp-kDY6DiCq6PuI6srBaAPw"],
    urls: ["http://innovationisrael.mag.calltext.co.il", "https://www.daatsolutions.co.il"],
    _processed: "auto"
  },
  "Jeffs’ Brands": { ws: ["https://jeffsbrands.com"], urls: ["https://investor.jeffsbrands.com"], _processed: "auto" },
  KELA: {
    ws: ["https://www.kelacyber.com"],
    li: ["https://www.linkedin.com/company/kela-group"],
    tw: ["https://twitter.com/Intel_by_KELA"],
    ig: ["https://www.instagram.com/kelagroup"],
    urls: [
      "https://info.ke-la.com/cs/c",
      "https://info.ke-la.com/kela-cyber-pulse",
      "https://partners.kelacyber.com/log-in"
    ],
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
  LightSolver: {
    ws: ["https://lightsolver.com"],
    li: ["https://www.linkedin.com/company/lightsolver"],
    tw: ["https://twitter.com/lightsolverco"],
    _processed: "auto"
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
    ws: ["https://lightrun.com"],
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
  LiveU: {
    ws: ["https://www.liveu.tv"],
    li: ["https://www.linkedin.com/company/liveu"],
    fb: ["https://www.facebook.com/LiveU.Fans"],
    tw: ["https://twitter.com/LiveU"],
    ig: ["https://www.instagram.com/liveutv"],
    ytp: ["https://www.youtube.com/@LiveUTV"],
    urls: [
      "https://bit.ly/3Dd8DAT",
      "https://bit.ly/3msqAnc",
      "https://get.liveu.tv",
      "https://get.liveu.tv/nab-2026",
      "https://get.liveu.tv/the-power-of-liveu-iq",
      "https://learn.liveu.tv/login",
      "https://shop.liveu.tv",
      "https://support.liveu.tv/hc/en-us",
      "https://www.liveutv.net"
    ],
    _processed: "auto"
  },
  Lumen: {
    ws: ["https://www.lumen.me"],
    fb: ["https://www.facebook.com/Lumen.me"],
    tw: ["https://x.com/LumenMetabolism"],
    ig: ["https://www.instagram.com/lumen.me"],
    ytc: ["https://www.youtube.com/channel/UC3XkEyGUMXfRhZcB0Ve_fQQ"],
    urls: ["https://help.lumen.me/s", "https://help.lumen.me/s/contactsupport", "https://www.pinterest.com/MyLumen"],
    _processed: "auto"
  },
  "Maris Tech Ltd.": { fb: "https://www.facebook.com/MarisTech" },
  "Metis Technologies": { fb: "", tw: "" },
  "Miggo Security": {
    ws: ["https://www.miggo.io"],
    li: ["https://www.linkedin.com/company/miggo-security"],
    tw: ["https://twitter.com/MiggoSecurity"],
    ytp: ["https://www.youtube.com/@MiggoSecurity"],
    _processed: "auto"
  },
  Mitiga: {
    ws: ["https://www.mitiga.io"],
    li: ["https://www.linkedin.com/company/mitiga-io"],
    ytp: ["https://www.youtube.com/@mitigaio"],
    urls: [
      "https://bsky.app/profile/mitiga.bsky.social",
      "https://www.gartner.com/reviews/market/cloud-investigation-and-response-automation-cira/vendor/mitiga/product/mitiga"
    ],
    _processed: "auto"
  },
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
  Morphisec: {
    ws: ["https://www.morphisec.com"],
    li: ["https://www.linkedin.com/company/morphisec"],
    tw: ["https://twitter.com/morphisec"],
    ytc: ["https://www.youtube.com/channel/UCe48cR5xTxPJSYMjG-So7Rw"],
    urls: ["https://morphisec.xamplify.io", "https://support.morphisec.com/hc/en-us"],
    _processed: "auto"
  },
  MyHeritage: { li: "https://www.linkedin.com/company/myheritage" },
  "NSO Group": {
    ws: ["https://www.nsogroup.com"],
    urls: [
      "https://www.nsogroup.com/about-us",
      "https://www.nsogroup.com/contact-us",
      "https://www.nsogroup.com/governance",
      "https://www.nsogroup.com/jobs",
      "https://www.nsogroup.com/news",
      "https://www.nsogroup.com/privacy-policy",
      "https://www.nsogroup.com/terms-conditions"
    ],
    _processed: "auto"
  },
  "Nanox Imaging": {
    ws: ["https://www.nanox.vision"],
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
      "https://open.spotify.com/user/31wd6uyi4z7s3no2ll2anlssxplq",
      "https://podcasts.apple.com/us/podcast/techstart/id1711188418",
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
      { n: "Holistic AI", ws: "https://www.holisticai.com" },
      { n: "Securiti", ws: "https://securiti.ai" },
      { n: "Credo AI", ws: "https://www.credo.ai" },
      { n: "Protect AI", ws: "https://protectai.com" }
    ],
    _processed: true
  },
  "Od Podcast": { ws: "", li: "https://www.linkedin.com/company/guykatsovichpodcast" },
  Oktopost: {
    ws: ["https://www.oktopost.com"],
    li: ["https://www.linkedin.com/company/oktopost"],
    fb: ["https://facebook.com/oktopost"],
    ig: ["https://www.instagram.com/oktopost"],
    tt: ["https://www.tiktok.com/@oktopost_tech"],
    urls: [
      "https://app.oktopost.com",
      "https://benchmark.tools.oktopost.com",
      "https://board.oktopost.com",
      "https://intelligence.oktopost.com"
    ],
    _processed: "auto"
  },
  "Oligo Security": {
    ws: ["https://www.oligo.security"],
    li: ["https://www.linkedin.com/company/oligo-security"],
    tw: ["https://x.com/OligoSecurity"],
    ytp: ["https://www.youtube.com/@oligosec"],
    urls: [
      "https://app-attack-matrix.com",
      "https://go.oligo.security/hubfs/Oligo-OWASP-Top10-LLMs-Cheatsheet.pdf",
      "https://go.oligo.security/hubfs/Zero-Day-Response-Solution.pdf"
    ],
    _processed: "auto"
  },
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
  Optimove: {
    ws: ["https://www.optimove.com"],
    li: ["https://www.linkedin.com/company/optimove"],
    fb: ["https://www.facebook.com/optimove"],
    tw: ["https://x.com/Optimove"],
    ytp: ["https://www.youtube.com/Optimove"],
    urls: [
      "https://academy.optimove.com/hc/en-us",
      "https://courses.optimove.com",
      "https://developer.optimove.com",
      "https://open.spotify.com/user/317eskl3ir4ypt4sd5nvj7srcpbe",
      "https://partners.optimove.com",
      "https://trust.optimove.com"
    ],
    _processed: "auto"
  },
  OurCrowd: {
    ws: [
      "https://www.ourcrowd.com",
      "https://events.ourcrowd.com",
      "https://info.ourcrowd.com",
      "https://summit.ourcrowd.com"
    ],
    li: ["https://www.linkedin.com/company/ourcrowd-llc"],
    fb: ["https://www.facebook.com/Ourcrowdfund"],
    tw: ["https://twitter.com/ourcrowd"],
    ytp: ["https://www.youtube.com/user/OurCrowdFund/featured"],
    urls: ["https://info.ourcrowd.com/ourcrowd-weekly-newsletter-subscription"],
    _processed: "auto"
  },
  Overwolf: {
    ws: ["https://www.overwolf.com"],
    li: ["https://www.linkedin.com/company/overwolf.com"],
    fb: ["https://www.facebook.com/Overwolf"],
    tw: ["https://twitter.com/TheOverwolf"],
    urls: [
      "https://blog.overwolf.com",
      "https://careers.overwolf.com",
      "https://discord.gg/overwolf",
      "https://discord.gg/overwolf-developers",
      "https://www.reddit.com/r/Overwolf"
    ],
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
    tw: ["https://twitter.com/playtika_ltd"],
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
  Port: {
    ws: ["https://www.port.io"],
    li: ["https://www.linkedin.com/company/getport"],
    tw: ["https://twitter.com/tweetsbyport"],
    gh: ["https://github.com/port-labs"],
    ytp: ["https://www.youtube.com/@getport"],
    urls: [
      "https://app.port.io",
      "https://auth.getport.io/authorize",
      "https://demo.port.io/organization/home",
      "https://docs.port.io",
      "https://join.slack.com/t/port-community/shared_invite/zt-2mr8tplo3-8fHgG~f0ipPWpII58_C~LA",
      "https://join.slack.com/t/port-community/shared_invite/zt-2n5tu72wi-FEgN6HGFeG9bcRfHtKYdCg",
      "https://port.statuspage.io",
      "https://status.port.io"
    ],
    _processed: "auto"
  },
  "Priority Software": {
    ws: ["https://www.priority-software.com"],
    li: ["https://www.linkedin.com/company/prioritysoftware"],
    fb: ["https://www.facebook.com/PrioritySoftware"],
    tw: ["https://twitter.com/prioritysw"],
    ytc: ["https://www.youtube.com/channel/UCuOhaPagwvRNqyf7pVKi57A"],
    urls: ["https://market.priority-software.com", "https://support.priority-software.com"],
    _processed: "auto"
  },
  "Protect AI": {
    gh: ["https://github.com/protectai"],
    ytp: ["https://www.youtube.com/@protectai"],
    urls: ["https://mlsecops.slack.com/signup#/domain-signup"],
    _processed: true
  },
  Qodo: {
    ws: ["https://www.qodo.ai"],
    li: ["https://www.linkedin.com/company/qodoai"],
    tw: ["https://x.com/QodoAI"],
    gh: ["https://github.com/Codium-ai", "https://github.com/marketplace/qodo-merge-pro"],
    ytp: ["https://www.youtube.com/@QodoAI"],
    urls: [
      "https://app.qodo.ai",
      "https://docs.qodo.ai/qodo-documentation",
      "https://docs.qodo.ai/qodo-release-notes",
      "https://plugins.jetbrains.com/plugin/21206-codiumai--meaningful-tests-in-python-powered-by-testgpt"
    ],
    _processed: "auto"
  },
  "Quantum Machines": {
    ws: ["https://www.quantum-machines.co"],
    li: ["https://www.linkedin.com/company/quantumachines"],
    fb: ["https://www.facebook.com/quantummachines"],
    tw: ["https://twitter.com/QuantumQM"],
    ytp: ["https://www.youtube.com/c/QuantumMachines"],
    urls: ["https://bsky.app/profile/quantummachines.bsky.social", "https://qm.teamme.link"],
    _processed: "auto"
  },
  "REE Automotive": {
    ws: ["https://ree.auto"],
    li: ["https://www.linkedin.com/company/reeautoofficial"],
    fb: ["https://www.facebook.com/ReeAutoOfficial"],
    tw: ["https://twitter.com/ReeAutoOfficial"],
    ig: ["https://www.instagram.com/reeautoofficial"],
    ytc: ["https://www.youtube.com/channel/UC9sDIkFJSj0A7_AvCuHl3gw"],
    urls: ["https://investors.ree.auto", "https://medium.com/@ReeAutoOfficial"],
    _processed: "auto"
  },
  "Red Alert": { ws: "" },
  RiseUp: {
    ws: ["https://www.riseup.co.il"],
    urls: [
      "https://apps.apple.com/us/app/riseup-%D7%A8%D7%99%D7%99%D7%96%D7%90%D7%A4/id6739494831",
      "https://bit.ly/3TM1GhY",
      "https://input.riseup.co.il/home",
      "https://intercom.help/riseupisrael/he",
      "https://intercom.riseup.co.il/he",
      "https://saving.riseup.co.il/lightup/beginnings",
      "https://signup.riseup.co.il/flow/start"
    ],
    _processed: "auto"
  },
  "Riverside.fm": {
    ws: ["https://riverside.com/"],
    li: ["https://www.linkedin.com/company/riverside-fm"],
    fb: ["https://www.facebook.com/riversidedotfm"],
    ig: ["https://www.instagram.com/riverside.fm"],
    ytc: ["https://www.youtube.com/channel/UCOaG4tMpmIQaLXYe063SZlw"],
    tt: ["https://www.tiktok.com/@riverside.fm"],
    urls: ["https://apps.apple.com/us/app/riverside-fm/id1554443872", "https://support.riverside.com/hc/en-us"],
    android_app_ids: ["riverside.fm"],
    _processed: "auto"
  },
  Salto: {
    ws: ["https://www.salto.io"],
    li: ["https://www.linkedin.com/company/salto-io"],
    tw: ["https://twitter.com/salto_io"],
    gh: ["https://github.com/salto-io/salto"],
    urls: [
      "http://help.salto.io",
      "https://app.salto.io/login",
      "https://app.salto.io/signup",
      "https://www.tulipsecurity.com"
    ],
    _processed: "auto"
  },
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
      { n: "Securiti", ws: "https://securiti.ai" },
      { n: "OneTrust", ws: "https://www.onetrust.com" },
      { n: "Netwrix", ws: "https://www.netwrix.com" }
    ],
    _processed: true
  },
  "Seraphic Security": {
    ws: ["https://seraphicsecurity.com"],
    li: ["https://www.linkedin.com/company/seraphicsecurity"],
    tw: ["https://x.com/SeraphicSec"],
    ytc: ["https://www.youtube.com/channel/UCEFzVspJOMPv2S3EBsam_vw"],
    urls: ["https://2024.seraphicsecurity.com"],
    _processed: "auto"
  },
  Sett: { ws: ["https://www.sett.ai"], li: ["https://www.linkedin.com/company/sett-ai"], _processed: "auto" },
  Sightful: {
    ws: ["https://sightful.com"],
    li: ["https://www.linkedin.com/company/heysightful"],
    ig: ["https://www.instagram.com/sightful"],
    ytp: ["https://www.youtube.com/@Sightful-Official"],
    urls: ["https://help.sightful.com/en"],
    _processed: "auto"
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
      { n: "Keycloak", ws: "https://www.keycloak.org" },
      { n: "BeyondTrust", ws: "https://www.beyondtrust.com" },
      { n: "One Identity", ws: "https://www.oneidentity.com" }
    ],
    _processed: true
  },
  "Skyhawk Security": {
    ws: ["https://app.skyhawk.security", "https://partners.skyhawk.security", "https://skyhawk.security"],
    li: ["https://www.linkedin.com/company/skyhawkcloudsecurity"],
    tw: ["https://twitter.com/SkyhawkCloudSec"],
    urls: [
      "https://www.gartner.com/reviews/market/cloud-native-application-protection-platforms/vendor/skyhawk-security/product/skyhawk-synthesis-security-platform"
    ],
    _processed: "auto"
  },
  Somite: { tw: "https://x.com/somiteai" },
  Sorbet: { ws: ["https://advance.getsorbet.com/login"], _processed: "auto" },
  Speedata: {
    li: ["https://www.linkedin.com/company/speedataio"],
    fb: ["https://www.facebook.com/speedata.io"],
    gh: ["https://github.com/Speedata-io"],
    ytp: ["https://www.youtube.com/@Speedata-io"],
    alt: [
      { n: "ARM Neoverse", ws: "https://www.arm.com/products/silicon-ip-cpu/neoverse" },
      { n: "Xilinx Versal ACAP", ws: "https://www.xilinx.com/products/silicon-platforms/versal.html" }
    ],
    _processed: true
  },
  SysAid: {
    ws: ["https://www.sysaid.com"],
    li: ["https://www.linkedin.com/company/sysaid-technologies-ltd"],
    fb: ["https://www.facebook.com/SysAidIT"],
    tw: ["https://twitter.com/sysaid"],
    urls: [
      "https://careers.sysaid.com",
      "https://developers.sysaid.com",
      "https://discord.gg/UgG8vGz7",
      "https://documentation.sysaid.com"
    ],
    _processed: "auto"
  },
  Tabnine: {
    ws: ["https://www.tabnine.com"],
    li: ["https://www.linkedin.com/company/tabnine"],
    tw: ["https://twitter.com/tabnine"],
    ytc: ["https://www.youtube.com/channel/UC3ZLFXRRmK3XbT5Oq0qPLqA"],
    urls: [
      "https://console.tabnine.com/app/sign-in-emt",
      "https://docs.tabnine.com/main",
      "https://trust.tabnine.com",
      "https://www.tabnine.com/about",
      "https://www.tabnine.com/blog",
      "https://www.tabnine.com/careers",
      "https://www.tabnine.com/code-privacy",
      "https://www.tabnine.com/contact-us",
      "https://www.tabnine.com/cookie-policy",
      "https://www.tabnine.com/install",
      "https://www.tabnine.com/partners",
      "https://www.tabnine.com/pricing",
      "https://www.tabnine.com/privacy-policy",
      "https://www.tabnine.com/terms-of-use"
    ],
    _processed: "auto"
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
      { n: "Rocket Internet", ws: "https://www.rocket-internet.com" },
      { n: "Atomico", ws: "https://www.atomico.com" },
      { n: "Balderton Capital", ws: "https://www.balderton.com" }
    ],
    _processed: true
  },
  "Teva Pharmaceuticals": {
    ws: ["https://www.tevapharm.com"],
    li: ["https://www.linkedin.com/company/teva-pharmaceuticals"],
    fb: ["https://www.facebook.com/tevapharm"],
    tw: ["https://twitter.com/tevausa"],
    ytp: ["https://www.youtube.com/c/tevapharm"],
    urls: ["https://www.medis.is", "https://www.tapi.com"],
    _processed: "auto"
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
  Torii: {
    ws: ["https://www.toriihq.com"],
    li: ["https://www.linkedin.com/company/11298659"],
    tw: ["https://twitter.com/torii_hq"],
    urls: [
      "https://app.toriihq.com/login",
      "https://developers.toriihq.com/reference/introduction-1",
      "https://support.toriihq.com"
    ],
    _processed: "auto"
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
      { n: "Tines", ws: "https://www.tines.com" },
      { n: "D3 Security", ws: "https://d3security.com" },
      { n: "Swimlane", ws: "https://swimlane.com" }
    ],
    _processed: true
  },
  "Tower Semiconductor": {
    ws: ["https://towersemi.com"],
    li: ["https://www.linkedin.com/company/tower-semiconductor"],
    fb: ["https://www.facebook.com/towersemi"],
    ytc: ["https://www.youtube.com/channel/UCMuFZQ2f2DjFPfertm16gYg"],
    urls: [
      "https://careers.towerjazz.com",
      "https://careers.towersemi.com",
      "https://custom-sites.com",
      "https://ir.towersemi.com",
      "https://jp.towersemi.com",
      "https://mp.weixin.qq.com/s/7zBZHhIXQHAGtJfzymMnlQ",
      "https://portal-new.towersemi.com/login",
      "https://portal-usa.towersemi.com",
      "https://portal.towersemi.com",
      "https://portal.towersemi.com/ebiz"
    ],
    _processed: "auto"
  },
  Traceloop: {
    ws: ["https://traceloop.com"],
    li: ["https://www.linkedin.com/company/traceloop"],
    tw: ["https://twitter.com/traceloopdev"],
    gh: ["https://github.com/traceloop/hub", "https://github.com/traceloop/openllmetry"],
    urls: ["https://app.traceloop.com", "https://status.traceloop.com", "https://trust.traceloop.com"],
    _processed: "auto"
  },
  "Tre Capital GP Ltd": { tw: [""] },
  Trigo: {
    ws: ["https://www.trigoretail.com"],
    li: ["https://www.linkedin.com/company/trigoretail"],
    ytp: ["https://www.youtube.com/c/Trigoretail"],
    _processed: "auto"
  },
  "Triple Whale": {
    ws: ["https://www.triplewhale.com"],
    li: ["https://www.linkedin.com/company/triple-whale"],
    tw: ["https://x.com/triplewhale"],
    ytp: ["https://www.youtube.com/@TripleWhale"],
    urls: [
      "https://app.triplewhale.com/signin",
      "https://app.triplewhale.com/signup-free",
      "https://apps.apple.com/us/app/triplewhale/id1511861727",
      "https://connect.triplewhale.com/agencies",
      "https://connect.triplewhale.com/technology",
      "https://elpatio.studio",
      "https://kb.triplewhale.com",
      "https://play.google.com/store/search",
      "https://triplewhale.readme.io",
      "https://www.g2.com/products/triple-whale/reviews",
      "https://www.thewhalies.com"
    ],
    _processed: "auto"
  },
  "VAST Data": {
    gh: ["https://github.com/vast-data"],
    ytp: ["https://www.youtube.com/vastdata", "https://www.youtube.com/@VASTData"],
    urls: [
      "https://aws.amazon.com/marketplace/seller-profile?id=seller-rhponql53yee4",
      "https://www.carahsoft.com/vast"
    ],
    _processed: true
  },
  Veriti: {
    ws: ["https://www.veriti.ai"],
    li: ["https://www.linkedin.com/company/veriti-security"],
    tw: ["https://twitter.com/VERITISECURITY"],
    _processed: "auto"
  },
  "WSC Sports": {
    ws: ["https://wsc-sports.com"],
    li: ["https://il.linkedin.com/company/wsc-sports-technologies"],
    fb: ["https://www.facebook.com/WSC.SportsTechnologies"],
    tw: ["https://twitter.com/WSC_Sports"],
    ig: ["https://www.instagram.com/wsc_sports"],
    ytp: ["https://www.youtube.com/@wsc-sports"],
    _processed: "auto"
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
      { n: "Webnode", ws: "https://www.webnode.com" },
      { n: "Tilda", ws: "https://tilda.cc" }
    ],
    android_dev_id: "com.wix",
    _processed: true
  },
  Wonderful: {
    ws: ["https://www.wonderful.ai"],
    li: ["https://www.linkedin.com/company/wonderfulcx"],
    tw: ["https://x.com/wonderful_ai"],
    urls: ["https://trust.wonderful.ai"],
    _processed: "auto"
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
    ws: ["https://zeronetworks.com"],
    li: ["https://www.linkedin.com/company/zeronetworks"],
    fb: ["https://www.facebook.com/ZeroNetworksSec"],
    tw: ["https://x.com/zeronetworks"],
    ytp: ["https://www.youtube.com/@zeronetworks4848"],
    urls: ["https://minus273celsius.slack.com", "https://partners.zeronetworks.com"],
    _processed: "auto"
  },
  deepdub: {
    ws: ["https://app.deepdub.ai", "https://deepdub.ai/"],
    li: ["https://www.linkedin.com/company/deepdub-ai"],
    fb: ["https://facebook.com/deepdub.ai.company"],
    tw: ["https://twitter.com/deepdub_ai"],
    ytc: ["https://www.youtube.com/channel/UC4yRa2dcdz7I2l2eag_DefQ"],
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
      { n: "Trading 212", ws: "https://www.trading212.com" },
      { n: "DEGIRO", ws: "https://www.degiro.eu" },
      { n: "IG Group", ws: "https://www.ig.com" },
      { n: "XTB", ws: "https://www.xtb.com" },
      { n: "Freedom24", ws: "https://freedom24.com" },
      { n: "Mubasher", ws: "https://english.mubasher.info" },
      { n: "AZAforex", ws: "https://www.azaforex.com" }
    ],
    _processed: true
  },
  groundcover: {
    ws: ["https://www.groundcover.com"],
    li: ["https://www.linkedin.com/company/groundcover-com"],
    gh: ["https://github.com/groundcover-com"],
    ytp: ["https://www.youtube.com/@groundcover-com"],
    urls: [
      "https://app.groundcover.com",
      "https://docs.groundcover.com",
      "https://join.slack.com/t/groundcover-community/shared_invite/zt-3h47w6vj6-9ajuW0ySTaKd_pH5DoTr1w",
      "https://play.groundcover.com",
      "https://trust.groundcover.com"
    ],
    _processed: "auto"
  },
  "monday.com": {
    ws: ["https://monday.com", "https://www.mondayert.org", "https://www.workcanvas.com"],
    li: ["https://www.linkedin.com/company/mondaydotcom", "https://www.linkedin.com/company/2525169"],
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
      { n: "OpenProject", ws: "https://www.openproject.org" },
      { n: "Wrike", ws: "https://www.wrike.com" },
      { n: "Teamwork", ws: "https://www.teamwork.com" },
      { n: "Basecamp", ws: "https://basecamp.com" },
      { n: "Quire", ws: "https://quire.io" },
      { n: "Bitrix24", ws: "https://www.bitrix24.com" }
    ],
    _processed: true
  }
}
