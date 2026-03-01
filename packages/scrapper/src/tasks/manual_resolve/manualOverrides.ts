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
  "100X": { ws: ["https://get100x.com"], urls: ["https://dany.ai"], _processed: "auto" },
  "1E Therapeutics": { ws: ["https://1etx.com"], urls: ["https://www.pearlcom.co.il"], _processed: "auto" },
  "4M Analytics": {
    ws: ["https://4map.4manalytics.com", "https://help.4manalytics.com", "https://www.4manalytics.com"],
    li: ["https://www.linkedin.com/company/4m-analytics"],
    ytp: ["https://www.youtube.com/@4m-analytics"],
    urls: ["https://open.spotify.com/show/21oVqvA6id4pM7EYTEDAqB"],
    _processed: "auto"
  },
  ADASKY: {
    ws: ["https://www.adasky.com"],
    li: ["https://www.linkedin.com/company/adasky"],
    ytc: ["https://www.youtube.com/channel/ucioha19ovggip7_gkbce-pa"],
    urls: ["http://www.thebunch.co.il", "http://www.tipoos.com"],
    _processed: "auto"
  },
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
  "AIR VEV": {
    ws: ["https://www.airev.aero"],
    li: ["https://www.linkedin.com/company/air-ev"],
    fb: ["https://www.facebook.com/airevtol"],
    tw: ["https://x.com/AirEvtol"],
    ig: ["https://www.instagram.com/airevtol"],
    ytc: ["https://www.youtube.com/channel/UCjD8Me28M91f_R04Zmmkv2Q"],
    _processed: "auto"
  },
  AISAP: { ws: ["https://aisap.ai"], li: ["https://www.linkedin.com/company/aisap.ai"], _processed: "auto" },
  APEX: { ws: ["https://www.dot-training.org"], _processed: "auto" },
  ARMO: {
    ws: [
      "https://auth.armosec.io",
      "https://hub.armosec.io",
      "https://landing.armosec.io",
      "https://www.armosec.io",
      "https://kubescape.io"
    ],
    li: ["https://www.linkedin.com/company/armosec"],
    tw: ["https://x.com/armosec"],
    gh: ["https://github.com/kubescape"],
    urls: ["https://www.g2.com/products/armo/reviews"],
    _processed: "auto"
  },
  "ART MEDICAL": {
    ws: ["https://artmedical.com"],
    li: ["https://www.linkedin.com/company/artmedicalltd"],
    fb: ["https://www.facebook.com/artmedicalltd"],
    tw: ["https://x.com/artmedicalltd"],
    ig: ["https://www.instagram.com/artmedicalltd"],
    _processed: "auto"
  },
  ASOCS: {
    ws: ["https://asocscloud.com", "https://portal.asocscloud.com"],
    li: ["https://www.linkedin.com/company/asocs"],
    fb: ["https://www.facebook.com/asocscloud"],
    tw: ["https://x.com/asocscloud"],
    ytc: ["https://www.youtube.com/channel/ucndyvwxref1tc1nxzot2rwq"],
    urls: ["https://www.careers-page.com/asocs"],
    _processed: "auto"
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
  "Acclym (formerly Agritask)": {
    ws: ["https://www.acclym.com"],
    li: ["https://www.linkedin.com/company/acclym"],
    fb: ["https://www.facebook.com/acclym"],
    tw: ["https://x.com/acclym"],
    ytp: ["https://www.youtube.com/@acclym"],
    urls: ["https://acclym.careers.hibob.com", "https://apps.apple.com/mt/app/agritask/id1541627178"],
    android_app_ids: ["com.agritask.mobile.android"],
    _processed: "auto"
  },
  "Adaptive Shield": {
    ws: [
      "https://community.crowdstrike.com",
      "https://developer.crowdstrike.com",
      "https://ir.crowdstrike.com",
      "https://marketplace.crowdstrike.com",
      "https://supportportal.crowdstrike.com",
      "https://www.crowdstrike.com"
    ],
    li: ["https://www.linkedin.com/company/crowdstrike"],
    ig: ["https://www.instagram.com/crowdstrike"],
    ytp: ["https://www.youtube.com/@subscription_center"],
    _processed: "auto"
  },
  Addressable: {
    ws: ["https://app.addressable.io", "https://www.addressable.io"],
    li: ["https://www.linkedin.com/company/addressableio"],
    tw: ["https://x.com/addressableid"],
    ytp: ["https://www.youtube.com/@addressable"],
    urls: ["https://warpcast.com/addressableio"],
    _processed: "auto"
  },
  Agora: {
    ws: ["https://agorareal.com"],
    li: ["https://www.linkedin.com/company/agora-re"],
    fb: ["https://www.facebook.com/AgoraRE"],
    tw: ["https://x.com/agora_re"],
    ig: ["https://www.instagram.com/agorarealestate"],
    ytc: ["https://www.youtube.com/channel/UC1jkymSVpw6m2lX_JMbaA_A"],
    urls: [
      "https://open.spotify.com/show/1i2O2zXFp6EZuUGtM4BHw5",
      "https://www.g2.com/products/agora-real-estate/reviews"
    ],
    _processed: "auto"
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
  Airobotics: {
    ws: ["https://www.airoboticsdrones.com"],
    li: ["https://www.linkedin.com/company/airobotics"],
    fb: ["https://www.facebook.com/airoboticsUAV"],
    tw: ["https://mobile.twitter.com/AiroboticsUAV"],
    ig: ["https://instagram.com/airoboticsuav"],
    _processed: "auto"
  },
  "Akeyless Security": {
    ws: [
      "https://console.akeyless.io",
      "https://docs.akeyless.io",
      "https://tutorials.akeyless.io",
      "https://www.akeyless.io"
    ],
    li: ["https://www.linkedin.com/company/akeyless"],
    fb: ["https://www.facebook.com/Akeylessio"],
    tw: ["https://twitter.com/akeylessio"],
    ytc: ["https://www.youtube.com/channel/UCO9dU1TNVMgUjri9SAfwSrw"],
    urls: ["https://cloudsecurityalliance.org/star/registry/akeyless-io"],
    _processed: "auto"
  },
  "Aleph Farms": {
    ws: ["https://aleph-farms.com"],
    li: ["https://www.linkedin.com/company/aleph-farms"],
    fb: ["https://www.facebook.com/alephfarms"],
    tw: ["https://x.com/alephfarms"],
    ig: ["https://www.instagram.com/alephcuts"],
    ytc: ["https://www.youtube.com/channel/uc0sesi9gxry9lgedgwg2seg"],
    _processed: "auto"
  },
  "Alison AI": {
    ws: ["https://alison.ai", "https://app.alison.ai"],
    li: ["https://www.linkedin.com/company/alison-ai"],
    fb: ["https://www.facebook.com/officialalisonai"],
    tw: ["https://x.com/alisonai_"],
    ig: ["https://www.instagram.com/alisonai_"],
    ytp: ["https://www.youtube.com/@alisonai"],
    _processed: "auto"
  },
  AllCloud: {
    ws: ["https://allcloud.io", "https://engage.allcloud.io"],
    li: ["https://www.linkedin.com/company/allcloud"],
    fb: ["https://www.facebook.com/allcloud.io"],
    tw: ["https://x.com/_allcloud"],
    ytp: ["https://www.youtube.com/@emindcloud"],
    _processed: "auto"
  },
  "Alpha Omega": {
    ws: ["https://www.alphaomega-eng.com"],
    li: ["https://www.linkedin.com/company/alpha-omega"],
    fb: ["https://www.facebook.com/AlphaOmegaEngineering"],
    tw: ["https://twitter.com/alphaomegaeng"],
    ytc: ["https://www.youtube.com/channel/UCvBEScA5xf3qLgeL5cRUhOQ"],
    urls: ["http://www.catom.com"],
    _processed: "auto"
  },
  "Alpha Tau Medical": {
    ws: ["https://www.alphatau.com"],
    li: ["https://www.linkedin.com/company/10538741"],
    fb: ["https://www.facebook.com/AlphaTauMedical"],
    ytc: ["http://www.youtube.com/channel/UCMmWvVwo1iEaQbncaIrK1PQ"],
    _processed: "auto"
  },
  "Alphabiome.ai": {
    ws: ["https://www.alphabiome.ai"],
    urls: ["https://www.alphabiome.ai", "https://www.moveo.group"],
    _processed: "auto"
  },
  Anodot: {
    ws: [
      "https://app.anodot.com",
      "https://docs.anodot.com",
      "https://go.anodot.com",
      "https://support.anodot.com",
      "https://www.anodot.com"
    ],
    li: ["https://www.linkedin.com/company/anodot"],
    fb: ["https://www.facebook.com/anodot"],
    tw: ["https://twitter.com/TeamAnodot"],
    ig: ["https://www.instagram.com/anodot_hq"],
    urls: ["https://app.pileuscloud.com"],
    _processed: "auto"
  },
  AnyClip: {
    ws: ["https://anyclip.com", "https://docs.anyclip.com", "https://videomanager.anyclip.com"],
    li: ["https://www.linkedin.com/company/anyclip"],
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
  Applitools: {
    ws: [
      "https://applitools.com",
      "https://auth.applitools.com",
      "https://help.applitools.com",
      "https://testautomationu.applitools.com"
    ],
    li: ["http://www.linkedin.com/company/2837526?trk=tyah"],
    fb: ["https://www.facebook.com/Applitools"],
    tw: ["https://twitter.com/applitools"],
    gh: ["https://github.com/applitools"],
    ytc: ["https://www.youtube.com/channel/UCk13Ucc26mWqI4xvsbO13jw"],
    urls: [
      "https://medium.com/@applitools",
      "https://testautomationu.slack.com",
      "https://www.slideshare.net/Applitools"
    ],
    _processed: "auto"
  },
  "Aqua Security": {
    ws: [
      "https://aquademy.aquasec.com",
      "https://cloud.aquasec.com",
      "https://info.aquasec.com",
      "https://success.aquasec.com",
      "https://support.aquasec.com",
      "https://www.aquasec.com"
    ],
    li: ["https://www.linkedin.com/company/aquasecteam"],
    fb: ["https://www.facebook.com/AquaSecTeam"],
    tw: ["https://twitter.com/AquaSecTeam"],
    ig: ["https://www.instagram.com/aquaseclife"],
    gh: ["https://github.com/aquasecurity", "https://github.com/aquasecurity/trivy"],
    ytp: ["https://www.youtube.com/c/AquasecTeam"],
    urls: [
      "https://trivy.dev",
      "https://www.activestate.com/resources/press-releases/activestate-joins-trivy-partner-connect",
      "https://www.forbes.com/sites/tonybradley/2026/02/12/aqua-security-goes-all-in-on-runtime-protection",
      "https://www.g2.com/products/aqua-security/reviews"
    ],
    _processed: "auto"
  },
  Arbe: {
    ws: ["https://arberobotics.com", "https://ir.arberobotics.com"],
    li: ["https://www.linkedin.com/company/arbe-robotics"],
    fb: ["https://www.facebook.com/arberobotics/?ref=page_internal"],
    tw: ["https://twitter.com/Arbe_Robotics"],
    ytc: ["https://www.youtube.com/channel/UCem5Ie0LVKY-5MV6Av9ZfsA"],
    _processed: "auto"
  },
  Artlist: {
    ws: [
      "https://artlist.io",
      "https://www.artlistjobs.io",
      "https://backstage.artlist.io",
      "https://developer.artlist.io",
      "https://toolkit.artlist.io"
    ],
    li: ["https://il.linkedin.com/company/art-list"],
    fb: ["https://www.facebook.com/Artlist.io"],
    tw: ["https://twitter.com/Artlist_io"],
    ig: ["https://www.instagram.com/artlist.io"],
    ytc: ["https://www.youtube.com/channel/UCXNK0IHTX0BoktdtKjqIWoA"],
    tt: ["https://www.tiktok.com/@artlist.io"],
    urls: ["https://open.spotify.com/user/npl7q3ahkoq8j8xthbdzxzikr"],
    _processed: "auto"
  },
  "Aryon Security": {
    ws: ["https://www.aryon.security"],
    li: ["https://www.linkedin.com/company/aryon-security"],
    ig: ["https://www.instagram.com/life_at_aryonsecurity"],
    _processed: "auto"
  },
  "Ask-AI": {
    ws: ["https://getmosaic.ai", "https://ask-ai.zendesk.com"],
    li: ["https://www.linkedin.com/company/ask-ai-tech"],
    urls: ["https://www.comeet.com/jobs/askai/1A.00C"],
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
  "Atlas Invest": {
    ws: ["https://atlas-invest.co", "https://backoffice.atlas-invest.co"],
    li: ["https://www.linkedin.com/company/atlas-invest-ai"],
    ig: ["https://www.instagram.com/atlas.invest.ai"],
    urls: [
      "https://docsend.com/view/cays8gsaiavzd724",
      "https://maps.app.goo.gl/ZzdMejmYSNgtHW9e7",
      "https://www.benzinga.com/pressreleases/25/04/n44946256/atlas-invest-named-2025s-most-promising-startup"
    ],
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
  Autofleet: {
    ws: ["https://autofleet.io", "https://ev.autofleet.io", "https://lp.autofleet.io", "https://taxi.autofleet.io"],
    li: ["https://www.linkedin.com/company/autofleet"],
    fb: ["https://www.facebook.com/autofleet.io"],
    _processed: "auto"
  },
  Autotalks: { name: "Autotalks (Aquired by Qualcomm)", ws: ["https://www.qualcomm.com"], _processed: "auto" },
  "Autotalks (Aquired by Qualcomm)": {
    ws: [
      "https://assets.qualcomm.com",
      "https://investor.qualcomm.com",
      "https://myaccount.qualcomm.com",
      "https://www.qualcomm.com"
    ],
    li: ["https://www.linkedin.com/company/qualcomm"],
    tw: ["https://x.com/qualcomm"],
    ig: ["https://www.instagram.com/qualcomm"],
    ytp: ["https://www.youtube.com/@qualcomm"],
    urls: ["http://www.qualcomm.cn"],
    _processed: "auto"
  },
  Avo: {
    ws: ["https://www.dot-sports.org"],
    urls: ["https://www.godaddy.com/agreements/showdoc", "https://www.godaddy.com/domainsearch/find"],
    _processed: "auto"
  },
  "BBT.live": {
    ws: ["https://bbt.live"],
    li: ["https://www.linkedin.com/company/bbt-live"],
    urls: [
      "https://www.ipoque.com/news-media/press-releases/ipoque-bbt-telco-grade-sdx",
      "https://www.ipoque.com/news-media/resources/case-studies/case-study-bbt.live-dpi-driven-intelligence-connectivity"
    ],
    _processed: "auto"
  },
  BackBox: {
    ws: ["https://backbox.com", "https://support.backbox.com"],
    li: ["https://www.linkedin.com/company/backbox"],
    tw: ["https://x.com/back_box"],
    ytc: ["https://www.youtube.com/channel/ucchvnacudacmn8mn3f8v_dw"],
    urls: ["https://vimeo.com/backbox"],
    _processed: "auto"
  },
  "Backslash Security": {
    ws: [
      "https://appsec.backslash.security",
      "https://mcp.backslash.security",
      "https://threats.backslash.security",
      "https://www.backslash.security"
    ],
    li: ["https://www.linkedin.com/company/backslashsecurity"],
    tw: ["https://twitter.com/BackslashSec"],
    gh: ["https://github.com/backslash-security"],
    ytp: ["https://www.youtube.com/@BackslashSecurity"],
    _processed: "auto"
  },
  Balance: {
    ws: ["https://www.getbalance.com"],
    li: ["https://www.linkedin.com/company/getbalance"],
    tw: ["https://twitter.com/GetBalanceHQ"],
    urls: ["https://dashboard.getbalance.com", "https://updates.getbalance.com"],
    _processed: "auto"
  },
  Ballerine: {
    ws: ["https://ballerine.com"],
    li: ["https://www.linkedin.com/company/ballerine-inc"],
    ytp: ["https://www.youtube.com/@Ballerine-way"],
    urls: [
      "https://ballerine.notion.site/BALLERINE-PRIVACY-POLICY-db6c812a9c6748cda34e07fecb995e08",
      "https://ballerine.notion.site/Ballerine-Terms-of-Use-05868da82711408ca4cc8e1bdc04a431"
    ],
    _processed: "auto"
  },
  Base: {
    ws: ["https://clgcampus.base.ai", "https://go.base.ai", "https://www.base.ai"],
    li: ["https://www.linkedin.com/company/base-clg"],
    tw: ["https://x.com/base_clg"],
    ig: ["https://www.instagram.com/lifeatbase"],
    ytc: ["https://www.youtube.com/channel/ucbppvp_zamumkpuagcm2fta"],
    _processed: "auto"
  },
  BeamUP: { ws: ["https://www.beamup.ai"], _processed: "auto" },
  Beamr: {
    ws: ["https://beamr.com", "https://blog.beamr.com", "https://cloud.beamr.com", "https://investors.beamr.com"],
    li: ["https://www.linkedin.com/company/beamr"],
    fb: ["https://www.facebook.com/BeamrVideo"],
    tw: ["https://x.com/BeamrVideo"],
    _processed: "auto"
  },
  Beewise: {
    ws: ["https://beewise.ag", "https://grower.beewise.ag", "https://beesforbuildings.com"],
    li: ["https://www.linkedin.com/company/beewise-technologies"],
    fb: ["https://www.facebook.com/beewisetechnologies"],
    tw: ["https://twitter.com/BeewiseT"],
    ig: ["https://www.instagram.com/beewise.ag"],
    _processed: "auto"
  },
  "Believer Meats": {
    ws: ["https://www.believermeats.com"],
    li: ["https://www.linkedin.com/company/believer-meats"],
    fb: ["https://www.facebook.com/believermeats"],
    tw: ["https://x.com/believermeats"],
    ig: ["https://www.instagram.com/believermeats"],
    ytp: ["https://www.youtube.com/@believermeats"],
    _processed: "auto"
  },
  "Ben-Gurion University of the Negev": {
    ws: [
      "https://apps4cloud.bgu.ac.il",
      "https://bengurionarchive.bgu.ac.il",
      "https://bgn.bgu.ac.il",
      "https://bgu4u.bgu.ac.il",
      "https://bgu4u22.bgu.ac.il",
      "https://cloud.start.bgu.ac.il",
      "https://cris.bgu.ac.il",
      "https://helpdesk.bgu.ac.il",
      "https://hilanauth.bgu.ac.il",
      "https://iki-labs.bgu.ac.il",
      "https://in.bgu.ac.il",
      "https://k2prod.bgu.ac.il",
      "https://libguides.bgu.ac.il",
      "https://maintenance.bgu.ac.il",
      "https://phonebook.bgu.ac.il",
      "https://portal.bgu.ac.il",
      "https://radio.bgu.ac.il",
      "https://shop.bgu.ac.il",
      "https://tamrur.bgu.ac.il",
      "https://w3.bgu.ac.il",
      "https://www.bgu.ac.il"
    ],
    fb: ["https://www.facebook.com/bgu.uni"],
    tw: ["https://x.com/bengurionuni"],
    ig: ["https://www.instagram.com/bengurionuniversity"],
    ytp: ["https://www.youtube.com/@bengurionuniversity"],
    urls: [
      "https://bgu-academic-recruitment.my.site.com/Recruiters",
      "https://sp7.co.il",
      "https://t.me/bgu_official",
      "https://www.gavyam-negev.co.il"
    ],
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
  Bigabid: { ws: ["https://www.bigabid.com"], li: ["https://www.linkedin.com/company/bigabid"], _processed: "auto" },
  BiltOn: {
    ws: ["https://careers.bilton.tech", "https://www.bilton.tech", "https://us.bilton.pro"],
    urls: [
      "http://bilton.tech",
      "https://bilton.tech/privacy-policy",
      "https://www.bilton.tech/access-control",
      "https://www.bilton.tech/blog",
      "https://www.bilton.tech/case-studies",
      "https://www.bilton.tech/company",
      "https://www.bilton.tech/contact-us",
      "https://www.bilton.tech/daily-logs",
      "https://www.bilton.tech/demo",
      "https://www.bilton.tech/integrations",
      "https://www.bilton.tech/solutions/labor-and-workforce-management",
      "https://www.bilton.tech/solutions/risk-compliance-management",
      "https://www.bilton.tech/solutions/site-safety-management",
      "https://www.bilton.tech/terms-conditions",
      "https://www.bilton.tech/who-we-serve/general-contractors",
      "https://www.bilton.tech/who-we-serve/owners"
    ],
    _processed: "auto"
  },
  "Binah.ai": {
    ws: ["https://support.binah.ai", "https://www.binah.ai"],
    li: ["https://www.linkedin.com/company/binah.ai"],
    ig: ["https://www.instagram.com/binah.ai"],
    ytc: ["https://www.youtube.com/channel/ucixx_sn0yftw9ndu2rkktjg"],
    urls: [
      "https://support.binah.ai/binah",
      "https://www.binah.ai",
      "https://www.binah.ai/legal",
      "https://www.binah.ai/privacy"
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
      "https://marketplace.microsoft.com/en-gb/product/saas/biocatch.biocatch_behavioral_biometrics",
      "https://medium.com/@BioCatchTechBlog",
      "https://play.google.com/store/apps/developer?id=BioCatch+Ltd.",
      "https://www.comeet.com/jobs/biocatch/03.00E/data-engineer/0C.759"
    ],
    android_dev_id: "com.biocatch.biometric",
    android_app_ids: ["com.biocatch.are_you_rat", "com.biocatchbank"],
    _processed: true
  },
  Biobeat: {
    ws: ["https://www.bio-beat.com"],
    li: ["https://www.linkedin.com/company/biobeat-ltd."],
    tw: ["https://x.com/biobeatt"],
    ytc: ["https://www.youtube.com/channel/ucybhciz2gfyqruh2z4zwqfg"],
    _processed: "auto"
  },
  Bit: {
    ws: ["https://bit.dev"],
    li: ["https://www.linkedin.com/company/bit-dev"],
    tw: ["https://x.com/bitcloud_"],
    gh: ["https://github.com/teambit"],
    ytp: ["https://www.youtube.com/@bitdev"],
    urls: [
      "https://bit.cloud",
      "https://bit.cloud/contact-sales",
      "https://bit.cloud/contact-us",
      "https://bit.cloud/enterprise",
      "https://bit.cloud/legals/privacy",
      "https://bit.cloud/login",
      "https://bit.cloud/teambit",
      "https://discord.bit.cloud",
      "https://www.reddit.com/r/bit_dev"
    ],
    _processed: "auto"
  },
  Blink: { ws: ["https://www.afternic.com"], urls: ["https://www.afternic.com/forsale/blink.gg"], _processed: "auto" },
  Blockaid: {
    ws: ["https://blockaid.io", "https://docs.blockaid.io", "https://report.blockaid.io"],
    li: ["https://www.linkedin.com/company/blockaid"],
    tw: ["https://x.com/blockaid_"],
    urls: ["https://comeet.com/jobs/blockaid/69.00b", "https://t.me/+YCEZbt_QrE8zMjI0"],
    _processed: "auto"
  },
  "BlueWind Medical": {
    ws: ["https://bluewindmedical.com"],
    li: ["https://www.linkedin.com/company/bluewind-medical"],
    fb: ["https://www.facebook.com/bluewindmedical"],
    tw: ["https://x.com/bluewindinc"],
    ig: ["https://www.instagram.com/bluewindmedical"],
    _processed: "auto"
  },
  Bluebricks: {
    ws: [
      "https://app.bluebricks.co",
      "https://docs.bluebricks.co",
      "https://trust.bluebricks.co",
      "https://www.bluebricks.co"
    ],
    li: ["https://www.linkedin.com/company/bluebricksco"],
    gh: ["https://github.com/bluebricks-co"],
    urls: [
      "https://aws.amazon.com/marketplace/seller-profile",
      "https://bluebricks.app.n8n.cloud/form/36a1b080-fe87-4c79-8666-5d358af2a07a",
      "https://console.cloud.google.com/marketplace/product/bluebricks-public/bluebricks-saas",
      "https://trust.bluebricks.co"
    ],
    _processed: "auto"
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
  Bluewhite: {
    ws: ["https://www.bluewhite.ai"],
    li: ["https://www.linkedin.com/company/bluewhite"],
    ig: ["https://www.instagram.com/bluewhite.ai"],
    ytc: ["https://www.youtube.com/channel/uckc-jadhn1jawsmx6ymjwra"],
    _processed: "auto"
  },
  Boards: {
    ws: ["https://academy.boards.com", "https://app.boards.com", "https://www.boards.com", "https://support.boards.so"],
    li: ["https://www.linkedin.com/company/boardsapp"],
    ig: ["https://www.instagram.com/boards.app"],
    ytp: ["https://www.youtube.com/@BoardsApp"],
    urls: ["https://boards.onelink.me/0fu0/d3icoa9w", "https://boards.onelink.me/0fu0/tkc2lr0a"],
    _processed: "auto"
  },
  Botika: {
    ws: ["https://app.botika.com", "https://botika.com", "https://help.botika.com"],
    li: ["https://www.linkedin.com/company/botika-com"],
    ig: ["https://www.instagram.com/botika_com"],
    ytp: ["https://www.youtube.com/@botika_com"],
    urls: ["https://botika-io.crisp.help/en", "https://help.botika.com/en"],
    _processed: "auto"
  },
  BrainQ: {
    ws: ["https://brainqtech.com"],
    li: ["https://www.linkedin.com/company/brainq-technologies"],
    fb: ["https://www.facebook.com/brainqtech"],
    tw: ["https://x.com/brainqtech"],
    ytp: ["https://www.youtube.com/@brainqtech"],
    urls: ["http://brainq.co.il", "https://emagine.care"],
    _processed: "auto"
  },
  BrandShield: {
    ws: ["https://platform.brandshield.com", "https://www.brandshield.com"],
    li: ["https://www.linkedin.com/company/2231196"],
    fb: ["https://www.facebook.com/BrandShield"],
    tw: ["https://twitter.com/brandshieldltd"],
    ytc: ["https://www.youtube.com/channel/UC0ahbVndIUdRy_DstOWP7og"],
    _processed: "auto"
  },
  Brandlight: {
    ws: ["https://www.brandlight.ai"],
    urls: [
      "https://www.brandlight.ai/about",
      "https://www.brandlight.ai/agencies",
      "https://www.brandlight.ai/blog",
      "https://www.brandlight.ai/careers",
      "https://www.brandlight.ai/enterprise",
      "https://www.brandlight.ai/privacy-policy",
      "https://www.brandlight.ai/product/commerce",
      "https://www.brandlight.ai/product/content",
      "https://www.brandlight.ai/product/partnerships",
      "https://www.brandlight.ai/product/technical",
      "https://www.brandlight.ai/product/visibility-insights",
      "https://www.brandlight.ai/terms-of-use"
    ],
    _processed: "auto"
  },
  Breez: {
    ws: ["https://blog.breez.technology", "https://breez.technology"],
    tw: ["https://x.com/breez_tech"],
    gh: ["https://github.com/breez"],
    urls: ["https://medium.com/breez-technology", "https://t.me/breez_lightning"],
    _processed: "auto"
  },
  "Brenmiller Energy": {
    ws: ["https://bren-energy.com"],
    li: ["https://www.linkedin.com/company/brenmiller-energy"],
    fb: ["https://www.facebook.com/brenmillerenergy"],
    tw: ["https://x.com/bren_energy"],
    ytp: ["https://www.youtube.com/@brenmillerenergy343"],
    _processed: "auto"
  },
  Brevel: {
    ws: ["https://brevel.co.il"],
    li: ["https://www.linkedin.com/company/brevel"],
    urls: [
      "https://www.globalgoals.org",
      "https://www.globalgoals.org/goals/12-responsible-consumption-and-production",
      "https://www.globalgoals.org/goals/13-climate-action",
      "https://www.globalgoals.org/goals/15-life-on-land",
      "https://www.globalgoals.org/goals/2-zero-hunger"
    ],
    _processed: "auto"
  },
  Bringg: {
    ws: ["https://security.bringg.com", "https://www.bringg.com"],
    li: ["https://www.linkedin.com/company/bringg"],
    ytp: ["https://www.youtube.com/@bringgapp"],
    urls: ["https://bringg.my.site.com/supportcenter/s/login"],
    _processed: "auto"
  },
  Briya: {
    ws: ["https://aire.briya.com", "https://briya.com"],
    li: ["https://www.linkedin.com/company/briyahelath"],
    fb: ["https://www.facebook.com/briya-109067278395662"],
    tw: ["https://x.com/briyahealth"],
    urls: ["https://briya.careers.hibob.com/jobs"],
    _processed: "auto"
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
  CYE: {
    ws: ["https://cyesec.com"],
    li: ["https://www.linkedin.com/company/cyesec"],
    tw: ["https://x.com/CyesecLtd"],
    ytc: ["https://www.youtube.com/channel/UCqcIuEorR6t_6prTnQ2Nv8w"],
    _processed: "auto"
  },
  CYREBRO: {
    ws: ["https://app.cyrebro.io", "https://partners.cyrebro.io", "https://www.cyrebro.io"],
    li: ["https://www.linkedin.com/company/cyrebro"],
    fb: ["https://www.facebook.com/CYREBRO"],
    tw: ["https://www.twitter.com/cyrebro_io"],
    urls: ["https://www.g2.com/products/cyrebro/reviews"],
    _processed: "auto"
  },
  CaPow: {
    ws: ["https://capow.energy", "https://planner.capow.energy"],
    li: ["https://www.linkedin.com/company/capow-tech"],
    tw: ["https://x.com/capow2024"],
    ytp: ["https://www.youtube.com/@perpetual-power-in-motion"],
    _processed: "auto"
  },
  Canditech: {
    ws: ["https://helpcenter.canditech.io", "https://system.canditech.io", "https://www.canditech.io"],
    li: ["https://www.linkedin.com/company/canditech"],
    fb: ["https://www.facebook.com/canditech.io"],
    urls: ["https://www.capterra.com/p/267592/Canditech", "https://www.g2.com/products/canditech/reviews"],
    _processed: "auto"
  },
  Candivore: { ws: ["https://candivore.io"], urls: ["https://candivore.zendesk.com"], _processed: "auto" },
  "Carbon Blue": {
    ws: ["https://carbonblue.cc"],
    li: ["https://www.linkedin.com/company/carbonblue-cc"],
    ytp: ["https://www.youtube.com/@carbonbluecommunications"],
    urls: [
      "https://carbonblue.cc/privacy-notice",
      "https://carbonblue.cc/terms-of-use-for-carbonblue-websites",
      "https://carbonherald.com/carbonblue-launches-midway-a-pioneering-desalination-incorporated-mcdr-pilot",
      "https://vagmandesign.com"
    ],
    _processed: "auto"
  },
  CardinalOps: {
    ws: ["https://cardinalops.com"],
    li: ["https://www.linkedin.com/company/cardinalops"],
    urls: [
      "https://cardinalops.com/privacy-policy",
      "https://cardinalops.com/security-compliance",
      "https://cardinalops.com/terms-of-use"
    ],
    _processed: "auto"
  },
  CathWorks: {
    ws: ["https://cath.works"],
    li: ["https://www.linkedin.com/company/cathworks"],
    fb: ["https://www.facebook.com/cathworksffrangio"],
    ig: ["https://www.instagram.com/cathworks"],
    ytp: ["https://www.youtube.com/@cathworks"],
    urls: ["https://crtmeeting.org"],
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
  "Cedar Money": {
    ws: ["https://app.cedar.money", "https://www.cedar.money"],
    li: ["https://www.linkedin.com/company/cedar-money"],
    tw: ["https://x.com/cedar_money"],
    ig: ["https://www.instagram.com/cedar.money"],
    urls: ["https://apps.apple.com/us/app/cedar-money-app/id6736955250", "https://cedarmoney.zendesk.com/hc/en-us"],
    android_app_ids: ["money.cedar.app"],
    _processed: "auto"
  },
  Celery: {
    ws: ["https://www.celeryway.com"],
    li: ["https://www.linkedin.com/company/celery-controls"],
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
  Certora: {
    ws: [
      "https://careers.certora.com",
      "https://docs.certora.com",
      "https://prover.certora.com",
      "https://www.certora.com"
    ],
    tw: ["https://x.com/certora"],
    ytp: ["https://www.youtube.com/@certora"],
    urls: ["https://discord.gg/certora"],
    _processed: "auto"
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
  Chemomab: {
    ws: ["https://chemomab.com", "https://investors.chemomab.com"],
    li: ["https://www.linkedin.com/company/chemoab-ltd"],
    _processed: "auto"
  },
  Cipia: {
    ws: ["https://car.harman.com", "https://harman.com", "https://jobs.harman.com", "https://news.harman.com"],
    li: ["https://www.linkedin.com/company/harman-automotive"],
    fb: ["https://www.facebook.com/harmanint"],
    tw: ["https://x.com/harman"],
    ytc: ["https://www.youtube.com/channel/uca6wf2lzh2-faffpe8n4aya"],
    _processed: "auto"
  },
  "Circles - Online Group Support": {
    ws: ["https://app.circlesup.com", "https://circlesup.com", "https://expertscommunity.circlesup.com"],
    li: ["https://www.linkedin.com/company/circles-support"],
    fb: ["https://www.facebook.com/circlessupport"],
    ig: ["https://www.instagram.com/circles_support"],
    urls: [
      "https://circlesup-support.onelink.me/Zfmp/2sjumyvy",
      "https://circlesup-support.onelink.me/Zfmp/jvvug6g9",
      "https://circlesup-support.onelink.me/Zfmp/vn9898b2",
      "https://circlesup.typeform.com/to/e5q9ZYmq"
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
  Cognata: {
    ws: ["https://www.cognata.com"],
    li: ["https://www.linkedin.com/company/cognata-ltd"],
    fb: ["https://www.facebook.com/cognata-435204960144343"],
    tw: ["https://x.com/cognataai"],
    ytc: ["https://www.youtube.com/channel/ucdce8lkbq7vtra6deht7ckg"],
    _processed: "auto"
  },
  Cognyte: {
    ws: ["https://www.cognyte.com"],
    li: ["https://www.linkedin.com/company/cognyte"],
    tw: ["https://twitter.com/Cognyte"],
    ytc: ["https://www.youtube.com/channel/UCqIvlQRaVQ38kr03p5QTDWA"],
    urls: ["https://www.glassdoor.com/Overview/Working-at-Cognyte-EI_IE4430257.11,18.htm"],
    _processed: "auto"
  },
  Collplant: {
    ws: ["https://collplant.com", "https://ir.collplant.com"],
    li: ["https://www.linkedin.com/company/collplant"],
    tw: ["https://x.com/collplantbio"],
    ytc: ["https://www.youtube.com/channel/uc_7slex2hgdrw75fvveogsw"],
    _processed: "auto"
  },
  "Colugo Systems": {
    ws: ["https://www.colugo-sys.com"],
    li: ["https://www.linkedin.com/company/colugo-systems"],
    fb: ["https://www.facebook.com/colugosys"],
    urls: ["https://firmabrands.com"],
    _processed: "auto"
  },
  "CommBox.io": {
    ws: ["https://help.commbox.io", "https://manage.commbox.io", "https://www.commbox.io"],
    li: ["https://www.linkedin.com/company/commbox1"],
    fb: ["https://www.facebook.com/commbox.io"],
    ig: ["https://www.instagram.com/commbox.io"],
    ytc: ["https://www.youtube.com/channel/uc6cntj4rmjy-zzzqvqc08aq"],
    urls: ["https://commbox.statuspage.io", "https://help.commbox.io/apidocs"],
    _processed: "auto"
  },
  ControlMonkey: {
    ws: ["https://console.controlmonkey.io", "https://controlmonkey.io", "https://trust.controlmonkey.io"],
    li: ["https://www.linkedin.com/company/controlmonkey"],
    gh: ["https://github.com/control-monkey"],
    ytp: ["https://www.youtube.com/@controlmonkey544"],
    urls: [
      "https://aws.amazon.com/marketplace/pp/prodview-3cuadcjyrgj4q",
      "https://azuremarketplace.microsoft.com/en-us/marketplace/apps/2305.controlmonkey",
      "https://www.g2.com/products/controlmonkey/reviews"
    ],
    _processed: "auto"
  },
  Coralogix: {
    ws: [
      "https://coralogix.com",
      "https://dashboard.app.eu2.coralogix.com",
      "https://dashboard.eu2.coralogix.com",
      "https://trust.coralogix.com",
      "https://ollyhq.com"
    ],
    li: ["https://www.linkedin.com/company/coralogix"],
    tw: ["https://x.com/coralogix"],
    ytp: ["https://www.youtube.com/@coralogix"],
    urls: ["https://snowbit.io/services"],
    _processed: "auto"
  },
  Cortica: {
    ws: ["https://cortica.com"],
    urls: ["https://cortica.com/privacy-policy", "https://cortica.com/terms-and-conditions", "https://mar-comit.com"],
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
  CyVers: {
    ws: ["https://cyvers.ai", "https://docs.cyvers.ai", "https://vigilens.cyvers.ai"],
    li: ["https://www.linkedin.com/company/cyvers"],
    tw: ["https://x.com/cyversalerts"],
    urls: ["https://t.me/CyversAlertsOfficial", "https://t.me/CyversAlertsOfficial"],
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
  Cybellum: {
    ws: ["https://cybellum.com", "https://security.cybellum.com"],
    li: ["https://www.linkedin.com/company/cybellum"],
    tw: ["https://x.com/cybellum"],
    ytp: ["https://www.youtube.com/@cybellumtechnologiesltd"],
    _processed: "auto"
  },
  Cyberint: {
    ws: [
      "https://checkpoint.cyberint.com",
      "https://cyberint.com",
      "https://e.cyberint.com",
      "https://l.cyberint.com",
      "https://ransomania.cyberint.com"
    ],
    li: ["https://www.linkedin.com/company/cyberint"],
    fb: ["https://www.facebook.com/cyberint"],
    tw: ["https://x.com/cyber_int"],
    ytp: ["https://www.youtube.com/@cyberintdrp"],
    urls: [
      "https://partner-signup.checkpoint.com",
      "https://partnerlocator.checkpoint.com",
      "https://t.me/+Q1jDv57wfw42YzEy",
      "https://usercenter.checkpoint.com/usercenter/index.jsp",
      "https://www.checkpoint.com/cloudguard/amazon-aws-security",
      "https://www.checkpoint.com/cloudguard/google-cloud-platform-security",
      "https://www.checkpoint.com/cloudguard/microsoft-azure-security",
      "https://www.checkpoint.com/copyright",
      "https://www.checkpoint.com/demos",
      "https://www.checkpoint.com/infinity/soc/external-risk-management",
      "https://www.checkpoint.com/partners/channel",
      "https://www.checkpoint.com/partners/mssp-program",
      "https://www.checkpoint.com/privacy",
      "https://www.checkpoint.com/technology-partners"
    ],
    _processed: "auto"
  },
  Cybersixgill: {
    ws: ["https://academy.bitsight.com", "https://www.bitsight.com", "https://bitsighttech.com"],
    li: ["https://www.linkedin.com/company/bitsight"],
    fb: ["https://www.facebook.com/bitsight"],
    tw: ["https://x.com/bitsight"],
    ig: ["https://www.instagram.com/bitsight"],
    ytc: ["https://www.youtube.com/channel/ucqk4819a_k18f2ggc3fkv8g"],
    urls: [
      "https://app.termscout.com/certify/bitsight-certified-contract",
      "https://bitsight.wd1.myworkdayjobs.com/Bitsight",
      "https://help.bitsighttech.com/hc/en-us",
      "https://submit-irm.trustarc.com/services/validation/313077aa-ba94-46d5-8cdb-1eec02a3553a"
    ],
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
  Cydome: {
    ws: ["https://cydome.io", "https://ireport.cydome.io", "https://yachts.cydome.io"],
    li: ["https://www.linkedin.com/company/cydome"],
    tw: ["https://x.com/cydome"],
    urls: ["https://cydome.zohorecruit.com/jobs/Careers"],
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
  Cylus: {
    ws: ["https://www.cylus.com"],
    li: ["https://www.linkedin.com/company/cylus"],
    fb: ["https://www.facebook.com/cylusec"],
    tw: ["https://x.com/cylus_security"],
    ytc: ["https://www.youtube.com/channel/ucmddhg7xxegxvfp5zav91zq"],
    urls: ["https://www.railtechsecurity.com"],
    _processed: "auto"
  },
  Cymbio: {
    ws: ["https://agentic.cym.bio", "https://app.cym.bio", "https://www.cym.bio"],
    li: ["https://www.linkedin.com/company/cymbio"],
    fb: ["https://www.facebook.com/cymbio"],
    tw: ["https://x.com/cymbio_"],
    urls: [
      "https://newsroom.paypal-corp.com/2026-01-22-PayPal-to-Acquire-Cymbio,-Accelerating-Agentic-Commerce-Capabilities"
    ],
    _processed: "auto"
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
  Cyolo: {
    ws: ["https://cyolo.io", "https://support.cyolo.io"],
    li: ["https://www.linkedin.com/company/26244228"],
    tw: ["https://x.com/cyolo_security"],
    ytc: ["https://www.youtube.com/channel/ucdxvjidvgecor1bc1fv6erg"],
    _processed: "auto"
  },
  Cypago: {
    ws: ["https://auth.cypago.com", "https://cypago.com", "https://status.cypago.com"],
    li: ["https://www.linkedin.com/company/cypago"],
    tw: ["https://x.com/cypagosec"],
    urls: [
      "https://cyberdefensewire.com/cypago-announces-strategic-partnership-with-archer-to-deliver-ai-driven-continuous-controls-monitoring-for-enterprises",
      "https://hitrustdirectory.com/product/cypago-cyber-grc-automation-platform"
    ],
    _processed: "auto"
  },
  Cytactic: {
    ws: ["https://cytactic.com"],
    li: ["https://www.linkedin.com/company/cytactic"],
    fb: ["https://www.facebook.com/cytactic"],
    ytp: ["https://www.youtube.com/@cytactic"],
    urls: ["https://medium.com/@Cytactic"],
    _processed: "auto"
  },
  CytoReason: { ws: ["https://cytoreason.com"], _processed: "auto" },
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
  "DOT Compliance": {
    ws: ["https://info.dotcompliance.com", "https://www.dotcompliance.com"],
    li: ["https://www.linkedin.com/company/dot-compliance"],
    tw: ["https://x.com/dotcompliance_"],
    ytp: ["https://www.youtube.com/@dotcompliance_eqms"],
    _processed: "auto"
  },
  Darrow: {
    ws: ["https://portal.darrow.ai", "https://www.darrow.ai"],
    li: ["https://www.linkedin.com/company/darrow-ai"],
    _processed: "auto"
  },
  "Datafy.io": {
    ws: ["https://auth.datafy.io", "https://datafy.io", "https://docs.datafy.io"],
    urls: [
      "https://datafy.io/about",
      "https://datafy.io/blog",
      "https://datafy.io/careers",
      "https://datafy.io/datafy-auto-scaler",
      "https://datafy.io/datafy-sensor",
      "https://datafy.io/events",
      "https://datafy.io/glossary",
      "https://datafy.io/privacy-policy",
      "https://datafy.io/terms-of-use",
      "https://docs.datafy.io"
    ],
    _processed: "auto"
  },
  "Dataloop AI": {
    ws: ["https://console.dataloop.ai", "https://dataloop.ai", "https://docs.dataloop.ai"],
    li: ["https://www.linkedin.com/company/dataloop"],
    gh: ["https://github.com/dataloop-ai", "https://github.com/dataloop-ai-apps"],
    ytc: ["https://www.youtube.com/channel/uccvp-nw5mk9bb9ldncd6fgw"],
    urls: [
      "https://dataloop.ai/blog",
      "https://dataloop.ai/platform/data-management/dataloop-api",
      "https://dataloop.ai/platform/data-management/dataloop-sdk",
      "https://docs.dataloop.ai/docs"
    ],
    _processed: "auto"
  },
  DeepKeep: {
    ws: ["https://docs.deepkeep.ai", "https://www.deepkeep.ai"],
    li: ["https://www.linkedin.com/company/deepkeep"],
    ytp: ["https://www.youtube.com/@deepkeep_ai"],
    _processed: "auto"
  },
  "Diagnostic Robotics": {
    ws: ["https://www.diagnosticrobotics.com"],
    li: ["https://www.linkedin.com/company/diagnostic-robotics"],
    tw: ["https://x.com/diagnosticrobo"],
    _processed: "auto"
  },
  Dig: {
    ws: ["https://dig.ai"],
    li: ["https://www.linkedin.com/company/dig-ai"],
    urls: ["https://dig.teamme.link"],
    _processed: "auto"
  },
  "Diversion Company": {
    ws: ["https://app.diversion.dev", "https://docs.diversion.dev", "https://www.diversion.dev"],
    li: ["https://www.linkedin.com/company/diversion-company-inc"],
    tw: ["https://x.com/diversion_hq"],
    ytp: ["https://www.youtube.com/@diversion-dot-dev"],
    urls: [
      "https://discord.com/invite/9UtVyDkPS2",
      "https://discord.com/invite/rdGPpVFUWv",
      "https://www.diversion.dev/blog/rss.xml"
    ],
    _processed: "auto"
  },
  DragonflyDB: {
    ws: ["https://security.dragonflydb.io", "https://trust.dragonflydb.io", "https://www.dragonflydb.io"],
    li: ["https://www.linkedin.com/company/dragonflydb"],
    tw: ["https://x.com/dragonflydbio"],
    gh: ["https://github.com/dragonflydb"],
    urls: [
      "https://discord.gg/HsPjXGVH85",
      "https://dragonfly.discourse.group",
      "https://dragonflydb.cloud",
      "https://dragonflydb.cloud/signup"
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
  Droxi: {
    ws: ["https://www.droxi.ai"],
    li: ["https://www.linkedin.com/company/droxi"],
    tw: ["https://x.com/droxi_ai"],
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
  EasySend: {
    ws: ["https://apps.easysend.io", "https://easysend.io", "https://journeys.easysend.io", "https://kb.easysend.io"],
    li: ["https://www.linkedin.com/company/easysend"],
    fb: ["https://www.facebook.com/EasySendSolutions"],
    tw: ["https://x.com/easy_send"],
    ytc: ["https://www.youtube.com/channel/UCaXDqGp897G3b7T-9YCo4dg"],
    _processed: "auto"
  },
  "Econergy Renewable Energy": {
    ws: ["https://www.econergytech.com"],
    li: ["https://www.linkedin.com/company/econergy-renewable-energy-ltd"],
    urls: ["https://www.econergytech.com", "https://www.econergytech.com/contact"],
    _processed: "auto"
  },
  "Elbit Systems": {
    ws: ["https://www.elbitsystems.com", "https://elbitsystemscareer.com"],
    li: ["https://www.linkedin.com/company/elbitsystems"],
    fb: ["https://www.facebook.com/elbitsystemsltd"],
    tw: ["https://x.com/ElbitSystemsLtd"],
    ytp: ["https://www.youtube.com/elbitsystems"],
    urls: ["https://www.comrax.com"],
    _processed: "auto"
  },
  Elementor: {
    ws: [
      "https://elementor.com",
      "https://elementor.careers",
      "https://be.elementor.com",
      "https://developers.elementor.com",
      "https://go.elementor.com",
      "https://hellotheme.elementor.com",
      "https://library.elementor.com",
      "https://my.elementor.com",
      "https://playground.elementor.com",
      "https://prompts.elementor.com",
      "https://showoff.elementor.com"
    ],
    li: ["https://www.linkedin.com/company/elementor"],
    fb: ["https://www.facebook.com/elemntor"],
    tw: ["https://x.com/elemntor"],
    ig: ["https://www.instagram.com/elementor"],
    gh: ["https://github.com/elementor/elementor"],
    ytc: ["https://www.youtube.com/channel/UCt9kG_EDX8zwGSC1-ycJJVA"],
    tt: ["https://www.tiktok.com/@elementor"],
    urls: ["https://elemn.to/discord", "https://wordpress.org/plugins/elementor"],
    _processed: "auto"
  },
  "Eleven Therapeutics": {
    ws: ["https://eleventx.com"],
    li: ["https://www.linkedin.com/company/eleventx"],
    tw: ["https://x.com/eleventx"],
    urls: ["https://eleventx.com"],
    _processed: "auto"
  },
  Emerix: {
    ws: ["https://www.emerix.ai"],
    li: ["https://www.linkedin.com/company/emerixai"],
    urls: ["https://app.getcontrast.io/emerix", "https://calendly.com/arielpalones/emerix-demo"],
    _processed: "auto"
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
  EndoSpan: {
    ws: ["https://www.endospan.com"],
    li: ["https://www.linkedin.com/company/endospan"],
    fb: ["https://www.facebook.com/endospan"],
    tw: ["https://x.com/endospanltd"],
    ytc: ["https://www.youtube.com/channel/ucjg9yoqbe3wem-qs616tdyw"],
    _processed: "auto"
  },
  Entrio: {
    ws: ["https://docs.entrio.io", "https://www.entrio.io"],
    li: ["https://www.linkedin.com/company/entrioplatform"],
    _processed: "auto"
  },
  Everafter: {
    ws: ["https://app.everafter.ai", "https://www.everafter.ai"],
    li: ["https://www.linkedin.com/company/everafter-ai"],
    fb: ["https://www.facebook.com/everafterai"],
    ig: ["https://www.instagram.com/everafter.ai"],
    ytp: ["https://www.youtube.com/@customerhappilyeverafter"],
    _processed: "auto"
  },
  "Eviation Aircraft": {
    ws: ["https://www.eviation.com"],
    li: ["https://www.linkedin.com/company/eviation-aircraft-ltd"],
    ytc: ["https://www.youtube.com/channel/uc8rr4q717hurqhiies6dcaq"],
    _processed: "auto"
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
  FEMSelect: {
    ws: ["https://www.femselect.com"],
    li: ["https://www.linkedin.com/company/28632694"],
    fb: ["https://www.facebook.com/FEMSelect"],
    tw: ["https://twitter.com/FEMSelect"],
    ig: ["https://www.instagram.com/fem.select"],
    ytc: ["https://www.youtube.com/channel/UCUXuID-G3yt22gTkPV8Ovuw"],
    _processed: "auto"
  },
  FIRMUS: {
    ws: ["https://firmus.ai"],
    li: ["https://www.linkedin.com/company/firmusai"],
    tw: ["https://x.com/firmus_ai"],
    ytp: ["https://www.youtube.com/@firmus-ai"],
    urls: ["http://firmus.local", "https://firmus.ninja/website", "https://firmus.us.auth0.com/login"],
    _processed: "auto"
  },
  "FIZE Medical": {
    ws: ["https://fizemedical.com"],
    li: ["https://www.linkedin.com/company/fize-medical"],
    ytc: ["https://www.youtube.com/channel/ucpqxrazdpqem935zgn3aq7q"],
    urls: ["https://okimta.com", "https://www.kukushka.co.il"],
    _processed: "auto"
  },
  Factify: {
    ws: ["https://developers.factify.com", "https://www.factify.com"],
    li: ["https://www.linkedin.com/company/factifyinc"],
    _processed: "auto"
  },
  Faddom: {
    ws: ["https://faddom.com", "https://support.faddom.com"],
    li: ["https://www.linkedin.com/company/getfaddom"],
    tw: ["https://x.com/faddommapping"],
    ytc: ["https://www.youtube.com/channel/ucfotyvcbco6yducfvdax5sa"],
    ytp: ["https://www.youtube.com/@faddom-adm"],
    urls: [
      "https://app.prighter.com/portal/11907561697",
      "https://aws.amazon.com/marketplace/pp/prodview-aoli4cnn6qewg",
      "https://prighter.com",
      "https://staging-faddomnew-staging.kinsta.cloud/pricing",
      "https://staging-faddomnew-staging.kinsta.cloud/privacy-policy",
      "https://staging-faddomnew-staging.kinsta.cloud/use-case/flawless-secops-powered-by-ai",
      "https://techcrunch.com/2024/02/21/faddom-raises-12m-to-help-companies-map-it-infrastructure-wherever-it-lives",
      "https://www.g2.com/products/faddom/reviews",
      "https://youtu.be/3Io2v6gZdzA"
    ],
    _processed: "auto"
  },
  Faireez: {
    ws: ["https://faireez.com", "https://getapp.faireez.com", "https://register.faireez.com"],
    li: ["https://www.linkedin.com/company/faireez"],
    ig: ["https://www.instagram.com/faireez_inc"],
    ytp: ["https://www.youtube.com/@faireez2810"],
    urls: ["https://getapp.faireez.com/DauJ/ledadit1"],
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
  Fermata: {
    ws: ["https://www.fermata.tech"],
    li: ["https://www.linkedin.com/company/19152085"],
    fb: ["https://www.facebook.com/fermatatechnology"],
    tw: ["https://x.com/fermatatech"],
    ig: ["https://www.instagram.com/fermatatech"],
    urls: ["https://www.fermata.tech/privacy_policy"],
    _processed: "auto"
  },
  Fetcherr: {
    ws: ["https://www.fetcherr.io"],
    li: ["https://www.linkedin.com/company/fetcherr-ltd"],
    urls: [
      "https://fortune.com/2023/01/31/tech-forward-everyday-ai-airline-industry-fuel-consumption-food-waste",
      "https://markets.businessinsider.com/news/stocks/fetcherr-named-best-travel-tech-startup-by-world-travel-tech-awards-1032712628",
      "https://skift.com/2024/06/26/fetcherr-raises-25-million-to-help-airlines-create-fares-youll-want-to-book",
      "https://techcrunch.com/2024/06/26/fetcherr-lands-90m-to-get-airlines-on-board-with-dynamic-pricing",
      "https://www.aerotime.aero/articles/ai-driven-airline-pricing-is-making-strides-but-how-does-it-work-video",
      "https://www.aerotime.aero/articles/how-virgin-atlantic-and-fetcherr-are-transforming-the-airline-experience-with-ai",
      "https://www.forbes.com/sites/tedreed/2024/08/21/airline-pricing-systems-are-ancient-heres-how-ai-can-help",
      "https://www.nasdaq.com/articles/large-market-models%3A-the-crystal-ball-of-modern-business",
      "https://www.phocuswire.com/delta-fetcherr-ai-pricing-deployment",
      "https://www.phocuswire.com/viva-aerobus-fetcherr-ai-pricing-engine",
      "https://www.travelweekly.com/On-The-Record/Uri-Yerushalmi-Fetcher"
    ],
    _processed: "auto"
  },
  Fhenix: {
    ws: ["https://docs.fhenix.io", "https://www.fhenix.io"],
    tw: ["https://x.com/fhenix"],
    gh: ["https://github.com/fhenixprotocol", "https://github.com/marronjo"],
    urls: [
      "https://cofhe-docs.fhenix.zone",
      "https://cofhe-docs.fhenix.zone/docs/devdocs/overview",
      "https://discord.com/invite/FuVgxrvJMY",
      "https://docs.fhenix.io",
      "https://drive.google.com/drive/folders/1rtRD3Rpm1iWzK2RcXn9IpGZpJtZLupvL",
      "https://drive.google.com/file/d/1uxkUSCVQsL3U2WsIMq86nKrm-K45S915/view",
      "https://t.me/+OEO4CItQYh8xYzNh"
    ],
    _processed: "auto"
  },
  Fincom: {
    ws: ["https://fincom.co"],
    li: ["https://www.linkedin.com/company/fincom-co"],
    ytc: ["https://www.youtube.com/channel/UCh3FDPSgY2Njx-foiXdgHjw"],
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
    ws: ["https://fireflyneuro.com"],
    li: ["https://ca.linkedin.com/company/fireflyneuroscience"],
    tw: ["https://twitter.com/whatsyourbna"],
    urls: ["http://investors.fireflyneuro.com", "https://operaticagency.com", "https://www.mybna.com"],
    _processed: "auto"
  },
  Firmbase: { ws: ["https://firmbase.ai"], li: ["https://www.linkedin.com/company/firmbase-ai"], _processed: "auto" },
  "Five Sigma": {
    ws: ["https://fivesigmalabs.com"],
    li: ["https://www.linkedin.com/company/five-sigma"],
    fb: ["https://www.facebook.com/fivesigmasolutions"],
    tw: ["https://x.com/fivesigmaclaims"],
    ig: ["https://www.instagram.com/fivesigmaclaims"],
    ytp: ["https://www.youtube.com/@fivesigmaai"],
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
  "Flo-optics": {
    ws: ["https://www.flo-optics.com"],
    urls: [
      "http://www.rachelidesigns.co.il",
      "https://www.flo-optics.com/about-us",
      "https://www.flo-optics.com/career",
      "https://www.flo-optics.com/coating-solution",
      "https://www.flo-optics.com/contact-us",
      "https://www.flo-optics.com/news",
      "https://www.flo-optics.com/platform",
      "https://www.flo-optics.com/privacy-policy",
      "https://www.flo-optics.com/technology",
      "https://www.flo-optics.com/terms",
      "https://www.webnoise.co.il"
    ],
    _processed: "auto"
  },
  Flytrex: {
    ws: ["https://www.flytrex.com"],
    li: ["https://il.linkedin.com/company/flytrex"],
    fb: ["https://www.facebook.com/Flytrex"],
    tw: ["https://twitter.com/flytrex"],
    ig: ["https://instagram.com/flytrex"],
    urls: ["https://apps.apple.com/app/apple-store/id1479695237"],
    android_app_ids: ["com.flytrex.foodapp"],
    _processed: "auto"
  },
  "ForSight Robotics": {
    ws: ["https://www.forsightrobotics.com"],
    li: ["https://www.linkedin.com/company/forsightrobotics"],
    _processed: "auto"
  },
  Gadfin: { ws: ["https://www.gadfin.com"], li: ["https://www.linkedin.com/company/gadfin"], _processed: "auto" },
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
  GeoX: { ws: ["https://app.geox.ai"], _processed: "auto" },
  Grain: {
    ws: ["https://www.grainfinance.com"],
    li: ["https://www.linkedin.com/company/grainfinance"],
    tw: ["https://x.com/grainfinance_co"],
    urls: ["https://console.grainfinance.co"],
    _processed: "auto"
  },
  "GrayMatters Health": {
    ws: ["https://www.graymatters-health.com"],
    li: ["https://www.linkedin.com/company/graymatters-health"],
    ytp: ["https://www.youtube.com/@graymattershealth274"],
    urls: [
      "https://www.graymatters-health.com/find-provider",
      "https://www.graymatters-health.com/home",
      "https://www.graymatters-health.com/privacy-policy",
      "https://www.graymatters-health.com/regulatory",
      "https://www.graymatters-health.com/terms-of-use"
    ],
    _processed: "auto"
  },
  "Greeneye Technology": {
    ws: ["https://greeneye.ag", "https://techblog.greeneye.ag"],
    li: ["https://www.linkedin.com/company/greeneye-technology"],
    fb: ["https://www.facebook.com/greeneye-technology-110745290618037"],
    tw: ["https://x.com/greeneyeag"],
    urls: [
      "https://binternet.co.il",
      "https://btdesign.co.il",
      "https://greeneye.ag",
      "https://techblog.greeneye.ag",
      "https://www.facebook.com/profile.php?id=100057064495445"
    ],
    _processed: "auto"
  },
  "Grip Security": {
    ws: ["https://www.grip.security"],
    li: ["https://www.linkedin.com/company/grip-security"],
    urls: ["https://get.grip.security/demo-request.html", "https://help.grip.security"],
    _processed: "auto"
  },
  "Groundwork BioAg": {
    ws: ["https://groundworkbioag.com"],
    li: ["https://www.linkedin.com/company/5022013"],
    fb: ["https://www.facebook.com/groundworkbioag"],
    tw: ["https://x.com/groundworkbioag"],
    ig: ["https://www.instagram.com/groundworkbioag"],
    ytc: ["https://www.youtube.com/channel/uctmjog_vnv8aeh8xkigzeda"],
    urls: ["https://ego-digital.com"],
    _processed: "auto"
  },
  H2Pro: {
    ws: ["https://www.h2pro.co"],
    li: ["https://www.linkedin.com/company/h2pro"],
    urls: ["https://www.h2pro.co"],
    _processed: "auto"
  },
  "HUB Security": {
    ws: ["https://hub-technologies.com", "https://investors.hubsecurity.com"],
    li: ["https://www.linkedin.com/company/18444151"],
    tw: ["https://twitter.com/hubsecurityio"],
    ytp: ["https://www.youtube.com/@HUBSecurityio"],
    urls: ["https://hubsecurity.com/hubtechnologies", "https://www.comeet.com/jobs/hub-technologies/07.00F"],
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
  "Healthy.io": {
    ws: ["https://blog.healthy.io", "https://healthy.io"],
    li: ["https://www.linkedin.com/company/www-healthy-io"],
    fb: ["https://www.facebook.com/healthy.ioLTD"],
    tw: ["https://twitter.com/healthyio1"],
    urls: ["https://blog.healthy.io", "https://minuteful.com"],
    _processed: "auto"
  },
  Helios: {
    ws: ["https://heliosmatters.com"],
    li: ["https://www.linkedin.com/company/project-helios"],
    _processed: "auto"
  },
  Hexagate: {
    ws: [
      "https://academy.chainalysis.com",
      "https://app.chainalysis.com",
      "https://go.chainalysis.com",
      "https://www.chainalysis.com"
    ],
    li: ["https://www.linkedin.com/company/chainalysis"],
    tw: ["https://x.com/chainalysis"],
    ytp: ["https://www.youtube.com/@chainalysis"],
    urls: ["https://policies.google.com/privacy", "https://policies.google.com/terms", "https://t.me/chainalysisinc"],
    _processed: "auto"
  },
  "Hi Auto": {
    ws: ["https://hi.auto"],
    li: ["https://www.linkedin.com/company/hi-auto"],
    ytp: ["https://www.youtube.com/@hiauto5439"],
    urls: ["http://lab2.online"],
    _processed: "auto"
  },
  Hirundo: { ws: ["https://www.hirundo.io"], li: ["https://www.linkedin.com/company/gethirundo"], _processed: "auto" },
  Hisense: {
    ws: ["https://www.hisense.co.il"],
    fb: ["https://www.facebook.com/babysensemonitors"],
    tw: ["https://x.com/babysensellc"],
    ig: ["https://www.instagram.com/babysensemonitors"],
    urls: ["https://www.avihaim.co.il", "https://www.hisense.co.il", "https://www.pinterest.com/babysensellc"],
    _processed: "auto"
  },
  Holisto: {
    ws: ["https://www.holisto.com"],
    urls: ["https://apps.apple.com/us/app/holisto-better-hotel-deals/id1635312687"],
    android_app_ids: ["com.holisto"],
    _processed: "auto"
  },
  Hopper: {
    ws: ["https://app.hopper.security", "https://www.hopper.security"],
    li: ["https://www.linkedin.com/company/hopper-security"],
    ytc: ["https://www.youtube.com/channel/uc9heronfowz2i8jkiu5z6lw"],
    _processed: "auto"
  },
  Humanz: {
    ws: ["https://plus.humanz.com", "https://www.humanz.com"],
    li: ["https://www.linkedin.com/company/humanz"],
    fb: ["https://www.facebook.com/humanzglobal"],
    ig: ["https://www.instagram.com/humanz"],
    ytp: ["https://www.youtube.com/@humanztv"],
    tt: ["https://www.tiktok.com/@humanz"],
    urls: [
      "https://agents.humanz.ai/login%20",
      "https://plus.humanz.com",
      "https://www.humanz.ai/login",
      "https://www.humanz.ai/reference/downloadapp",
      "https://www.humanz.com/community"
    ],
    _processed: "auto"
  },
  "HyperGuest Ltd.": {
    ws: ["https://app.hyperguest.com", "https://www.hyperguest.com"],
    li: ["https://www.linkedin.com/company/hyperguest"],
    ytp: ["https://www.youtube.com/@hyperguest11"],
    _processed: "auto"
  },
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
  Hyperspace: {
    ws: ["https://docs.hyper-space.io", "https://www.hyper-space.io"],
    li: ["https://www.linkedin.com/company/hyperspace-db"],
    _processed: "auto"
  },
  INCRMNTAL: {
    ws: ["https://knowledgebase.incrmntal.com", "https://www.incrmntal.com"],
    li: ["https://www.linkedin.com/company/incrmntal"],
    fb: ["https://www.facebook.com/incrmntal"],
    tw: ["https://x.com/incrmntal"],
    ig: ["https://www.instagram.com/incrmntal"],
    urls: [
      "https://g.page/r/Cf3_P2b6GLSaEBM/review",
      "https://open.spotify.com/show/5yeNhcRxq7jplL00w0iapx",
      "https://podcasts.apple.com/de/podcast/incrmntal-podrick-the-podcast/id1538801503"
    ],
    _processed: "auto"
  },
  IONIX: {
    ws: ["https://www.ionix.io"],
    li: ["https://www.linkedin.com/company/ionix-security"],
    tw: ["https://twitter.com/ionix_io"],
    urls: ["https://portal.ionix.io/login"],
    _processed: "auto"
  },
  IVIX: {
    ws: ["https://www.ivix.ai"],
    li: ["https://www.linkedin.com/company/ivix-ai"],
    tw: ["https://x.com/ivix_ai"],
    _processed: "auto"
  },
  Iguazio: {
    ws: ["https://go.iguazio.com", "https://www.iguazio.com"],
    li: ["https://www.linkedin.com/company/iguazio"],
    fb: ["https://www.facebook.com/iguazio"],
    tw: ["https://x.com/iguazio"],
    gh: ["https://github.com/nuclio"],
    ytp: ["https://www.youtube.com/@iguazio"],
    ytc: ["https://www.youtube.com/channel/uchmi6zzszd9doyyvut1ppug"],
    urls: ["https://www.iguazio.com/blog"],
    _processed: "auto"
  },
  Illusive: {
    ws: [
      "https://app.emaildefense.proofpoint.com",
      "https://go.proofpoint.com",
      "https://partners.proofpoint.com",
      "https://threatintel.proofpoint.com",
      "https://v1.us1.digitalrisk.proofpoint.com",
      "https://www.proofpoint.com"
    ],
    li: ["https://www.linkedin.com/company/proofpoint"],
    fb: ["https://www.facebook.com/proofpoint"],
    tw: ["https://x.com/proofpoint"],
    ig: ["https://www.instagram.com/proofpoint"],
    ytc: ["https://www.youtube.com/channel/ucivtjgsruzfo90nkeivozhq"],
    _processed: "auto"
  },
  "ImPact Biotech": { ws: ["https://impactbiotech.com"], urls: ["https://impactbiotech.com"], _processed: "auto" },
  "Imagene AI": {
    ws: ["https://imagene-ai.com"],
    li: ["https://www.linkedin.com/company/imagene-ai"],
    tw: ["https://x.com/imagene_ai"],
    urls: [
      "https://imagene-ai.com",
      "https://imagene-ai.com/about-us",
      "https://imagene-ai.com/careers",
      "https://imagene-ai.com/contact-us",
      "https://imagene-ai.com/lung-oi",
      "https://imagene-ai.com/newsroom",
      "https://imagene-ai.com/oi-suite",
      "https://imagene-ai.com/oi-suite/discovery"
    ],
    _processed: "auto"
  },
  Imagindairy: {
    ws: ["https://imagindairy.com"],
    li: ["https://www.linkedin.com/company/imagindairy-ltd"],
    tw: ["https://x.com/imagindairy"],
    ig: ["https://www.instagram.com/imagindairy"],
    ytp: ["https://www.youtube.com/@imagindairy"],
    urls: ["https://imagindairy.com", "https://ltu.co.il"],
    _processed: "auto"
  },
  InSightec: {
    ws: ["https://distributor.insightec.com", "https://documentation.insightec.com", "https://insightec.com"],
    li: ["https://www.linkedin.com/company/insightec"],
    fb: ["https://www.facebook.com/insightec.mrgfus"],
    tw: ["https://x.com/insightec"],
    ytc: ["https://www.youtube.com/channel/ucfkman-01tyfr-t6kuwlhug"],
    _processed: "auto"
  },
  Incredibuild: {
    ws: [
      "https://app.incredibuild.com",
      "https://docs.incredibuild.com",
      "https://www.incredibuild.com",
      "https://www.incredibuild.cn"
    ],
    li: ["https://www.linkedin.com/company/incredibuild"],
    fb: ["https://www.facebook.com/incredibuild"],
    tw: ["https://x.com/incredibuild"],
    _processed: "auto"
  },
  Incredo: {
    ws: ["https://www.incredo.com"],
    li: ["https://www.linkedin.com/company/douxmatok"],
    fb: ["https://www.facebook.com/incredosugar"],
    ig: ["https://www.instagram.com/incredosugar"],
    urls: ["https://awesometlv.co.il"],
    _processed: "auto"
  },
  Infinidat: {
    ws: ["https://www.infinidat.com"],
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
  Ingonyama: {
    ws: ["https://dev.ingonyama.com", "https://www.ingonyama.com"],
    li: ["https://www.linkedin.com/company/ingonyama"],
    tw: ["https://x.com/ingo_zk"],
    gh: ["https://github.com/ingonyama-zk"],
    ytp: ["https://www.youtube.com/@ingo_zk"],
    urls: [
      "https://discord.com/invite/EVVXTdt6DF",
      "https://hackmd.io/@Ingonyama",
      "https://medium.com/@ingonyama",
      "https://web-cdn.bsky.app/profile/ingonyamazk.bsky.social"
    ],
    _processed: "auto"
  },
  Ingrediome: {
    ws: ["https://www.ingrediome.com"],
    li: ["https://www.linkedin.com/company/ingrediome"],
    urls: [
      "https://techcrunch.com/2024/02/26/ingrediome-israeli-startup-lab-protein-taste-food-tech",
      "https://www.growthmentor.com/startup-accelerators/indiebio/ingrediome"
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
    ws: ["https://inspira-technologies.com"],
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
  "Intail.ai": { ws: ["https://app.orbb.com", "https://orbb.com"], urls: ["https://www.nmore.co"], _processed: "auto" },
  InterCure: { ws: ["https://www.intercure.co"], urls: ["https://www.canndoc.com"], _processed: "auto" },
  "Intuition Robotics": {
    ws: ["https://www.intuitionrobotics.com"],
    li: ["https://www.linkedin.com/company/intuition-robotics"],
    fb: ["https://www.facebook.com/intuitionrobotics"],
    tw: ["https://twitter.com/intuitionrobo"],
    ig: ["https://instagram.com/intuitionrobotics"],
    ytc: ["https://www.youtube.com/channel/UCo6z_aQZanqiWzpudAvu5Ew"],
    urls: ["https://drive.google.com/drive/folders/1ej0iM68l1MJkJUtGAArm-8E1jFriaPBf", "https://elliq.com"],
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
  Jiga: {
    ws: ["https://app.jiga.io", "https://jiga.io"],
    li: ["https://www.linkedin.com/company/jiga3d"],
    _processed: "auto"
  },
  Jit: {
    ws: ["https://docs.jit.io", "https://platform.jit.io", "https://www.jit.io"],
    li: ["https://www.linkedin.com/company/jit"],
    fb: ["https://www.facebook.com/thejitcompany"],
    tw: ["https://twitter.com/jit_io"],
    ytp: ["https://www.youtube.com/@jitsec"],
    urls: [
      "https://meetings-eu1.hubspot.com/aviram-shmueli/jit-website-demo",
      "https://www.g2.com/products/jit/reviews"
    ],
    _processed: "auto"
  },
  Joyned: {
    ws: [
      "https://demo.joyned.co",
      "https://joyned.co",
      "https://support.joyned.co",
      "https://traveller-voice.joyned.co"
    ],
    urls: ["https://joyned.co"],
    _processed: "auto"
  },
  "Juno Journey": {
    ws: [
      "https://auth.junojourney.com",
      "https://careers.junojourney.com",
      "https://team.junojourney.com",
      "https://trust.junojourney.com",
      "https://www.junojourney.com"
    ],
    li: ["https://www.linkedin.com/company/junojourney"],
    fb: ["https://www.facebook.com/junojourney1"],
    ytc: ["https://www.youtube.com/channel/ucdagxyyo83qy-_igtpa0brg"],
    urls: [
      "https://careers.junojourney.com",
      "https://team.junojourney.com/learning-table",
      "https://trust.junojourney.com"
    ],
    _processed: "auto"
  },
  Justt: {
    ws: [
      "https://app.justt.ai",
      "https://developers.justt.ai",
      "https://justt.ai",
      "https://login.justt.ai",
      "https://trust.justt.ai"
    ],
    li: ["https://www.linkedin.com/company/justt-ai"],
    tw: ["https://x.com/JusttFintech"],
    ytp: ["https://www.youtube.com/@Justt_Fintech"],
    _processed: "auto"
  },
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
  "Kamari Pharma": {
    ws: ["https://kamaripharma.com"],
    li: ["https://www.linkedin.com/company/kamari-pharma"],
    urls: ["https://epicod.co.il", "https://overallstudio.co.il"],
    _processed: "auto"
  },
  Kardome: {
    ws: ["https://www.kardome.com"],
    li: ["https://www.linkedin.com/company/kardome"],
    fb: ["https://facebook.com/kardomevui"],
    tw: ["https://x.com/kardomevui"],
    ig: ["https://www.instagram.com/kardomevoice", "https://www.instagram.com/kardomevui"],
    _processed: "auto"
  },
  Keep: {
    ws: [
      "https://docs.keephq.dev",
      "https://platform.keephq.dev",
      "https://slack.keephq.dev",
      "https://www.keephq.dev"
    ],
    tw: ["https://x.com/keepalerting"],
    gh: ["https://github.com/keephq"],
    urls: [
      "https://getkeep.slack.com/join/shared_invite/zt-2leydxr6s-XmuQtBttgxZ0GOv8MJu6rQ",
      "https://shoutout.io/keep",
      "https://www.ycombinator.com/companies/keep/jobs"
    ],
    _processed: "auto"
  },
  "Kela Technologies": {
    ws: ["https://kelasys.com"],
    li: ["https://www.linkedin.com/company/kela-technologies"],
    tw: ["https://x.com/kela_tech"],
    _processed: "auto"
  },
  Kemtai: {
    ws: ["https://kemtai.com"],
    li: ["https://www.linkedin.com/company/42125918"],
    fb: ["https://www.facebook.com/kemtaifitness"],
    tw: ["https://x.com/kemtaiftns"],
    _processed: "auto"
  },
  Kissterra: {
    ws: ["https://kissterra.com"],
    li: ["https://www.linkedin.com/company/kissterra"],
    fb: ["https://www.facebook.com/kissterra"],
    tw: ["https://x.com/kissterra"],
    ig: ["https://www.instagram.com/life_at_kissterra"],
    ytp: ["https://www.youtube.com/@kissterra"],
    _processed: "auto"
  },
  Knostic: {
    ws: ["https://prompts.knostic.ai", "https://www.knostic.ai"],
    li: ["https://www.linkedin.com/company/knostic"],
    tw: ["https://x.com/knosticai"],
    gh: ["https://github.com/knostic"],
    ytp: ["https://www.youtube.com/@knosticai"],
    urls: ["http://privacy-policy", "https://www-knostic-ai.sandbox.hs-sites-eu1.com/industry/government"],
    _processed: "auto"
  },
  "Kodem Security": {
    ws: ["https://reg.kodemsecurity.com", "https://www.kodemsecurity.com"],
    li: ["https://www.linkedin.com/company/kodem"],
    ig: ["https://www.instagram.com/life_at_kodem"],
    _processed: "auto"
  },
  Komodor: {
    ws: [
      "https://k8smap.com",
      "https://api.komodor.com",
      "https://app.komodor.com",
      "https://help.komodor.com",
      "https://komodor.com",
      "https://updates.komodor.com"
    ],
    li: ["https://www.linkedin.com/company/69529378"],
    fb: ["https://www.facebook.com/KomodorTroubleshooting"],
    tw: ["https://twitter.com/Komodor_com"],
    gh: [
      "https://github.com/komodorio",
      "https://github.com/komodorio/helm-dashboard",
      "https://github.com/komodorio/komoplane",
      "https://github.com/komodorio/validkube"
    ],
    urls: ["https://launchpass.com/komodorkommunity", "https://www.g2.com/products/komodor-2024-05-13/reviews"],
    _processed: "auto"
  },
  Kovrr: {
    ws: ["https://resources.kovrr.com", "https://www.kovrr.com"],
    li: ["https://www.linkedin.com/company/kovrr"],
    tw: ["https://x.com/kovrrins"],
    _processed: "auto"
  },
  "Laguna Health": {
    ws: ["https://form.lagunahealth.com", "https://www.lagunahealth.com"],
    li: ["https://www.linkedin.com/company/getlaguna"],
    ig: ["https://www.instagram.com/lagunahealth"],
    _processed: "auto"
  },
  "Landa Digital Printing": {
    ws: ["https://www.landanano.com"],
    li: ["https://www.linkedin.com/company/landa-digital-printing"],
    fb: ["https://www.facebook.com/landanano"],
    ig: ["https://www.instagram.com/landa.nano"],
    ytp: ["https://www.youtube.com/@landanano"],
    urls: [
      "https://www.landanano.com/about-us",
      "https://www.landanano.com/market-segments",
      "https://www.landanano.com/news",
      "https://www.landanano.com/online-services-terms-of-use",
      "https://www.landanano.com/privacy-policy",
      "https://www.landanano.com/products",
      "https://www.landanano.com/technology",
      "https://www.landanano.com/terms-of-use"
    ],
    _processed: "auto"
  },
  "Lasso Security": {
    ws: ["https://www.lasso.security"],
    li: ["https://www.linkedin.com/company/lasso-security"],
    tw: ["https://twitter.com/lassosecurity"],
    _processed: "auto"
  },
  "Lavie bio": { ws: ["https://lavie-bio.com"], _processed: "auto" },
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
  Loops: {
    ws: ["https://app.getloops.ai", "https://www.getloops.ai"],
    li: ["https://www.linkedin.com/company/getgetloops"],
    urls: ["https://www.producthunt.com/posts/loops-b4eb3c28-5d9d-4d4a-9414-e57e3faf3f67"],
    _processed: "auto"
  },
  Loora: {
    ws: ["https://business.loora.com", "https://www.loora.com"],
    li: ["https://www.linkedin.com/company/loora"],
    ig: ["https://www.instagram.com/loora.ai"],
    ytp: ["https://www.youtube.com/@speak-english-with-loora-ai"],
    tt: ["https://www.tiktok.com/@loora.ai"],
    urls: [
      "https://loora.notion.site/Privacy-Policy-ef0742ecd68747f280fdbbe9ef46d527",
      "https://loora.notion.site/Terms-and-Conditions-c5de2f24f44949bd8336426800fd1631",
      "https://loora.onelink.me/ntkb/AndroidDownload",
      "https://loora.onelink.me/ntkb/websiteDownload"
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
  Lumus: {
    ws: ["https://lumus.com"],
    li: ["https://www.linkedin.com/company/lumus-ltd-"],
    tw: ["https://x.com/lumusvision"],
    ytc: ["https://www.youtube.com/channel/ucuyctcanf6lijjc4ww8zj8w"],
    _processed: "auto"
  },
  "Lutris Pharma": {
    ws: ["https://www.lutris-pharma.com"],
    li: ["https://www.linkedin.com/company/lutris-phama"],
    urls: ["http://www.webview.co.il"],
    _processed: "auto"
  },
  MDClone: {
    ws: ["https://academy.mdclone.com", "https://mdclone.com"],
    li: ["https://www.linkedin.com/company/mdclone"],
    fb: ["https://www.facebook.com/mdclonehq"],
    tw: ["https://twitter.com/MDCloneHQ"],
    urls: ["https://mdclone.atlassian.net/servicedesk/customer/portal/7"],
    _processed: "auto"
  },
  "Magenta Medical": {
    ws: ["https://magentamed.com"],
    li: ["https://www.linkedin.com/company/magenta-medical"],
    tw: ["https://x.com/magentamed"],
    urls: ["https://www.madebyomnis.com"],
    _processed: "auto"
  },
  "Magnus Metal": {
    ws: ["https://magnusmetal.com"],
    urls: ["https://magnusmetal.com/privacy-policy", "https://magnusmetal.com/terms-of-use"],
    _processed: "auto"
  },
  "Maris Tech Ltd.": { fb: "https://www.facebook.com/MarisTech" },
  "Marketeam.ai": {
    ws: ["https://app.marketeam.ai", "https://www.marketeam.ai"],
    li: ["https://www.linkedin.com/company/marketeam-ai"],
    ig: ["https://www.instagram.com/marketeam.ai"],
    gh: ["https://github.com/marketeam-ai"],
    ytp: ["https://www.youtube.com/@marketeam-ai"],
    urls: ["https://calendly.com/whitney-marketeam/marketeam-meeting-clone", "https://huggingface.co/marketeam"],
    _processed: "auto"
  },
  Masterschool: {
    ws: ["https://joinmsit.de"],
    fb: ["https://www.facebook.com/joinmsit.de"],
    ig: ["https://www.instagram.com/msit.master.school"],
    ytp: ["https://www.youtube.com/@msit.official"],
    urls: [
      "https://admissions.masterschool.com/lps/qualification/qMfdsLvx",
      "https://forms.masterschool.com/to/HcW7YpdA",
      "https://mail.google.com/mail/u/0",
      "https://referral.masterschool.com/cRGLd68h",
      "https://referral.masterschool.com/cUcvseIL"
    ],
    _processed: "auto"
  },
  Max: {
    ws: ["https://ir.maxstock.co.il", "https://maxstock.co.il"],
    li: ["https://www.linkedin.com/company/max-stock-global"],
    fb: ["https://www.facebook.com/maxstockisrael"],
    ig: ["https://www.instagram.com/max_stock_israel"],
    ytp: ["https://www.youtube.com/@max_stock"],
    tt: ["https://www.tiktok.com/@max_stock_israel"],
    urls: ["https://maxs.screenconnect.com"],
    _processed: "auto"
  },
  MazeBolt: {
    ws: [
      "https://app.mazebolt.com",
      "https://dtr.mazebolt.com",
      "https://kb.mazebolt.com",
      "https://mazebolt.com",
      "https://support.mazebolt.com",
      "http://support.mazebolt.com"
    ],
    li: ["https://www.linkedin.com/company/mazebolt-technologies"],
    fb: ["https://www.facebook.com/mazebolt"],
    tw: ["https://twitter.com/Mazebolt"],
    ig: ["https://instagram.com/lifeatmazebolt"],
    ytp: ["https://www.youtube.com/@MazeBolt"],
    urls: ["https://console.cloud.google.com/marketplace/product/mazebolt-public/mazebolt-radar"],
    _processed: "auto"
  },
  "Meala Foodtech": {
    ws: ["https://www.mealafood.com"],
    li: ["https://www.linkedin.com/company/meala-foodtech"],
    _processed: "auto"
  },
  "Meitav Investment House": {
    ws: ["https://www.meitav.co.il"],
    li: ["https://www.linkedin.com/company/meitav"],
    fb: ["https://www.facebook.com/meitav.invest"],
    ig: ["https://www.instagram.com/meitav"],
    ytp: ["https://www.youtube.com/@meitav_investments"],
    urls: ["https://www.peninsula.co.il"],
    _processed: "auto"
  },
  Memcyco: {
    ws: ["https://www.memcyco.com"],
    li: ["https://www.linkedin.com/company/77059698"],
    fb: ["https://www.facebook.com/memcyco"],
    tw: ["https://x.com/memcyco"],
    ytp: ["https://www.youtube.com/@memcyco"],
    _processed: "auto"
  },
  "Mentee Robotics": {
    ws: ["https://menteebot.com"],
    li: ["https://www.linkedin.com/company/mentee-robotics"],
    tw: ["https://twitter.com/MenteeBot"],
    ytp: ["https://www.youtube.com/@menteebot"],
    _processed: "auto"
  },
  MetalBear: {
    ws: ["https://app.metalbear.com", "https://metalbear.com"],
    li: ["https://www.linkedin.com/company/metalbearco"],
    tw: ["https://x.com/metalbear"],
    gh: ["https://github.com/metalbear-co"],
    urls: ["https://studioartik.com"],
    _processed: "auto"
  },
  "Metis Technologies": { fb: "", tw: "" },
  "Microbot Medical": {
    ws: ["https://ir.microbotmedical.com", "https://microbotmedical.com"],
    urls: ["https://ir.microbotmedical.com/news-events/press-release", "https://thesulfurgroup.com"],
    _processed: "auto"
  },
  "Miggo Security": {
    ws: ["https://www.miggo.io"],
    li: ["https://www.linkedin.com/company/miggo-security"],
    tw: ["https://twitter.com/MiggoSecurity"],
    ytp: ["https://www.youtube.com/@MiggoSecurity"],
    _processed: "auto"
  },
  Milestone: {
    ws: ["https://docs.mstone.ai", "https://mstone.ai"],
    li: ["https://www.linkedin.com/company/milestoneai"],
    tw: ["https://x.com/mstone_ai"],
    urls: ["https://docs.mstone.ai", "https://mstone.ai"],
    _processed: "auto"
  },
  Mindspace: {
    ws: ["https://hs.mindspace.me", "https://members.mindspace.me", "https://www.mindspace.me"],
    li: ["https://www.linkedin.com/company/mindspace-co"],
    fb: ["https://www.facebook.com/mindspace.me"],
    ig: ["https://www.instagram.com/mindspace.me"],
    urls: ["https://onelink.to/mindspace-member-app"],
    _processed: "auto"
  },
  Mine: {
    ws: ["https://developers.mineos.ai", "https://docs.mineos.ai", "https://www.mineos.ai"],
    li: ["https://www.linkedin.com/company/mineos"],
    urls: [
      "https://developers.mineos.ai",
      "https://docs.mineos.ai/knowledge",
      "https://portal.saymine.com",
      "https://www.mineos.ai/about",
      "https://www.mineos.ai/about-security",
      "https://www.mineos.ai/ai-governance",
      "https://www.mineos.ai/ai-strategy-program",
      "https://www.mineos.ai/become-a-partner",
      "https://www.mineos.ai/careers",
      "https://www.mineos.ai/case-studies",
      "https://www.mineos.ai/consent-management",
      "https://www.mineos.ai/contact",
      "https://www.mineos.ai/data-classification",
      "https://www.mineos.ai/data-policies-enforcement",
      "https://www.mineos.ai/dpa-sub-processor-mapping",
      "https://www.mineos.ai/dspm",
      "https://www.mineos.ai/dsr-automation",
      "https://www.mineos.ai/g2-leader",
      "https://www.mineos.ai/hub/articles",
      "https://www.mineos.ai/hub/hub-glossary",
      "https://www.mineos.ai/integrations",
      "https://www.mineos.ai/inventory-discovery",
      "https://www.mineos.ai/legal",
      "https://www.mineos.ai/legal/do-not-sell-my-personal-information",
      "https://www.mineos.ai/legal/portal-privacy-policy",
      "https://www.mineos.ai/mira-ai",
      "https://www.mineos.ai/privacy-center",
      "https://www.mineos.ai/privacy-risk-management",
      "https://www.mineos.ai/ropa-gdpr",
      "https://www.mineos.ai/shadow-it",
      "https://www.mineos.ai/technologies/autopilot",
      "https://www.mineos.ai/technologies/live-assessments",
      "https://www.mineos.ai/technologies/smart-data-sampling",
      "https://www.mineos.ai/third-party-risk-management",
      "https://www.mineos.ai/vendor-risk-assessment"
    ],
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
  Moovit: {
    ws: ["https://moovit.com"],
    urls: [
      "https://apps.apple.com/us/app/moovit-public-transit/id498477945",
      "https://bit.ly/Moovit_FB_EN",
      "https://bit.ly/Moovit_IG",
      "https://bit.ly/Moovit_Linkedin",
      "https://bit.ly/Moovit_TW_EN",
      "https://bit.ly/Moovit_YouTube",
      "https://editor.moovitapp.com/web/community",
      "https://moovit.me/privacy_notice",
      "https://moovit.me/terms_of_service",
      "https://moovitapp.com",
      "https://moovitapp.com/insights",
      "https://moovitapp.com/report",
      "https://moovitapp.com/tickets/en",
      "https://support.moovitapp.com/hc/en-us"
    ],
    android_app_ids: ["com.tranzmate"],
    _processed: "auto"
  },
  Morphisec: {
    ws: ["https://www.morphisec.com"],
    li: ["https://www.linkedin.com/company/morphisec"],
    tw: ["https://twitter.com/morphisec"],
    ytc: ["https://www.youtube.com/channel/UCe48cR5xTxPJSYMjG-So7Rw"],
    urls: ["https://morphisec.xamplify.io", "https://support.morphisec.com/hc/en-us"],
    _processed: "auto"
  },
  Munch: {
    ws: ["https://app.munchstudio.com", "https://www.munchstudio.com"],
    li: ["https://www.linkedin.com/company/mnch"],
    fb: ["https://www.facebook.com/getmunchmedia"],
    tw: ["https://x.com/get_munch"],
    ig: [
      "https://www.instagram.com/beautyandbrainswithatwist",
      "https://www.instagram.com/ilanamuhlsteinrd",
      "https://www.instagram.com/munchstudio_com"
    ],
    ytp: ["https://www.youtube.com/@munchstudio_com"],
    tt: ["https://www.tiktok.com/@munchstudio_com"],
    th: ["https://www.threads.net/@munchstudio_com"],
    urls: ["https://intercom.help/munch-e1ea69d858ab/en", "https://www.producthunt.com/products/munch-studio"],
    _processed: "auto"
  },
  MyHeritage: { li: "https://www.linkedin.com/company/myheritage" },
  MyndYou: { ws: ["https://www.arbiter.ai"], li: ["https://www.linkedin.com/company/arbiter-ai"], _processed: "auto" },
  NICE: {
    ws: ["https://help.nice.com", "https://resources.nice.com", "https://www.nice.com"],
    li: ["https://www.linkedin.com/company/nice-systems"],
    fb: ["https://www.facebook.com/officialniceltd"],
    tw: ["https://x.com/niceltd"],
    ytc: ["https://www.youtube.com/channel/uc4tmss3favlp1ue0df-eaua"],
    urls: [
      "https://community.niceincontact.com",
      "https://cxexchange.niceincontact.com/en-US/home",
      "https://developer.niceincontact.com",
      "https://login.incontact.com/inContact/Login.aspx",
      "https://nice.customershome.com",
      "https://niceprod.service-now.com/csm",
      "https://partnercommunity.niceincontact.com",
      "https://www.niceactimize.com",
      "https://www.nicepublicsafety.com"
    ],
    _processed: "auto"
  },
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
  Namogoo: {
    ws: [
      "https://auth.abtasty.com",
      "https://careers.abtasty.com",
      "https://docs.abtasty.com",
      "https://www.abtasty.com"
    ],
    li: ["https://www.linkedin.com/company/ab-tasty"],
    fb: ["https://www.facebook.com/abtasty"],
    tw: ["https://x.com/abtasty"],
    ig: ["https://www.instagram.com/abtasty"],
    _processed: "auto"
  },
  "Nano Dimension": {
    ws: ["https://go.nano-di.com", "https://investors.nano-di.com", "https://www.nano-di.com"],
    li: ["https://www.linkedin.com/company/5323642"],
    fb: ["https://www.facebook.com/nanodimensiontech"],
    tw: ["https://x.com/3dpcb"],
    ig: ["https://www.instagram.com/nano_dimension"],
    ytc: ["https://www.youtube.com/channel/ucodg9di3--dcxo5_0lulzla"],
    urls: [
      "https://3dprint.com/318216/nano-dimensions-post-acquisition-focus-turns-to-profitability",
      "https://essemtec.com",
      "https://essemtec.com/en/products/component-storage/cubus",
      "https://essemtec.com/en/products/dispensing/solder-paste-jet-printing",
      "https://essemtec.com/en/products/production-software",
      "https://essemtec.com/en/products/reflow-ovens",
      "https://globalinkjetsystems.com",
      "https://nano-di.my.site.com/CustomerSupport/s",
      "https://www.nano-di.com",
      "https://www.tctmagazine.com/additive-manufacturing-3d-printing-industry-insights/technology-insights/nano-dimension-additively-manufactured-electronics-part-of-core"
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
      "https://www.youtube.com/channel/UCCIwsFWZNuugtW1U2X89t7A"
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
  Neema: {
    ws: ["https://docs.getneema.com", "https://getneema.com"],
    li: ["https://www.linkedin.com/company/neema-official"],
    urls: ["https://share-eu1.hsforms.com/1064gI4P7QBGKIuYKlPukCA2et0fn"],
    _processed: "auto"
  },
  "NetOp.Cloud": { ws: ["https://netop.ai"], li: ["https://www.linkedin.com/company/netop-ai"], _processed: "auto" },
  Neteera: {
    ws: ["https://www.neteera.com"],
    li: ["https://www.linkedin.com/company/neteera"],
    urls: ["https://maps.app.goo.gl/m3zhiPZpWrWWPCcx6"],
    _processed: "auto"
  },
  NeuraLight: {
    ws: ["https://neuralight.ai"],
    li: ["https://www.linkedin.com/company/neuralight"],
    _processed: "auto"
  },
  NeuroBlade: {
    ws: ["https://docs.neuroblade.com", "https://www.neuroblade.com"],
    li: ["https://www.linkedin.com/company/neuroblade"],
    urls: ["https://thefinanceherald.com/amazon-expands-its-israeli-footprint-snatching-up-neuroblades-coreteam"],
    _processed: "auto"
  },
  "NeuroSense Therapeutics": {
    ws: ["https://www.neurosense-tx.com"],
    li: ["https://www.linkedin.com/company/neurosense-therapeutics"],
    fb: ["https://www.facebook.com/neurosensetx"],
    tw: ["https://x.com/neurosenset"],
    ig: ["https://www.instagram.com/neurosense_therapeutics"],
    urls: ["https://neurosense.investorroom.com", "https://www.neurosense-tx.com", "https://www.webnoise.co.il"],
    _processed: "auto"
  },
  NextSilicon: {
    ws: ["https://www.nextsilicon.com"],
    urls: ["https://silktide.com/consent-manager"],
    _processed: "auto"
  },
  Nilos: {
    ws: ["https://app.nilos.io", "https://status.nilos.io", "https://www.nilos.io"],
    urls: ["https://app.dover.com/jobs/nilos"],
    _processed: "auto"
  },
  "Nokod Security": {
    ws: ["https://nokodsecurity.com"],
    li: ["https://www.linkedin.com/company/nokodsecurity"],
    ytp: ["https://www.youtube.com/@nokodsecurity"],
    _processed: "auto"
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
  Novidea: {
    ws: ["https://novidea.com"],
    li: ["https://www.linkedin.com/company/novidea-software"],
    fb: ["https://www.facebook.com/novideasoft"],
    ig: ["https://instagram.com/inside_novidea"],
    ytc: ["https://www.youtube.com/channel/UC_zLIYG3uK0n4F1pHi4Uu3Q"],
    urls: ["https://novidea-crm.my.site.com/support/login", "https://novidea.force.com/support/login"],
    _processed: "auto"
  },
  Novu: {
    ws: [
      "https://careers.novu.co",
      "https://dashboard.novu.co",
      "https://docs.novu.co",
      "https://go.novu.co",
      "https://handbook.novu.co",
      "https://novu.co",
      "https://roadmap.novu.co"
    ],
    tw: ["https://x.com/novuhq"],
    gh: ["https://github.com/novuhq"],
    urls: ["https://discord.gg/novu", "https://git.new/novu", "https://novustatus.com"],
    _processed: "auto"
  },
  NsKnox: {
    ws: ["https://nsknox.net"],
    li: ["https://www.linkedin.com/company/7972484"],
    fb: ["https://www.facebook.com/nsknoxtechnologies"],
    tw: ["https://x.com/nsknoxtech"],
    _processed: "auto"
  },
  Nucleix: {
    ws: ["https://nucleix.com"],
    li: ["https://www.linkedin.com/company/nucleix-ltd-"],
    fb: ["https://www.facebook.com/nucleix-100608201471224"],
    tw: ["https://x.com/nucleix2"],
    ig: ["https://www.instagram.com/nucleix_ltd"],
    _processed: "auto"
  },
  "NurExone Biologic": {
    ws: ["https://nurexone.com", "https://register.nurexone.com"],
    li: ["https://www.linkedin.com/company/nurexone-biologic"],
    fb: ["https://www.facebook.com/NurExone"],
    tw: ["https://twitter.com/NBiologic"],
    ytc: ["https://www.youtube.com/channel/UCpcZmZlFTj7fnEBZyFx9aYA"],
    _processed: "auto"
  },
  OKIBO: {
    ws: ["https://okibo.com"],
    li: ["https://www.linkedin.com/company/okibo-smart-robotics-in-construction-sites"],
    ytc: ["https://www.youtube.com/channel/ucz-izvq-ip1jspip9u1eafw"],
    urls: [
      "https://underthehardhat.org/okibo-eg7-robot",
      "https://www.aecbytes.com/feature/2025/Robotics-Construction.html",
      "https://www.hakerdesign.co.il",
      "https://www.robotics247.com/article/okibo-announces-general-availability-of-robotic-blaster-technology-for-construction-industry"
    ],
    _processed: "auto"
  },
  "ONE ZERO": {
    ws: ["https://www.onezerobank.com"],
    li: ["https://www.linkedin.com/company/the-first-digital-bank"],
    fb: ["https://www.facebook.com/onezerobank"],
    tw: ["https://x.com/onezerobank"],
    ig: ["https://www.instagram.com/onezerodigitalbank"],
    ytc: ["https://www.youtube.com/channel/ucewvk-lopk4wtnhi1mhggsg"],
    _processed: "auto"
  },
  Octup: {
    ws: ["https://partner.octup.com", "https://www.octup.com"],
    li: ["https://www.linkedin.com/company/octup-com"],
    _processed: "auto"
  },
  "Od Podcast": { ws: "", li: "https://www.linkedin.com/company/guykatsovichpodcast" },
  Odeeo: {
    ws: ["https://blog.odeeo.io", "https://odeeo.io"],
    li: ["https://www.linkedin.com/company/odeeo"],
    fb: ["https://www.facebook.com/sonicodeeo"],
    tw: ["https://x.com/sonicodeeo"],
    urls: ["https://blog.odeeo.io", "https://www.kalungi.com/atlas-hubspot-theme-for-b2b-saas-software"],
    _processed: "auto"
  },
  Odigos: { ws: ["https://odigos.io"], gh: "https://github.com/odigos-io/odigos", _processed: "auto" },
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
  OncoHost: {
    ws: ["https://www.oncohost.com"],
    li: ["https://www.linkedin.com/company/oncohost"],
    fb: ["https://www.facebook.com/OncoHost"],
    tw: ["https://twitter.com/OncoHost"],
    ytp: ["https://www.youtube.com/@oncohost"],
    _processed: "auto"
  },
  "One AI": {
    ws: ["https://app.oneai.com", "https://oneai.com", "https://studio.oneai.com"],
    li: ["https://www.linkedin.com/company/one-ai"],
    tw: ["https://x.com/oneailabs"],
    ytc: ["https://www.youtube.com/channel/uc7iq6yfks57gta-he72fsgw"],
    urls: [
      "https://gdpr.eu",
      "https://oneai.com",
      "https://www.aicpa.org/soc4so",
      "https://www.callringo.com",
      "https://www.hhs.gov/hipaa/index.html"
    ],
    _processed: "auto"
  },
  Onebeat: {
    li: ["https://www.linkedin.com/company/1beat"],
    fb: ["https://www.facebook.com/1beatretail"],
    tw: ["https://twitter.com/Onebeat4retail"],
    ytp: ["https://www.youtube.com/@onebeat8428"],
    _processed: "auto"
  },
  Oosto: {
    ws: ["https://knowledge.oosto.com", "https://oosto.com"],
    li: ["https://www.linkedin.com/company/oosto"],
    tw: ["https://x.com/oostoai"],
    ytp: ["https://www.youtube.com/@oosto6849"],
    _processed: "auto"
  },
  Optibus: {
    ws: ["https://blog.optibus.com", "https://optibus.com"],
    li: ["https://www.linkedin.com/company/optibus-ltd"],
    fb: ["https://www.facebook.com/Optibusltd"],
    tw: ["https://twitter.com/optibus"],
    ytc: ["https://www.youtube.com/channel/UCTLHB0yvKEHMtbbYTx9ngBg"],
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
  "Opus Security": {
    ws: [
      "https://orca.security",
      "https://partners.orca.security",
      "https://research.orca.security",
      "https://trustcenter.orca.security",
      "https://uc.orca.security",
      "https://docs.orcasecurity.io",
      "https://us.gov.app.orcasecurity.io",
      "https://eu.app.orcasecurity.io",
      "https://au.app.orcasecurity.io",
      "https://app.orcasecurity.io"
    ],
    li: ["https://www.linkedin.com/company/orca-security"],
    tw: ["https://twitter.com/OrcaSec"],
    ytp: ["https://www.youtube.com/orcasecurity"],
    urls: [
      "https://aws.amazon.com/marketplace/pp/prodview-rogbt2k4b63xc",
      "https://www.g2.com/products/orca-security/reviews"
    ],
    _processed: "auto"
  },
  "OrCam Technologies": {
    ws: ["https://www.orcam.com"],
    li: ["https://www.linkedin.com/company/orcam"],
    fb: ["https://www.facebook.com/orcamtech"],
    tw: ["https://x.com/orcam"],
    ig: ["https://www.instagram.com/orcam_technologies"],
    ytp: ["https://www.youtube.com/@orcamtech"],
    _processed: "auto"
  },
  Orbs: {
    ws: ["https://www.orbs.com"],
    tw: ["https://x.com/orbs_network"],
    gh: ["https://github.com/orbs-network"],
    ytc: ["https://www.youtube.com/channel/ucfpv4z-mgxeiabfkht1lnpq"],
    urls: [
      "https://discord.gg/sswGDYGBt5",
      "https://docs.orbs.network",
      "https://orbs-network.github.io/oip6-migration-web",
      "https://staking.orbs.network",
      "https://status.orbs.network",
      "https://t.me/OrbsNetwork"
    ],
    _processed: "auto"
  },
  "Orca AI": {
    ws: ["https://fleet.orca-ai.io", "https://www.orca-ai.io"],
    li: ["https://www.linkedin.com/company/orca-ai"],
    ytc: ["https://www.youtube.com/channel/UCAfYyHNSk01rwWLEWPKQ25Q"],
    urls: [
      "https://www.orca-ai.io/about",
      "https://www.orca-ai.io/careers",
      "https://www.orca-ai.io/category/news",
      "https://www.orca-ai.io/category/press-releases",
      "https://www.orca-ai.io/category/videos",
      "https://www.orca-ai.io/co-captain",
      "https://www.orca-ai.io/commercial-shipping",
      "https://www.orca-ai.io/events",
      "https://www.orca-ai.io/faqs",
      "https://www.orca-ai.io/fleetview",
      "https://www.orca-ai.io/glossary/safety",
      "https://www.orca-ai.io/industries/defense",
      "https://www.orca-ai.io/masterview",
      "https://www.orca-ai.io/our-technology",
      "https://www.orca-ai.io/partners",
      "https://www.orca-ai.io/resource-center/blog",
      "https://www.orca-ai.io/resource-center/case-studies",
      "https://www.orca-ai.io/seapod",
      "https://www.orca-ai.io/solutions/autonomous-shipping",
      "https://www.orca-ai.io/solutions/situational-awareness"
    ],
    _processed: "auto"
  },
  "Orion Security": { ws: ["https://app.orionsec.io", "https://www.orionsec.io"], _processed: "auto" },
  Ottopia: {
    ws: ["https://www.ottopia.tech"],
    li: ["https://www.linkedin.com/company/ottopia"],
    fb: ["https://www.facebook.com/ottopiatech"],
    urls: ["https://medium.com/ottopia"],
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
  "P-Cure": {
    ws: ["https://www.p-cure.com"],
    urls: [
      "https://www.p-cure.com/about-us",
      "https://www.p-cure.com/news-events",
      "https://www.p-cure.com/the-solution"
    ],
    _processed: "auto"
  },
  PainReform: {
    ws: ["https://prf-tech.com"],
    urls: [
      "https://9upi4mw9no.tempisr.io/prf-110",
      "https://prf-tech.com/accessibility-statement",
      "https://prf-tech.com/privacy-policy",
      "https://prf-tech.com/terms-of-use",
      "https://web.irm.co.il",
      "https://www.sec.gov/cgi-bin/browse-edgar"
    ],
    _processed: "auto"
  },
  Panjaya: {
    ws: ["https://docs.panjaya.ai", "https://www.panjaya.ai"],
    li: ["https://www.linkedin.com/company/panjaya-ai"],
    tw: ["https://x.com/panjayai"],
    ig: ["https://www.instagram.com/panjaya.ai"],
    _processed: "auto"
  },
  "Payouts.com": {
    ws: ["https://integrations.payouts.com", "https://payouts.com", "https://status.payouts.com"],
    li: ["https://www.linkedin.com/company/payouts-com"],
    tw: ["https://x.com/payoutsdotcom"],
    _processed: "auto"
  },
  "Perception Point": {
    ws: [
      "https://community.fortinet.com",
      "https://docs.fortinet.com",
      "https://global.fortinet.com",
      "https://go.fortinet.com",
      "https://icons.fortinet.com",
      "https://investor.fortinet.com",
      "https://partnerportal.fortinet.com",
      "https://support.fortinet.com",
      "https://training.fortinet.com",
      "https://trust.fortinet.com",
      "https://video.fortinet.com",
      "https://www.fortinet.com"
    ],
    li: ["https://www.linkedin.com/company/fortinet"],
    fb: ["https://www.facebook.com/fortinet"],
    tw: ["https://x.com/fortinet"],
    ig: ["https://www.instagram.com/fortinet"],
    ytc: ["https://www.youtube.com/channel/ucjho4auvomwmrzgka5dqeoa"],
    urls: [
      "https://community.fortinet.com",
      "https://fortinet-tv.com",
      "https://global.fortinet.com/PreferenceCenter",
      "https://www.fortinet.com/blog",
      "https://www.fortinetaccelerate.com/lasvegas_26",
      "https://www.fortinetfederal.com"
    ],
    _processed: "auto"
  },
  Percepto: {
    ws: ["https://drones.percepto.co", "https://info.percepto.co", "https://percepto.co"],
    li: ["https://www.linkedin.com/company/perceptoautonomousdrones"],
    fb: ["https://www.facebook.com/perceptodrones"],
    tw: ["https://twitter.com/perceptodrones"],
    ig: ["https://www.instagram.com/perceptodrones"],
    _processed: "auto"
  },
  "Permit.io": {
    ws: [
      "https://api.permit.io",
      "https://app.permit.io",
      "https://docs.permit.io",
      "https://io.permit.io",
      "https://www.permit.io"
    ],
    li: ["https://www.linkedin.com/company/permitio"],
    tw: ["https://x.com/permit_io"],
    gh: ["https://github.com/permitio"],
    ytp: ["https://www.youtube.com/@permitio"],
    urls: [
      "https://calendly.com/permitio/intro-call",
      "https://docs.permit.io",
      "https://io.permit.io/slack",
      "https://permit-io.instatus.com",
      "https://permit.productlane.com/roadmap",
      "https://www.producthunt.com/posts/permit-io"
    ],
    _processed: "auto"
  },
  "Phoenix Financial": {
    ws: [
      "https://agent.fnx.co.il",
      "https://ambulatoryclaim.fnx.co.il",
      "https://b.fnx.co.il",
      "https://carclaim.fnx.co.il",
      "https://dentist.fnx.co.il",
      "https://digital-content.fnx.co.il",
      "https://doctors.fnx.co.il",
      "https://employer.fnx.co.il",
      "https://forms.fnx.co.il",
      "https://garagesportal.fnx.co.il",
      "https://help.fnx.co.il",
      "https://investroutescalc.fnx.co.il",
      "https://my.fnx.co.il",
      "https://myloans.fnx.co.il",
      "https://smart.fnx.co.il",
      "https://surgeryclaim.fnx.co.il",
      "https://www.fnx.co.il"
    ],
    fb: ["https://www.facebook.com/fnx.co.il"],
    ytp: ["https://www.youtube.com/@fnxinsurance"],
    urls: [
      "https://ksmc.co.il",
      "https://www.xnes.co.il",
      "https://www.xnes.co.il/fnx-w",
      "https://www.xnes.co.il/trading"
    ],
    _processed: "auto"
  },
  Phytech: {
    ws: ["https://app.phytech.com", "https://www.phytech.com"],
    li: ["https://www.linkedin.com/company/476356"],
    tw: ["https://x.com/phytechusa"],
    ig: ["https://www.instagram.com/phytech_farmos"],
    ytc: ["https://www.youtube.com/channel/ucux5vjb_90kd_9b9fa-x5gg"],
    _processed: "auto"
  },
  Phytolon: { ws: ["https://www.phytolon.com"], li: ["https://www.linkedin.com/company/phytolon"], _processed: "auto" },
  Pixellot: {
    ws: ["https://www.pixellot.tv"],
    li: ["https://www.linkedin.com/company/pixellotltd"],
    fb: ["https://www.facebook.com/pixellotltd"],
    tw: ["https://x.com/pixellotltd"],
    ig: ["https://www.instagram.com/pixellotofficial"],
    ytp: ["https://www.youtube.com/@pixellotltd"],
    urls: ["https://vimeo.com/1072158726", "https://vimeo.com/user105679847", "https://www.costa.co.il"],
    _processed: "auto"
  },
  PlainID: {
    ws: [
      "https://go.plainid.com",
      "https://www.plainid.com",
      "https://docs.plainid.io",
      "https://plainid.atlassian.net"
    ],
    li: ["https://www.linkedin.com/company/plainid"],
    ytp: ["https://www.youtube.com/@plainid3877"],
    _processed: "auto"
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
  Plus500: {
    ws: [
      "https://app.plus500.com",
      "https://cdn-main.plus500.com",
      "https://investors.plus500.com",
      "https://www.plus500.com"
    ],
    li: ["https://www.linkedin.com/company/plus500-official-page"],
    fb: ["https://www.facebook.com/plus500"],
    tw: ["https://x.com/plus500"],
    ig: ["https://www.instagram.com/plus500"],
    ytp: ["https://www.youtube.com/@plus500site"],
    urls: [
      "https://apps.apple.com/de/app/plus500/id417962622",
      "https://t.me/Plus500_Official",
      "https://uk.advfn.com/awards/2025",
      "https://www.500affiliates.com/de",
      "https://www.forexbrokers.com/annual-awards-2025",
      "https://www.fxempire.com/brokers/best/mobile-apps"
    ],
    android_app_ids: ["com.Plus500"],
    _processed: "auto"
  },
  Polyrizon: {
    ws: ["https://investor.polyrizon-biotech.com", "https://polyrizon-biotech.com"],
    urls: ["https://polyrizon-biotech.com"],
    _processed: "auto"
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
  "Powermat Technologies": {
    ws: ["https://powermat.com"],
    li: ["https://www.linkedin.com/company/940993"],
    fb: ["https://www.facebook.com/powermattechnologies"],
    tw: ["https://x.com/powermat"],
    ig: ["https://www.instagram.com/powermat"],
    ytp: ["https://www.youtube.com/@powermat"],
    _processed: "auto"
  },
  PrettyDamnQuick: {
    ws: ["https://support.prettydamnquick.com", "https://www.prettydamnquick.com"],
    urls: ["https://go.pdq.app", "https://www.checkoutpulse.com"],
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
  "Prisma Photonics": {
    ws: ["https://www.prismaphotonics.com"],
    li: ["https://www.linkedin.com/company/prisma-photonics"],
    ytc: ["https://www.youtube.com/channel/ucwqjymddwxn0qwihxc8iyzq"],
    _processed: "auto"
  },
  "ProFuse Technology": {
    ws: ["https://profuse-tech.com"],
    urls: [
      "https://profuse-tech.com",
      "https://profuse-tech.com/contact-us",
      "https://profuse-tech.com/news",
      "https://profuse-tech.com/technology"
    ],
    _processed: "auto"
  },
  "Promo.com": {
    ws: ["https://promo.com", "https://support.promo.com"],
    li: ["https://www.linkedin.com/company/promodotcom"],
    fb: ["https://www.facebook.com/business", "https://www.facebook.com/promodotcom"],
    tw: ["https://x.com/promodotcom"],
    ig: ["https://www.instagram.com/promodotcom"],
    ytc: ["https://www.youtube.com/channel/uc0d_7blgbgdcf62o766fkpq"],
    urls: [
      "https://apps.shopify.com/promo-com-promo-video-maker",
      "https://vimeo.com/promobyslidely",
      "https://www.pinterest.com/meetpromo",
      "https://www.producthunt.com/posts/promo"
    ],
    _processed: "auto"
  },
  "Protect AI": {
    gh: ["https://github.com/protectai"],
    ytp: ["https://www.youtube.com/@protectai"],
    urls: ["https://mlsecops.slack.com/signup#/domain-signup"],
    _processed: true
  },
  Pynt: {
    ws: ["https://app.pynt.io", "https://docs.pynt.io", "https://www.pynt.io"],
    li: ["https://www.linkedin.com/company/pynt"],
    tw: ["https://x.com/pynt_io"],
    gh: ["https://github.com/pynt-io"],
    ytc: ["https://www.youtube.com/channel/uchvwpfhgkeitifh71ijmd6g"],
    urls: [
      "https://join.slack.com/t/pynt-community/shared_invite/zt-2kyutq3tv-bltE~ZIj~gc7NltQ1Yfvng",
      "https://meetings-eu1.hubspot.com/tural-mirzayev",
      "https://pynt-community.slack.com/join/shared_invite/zt-2kyutq3tv-bltE~ZIj~gc7NltQ1Yfvng"
    ],
    _processed: "auto"
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
  Qualifire: {
    ws: [
      "https://app.qualifire.ai",
      "https://docs.qualifire.ai",
      "https://playground.qualifire.ai",
      "https://qualifire.ai"
    ],
    li: ["https://www.linkedin.com/company/qualifire-ai"],
    tw: ["https://x.com/qualifireai"],
    gh: ["https://github.com/qualifire-dev"],
    urls: [
      "https://console.cloud.google.com/marketplace/product/qualifire-public/qualifire-guard",
      "https://discord.gg/bGftz4pznT",
      "https://huggingface.co/qualifire"
    ],
    _processed: "auto"
  },
  QuantHealth: {
    ws: ["https://quanthealth.ai", "https://trust.quanthealth.ai"],
    li: ["https://www.linkedin.com/company/quanthealthlabs"],
    tw: ["https://x.com/quanthealthl"],
    urls: ["https://trust.quanthealth.ai"],
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
  "Quantum Source": {
    ws: ["https://www.qs-labs.com"],
    li: ["https://www.linkedin.com/company/quantum-source-labs-ltd"],
    tw: ["https://x.com/qs_labs"],
    ytc: ["https://www.youtube.com/channel/uc0beecuigopye1i6pllejvq"],
    _processed: "auto"
  },
  Quicklizard: {
    ws: ["https://login.euca.quicklizard.com", "https://lp.quicklizard.com", "https://quicklizard.com"],
    li: ["https://www.linkedin.com/company/quicklizard"],
    ytp: ["https://www.youtube.com/@quicklizard-22"],
    urls: [
      "https://login.start-chat.com/modal/67e8d1d4-84fa-4d0a-b95a-bd5d52b37825/9c95bc13-748f-4933-a8a7-5432592caf5e",
      "https://www.capterra.com/reviews/165267/Quicklizard"
    ],
    _processed: "auto"
  },
  Quris: { ws: ["https://www.quris.ai"], li: ["https://www.linkedin.com/company/quris-ai"], _processed: "auto" },
  Qwak: {
    ws: ["https://docs.qwak.com", "https://www.qwak.com"],
    li: ["https://www.linkedin.com/company/qwakai"],
    tw: ["https://x.com/qwak_ai"],
    gh: ["https://github.com/qwak-ai"],
    urls: [
      "https://app.qwak.ai",
      "https://docs.qwak.com/docs",
      "https://jfrog.com/jfrog-cookies-policy",
      "https://jfrog.com/jfrog-ml",
      "https://jfrog.com/privacy-policy",
      "https://mlengineering.medium.com",
      "https://www.qwak.com",
      "https://www.qwak.com/products/feature-store",
      "https://www.qwak.com/products/llmops",
      "https://www.qwak.com/products/mlops"
    ],
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
  REplace: {
    ws: ["https://www.replace-energy.com"],
    li: ["https://www.linkedin.com/company/renewable-energy-place-ltd"],
    _processed: "auto"
  },
  RailVision: {
    ws: ["https://ir.railvision.io", "https://railvision.io"],
    li: ["https://www.linkedin.com/company/rail-vision"],
    fb: ["https://www.facebook.com/railvision.io"],
    tw: ["https://x.com/rail_vision"],
    ig: ["https://www.instagram.com/railvision"],
    urls: ["https://ir.railvision.io", "https://railvision.io", "https://soundcloud.com/rail-evolution-podcast"],
    _processed: "auto"
  },
  "Razor Labs": {
    ws: ["https://www.razor-labs.com"],
    li: ["https://www.linkedin.com/company/razor-technologies-inc"],
    ytp: ["https://www.youtube.com/@razorlabsai"],
    urls: ["https://wponetap.com"],
    _processed: "auto"
  },
  "Red Access": {
    ws: ["https://redaccess.io"],
    li: ["https://www.linkedin.com/company/red-access"],
    tw: ["https://x.com/redaccess_io"],
    ytp: ["https://www.youtube.com/@redaccess_io"],
    _processed: "auto"
  },
  "Red Alert": { ws: "" },
  "Redefine Meat": {
    ws: ["https://www.redefinemeat.com"],
    li: ["https://www.linkedin.com/company/redefinemeat"],
    fb: ["https://www.facebook.com/redefinemeat"],
    ig: ["https://www.instagram.com/redefinemeat"],
    ytp: ["https://www.youtube.com/@redefinemeat"],
    tt: ["https://www.tiktok.com/@redefinemeat"],
    urls: [
      "https://www.redefinemeat.com/company",
      "https://www.redefinemeat.com/join-the-revolution",
      "https://www.redefinemeat.com/products",
      "https://www.redefinemeat.com/recipes",
      "https://www.redefinemeat.com/serving-new-meat",
      "https://www.redefinemeat.com/where-to-find"
    ],
    _processed: "auto"
  },
  Reeco: {
    ws: ["https://buyer.reeco.com", "https://reeco.com"],
    li: ["https://www.linkedin.com/company/re-eco"],
    fb: ["https://www.facebook.com/the.official.reeco"],
    ig: ["https://www.instagram.com/the.official.reeco"],
    ytp: ["https://www.youtube.com/@reecoofficial"],
    _processed: "auto"
  },
  Reflectiz: {
    ws: ["https://dashboard.reflectiz.com", "https://www.reflectiz.com"],
    li: ["https://www.linkedin.com/company/reflectiz"],
    fb: ["https://www.facebook.com/reflectiz.cyber"],
    _processed: "auto"
  },
  Remepy: {
    ws: ["https://www.remepy.com"],
    li: ["https://www.linkedin.com/company/remepy"],
    fb: ["https://www.facebook.com/remepyhealth"],
    _processed: "auto"
  },
  Remilk: {
    ws: ["https://www.remilk.com"],
    li: ["https://www.linkedin.com/company/remilk"],
    fb: ["https://www.facebook.com/remilkfoods"],
    tw: ["https://x.com/remilk_foods"],
    ig: ["https://www.instagram.com/remilk_foods"],
    urls: ["https://www.gad-remilk.co.il"],
    _processed: "auto"
  },
  RepAir: {
    ws: ["https://www.repair-carbon.com"],
    li: ["https://www.linkedin.com/company/repair-carbon"],
    urls: ["https://app.mvpr.io/company/repair-carbon"],
    _processed: "auto"
  },
  ReturnGO: {
    ws: ["https://app.returngo.ai", "https://returngo.ai", "https://support.returngo.ai"],
    li: ["https://www.linkedin.com/company/returngo"],
    fb: ["https://www.facebook.com/returngoai"],
    tw: ["https://x.com/returngoai"],
    ytp: ["https://www.youtube.com/@returngo"],
    urls: [
      "https://apps.shopify.com/returngo",
      "https://open.spotify.com/show/5gCqKZ6oqKWc7PkWGbfAzM",
      "https://wordpress-605706-5283987.cloudwaysapps.com/shipping-labels",
      "https://www.g2.com/products/returngo/reviews"
    ],
    _processed: "auto"
  },
  RevealSecurity: {
    ws: ["https://www.reveal.security"],
    li: ["https://www.linkedin.com/company/revealsecurity"],
    tw: ["https://x.com/revealsecurity"],
    ytp: ["https://www.youtube.com/@reveal.security"],
    _processed: "auto"
  },
  Revrod: { ws: ["https://www.revrod.io"], _processed: "auto" },
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
    ws: ["https://riverside.com"],
    li: ["https://www.linkedin.com/company/riverside-fm"],
    fb: ["https://www.facebook.com/riversidedotfm"],
    ig: ["https://www.instagram.com/riverside.fm"],
    ytc: ["https://www.youtube.com/channel/UCOaG4tMpmIQaLXYe063SZlw"],
    tt: ["https://www.tiktok.com/@riverside.fm"],
    urls: ["https://apps.apple.com/us/app/riverside-fm/id1554443872", "https://support.riverside.com/hc/en-us"],
    android_app_ids: ["riverside.fm"],
    _processed: "auto"
  },
  "SAM Seamless Network": {
    ws: ["https://securingsam.com"],
    li: ["https://www.linkedin.com/company/sam-seamless-network"],
    fb: ["https://www.facebook.com/samseamlessnetwork"],
    tw: ["https://x.com/seamlesssam"],
    ig: ["https://www.instagram.com/securingsam"],
    ytp: ["https://www.youtube.com/@samseamlessnetwork5685"],
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
  "Salvador Technologies": {
    ws: ["https://www.salvador-tech.com"],
    ytc: ["https://www.youtube.com/channel/uc3ytvkx8uidffs-_lfo-xdw"],
    urls: ["https://api.whatsapp.com/send"],
    _processed: "auto"
  },
  Sapiens: {
    ws: [
      "https://careers.sapiens.com",
      "https://content.sapiens.com",
      "https://sapiens.com",
      "https://trust.sapiens.com"
    ],
    li: ["https://www.linkedin.com/company/sapiens"],
    fb: ["https://www.facebook.com/sapiensintcorp"],
    tw: ["https://x.com/sapiensins"],
    ig: ["https://www.instagram.com/sapiensinternational"],
    ytp: ["https://www.youtube.com/@sapiensint"],
    _processed: "auto"
  },
  "Satori Cyber": {
    ws: ["https://app.satoricyber.com", "https://blog.satoricyber.com", "https://satoricyber.com"],
    li: ["https://www.linkedin.com/company/satoricyber"],
    tw: ["https://x.com/satoricyber"],
    ytp: ["https://www.youtube.com/@satoricyber"],
    urls: [
      "https://blog.satoricyber.com",
      "https://www.commvault.com/blogs/commvault-closes-acquisition-of-satori",
      "https://www.g2.com/products/satori-data-security-platform/reviews"
    ],
    _processed: "auto"
  },
  Savvy: {
    ws: [
      "https://community.sailpoint.com",
      "https://developer.sailpoint.com",
      "https://documentation.sailpoint.com",
      "https://go.sailpoint.com",
      "https://investor.sailpoint.com",
      "https://support.sailpoint.com",
      "https://www.sailpoint.com"
    ],
    li: ["https://www.linkedin.com/company/sailpoint-technologies"],
    fb: ["https://www.facebook.com/sailpoint"],
    tw: ["https://x.com/sailpoint"],
    ig: ["https://www.instagram.com/lifeatsailpoint"],
    ytp: ["https://www.youtube.com/@sailpointtechnologies"],
    urls: ["https://sailpoint.wd1.myworkdayjobs.com/SailPoint/jobs"],
    _processed: "auto"
  },
  "Scinai Immunotherapeutics": {
    ws: ["https://www.scinai.com"],
    li: ["https://www.linkedin.com/company/scinai"],
    fb: ["http://facebook.com/ScinaiSCNI"],
    tw: ["http://twitter.com/scinai"],
    ig: ["http://instagram.com/scinai.immunotherapeutics"],
    ytp: ["https://youtube.com/@Scinai"],
    urls: ["https://www.reddit.com/r/Scinai"],
    _processed: "auto"
  },
  "Scopio Labs": {
    ws: ["https://learn.scopiolabs.com", "https://scopiolabs.com", "https://trust.scopiolabs.com"],
    li: ["https://www.linkedin.com/company/scopio-labs"],
    fb: ["https://www.facebook.com/scopiolabs"],
    tw: ["https://x.com/scopio_labs"],
    urls: ["https://scopiolabs.atlassian.net/servicedesk/customer/portal/4/group/77/create/10149"],
    _processed: "auto"
  },
  "Scribe Security": {
    ws: [
      "https://app.scribesecurity.com",
      "https://go.scribesecurity.com",
      "https://scribesecurity.com",
      "https://scribe-security.github.io",
      "https://scribesecurityusers.slack.com"
    ],
    li: ["https://www.linkedin.com/company/scribe-security"],
    tw: ["https://x.com/scribesecurity"],
    gh: ["https://github.com/scribe-public"],
    urls: ["https://www.ltu.co.il"],
    _processed: "auto"
  },
  "Secret Double Octopus": {
    ws: ["https://doubleoctopus.com", "https://go.doubleoctopus.com", "https://support.doubleoctopus.com"],
    li: ["https://www.linkedin.com/company/secret-double-octopus"],
    tw: ["https://x.com/double_octopus"],
    ytp: ["https://www.youtube.com/@secretdoubleoctopus5220"],
    urls: ["https://fidoalliance.org/company/secret-double-octopus", "https://vimeo.com/doubleoctopus"],
    _processed: "auto"
  },
  SeeTree: {
    ws: ["https://myfarm.seetree.ai", "https://www.seetree.ai"],
    li: ["https://www.linkedin.com/company/seetree"],
    tw: ["https://x.com/seetree_ai"],
    ig: ["https://www.instagram.com/seetree_ai"],
    ytc: ["https://www.youtube.com/channel/ucckjsmtcxdou7bdgb2eoysq"],
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
  Sequentify: {
    ws: ["https://www.sequentify.com"],
    li: ["https://www.linkedin.com/company/sequentify"],
    _processed: "auto"
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
  Shield: {
    ws: ["https://kb.shieldfc.com", "https://www.shieldfc.com"],
    li: ["https://www.linkedin.com/company/shieldcommunicationcompliance"],
    tw: ["https://x.com/shield_rbtl"],
    ig: ["https://www.instagram.com/lifeatshield"],
    _processed: "auto"
  },
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
  Simplex: {
    ws: [
      "https://buy.simplex.com",
      "https://integrations.simplex.com",
      "https://payment-status.simplex.com",
      "https://support.simplex.com",
      "https://www.simplex.com",
      "https://simplexcom.medium.com"
    ],
    li: ["https://www.linkedin.com/company/simplexcc"],
    fb: ["https://www.facebook.com/simplex.cc"],
    tw: ["https://x.com/simplexcc"],
    _processed: "auto"
  },
  Simpliigood: {
    ws: ["https://shop.simpliigood.com", "https://simpliigood.com"],
    li: ["https://www.linkedin.com/company/simpliigood"],
    ig: ["https://www.instagram.com/simpliigood.us"],
    _processed: "auto"
  },
  Simply: {
    ws: [
      "https://join-piano.hellosimply.com",
      "https://piano-help.hellosimply.com",
      "https://welcome.hellosimply.com",
      "https://www.hellosimply.com"
    ],
    li: ["https://www.linkedin.com/company/simply-joytunes"],
    fb: ["https://www.facebook.com/hellosimply"],
    tw: ["https://x.com/hellosimply"],
    ig: ["https://www.instagram.com/hellosimply"],
    ytp: ["https://www.youtube.com/c/hellosimply"],
    _processed: "auto"
  },
  Skai: {
    ws: ["https://skai.io"],
    li: ["https://www.linkedin.com/company/skaicommerce"],
    fb: ["https://www.facebook.com/skaicommerce"],
    tw: ["https://x.com/skaicommerce"],
    ig: ["https://www.instagram.com/lifeatskai"],
    ytp: ["https://www.youtube.com/@skaicommerce"],
    urls: ["https://app.kenshoo.com/portal", "https://developers.kenshoo.com", "https://shopable2026.splashthat.com"],
    _processed: "auto"
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
  "Skyline Robotics": {
    ws: ["https://www.skylinerobotics.com"],
    li: ["https://www.linkedin.com/company/skyline-robotics"],
    fb: ["https://www.facebook.com/skylinerobotics"],
    tw: ["https://x.com/roboticskyline"],
    ig: ["https://www.instagram.com/skyline_robotics"],
    ytc: ["https://www.youtube.com/channel/ucp4qalzbcso-cbk8p4dqjfg"],
    _processed: "auto"
  },
  "SofWave Medical": {
    ws: ["https://sofwave.com"],
    li: ["https://www.linkedin.com/company/sofwave"],
    fb: ["https://www.facebook.com/sofwave"],
    tw: ["https://x.com/sofwave"],
    ig: ["https://www.instagram.com/sofwavemed"],
    ytc: ["https://www.youtube.com/channel/uc3ryhvm1crtmu0escgi3fra"],
    tt: ["https://www.tiktok.com/@sofwavemed"],
    _processed: "auto"
  },
  "Sola Security": {
    ws: [
      "https://auth.sola.security",
      "https://docs.sola.security",
      "https://lp.sola.security",
      "https://sola.security",
      "https://trust.sola.security"
    ],
    li: ["https://www.linkedin.com/company/sola-security"],
    tw: ["https://x.com/solasecurity"],
    ytp: ["https://www.youtube.com/@solasecurity"],
    _processed: "auto"
  },
  "SolarEdge Technologiesa": {
    ws: [
      "https://corporate.solaredge.com",
      "https://edgeacademy.solaredge.com",
      "https://installer-portal.solaredge.com",
      "https://investors.solaredge.com",
      "https://knowledge-center.solaredge.com",
      "https://marketing.solaredge.com",
      "https://minisite.solaredge.com",
      "https://www.solaredge.com",
      "https://www.solaredge.co.il",
      "https://www.solaredge.in"
    ],
    li: ["https://www.linkedin.com/company/solaredge"],
    fb: ["https://www.facebook.com/SolaredgePV"],
    tw: ["https://twitter.com/SolarEdgePV"],
    ig: ["https://www.instagram.com/solaredge_dach"],
    ytp: ["https://www.youtube.com/user/SolarEdgePV"],
    urls: ["https://hubs.la/Q02XTTQ10", "https://investors.solaredge.com"],
    _processed: "auto"
  },
  Somite: { tw: "https://x.com/somiteai" },
  Sorbet: { ws: ["https://advance.getsorbet.com"], _processed: "auto" },
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
  Spike: {
    ws: ["https://www.spikenow.com"],
    li: ["https://www.linkedin.com/company/3240452"],
    tw: ["https://x.com/spikenowhq"],
    ig: ["https://www.instagram.com/spikenowhq"],
    ytp: ["https://www.youtube.com/@spikenow"],
    tt: ["https://www.tiktok.com/@spikenow"],
    urls: [
      "https://apps.apple.com/us/app/hop-email-at-the-speed-of-life/id707452888",
      "https://www.g2.com/products/spike"
    ],
    android_app_ids: ["com.pingapp.app"],
    _processed: "auto"
  },
  Stargo: {
    ws: ["https://www.stargo.co"],
    li: ["https://www.linkedin.com/company/stargo-co"],
    fb: ["https://www.facebook.com/stargo.solutions"],
    ig: ["https://www.instagram.com/stargo.think.forward"],
    _processed: "auto"
  },
  "StarkWare Industries": {
    ws: ["https://docs.starkware.co", "https://starkware.co", "https://starknet.io"],
    li: ["http://www.linkedin.com/company/starkware"],
    tw: ["https://twitter.com/StarkWareLtd"],
    gh: ["https://github.com/starkware-libs"],
    ytc: ["https://www.youtube.com/channel/UCnDWguR8mE2oDBsjhQkgbvg"],
    urls: ["https://generatepress.com", "https://medium.com/starkware", "https://www.cairo-lang.org"],
    _processed: "auto"
  },
  "Steakholder Foods": {
    ws: ["https://www.steakholderfoods.com"],
    li: ["https://www.linkedin.com/company/steakholderfoods"],
    fb: ["https://www.facebook.com/steakholderfoods"],
    tw: ["https://x.com/stkhfoods"],
    ig: ["https://www.instagram.com/steakholderfoods"],
    _processed: "auto"
  },
  Stigg: {
    ws: [
      "https://app.stigg.io",
      "https://auth.stigg.io",
      "https://changelog.stigg.io",
      "https://docs.stigg.io",
      "https://security.stigg.io",
      "https://status.stigg.io",
      "https://www.stigg.io"
    ],
    li: ["https://www.linkedin.com/company/getstigg"],
    tw: ["https://x.com/getstigg"],
    ytc: ["https://www.youtube.com/channel/ucvkrw5lnpdla_3pjnmyk5da"],
    _processed: "auto"
  },
  StoreDot: {
    ws: ["https://www.store-dot.com"],
    li: ["https://www.linkedin.com/company/storedot"],
    fb: ["https://www.facebook.com/storedotltd"],
    tw: ["https://x.com/storedotltd"],
    ig: ["https://www.instagram.com/storedot_xfc"],
    ytc: ["https://www.youtube.com/channel/uc5chqsdvuxslokjjp42wmqg"],
    urls: ["https://goo.gl/maps/shPJd5niNA5LsX62A", "https://maps.app.goo.gl/sEhaP5sZy3QUJ2hF7"],
    _processed: "auto"
  },
  SuperBuzz: {
    ws: ["https://analyze.superbuzz.io", "https://app.superbuzz.io", "https://www.superbuzz.io"],
    li: ["https://www.linkedin.com/company/superbuzz-io"],
    fb: ["https://www.facebook.com/superbuzz.aitech"],
    tw: ["https://x.com/superbuzz_io"],
    ig: ["https://www.instagram.com/superbuzz.io"],
    urls: [
      "https://superbuzzhelp.zendesk.com/hc/en-us",
      "https://www.capterra.com/p/277237/SuperBuzz",
      "https://www.softwareadvice.com/push-notifications/superbuzz-profile"
    ],
    _processed: "auto"
  },
  Suridata: {
    ws: ["https://www.suridata.ai"],
    li: ["https://www.linkedin.com/company/suridataai"],
    urls: [
      "https://goo.gl/maps/byo3JGyBjmkNEi556",
      "https://goo.gl/maps/xmeLTgJdhUVmVfibA",
      "https://maps.app.goo.gl/wvn4JHTnyUq43M3V9"
    ],
    _processed: "auto"
  },
  Swapp: {
    ws: ["https://app.swapp.ai", "https://swapp.ai"],
    li: ["https://www.linkedin.com/company/swapp-ai"],
    fb: ["https://www.facebook.com/swapparchitecture"],
    tw: ["https://x.com/swapp_ai"],
    ig: ["https://www.instagram.com/swapp_architecture"],
    _processed: "auto"
  },
  "Sweet Security": {
    ws: ["https://app.sweet.security", "https://hi.sweet.security", "https://www.sweet.security"],
    li: ["https://www.linkedin.com/company/sweet-security"],
    tw: ["https://twitter.com/Sweet_cloud_sec"],
    urls: ["https://join.slack.com/t/sweet-community/shared_invite/zt-20wmxuiwx-jT8Lre4ov24Lml3_puHaOQ"],
    _processed: "auto"
  },
  Sweetch: {
    ws: ["https://www.sweetch.com"],
    li: ["https://www.linkedin.com/company/sweetch"],
    tw: ["https://x.com/sweetchhealth"],
    _processed: "auto"
  },
  Swimm: {
    ws: ["https://app.swimm.io", "https://docs.swimm.io", "https://swimm.io"],
    li: ["https://www.linkedin.com/company/swimm-io"],
    tw: ["https://x.com/swimm_io"],
    gh: ["https://github.com/swimmio"],
    ytc: ["https://www.youtube.com/channel/uc-icyrmhtl3yyxai0tnl7lg"],
    tt: ["https://www.tiktok.com/@swimmfordevs"],
    urls: ["https://plugins.jetbrains.com/plugin/20716-swimm"],
    _processed: "auto"
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
  Syte: {
    ws: ["https://www.syte.ai"],
    li: ["https://www.linkedin.com/company/syte-ai"],
    fb: ["https://www.facebook.com/SyteVisualAI"],
    tw: ["https://twitter.com/SyteAI"],
    ig: ["https://www.instagram.com/syte_ai"],
    ytc: ["https://www.youtube.com/channel/UC14_kcbqdtM2GB2-jeJYFTg"],
    tt: ["https://www.tiktok.com/@syte.ai"],
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
  TailorMed: {
    ws: ["https://go.tailormed.co", "https://resources.tailormed.co", "https://tailormed.co"],
    li: ["https://www.linkedin.com/company/tailormed---medical-journey-innovations"],
    fb: ["https://www.facebook.com/tailormed.co"],
    tw: ["https://x.com/tailormedtweet"],
    ig: ["https://www.instagram.com/tailormed.co"],
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
  TechSee: {
    ws: ["https://techsee.com", "https://techsee.atlassian.net"],
    li: ["https://www.linkedin.com/company/techsee"],
    fb: ["https://www.facebook.com/TechSee-786286871505772", "https://www.facebook.com/profile.php?id=100063770901033"],
    tw: ["https://twitter.com/techsee_me"],
    ytc: ["https://www.youtube.com/channel/UCKoz5028YIn69aQV9W1Mt9g"],
    _processed: "auto"
  },
  Tedooo: {
    ws: ["https://www.tedooo.com"],
    android_app_ids: ["com.mor.tedooo"],
    android_dev_id: "591913365560966627100",
    urls: ["https://apps.apple.com/us/app/tedooo/id1487331226"],
    _processed: "auto"
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
  Tevel: {
    ws: ["https://accounts.tevel-tech.com", "https://www.tevel-tech.com"],
    li: ["https://www.linkedin.com/company/tevel-aerobotics-technologies"],
    tw: ["https://x.com/tevelaerobotics"],
    ytp: ["https://www.youtube.com/@tevelaeroboticstechnologies"],
    urls: ["https://vagas.co.il", "https://vimeo.com/tevel", "https://waze.com"],
    _processed: "auto"
  },
  "The Agro Exchange": { ws: "https://www.agrox.io" },
  Theranica: {
    ws: ["https://theranica.com"],
    li: ["https://www.linkedin.com/company/theranica-bio-electronics"],
    tw: ["https://twitter.com/theranica"],
    urls: [
      "http://nerivio.com",
      "https://app.termly.io/notify/fb6f329a-c246-4b5a-a0f9-045d7a138ed1",
      "https://nerivio.com",
      "https://nerivio.com/get-nerivio",
      "https://www.nerivio.com/indication-safety-information",
      "https://www.nerivio.com/legal/privacy-policy"
    ],
    _processed: "auto"
  },
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
  Tidhar: {
    ws: ["https://tidhar.co.il"],
    fb: ["https://www.facebook.com/tidhargroup"],
    ig: ["https://www.instagram.com/tidhargroup"],
    urls: ["https://tidhar.my.site.com/community", "https://www.dofinity.com"],
    _processed: "auto"
  },
  Tipa: {
    ws: ["https://tipa-corp.com"],
    li: ["https://www.linkedin.com/company/tipa"],
    fb: ["https://www.facebook.com/tipacorp"],
    tw: ["https://x.com/tipacorp"],
    ig: ["https://www.instagram.com/tipacorp"],
    ytc: ["https://www.youtube.com/channel/uc7etns-rhngfspmzube6mhw"],
    urls: ["https://www.pinterest.com/TipaCorp"],
    _processed: "auto"
  },
  "Token Security": {
    ws: ["https://privilege-guardian.ai.token.security", "https://token.security", "https://trust.token.security"],
    li: ["https://www.linkedin.com/company/token-security"],
    tw: ["https://x.com/thetokensec"],
    gh: ["https://github.com/tokensec"],
    ytp: ["https://www.youtube.com/@token.security"],
    _processed: "auto"
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
    ws: [
      "https://towersemi.com",
      "https://careers.towerjazz.com",
      "https://careers.towersemi.com",
      "https://ir.towersemi.com",
      "https://jp.towersemi.com",
      "https://portal-usa.towersemi.com",
      "https://portal.towersemi.com"
    ],
    li: ["https://www.linkedin.com/company/tower-semiconductor"],
    fb: ["https://www.facebook.com/towersemi"],
    ytc: ["https://www.youtube.com/channel/UCMuFZQ2f2DjFPfertm16gYg"],
    urls: ["https://mp.weixin.qq.com/s/7zBZHhIXQHAGtJfzymMnlQ"],
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
  "Trail Security": {
    ws: ["https://www.cyera.com"],
    li: ["https://www.linkedin.com/company/cyera"],
    tw: ["https://x.com/cyera_io"],
    ytc: ["https://www.youtube.com/channel/ucqzhczie6xrdjckfzzwpbcg"],
    urls: ["https://portal.datasecai.io/hc", "https://security.cyera.io", "https://www.cyera.io/legal/privacy-policy"],
    _processed: "auto"
  },
  Travelier: {
    ws: [
      "https://www.travelier.com",
      "https://12go.asia",
      "https://www.plataforma10.com.ar",
      "https://deonibus.com",
      "http://traveling.com",
      "https://sisorg.com",
      "https://www.seatos.com"
    ],
    li: [
      "https://www.linkedin.com/company/12go-asia",
      "https://www.linkedin.com/company/bookaway",
      "https://www.linkedin.com/company/de-onibus",
      "https://www.linkedin.com/company/plataforma10",
      "https://www.linkedin.com/company/sisorg",
      "https://www.linkedin.com/company/travelier-group",
      "https://www.linkedin.com/company/travelingcom"
    ],
    ig: [
      "https://www.instagram.com/12go_com",
      "https://www.instagram.com/bookaway",
      "https://www.instagram.com/euviajodeonibus",
      "https://www.instagram.com/plataforma10argentina",
      "https://www.instagram.com/sisorgsrl",
      "https://www.instagram.com/traveliergroup",
      "https://www.instagram.com/travelingcom_official"
    ],
    ytp: [
      "https://www.youtube.com/@12gocom",
      "https://www.youtube.com/@bookaway_travel",
      "https://www.youtube.com/@get-by"
    ],
    tt: ["https://www.tiktok.com/@bookaway", "https://www.tiktok.com/@travelingcomofficial"],
    urls: [
      "https://12go.com",
      "https://12go.com/about",
      "https://12go.com/jobs",
      "https://agent.12go.com",
      "https://deonibus.com",
      "https://deonibus.com/quem-somos",
      "https://deonibus.com/trabalhe-conosco",
      "https://op.12go.asia",
      "https://seatos.com",
      "https://traveling.com/en",
      "https://traveling.com/en/blog",
      "https://traveling.com/en/blog/jobs",
      "https://traveling.com/en/for-bus-companies",
      "https://www.bookaway.com",
      "https://www.bookaway.com/about",
      "https://www.bookaway.com/blog",
      "https://www.bookaway.com/careers",
      "https://www.bookaway.com/partners",
      "https://www.plataforma10.com.ar",
      "https://www.plataforma10.com.ar/blog",
      "https://www.plataforma10.com.ar/empleos",
      "https://www.plataforma10.com.ar/que-es-plataforma-10",
      "https://www.sisorg.com",
      "https://www.sisorg.com//clientes",
      "https://www.sisorg.com/sobre-nosotros"
    ],
    _processed: "auto"
  },
  "Tre Capital GP Ltd": { tw: [""] },
  Tres: {
    ws: ["https://help.tres.finance", "https://tres.finance", "https://trustcenter.tres.finance"],
    li: ["https://www.linkedin.com/company/tresfinance"],
    tw: ["https://x.com/tresdotfinance"],
    _processed: "auto"
  },
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
  Trustmi: {
    ws: ["https://portal.trustmi.ai", "https://trustmi.ai"],
    li: ["https://www.linkedin.com/company/trustmi-ai"],
    urls: [
      "https://apply.workable.com/trustmi",
      "https://trustmi.webflow.io/privacy-policy",
      "https://www.prnewswire.com/news-releases/trustmi-named-winner-of-the-coveted-top-infosec-innovator-awards-for-2025-302596439.html"
    ],
    _processed: "auto"
  },
  Twine: {
    ws: ["https://www.twinesecurity.com"],
    li: ["https://www.linkedin.com/company/twinesecurity"],
    tw: ["https://x.com/twinesecurity"],
    _processed: "auto"
  },
  "UBQ Materials": {
    ws: ["https://www.ubqmaterials.com"],
    li: ["https://www.linkedin.com/company/ubq-materials"],
    fb: ["https://www.facebook.com/UBQMaterials"],
    tw: ["https://twitter.com/UBQ_Materials"],
    ig: ["https://www.instagram.com/ubq_materials"],
    ytc: ["https://www.youtube.com/channel/UCDJidIDfuy0bzJT6GocaCrA"],
    _processed: "auto"
  },
  UltraSight: {
    ws: ["https://ultrasight.com"],
    li: ["https://linkedin.com/company/ultrasightai"],
    tw: ["https://twitter.com/UltraSightAI"],
    urls: ["https://etyhadar.com"],
    _processed: "auto"
  },
  "Upstream Security": {
    ws: ["https://info.upstream.auto", "https://upstream.auto"],
    li: ["https://www.linkedin.com/company/upstream-security"],
    fb: ["https://www.facebook.com/stage.upstream.auto"],
    tw: ["https://x.com/upstreamauto"],
    ig: ["https://www.instagram.com/upstreamsecurity"],
    ytc: ["https://www.youtube.com/channel/uc82mow-55ge7wzl643ind-q"],
    urls: ["https://upstreamsecurity.atlassian.net/servicedesk/customer/portal/2/user/login"],
    _processed: "auto"
  },
  "Urban Aeronautics": {
    ws: ["https://www.urbanaero.com"],
    li: ["https://www.linkedin.com/company/urban-aeronautics"],
    fb: ["https://www.facebook.com/RealUrbanAero"],
    tw: ["https://twitter.com/realurbanaero"],
    ytc: ["https://www.youtube.com/channel/UCY0m6apxo-2zP3N3Zx8ydaA"],
    _processed: "auto"
  },
  Utila: {
    ws: [
      "https://console.utila.io",
      "https://docs.utila.io",
      "https://status.utila.io",
      "https://support.utila.io",
      "https://utila.io",
      "https://utila.beehiiv.com"
    ],
    li: ["https://www.linkedin.com/company/utila-io"],
    tw: ["https://twitter.com/utila_io"],
    urls: ["https://www.comeet.com/jobs/utila/D9.00F"],
    _processed: "auto"
  },
  "V-Wave": {
    ws: ["https://vwavemedical.com"],
    li: ["https://www.linkedin.com/company/johnson-&-johnson-medtech"],
    urls: ["https://www.relieve-hf.info"],
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
  "Valens Semiconductor": {
    ws: ["https://investors.valens.com", "https://www.valens.com"],
    li: ["https://www.linkedin.com/company/valens"],
    fb: ["https://www.facebook.com/valenssemiconductor"],
    tw: ["https://x.com/valenssemi"],
    ig: ["https://www.instagram.com/lifeatvalens"],
    ytc: ["https://www.youtube.com/channel/uc3kg2a4fmripwn3fcvnbvxa"],
    urls: ["https://www.valens.com"],
    _processed: "auto"
  },
  Valerann: {
    ws: ["https://valerann.com"],
    li: ["https://www.linkedin.com/company/valerann"],
    tw: ["https://x.com/valerann_ltd"],
    _processed: "auto"
  },
  Vee: {
    ws: ["https://team.vee.com", "https://www.vee.com"],
    li: ["https://www.linkedin.com/company/veeai"],
    fb: ["https://www.facebook.com/veeapps"],
    ig: ["https://www.instagram.com/vee.aiforgood"],
    ytp: ["https://www.youtube.com/@vee.channel"],
    _processed: "auto"
  },
  Velox: { ws: ["https://velox-digital.com"], _processed: "auto" },
  Vendict: {
    ws: ["https://myapp.vendict.com", "https://trust.vendict.com", "https://vendict.com"],
    li: ["https://www.linkedin.com/company/vendict"],
    tw: ["https://x.com/vendict_ai"],
    ytp: ["https://www.youtube.com/@vendict7363"],
    urls: ["https://trust.vendict.com"],
    _processed: "auto"
  },
  Veriti: {
    ws: ["https://www.veriti.ai"],
    li: ["https://www.linkedin.com/company/veriti-security"],
    tw: ["https://twitter.com/VERITISECURITY"],
    _processed: "auto"
  },
  Videocites: {
    ws: ["https://www.rippleanalytics.com"],
    li: ["https://www.linkedin.com/company/rippleanalytics"],
    _processed: "auto"
  },
  VineSight: {
    ws: ["https://blog.vinesight.com", "https://www.vinesight.com"],
    urls: ["https://vinesight-20319268.hs-sites.com/webinar-the-blindspot-threat"],
    _processed: "auto"
  },
  "Visual Layer": {
    ws: ["https://app.visual-layer.com", "https://docs.visual-layer.com", "https://www.visual-layer.com"],
    li: ["https://www.linkedin.com/company/visual-layer"],
    gh: ["https://github.com/visual-layer"],
    ytp: ["https://www.youtube.com/@visual-layer"],
    urls: ["https://discord.com/invite/tkYHJCA7mb"],
    _processed: "auto"
  },
  Voxia: {
    ws: ["https://www.voxia.ai"],
    li: ["https://www.linkedin.com/company/37429937"],
    fb: ["https://www.facebook.com/voxiaai"],
    _processed: "auto"
  },
  Voyantis: {
    ws: ["https://www.voyantis.ai"],
    li: ["https://www.linkedin.com/company/66924899"],
    fb: ["https://www.facebook.com/voyantis"],
    tw: ["https://twitter.com/Voyantis1"],
    ytp: ["https://www.youtube.com/@Voyantis-ai"],
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
  Wasteless: {
    ws: ["https://www.wasteless.com"],
    li: ["https://www.linkedin.com/company/wasteless-ltd"],
    _processed: "auto"
  },
  WaveBL: {
    ws: ["https://coa.wavebl.com", "https://register.wavebl.com", "https://wavebl.com", "https://wsupport.wavebl.com"],
    li: ["https://www.linkedin.com/company/wavebl"],
    tw: ["https://x.com/wavebl"],
    ytp: ["https://www.youtube.com/@wavebl7286"],
    _processed: "auto"
  },
  "Wearable Devices": {
    ws: ["https://www.wearabledevices.co.il"],
    li: ["https://www.linkedin.com/company/wearable-devices-ltd"],
    ytp: ["https://www.youtube.com/@mudraband"],
    urls: ["https://www.google.com/maps/search/Hatnufa+5+,+Yokneam+Illit,+Israel"],
    _processed: "auto"
  },
  Wenrix: {
    ws: ["https://docs.wenrix.com", "https://www.wenrix.com"],
    urls: [
      "https://docs.wenrix.com",
      "https://whizar.auth0.com/u/login/identifier",
      "https://www.wenrix.com",
      "https://www.wenrix.com/about-us",
      "https://www.wenrix.com/blog",
      "https://www.wenrix.com/careers",
      "https://www.wenrix.com/contact",
      "https://www.wenrix.com/otas",
      "https://www.wenrix.com/platform",
      "https://www.wenrix.com/press-release",
      "https://www.wenrix.com/privacy-policy",
      "https://www.wenrix.com/tcs",
      "https://www.wenrix.com/tmcs",
      "https://www.wenrix.com/wenrix-deepflow",
      "https://www.wenrix.com/wenrix-faresight",
      "https://www.wenrix.com/wenrix-flexengine"
    ],
    _processed: "auto"
  },
  "Wib Security": {
    ws: [
      "https://account.f5.com",
      "https://brand.f5.com",
      "https://clouddocs.f5.com",
      "https://community.f5.com",
      "https://docs.cloud.f5.com",
      "https://education.f5.com",
      "https://investors.f5.com",
      "https://my.f5.com",
      "https://partnercentral.f5.com",
      "https://www.f5.com"
    ],
    li: ["https://www.linkedin.com/company/f5"],
    fb: ["https://www.facebook.com/f5incorporated"],
    tw: ["https://x.com/f5"],
    ig: ["https://www.instagram.com/f5.global"],
    ytp: ["https://www.youtube.com/@f5networksinc"],
    urls: ["https://aws.amazon.com/marketplace/pp/prodview-tbq5doesd2zee", "https://www.f5.com.cn"],
    _processed: "auto"
  },
  Wiliot: {
    ws: ["https://www.wiliot.com"],
    li: ["https://www.linkedin.com/company/wiliot"],
    fb: ["https://www.facebook.com/WiliotHQ"],
    _processed: "auto"
  },
  Windward: {
    ws: ["https://developer.windward.ai", "https://windward.ai"],
    li: ["https://www.linkedin.com/company/windward-ltd-"],
    fb: ["https://www.facebook.com/WindwardMaritimeAI"],
    tw: ["https://x.com/WindwardAI"],
    ytc: ["https://www.youtube.com/channel/UCRiZ6MI5mP_oLWwnnblB1KA/videos"],
    _processed: "auto"
  },
  "Wing Security": {
    ws: ["https://mc.wing.security", "https://wing.security"],
    li: ["https://www.linkedin.com/company/wing-security"],
    tw: ["https://twitter.com/WingSecSaaS"],
    ytc: ["https://www.youtube.com/channel/UCxms9MOlzm3FkYv2NvE_aBw"],
    _processed: "auto"
  },
  Winn: {
    ws: ["https://app.winn.ai", "https://trust.winn.ai", "https://winn.ai"],
    li: ["https://www.linkedin.com/company/winnai"],
    tw: ["https://x.com/winn_sales"],
    ig: ["https://www.instagram.com/life.at.winn.ai"],
    _processed: "auto"
  },
  "Wisdo Health": {
    ws: ["https://resources.wisdo.com", "https://wisdo.com"],
    li: ["https://www.linkedin.com/company/wisdo"],
    fb: ["https://www.facebook.com/wearewisdo"],
    tw: ["https://x.com/wisdo_health"],
    ig: ["https://www.instagram.com/wisdo_health"],
    urls: [
      "https://esalf1h4a4p.typeform.com/to/JLTeZcN2",
      "https://gdpr-info.eu",
      "https://itunes.apple.com/app/wisdo-your-guide-for-life/id1273601356",
      "https://us.aicpa.org/interestareas/frc/assuranceadvisoryservices/aicpasoc2report",
      "https://www.hhs.gov/hipaa/for-professionals/privacy/laws-regulations/index.html"
    ],
    android_app_ids: ["com.wisdo.android.wisdo"],
    _processed: "auto"
  },
  Wisor: {
    ws: ["https://app.wisor.ai", "https://wisor.ai"],
    li: ["https://www.linkedin.com/company/wisorai"],
    ytp: ["https://www.youtube.com/@wisor-ai"],
    urls: ["https://lp.getwisor.com/wisor-and-cargo-ai-webinar"],
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
  "Xsight Labs": {
    ws: ["https://xsightlabs.com"],
    li: ["https://www.linkedin.com/company/xsightlabs"],
    tw: ["https://x.com/XsightLabs"],
    _processed: "auto"
  },
  Xyte: {
    ws: ["https://www.xyte.ai"],
    li: ["https://www.linkedin.com/company/xyte"],
    fb: ["https://www.facebook.com/xyte.io"],
    ig: ["https://www.instagram.com/xyte.io"],
    ytp: ["https://www.youtube.com/@xytexaas"],
    urls: ["https://dev.xyte.io", "https://meetings.hubspot.com/xyte/website-demo-ash", "https://updates.xyte.io"],
    _processed: "auto"
  },
  "ZOOZ Power": {
    ws: ["https://ir.zoozpower.com", "https://treasury.zoozpower.com", "https://www.zoozpower.com"],
    li: ["https://www.linkedin.com/company/zooz-power"],
    tw: ["https://x.com/share", "https://x.com/zoozpowerglobal"],
    ytc: ["https://www.youtube.com/channel/ucpr6cjt8g71582vynhcteha"],
    _processed: "auto"
  },
  Zengo: {
    ws: [
      "https://business.zengo.com",
      "https://help.zengo.com",
      "https://web.zengo.com",
      "https://zengo.com",
      "https://thezencryptoshow.transistor.fm"
    ],
    li: ["https://www.linkedin.com/company/zengo"],
    tw: ["https://www.twitter.com/zengo"],
    gh: ["https://github.com/Zengo-X"],
    ytp: ["https://www.youtube.com/@ZengoWallet", "https://www.youtube.com/c/ZenGoWallet"],
    urls: [
      "https://apps.apple.com/us/app/zengo-crypto-bitcoin-wallet/id1440147115",
      "https://discord.gg/zengo",
      "https://medium.com/zengo",
      "https://www.reddit.com/r/ZengoWallet",
      "https://zengo.onelink.me/uCxL/3f57e09e",
      "https://zengo.onelink.me/uCxL/66788ce",
      "https://zengo.onelink.me/uCxL/8cf0f98d"
    ],
    android_app_ids: ["com.zengo.wallet"],
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
  accessiBe: {
    ws: [
      "https://accessibe.com",
      "https://dashboard.accessibe.com",
      "https://support.accessibe.com",
      "https://trust.accessibe.com"
    ],
    li: ["https://www.linkedin.com/company/accessibe"],
    fb: ["https://www.facebook.com/accessibe"],
    tw: ["https://x.com/accessibe"],
    ig: ["https://www.instagram.com/accessibe_community"],
    ytp: ["https://www.youtube.com/@accessibe"],
    _processed: "auto"
  },
  aiOla: {
    ws: ["https://aiola.ai", "https://trust.aiola.ai"],
    li: ["https://www.linkedin.com/company/aiola"],
    tw: ["https://x.com/_aiOla"],
    ytp: ["https://www.youtube.com/@aiOla_"],
    urls: ["https://bit.ly/492GAV7", "https://bit.ly/49fHvjP", "https://bit.ly/4beHmj3", "https://bit.ly/4seWBP7"],
    _processed: "auto"
  },
  bananaz: {
    ws: ["https://go.bananaz.ai", "https://pages.bananaz.ai", "https://www.bananaz.ai"],
    li: ["https://www.linkedin.com/company/bananaz-ai"],
    ytp: ["https://www.youtube.com/@bananaz-ai"],
    urls: ["https://www.aicpa-cima.com/resources/download/soc-for-service-organizations-engagements-overview"],
    _processed: "auto"
  },
  "daily.dev": {
    ws: [
      "https://api.daily.dev",
      "https://app.daily.dev",
      "https://brand.daily.dev",
      "https://business.daily.dev",
      "https://daily.dev",
      "https://docs.daily.dev",
      "https://r.daily.dev",
      "https://recruiter.daily.dev",
      "https://www.dailydevstatus.com",
      "https://store.daily.dev"
    ],
    tw: ["https://x.com/dailydotdev"],
    ig: ["https://www.instagram.com/dailydotdev"],
    gh: ["https://github.com/dailydotdev"],
    tt: ["https://www.tiktok.com/@dailydotdev"],
    urls: [
      "https://addons.mozilla.org/en-US/firefox/addon/daily",
      "https://app.daily.dev/squads/daily_updates",
      "https://apps.apple.com/app/daily-dev/id6740634400",
      "https://chrome.google.com/webstore/detail/dailydev-the-homepage-dev/jlmpjdjjbgclbocgajdjefcidcncaied",
      "https://microsoftedge.microsoft.com/addons/detail/dailydev-the-homepage-/cbdhgldgiancdheindpekpcbkccpjaeb",
      "https://www.meetup.com/the-monthly-dev-world-class-talks-by-expert-developers",
      "https://www.producthunt.com/products/daily-dev"
    ],
    android_app_ids: ["dev.daily"],
    _processed: "auto"
  },
  deepdub: {
    ws: ["https://app.deepdub.ai", "https://deepdub.ai"],
    li: ["https://www.linkedin.com/company/deepdub-ai"],
    fb: ["https://facebook.com/deepdub.ai.company"],
    tw: ["https://twitter.com/deepdub_ai"],
    ytc: ["https://www.youtube.com/channel/UC4yRa2dcdz7I2l2eag_DefQ"],
    _processed: "auto"
  },
  "eSelf AI": {
    ws: [
      "https://corp.kaltura.com",
      "https://developer.kaltura.com",
      "https://eventplatform.kaltura.com",
      "https://investors.kaltura.com",
      "https://kmc.kaltura.com",
      "https://knowledge.kaltura.com",
      "https://learning.kaltura.com",
      "https://learning.mediaspace.kaltura.com",
      "https://real-time-agentic-avatars-are-here.events.kaltura.com",
      "https://subscription.kaltura.com",
      "https://studio.avatar.us.kaltura.ai",
      "https://videos.kaltura.com"
    ],
    li: ["https://www.linkedin.com/company/kaltura"],
    fb: ["https://www.facebook.com/Kaltura"],
    tw: ["https://twitter.com/kaltura"],
    ig: ["https://www.instagram.com/kaltura"],
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
    android_app_ids: ["eToro"],
    urls: ["https://apps.apple.com/us/developer/etoro/id491658374"],
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
  fintastic: {
    ws: ["https://fintastic.ai"],
    li: ["https://www.linkedin.com/company/fintastic-ai"],
    urls: ["https://fintastic.freshteam.com/jobs"],
    _processed: "auto"
  },
  "frontline.io": {
    ws: ["https://helpdesk.frontline.io", "https://login.frontline.io", "https://www.frontline.io"],
    li: ["https://www.linkedin.com/company/5205929", "https://www.linkedin.com/company/ll-software"],
    tw: ["https://x.com/frontlineio"],
    urls: [
      "https://apps.apple.com/us/app/frontline-io/id1620216242",
      "https://apps.microsoft.com/store/detail/frontlineio-platform/XP8LD96319Z2HH",
      "https://dizr.agency",
      "https://frontlinehelpdesk.zohodesk.com/portal/en/home",
      "https://vimeo.com/user175631859"
    ],
    android_app_ids: ["com.LLS.FrontlineAR"],
    _processed: "auto"
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
  "i-BrainTech": {
    ws: ["https://play.i-brain.tech", "https://www.i-brain.tech"],
    li: ["https://www.linkedin.com/company/i-braintech"],
    fb: ["https://www.facebook.com/ibraintechofficial"],
    ig: ["https://www.instagram.com/ibraintech"],
    ytp: ["https://www.youtube.com/@i-braintech6306"],
    _processed: "auto"
  },
  illumex: {
    ws: ["https://illumex.ai"],
    li: ["https://www.linkedin.com/company/illumexai"],
    tw: ["https://x.com/illumexai"],
    ig: ["https://www.instagram.com/illumex.ai"],
    ytp: ["https://www.youtube.com/@illumexai"],
    urls: [
      "https://embed-ssl.wistia.com/deliveries/3bd772b9e47078602160289eae13ace56c554e65.bin",
      "https://embed-ssl.wistia.com/deliveries/dea4982343241bb22bd9356d9237707163e19219.bin",
      "https://www.threads.net/@illumex.ai"
    ],
    _processed: "auto"
  },
  infiniDome: {
    ws: ["https://infinidome.com"],
    li: ["https://www.linkedin.com/company/gps-dome-ltd"],
    ytc: ["https://www.youtube.com/channel/UCzEL6tkHGC-HqtfQitkgDew"],
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
  },
  myInterview: {
    ws: ["https://blog.radancy.com", "https://www.radancy.com"],
    li: ["https://www.linkedin.com/company/radancy"],
    fb: ["https://www.facebook.com/radancy"],
    ig: ["https://www.instagram.com/radancyco"],
    ytp: ["https://www.youtube.com/@radancy"],
    urls: ["https://dashboard.myinterview.com/login", "https://support.radancy.net/hc/en-us"],
    _processed: "auto"
  },
  "nSure.ai": {
    ws: ["https://nsure.ai"],
    li: ["https://www.linkedin.com/company/nsureai"],
    tw: ["https://x.com/nsureai"],
    _processed: "auto"
  },
  proteanTecs: {
    ws: ["https://customers.proteantecs.com", "https://go.proteantecs.com", "https://www.proteantecs.com"],
    li: ["https://www.linkedin.com/company/proteantecs"],
    fb: ["https://www.facebook.com/proteanTecs"],
    tw: ["https://twitter.com/ProteanTecs"],
    ig: ["https://www.instagram.com/proteantecs"],
    ytc: ["https://www.youtube.com/channel/UCy-iC3bfYrosKyJDH1SFqlg"],
    _processed: "auto"
  }
}
