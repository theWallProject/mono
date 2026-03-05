import { ManualOverrideFields } from "../../types"
import { EntryMeta } from "../validate/types"

export const manualOverrides: Record<
  string,
  | ManualOverrideFields
  | { _meta: EntryMeta }
  | (ManualOverrideFields & { _meta: EntryMeta })
  | (ManualOverrideFields & { urls?: string[] })
  | (ManualOverrideFields & { _meta: EntryMeta; urls?: string[] })
> = {
  "01 Founders": { li: "https://www.linkedin.com/school/01-founders" },
  "100X": { ws: ["https://get100x.com"], urls: ["https://dany.ai"], _meta: { isHomepage: true, isVerified: true } },
  "101 Therapeutics": { ws: ["https://101therapeutics.com"], _meta: { isHomepage: true, isVerified: true } },
  "1E Therapeutics": {
    ws: ["https://1etx.com"],
    urls: ["https://www.pearlcom.co.il"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "3DBattery": {
    ws: ["https://3dbattery.co.il"],
    li: ["https://www.linkedin.com/company/3d-battery"],
    _meta: { isHomepage: true }
  },
  "3d Signals": {
    ws: ["https://3dsignals.com"],
    li: ["https://www.linkedin.com/company/3dsignals"],
    fb: ["https://www.facebook.com/3dsignals"],
    tw: ["https://x.com/3dsignals"],
    ytc: ["https://www.youtube.com/channel/uczyjpabddohxtm9_4c0ryjq"],
    urls: ["https://dview.3dsignals.io", "https://www.xing.com/companies/3dsignals"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "4M Analytics": {
    ws: ["https://4map.4manalytics.com", "https://help.4manalytics.com", "https://www.4manalytics.com"],
    li: ["https://www.linkedin.com/company/4m-analytics"],
    ytp: ["https://www.youtube.com/@4m-analytics"],
    urls: ["https://open.spotify.com/show/21oVqvA6id4pM7EYTEDAqB"],
    _meta: { isHomepage: true, isVerified: true }
  },
  ADASKY: {
    ws: ["https://www.adasky.com"],
    li: ["https://www.linkedin.com/company/adasky"],
    ytc: ["https://www.youtube.com/channel/ucioha19ovggip7_gkbce-pa"],
    urls: ["http://www.thebunch.co.il", "http://www.tipoos.com"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isVerified: true, isBrowserVerified: true }
  },
  "AIR VEV": {
    ws: ["https://www.airev.aero"],
    li: ["https://www.linkedin.com/company/air-ev"],
    fb: ["https://www.facebook.com/airevtol"],
    tw: ["https://x.com/AirEvtol"],
    ig: ["https://www.instagram.com/airevtol"],
    ytc: ["https://www.youtube.com/channel/UCjD8Me28M91f_R04Zmmkv2Q"],
    _meta: { isHomepage: true, isVerified: true }
  },
  AISAP: {
    ws: ["https://aisap.ai"],
    li: ["https://www.linkedin.com/company/aisap.ai"],
    _meta: { isHomepage: true, isVerified: true }
  },
  APEX: { ws: ["https://www.dot-training.org"], _meta: { isHomepage: true, isVerified: true } },
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
    _meta: { isHomepage: true, isVerified: true }
  },
  "ART MEDICAL": {
    ws: ["https://artmedical.com"],
    li: ["https://www.linkedin.com/company/artmedicalltd"],
    fb: ["https://www.facebook.com/artmedicalltd"],
    tw: ["https://x.com/artmedicalltd"],
    ig: ["https://www.instagram.com/artmedicalltd"],
    _meta: { isHomepage: true, isVerified: true }
  },
  ASOCS: {
    ws: ["https://asocscloud.com", "https://portal.asocscloud.com"],
    li: ["https://www.linkedin.com/company/asocs"],
    fb: ["https://www.facebook.com/asocscloud"],
    tw: ["https://x.com/asocscloud"],
    ytc: ["https://www.youtube.com/channel/ucndyvwxref1tc1nxzot2rwq"],
    urls: ["https://www.careers-page.com/asocs"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "ATLASense Biomed Ltd.": {
    ws: ["https://atlasensebiomed.com"],
    li: ["https://www.linkedin.com/company/atlasensebiomed"],
    fb: ["https://www.facebook.com/atlasense"],
    _meta: { isHomepage: true, isVerified: true }
  },
  AU10TIX: {
    li: ["https://www.linkedin.com/company/au10tix-limited"],
    fb: ["https://www.facebook.com/Au10tix"],
    tw: ["https://x.com/AU10TIXLimited"],
    ig: ["https://www.instagram.com/life_at_au10tix"],
    gh: ["https://github.com/au10tixmobile"],
    urls: ["https://play.google.com/store/apps/developer?id=Au10tix"],
    android_dev_id: "com.au10tix",
    _meta: { isVerified: true, isBrowserVerified: true }
  },
  "Accelario Software": {
    ws: ["https://accelario.com"],
    li: ["https://www.linkedin.com/company/accelario"],
    tw: ["https://x.com/accelario2"],
    ytp: ["https://www.youtube.com/@accelario"],
    urls: ["https://www.g2.com/products/accelario-accelario/reviews"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Accellix: {
    ws: ["https://www.accellix.com"],
    li: ["https://www.linkedin.com/company/accellix"],
    tw: ["https://x.com/accellix"],
    ytc: ["https://www.youtube.com/channel/ucnbpe-vvwl3qrom4seczjjg"],
    urls: [
      "https://deliciousdesign.com",
      "https://www.google.com/maps/place/2385+Bering+Dr,+San+Jose,+CA+95131/@37.3828415,-121.9228255,17z/data=!3m1!4b1!4m5!3m4!1s0x808fcbe6a7d5241b:0xf53ad7df1604e6c4!8m2!3d37.3828373!4d-121.9206315",
      "https://www.google.com/maps/place/Shlomo+Momo+ha-Levi+St+5,+Jerusalem,+Israel/@31.8015678,35.20519,17z/data=!3m1!4b1!4m5!3m4!1s0x1502d6193f5fadef:0x79f3e247ce5863d0!8m2!3d31.8015633!4d35.207384"
    ],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Acclym (formerly Agritask)": {
    ws: ["https://www.acclym.com"],
    li: ["https://www.linkedin.com/company/acclym"],
    fb: ["https://www.facebook.com/acclym"],
    tw: ["https://x.com/acclym"],
    ytp: ["https://www.youtube.com/@acclym"],
    urls: ["https://acclym.careers.hibob.com", "https://apps.apple.com/mt/app/agritask/id1541627178"],
    android_app_ids: ["com.agritask.mobile.android"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  Addressable: {
    ws: ["https://app.addressable.io", "https://www.addressable.io"],
    li: ["https://www.linkedin.com/company/addressableio"],
    tw: ["https://x.com/addressableid"],
    ytp: ["https://www.youtube.com/@addressable"],
    urls: ["https://warpcast.com/addressableio"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  Aidoc: {
    fb: ["https://www.facebook.com/aidocmed"],
    tw: ["https://x.com/aidocmed"],
    ytp: ["https://www.youtube.com/@AidocAI"],
    urls: ["https://apps.apple.com/us/developer/aidoc-medical-ltd/id1459219008"],
    _meta: { isVerified: true, isBrowserVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  AirEye: {
    ws: ["https://aireye.tech"],
    li: ["https://www.linkedin.com/company/aireye"],
    urls: ["https://aireye.tech"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Airobotics: {
    ws: ["https://www.airoboticsdrones.com"],
    li: ["https://www.linkedin.com/company/airobotics"],
    fb: ["https://www.facebook.com/airoboticsUAV"],
    tw: ["https://mobile.twitter.com/AiroboticsUAV"],
    ig: ["https://instagram.com/airoboticsuav"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  "Aleph Farms": {
    ws: ["https://aleph-farms.com"],
    li: ["https://www.linkedin.com/company/aleph-farms"],
    fb: ["https://www.facebook.com/alephfarms"],
    tw: ["https://x.com/alephfarms"],
    ig: ["https://www.instagram.com/alephcuts"],
    ytc: ["https://www.youtube.com/channel/uc0sesi9gxry9lgedgwg2seg"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Alison AI": {
    ws: ["https://alison.ai", "https://app.alison.ai"],
    li: ["https://www.linkedin.com/company/alison-ai"],
    fb: ["https://www.facebook.com/officialalisonai"],
    tw: ["https://x.com/alisonai_"],
    ig: ["https://www.instagram.com/alisonai_"],
    ytp: ["https://www.youtube.com/@alisonai"],
    _meta: { isHomepage: true, isVerified: true }
  },
  AllCloud: {
    ws: ["https://allcloud.io", "https://engage.allcloud.io"],
    li: ["https://www.linkedin.com/company/allcloud"],
    fb: ["https://www.facebook.com/allcloud.io"],
    tw: ["https://x.com/_allcloud"],
    ytp: "https://www.youtube.com/user/emindcloud",
    _meta: { isHomepage: true, isVerified: true }
  },
  "Alpha Omega": {
    ws: ["https://www.alphaomega-eng.com"],
    li: ["https://www.linkedin.com/company/alpha-omega"],
    fb: ["https://www.facebook.com/AlphaOmegaEngineering"],
    tw: ["https://twitter.com/alphaomegaeng"],
    ytc: ["https://www.youtube.com/channel/UCvBEScA5xf3qLgeL5cRUhOQ"],
    urls: ["http://www.catom.com"],
    ytp: ["https://www.youtube.com/@alphaomegaengineering620"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Alpha Tau Medical": {
    ws: ["https://www.alphatau.com"],
    li: ["https://www.linkedin.com/company/10538741"],
    fb: ["https://www.facebook.com/AlphaTauMedical"],
    ytc: ["http://www.youtube.com/channel/UCMmWvVwo1iEaQbncaIrK1PQ"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Alphabiome.ai": {
    ws: ["https://www.alphabiome.ai"],
    urls: ["https://www.alphabiome.ai", "https://www.moveo.group"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Amai Proteins": {
    ws: ["https://amaiproteins.com"],
    li: ["https://www.linkedin.com/company/amai-proteins"],
    ig: ["https://www.instagram.com/sweetsweelin"],
    ytc: ["https://www.youtube.com/channel/uc7uyb19mxqd-d-uyamtvjrq"],
    urls: ["https://amaiproteins.com"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Amplication: {
    ws: ["https://amplication.com", "https://app.amplication.com", "https://docs.amplication.com"],
    gh: ["https://github.com/amplication"],
    _meta: { isHomepage: true }
  },
  Anagog: {
    ws: ["https://docs.intenthq.com", "https://intenthq.com"],
    li: ["https://www.linkedin.com/company/intenthq"],
    tw: ["https://x.com/weareintenthq"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  "Any.do": {
    ws: [
      "https://app.any.do",
      "https://electron-app.any.do",
      "https://static.any.do",
      "https://support.any.do",
      "https://whatsapp.any.do",
      "https://www.any.do"
    ],
    li: ["https://www.linkedin.com/company/any.do"],
    fb: ["https://www.facebook.com/any.do"],
    tw: ["https://x.com/anydo"],
    ig: ["https://www.instagram.com/anydo"],
    ytp: ["https://www.youtube.com/@anydo"],
    tt: ["https://www.tiktok.com/@anydoapp"],
    urls: [
      "https://addons.mozilla.org/en-US/firefox/addon/any-do-for-firefox",
      "https://any-do.breezy.hr",
      "https://appgallery.huawei.com",
      "https://apps.apple.com/md/app/any-do-for-safari/id6475350661",
      "https://apps.apple.com/us/app/any-do-to-do-list-calendar/id497328576",
      "https://chrome.google.com/webstore/detail/anydo-extension/kdadialhpiikehpdeejjeiikopddkjem",
      "https://itunes.apple.com/us/app/any-do-to-do-list-calendar/id497328576",
      "https://microsoftedge.microsoft.com/addons/detail/anydo/cmpihamlofcdeaflimjioggfgiapcebl",
      "https://slack.com/oauth/v2/authorize",
      "https://workspace.google.com/marketplace/app/anydo_for_gmail/38800197956"
    ],
    android_app_ids: ["com.anydo"],
    _meta: { isHomepage: true }
  },
  AnyClip: {
    ws: ["https://anyclip.com", "https://docs.anyclip.com", "https://videomanager.anyclip.com"],
    li: ["https://www.linkedin.com/company/anyclip"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Anywell: {
    ws: ["https://www.anywell.com"],
    li: "https://www.linkedin.com/company/anywell",
    fb: "https://www.facebook.com/anywell.inc",
    tw: "https://x.com/anywell_inc",
    ig: "https://www.instagram.com/anywell_official",
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  Applitools: {
    ws: [
      "https://applitools.com",
      "https://auth.applitools.com",
      "https://help.applitools.com",
      "https://testautomationu.applitools.com"
    ],
    li: "https://www.linkedin.com/company/applitools",
    fb: ["https://www.facebook.com/Applitools"],
    tw: ["https://twitter.com/applitools"],
    gh: ["https://github.com/applitools"],
    ytc: ["https://www.youtube.com/channel/UCk13Ucc26mWqI4xvsbO13jw"],
    urls: [
      "https://medium.com/@applitools",
      "https://testautomationu.slack.com",
      "https://www.slideshare.net/Applitools"
    ],
    ytp: ["https://www.youtube.com/@Applitools"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  Arbe: {
    ws: ["https://arberobotics.com", "https://ir.arberobotics.com"],
    li: ["https://www.linkedin.com/company/arbe-robotics"],
    fb: ["https://www.facebook.com/arberobotics/?ref=page_internal"],
    tw: ["https://twitter.com/Arbe_Robotics"],
    ytc: ["https://www.youtube.com/channel/UCem5Ie0LVKY-5MV6Av9ZfsA"],
    ytp: ["https://www.youtube.com/@ArbeRobotics"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Arbox: {
    ws: [
      "https://academy.arboxapp.com",
      "https://help.arboxapp.com",
      "https://manage.arboxapp.com",
      "https://www.arboxapp.com"
    ],
    li: ["https://www.linkedin.com/company/arbox"],
    fb: ["https://www.facebook.com/arboxapp"],
    tw: ["https://x.com/arbox_app"],
    ig: ["https://www.instagram.com/arbox_app"],
    ytc: ["https://www.youtube.com/channel/ucsm8sofdl36aekvq7pforsg"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Ariga Technologies": {
    ws: ["https://ariga.io"],
    li: ["https://www.linkedin.com/company/arigaio"],
    tw: ["https://x.com/atlasgo_io", "https://x.com/entgo_io"],
    gh: ["https://github.com/ariga/atlas", "https://github.com/ent/ent", "https://github.com/ariga/atlas"],
    ytp: "https://www.youtube.com/@ariga_io",
    urls: [
      "https://atlasgo.io",
      "https://atlasgo.io/blog",
      "https://atlasgo.io/blog/2023/06/13/soc2-compliance",
      "https://atlasgo.io/faq",
      "https://atlasgo.io/getting-started",
      "https://entgo.io"
    ],
    _meta: { isHomepage: true, isVerified: true }
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
    ytp: ["https://www.youtube.com/@artlist_io"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Arugga AI Farming": {
    ws: ["https://www.arugga.com"],
    urls: ["http://www.millscreative.com", "https://arugga.t360.co.il/priportal"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Aryon Security": {
    ws: ["https://www.aryon.security"],
    li: ["https://www.linkedin.com/company/aryon-security"],
    ig: ["https://www.instagram.com/life_at_aryonsecurity"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Ashtrom Renewable Energy": {
    ws: ["https://cdn.ashtrom.co.il", "https://www.ashtrom.co.il"],
    li: ["https://www.linkedin.com/company/ashtrom-group"],
    fb: ["https://www.facebook.com/ashtromgroup", "https://www.facebook.com/settings"],
    ig: ["https://www.instagram.com/ashtrom.group"],
    ytp: ["https://www.youtube.com/@ashtromgroup6857"],
    urls: [
      "https://www.ashtromconcessions.co.il",
      "https://www.ashtromconstruction.co.il",
      "https://www.ashtromegurim.co.il",
      "https://www.ashtromindustries.co.il",
      "https://www.ashtrominternational.com",
      "https://www.ashtrominternational.com/en",
      "https://www.ashtromproperties.co.il",
      "https://www.ashtromrenewableenergy.co.il",
      "https://www.ashtromrenewableenergy.com/en",
      "https://www.ashtromresidencesforrent.co.il"
    ],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Ask-AI": {
    ws: ["https://getmosaic.ai", "https://ask-ai.zendesk.com"],
    li: ["https://www.linkedin.com/company/ask-ai-tech"],
    urls: ["https://www.comeet.com/jobs/askai/1A.00C"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Aspect Imaging": {
    ws: ["https://aspectimaging.com"],
    li: ["https://www.linkedin.com/company/aspect-imaging"],
    fb: ["https://www.facebook.com/aspectimaging"],
    tw: ["https://x.com/aspect_imaging"],
    ytp: ["https://www.youtube.com/@aspectimaging"],
    urls: ["https://aspectimaging.com/686-2", "https://aspectimaging.com/privacy-policy-3"],
    _meta: { isHomepage: true }
  },
  "Astrix Security": {
    ws: ["https://astrix.security"],
    li: ["https://www.linkedin.com/company/astrix-security"],
    tw: ["https://x.com/AstrixSecurity"],
    ytp: ["https://www.youtube.com/@astrix-security"],
    _meta: { isHomepage: true, isVerified: true }
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
    ytp: ["https://www.youtube.com/@AteraCloud"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Atidot: {
    ws: ["https://www.atidot.com"],
    li: ["https://www.linkedin.com/company/atidot"],
    fb: ["https://www.facebook.com/atidot-109325264860332"],
    tw: ["https://x.com/atidotisrael"],
    ig: ["https://www.instagram.com/atidotai"],
    ytc: ["https://www.youtube.com/channel/uczwaqpzzyudgisbwkpmirzg"],
    urls: [
      "https://app.atidot.co/login",
      "https://app.atidot.co/mapper",
      "https://www.atidot.com",
      "https://www.atidot.com/about",
      "https://www.atidot.com/annuities-solutions",
      "https://www.atidot.com/atidot-max",
      "https://www.atidot.com/atidot-optimal",
      "https://www.atidot.com/blog",
      "https://www.atidot.com/career",
      "https://www.atidot.com/contact",
      "https://www.atidot.com/privacy-notice",
      "https://www.atidot.com/resources",
      "https://www.atidot.com/solutions",
      "https://www.atidot.com/why-atidot"
    ],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  Atly: {
    ws: ["https://www.atly.com"],
    fb: ["https://www.facebook.com/atlyofficial"],
    ig: ["https://www.instagram.com/atly"],
    tt: ["https://www.tiktok.com/@atlyofficial"],
    urls: ["https://apps.apple.com/us/app/atly-know-where-to-go/id1449597018", "https://play.google.com/store/search"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Atrinet: {
    ws: ["https://www.atrinet.com"],
    li: ["https://www.linkedin.com/company/atrinet"],
    urls: [
      "https://appsyork.com/demo/atrinet-2/atrinets-privacy-policy",
      "https://atrinet.freshdesk.com/support/login"
    ],
    _meta: { isHomepage: true, isVerified: true }
  },
  AudioCodes: {
    ws: ["https://online.audiocodes.com", "https://partners.audiocodes.com", "https://www.audiocodes.com"],
    li: ["https://www.linkedin.com/company/audiocodes"],
    fb: ["https://www.facebook.com/audiocodes"],
    tw: ["https://x.com/audiocodes"],
    ig: ["https://www.instagram.com/_audiocodes_"],
    ytp: ["https://www.youtube.com/@audiocodesmedia"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  "Authomize (Now part of Delinea)": {
    ws: [
      "https://community.delinea.com",
      "https://delinea.com",
      "https://docs.delinea.com",
      "https://partners.delinea.com",
      "https://status.delinea.com",
      "https://trust.delinea.com"
    ],
    li: ["https://www.linkedin.com/company/delinea"],
    fb: ["https://www.facebook.com/delineainc"],
    tw: ["https://x.com/delineainc"],
    ytp: ["https://www.youtube.com/@delinea"],
    urls: [
      "https://community.delinea.com",
      "https://delinea.com/events/podcasts",
      "https://docs.delinea.com",
      "https://partners.delinea.com",
      "https://status.delinea.com",
      "https://trust.delinea.com"
    ],
    _meta: { isHomepage: true, isVerified: true }
  },
  Autofleet: {
    ws: ["https://autofleet.io", "https://ev.autofleet.io", "https://lp.autofleet.io", "https://taxi.autofleet.io"],
    li: ["https://www.linkedin.com/company/autofleet"],
    fb: ["https://www.facebook.com/autofleet.io"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Autotalks: {
    name: "Autotalks (Aquired by Qualcomm)",
    ws: ["https://www.qualcomm.com"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Aviv Scientific": {
    ws: ["https://aviv-clinics.com"],
    li: ["https://www.linkedin.com/company/avivclinics"],
    fb: ["https://www.facebook.com/avivclinics"],
    ig: ["https://www.instagram.com/avivclinics"],
    ytc: "https://www.youtube.com/channel/UCpwdTJ00A7ihuMQ36pVZa4Q",
    urls: [
      "https://aviv-clinics.com/about",
      "https://aviv-clinics.com/about/careers",
      "https://aviv-clinics.com/about/leadership",
      "https://aviv-clinics.com/blog",
      "https://aviv-clinics.com/brain-hq",
      "https://aviv-clinics.com/events",
      "https://aviv-clinics.com/faq",
      "https://aviv-clinics.com/hyperbaric-centers/villages-florida",
      "https://aviv-clinics.com/hyperbaric-medical-program",
      "https://aviv-clinics.com/hyperbaric-treatment-science",
      "https://aviv-clinics.com/podcasts",
      "https://aviv-clinics.com/reviews",
      "https://aviv-clinics.com/uhms-accredited-hyperbaric-facility"
    ],
    ytp: ["https://www.youtube.com/@AvivClinics"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Axiom: {
    ws: ["https://app.axiom.security", "https://axiom.security"],
    li: ["https://www.linkedin.com/company/axiomsecurity"],
    urls: [
      "https://brndini.co.il",
      "https://www.okta.com/newsroom/press-releases/okta-with-axiom-security--delivering-robust-privileged-access-fo"
    ],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Azura Ophthalmics": {
    ws: ["https://azuraophthalmics.com"],
    li: ["https://www.linkedin.com/company/azura-ophthalmics-limited"],
    tw: ["https://x.com/azura_op"],
    _meta: { isHomepage: true }
  },
  "BBT.live": {
    ws: ["https://bbt.live"],
    li: ["https://www.linkedin.com/company/bbt-live"],
    urls: [
      "https://www.ipoque.com/news-media/press-releases/ipoque-bbt-telco-grade-sdx",
      "https://www.ipoque.com/news-media/resources/case-studies/case-study-bbt.live-dpi-driven-intelligence-connectivity"
    ],
    _meta: { isHomepage: true, isVerified: true }
  },
  BEAM: {
    ws: ["https://beam.mw", "https://dex.beam.mw", "https://explorer.beam.mw", "https://forum.beam.mw"],
    tw: ["https://x.com/beamprivacy"],
    gh: ["https://github.com/beammw"],
    ytp: ["https://www.youtube.com/@beamprivacy"],
    urls: [
      "https://anchor.fm/beam-privacy",
      "https://beamassets.com",
      "https://beamprivacy.substack.com",
      "https://bitcointalk.org/index.php",
      "https://coinmarketcap.com/currencies/beam",
      "https://discord.gg/BHZvAhg",
      "https://forum.beam.mw",
      "https://medium.com/beam-mw",
      "https://qm.qq.com/cgi-bin/qm/qr",
      "https://t.me/BeamMiners",
      "https://t.me/BeamPrivacy",
      "https://t.me/BeamSupport",
      "https://t.me/beamdevsupport",
      "https://www.coingecko.com/en/coins/beam",
      "https://www.coingecko.com/learn/introduction-to-beam-cryptocurrency",
      "https://www.reddit.com/r/beamprivacy"
    ],
    _meta: { isHomepage: true, isVerified: true }
  },
  "BELKIN Vision": {
    ws: ["https://events.myalcon.com", "https://preferences.myalcon.com", "https://www.myalcon.com"],
    urls: [
      "https://www.alcon.com/terms-use",
      "https://www.au.alcon.com/privacy-policy",
      "https://www.au.alcon.com/terms-use"
    ],
    ytp: "https://www.youtube.com/@belkinvision",
    _meta: { isHomepage: true, isVerified: true }
  },
  "BLEND Localization": {
    ws: [
      "https://apidocs.getblend.com",
      "https://app.getblend.com",
      "https://freelancers.getblend.com",
      "https://help.getblend.com",
      "https://pages.getblend.com",
      "https://www.getblend.com"
    ],
    li: ["https://www.linkedin.com/company/blendlocalization"],
    fb: ["https://www.facebook.com/blendlocalization"],
    tw: ["https://x.com/blendlocal"],
    ig: ["https://www.instagram.com/blend.localization"],
    ytp: ["https://www.youtube.com/@blendlocalization"],
    urls: [
      "https://apidocs.getblend.com",
      "https://app.getblend.com/wizard",
      "https://blendexpress.com",
      "https://freelancers.getblend.com",
      "https://help.getblend.com/hc/en-us",
      "https://pages.getblend.com/refer-a-friend",
      "https://www.g2.com/products/blend-localization/reviews",
      "https://www.getblend.com",
      "https://www.getblend.com/about-us",
      "https://www.getblend.com/blend-israel",
      "https://www.getblend.com/blend-reviews",
      "https://www.getblend.com/blog",
      "https://www.getblend.com/calendar",
      "https://www.getblend.com/careers",
      "https://www.getblend.com/case-studies",
      "https://www.getblend.com/contact-us",
      "https://www.getblend.com/get-quote",
      "https://www.getblend.com/localization-security",
      "https://www.getblend.com/newsroom",
      "https://www.getblend.com/pricing",
      "https://www.getblend.com/supported-languages",
      "https://www.tasq.ai"
    ],
    _meta: { isHomepage: true, isVerified: true }
  },
  BackBox: {
    ws: ["https://backbox.com", "https://support.backbox.com"],
    li: ["https://www.linkedin.com/company/backbox"],
    tw: ["https://x.com/back_box"],
    ytc: "https://www.youtube.com/channel/UCcHVNacuDacMN8mN3f8V_Dw",
    urls: ["https://vimeo.com/backbox"],
    ytp: ["https://www.youtube.com/@backboxsoftware"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  Balance: {
    ws: ["https://www.getbalance.com"],
    li: ["https://www.linkedin.com/company/getbalance"],
    tw: ["https://twitter.com/GetBalanceHQ"],
    urls: ["https://dashboard.getbalance.com", "https://updates.getbalance.com"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Ballerine: {
    ws: ["https://ballerine.com"],
    li: ["https://www.linkedin.com/company/ballerine-inc"],
    ytp: ["https://www.youtube.com/@Ballerine-way"],
    urls: [
      "https://ballerine.notion.site/BALLERINE-PRIVACY-POLICY-db6c812a9c6748cda34e07fecb995e08",
      "https://ballerine.notion.site/Ballerine-Terms-of-Use-05868da82711408ca4cc8e1bdc04a431"
    ],
    _meta: { isHomepage: true, isVerified: true }
  },
  Base: {
    ws: ["https://clgcampus.base.ai", "https://go.base.ai", "https://www.base.ai"],
    li: ["https://www.linkedin.com/company/base-clg"],
    tw: ["https://x.com/base_clg"],
    ig: ["https://www.instagram.com/lifeatbase"],
    ytc: "https://www.youtube.com/channel/UCBpPVP_ZamumKpuagCM2ftA",
    ytp: ["https://www.youtube.com/@BaseAI"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Beaconcure: {
    ws: ["https://beaconcure.com"],
    li: ["https://www.linkedin.com/company/beaconcure"],
    _meta: { isHomepage: true, isVerified: true }
  },
  BeamUP: { ws: ["https://www.beamup.ai"], _meta: { isHomepage: true, isVerified: true } },
  Beamr: {
    ws: ["https://beamr.com", "https://blog.beamr.com", "https://cloud.beamr.com", "https://investors.beamr.com"],
    li: ["https://www.linkedin.com/company/beamr"],
    fb: ["https://www.facebook.com/BeamrVideo"],
    tw: ["https://x.com/BeamrVideo"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Beewise: {
    ws: ["https://beewise.ag", "https://grower.beewise.ag", "https://beesforbuildings.com"],
    li: ["https://www.linkedin.com/company/beewise-technologies"],
    fb: ["https://www.facebook.com/beewisetechnologies"],
    tw: ["https://twitter.com/BeewiseT"],
    ig: ["https://www.instagram.com/beewise.ag"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Believer Meats": {
    ws: ["https://www.believermeats.com"],
    li: ["https://www.linkedin.com/company/believer-meats"],
    fb: ["https://www.facebook.com/believermeats"],
    tw: ["https://x.com/believermeats"],
    ig: ["https://www.instagram.com/believermeats"],
    ytp: ["https://www.youtube.com/@believermeats"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  Bettear: {
    ws: ["https://www.bettear.com"],
    li: ["https://www.linkedin.com/company/bettear"],
    fb: ["https://www.facebook.com/bettear.il"],
    ig: ["https://www.instagram.com/bettear_"],
    urls: ["https://apps.apple.com/il/app/bettear/id1528016225"],
    android_app_ids: ["com.bettear.bettearApp"],
    _meta: { isHomepage: true, isVerified: true }
  },
  BetterSeeds: {
    ws: ["https://betterseeds.com"],
    li: ["https://www.linkedin.com/company/betterseeds-ltd"],
    _meta: { isHomepage: true }
  },
  Beyeonics: {
    ws: ["https://beyeonics.com"],
    li: ["https://www.linkedin.com/company/18548655", "https://www.linkedin.com/company/beyeonics"],
    ig: ["https://www.instagram.com/beyeonics"],
    urls: ["https://beyeonics-surgical.com", "https://beyeonics-vision.com"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Beyond Oil": {
    ws: ["https://www.beyondoil.co"],
    li: ["https://www.linkedin.com/company/beyond-oil"],
    fb: ["https://www.facebook.com/beyondoil.ltd"],
    tw: ["https://twitter.com/oil_beyond"],
    ytp: ["https://www.youtube.com/@beyond-oil"],
    tt: ["https://www.tiktok.com/@beyond_oil"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Bigabid: {
    ws: ["https://www.bigabid.com"],
    li: ["https://www.linkedin.com/company/bigabid"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Billabook: {
    ws: ["https://www.billabook.com"],
    urls: ["https://billabook.freshdesk.com/support/home"],
    _meta: { isHomepage: true }
  },
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
    _meta: { isHomepage: true, isVerified: true }
  },
  "Binah.ai": {
    ws: ["https://support.binah.ai", "https://www.binah.ai"],
    li: ["https://www.linkedin.com/company/binah.ai"],
    ig: ["https://www.instagram.com/binah.ai"],
    ytc: "https://www.youtube.com/channel/UCiXX_SN0Yftw9NDu2RkkTJg",
    urls: [
      "https://support.binah.ai/binah",
      "https://www.binah.ai",
      "https://www.binah.ai/legal",
      "https://www.binah.ai/privacy"
    ],
    ytp: ["https://www.youtube.com/@binahai"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isVerified: true, isBrowserVerified: true }
  },
  BioProtect: {
    ws: ["https://bioprotect.com"],
    li: ["https://www.linkedin.com/company/bioprotect-ltd"],
    tw: ["https://x.com/bioprotects"],
    ytp: ["https://www.youtube.com/@bioprotect"],
    _meta: { isHomepage: true, isVerified: true }
  },
  BioRaptor: {
    ws: ["https://www.bioraptor.ai"],
    li: ["https://www.linkedin.com/company/bioraptor"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "BioT Medical": {
    ws: ["https://docs.biot-med.com", "https://www.biot-med.com"],
    li: ["https://www.linkedin.com/company/biot-medical"],
    urls: [
      "https://www.biot-med.com/about",
      "https://www.iubenda.com/privacy-policy/31881521",
      "https://www.iubenda.com/privacy-policy/31881521/cookie-policy",
      "https://www.meetup.com/IoMT-Product-Experts",
      "https://www.meetup.com/Medical-IoT-IoMT-Product-Experts-of-Southern-California"
    ],
    _meta: { isHomepage: true, isVerified: true }
  },
  Biobeat: {
    ws: ["https://www.bio-beat.com"],
    li: ["https://www.linkedin.com/company/biobeat-ltd."],
    tw: ["https://x.com/biobeatt"],
    ytc: "https://www.youtube.com/channel/UCYbhCIz2gfyqruH2z4ZWQFg",
    ytp: ["https://www.youtube.com/@biobeattechnologies4924"],
    _meta: { isHomepage: true, isVerified: true }
  },
  BiolineRx: {
    ws: ["https://biolinerx.com", "https://ir.biolinerx.com"],
    li: ["https://www.linkedin.com/company/biolinerx"],
    tw: ["https://x.com/biolinerx_ltd"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Biomica: { ws: ["https://www.biomicamed.com"], _meta: { isHomepage: true, isVerified: true } },
  "Biond Biologics": {
    ws: ["https://www.biondbio.com"],
    urls: ["https://www.biondbio.com/privacy-policy", "https://www.biondbio.com/terms-of-use"],
    _meta: { isHomepage: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  Bites: {
    ws: ["https://app.mybites.io", "https://help.mybites.io", "https://mybites.io"],
    li: ["https://www.linkedin.com/company/bites-learning"],
    ig: ["https://www.instagram.com/mybites.io"],
    ytc: "https://www.youtube.com/channel/UCn2wI7mYcZYg8vcNmPLUPkQ",
    ytp: ["https://www.youtube.com/@MyBitesAI"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Bizi: {
    ws: ["https://cdn.bizi.co.il", "https://www.bizi.co.il"],
    li: ["https://www.linkedin.com/company/bizi-finance"],
    fb: ["https://www.facebook.com/bizi.co.il"],
    ig: ["https://www.instagram.com/bizi.finance"],
    tt: ["https://www.tiktok.com/@bizi_finance"],
    urls: ["https://share-eu1.hsforms.com/158156UDqSXq6R53AWsoxvgfsc0x", "https://wa.link/587ljz"],
    _meta: { isHomepage: true }
  },
  Blender: {
    ws: ["https://blender.global"],
    urls: ["https://blender.loans", "https://www.blender.co.il", "https://www.blender.global"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Blockaid: {
    ws: ["https://blockaid.io", "https://docs.blockaid.io", "https://report.blockaid.io"],
    li: ["https://www.linkedin.com/company/blockaid"],
    tw: ["https://x.com/blockaid_"],
    urls: ["https://comeet.com/jobs/blockaid/69.00b", "https://t.me/+YCEZbt_QrE8zMjI0"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "BlueWind Medical": {
    ws: ["https://bluewindmedical.com"],
    li: ["https://www.linkedin.com/company/bluewind-medical"],
    fb: ["https://www.facebook.com/bluewindmedical"],
    tw: ["https://x.com/bluewindinc"],
    ig: ["https://www.instagram.com/bluewindmedical"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  Bluesky: {
    ws: ["https://bsky.social", "https://bsky.app"],
    gh: ["https://github.com/bluesky-social"],
    urls: [
      "https://apps.apple.com/us/developer/bluesky-pbllc/id1654243552",
      "https://play.google.com/store/apps/developer?id=Bluesky+PBLLC"
    ],
    android_dev_id: "xyz.blueskyweb",
    _meta: { isVerified: true, isBrowserVerified: true }
  },
  Bluewhite: {
    ws: ["https://www.bluewhite.ai"],
    li: ["https://www.linkedin.com/company/bluewhite"],
    ig: ["https://www.instagram.com/bluewhite.ai"],
    ytc: "https://www.youtube.com/channel/UCkC-JaDHN1jaWSMx6YmJWRA",
    ytp: ["https://www.youtube.com/@bluewhiteag"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Boards: {
    ws: ["https://academy.boards.com", "https://app.boards.com", "https://www.boards.com", "https://support.boards.so"],
    li: ["https://www.linkedin.com/company/boardsapp"],
    ig: ["https://www.instagram.com/boards.app"],
    ytp: ["https://www.youtube.com/@BoardsApp"],
    urls: ["https://boards.onelink.me/0fu0/d3icoa9w", "https://boards.onelink.me/0fu0/tkc2lr0a"],
    _meta: { isHomepage: true, isVerified: true }
  },
  BondIT: {
    ws: ["https://bonditglobal.com"],
    li: ["https://www.linkedin.com/company/3222746", "https://www.linkedin.com/company/bondit"],
    tw: ["https://x.com/bondit_fintech"],
    ytc: "https://www.youtube.com/channel/UCm7hhDkWe4jAJbR7Yt2_Yyw",
    urls: ["https://bonditsolutions.com/auth", "https://business.scorable.com"],
    ytp: ["https://www.youtube.com/@bondit5550"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Botika: {
    ws: ["https://app.botika.com", "https://botika.com", "https://help.botika.com"],
    li: ["https://www.linkedin.com/company/botika-com"],
    ig: ["https://www.instagram.com/botika_com"],
    ytp: ["https://www.youtube.com/@botika_com"],
    urls: ["https://botika-io.crisp.help/en", "https://help.botika.com/en"],
    _meta: { isHomepage: true, isVerified: true }
  },
  BrainQ: {
    ws: ["https://brainqtech.com"],
    li: ["https://www.linkedin.com/company/brainq-technologies"],
    fb: ["https://www.facebook.com/brainqtech"],
    tw: ["https://x.com/brainqtech"],
    ytp: ["https://www.youtube.com/@brainqtech"],
    urls: ["http://brainq.co.il", "https://emagine.care"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Brainsway: {
    ws: ["https://investors.brainsway.com", "https://www.brainsway.com"],
    li: ["https://www.linkedin.com/company/brainsway"],
    fb: ["https://www.facebook.com/brainswaydeeptms"],
    tw: ["https://x.com/brainsway"],
    ig: ["https://www.instagram.com/brainsway"],
    urls: ["https://investors.brainsway.com", "https://mybrainsway.com", "https://www.brainsway.com"],
    _meta: { isHomepage: true, isVerified: true }
  },
  BrandShield: {
    ws: ["https://platform.brandshield.com", "https://www.brandshield.com"],
    li: ["https://www.linkedin.com/company/2231196"],
    fb: ["https://www.facebook.com/BrandShield"],
    tw: ["https://twitter.com/brandshieldltd"],
    ytc: ["https://www.youtube.com/channel/UC0ahbVndIUdRy_DstOWP7og"],
    ytp: ["https://www.youtube.com/@Brandshield"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  Breez: {
    ws: ["https://blog.breez.technology", "https://breez.technology"],
    tw: ["https://x.com/breez_tech"],
    gh: ["https://github.com/breez"],
    urls: ["https://medium.com/breez-technology", "https://t.me/breez_lightning"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Brenmiller Energy": {
    ws: ["https://bren-energy.com"],
    li: ["https://www.linkedin.com/company/brenmiller-energy"],
    fb: ["https://www.facebook.com/brenmillerenergy"],
    tw: ["https://x.com/bren_energy"],
    ytp: ["https://www.youtube.com/@brenmillerenergy343"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  Brightmerge: {
    ws: ["https://www.brightmerge.com"],
    li: ["https://www.linkedin.com/company/brightmerge"],
    ytp: ["https://www.youtube.com/@brightmerge"],
    urls: ["https://calendly.com/brettm-brightmerge/30min"],
    _meta: { isHomepage: true }
  },
  Bringg: {
    ws: ["https://security.bringg.com", "https://www.bringg.com"],
    li: ["https://www.linkedin.com/company/bringg"],
    ytp: ["https://www.youtube.com/@bringgapp"],
    urls: ["https://bringg.my.site.com/supportcenter/s/login"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Briya: {
    ws: ["https://aire.briya.com", "https://briya.com"],
    li: ["https://www.linkedin.com/company/briyahelath"],
    fb: ["https://www.facebook.com/briya-109067278395662"],
    tw: ["https://x.com/briyahealth"],
    urls: ["https://briya.careers.hibob.com/jobs"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Buildots: {
    ws: ["https://buildots.com"],
    li: ["https://www.linkedin.com/company/buildots"],
    fb: ["https://www.facebook.com/buildots"],
    ig: ["https://www.instagram.com/buildots"],
    ytp: ["https://www.youtube.com/@Buildots"],
    urls: ["https://app.bldts.io", "https://buildots.net"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Butterfly Medical": {
    ws: ["https://butterfly-medical.com"],
    urls: ["http://imaginet.co.il", "https://butterfly-medical.com"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "C2A Security": {
    ws: ["https://c2a-sec.com"],
    li: ["https://www.linkedin.com/company/c2a-security"],
    tw: ["https://x.com/c2a_security"],
    _meta: { isHomepage: true, isVerified: true }
  },
  CADY: {
    ws: ["https://app.cadysolutions.com", "https://cadysolutions.com"],
    li: ["https://www.linkedin.com/company/cadydesign"],
    ytc: "https://www.youtube.com/channel/UCGzXGupZjRYBgHjG88bU3Fw",
    ytp: ["https://www.youtube.com/@CADYSolutions"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "CLEW Medical": {
    ws: ["https://clewmed.com"],
    li: ["https://www.linkedin.com/company/clewmed"],
    _meta: { isHomepage: true, isVerified: true }
  },
  CYE: {
    ws: ["https://cyesec.com"],
    li: ["https://www.linkedin.com/company/cyesec"],
    tw: ["https://x.com/CyesecLtd"],
    ytc: ["https://www.youtube.com/channel/UCqcIuEorR6t_6prTnQ2Nv8w"],
    ytp: ["https://www.youtube.com/@CYE_Security"],
    _meta: { isHomepage: true, isVerified: true }
  },
  CYREBRO: {
    ws: ["https://app.cyrebro.io", "https://partners.cyrebro.io", "https://www.cyrebro.io"],
    li: ["https://www.linkedin.com/company/cyrebro"],
    fb: ["https://www.facebook.com/CYREBRO"],
    tw: ["https://www.twitter.com/cyrebro_io"],
    urls: ["https://www.g2.com/products/cyrebro/reviews"],
    _meta: { isHomepage: true, isVerified: true }
  },
  CaPow: {
    ws: ["https://capow.energy", "https://planner.capow.energy"],
    li: ["https://www.linkedin.com/company/capow-tech"],
    tw: ["https://x.com/capow2024"],
    ytp: ["https://www.youtube.com/@perpetual-power-in-motion"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Canditech: {
    ws: ["https://helpcenter.canditech.io", "https://system.canditech.io", "https://www.canditech.io"],
    li: ["https://www.linkedin.com/company/canditech"],
    fb: ["https://www.facebook.com/canditech.io"],
    urls: ["https://www.capterra.com/p/267592/Canditech", "https://www.g2.com/products/canditech/reviews"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Candivore: {
    ws: ["https://candivore.io"],
    urls: ["https://candivore.zendesk.com"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Captain's Eye": { ws: ["https://www.captain-eye.com"], _meta: { isHomepage: true, isVerified: true } },
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
    _meta: { isHomepage: true, isVerified: true }
  },
  CardiacSense: {
    ws: ["https://www.cardiacsense.com"],
    li: ["https://www.linkedin.com/company/cardiacsense"],
    fb: ["https://www.facebook.com/cardiacsense"],
    tw: ["https://x.com/cardiacsense"],
    ytc: "https://www.youtube.com/channel/UCxxLxEd1lqoojkHy_RoJdmA",
    urls: [
      "http://imaginet.co.il",
      "https://cardiacsense.zendesk.com/agent",
      "https://cardiacsense.zendesk.com/hc/en-us",
      "https://cardiacsense.zendesk.com/hc/en-us/requests/new",
      "https://portal.cardiacsense-cloud.com/auth/login",
      "https://www.cardiacsense.com",
      "https://www.cardiacsense.com/about",
      "https://www.cardiacsense.com/board-of-directors",
      "https://www.cardiacsense.com/contact-us",
      "https://www.cardiacsense.com/data",
      "https://www.cardiacsense.com/distributors",
      "https://www.cardiacsense.com/en/careers",
      "https://www.cardiacsense.com/en/news",
      "https://www.cardiacsense.com/heart-rate-monitor-watch",
      "https://www.cardiacsense.com/our-solution",
      "https://www.cardiacsense.com/team",
      "https://www.cardiacsense.com/technology"
    ],
    ytp: ["https://www.youtube.com/@cardiacsense4501"],
    _meta: { isHomepage: true, isVerified: true }
  },
  CardinalOps: {
    ws: ["https://cardinalops.com"],
    li: ["https://www.linkedin.com/company/cardinalops"],
    urls: [
      "https://cardinalops.com/privacy-policy",
      "https://cardinalops.com/security-compliance",
      "https://cardinalops.com/terms-of-use"
    ],
    _meta: { isHomepage: true, isVerified: true }
  },
  Carrar: {
    ws: ["https://www.carrar.net"],
    li: ["https://www.linkedin.com/company/carrar"],
    tw: ["https://x.com/carrar__"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Carteav: {
    ws: ["https://carteav.com"],
    li: ["https://www.linkedin.com/company/carteav"],
    ytp: ["https://www.youtube.com/@carteav3775"],
    _meta: { isHomepage: true, isVerified: true }
  },
  CathWorks: {
    ws: ["https://cath.works"],
    li: ["https://www.linkedin.com/company/cathworks"],
    fb: ["https://www.facebook.com/cathworksffrangio"],
    ig: ["https://www.instagram.com/cathworks"],
    ytp: ["https://www.youtube.com/@cathworks"],
    urls: ["https://crtmeeting.org"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Cato Networks": {
    ws: ["https://www.catonetworks.com"],
    li: ["https://www.linkedin.com/company/cato-networks"],
    fb: ["https://www.facebook.com/CatoNetworks"],
    tw: ["https://twitter.com/CatoNetworks"],
    urls: ["https://cc.catonetworks.com", "https://connect.catonetworks.com", "https://partners.catonetworks.com"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Cedar Money": {
    ws: ["https://app.cedar.money", "https://www.cedar.money"],
    li: ["https://www.linkedin.com/company/cedar-money"],
    tw: ["https://x.com/cedar_money"],
    ig: ["https://www.instagram.com/cedar.money"],
    urls: ["https://apps.apple.com/us/app/cedar-money-app/id6736955250", "https://cedarmoney.zendesk.com/hc/en-us"],
    android_app_ids: ["money.cedar.app"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Celery: {
    ws: ["https://www.celeryway.com"],
    li: ["https://www.linkedin.com/company/celery-controls"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isVerified: true, isBrowserVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  Cervello: {
    ws: ["https://cervello.security"],
    li: ["https://www.linkedin.com/company/cervello-cyber-security"],
    fb: ["https://www.facebook.com/cervello.sec"],
    tw: ["https://x.com/cervello"],
    ytc: "https://www.youtube.com/channel/UCmCMumFE7WqjG545v4qEpNw",
    urls: [
      "https://cervellosec.atlassian.net/servicedesk/customer/portal/1",
      "https://cervellosec.atlassian.net/servicedesk/customer/portal/1/user/login"
    ],
    ytp: ["https://www.youtube.com/@Cervello-RailwayCyberSecurity"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  Chemomab: {
    ws: ["https://chemomab.com", "https://investors.chemomab.com"],
    li: ["https://www.linkedin.com/company/chemoab-ltd"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Chunk Foods": {
    ws: ["https://shopusa.chunkfoods.com", "https://www.chunkfoods.com"],
    li: ["https://www.linkedin.com/company/chunk-foods"],
    ig: ["https://www.instagram.com/chunk_foods"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Cipia: {
    ws: ["https://car.harman.com", "https://harman.com", "https://jobs.harman.com", "https://news.harman.com"],
    li: ["https://www.linkedin.com/company/harman-automotive"],
    fb: ["https://www.facebook.com/harmanint"],
    tw: ["https://x.com/harman"],
    ytc: "https://www.youtube.com/channel/UCa6wf2LZH2-fAFfpE8N4ayA",
    ytp: ["https://www.youtube.com/@harman_automotive"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  CitrusX: {
    ws: ["https://www.citrusx.ai"],
    urls: [
      "https://www.citrusx.ai/accessibility-statement",
      "https://www.citrusx.ai/privacy",
      "https://www.citrusx.ai/terms"
    ],
    _meta: { isHomepage: true, isVerified: true }
  },
  Clarifruit: {
    ws: ["https://app.clarifresh.com", "https://clarifresh.com", "https://support.clarifresh.com"],
    li: ["https://www.linkedin.com/company/clarifresh"],
    fb: ["https://www.facebook.com/clarifresh"],
    tw: ["https://x.com/clarifresh"],
    urls: [
      "https://app.clarifresh.com",
      "https://support.clarifresh.com/hc/en-us",
      "https://support.clarifruit.com/hc/en-us"
    ],
    android_app_ids: ["com.clarifruit"],
    _meta: { isHomepage: true, isVerified: true }
  },
  ClarityQ: {
    ws: ["https://get.clarityq.ai", "https://pages.clarityq.ai", "https://www.clarityq.ai"],
    li: ["https://www.linkedin.com/company/clarityq"],
    tw: ["https://x.com/clarityqai"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isVerified: true, isBrowserVerified: true }
  },
  "Click-Ins": {
    ws: ["https://www.click-ins.com"],
    li: ["https://www.linkedin.com/company/click-ins"],
    _meta: { isHomepage: true }
  },
  "Cnoga Medical": {
    ws: ["https://www.cnogacare.co"],
    li: ["https://www.linkedin.com/company/cnoga-medical"],
    urls: ["http://www.cnoga.com", "http://www.wixmonster.co.il"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "CodeMonkey Studios": {
    ws: ["https://app.codemonkey.com", "https://help.codemonkey.com", "https://www.codemonkey.com"],
    urls: ["https://cert.privo.com"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Cognata: {
    ws: ["https://www.cognata.com"],
    li: ["https://www.linkedin.com/company/cognata-ltd"],
    fb: ["https://www.facebook.com/cognata-435204960144343"],
    tw: ["https://x.com/cognataai"],
    ytc: "https://www.youtube.com/channel/UCDcE8LkbQ7VTRA6DeHt7CKg",
    ytp: ["https://www.youtube.com/@cognataltd.1750"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Cogniteam: {
    ws: ["https://www.cogniteam.com"],
    li: ["https://www.linkedin.com/company/cogniteam"],
    ig: ["https://www.instagram.com/cogniteam_official"],
    ytp: ["https://www.youtube.com/@cogniteam"],
    urls: [
      "http://ya-marketingservices.com",
      "https://app.cognimbus.com",
      "https://docs.cognimbus.com",
      "https://meetings-eu1.hubspot.com/michael-frumar/intro-with-cogniteam",
      "https://www.google.com/maps/place/Ha-Sivim+St+18,+Petah+Tikva/@32.0884801,34.8539642,17z/data=!3m1!4b1!4m6!3m5!1s0x151d49f8ca5fbb7b:0x7304ca795ebf147d!8m2!3d32.0884756!4d34.8565391!16s%2Fg%2F11f5k21_r_",
      "https://www.google.com/maps/place/MassRobotics/@42.3455092,-71.0416315,17z/data=!3m2!4b1!5s0x89e37a9cc5b472f9:0x3aa06fb74a2eb27e!4m6!3m5!1s0x89e37a9cc3f584d1:0x8c8e5f7687f79f80!8m2!3d42.3455053!4d-71.0367606!16s%2Fg%2F11g6qjc7l_"
    ],
    _meta: { isHomepage: true, isVerified: true }
  },
  Cognyte: {
    ws: ["https://www.cognyte.com"],
    li: ["https://www.linkedin.com/company/cognyte"],
    tw: ["https://twitter.com/Cognyte"],
    ytc: ["https://www.youtube.com/channel/UCqIvlQRaVQ38kr03p5QTDWA"],
    urls: ["https://www.glassdoor.com/Overview/Working-at-Cognyte-EI_IE4430257.11,18.htm"],
    ytp: ["https://www.youtube.com/@cognyte3552"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Collplant: {
    ws: ["https://collplant.com", "https://ir.collplant.com"],
    li: ["https://www.linkedin.com/company/collplant"],
    tw: ["https://x.com/collplantbio"],
    ytc: "https://www.youtube.com/channel/UC_7SlEx2hGdrw75fvVeOgsw",
    ytp: ["https://www.youtube.com/@collplantbio8262"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Colugo Systems": {
    ws: ["https://www.colugo-sys.com"],
    li: ["https://www.linkedin.com/company/colugo-systems"],
    fb: ["https://www.facebook.com/colugosys"],
    urls: ["https://firmabrands.com"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "CommBox.io": {
    ws: ["https://help.commbox.io", "https://manage.commbox.io", "https://www.commbox.io"],
    li: ["https://www.linkedin.com/company/commbox1"],
    fb: ["https://www.facebook.com/commbox.io"],
    ig: ["https://www.instagram.com/commbox.io"],
    ytc: "https://www.youtube.com/channel/UC6CNTJ4rmjy-ZZzqvqc08aQ",
    urls: ["https://commbox.statuspage.io", "https://help.commbox.io/apidocs"],
    ytp: ["https://www.youtube.com/@commboxio1073"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Compete HR": {
    ws: ["https://competewith.com", "https://swp-us.competewith.com"],
    li: ["https://www.linkedin.com/company/competehr"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Comunix: {
    ws: ["https://www.getcomunix.com"],
    urls: [
      "https://apps.apple.com/app/poker-face-meet-play-live/id1364570884",
      "https://editor.wix.com/html/editor/web/renderer/revisions/view/697da5b3-f271-41ee-a309-bc49c1a62690/137/shop1",
      "https://getcomunixhelp.zendesk.com/hc/en-us",
      "https://pokerface.page.link/joinpokerface",
      "https://www.comeet.com/jobs/comunix/86.006",
      "https://www.getcomunix.com/pokerface",
      "https://www.getcomunix.com/privacy-policy",
      "https://www.getcomunix.com/terms-of-use"
    ],
    android_app_ids: ["com.comunix.pokerface"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  "Cordio Medical": {
    ws: ["https://www.cordio-med.com"],
    li: ["https://www.linkedin.com/company/cordio-medical"],
    urls: ["https://www.razgroup.co.il"],
    _meta: { isHomepage: true, isVerified: true }
  },
  CoreTigo: {
    ws: ["https://support.coretigo.com", "https://www.coretigo.com"],
    li: ["https://www.linkedin.com/company/coretigo"],
    fb: ["https://www.facebook.com/coretigo"],
    tw: ["https://x.com/coretigo"],
    ig: ["https://www.instagram.com/coretigo"],
    ytp: ["https://www.youtube.com/@coretigo"],
    urls: [
      "http://entry.co.il",
      "https://abrilliant.company",
      "https://wa.me/message/KA67I5RRWZGLO1",
      "https://www.example.com",
      "https://www.xing.com/pages/coretigo"
    ],
    _meta: { isHomepage: true, isVerified: true }
  },
  CorrActions: {
    ws: ["https://corractions.com"],
    li: ["https://www.linkedin.com/company/corractions"],
    urls: ["https://titan.co.il"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Cortica: {
    ws: ["https://cortica.com"],
    urls: ["https://cortica.com/privacy-policy", "https://cortica.com/terms-and-conditions", "https://mar-comit.com"],
    _meta: { isHomepage: true, isVerified: true }
  },
  CropX: {
    ws: ["https://cropx.com"],
    li: ["https://www.linkedin.com/company/10147582"],
    fb: ["https://www.facebook.com/CropXGlobal"],
    tw: ["https://twitter.com/crop_x"],
    ig: ["https://www.instagram.com/cropx_global"],
    ytc: ["https://www.youtube.com/channel/UCcwU6dNzM7KsNLrP1b4u0iw"],
    urls: ["https://help.cropx.com", "https://help.cropx.com/portal/en/home", "https://myfarm.cropx.com/login"],
    ytp: ["https://www.youtube.com/@cropx_global"],
    _meta: { isHomepage: true, isVerified: true }
  },
  CyVers: {
    ws: ["https://cyvers.ai", "https://docs.cyvers.ai", "https://vigilens.cyvers.ai"],
    li: ["https://www.linkedin.com/company/cyvers"],
    tw: ["https://x.com/cyversalerts"],
    urls: ["https://t.me/CyversAlertsOfficial", "https://t.me/CyversAlertsOfficial"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Cyabra: {
    ws: ["https://cyabra.com"],
    li: ["https://www.linkedin.com/company/cyabra"],
    tw: ["https://x.com/thecyabra"],
    ytp: ["https://www.youtube.com/@cyabra"],
    urls: ["https://errol.cyabra.com", "https://open.spotify.com/show/3gMZQTgbe3Wajzm9bDyJSW"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Cybellum: {
    ws: ["https://cybellum.com", "https://security.cybellum.com"],
    li: ["https://www.linkedin.com/company/cybellum"],
    tw: ["https://x.com/cybellum"],
    ytp: ["https://www.youtube.com/@cybellumtechnologiesltd"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  Cybersixgill: {
    ws: ["https://academy.bitsight.com", "https://www.bitsight.com", "https://bitsighttech.com"],
    li: ["https://www.linkedin.com/company/bitsight"],
    fb: ["https://www.facebook.com/bitsight"],
    tw: ["https://x.com/bitsight"],
    ig: ["https://www.instagram.com/bitsight"],
    ytc: "https://www.youtube.com/channel/UCQK4819a_k18f2GGC3Fkv8g",
    urls: [
      "https://app.termscout.com/certify/bitsight-certified-contract",
      "https://bitsight.wd1.myworkdayjobs.com/Bitsight",
      "https://help.bitsighttech.com/hc/en-us",
      "https://submit-irm.trustarc.com/services/validation/313077aa-ba94-46d5-8cdb-1eec02a3553a"
    ],
    ytp: ["https://www.youtube.com/@Bitsighttech"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Cyclops Security": {
    ws: ["https://cyclops.security"],
    li: ["https://www.linkedin.com/company/cyclopssecurity"],
    urls: ["https://aws.amazon.com/marketplace/pp/prodview-qosjaonicohoa"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  Cydome: {
    ws: ["https://cydome.io", "https://ireport.cydome.io", "https://yachts.cydome.io"],
    li: ["https://www.linkedin.com/company/cydome"],
    tw: ["https://x.com/cydome"],
    urls: ["https://cydome.zohorecruit.com/jobs/Careers"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Cyera: {
    ws: "https://www.cyera.com",
    ytp: ["https://www.youtube.com/@CyeraSecurity"],
    ytc: ["https://www.youtube.com/channel/UCQZhCZIe6xRDjCkfzzwPBCg"],
    urls: [
      "https://marketplace.microsoft.com/de-de/product/web-apps/cyera1658314682323.cyera_cloud_data_security?tab=overview",
      "https://www.elastic.co/docs/reference/integrations/cyera"
    ],
    _meta: { isVerified: true, isBrowserVerified: true }
  },
  Cylus: {
    ws: ["https://www.cylus.com"],
    li: ["https://www.linkedin.com/company/cylus"],
    fb: ["https://www.facebook.com/cylusec"],
    tw: ["https://x.com/cylus_security"],
    ytc: "https://www.youtube.com/channel/UCmdDHg7xXeGXVfP5zaV91ZQ",
    urls: ["https://www.railtechsecurity.com"],
    ytp: ["https://www.youtube.com/@cylus-cyber"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Cymbio: {
    ws: ["https://agentic.cym.bio", "https://app.cym.bio", "https://www.cym.bio"],
    li: ["https://www.linkedin.com/company/cymbio"],
    fb: ["https://www.facebook.com/cymbio"],
    tw: ["https://x.com/cymbio_"],
    urls: [
      "https://newsroom.paypal-corp.com/2026-01-22-PayPal-to-Acquire-Cymbio,-Accelerating-Agentic-Commerce-Capabilities"
    ],
    _meta: { isHomepage: true, isVerified: true }
  },
  Cymulate: {
    ws: ["https://cymulate.com", "https://app.cymulate.com", "https://partner.cymulate.com"],
    li: ["https://www.linkedin.com/company/cymulate"],
    ig: ["https://www.instagram.com/cymulate"],
    ytp: ["https://www.youtube.com/@cymulateltd"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Cynamics: {
    ws: ["https://www.cynamics.ai"],
    li: ["https://www.linkedin.com/company/cynamics"],
    fb: ["https://www.facebook.com/cynamicsai"],
    tw: ["https://x.com/cynamics_ai"],
    ytc: "https://www.youtube.com/channel/UCl5IEC7p-7Q4CO_hziAto4Q",
    urls: ["https://www.fedramp.gov"],
    ytp: ["https://www.youtube.com/@cynamics7032"],
    _meta: { isHomepage: true, isVerified: true }
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
    ytp: ["https://www.youtube.com/@cynomichannel"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Cyolo: {
    ws: ["https://cyolo.io", "https://support.cyolo.io"],
    li: ["https://www.linkedin.com/company/26244228"],
    tw: ["https://x.com/cyolo_security"],
    ytc: "https://www.youtube.com/channel/UCdxVJiDvgECOR1bc1fV6erg",
    ytp: ["https://www.youtube.com/@cyolo_security"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Cypago: {
    ws: ["https://auth.cypago.com", "https://cypago.com", "https://status.cypago.com"],
    li: ["https://www.linkedin.com/company/cypago"],
    tw: ["https://x.com/cypagosec"],
    urls: [
      "https://cyberdefensewire.com/cypago-announces-strategic-partnership-with-archer-to-deliver-ai-driven-continuous-controls-monitoring-for-enterprises",
      "https://hitrustdirectory.com/product/cypago-cyber-grc-automation-platform"
    ],
    _meta: { isHomepage: true, isVerified: true }
  },
  Cytactic: {
    ws: ["https://cytactic.com"],
    li: ["https://www.linkedin.com/company/cytactic"],
    fb: ["https://www.facebook.com/cytactic"],
    ytp: ["https://www.youtube.com/@cytactic"],
    urls: ["https://medium.com/@Cytactic"],
    _meta: { isHomepage: true, isVerified: true }
  },
  CytoReason: { ws: ["https://cytoreason.com"], _meta: { isHomepage: true, isVerified: true } },
  "D-Fend Solutions": {
    li: ["https://www.linkedin.com/company/d-fend-solutions"],
    fb: ["https://www.facebook.com/DFendSolutions"],
    tw: ["https://x.com/DFendSolutions"],
    ig: ["https://www.instagram.com/d_fend_solutions"],
    ytp: ["https://www.youtube.com/@DFendSolutions", "https://www.youtube.com/@zoharhalachmi5784"],
    urls: ["https://d-fendsolutions.com"],
    _meta: { isVerified: true, isBrowserVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  DOKKA: {
    ws: ["https://app.dokka.com", "https://dokka.com"],
    li: ["https://www.linkedin.com/company/dokkasoftware"],
    fb: ["https://www.facebook.com/dokkame"],
    tw: ["https://x.com/dokkame"],
    ig: ["https://www.instagram.com/dokkame"],
    ytc: "https://www.youtube.com/channel/UCfna-3t65vNEqw5UH0iYapQ",
    urls: [
      "http://www.aicpa-cima.com/resources/download/soc-for-service-organizations-engagements-overview",
      "https://dokka.freshdesk.com/en/support/home"
    ],
    ytp: ["https://www.youtube.com/@dokkaaccounting"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "DOT Compliance": {
    ws: ["https://info.dotcompliance.com", "https://www.dotcompliance.com"],
    li: ["https://www.linkedin.com/company/dot-compliance"],
    tw: ["https://x.com/dotcompliance_"],
    ytp: ["https://www.youtube.com/@dotcompliance_eqms"],
    _meta: { isHomepage: true, isVerified: true }
  },
  DagsHub: {
    ws: ["https://dagshub.com"],
    li: ["https://www.linkedin.com/company/dagshub"],
    tw: ["https://x.com/therealdagshub"],
    ytp: ["https://www.youtube.com/@dagshub"],
    urls: ["https://discord.com/invite/9gU36Y6", "https://forms.fillout.com/t/3ioiagnP7mus"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Darrow: {
    ws: ["https://portal.darrow.ai", "https://www.darrow.ai"],
    li: ["https://www.linkedin.com/company/darrow-ai"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  "Dataloop AI": {
    ws: ["https://console.dataloop.ai", "https://dataloop.ai", "https://docs.dataloop.ai"],
    li: ["https://www.linkedin.com/company/dataloop"],
    gh: ["https://github.com/dataloop-ai", "https://github.com/dataloop-ai-apps"],
    ytc: "https://www.youtube.com/channel/UCCvp-nw5mK9bb9lDNcD6fgw",
    urls: [
      "https://dataloop.ai/blog",
      "https://dataloop.ai/platform/data-management/dataloop-api",
      "https://dataloop.ai/platform/data-management/dataloop-sdk",
      "https://docs.dataloop.ai/docs"
    ],
    ytp: ["https://www.youtube.com/@dataloopai"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Datos Health": {
    ws: ["https://www.datos-health.com"],
    li: ["https://www.linkedin.com/company/datos-health"],
    fb: ["https://www.facebook.com/datoshealth"],
    tw: ["https://x.com/datoshealth"],
    urls: ["https://resources.marketplace.aviahealth.com/top-virtual-visit-companies-report-2024-refresh"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Datumate: {
    ws: ["https://bim.datumate.com", "https://www.datumate.com"],
    li: ["https://www.linkedin.com/company/datumate"],
    fb: ["https://www.facebook.com/datumate"],
    tw: ["https://x.com/datumate"],
    ytp: ["https://www.youtube.com/@datumate"],
    urls: ["https://bim.datumate.com", "https://www.datumate.com"],
    _meta: { isHomepage: true, isVerified: true }
  },
  DeepKeep: {
    ws: ["https://docs.deepkeep.ai", "https://www.deepkeep.ai"],
    li: ["https://www.linkedin.com/company/deepkeep"],
    ytp: ["https://www.youtube.com/@deepkeep_ai"],
    _meta: { isHomepage: true, isVerified: true }
  },
  DeviceTotal: {
    ws: ["https://community.devicetotal.com", "https://devicetotal.com"],
    li: ["https://www.linkedin.com/company/device-total"],
    fb: ["https://www.facebook.com/devicetotal"],
    tw: ["https://x.com/device_total"],
    ytc: "https://www.youtube.com/channel/UCitOXc5oKDe857blJfaZwxQ",
    ytp: ["https://www.youtube.com/@devicetotal950"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Diagnostic Robotics": {
    ws: ["https://www.diagnosticrobotics.com"],
    li: ["https://www.linkedin.com/company/diagnostic-robotics"],
    tw: ["https://x.com/diagnosticrobo"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Dig: {
    ws: ["https://dig.ai"],
    li: ["https://www.linkedin.com/company/dig-ai"],
    urls: ["https://dig.teamme.link"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Discure Technologies": {
    ws: ["https://discuremd.com"],
    li: ["https://www.linkedin.com/company/discure-technologies"],
    urls: ["http://imaginet.co.il"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  "DreaMed Diabetes": {
    ws: ["https://dreamed-diabetes.com"],
    urls: ["https://dreamed.ai"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Dream Security": {
    ws: ["https://dreamgroup.com"],
    li: ["https://www.linkedin.com/company/dreamsecurity"],
    _meta: { isHomepage: true, isVerified: true }
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
    ytp: ["https://www.youtube.com/@DriveNets"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "DriveU.auto": {
    ws: ["https://driveu.auto"],
    li: ["https://www.linkedin.com/company/driveu-tech"],
    fb: ["https://www.facebook.com/driveuauto-103756018495642"],
    tw: ["https://x.com/driveuauto"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Dror Ortho-Design": {
    ws: ["https://zsmile.com"],
    urls: ["https://web3d.co.il"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Droxi: {
    ws: ["https://www.droxi.ai"],
    li: ["https://www.linkedin.com/company/droxi"],
    tw: ["https://x.com/droxi_ai"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Dymension: {
    ws: [
      "https://blog.dymension.xyz",
      "https://docs.dymension.xyz",
      "https://dymension.xyz",
      "https://eibc.dymension.xyz",
      "https://forum.dymension.xyz",
      "https://litepaper.dymension.xyz",
      "https://portal.dymension.xyz",
      "https://status.dymension.xyz"
    ],
    tw: ["https://x.com/dymension"],
    gh: ["https://github.com/dymensionxyz"],
    urls: [
      "https://blog.dymension.xyz",
      "https://discord.gg/dymension",
      "https://dym.fyi",
      "https://dym.fyi/ibc",
      "https://t.me/dymensionXYZ"
    ],
    _meta: { isHomepage: true, isVerified: true }
  },
  "ELSE Nutrition": {
    ws: ["https://elsenutrition.com", "https://hcp.elsenutrition.com", "https://investors.elsenutrition.com"],
    li: ["https://www.linkedin.com/company/else-nutrition"],
    fb: ["https://www.facebook.com/elsenutrition"],
    ig: ["https://www.instagram.com/elsenutrition"],
    ytc: "https://www.youtube.com/channel/UCW2tFCFxCC5xrR66xXdRlgA",
    tt: ["https://www.tiktok.com/@elsenutrition.us"],
    urls: [
      "https://else-nutrition.myshopify.com/tools/perfect-product-finder/best-product-for-you",
      "https://investor-relations-3d544a.webflow.io",
      "https://www.amazon.com/stores/ElseNutrition/page/2E63C7E5-A3C0-4263-A52D-566DEE3C44C6"
    ],
    ytp: ["https://www.youtube.com/@elsenutrition"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "ENTERA BIO": {
    ws: ["https://enterabio.com", "https://investors.enterabio.com"],
    li: ["https://www.linkedin.com/company/entera-bio"],
    fb: ["https://www.facebook.com/enterabio"],
    tw: ["https://x.com/enterabio"],
    ig: ["https://www.instagram.com/entera.bio"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Early Technologies": {
    ws: ["https://docs.startearly.ai", "https://www.startearly.ai"],
    li: ["https://www.linkedin.com/company/earlyai"],
    tw: ["https://x.com/startearly_ai"],
    gh: ["https://github.com/earlyai"],
    urls: ["https://join.slack.com/t/earlyaicommunity/shared_invite/zt-335v5plz9-RkBKxV_1ZLCAorxSK8gmfg"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Earnix: {
    fb: ["https://www.facebook.com/earnix"],
    tw: ["https://x.com/Earnix_Inc"],
    ig: ["https://www.instagram.com/earnix_inc"],
    gh: ["https://github.com/Earnix"],
    ytp: ["https://www.youtube.com/@Earnix_Inc"],
    urls: ["https://play.google.com/store/apps/developer?id=Earnix+Ltd"],
    android_dev_id: "mobile.app1hh7BC4Jb6",
    _meta: { isVerified: true, isBrowserVerified: true }
  },
  EasySend: {
    ws: ["https://apps.easysend.io", "https://easysend.io", "https://journeys.easysend.io", "https://kb.easysend.io"],
    li: ["https://www.linkedin.com/company/easysend"],
    fb: ["https://www.facebook.com/EasySendSolutions"],
    tw: ["https://x.com/easy_send"],
    ytc: ["https://www.youtube.com/channel/UCaXDqGp897G3b7T-9YCo4dg"],
    ytp: ["https://www.youtube.com/@easy_send"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Econergy Renewable Energy": {
    ws: ["https://www.econergytech.com"],
    li: ["https://www.linkedin.com/company/econergy-renewable-energy-ltd"],
    urls: ["https://www.econergytech.com", "https://www.econergytech.com/contact"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Ecoppia: {
    ws: ["https://ir.ecoppia.com", "https://www.ecoppia.com"],
    li: ["https://www.linkedin.com/company/ecoppia"],
    ytc: "https://www.youtube.com/channel/UC449JEh2HGf19ZxYqHAvKZg",
    urls: ["https://ir.ecoppia.com/en", "https://www.richkid.co.il"],
    ytp: ["https://www.youtube.com/@Ecoppia"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Efficient Frontier": {
    ws: ["https://efrontier.io"],
    li: ["https://www.linkedin.com/company/efficientfrontier"],
    tw: ["https://x.com/efrontier_io"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Elbit Systems": {
    ws: ["https://www.elbitsystems.com", "https://elbitsystemscareer.com"],
    li: ["https://www.linkedin.com/company/elbitsystems"],
    fb: ["https://www.facebook.com/elbitsystemsltd"],
    tw: ["https://x.com/ElbitSystemsLtd"],
    ytp: ["https://www.youtube.com/elbitsystems"],
    urls: ["https://www.comrax.com"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Elementary Data": {
    ws: ["https://docs.elementary-data.com", "https://www.elementary-data.com"],
    li: ["https://www.linkedin.com/company/elementary-data"],
    gh: ["https://github.com/elementary-data"],
    urls: [
      "https://elementary-data.frontegg.com/oauth/account/login",
      "https://elementary-data.frontegg.com/oauth/account/sign-up",
      "https://www.elementary-data.com/community"
    ],
    _meta: { isHomepage: true, isVerified: true }
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
    ytp: ["https://www.youtube.com/@Elementor"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Eleven Therapeutics": {
    ws: ["https://eleventx.com"],
    li: ["https://www.linkedin.com/company/eleventx"],
    tw: ["https://x.com/eleventx"],
    urls: ["https://eleventx.com"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Emerix: {
    ws: ["https://www.emerix.ai"],
    li: ["https://www.linkedin.com/company/emerixai"],
    urls: ["https://app.getcontrast.io/emerix", "https://calendly.com/arielpalones/emerix-demo"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isVerified: true, isBrowserVerified: true }
  },
  EndoSpan: {
    ws: ["https://www.endospan.com"],
    li: ["https://www.linkedin.com/company/endospan"],
    fb: ["https://www.facebook.com/endospan"],
    tw: ["https://x.com/endospanltd"],
    ytc: "https://www.youtube.com/channel/UCJg9YoqBe3wEm-Qs616tdyw",
    ytp: ["https://www.youtube.com/@endospanltd7002"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Enlight Renewable Energy": {
    ws: ["https://enlightenergy.co.il"],
    li: ["https://www.linkedin.com/company/9025493"],
    fb: ["https://www.facebook.com/enlightrenewableenergy"],
    tw: ["https://x.com/enlight_re"],
    ig: ["https://www.instagram.com/enlight.renewable.energy"],
    ytp: ["https://www.youtube.com/@enlightrenewableenergy"],
    urls: ["https://a-2-z.co.il"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Entrio: {
    ws: ["https://docs.entrio.io", "https://www.entrio.io"],
    li: ["https://www.linkedin.com/company/entrioplatform"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Envizion Medical": {
    ws: ["https://www.envizionmed.com"],
    urls: ["https://envuemed.com"],
    _meta: { isHomepage: true }
  },
  Equinom: {
    ws: ["https://www.equi-nom.com"],
    li: ["https://www.linkedin.com/company/equinom", "https://www.linkedin.com/company/orangeeclipse-studio"],
    ytc: "https://www.youtube.com/channel/UC-5PAy0xsYuvkeU1ePBlZHg",
    ytp: ["https://www.youtube.com/@Equinom"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Ever After Foods": {
    ws: ["https://everafterfoods.com"],
    urls: [
      "https://everafterfoods.com/cookie-policy",
      "https://everafterfoods.com/privacy-policy",
      "https://everafterfoods.com/terms-and-conditions"
    ],
    _meta: { isHomepage: true, isVerified: true }
  },
  Everafter: {
    ws: ["https://app.everafter.ai", "https://www.everafter.ai"],
    li: ["https://www.linkedin.com/company/everafter-ai"],
    fb: ["https://www.facebook.com/everafterai"],
    ig: ["https://www.instagram.com/everafter.ai"],
    ytp: ["https://www.youtube.com/@customerhappilyeverafter"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Eviation Aircraft": {
    ws: ["https://www.eviation.com"],
    li: ["https://www.linkedin.com/company/eviation-aircraft-ltd"],
    ytc: "https://www.youtube.com/channel/UC8rr4q717HUrQHiIES6DcaQ",
    ytp: ["https://www.youtube.com/@eviationaircraftinc.5845"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Evinature: {
    ws: ["https://evinature.com", "https://shop.evinature.com"],
    li: ["https://www.linkedin.com/company/evinature"],
    fb: ["https://www.facebook.com/evinature"],
    ig: ["https://www.instagram.com/evinature"],
    tt: ["https://www.tiktok.com/@evinature"],
    _meta: { isHomepage: true }
  },
  Evogene: {
    ws: ["https://evogene.com"],
    li: ["https://www.linkedin.com/company/evogene"],
    fb: ["https://www.facebook.com/evogene123"],
    ytp: ["https://www.youtube.com/@evogeneltd."],
    urls: ["https://attractive.co.il", "https://www.sec.gov/cgi-bin/browse-edgar"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Exero Medical": {
    ws: ["https://exeromedical.com"],
    li: ["https://www.linkedin.com/company/18838545"],
    tw: ["https://x.com/exeromedical"],
    urls: ["https://www.medxelerator.com"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Exosomm: { ws: ["https://www.exosomm.com"], _meta: { isHomepage: true, isVerified: true } },
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
    _meta: { isHomepage: true, isVerified: true }
  },
  EyeControl: {
    ws: ["https://www.eyecontrol.co.il"],
    li: ["https://www.linkedin.com/company/eyecontrol"],
    fb: ["https://www.facebook.com/eyecontrol"],
    _meta: { isHomepage: true }
  },
  FEMSelect: {
    ws: ["https://www.femselect.com"],
    li: ["https://www.linkedin.com/company/28632694"],
    fb: ["https://www.facebook.com/FEMSelect"],
    tw: ["https://twitter.com/FEMSelect"],
    ig: ["https://www.instagram.com/fem.select"],
    ytc: ["https://www.youtube.com/channel/UCUXuID-G3yt22gTkPV8Ovuw"],
    ytp: ["https://www.youtube.com/@femselect4756"],
    _meta: { isHomepage: true, isVerified: true }
  },
  FINQ: {
    ws: ["https://finqai.com", "https://press.finqai.com"],
    li: ["https://www.linkedin.com/company/finqai"],
    fb: ["https://www.facebook.com/finqai"],
    tw: ["https://x.com/finq_ai"],
    ig: ["https://www.instagram.com/finq_ai"],
    ytc: "https://www.youtube.com/channel/UCmtuNwfh-yV4D5YHH9VuyuA",
    ytp: ["https://www.youtube.com/@FINQ-AI"],
    _meta: { isHomepage: true, isVerified: true }
  },
  FIRMUS: {
    ws: ["https://firmus.ai"],
    li: ["https://www.linkedin.com/company/firmusai"],
    tw: ["https://x.com/firmus_ai"],
    ytp: ["https://www.youtube.com/@firmus-ai"],
    urls: ["http://firmus.local", "https://firmus.ninja/website", "https://firmus.us.auth0.com/login"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "FIZE Medical": {
    ws: ["https://fizemedical.com"],
    li: ["https://www.linkedin.com/company/fize-medical"],
    ytc: "https://www.youtube.com/channel/UCPqxRAZdpqeM935Zgn3aq7Q",
    urls: ["https://okimta.com", "https://www.kukushka.co.il"],
    ytp: ["https://www.youtube.com/@FIZEMedical"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Factify: {
    ws: ["https://developers.factify.com", "https://www.factify.com"],
    li: ["https://www.linkedin.com/company/factifyinc"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  Faireez: {
    ws: ["https://faireez.com", "https://getapp.faireez.com", "https://register.faireez.com"],
    li: ["https://www.linkedin.com/company/faireez"],
    ig: ["https://www.instagram.com/faireez_inc"],
    ytp: ["https://www.youtube.com/@faireez2810"],
    urls: ["https://getapp.faireez.com/DauJ/ledadit1"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Fairgen: {
    ws: ["https://app.fairgen.ai", "https://europe.fairgen.ai", "https://www.fairgen.ai"],
    li: ["https://www.linkedin.com/company/fairgen"],
    urls: [
      "https://techcrunch.com/2024/05/09/fairgen-boosts-survey-results-using-synthetic-data-and-ai-generated-responses"
    ],
    _meta: { isHomepage: true, isVerified: true }
  },
  Fanton: {
    ws: ["https://fan-ton.com"],
    tw: ["https://x.com/fantasyfanton"],
    urls: [
      "https://discord.gg/j6AZZs5bjU",
      "https://t.me/FanTonGameBot",
      "https://t.me/FanTonGameBot/app",
      "https://t.me/fanton"
    ],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  FeelBetter: {
    ws: ["https://www.feelbetter.healthcare"],
    li: ["https://www.linkedin.com/company/feelbetter-ltd"],
    urls: ["https://www.feelbetter.healthcare/privacy-policy"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Fermata: {
    ws: ["https://www.fermata.tech"],
    li: ["https://www.linkedin.com/company/19152085"],
    fb: ["https://www.facebook.com/fermatatechnology"],
    tw: ["https://x.com/fermatatech"],
    ig: ["https://www.instagram.com/fermatatech"],
    urls: ["https://www.fermata.tech/privacy_policy"],
    _meta: { isHomepage: true, isVerified: true }
  },
  FertilAI: {
    ws: ["https://www.fertilai.com"],
    li: ["https://www.linkedin.com/company/74549314", "https://www.linkedin.com/company/fertilai"],
    fb: ["https://www.facebook.com/fertilai"],
    _meta: { isHomepage: true }
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
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  Fincom: {
    ws: ["https://fincom.co"],
    li: ["https://www.linkedin.com/company/fincom-co"],
    ytc: ["https://www.youtube.com/channel/UCh3FDPSgY2Njx-foiXdgHjw"],
    ytp: ["https://www.youtube.com/@fincom9192"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  FireDome: {
    ws: ["https://www.fire-dome.com"],
    li: ["https://www.linkedin.com/company/firedomereclaimtomorrow"],
    urls: ["https://meetings.hubspot.com/inquiries-firedome/30-min"],
    _meta: { isHomepage: true, isVerified: true }
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
    ytp: ["https://www.youtube.com/@thedataengineeringshow", "https://www.youtube.com/@FireboltHQ"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  "Firefly Neuroscience": {
    ws: ["https://fireflyneuro.com"],
    li: ["https://ca.linkedin.com/company/fireflyneuroscience"],
    tw: ["https://twitter.com/whatsyourbna"],
    urls: ["http://investors.fireflyneuro.com", "https://operaticagency.com", "https://www.mybna.com"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Firmbase: {
    ws: ["https://firmbase.ai"],
    li: ["https://www.linkedin.com/company/firmbase-ai"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Five Sigma": {
    ws: ["https://fivesigmalabs.com"],
    li: ["https://www.linkedin.com/company/five-sigma"],
    fb: ["https://www.facebook.com/fivesigmasolutions"],
    tw: ["https://x.com/fivesigmaclaims"],
    ig: ["https://www.instagram.com/fivesigmaclaims"],
    ytp: ["https://www.youtube.com/@fivesigmaai"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  Flytrex: {
    ws: ["https://www.flytrex.com"],
    li: ["https://il.linkedin.com/company/flytrex"],
    fb: ["https://www.facebook.com/Flytrex"],
    tw: ["https://twitter.com/flytrex"],
    ig: ["https://instagram.com/flytrex"],
    urls: ["https://apps.apple.com/app/apple-store/id1479695237"],
    android_app_ids: ["com.flytrex.foodapp"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "ForSight Robotics": {
    ws: ["https://www.forsightrobotics.com"],
    li: ["https://www.linkedin.com/company/forsightrobotics"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Foretellix: {
    ws: ["https://www.foretellix.com"],
    li: ["https://www.linkedin.com/company/foretellix"],
    fb: ["https://www.facebook.com/foretellix"],
    tw: ["https://x.com/foretellixhq"],
    ytp: ["https://www.youtube.com/@foretellix"],
    ytc: ["https://www.youtube.com/channel/UC1_RHjB1GlgKrewVk4GZCyQ"],
    urls: ["https://foretellix.cn"],
    _meta: { isHomepage: true }
  },
  "Forsea Foods": {
    ws: ["https://www.forseafoods.com"],
    li: ["https://www.linkedin.com/company/forseafoods"],
    _meta: { isHomepage: true }
  },
  Forwrd: {
    ws: ["https://help.forwrd.ai", "https://www.forwrd.ai"],
    li: ["https://www.linkedin.com/company/forwrdai"],
    ytp: ["https://www.youtube.com/@forwrdai3244"],
    urls: [
      "https://ecosystem.hubspot.com/marketplace/apps/forwrd-ai-347515",
      "https://eu1.hubs.ly/H0g-xxt0",
      "https://eu1.hubs.ly/H0g-xyg0",
      "https://hirepivot.ai",
      "https://share-eu1.hsforms.com/1uS6IqFbFQ0qekB-qxGV8oAfduhl"
    ],
    _meta: { isHomepage: true, isVerified: true }
  },
  FreezeM: {
    ws: ["https://www.freezem.com"],
    li: ["https://www.linkedin.com/company/freezem"],
    fb: ["https://www.facebook.com/freezem-102195254834998"],
    tw: ["https://x.com/freezem5"],
    ig: ["https://www.instagram.com/freezem_bsf"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Fuse.io": {
    ws: [
      "https://console.fuse.io",
      "https://docs.fuse.io",
      "https://explorer.fuse.io",
      "https://forum.fuse.io",
      "https://news.fuse.io",
      "https://safe.fuse.io",
      "https://status.fuse.io",
      "https://www.fuse.io"
    ],
    li: ["https://www.linkedin.com/company/fuseio"],
    tw: ["https://x.com/fuse_network"],
    gh: ["https://github.com/fuseio"],
    ytp: ["https://www.youtube.com/@fusenetwork"],
    ytc: ["https://www.youtube.com/channel/@fusenetwork"],
    urls: [
      "https://artrific.io",
      "https://discord.com/invite/jpPMeSZ",
      "https://fuse.freshteam.com/jobs",
      "https://t.me/fuseio",
      "https://voltage.finance",
      "https://www.chargeweb3.com"
    ],
    _meta: { isHomepage: true, isVerified: true }
  },
  "GK8 by Galaxy": {
    ws: ["https://www.gk8.io"],
    li: ["https://www.linkedin.com/company/gk8"],
    ytc: "https://www.youtube.com/channel/UCGD5TAhTYij6JgVeZgc3QTA",
    urls: [
      "https://cta-eu1.hubspot.com/web-interactives/public/v1/track/click",
      "https://www.galaxy.com",
      "https://www.galaxy.com/insights/research"
    ],
    ytp: ["https://www.youtube.com/@gk8bygalaxy"],
    _meta: { isHomepage: true, isVerified: true }
  },
  GOARC: {
    ws: ["https://go-arc.com"],
    li: ["https://www.linkedin.com/company/goarc"],
    urls: ["https://cta-redirect.hubspot.com/cta/redirect/9293548/89da0f61-57bd-413e-903d-90ba3c1d91b4"],
    _meta: { isHomepage: true }
  },
  Gadfin: {
    ws: ["https://www.gadfin.com"],
    li: ["https://www.linkedin.com/company/gadfin"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Gankster: {
    ws: [
      "https://app.gankster.gg",
      "https://duos.gankster.gg",
      "https://fortnite.gankster.gg",
      "https://gankster.gg",
      "https://lol.gankster.gg",
      "https://rocketleague.gankster.gg",
      "https://valorant.gankster.gg"
    ],
    li: ["https://www.linkedin.com/company/gankster"],
    tw: ["https://x.com/gankstergg"],
    urls: ["https://apps.apple.com/us/app/gankster-duos/id6755520323", "https://discord.gg/gankster"],
    android_app_ids: ["gg.duos.app"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Gauzy: {
    ws: ["https://www.gauzy.com"],
    li: ["https://www.linkedin.com/company/2860964", "https://www.linkedin.com/company/gauzycorp"],
    fb: ["https://www.facebook.com/GauzyLTD"],
    tw: ["https://x.com/Gauzycorp"],
    ig: ["https://www.instagram.com/gauzycorp"],
    ytc: ["https://www.youtube.com/channel/UC0itHds1xz1FR5bDJIqOANA"],
    urls: ["https://investors.gauzy.com", "https://vsc.gsa.gov/drupal/node/138"],
    ytp: ["https://www.youtube.com/@gauzycorp", "https://www.youtube.com/@gauzy"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Gavan: {
    ws: ["https://www.gavan.bio"],
    li: ["https://www.linkedin.com/company/gavan"],
    urls: ["https://www.gavan.bio", "https://www.wearethreesixty.com", "https://www.wixit.co.il"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Gaviti: {
    ws: ["https://app.gaviti.com", "https://gaviti.com", "https://go.gaviti.com"],
    li: ["https://www.linkedin.com/company/gaviti"],
    fb: ["https://www.facebook.com/gavitii"],
    urls: [
      "https://www.g2.com/products/gaviti/reviews/gaviti-review-8769579",
      "https://www.g2.com/products/gaviti/reviews/gaviti-review-9853344",
      "https://www.g2.com/products/gaviti/reviews/gaviti-review-9875846",
      "https://www.g2.com/products/gaviti/reviews/gaviti-review-9938424"
    ],
    _meta: { isHomepage: true, isVerified: true }
  },
  GeoX: { ws: ["https://app.geox.ai"], _meta: { isHomepage: true, isVerified: true } },
  "Gigantic LTD (Clawee)": {
    ws: ["https://clawee.com", "https://store.clawee.com"],
    fb: ["https://www.facebook.com/claweeisawesome"],
    ig: ["https://www.instagram.com/clawee_app"],
    ytc: "https://www.youtube.com/channel/UCgiC6WcWk9IM1Hnr_KQuGkg",
    urls: [
      "https://clawee.onelink.me/IiA3/claweedotcom",
      "https://go.onelink.me/app/AdroidGooglePlay",
      "https://go.onelink.me/app/Appstore"
    ],
    ytp: ["https://www.youtube.com/@Clawee"],
    android_app_ids: ["com.gigantic.clawee"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Gilat Satellite Networks": {
    ws: ["https://connect.gilat.com", "https://www.gilat.com"],
    li: ["https://www.linkedin.com/company/gilat-defense", "https://www.linkedin.com/company/gilat-satellite-networks"],
    fb: ["https://www.facebook.com/gilat.satellite.networks"],
    tw: ["https://x.com/gilatsatnet"],
    ytp: ["https://www.youtube.com/@gilatsatellitenet"],
    urls: ["https://entry.co.il", "https://firmabrands.com"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Grain: {
    ws: ["https://www.grainfinance.com"],
    li: ["https://www.linkedin.com/company/grainfinance"],
    tw: ["https://x.com/grainfinance_co"],
    urls: ["https://console.grainfinance.co"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  "Green Invoice": {
    ws: ["https://auth.greeninvoice.co.il", "https://lp.greeninvoice.co.il", "https://www.greeninvoice.co.il"],
    li: ["https://www.linkedin.com/company/greeninvoice"],
    fb: ["https://www.facebook.com/green.invoice"],
    ig: ["https://www.instagram.com/morning_greeninvoice"],
    ytp: ["https://www.youtube.com/@greeninvoiceisrael"],
    _meta: { isHomepage: true, isVerified: true }
  },
  GreenOnyx: {
    ws: ["https://www.greenonyx.ag"],
    li: ["https://www.linkedin.com/company/greenonyx"],
    fb: ["https://www.facebook.com/greenonyx.ag"],
    tw: ["https://x.com/_greenonyx"],
    ig: ["https://www.instagram.com/greenonyx.ag"],
    ytp: ["https://www.youtube.com/@greenonyx.youtube"],
    urls: ["https://wa.me/972546337875"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  "Grip Security": {
    ws: ["https://www.grip.security"],
    li: ["https://www.linkedin.com/company/grip-security"],
    urls: ["https://get.grip.security/demo-request.html", "https://help.grip.security"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Groundwork BioAg": {
    ws: ["https://groundworkbioag.com"],
    li: ["https://www.linkedin.com/company/5022013"],
    fb: ["https://www.facebook.com/groundworkbioag"],
    tw: ["https://x.com/groundworkbioag"],
    ig: ["https://www.instagram.com/groundworkbioag"],
    ytc: "https://www.youtube.com/channel/UCTmjog_vNV8AeH8xKigzEDA",
    urls: ["https://ego-digital.com"],
    ytp: ["https://www.youtube.com/@groundworkbioagltd.8359"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Guardoc Health": {
    ws: ["https://www.guardoc.health"],
    urls: [
      "https://guardoc.health/support",
      "https://www.guardoc.health/privacy-policy",
      "https://www.guardoc.health/terms-of-use"
    ],
    _meta: { isHomepage: true, isVerified: true }
  },
  H2Pro: {
    ws: ["https://www.h2pro.co"],
    li: ["https://www.linkedin.com/company/h2pro"],
    urls: ["https://www.h2pro.co"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "HAAT Delivery": {
    ws: ["https://careers.haat.delivery", "https://haat.delivery"],
    li: ["https://www.linkedin.com/company/haat-delivery"],
    fb: ["https://www.facebook.com/haatapp"],
    ig: ["https://www.instagram.com/haat.delivery"],
    ytc: "https://www.youtube.com/channel/UCl5olLUQ17Sw064XGhoslxA",
    tt: ["https://www.tiktok.com/@haat.delivery"],
    urls: ["https://haat.onelink.me/3ap7/dl7rq3bc"],
    ytp: ["https://www.youtube.com/@haat.delivery"],
    _meta: { isHomepage: true, isVerified: true }
  },
  HELFY: {
    ws: ["https://helfy.co"],
    urls: ["https://helfy.co", "https://helfy.co/careers", "https://helfy.co/contact"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "HUB Security": {
    ws: ["https://hub-technologies.com", "https://investors.hubsecurity.com"],
    li: "https://www.linkedin.com/company/hubtechnologiescom",
    tw: ["https://twitter.com/hubsecurityio"],
    ytp: ["https://www.youtube.com/@HUBSecurityio"],
    urls: ["https://hubsecurity.com/hubtechnologies", "https://www.comeet.com/jobs/hub-technologies/07.00F"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Hailo: {
    ws: ["https://hailo.ai"],
    li: ["https://www.linkedin.com/company/hailo-ai"],
    fb: ["https://www.facebook.com/HailoTech"],
    tw: ["https://twitter.com/Hailo_ai"],
    ig: ["https://www.instagram.com/life_at_hailo"],
    ytc: ["https://www.youtube.com/channel/UCJyQfXEbUVHhiXM_Lc9e2aw"],
    urls: ["https://community.hailo.ai", "https://community.hailo.ai/session/sso"],
    ytp: ["https://www.youtube.com/@hailo2062"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Healthy.io": {
    ws: ["https://blog.healthy.io", "https://healthy.io"],
    li: ["https://www.linkedin.com/company/www-healthy-io"],
    fb: ["https://www.facebook.com/healthy.ioLTD"],
    tw: ["https://twitter.com/healthyio1"],
    urls: ["https://blog.healthy.io", "https://minuteful.com"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Helios: {
    ws: ["https://heliosmatters.com"],
    li: ["https://www.linkedin.com/company/project-helios"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  "Hi Auto": {
    ws: ["https://hi.auto"],
    li: ["https://www.linkedin.com/company/hi-auto"],
    ytp: ["https://www.youtube.com/@hiauto5439"],
    urls: ["http://lab2.online"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "High Lander": {
    ws: ["https://www.highlander.io"],
    li: ["https://www.linkedin.com/company/high-lander"],
    urls: [
      "https://www.highlander.io/about-us",
      "https://www.highlander.io/copy-of-israel-vega-utm",
      "https://www.highlander.io/highsite",
      "https://www.highlander.io/orion",
      "https://www.highlander.io/privacy",
      "https://www.highlander.io/rom360",
      "https://www.highlander.io/terms-of-use",
      "https://www.highlander.io/vega"
    ],
    _meta: { isHomepage: true, isVerified: true }
  },
  Hirundo: {
    ws: ["https://www.hirundo.io"],
    li: ["https://www.linkedin.com/company/gethirundo"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Hisense: {
    ws: ["https://www.hisense.co.il"],
    fb: ["https://www.facebook.com/babysensemonitors"],
    tw: ["https://x.com/babysensellc"],
    ig: ["https://www.instagram.com/babysensemonitors"],
    urls: ["https://www.avihaim.co.il", "https://www.hisense.co.il", "https://www.pinterest.com/babysensellc"],
    _meta: { isHomepage: true, isVerified: true }
  },
  HiveWare: {
    ws: ["https://hiveware.io"],
    li: ["https://www.linkedin.com/company/hivewaretech%20"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Holisto: {
    ws: ["https://www.holisto.com"],
    urls: ["https://apps.apple.com/us/app/holisto-better-hotel-deals/id1635312687"],
    android_app_ids: ["com.holisto"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Homez: { ws: ["https://www.homez.com"], _meta: { isHomepage: true, isVerified: true } },
  Honeydew: {
    ws: ["https://honeydew.ai"],
    li: ["https://www.linkedin.com/company/honeydewai"],
    tw: ["https://x.com/honeydewai"],
    gh: ["https://github.com/honeydew-ai"],
    urls: [
      "https://app.honeydew.cloud",
      "https://app.snowflake.com/marketplace/listing/GZTSZ14KQ9/honeydew-semantic-layer",
      "https://d2n13204.na1.hs-sales-engage.com/Ctc/2O+23284/d2N13204/Jks2-6qcW69sMD-6lZ3m1W4rlVn67b45FfW8YGgzv541ShpW1NwmPr7D9sbPW7Hkfd_94jgr1W2_kNdW5JPrGRN95LDx_7NTgQVhx1lS1xvHnBW2GJ06x2WQNCtW2sDW-h7dPBTGW1Whzdr63lFk8W71VqBc7j6QcyW6ZptLv7gFl80W5tD3Z33mQgNJVfRKRM5ym-sLMBPrY8PM5-yW6dgwZc16qv5yW3fCj7d8Lg9F2W27bfZp9lt90MN5-xP4P8q7FHW5LYyhJ8GynK1f8Z81N604"
    ],
    _meta: { isHomepage: true, isVerified: true }
  },
  Hoopo: {
    ws: ["https://platform.hoopo.tech", "https://support.hoopo.tech", "https://www.hoopo.tech"],
    li: ["https://www.linkedin.com/company/hoopo"],
    fb: ["https://www.facebook.com/hooposystems"],
    tw: ["https://x.com/hoopoiot"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Hopper: {
    ws: ["https://app.hopper.security", "https://www.hopper.security"],
    li: ["https://www.linkedin.com/company/hopper-security"],
    ytc: "https://www.youtube.com/channel/UC9HerOnFOwz2I8jkiu5z6Lw",
    ytp: ["https://www.youtube.com/@HopperSecurity"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  Hunters: {
    ws: ["https://go.hunters.security", "https://www.hunters.security"],
    li: ["https://www.linkedin.com/company/hunters-ai"],
    tw: ["https://x.com/hunters_ai"],
    ig: ["https://www.instagram.com/lifeathunters"],
    ytc: "https://www.youtube.com/channel/UCUufMdZ-6mS4dqEFI81IRKw",
    urls: ["https://docs.hunters.ai/docs/updates", "https://trust.hunters.ai"],
    ytp: ["https://www.youtube.com/@hunters_security"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "HyperGuest Ltd.": {
    ws: ["https://app.hyperguest.com", "https://www.hyperguest.com"],
    li: ["https://www.linkedin.com/company/hyperguest"],
    ytp: ["https://www.youtube.com/@hyperguest11"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isVerified: true, isBrowserVerified: true }
  },
  Hyperspace: {
    ws: ["https://docs.hyper-space.io", "https://www.hyper-space.io"],
    li: ["https://www.linkedin.com/company/hyperspace-db"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "IBI-Ag": {
    ws: ["https://www.ibi-ag.com"],
    li: ["https://www.linkedin.com/company/ibi-ag"],
    _meta: { isHomepage: true }
  },
  "IM Cannabis": {
    ws: ["https://imcannabis.com", "https://investors.imcannabis.com"],
    urls: [
      "https://imcannabis.com/about",
      "https://imcannabis.com/contact",
      "https://imcannabis.com/he/%d7%9e%d7%93%d7%99%d7%a0%d7%99%d7%95%d7%aa-%d7%a4%d7%a8%d7%98%d7%99%d7%95%d7%aa",
      "https://imcannabis.com/privacy-policy",
      "https://imcannabis.com/term-of-use",
      "https://investors.imcannabis.com"
    ],
    _meta: { isHomepage: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  INNOVENTRIC: {
    ws: ["https://innoventric.com"],
    urls: ["https://innoventric.com", "https://pearlcom.co.il", "https://pearlcom.co.il/strategy"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "IO River": {
    ws: ["https://manage.ioriver.io", "https://security.ioriver.io", "https://www.ioriver.io"],
    li: ["https://www.linkedin.com/company/io-river"],
    ytp: ["https://www.youtube.com/@ioriver"],
    urls: [
      "https://aws.amazon.com/marketplace/pp/prodview-e35cd5uxgxtcm",
      "https://console.cloud.google.com/marketplace/product/ioriver-public/virtual-edge-orchestration",
      "https://cta-eu1.hubspot.com/ctas/v2/public/cs/c"
    ],
    _meta: { isHomepage: true, isVerified: true }
  },
  IONIX: {
    ws: ["https://www.ionix.io"],
    li: ["https://www.linkedin.com/company/ionix-security"],
    tw: ["https://twitter.com/ionix_io"],
    urls: ["https://portal.ionix.io/login"],
    _meta: { isHomepage: true, isVerified: true }
  },
  IVIX: {
    ws: ["https://www.ivix.ai"],
    li: ["https://www.linkedin.com/company/ivix-ai"],
    tw: ["https://x.com/ivix_ai"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Igentify: {
    ws: ["https://www.igentify.com"],
    li: ["https://www.linkedin.com/company/igentify"],
    fb: ["https://www.facebook.com/igentify"],
    tw: ["https://x.com/igentifycounsel"],
    urls: [
      "https://www.igentify.com/article",
      "https://www.igentify.com/company",
      "https://www.igentify.com/media-center",
      "https://www.igentify.com/products/access",
      "https://www.igentify.com/products/igentify-analyze",
      "https://www.igentify.com/products/igentify-counsel",
      "https://www.igentify.com/products/igentify-insight",
      "https://www.igentify.com/solutions"
    ],
    _meta: { isHomepage: true, isVerified: true }
  },
  Iguazio: {
    ws: ["https://go.iguazio.com", "https://www.iguazio.com"],
    li: ["https://www.linkedin.com/company/iguazio"],
    fb: ["https://www.facebook.com/iguazio"],
    tw: ["https://x.com/iguazio"],
    gh: ["https://github.com/nuclio"],
    ytp: ["https://www.youtube.com/@iguazio"],
    ytc: "https://www.youtube.com/channel/UChmi6ZzsZd9doYYVut1ppUg",
    urls: ["https://www.iguazio.com/blog"],
    _meta: { isHomepage: true, isVerified: true }
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
    ytc: "https://www.youtube.com/channel/UCIvtJgsrUzFo90NKeiVozhQ",
    ytp: ["https://www.youtube.com/@proofpoint"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "ImPact Biotech": {
    ws: ["https://impactbiotech.com"],
    urls: ["https://impactbiotech.com"],
    _meta: { isHomepage: true, isVerified: true }
  },
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
    _meta: { isHomepage: true, isVerified: true }
  },
  Imagindairy: {
    ws: ["https://imagindairy.com"],
    li: ["https://www.linkedin.com/company/imagindairy-ltd"],
    tw: ["https://x.com/imagindairy"],
    ig: ["https://www.instagram.com/imagindairy"],
    ytp: ["https://www.youtube.com/@imagindairy"],
    urls: ["https://imagindairy.com", "https://ltu.co.il"],
    _meta: { isHomepage: true, isVerified: true }
  },
  InSightec: {
    ws: ["https://distributor.insightec.com", "https://documentation.insightec.com", "https://insightec.com"],
    li: ["https://www.linkedin.com/company/insightec"],
    fb: ["https://www.facebook.com/insightec.mrgfus"],
    tw: ["https://x.com/insightec"],
    ytc: "https://www.youtube.com/channel/UCFKMAN-01TyFr-t6KuWlHUg",
    ytp: ["https://www.youtube.com/@insightec4135"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  Incredo: {
    ws: ["https://www.incredo.com"],
    li: "https://www.linkedin.com/company/incredo1",
    fb: ["https://www.facebook.com/incredosugar"],
    ig: ["https://www.instagram.com/incredosugar"],
    urls: ["https://awesometlv.co.il"],
    _meta: { isHomepage: true, isVerified: true }
  },
  InfiniGrow: {
    ws: ["https://app.infinigrow.com", "https://infinigrow.com"],
    li: ["https://www.linkedin.com/company/infinigrow"],
    urls: [
      "https://investors.amplitude.com/news-releases/news-release-details/amplitude-acquires-infinigrow-bring-revenue-analytics-marketers"
    ],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  Infinipoint: {
    ws: ["https://infinipoint.io", "https://status.infinipoint.io", "https://support.infinipoint.io"],
    li: ["https://www.linkedin.com/company/infinipointsec"],
    fb: ["https://www.facebook.com/infinipointsec"],
    ytp: ["https://www.youtube.com/@infinipoint"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  Ingrediome: {
    ws: ["https://www.ingrediome.com"],
    li: ["https://www.linkedin.com/company/ingrediome"],
    urls: [
      "https://techcrunch.com/2024/02/26/ingrediome-israeli-startup-lab-protein-taste-food-tech",
      "https://www.growthmentor.com/startup-accelerators/indiebio/ingrediome"
    ],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Innoviz Technologies": {
    ws: ["https://innoviz.tech", "https://ir.innoviz.tech"],
    li: ["https://www.linkedin.com/company/innoviz-technologies"],
    fb: ["https://www.facebook.com/InnovizTechnologies"],
    tw: ["https://twitter.com/InnovizLiDAR"],
    ytc: ["https://www.youtube.com/channel/UCVc1KFsu2eb20M8pKFwGiFQ"],
    ytp: ["https://www.youtube.com/@innoviztechnologies3315"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  "Intail.ai": {
    ws: ["https://app.orbb.com", "https://orbb.com"],
    urls: ["https://www.nmore.co"],
    _meta: { isHomepage: true, isVerified: true }
  },
  InterCure: {
    ws: ["https://www.intercure.co"],
    urls: ["https://www.canndoc.com"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Inthegame: {
    ws: ["https://www.inthegame.io"],
    li: ["https://www.linkedin.com/company/inthegame-io"],
    fb: ["https://www.facebook.com/inthegame.io"],
    ytp: ["https://www.youtube.com/@inthegame6194"],
    _meta: { isHomepage: true }
  },
  "Intuition Robotics": {
    ws: ["https://www.intuitionrobotics.com"],
    li: ["https://www.linkedin.com/company/intuition-robotics"],
    fb: ["https://www.facebook.com/intuitionrobotics"],
    tw: ["https://twitter.com/intuitionrobo"],
    ig: ["https://instagram.com/intuitionrobotics"],
    ytc: ["https://www.youtube.com/channel/UCo6z_aQZanqiWzpudAvu5Ew"],
    urls: ["https://drive.google.com/drive/folders/1ej0iM68l1MJkJUtGAArm-8E1jFriaPBf", "https://elliq.com"],
    ytp: ["https://www.youtube.com/@IntuitionRobotics"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Israel Innovation Authority": {
    ws: ["https://innovationisrael.org.il"],
    li: ["https://www.linkedin.com/company/5094726/admin"],
    fb: ["https://www.facebook.com/InnovationAuthority"],
    ytc: ["https://www.youtube.com/channel/UCp-kDY6DiCq6PuI6srBaAPw"],
    urls: ["http://innovationisrael.mag.calltext.co.il", "https://www.daatsolutions.co.il"],
    ytp: ["https://www.youtube.com/@Israelinnovationauthority"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Jeffs’ Brands": {
    ws: ["https://jeffsbrands.com"],
    urls: ["https://investor.jeffsbrands.com"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Jiga: {
    ws: ["https://app.jiga.io", "https://jiga.io"],
    li: ["https://www.linkedin.com/company/jiga3d"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  Jotit: {
    ws: ["https://www.jotit.io"],
    li: "https://www.linkedin.com/company/jotit-ed",
    fb: "https://www.facebook.com/Jotit.ed",
    tw: ["https://x.com/wixstudio"],
    ig: "https://www.instagram.com/jotit_ed",
    ytp: "https://www.youtube.com/@jotitedtech",
    tt: ["https://www.tiktok.com/@wix"],
    urls: [
      "https://48602011.hs-sites.com/jotit-knowledge-base",
      "https://48602011.hs-sites.com/jotit-knowledge-base/frequently-asked-questions",
      "https://share.hsforms.com/1gVbesxYPShWMogrYNDzPggsxpjv",
      "https://www.jotit.io"
    ],
    _meta: { isHomepage: true, isVerified: true }
  },
  Joyned: {
    ws: [
      "https://demo.joyned.co",
      "https://joyned.co",
      "https://support.joyned.co",
      "https://traveller-voice.joyned.co"
    ],
    urls: ["https://joyned.co"],
    _meta: { isHomepage: true, isVerified: true }
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
    ytc: "https://www.youtube.com/channel/UCDAGxyyO83qY-_igTpa0bRg",
    urls: [
      "https://careers.junojourney.com",
      "https://team.junojourney.com/learning-table",
      "https://trust.junojourney.com"
    ],
    ytp: ["https://www.youtube.com/@junojourney"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  "KAHR medical": {
    ws: ["https://kahrbio.base44.app"],
    li: ["https://www.linkedin.com/company/kahr-medical-ltd-"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "KAZUAR Advanced Technologies LTD.": {
    ws: ["https://www.kazuar.com"],
    li: ["https://www.linkedin.com/company/kazuar-advanced-technologies-ltd"],
    urls: [
      "https://outlook.office.com/bookwithme/user/94bf760b45f8499ca263613198e9eaa4@kazuar-tech.com/meetingtype/JqyuRLXbjkazZ2R9k5lqQQ2",
      "https://outlook.office.com/bookwithme/user/a6132b130dca46f191fd8fb11ef66b9a@kazuar.com/meetingtype/HSPNHK54FEystnubT7N16w2"
    ],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  KOIOS: {
    ws: ["https://koiostech.ai"],
    li: ["https://www.linkedin.com/company/koiostech"],
    _meta: { isHomepage: true, isVerified: true }
  },
  KTrust: {
    ws: ["https://ktrust.io"],
    urls: ["https://www.godaddy.com/websites/website-builder", "https://www.ktrust.io"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Kamari Pharma": {
    ws: ["https://kamaripharma.com"],
    li: ["https://www.linkedin.com/company/kamari-pharma"],
    urls: ["https://epicod.co.il", "https://overallstudio.co.il"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Kando: {
    ws: ["https://app.kando.eco", "https://impact.kando.eco", "https://new.kando.eco", "https://www.kando.eco"],
    li: ["https://www.linkedin.com/company/kando-environmental-services"],
    fb: ["https://www.facebook.com/kandoclear"],
    tw: ["https://x.com/kandoclear"],
    ytp: ["https://www.youtube.com/@kandoclear"],
    urls: ["https://www.kando.eco"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Kardome: {
    ws: ["https://www.kardome.com"],
    li: ["https://www.linkedin.com/company/kardome"],
    fb: ["https://facebook.com/kardomevui"],
    tw: ["https://x.com/kardomevui"],
    ig: ["https://www.instagram.com/kardomevoice", "https://www.instagram.com/kardomevui"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  "Kela Technologies": {
    ws: ["https://kelasys.com"],
    li: ["https://www.linkedin.com/company/kela-technologies"],
    tw: ["https://x.com/kela_tech"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Kemtai: {
    ws: ["https://kemtai.com"],
    li: ["https://www.linkedin.com/company/42125918"],
    fb: ["https://www.facebook.com/kemtaifitness"],
    tw: ["https://x.com/kemtaiftns"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Kipp Authorize More": {
    ws: ["https://app.letskipp.com", "https://letskipp.com"],
    li: ["https://www.linkedin.com/company/letskipp"],
    tw: ["https://x.com/letskipp_com"],
    ytp: ["https://www.youtube.com/@letskipp"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Kissterra: {
    ws: ["https://kissterra.com"],
    li: ["https://www.linkedin.com/company/kissterra"],
    fb: ["https://www.facebook.com/kissterra"],
    tw: ["https://x.com/kissterra"],
    ig: ["https://www.instagram.com/life_at_kissterra"],
    ytp: ["https://www.youtube.com/@kissterra"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Knostic: {
    ws: ["https://prompts.knostic.ai", "https://www.knostic.ai"],
    li: ["https://www.linkedin.com/company/knostic"],
    tw: ["https://x.com/knosticai"],
    gh: ["https://github.com/knostic"],
    ytp: ["https://www.youtube.com/@knosticai"],
    urls: ["http://privacy-policy", "https://www-knostic-ai.sandbox.hs-sites-eu1.com/industry/government"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Kodem Security": {
    ws: ["https://reg.kodemsecurity.com", "https://www.kodemsecurity.com"],
    li: ["https://www.linkedin.com/company/kodem"],
    ig: ["https://www.instagram.com/life_at_kodem"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Kokomodo: {
    ws: ["https://www.thekokomodo.com"],
    li: ["https://www.linkedin.com/company/kokomodo"],
    urls: ["https://ltu.co.il"],
    _meta: { isHomepage: true, isVerified: true }
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
    li: ["https://www.linkedin.com/company/69529378", "https://www.linkedin.com/company/komodor-k8s"],
    fb: ["https://www.facebook.com/KomodorTroubleshooting"],
    tw: ["https://twitter.com/Komodor_com"],
    gh: [
      "https://github.com/komodorio",
      "https://github.com/komodorio/helm-dashboard",
      "https://github.com/komodorio/komoplane",
      "https://github.com/komodorio/validkube"
    ],
    urls: ["https://launchpass.com/komodorkommunity", "https://www.g2.com/products/komodor-2024-05-13/reviews"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Konnecto: {
    ws: ["https://www.konnecto.com"],
    li: ["https://www.linkedin.com/company/konnectoconsumerintelligence"],
    fb: ["https://www.facebook.com/konnecto.io"],
    tw: ["https://x.com/konnecto_"],
    ig: ["https://www.instagram.com/konnecto"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Kooply: {
    ws: ["https://kooply.com"],
    li: ["https://www.linkedin.com/company/kooply"],
    fb: ["https://www.facebook.com/kooplygames"],
    tw: ["https://x.com/playkooply"],
    ig: ["https://www.instagram.com/kooplygames"],
    ytp: ["https://www.youtube.com/@kooplyrun"],
    urls: ["https://apps.apple.com/us/app/magic-dash/id987654321", "https://discord.gg/3K2ege4jtC"],
    android_app_ids: ["com.creations.partychamps", "com.creations.runnergame", "nature.magic.dash"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Kovrr: {
    ws: ["https://resources.kovrr.com", "https://www.kovrr.com"],
    li: ["https://www.linkedin.com/company/kovrr"],
    tw: ["https://x.com/kovrrins"],
    _meta: { isHomepage: true, isVerified: true }
  },
  LAVA: {
    ws: ["https://lavapower.com"],
    li: ["https://www.linkedin.com/company/lavapower"],
    urls: ["https://www.kerensoref.com"],
    _meta: { isHomepage: true, isVerified: true }
  },
  LAVAA: {
    ws: ["https://lavaa.health"],
    li: ["https://www.linkedin.com/company/lavaa"],
    fb: ["https://www.facebook.com/lavaalabs"],
    ig: ["https://www.instagram.com/lavaahealth"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Laguna Health": {
    ws: ["https://form.lagunahealth.com", "https://www.lagunahealth.com"],
    li: ["https://www.linkedin.com/company/getlaguna"],
    ig: ["https://www.instagram.com/lagunahealth"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  "Lasso Security": {
    ws: ["https://www.lasso.security"],
    li: ["https://www.linkedin.com/company/lasso-security"],
    tw: ["https://twitter.com/lassosecurity"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Lavie bio": {
    ws: ["https://lavie-bio.com", "https://icl-growingsolutions.", "https://icl-growingsolutions.com"],
    _meta: { isHomepage: true, isVerified: true }
  },
  LayerX: {
    li: ["https://www.linkedin.com/company/layerx-security"],
    tw: ["https://x.com/LayerxSecurity"],
    gh: ["https://github.com/Mirovia-Security"],
    ytp: ["https://www.youtube.com/@LayerXSecurity"],
    urls: ["https://www.facebook.com/people/LayerX-Security/100063772826342"],
    _meta: { isVerified: true, isBrowserVerified: true }
  },
  Lexense: { ws: ["https://lexense.com"], _meta: { isHomepage: true, isVerified: true } },
  Lidwave: {
    ws: ["https://www.lidwave.com"],
    li: ["https://www.linkedin.com/company/lidwaveil"],
    ytc: "https://www.youtube.com/channel/UCgtJ2ESXOzPxNj7QAsd4Ncg",
    urls: ["https://www.muzedesign.com"],
    ytp: ["https://www.youtube.com/@lidwave4017"],
    _meta: { isHomepage: true, isVerified: true }
  },
  LightSolver: {
    ws: ["https://lightsolver.com"],
    li: ["https://www.linkedin.com/company/lightsolver"],
    tw: ["https://twitter.com/lightsolverco"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Lightblocks: {
    ws: ["https://lightblocks.org", "https://docs.eo.app"],
    urls: ["https://www.eo.app"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Lightricks: {
    ws: ["https://lightricks.com", "https://ltx.io"],
    li: ["https://www.linkedin.com/company/lightricks"],
    tw: ["https://x.com/Lightricks"],
    ig: ["https://www.instagram.com/lightricks"],
    ytc: ["https://www.youtube.com/channel/UCKWhLS9QMr1oNthZL1fZB4A"],
    ytp: ["https://www.youtube.com/@lightricks6701"],
    _meta: { isHomepage: true, isVerified: true }
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
    ytp: ["https://www.youtube.com/@lightruntech"],
    _meta: { isHomepage: true, isVerified: true }
  },
  LimitlessCNC: {
    ws: ["https://limitlesscnc.ai"],
    urls: ["https://limitlesscnc.ai"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  Loops: {
    ws: ["https://app.getloops.ai", "https://www.getloops.ai"],
    li: ["https://www.linkedin.com/company/getgetloops"],
    urls: ["https://www.producthunt.com/posts/loops-b4eb3c28-5d9d-4d4a-9414-e57e3faf3f67"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  Lumen: {
    ws: ["https://www.lumen.me"],
    fb: ["https://www.facebook.com/Lumen.me"],
    tw: ["https://x.com/LumenMetabolism"],
    ig: ["https://www.instagram.com/lumen.me"],
    ytc: "https://www.youtube.com/channel/UC3XkEyGUMXfRhZcB0Ve_fQQ",
    urls: ["https://help.lumen.me/s", "https://help.lumen.me/s/contactsupport", "https://www.pinterest.com/MyLumen"],
    ytp: ["https://www.youtube.com/@MetabolicHealth"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Lumus: {
    ws: ["https://lumus.com"],
    li: ["https://www.linkedin.com/company/lumus-ltd-"],
    tw: ["https://x.com/lumusvision"],
    ytc: "https://www.youtube.com/channel/UCUycTcAnF6lIjjc4WW8ZJ8w",
    ytp: ["https://www.youtube.com/@lumusltd.4946"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Lutris Pharma": {
    ws: ["https://www.lutris-pharma.com"],
    li: ["https://www.linkedin.com/company/lutris-phama"],
    urls: ["http://www.webview.co.il"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Lynxight: {
    ws: ["https://dashboard.lynxight.com", "https://success.lynxight.com", "https://www.lynxight.com"],
    li: ["https://www.linkedin.com/company/lynxight"],
    _meta: { isHomepage: true, isVerified: true }
  },
  MDClone: {
    ws: ["https://academy.mdclone.com", "https://mdclone.com"],
    li: ["https://www.linkedin.com/company/mdclone"],
    fb: ["https://www.facebook.com/mdclonehq"],
    tw: ["https://twitter.com/MDCloneHQ"],
    urls: ["https://mdclone.atlassian.net/servicedesk/customer/portal/7"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "MNDL Bio": {
    ws: ["https://app.mndl.bio", "https://www.mndl.bio"],
    li: ["https://www.linkedin.com/company/mndl-bio"],
    _meta: { isHomepage: true }
  },
  "Magenta Medical": {
    ws: ["https://magentamed.com"],
    li: ["https://www.linkedin.com/company/magenta-medical"],
    tw: ["https://x.com/magentamed"],
    urls: ["https://www.madebyomnis.com"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Magentiq Eye Ltd": {
    ws: ["https://magentiq.com"],
    li: ["https://www.linkedin.com/company/magentiq-eye-ltd"],
    tw: ["https://x.com/magentiqeye"],
    _meta: { isHomepage: true }
  },
  "Magnus Metal": {
    ws: ["https://magnusmetal.com"],
    urls: ["https://magnusmetal.com/privacy-policy", "https://magnusmetal.com/terms-of-use"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Maris Tech Ltd.": { fb: "https://www.facebook.com/MarisTech" },
  "Marketeam.ai": {
    ws: ["https://app.marketeam.ai", "https://www.marketeam.ai"],
    li: ["https://www.linkedin.com/company/marketeam-ai"],
    ig: ["https://www.instagram.com/marketeam.ai"],
    gh: ["https://github.com/marketeam-ai"],
    ytp: ["https://www.youtube.com/@marketeam-ai"],
    urls: ["https://calendly.com/whitney-marketeam/marketeam-meeting-clone", "https://huggingface.co/marketeam"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  "Matics Manufacturing Analytics Ltd.": {
    ws: ["https://go.matics.live", "https://matics.live"],
    li: ["https://www.linkedin.com/company/matics-manufacturing-analytics-ltd"],
    fb: ["https://www.facebook.com/matics.live"],
    tw: ["https://x.com/matics_rtoi"],
    ig: ["https://www.instagram.com/matics.live"],
    ytc: "https://www.youtube.com/channel/UC0KTd2GFe-ksFHilLXSW7vg",
    ytp: ["https://www.youtube.com/@matics_cfw"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Max: {
    ws: ["https://ir.maxstock.co.il", "https://maxstock.co.il"],
    li: ["https://www.linkedin.com/company/max-stock-global"],
    fb: ["https://www.facebook.com/maxstockisrael"],
    ig: ["https://www.instagram.com/max_stock_israel"],
    ytp: ["https://www.youtube.com/@max_stock"],
    tt: ["https://www.tiktok.com/@max_stock_israel"],
    urls: ["https://maxs.screenconnect.com"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  "Meala Foodtech": {
    ws: ["https://www.mealafood.com"],
    li: ["https://www.linkedin.com/company/meala-foodtech"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "MedHub-AI": {
    ws: ["https://www.medhub-ai.com"],
    li: ["https://www.linkedin.com/company/medhub-ai"],
    tw: ["https://x.com/aimedhub"],
    ytc: "https://www.youtube.com/channel/UCVS5vhpv4fN-SSf3cipQ9Sg",
    urls: ["https://pixart.dev", "https://www.reborntlv.com"],
    ytp: ["https://www.youtube.com/@medhub-ai3742"],
    _meta: { isHomepage: true, isVerified: true }
  },
  MedOne: {
    ws: ["https://medone.co.il"],
    li: ["https://www.linkedin.com/company/medone"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Medcase Health": {
    ws: ["https://app.medcase.health", "https://medcase.health", "https://portal.medcase.health"],
    li: ["https://www.linkedin.com/company/medcasehealth"],
    tw: ["https://x.com/medcasehealth"],
    _meta: { isHomepage: true, isVerified: true }
  },
  MediWound: {
    ws: ["https://ir.mediwound.com", "https://mediwound.com"],
    urls: [
      "https://ir.mediwound.com",
      "https://mediwound.com",
      "https://mediwound.com/careers",
      "https://mediwound.com/cookies-policy",
      "https://mediwound.com/privacy-policy",
      "https://mediwound.com/terms-conditions",
      "https://mediwound.com/wp-content/uploads/2025/07/MDWD-corporate-deck-May-2025.pdf"
    ],
    _meta: { isHomepage: true }
  },
  MedicannX: { ws: ["https://medicannx.com"], urls: ["https://wpastra.com"], _meta: { isHomepage: true } },
  Medorion: {
    ws: ["https://medorion.com"],
    li: ["https://www.linkedin.com/company/medorion"],
    fb: ["https://www.facebook.com/medorion2017"],
    tw: ["https://x.com/medorion1"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Meitav Investment House": {
    ws: ["https://www.meitav.co.il"],
    li: ["https://www.linkedin.com/company/meitav"],
    fb: ["https://www.facebook.com/meitav.invest"],
    ig: ["https://www.instagram.com/meitav"],
    ytp: ["https://www.youtube.com/@meitav_investments"],
    urls: ["https://www.peninsula.co.il"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Memcyco: {
    ws: ["https://www.memcyco.com"],
    li: ["https://www.linkedin.com/company/77059698"],
    fb: ["https://www.facebook.com/memcyco"],
    tw: ["https://x.com/memcyco"],
    ytp: ["https://www.youtube.com/@memcyco"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Memic Innovative Surgery": {
    ws: ["https://www.momentissurgical.com"],
    urls: [
      "https://healthcareprofessionals.momentisuniversity.com/Account/Login",
      "https://www.momentissurgical.com/about-momentis",
      "https://www.momentissurgical.com/about-momentis/our-team",
      "https://www.momentissurgical.com/anovo-surgical-system",
      "https://www.momentissurgical.com/anovo-surgical-system/clinical-evidence",
      "https://www.momentissurgical.com/anovo-surgical-system/clinical-evidence/transvaginal",
      "https://www.momentissurgical.com/news-events",
      "https://www.momentissurgical.com/patents",
      "https://www.momentissurgical.com/patient-resources",
      "https://www.momentissurgical.com/privacy-policy",
      "https://www.momentissurgical.com/request-demo",
      "https://www.momentissurgical.com/social-media-guidelines"
    ],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Mentee Robotics": {
    ws: ["https://menteebot.com"],
    li: ["https://www.linkedin.com/company/mentee-robotics"],
    tw: ["https://twitter.com/MenteeBot"],
    ytp: ["https://www.youtube.com/@menteebot"],
    _meta: { isHomepage: true, isVerified: true }
  },
  MetalBear: {
    ws: ["https://app.metalbear.com", "https://metalbear.com"],
    li: ["https://www.linkedin.com/company/metalbearco"],
    tw: ["https://x.com/metalbear"],
    gh: ["https://github.com/metalbear-co"],
    urls: ["https://studioartik.com"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Metis Technologies": { fb: "", tw: "" },
  "Microbot Medical": {
    ws: ["https://ir.microbotmedical.com", "https://microbotmedical.com"],
    urls: ["https://ir.microbotmedical.com/news-events/press-release", "https://thesulfurgroup.com"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Miggo Security": {
    ws: ["https://www.miggo.io"],
    li: ["https://www.linkedin.com/company/miggo-security"],
    tw: ["https://twitter.com/MiggoSecurity"],
    ytp: ["https://www.youtube.com/@MiggoSecurity"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Milestone: {
    ws: ["https://docs.mstone.ai", "https://mstone.ai"],
    li: ["https://www.linkedin.com/company/milestoneai"],
    tw: ["https://x.com/mstone_ai"],
    urls: ["https://docs.mstone.ai", "https://mstone.ai"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Mindfly: { ws: ["https://www.mindfly.live"], urls: ["https://www.mindfly.live"], _meta: { isHomepage: true } },
  Mindspace: {
    ws: ["https://hs.mindspace.me", "https://members.mindspace.me", "https://www.mindspace.me"],
    li: ["https://www.linkedin.com/company/mindspace-co"],
    fb: ["https://www.facebook.com/mindspace.me"],
    ig: ["https://www.instagram.com/mindspace.me"],
    urls: ["https://onelink.to/mindspace-member-app"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  Mirato: {
    ws: ["https://graph.sayari.com", "https://sayari.com"],
    li: ["https://www.linkedin.com/company/sayarilabs"],
    tw: ["https://x.com/share"],
    ytp: ["https://www.youtube.com/@sayarilabs"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Mitiga: {
    ws: ["https://www.mitiga.io"],
    li: ["https://www.linkedin.com/company/mitiga-io"],
    ytp: ["https://www.youtube.com/@mitigaio"],
    urls: [
      "https://bsky.app/profile/mitiga.bsky.social",
      "https://www.gartner.com/reviews/market/cloud-investigation-and-response-automation-cira/vendor/mitiga/product/mitiga"
    ],
    _meta: { isHomepage: true, isVerified: true }
  },
  Momentick: {
    ws: ["https://www.momentick.com"],
    li: ["https://www.linkedin.com/company/momentick"],
    urls: ["https://www.momentick.com/blog"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Moodify: {
    ws: ["https://www.moodify.ai"],
    li: ["https://www.linkedin.com/company/moodify"],
    ytp: ["https://www.youtube.com/@moodifyai-w3f"],
    urls: [
      "https://www.moodify.ai/about-us",
      "https://www.moodify.ai/blog",
      "https://www.moodify.ai/malodor-control",
      "https://www.moodify.ai/portfolio-optimization",
      "https://www.moodify.ai/reformulation"
    ],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Moon Active": {
    ws: ["https://www.moonactive.com"],
    li: ["https://www.linkedin.com/company/moon-active"],
    fb: ["https://www.facebook.com/moonactive"],
    ig: ["https://www.instagram.com/lifeatmoonactive"],
    urls: [
      "https://apps.apple.com/by/app/family-island-farming-game/id1464689103",
      "https://apps.apple.com/il/app/merge-hotel-empire-design-game/id1577970257",
      "https://apps.apple.com/il/app/zen-match-relaxing-puzzle/id1560124228",
      "https://apps.apple.com/sg/app/travel-town-merge-adventure/id1521236603",
      "https://apps.apple.com/us/app/merge-adventure-merging-game/id6478997449",
      "https://apps.apple.com/us/app/my-cafe-restaurant-game/id1068204657",
      "https://itunes.apple.com/app/coin-master/id406889139"
    ],
    android_app_ids: [
      "com.MelsoftGames.FamilyIslandFarm",
      "com.exoticmatch.game",
      "com.melesta.coffeeshop",
      "com.moonactive.coinmaster",
      "io.randomco.travel",
      "puzzle.merge.adventure",
      "puzzle.merge.hotel.empire"
    ],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isVerified: true, isBrowserVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  Morphisec: {
    ws: ["https://www.morphisec.com"],
    li: ["https://www.linkedin.com/company/morphisec"],
    tw: ["https://twitter.com/morphisec"],
    ytc: ["https://www.youtube.com/channel/UCe48cR5xTxPJSYMjG-So7Rw"],
    urls: ["https://morphisec.xamplify.io", "https://support.morphisec.com/hc/en-us"],
    ytp: ["https://www.youtube.com/@morphisecinc"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  MyHeritage: { li: "https://www.linkedin.com/company/myheritage" },
  MyndYou: {
    ws: ["https://www.arbiter.ai"],
    li: ["https://www.linkedin.com/company/arbiter-ai"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Myndlift: {
    ws: ["https://dashboard.myndlift.com", "https://signup.myndlift.com", "https://www.myndlift.com"],
    li: ["https://www.linkedin.com/company/myndlift"],
    fb: ["https://www.facebook.com/myndlift"],
    ig: ["https://www.instagram.com/myndlift"],
    ytc: "https://www.youtube.com/channel/UCQuHF1gsJX3kh4x-CoZnTdA?view_as=subscriber",
    tt: ["https://www.tiktok.com/@myndlift"],
    urls: ["https://apply.workable.com/myndlift", "https://dashboard.myndlift.com", "https://signup.myndlift.com"],
    ytp: ["https://www.youtube.com/@MyndliftNeurofeedback"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "N-Drip": {
    ws: ["https://ndrip.com"],
    li: ["https://www.linkedin.com/company/n-drip-gravity-micro-irrigation"],
    fb: ["https://www.facebook.com/ndripirrigation"],
    urls: ["https://www.giraff.co.il"],
    _meta: { isHomepage: true, isVerified: true }
  },
  NICE: {
    ws: ["https://help.nice.com", "https://resources.nice.com", "https://www.nice.com"],
    li: ["https://www.linkedin.com/company/nice-systems"],
    fb: ["https://www.facebook.com/officialniceltd"],
    tw: ["https://x.com/niceltd"],
    ytc: "https://www.youtube.com/channel/UC4tmsS3fAVLp1Ue0DF-EauA",
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
    ytp: ["https://www.youtube.com/@NICE-Systems"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  "NakAI Robotics": {
    ws: ["https://www.nakairobotics.com"],
    li: ["https://www.linkedin.com/company/nakai-robotics"],
    urls: [
      "https://alizaglassman.wixsite.com/portfolio",
      "https://api.whatsapp.com/send",
      "https://www.nakairobotics.com"
    ],
    _meta: { isHomepage: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  "Nano Dimension": {
    ws: ["https://go.nano-di.com", "https://investors.nano-di.com", "https://www.nano-di.com"],
    li: ["https://www.linkedin.com/company/5323642"],
    fb: ["https://www.facebook.com/nanodimensiontech"],
    tw: ["https://x.com/3dpcb"],
    ig: ["https://www.instagram.com/nano_dimension"],
    ytc: "https://www.youtube.com/channel/UCOdg9di3--DCXo5_0lULZlA",
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
    ytp: ["https://www.youtube.com/@NanoDimension"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Nanox Imaging": {
    ws: ["https://www.nanox.vision"],
    li: ["https://www.linkedin.com/company/nanox-imaging"],
    fb: ["https://www.facebook.com/NanoxVision"],
    tw: ["https://x.com/nanox_vision"],
    urls: ["https://investors.nanox.vision", "https://nanoxvision.zendesk.com"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isVerified: true, isBrowserVerified: true }
  },
  "Nectin Therapeutics": {
    ws: ["https://www.nectintx.com"],
    urls: [
      "https://www.nectintx.com/about-us-our-technology",
      "https://www.nectintx.com/contact-us",
      "https://www.nectintx.com/our-team"
    ],
    _meta: { isHomepage: true }
  },
  Neema: {
    ws: ["https://docs.getneema.com", "https://getneema.com"],
    li: ["https://www.linkedin.com/company/neema-official"],
    urls: ["https://share-eu1.hsforms.com/1064gI4P7QBGKIuYKlPukCA2et0fn"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "NeoTX Therapeutics": { ws: ["https://predictivetx.com"], _meta: { isHomepage: true, isVerified: true } },
  Neolithics: {
    ws: ["https://www.neolithics.ai"],
    li: ["https://www.linkedin.com/company/neolithics-ai"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "NetOp.Cloud": {
    ws: ["https://netop.ai"],
    li: ["https://www.linkedin.com/company/netop-ai"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Neteera: {
    ws: ["https://www.neteera.com"],
    li: ["https://www.linkedin.com/company/neteera"],
    urls: ["https://maps.app.goo.gl/m3zhiPZpWrWWPCcx6"],
    _meta: { isHomepage: true, isVerified: true }
  },
  NeuraLight: {
    ws: ["https://neuralight.ai"],
    li: ["https://www.linkedin.com/company/neuralight"],
    _meta: { isHomepage: true, isVerified: true }
  },
  NeuroBlade: {
    ws: ["https://docs.neuroblade.com", "https://www.neuroblade.com"],
    li: ["https://www.linkedin.com/company/neuroblade"],
    urls: ["https://thefinanceherald.com/amazon-expands-its-israeli-footprint-snatching-up-neuroblades-coreteam"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "NeuroSense Therapeutics": {
    ws: ["https://www.neurosense-tx.com"],
    li: ["https://www.linkedin.com/company/neurosense-therapeutics"],
    fb: ["https://www.facebook.com/neurosensetx"],
    tw: ["https://x.com/neurosenset"],
    ig: ["https://www.instagram.com/neurosense_therapeutics"],
    urls: ["https://neurosense.investorroom.com", "https://www.neurosense-tx.com", "https://www.webnoise.co.il"],
    _meta: { isHomepage: true, isVerified: true }
  },
  NextSilicon: {
    ws: ["https://www.nextsilicon.com"],
    urls: ["https://silktide.com/consent-manager"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Nilos: {
    ws: ["https://app.nilos.io", "https://status.nilos.io", "https://www.nilos.io"],
    urls: ["https://app.dover.com/jobs/nilos"],
    _meta: { isHomepage: true, isVerified: true }
  },
  NitroFix: {
    ws: ["https://nitro-fix.com"],
    li: ["https://www.linkedin.com/company/nitrofix"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Nofar Energy": {
    ws: ["https://ir.nofar-energy.com", "https://www.nofar-energy.com"],
    li: ["https://www.linkedin.com/company/nofarenergy"],
    fb: ["https://www.facebook.com/nofar.ene"],
    tw: ["https://x.com/nofarenergy"],
    ig: ["https://www.instagram.com/nofar_energy"],
    ytp: ["https://www.youtube.com/@nofarenergy8364"],
    urls: ["https://ir.nofar-energy.com", "https://www.richkid.co.il"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Nokod Security": {
    ws: ["https://nokodsecurity.com"],
    li: ["https://www.linkedin.com/company/nokodsecurity"],
    ytp: ["https://www.youtube.com/@nokodsecurity"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isVerified: true, isBrowserVerified: true }
  },
  Nostromo: {
    ws: ["https://nostromo.energy"],
    li: ["https://www.linkedin.com/company/nostromo-energy"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Novidea: {
    ws: ["https://novidea.com"],
    li: ["https://www.linkedin.com/company/novidea-software"],
    fb: ["https://www.facebook.com/novideasoft"],
    ig: ["https://instagram.com/inside_novidea"],
    ytc: ["https://www.youtube.com/channel/UC_zLIYG3uK0n4F1pHi4Uu3Q"],
    urls: ["https://novidea-crm.my.site.com/support/login", "https://novidea.force.com/support/login"],
    ytp: ["https://www.youtube.com/@NovideaOfficial"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  NsKnox: {
    ws: ["https://nsknox.net"],
    li: ["https://www.linkedin.com/company/7972484"],
    fb: ["https://www.facebook.com/nsknoxtechnologies"],
    tw: ["https://x.com/nsknoxtech"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Nucleix: {
    ws: ["https://nucleix.com"],
    li: ["https://www.linkedin.com/company/nucleix-ltd-"],
    fb: ["https://www.facebook.com/nucleix-100608201471224"],
    tw: ["https://x.com/nucleix2"],
    ig: ["https://www.instagram.com/nucleix_ltd"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "NurExone Biologic": {
    ws: ["https://nurexone.com", "https://register.nurexone.com"],
    li: ["https://www.linkedin.com/company/nurexone-biologic"],
    fb: ["https://www.facebook.com/NurExone"],
    tw: ["https://twitter.com/NBiologic"],
    ytc: ["https://www.youtube.com/channel/UCpcZmZlFTj7fnEBZyFx9aYA"],
    ytp: ["https://www.youtube.com/@nurexonebiologic737"],
    _meta: { isHomepage: true, isVerified: true }
  },
  OCTOPAI: {
    ws: [
      "https://br.cloudera.com",
      "https://community.cloudera.com",
      "https://de.cloudera.com",
      "https://docs.cloudera.com",
      "https://es.cloudera.com",
      "https://fr.cloudera.com",
      "https://it.cloudera.com",
      "https://jp.cloudera.com",
      "https://kr.cloudera.com",
      "https://lighthouse.cloudera.com",
      "https://pl.cloudera.com",
      "https://sso.cloudera.com",
      "https://video.cloudera.com",
      "https://www.cloudera.com"
    ],
    li: ["https://www.linkedin.com/company/cloudera"],
    fb: ["https://www.facebook.com/cloudera"],
    tw: ["https://x.com/cloudera"],
    ytp: ["https://www.youtube.com/@clouderainc"],
    urls: ["https://apache.org", "https://hadoop.apache.org", "https://www.clouderacn.cn"],
    _meta: { isHomepage: true, isVerified: true }
  },
  OKIBO: {
    ws: ["https://okibo.com"],
    li: ["https://www.linkedin.com/company/okibo-smart-robotics-in-construction-sites"],
    ytc: "https://www.youtube.com/channel/UCZ-iZVQ-Ip1JsPIP9u1eaFw",
    urls: [
      "https://underthehardhat.org/okibo-eg7-robot",
      "https://www.aecbytes.com/feature/2025/Robotics-Construction.html",
      "https://www.hakerdesign.co.il",
      "https://www.robotics247.com/article/okibo-announces-general-availability-of-robotic-blaster-technology-for-construction-industry"
    ],
    ytp: ["https://www.youtube.com/@OKIBO1"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "ONE ZERO": {
    ws: ["https://www.onezerobank.com"],
    li: ["https://www.linkedin.com/company/the-first-digital-bank"],
    fb: ["https://www.facebook.com/onezerobank"],
    tw: ["https://x.com/onezerobank"],
    ig: ["https://www.instagram.com/onezerodigitalbank"],
    ytc: "https://www.youtube.com/channel/UCeWvK-lOpK4WTNHI1mhGgSg",
    android_app_ids: ["il.co.firstdigitalbank"],
    ytp: ["https://www.youtube.com/@ONEZEROBANK"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Ocon Healthcare": {
    ws: ["https://oconmed.com"],
    li: ["https://www.linkedin.com/company/o-con-medical"],
    urls: ["https://www.iub-ballerine.com"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Octup: {
    ws: ["https://partner.octup.com", "https://www.octup.com"],
    li: ["https://www.linkedin.com/company/octup-com"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Od Podcast": { ws: "", li: "https://www.linkedin.com/company/guykatsovichpodcast" },
  Odeeo: {
    ws: ["https://blog.odeeo.io", "https://odeeo.io"],
    li: ["https://www.linkedin.com/company/odeeo"],
    fb: ["https://www.facebook.com/sonicodeeo"],
    tw: ["https://x.com/sonicodeeo"],
    urls: ["https://blog.odeeo.io", "https://www.kalungi.com/atlas-hubspot-theme-for-b2b-saas-software"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Odigos: {
    ws: ["https://odigos.io"],
    gh: "https://github.com/odigos-io/odigos",
    _meta: { isHomepage: true, isVerified: true }
  },
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
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isVerified: true, isBrowserVerified: true }
  },
  OncoHost: {
    ws: ["https://www.oncohost.com"],
    li: ["https://www.linkedin.com/company/oncohost"],
    fb: ["https://www.facebook.com/OncoHost"],
    tw: ["https://twitter.com/OncoHost"],
    ytp: ["https://www.youtube.com/@oncohost"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "One AI": {
    ws: ["https://app.oneai.com", "https://oneai.com", "https://studio.oneai.com"],
    li: ["https://www.linkedin.com/company/one-ai"],
    tw: ["https://x.com/oneailabs"],
    ytc: "https://www.youtube.com/channel/UC7Iq6Yfks57GTa-He72fsgw",
    urls: [
      "https://gdpr.eu",
      "https://oneai.com",
      "https://www.aicpa.org/soc4so",
      "https://www.callringo.com",
      "https://www.hhs.gov/hipaa/index.html"
    ],
    ytp: ["https://www.youtube.com/@oneai"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Onebeat: {
    li: ["https://www.linkedin.com/company/1beat"],
    fb: ["https://www.facebook.com/1beatretail"],
    tw: ["https://twitter.com/Onebeat4retail"],
    ytp: ["https://www.youtube.com/@onebeat8428"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Oosto: {
    ws: ["https://knowledge.oosto.com", "https://oosto.com"],
    li: ["https://www.linkedin.com/company/oosto"],
    tw: ["https://x.com/oostoai"],
    ytp: ["https://www.youtube.com/@oosto6849"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Opster: {
    ws: ["https://autoops.opster.com", "https://opster.com"],
    li: ["https://www.linkedin.com/company/opster"],
    fb: ["https://www.facebook.com/opsterhq"],
    tw: ["https://x.com/opsterhq"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Opsys Tech": {
    ws: ["https://docs.opsys-tech.com", "https://www.opsys-tech.com"],
    li: ["https://www.linkedin.com/company/opsys-technologies"],
    ytp: ["https://www.youtube.com/@opsys-tech"],
    urls: [
      "https://docs.opsys-tech.com",
      "https://www.opsys-tech.com/_files/ugd/0ca143_93fb52e0f1df4e34aa52936ff21e03f2.pdf",
      "https://www.opsys-tech.com/altos-industrial-lidar",
      "https://www.opsys-tech.com/altos-poe",
      "https://www.opsys-tech.com/altos-sat-industrial-lidar",
      "https://www.opsys-tech.com/automotive",
      "https://www.opsys-tech.com/blogs",
      "https://www.opsys-tech.com/careers",
      "https://www.opsys-tech.com/company",
      "https://www.opsys-tech.com/contact",
      "https://www.opsys-tech.com/cookies-notice",
      "https://www.opsys-tech.com/data-center-security",
      "https://www.opsys-tech.com/distributors",
      "https://www.opsys-tech.com/events",
      "https://www.opsys-tech.com/healthcare",
      "https://www.opsys-tech.com/imprint",
      "https://www.opsys-tech.com/its",
      "https://www.opsys-tech.com/measurement",
      "https://www.opsys-tech.com/media-coverage",
      "https://www.opsys-tech.com/opsens",
      "https://www.opsys-tech.com/opsens-sat",
      "https://www.opsys-tech.com/overheight",
      "https://www.opsys-tech.com/perimeter-protection",
      "https://www.opsys-tech.com/press-releases",
      "https://www.opsys-tech.com/privacy-policy",
      "https://www.opsys-tech.com/products",
      "https://www.opsys-tech.com/ramp-metering",
      "https://www.opsys-tech.com/security",
      "https://www.opsys-tech.com/smart-cities",
      "https://www.opsys-tech.com/tailgating",
      "https://www.opsys-tech.com/technology",
      "https://www.opsys-tech.com/terms-and-conditions",
      "https://www.opsys-tech.com/terms-of-sale",
      "https://www.opsys-tech.com/wrong-way"
    ],
    _meta: { isHomepage: true, isVerified: true }
  },
  Optibus: {
    ws: ["https://blog.optibus.com", "https://optibus.com"],
    li: ["https://www.linkedin.com/company/optibus-ltd"],
    fb: ["https://www.facebook.com/Optibusltd"],
    tw: ["https://twitter.com/optibus"],
    ytc: ["https://www.youtube.com/channel/UCTLHB0yvKEHMtbbYTx9ngBg"],
    ytp: ["https://www.youtube.com/@optibus"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  "OrCam Technologies": {
    ws: ["https://www.orcam.com"],
    li: ["https://www.linkedin.com/company/orcam"],
    fb: ["https://www.facebook.com/orcamtech"],
    tw: ["https://x.com/orcam"],
    ig: ["https://www.instagram.com/orcam_technologies"],
    ytp: ["https://www.youtube.com/@orcamtech"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Orbs: {
    ws: ["https://www.orbs.com"],
    tw: ["https://x.com/orbs_network"],
    gh: ["https://github.com/orbs-network"],
    ytc: "https://www.youtube.com/channel/UCfpV4z-MGxeiabFkht1LNPQ",
    urls: [
      "https://discord.gg/sswGDYGBt5",
      "https://docs.orbs.network",
      "https://orbs-network.github.io/oip6-migration-web",
      "https://staking.orbs.network",
      "https://status.orbs.network",
      "https://t.me/OrbsNetwork"
    ],
    ytp: ["https://www.youtube.com/@orbsnetwork"],
    _meta: { isHomepage: true, isVerified: true }
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
    ytp: ["https://www.youtube.com/@orcaai9561"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Oriient: {
    ws: ["https://dashboard.oriient.me", "https://www.oriient.me"],
    li: ["https://www.linkedin.com/company/oriient"],
    fb: ["https://www.facebook.com/oriient.me"],
    ytp: ["https://www.youtube.com/@oriient1541"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Orion Security": {
    ws: ["https://app.orionsec.io", "https://www.orionsec.io"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Oshi: {
    ws: ["https://oshi.com"],
    li: ["https://www.linkedin.com/company/oshiseafood"],
    fb: ["https://www.facebook.com/weareoshi"],
    tw: ["https://x.com/oshiseafood"],
    ig: ["https://www.instagram.com/oshiseafood", "https://www.instagram.com/reel"],
    urls: ["https://drive.google.com/drive/u/0/folders/1AXbMSVpL74o6hpV35ykh9WK97H1Opmr5", "https://oshi.fish"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Othentic: {
    ws: ["https://app.othentic.xyz", "https://docs.othentic.xyz", "https://www.othentic.xyz"],
    tw: ["https://x.com/0xothentic"],
    gh: ["https://github.com/othentic-labs"],
    urls: ["https://discord.com/invite/za9tpCdSzs", "https://mirror.xyz/othentic.eth"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Ottopia: {
    ws: ["https://www.ottopia.tech"],
    li: ["https://www.linkedin.com/company/ottopia"],
    fb: ["https://www.facebook.com/ottopiatech"],
    urls: ["https://medium.com/ottopia"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isVerified: true, isBrowserVerified: true }
  },
  "P-Cure": {
    ws: ["https://www.p-cure.com"],
    urls: [
      "https://www.p-cure.com/about-us",
      "https://www.p-cure.com/news-events",
      "https://www.p-cure.com/the-solution"
    ],
    _meta: { isHomepage: true, isVerified: true }
  },
  PVML: {
    ws: ["https://pvml.com"],
    li: ["https://www.linkedin.com/company/pvml"],
    urls: ["https://increativeweb.com", "https://pvml.com"],
    _meta: { isHomepage: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  Panjaya: {
    ws: ["https://docs.panjaya.ai", "https://www.panjaya.ai"],
    li: ["https://www.linkedin.com/company/panjaya-ai"],
    tw: ["https://x.com/panjayai"],
    ig: ["https://www.instagram.com/panjaya.ai"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Panoply: {
    ws: [
      "https://blog.panoply.io",
      "https://learn.panoply.io",
      "https://panoply.io",
      "https://platform.panoply.io",
      "https://status.panoply.io"
    ],
    li: ["https://www.linkedin.com/company/panoply-io"],
    fb: ["https://www.facebook.com/panoply.io"],
    tw: ["https://x.com/panoplyio"],
    urls: [
      "https://sqream.com",
      "https://sqream.com/company/careers",
      "https://www.capterra.com/p/168034/Panoply",
      "https://www.g2.com/products/panoply/reviews",
      "https://www.gartner.com/reviews/market/cloud-database-management-systems/vendor/panoply/product/panoply"
    ],
    _meta: { isHomepage: true, isVerified: true }
  },
  Particula: {
    ws: ["https://particula-tech.com"],
    fb: ["https://www.facebook.com/go.particula"],
    tw: ["https://x.com/goparticula"],
    ig: ["https://www.instagram.com/go.particula"],
    ytp: ["https://www.youtube.com/@go.particula"],
    tt: ["https://www.tiktok.com/@go.particula"],
    urls: ["https://drive.google.com/file/d/1c-Y8MqMWdPedtG1nmDV4xVqyd2W1HDes/view"],
    _meta: { isHomepage: true, isVerified: true }
  },
  PayEm: {
    ws: ["https://www.payem.co"],
    li: ["https://www.linkedin.com/company/payemcard"],
    fb: ["https://www.facebook.com/payem-100922072326032"],
    ig: ["https://www.instagram.com/life.at.payem"],
    urls: ["https://app.payemcard.com", "https://app.payemcard.com/login"],
    _meta: { isHomepage: true }
  },
  "Payouts.com": {
    ws: ["https://integrations.payouts.com", "https://payouts.com", "https://status.payouts.com"],
    li: ["https://www.linkedin.com/company/payouts-com"],
    tw: ["https://x.com/payoutsdotcom"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Pecan: {
    ws: ["https://help.pecan.ai", "https://www.pecan.ai"],
    li: ["https://www.linkedin.com/company/pecan-ai"],
    fb: ["https://www.facebook.com/pecanai"],
    tw: ["https://x.com/pecan_ai"],
    urls: ["https://www.g2.com/products/pecan/reviews"],
    _meta: { isHomepage: true, isVerified: true }
  },
  PeerPlay: {
    ws: ["https://www.peerplay.com"],
    urls: [
      "https://apps.apple.com/us/app/merge-cruise-mystery-puzzle/id6459056553",
      "https://www.peerplay.com",
      "https://www.peerplay.com/privacy",
      "https://www.peerplay.com/support"
    ],
    android_app_ids: ["com.peerplay.megamerge"],
    _meta: { isHomepage: true }
  },
  "Pepticom Ltd.": {
    ws: ["https://pepticom.com"],
    li: ["https://www.linkedin.com/company/pepticom-ltd."],
    tw: ["https://x.com/pepticom"],
    ytp: ["https://www.youtube.com/@pepticom6510"],
    urls: ["https://www.pearlcom.co.il"],
    _meta: { isHomepage: true, isVerified: true }
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
    ytc: "https://www.youtube.com/channel/UCJHo4AuVomwMRzgkA5DQEOA",
    urls: [
      "https://community.fortinet.com",
      "https://fortinet-tv.com",
      "https://global.fortinet.com/PreferenceCenter",
      "https://www.fortinet.com/blog",
      "https://www.fortinetaccelerate.com/lasvegas_26",
      "https://www.fortinetfederal.com"
    ],
    ytp: ["https://www.youtube.com/@fortinet"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Percepto: {
    ws: ["https://drones.percepto.co", "https://info.percepto.co", "https://percepto.co"],
    li: ["https://www.linkedin.com/company/perceptoautonomousdrones"],
    fb: ["https://www.facebook.com/perceptodrones"],
    tw: ["https://twitter.com/perceptodrones"],
    ig: ["https://www.instagram.com/perceptodrones"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  Phytech: {
    ws: ["https://app.phytech.com", "https://www.phytech.com"],
    li: ["https://www.linkedin.com/company/476356"],
    tw: ["https://x.com/phytechusa"],
    ig: ["https://www.instagram.com/phytech_farmos"],
    ytc: "https://www.youtube.com/channel/UCUx5vjb_90kd_9b9FA-x5Gg",
    ytp: ["https://www.youtube.com/@phytech-plantbasedfarming4528"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Phytolon: {
    ws: ["https://www.phytolon.com"],
    li: ["https://www.linkedin.com/company/phytolon"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Pi-Cardia": {
    ws: ["https://www.pi-cardia.net"],
    li: ["https://www.linkedin.com/company/pi-cardia"],
    tw: ["https://x.com/pi_cardia"],
    urls: [
      "http://eiznerdesign.com",
      "https://www.pi-cardia.net",
      "https://www.pi-cardia.net/contact",
      "https://www.pi-cardia.net/copy-of-about",
      "https://www.pi-cardia.net/copy-of-terms-of-use",
      "https://www.pi-cardia.net/news",
      "https://www.pi-cardia.net/privacy-policy-and-terms-of-use",
      "https://www.pi-cardia.net/technology-leaflex",
      "https://www.pi-cardia.net/technology-shortcut"
    ],
    _meta: { isHomepage: true, isVerified: true }
  },
  Piiano: {
    ws: ["https://go.mcptotal.io", "https://mcptotal.io"],
    li: ["https://www.linkedin.com/company/mcptotal"],
    tw: ["https://x.com/mcptotal"],
    gh: ["https://github.com/piiano"],
    urls: ["https://calendly.com/mcptotal"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Pixellot: {
    ws: ["https://www.pixellot.tv"],
    li: ["https://www.linkedin.com/company/pixellotltd"],
    fb: ["https://www.facebook.com/pixellotltd"],
    tw: ["https://x.com/pixellotltd"],
    ig: ["https://www.instagram.com/pixellotofficial"],
    ytp: ["https://www.youtube.com/@pixellotltd"],
    urls: ["https://vimeo.com/1072158726", "https://vimeo.com/user105679847", "https://www.costa.co.il"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  "PlaySight Interactive": {
    ws: ["https://playsight.com", "https://web.playsight.com"],
    li: ["https://www.linkedin.com/company/playsight-interactive"],
    fb: ["https://www.facebook.com/playsight"],
    tw: ["https://x.com/playsight"],
    ig: ["https://www.instagram.com/playsight"],
    ytp: ["https://www.youtube.com/@playsightinteractive"],
    urls: ["https://apps.apple.com/app/id976177330", "https://apps.apple.com/il/app/playsight/id976177330"],
    android_app_ids: ["com.playsight.tennis"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Playtech: {
    ws: ["https://api.marketplace.playtech.com", "https://investors.playtech.com", "https://www.playtech.com"],
    li: ["https://www.linkedin.com/company/18717"],
    ytp: ["https://www.youtube.com/@playtechchannel"],
    urls: [
      "https://authorisation.mga.org.mt/verification.aspx",
      "https://brndwgn.com",
      "https://www.gamblingcommission.gov.uk/public-register/business/detail/38516",
      "https://www.gamstop.co.uk",
      "https://www.investors.playtech.com",
      "https://www.playtech.com",
      "https://www.playtech.com/about-us",
      "https://www.playtech.com/app/uploads/2024/12/Organisations-and-Resources-dedicated-to-Reducing-Gambling-Related-Harm-1-1.pdf",
      "https://www.playtech.com/app/uploads/2025/06/ALL-STM-001E-Modern-Slavery-and-Human-Rights-Statement.pdf",
      "https://www.playtech.com/app/uploads/2026/02/Playtech-Tax-Strategy-2025-Final.pdf",
      "https://www.playtech.com/business-partner-privacy-notice",
      "https://www.playtech.com/category/press-releases",
      "https://www.playtech.com/clients",
      "https://www.playtech.com/contact",
      "https://www.playtech.com/further-policies",
      "https://www.playtech.com/locations",
      "https://www.playtech.com/marketplace",
      "https://www.playtech.com/payments",
      "https://www.playtech.com/privacy-policy",
      "https://www.playtech.com/products/bingo",
      "https://www.playtech.com/products/casino",
      "https://www.playtech.com/products/live",
      "https://www.playtech.com/products/pam",
      "https://www.playtech.com/products/poker",
      "https://www.playtech.com/products/retail",
      "https://www.playtech.com/products/sports",
      "https://www.playtech.com/saas-partners",
      "https://www.playtech.com/services",
      "https://www.playtech.com/sport-personality-athletes-privacy-notice",
      "https://www.playtech.com/sustainable-success/playtech-partners",
      "https://www.playtech.com/sustainable-success/playtech-people",
      "https://www.playtech.com/sustainable-success/playtech-planet",
      "https://www.playtech.com/sustainable-success/playtech-protect",
      "https://www.playtech.com/uk-gender-pay-gap-reports",
      "https://www.playtechacademy.com",
      "https://www.playtechone.com",
      "https://www.playtechpeople.com",
      "https://www.taketimetothink.co.uk"
    ],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isVerified: true, isBrowserVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  PointGrab: {
    ws: ["https://flex.pointgrab.com", "https://pointgrab.com", "https://support.pointgrab.com"],
    li: ["https://www.linkedin.com/company/pointgrab"],
    urls: [
      "https://pointgrab.com",
      "https://pointgrab.com/accessibility-policy",
      "https://pointgrab.com/blog-and-news",
      "https://pointgrab.com/company",
      "https://pointgrab.com/contact-us",
      "https://pointgrab.com/jobs-page",
      "https://pointgrab.com/partners",
      "https://pointgrab.com/privacy-policy",
      "https://pointgrab.com/privacy-policy-2",
      "https://pointgrab.com/security-center",
      "https://pointgrab.com/spaces",
      "https://pointgrab.com/technology",
      "https://pointgrab.com/use-cases",
      "https://theguy.co.il"
    ],
    _meta: { isHomepage: true, isVerified: true }
  },
  Polyrizon: {
    ws: ["https://investor.polyrizon-biotech.com", "https://polyrizon-biotech.com"],
    urls: ["https://polyrizon-biotech.com"],
    _meta: { isHomepage: true, isVerified: true }
  },
  PomVom: {
    ws: ["https://support.pomvom.com", "https://www.pomvom.com"],
    urls: ["https://support.pomvom.com/hc", "https://www.pomvom.com", "https://www.pomvom.com/careers"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  "Powermat Technologies": {
    ws: ["https://powermat.com"],
    li: ["https://www.linkedin.com/company/940993"],
    fb: ["https://www.facebook.com/powermattechnologies"],
    tw: ["https://x.com/powermat"],
    ig: ["https://www.instagram.com/powermat"],
    ytp: ["https://www.youtube.com/@powermat"],
    _meta: { isHomepage: true, isVerified: true }
  },
  PrettyDamnQuick: {
    ws: ["https://support.prettydamnquick.com", "https://www.prettydamnquick.com"],
    urls: ["https://go.pdq.app", "https://www.checkoutpulse.com"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Priority Software": {
    ws: ["https://www.priority-software.com"],
    li: ["https://www.linkedin.com/company/prioritysoftware"],
    fb: ["https://www.facebook.com/PrioritySoftware"],
    tw: ["https://twitter.com/prioritysw"],
    ytc: ["https://www.youtube.com/channel/UCuOhaPagwvRNqyf7pVKi57A"],
    urls: ["https://market.priority-software.com", "https://support.priority-software.com"],
    ytp: ["https://www.youtube.com/@Priority_software"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Prisma Photonics": {
    ws: ["https://www.prismaphotonics.com"],
    li: ["https://www.linkedin.com/company/prisma-photonics"],
    ytc: "https://www.youtube.com/channel/UCWqjyMdDwXN0qWIHxC8IYzQ",
    ytp: ["https://www.youtube.com/@prismaphotonics"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "ProFuse Technology": {
    ws: ["https://profuse-tech.com"],
    urls: [
      "https://profuse-tech.com",
      "https://profuse-tech.com/contact-us",
      "https://profuse-tech.com/news",
      "https://profuse-tech.com/technology"
    ],
    _meta: { isHomepage: true, isVerified: true }
  },
  Proggio: {
    ws: ["https://app.proggio.com", "https://landing.proggio.com", "https://www.proggio.com"],
    li: ["https://www.linkedin.com/company/proggio"],
    fb: ["https://www.facebook.com/proggioppm"],
    tw: ["https://x.com/proggioapp"],
    ig: ["https://www.instagram.com/proggioapp"],
    ytc: "https://www.youtube.com/channel/UCAsdxctxjk192p6EmvH0TUw",
    ytp: ["https://www.youtube.com/@Proggio"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Promise Bio": {
    ws: ["https://www.promise.bio"],
    urls: ["https://pearlcom.co.il"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Promo.com": {
    ws: ["https://promo.com", "https://support.promo.com"],
    li: ["https://www.linkedin.com/company/promodotcom"],
    fb: ["https://www.facebook.com/business", "https://www.facebook.com/promodotcom"],
    tw: ["https://x.com/promodotcom"],
    ig: ["https://www.instagram.com/promodotcom"],
    ytc: "https://www.youtube.com/channel/UC0d_7BlGBgDcf62o766FkPQ",
    urls: [
      "https://apps.shopify.com/promo-com-promo-video-maker",
      "https://vimeo.com/promobyslidely",
      "https://www.pinterest.com/meetpromo",
      "https://www.producthunt.com/posts/promo"
    ],
    ytp: ["https://www.youtube.com/@Promodotcom"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Propel: {
    ws: ["https://propel-ai.com"],
    li: ["https://www.linkedin.com/company/propel-crm"],
    fb: ["https://www.facebook.com/propelprm"],
    tw: ["https://x.com/propelprm"],
    ytc: "https://www.youtube.com/channel/UCdQS7VIp9zgQpf4L-eFsPvg",
    urls: ["https://app.propelmypr.com"],
    ytp: ["https://www.youtube.com/@PropelMyPR"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Protai: {
    ws: ["https://www.protai.bio"],
    li: ["https://www.linkedin.com/company/protai-bio"],
    tw: ["https://x.com/protaibio"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Protect AI": {
    gh: ["https://github.com/protectai"],
    ytp: ["https://www.youtube.com/@protectai"],
    urls: ["https://mlsecops.slack.com/signup#/domain-signup"],
    _meta: { isVerified: true, isBrowserVerified: true }
  },
  Pynt: {
    ws: ["https://app.pynt.io", "https://docs.pynt.io", "https://www.pynt.io"],
    li: ["https://www.linkedin.com/company/pynt"],
    tw: ["https://x.com/pynt_io"],
    gh: ["https://github.com/pynt-io"],
    ytc: "https://www.youtube.com/channel/UChVWpFhgkeiTIfH71IJmd6g",
    urls: [
      "https://join.slack.com/t/pynt-community/shared_invite/zt-2kyutq3tv-bltE~ZIj~gc7NltQ1Yfvng",
      "https://meetings-eu1.hubspot.com/tural-mirzayev",
      "https://pynt-community.slack.com/join/shared_invite/zt-2kyutq3tv-bltE~ZIj~gc7NltQ1Yfvng"
    ],
    ytp: ["https://www.youtube.com/@Pynt0-u8u"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  QuamCore: {
    ws: ["https://www.quamcore.com"],
    li: ["https://www.linkedin.com/company/quamcore"],
    urls: [
      "https://www.quamcore.com/accessibility-statement",
      "https://www.quamcore.com/cookie-policy-eu",
      "https://www.quamcore.com/privacy-policy"
    ],
    _meta: { isHomepage: true, isVerified: true }
  },
  QuantHealth: {
    ws: ["https://quanthealth.ai", "https://trust.quanthealth.ai"],
    li: ["https://www.linkedin.com/company/quanthealthlabs"],
    tw: ["https://x.com/quanthealthl"],
    urls: ["https://trust.quanthealth.ai"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Quantum Machines": {
    ws: ["https://www.quantum-machines.co"],
    li: ["https://www.linkedin.com/company/quantumachines"],
    fb: ["https://www.facebook.com/quantummachines"],
    tw: ["https://twitter.com/QuantumQM"],
    ytp: ["https://www.youtube.com/c/QuantumMachines"],
    urls: ["https://bsky.app/profile/quantummachines.bsky.social", "https://qm.teamme.link"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Quantum Source": {
    ws: ["https://www.qs-labs.com"],
    li: ["https://www.linkedin.com/company/quantum-source-labs-ltd"],
    tw: ["https://x.com/qs_labs"],
    ytc: "https://www.youtube.com/channel/UC0beEcUIGopYE1I6PlLeJvQ",
    ytp: ["https://www.youtube.com/@QuantumSourcelabs"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Quantum transistors": {
    ws: ["https://quantumtransistors.com"],
    urls: ["https://eic.ec.europa.eu/index_en", "https://ltu.co.il", "https://quantumtransistors.com"],
    _meta: { isHomepage: true }
  },
  Quicklizard: {
    ws: ["https://login.euca.quicklizard.com", "https://lp.quicklizard.com", "https://quicklizard.com"],
    li: ["https://www.linkedin.com/company/quicklizard"],
    ytp: ["https://www.youtube.com/@quicklizard-22"],
    urls: [
      "https://login.start-chat.com/modal/67e8d1d4-84fa-4d0a-b95a-bd5d52b37825/9c95bc13-748f-4933-a8a7-5432592caf5e",
      "https://www.capterra.com/reviews/165267/Quicklizard"
    ],
    _meta: { isHomepage: true, isVerified: true }
  },
  Quris: {
    ws: ["https://www.quris.ai"],
    li: ["https://www.linkedin.com/company/quris-ai"],
    _meta: { isHomepage: true, isVerified: true }
  },
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
    _meta: { isHomepage: true, isVerified: true }
  },
  "RAAAM Memory Technologies Ltd.": {
    ws: ["https://raaam-tech.com"],
    li: ["https://www.linkedin.com/company/raaam"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "REE Automotive": {
    ws: ["https://ree.auto"],
    li: ["https://www.linkedin.com/company/reeautoofficial"],
    fb: ["https://www.facebook.com/ReeAutoOfficial"],
    tw: ["https://twitter.com/ReeAutoOfficial"],
    ig: ["https://www.instagram.com/reeautoofficial"],
    ytc: ["https://www.youtube.com/channel/UC9sDIkFJSj0A7_AvCuHl3gw"],
    urls: ["https://investors.ree.auto", "https://medium.com/@ReeAutoOfficial"],
    ytp: ["https://www.youtube.com/@REEAutomotive"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "REIGO Investments": {
    ws: ["https://reigo-inv.com"],
    li: ["https://www.linkedin.com/company/reigo-investments"],
    urls: ["http://www.tbdm.co.il"],
    _meta: { isHomepage: true }
  },
  REplace: {
    ws: ["https://www.replace-energy.com"],
    li: ["https://www.linkedin.com/company/renewable-energy-place-ltd"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Radiflow: {
    ws: ["https://www.radiflow.com"],
    li: ["https://www.linkedin.com/company/radiflow"],
    tw: ["https://x.com/radiflowsec"],
    ytc: "https://www.youtube.com/channel/UCqqiQ_yz7vNoDHXYS4zIbQQ",
    urls: ["https://radiflow-partners.com", "https://radiflow-partners.net"],
    ytp: ["https://www.youtube.com/@radiflowSec"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Rafael Advanced Defense Systems": {
    ws: ["https://career.rafael.co.il", "https://www.rafael.co.il"],
    li: ["https://www.linkedin.com/company/rafael-advanced-defense-systems-official"],
    fb: ["https://www.facebook.com/rafaeldefense"],
    tw: ["https://x.com/rafaeldefense"],
    ig: ["https://www.instagram.com/rafaeldefense"],
    ytp: ["https://www.youtube.com/@rafaelmarketingltd"],
    urls: ["https://rafael-uk.com", "https://www.rafael-usa.com"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Raftt: {
    ws: ["https://docs.raftt.io", "https://www.raftt.io"],
    li: ["https://www.linkedin.com/company/raftt"],
    tw: ["https://x.com/rafttio"],
    urls: ["https://join.slack.com/t/rafttcommunity/shared_invite/zt-196nlb5ra-ZcIw~2T7Glq5NuBaqIlgcA"],
    _meta: { isHomepage: true }
  },
  RailVision: {
    ws: ["https://ir.railvision.io", "https://railvision.io"],
    li: ["https://www.linkedin.com/company/rail-vision"],
    fb: ["https://www.facebook.com/railvision.io"],
    tw: ["https://x.com/rail_vision"],
    ig: ["https://www.instagram.com/railvision"],
    urls: ["https://ir.railvision.io", "https://railvision.io", "https://soundcloud.com/rail-evolution-podcast"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Razor Labs": {
    ws: ["https://www.razor-labs.com"],
    li: ["https://www.linkedin.com/company/razor-technologies-inc"],
    ytp: ["https://www.youtube.com/@razorlabsai"],
    urls: ["https://wponetap.com"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "RealView Imaging": {
    ws: ["https://realviewimaging.com"],
    li: ["https://www.linkedin.com/company/2239612"],
    ytc: "https://www.youtube.com/channel/UCk1-5S08wH1h45ULf3_SUHw",
    ytp: ["https://www.youtube.com/@realviewimaging2883"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Red Access": {
    ws: ["https://redaccess.io"],
    li: ["https://www.linkedin.com/company/red-access"],
    tw: ["https://x.com/redaccess_io"],
    ytp: ["https://www.youtube.com/@redaccess_io"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Red Alert": { ws: "" },
  RedDress: {
    ws: ["https://rct.reddressmedical.com", "https://reddressmedical.com"],
    li: ["https://www.linkedin.com/company/reddress"],
    fb: ["https://www.facebook.com/reddressltd1"],
    tw: ["https://x.com/reddressltd1"],
    ytp: ["https://www.youtube.com/@reddressmedical"],
    _meta: { isHomepage: true, isVerified: true }
  },
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
    _meta: { isHomepage: true, isVerified: true }
  },
  Reeco: {
    ws: ["https://buyer.reeco.com", "https://reeco.com"],
    li: ["https://www.linkedin.com/company/re-eco"],
    fb: ["https://www.facebook.com/the.official.reeco"],
    ig: ["https://www.instagram.com/the.official.reeco"],
    ytp: ["https://www.youtube.com/@reecoofficial"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Refine Intelligence": {
    ws: ["https://www.refineintelligence.com"],
    li: ["https://www.linkedin.com/company/refine-intelligence"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Reflectiz: {
    ws: ["https://dashboard.reflectiz.com", "https://www.reflectiz.com"],
    li: ["https://www.linkedin.com/company/reflectiz"],
    fb: ["https://www.facebook.com/reflectiz.cyber"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Regulus Cyber": {
    ws: ["https://regulus.com"],
    li: ["https://www.linkedin.com/company/regulus-cyber"],
    fb: ["https://www.facebook.com/reguluscyber"],
    tw: ["https://x.com/reguluscyber"],
    ig: ["https://www.instagram.com/regulus.cyber"],
    urls: ["https://www.comeet.com/jobs/regulus/9A.00D"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Remepy: {
    ws: ["https://www.remepy.com"],
    li: ["https://www.linkedin.com/company/remepy"],
    fb: ["https://www.facebook.com/remepyhealth"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Remilk: {
    ws: ["https://www.remilk.com"],
    li: ["https://www.linkedin.com/company/remilk"],
    fb: ["https://www.facebook.com/remilkfoods"],
    tw: ["https://x.com/remilk_foods"],
    ig: ["https://www.instagram.com/remilk_foods"],
    urls: ["https://www.gad-remilk.co.il"],
    _meta: { isHomepage: true, isVerified: true }
  },
  RepAir: {
    ws: ["https://www.repair-carbon.com"],
    li: ["https://www.linkedin.com/company/repair-carbon"],
    urls: ["https://app.mvpr.io/company/repair-carbon"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "RespirAI Medical": {
    ws: ["https://www.respirai.com"],
    urls: ["https://www.respirai.com/privacy-policy"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  RevealSecurity: {
    ws: ["https://www.reveal.security"],
    li: ["https://www.linkedin.com/company/revealsecurity"],
    tw: ["https://x.com/revealsecurity"],
    ytp: ["https://www.youtube.com/@reveal.security"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Revrod: { ws: ["https://www.revrod.io"], _meta: { isHomepage: true, isVerified: true } },
  Revuze: {
    ws: ["https://go.revuze.it", "https://www.revuze.it"],
    li: ["https://www.linkedin.com/company/revuse-technology"],
    fb: ["https://www.facebook.com/revuze"],
    tw: ["https://x.com/revuze"],
    ytp: ["https://www.youtube.com/@revuzeit"],
    urls: [
      "https://explorer.revuze.ai",
      "https://us02web.zoom.us/webinar/register/WN_k9ixDe6SSyOh38jmGM_M6g",
      "https://vimeo.com/privacy",
      "https://vimeo.com/revuze",
      "https://www.cgsmsummit.com"
    ],
    _meta: { isHomepage: true, isVerified: true }
  },
  Rewind: {
    ws: ["https://www.rewind.earth"],
    li: ["https://www.linkedin.com/company/rewindearth"],
    tw: ["https://x.com/rewind_earth"],
    ytp: ["https://www.youtube.com/@rewind_earth"],
    urls: ["https://craftandroot.com"],
    _meta: { isHomepage: true }
  },
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
    _meta: { isHomepage: true, isVerified: true }
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
    ytp: ["https://www.youtube.com/@Riversidefm"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Rivulis Irrigation": {
    ws: [
      "https://es.rivulis.com",
      "https://fr.rivulis.com",
      "https://he.rivulis.com",
      "https://it.rivulis.com",
      "https://pt.rivulis.com",
      "https://ru.rivulis.com",
      "https://tr.rivulis.com",
      "https://www.rivulis.com"
    ],
    li: ["https://www.linkedin.com/company/4798638"],
    fb: ["https://www.facebook.com/rivulisdripirrigation"],
    ig: ["https://www.instagram.com/rivulis.irrigation"],
    ytc: "https://www.youtube.com/channel/UCNbDMgwEdCkoxUucCW7P0GQ",
    tt: ["https://www.tiktok.com/@rivulis_irrigation"],
    urls: [
      "https://lm-studio.co.il",
      "https://youtu.be/EKiagw-qXOk",
      "https://youtu.be/Neg6wEY8Xq8",
      "https://youtu.be/YTH_BmcHuxo"
    ],
    ytp: ["https://www.youtube.com/@Rivulis_drip_micro_irrigation"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Run:AI": {
    ws: [
      "https://blogs.nvidia.com",
      "https://developer.nvidia.com",
      "https://docs.nvidia.com",
      "https://investor.nvidia.com",
      "https://marketplace.nvidia.com",
      "https://resources.nvidia.com",
      "https://www.nvidia.com"
    ],
    li: ["https://www.linkedin.com/company/nvidia"],
    fb: ["https://www.facebook.com/nvidia"],
    tw: ["https://x.com/nvidiadc"],
    ytp: ["https://www.youtube.com/@nvidia"],
    urls: [
      "https://blogs.nvidia.com/blog/category/enterprise",
      "https://developer.nvidia.com/blog/category/data-center-cloud",
      "https://developer.nvidia.com/deep-learning-performance-training-inference",
      "https://docs.nvidia.com/data-center-gpu/line-card.pdf",
      "https://investor.nvidia.com/home/default.aspx",
      "https://resources.nvidia.com/l/en-us-blackwell-architecture",
      "https://www.nventures.ai",
      "https://www.nvidia.com/en-us/about-nvidia",
      "https://www.nvidia.com/en-us/about-nvidia/ai-computing",
      "https://www.nvidia.com/en-us/about-nvidia/careers",
      "https://www.nvidia.com/en-us/accelerated-applications",
      "https://www.nvidia.com/en-us/data-center/data-center-gpus",
      "https://www.nvidia.com/en-us/data-center/data-center-gpus/tesla-qualified-servers-catalog",
      "https://www.nvidia.com/en-us/data-center/dgx-platform",
      "https://www.nvidia.com/en-us/data-center/gpu-cloud-computing",
      "https://www.nvidia.com/en-us/data-center/hgx",
      "https://www.nvidia.com/en-us/data-center/nvlink",
      "https://www.nvidia.com/en-us/data-center/nvlink-c2c",
      "https://www.nvidia.com/en-us/data-center/products/certified-systems",
      "https://www.nvidia.com/en-us/data-center/products/mgx",
      "https://www.nvidia.com/en-us/data-center/resources/mlperf-benchmarks",
      "https://www.nvidia.com/en-us/data-center/solutions/confidential-computing",
      "https://www.nvidia.com/en-us/data-center/sustainable-computing/energy-efficiency-calculator",
      "https://www.nvidia.com/en-us/data-center/technologies/blackwell-architecture",
      "https://www.nvidia.com/en-us/data-center/technologies/hopper-architecture",
      "https://www.nvidia.com/en-us/data-center/tensor-cores",
      "https://www.nvidia.com/en-us/data-center/tesla-product-literature",
      "https://www.nvidia.com/en-us/data-center/virtual-solutions",
      "https://www.nvidia.com/en-us/data-center/where-to-buy",
      "https://www.nvidia.com/en-us/foundation",
      "https://www.nvidia.com/en-us/gpu-cloud",
      "https://www.nvidia.com/en-us/networking/products",
      "https://www.nvidia.com/en-us/research",
      "https://www.nvidia.com/en-us/sustainability",
      "https://www.nvidia.com/en-us/technologies",
      "https://www.nvidia.com/en-us/technologies/multi-instance-gpu",
      "https://www.nvidia.com/en-us/training"
    ],
    _meta: { isHomepage: true, isVerified: true }
  },
  "SAM Seamless Network": {
    ws: ["https://securingsam.com"],
    li: ["https://www.linkedin.com/company/sam-seamless-network"],
    fb: ["https://www.facebook.com/samseamlessnetwork"],
    tw: ["https://x.com/seamlesssam"],
    ig: ["https://www.instagram.com/securingsam"],
    ytp: ["https://www.youtube.com/@samseamlessnetwork5685"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "SIGA OT Solutions": {
    ws: ["https://sigasec.com"],
    li: ["https://www.linkedin.com/company/sigaotsolutions"],
    ytc: "https://www.youtube.com/channel/UC-MRJHPMCuo8ByTinnV7CXg",
    urls: ["https://attractive.co.il", "https://sigaotsolution.wpengine.com/request-a-demo"],
    ytp: ["https://www.youtube.com/@siga-otsolutions2428"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "SSV Network": {
    ws: [
      "https://app.ssv.network",
      "https://docs.ssv.network",
      "https://explorer.ssv.network",
      "https://forum.ssv.network",
      "https://ssv.network",
      "https://stake.ssv.network"
    ],
    tw: ["https://x.com/ssv_network"],
    gh: ["https://github.com/ssvlabs"],
    ytp: ["https://www.youtube.com/@ssvnetwork"],
    urls: [
      "https://discord.gg/5vT22pRBrf",
      "https://docs.ssv.network/learn/introduction",
      "https://drive.google.com/file/d/1dPzTQIJ2cGdL-YuQdhHmHlaB14BDHsI1/view",
      "https://dune.com/ssv_network",
      "https://explorer.ssv.network",
      "https://snapshot.org",
      "https://ssv.foundation",
      "https://ssvlabs.io",
      "https://stake.ssv.network"
    ],
    _meta: { isHomepage: true, isVerified: true }
  },
  STOREE: {
    ws: ["https://storee.ai"],
    li: ["https://www.linkedin.com/company/storeeai"],
    _meta: { isHomepage: true, isVerified: true }
  },
  STRIKECO: {
    ws: ["https://strikeco.io"],
    li: ["https://www.linkedin.com/company/strikeco-sports"],
    ig: ["https://www.instagram.com/strikeco_sports"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Salignostics: {
    ws: ["https://www.salignostics.com"],
    li: ["https://www.linkedin.com/company/salignostics"],
    urls: ["http://gummygam.com", "https://salistick.co.il/english"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  "Salvador Technologies": {
    ws: ["https://www.salvador-tech.com"],
    ytc: "https://www.youtube.com/channel/UC3ytVKx8UiDFFs-_LFo-Xdw",
    urls: ["https://api.whatsapp.com/send"],
    ytp: ["https://www.youtube.com/@salvadortechnologies7400"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  "Scala Biodesign": {
    ws: ["https://www.scala-bio.com"],
    li: ["https://www.linkedin.com/company/scala-biodesign"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Scinai Immunotherapeutics": {
    ws: ["https://www.scinai.com"],
    li: ["https://www.linkedin.com/company/scinai"],
    fb: ["http://facebook.com/ScinaiSCNI"],
    tw: ["http://twitter.com/scinai"],
    ig: ["http://instagram.com/scinai.immunotherapeutics"],
    ytp: ["https://youtube.com/@Scinai"],
    urls: ["https://www.reddit.com/r/Scinai"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Scopio Labs": {
    ws: ["https://learn.scopiolabs.com", "https://scopiolabs.com", "https://trust.scopiolabs.com"],
    li: ["https://www.linkedin.com/company/scopio-labs"],
    fb: ["https://www.facebook.com/scopiolabs"],
    tw: ["https://x.com/scopio_labs"],
    urls: ["https://scopiolabs.atlassian.net/servicedesk/customer/portal/4/group/77/create/10149"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  Scytale: {
    ws: ["https://app.scytale.ai", "https://scytale.ai", "https://status.scytale.ai"],
    li: ["https://www.linkedin.com/company/scytale-ai"],
    fb: ["https://www.facebook.com/scytalecomplianceautomation"],
    tw: ["https://x.com/scytale_ai"],
    ig: ["https://www.instagram.com/scytale.ai"],
    ytp: ["https://www.youtube.com/@scytaleai"],
    urls: ["https://www.g2.com/products/scytale-g2/reviews"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Secret Double Octopus": {
    ws: ["https://doubleoctopus.com", "https://go.doubleoctopus.com", "https://support.doubleoctopus.com"],
    li: ["https://www.linkedin.com/company/secret-double-octopus"],
    tw: ["https://x.com/double_octopus"],
    ytp: ["https://www.youtube.com/@secretdoubleoctopus5220"],
    urls: ["https://fidoalliance.org/company/secret-double-octopus", "https://vimeo.com/doubleoctopus"],
    _meta: { isHomepage: true, isVerified: true }
  },
  SeeTree: {
    ws: ["https://myfarm.seetree.ai", "https://www.seetree.ai"],
    li: ["https://www.linkedin.com/company/seetree"],
    tw: ["https://x.com/seetree_ai"],
    ig: ["https://www.instagram.com/seetree_ai"],
    ytc: ["https://www.youtube.com/channel/ucckjsmtcxdou7bdgb2eoysq"],
    ytp: "https://www.youtube.com/@SeeTreeAI",
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isVerified: true, isBrowserVerified: true }
  },
  "Sency.": {
    ws: ["https://www.sency.ai"],
    li: ["https://www.linkedin.com/company/sencyai"],
    urls: [
      "https://docs.google.com/document/d/e/2PACX-1vS7EGUqOaDmV4XGEcqchOLhh9iX6Sb3tRvkMljYYcfAcLi4z_2o1_nS3JSLbqDn0vkGoz85003-YbC8/pub"
    ],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Senecio Robotics": {
    ws: ["https://heb.senecio-robotics.com", "https://www.senecio-robotics.com"],
    li: ["https://www.linkedin.com/company/senecio-robotics"],
    urls: ["https://www.senecio-robotics.com"],
    _meta: { isHomepage: true }
  },
  "Senseera Health": {
    ws: ["https://senseerahealth.com"],
    urls: ["https://pearlcom.co.il", "https://senseerahealth.com", "https://senseerahealth.com/privacy-policy"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Senser: {
    ws: ["https://senser.tech"],
    li: ["https://www.linkedin.com/company/senser-tech"],
    tw: ["https://x.com/senser_tech"],
    urls: ["https://meetings-eu1.hubspot.com/yuval-lev/senser-intro"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Sensos: {
    ws: ["https://customerportal.sensos.io", "https://learn.sensos.io", "https://sensos.io", "https://sync.sensos.io"],
    li: ["https://www.linkedin.com/company/sensoslabz"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isVerified: true, isBrowserVerified: true }
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
    _meta: { isVerified: true, isBrowserVerified: true }
  },
  Sequentify: {
    ws: ["https://www.sequentify.com"],
    li: ["https://www.linkedin.com/company/sequentify"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Seraphic Security": {
    ws: ["https://seraphicsecurity.com"],
    li: ["https://www.linkedin.com/company/seraphicsecurity"],
    tw: ["https://x.com/SeraphicSec"],
    ytc: ["https://www.youtube.com/channel/UCEFzVspJOMPv2S3EBsam_vw"],
    urls: ["https://2024.seraphicsecurity.com"],
    ytp: ["https://www.youtube.com/@seraphicsecurity"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Sett: {
    ws: ["https://www.sett.ai"],
    li: ["https://www.linkedin.com/company/sett-ai"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Shield: {
    ws: ["https://kb.shieldfc.com", "https://www.shieldfc.com"],
    li: ["https://www.linkedin.com/company/shieldcommunicationcompliance"],
    tw: ["https://x.com/shield_rbtl"],
    ig: ["https://www.instagram.com/lifeatshield"],
    _meta: { isHomepage: true, isVerified: true }
  },
  ShieldIOT: {
    ws: ["https://shieldiot.io"],
    li: ["https://www.linkedin.com/company/shieldiot"],
    tw: ["https://x.com/shieldiot1"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Shlomo Group - Car and Credit Unit": {
    ws: ["https://pleasing.shlomo.co.il", "https://www.shlomo.co.il"],
    li: ["https://www.linkedin.com/company/738582"],
    fb: ["https://www.facebook.com/shlomosixt"],
    ig: ["https://www.instagram.com/shlomogroup"],
    ytp: ["https://www.youtube.com/@shlomosixtcars"],
    urls: ["https://apps.apple.com/IL/app/id1558632731", "https://shlomo-bit.co.il"],
    _meta: { isHomepage: true, isVerified: true }
  },
  ShopperAI: {
    ws: ["https://shopperai.ai"],
    li: ["https://www.linkedin.com/company/14058778"],
    fb: ["https://www.facebook.com/drill.neuromarketing"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Sightful: {
    ws: ["https://sightful.com"],
    li: ["https://www.linkedin.com/company/heysightful"],
    ig: ["https://www.instagram.com/sightful"],
    ytp: ["https://www.youtube.com/@Sightful-Official"],
    urls: ["https://help.sightful.com/en"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Silentium: {
    ws: ["https://www.silentium.com"],
    li: ["https://www.linkedin.com/company/387937"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isVerified: true, isBrowserVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  Simpliigood: {
    ws: ["https://shop.simpliigood.com", "https://simpliigood.com"],
    li: ["https://www.linkedin.com/company/simpliigood"],
    ig: ["https://www.instagram.com/simpliigood.us"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  Skai: {
    ws: ["https://skai.io"],
    li: ["https://www.linkedin.com/company/skaicommerce"],
    fb: ["https://www.facebook.com/skaicommerce"],
    tw: ["https://x.com/skaicommerce"],
    ig: ["https://www.instagram.com/lifeatskai"],
    ytp: ["https://www.youtube.com/@skaicommerce"],
    urls: ["https://app.kenshoo.com/portal", "https://developers.kenshoo.com", "https://shopable2026.splashthat.com"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Skyhawk Security": {
    ws: ["https://app.skyhawk.security", "https://partners.skyhawk.security", "https://skyhawk.security"],
    li: ["https://www.linkedin.com/company/skyhawkcloudsecurity"],
    tw: ["https://twitter.com/SkyhawkCloudSec"],
    urls: [
      "https://www.gartner.com/reviews/market/cloud-native-application-protection-platforms/vendor/skyhawk-security/product/skyhawk-synthesis-security-platform"
    ],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Skyline Robotics": {
    ws: ["https://www.skylinerobotics.com"],
    li: ["https://www.linkedin.com/company/skyline-robotics"],
    fb: ["https://www.facebook.com/skylinerobotics"],
    tw: ["https://x.com/roboticskyline"],
    ig: ["https://www.instagram.com/skyline_robotics"],
    ytc: "https://www.youtube.com/channel/UCp4QAlzBCsO-CBk8p4dqJFg",
    ytp: ["https://www.youtube.com/@SkylineRobotics"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Slice Global": {
    ws: ["https://app.sliceglobal.com", "https://sliceglobal.com"],
    li: ["https://www.linkedin.com/company/globalslice"],
    urls: ["https://www.widelab.co"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Sodot: {
    ws: ["https://docs.sodot.dev", "https://www.sodot.dev"],
    li: ["https://www.linkedin.com/company/sodot"],
    tw: ["https://x.com/sodot_hq"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "SofWave Medical": {
    ws: ["https://sofwave.com"],
    li: ["https://www.linkedin.com/company/sofwave"],
    fb: ["https://www.facebook.com/sofwave"],
    tw: ["https://x.com/sofwave"],
    ig: ["https://www.instagram.com/sofwavemed"],
    ytc: "https://www.youtube.com/channel/UC3RyhVm1CRtmU0EscGI3FrA",
    tt: ["https://www.tiktok.com/@sofwavemed"],
    ytp: ["https://www.youtube.com/@sofwavemedical"],
    _meta: { isHomepage: true, isVerified: true }
  },
  SolCold: {
    ws: ["https://www.solcold.co"],
    li: ["https://www.linkedin.com/company/solcold"],
    fb: ["https://www.facebook.com/solcoldinnovation"],
    ytp: ["https://www.youtube.com/@solcold7677"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  Somite: { tw: "https://x.com/somiteai" },
  SonicEdge: { ws: ["https://sonicedge.io"], _meta: { isHomepage: true, isVerified: true } },
  Sorbet: { ws: ["https://advance.getsorbet.com"], _meta: { isHomepage: true, isVerified: true } },
  SpaceIL: {
    ws: ["https://arb.spaceil.com", "https://eng.spaceil.com", "https://kids.spaceil.com", "https://www.spaceil.com"],
    fb: ["https://www.facebook.com/spaceil"],
    tw: ["https://x.com/teamspaceil"],
    ig: ["https://www.instagram.com/spaceil"],
    ytp: ["https://www.youtube.com/@teamspaceil"],
    urls: ["https://www.wix.com"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Spectral: {
    ws: ["https://spectralops.io"],
    li: ["https://www.linkedin.com/company/spectralops-io"],
    tw: ["https://x.com/getspectral"],
    gh: ["https://github.com/spectralops"],
    urls: ["http://checkpoint.com", "https://www.checkpoint.com/cloudguard", "https://www.checkpoint.com/legal"],
    _meta: { isHomepage: true, isVerified: true }
  },
  SpeedSize: {
    ws: ["https://console.speedsize.com", "https://support.speedsize.com", "https://try.speedsize.com"],
    urls: [
      "https://apps.shopify.com/speedsize/reviews",
      "https://aws.amazon.com/marketplace/pp/prodview-7rnnsiahjwnwq",
      "https://commercemarketplace.adobe.com/speedsize-magento2-module.html",
      "https://patents.justia.com/assignee/speedsize-ltd",
      "https://wordpress.org/plugins/speedsize-ai-image-optimizer"
    ],
    _meta: { isHomepage: true, isVerified: true }
  },
  Speedata: {
    li: ["https://www.linkedin.com/company/speedataio"],
    fb: ["https://www.facebook.com/speedata.io"],
    gh: ["https://github.com/Speedata-io"],
    ytp: ["https://www.youtube.com/@Speedata-io"],
    alt: [
      { n: "ARM Neoverse", ws: "https://www.arm.com/products/silicon-ip-cpu/neoverse" },
      { n: "Xilinx Versal ACAP", ws: "https://www.xilinx.com/products/silicon-platforms/versal.html" }
    ],
    _meta: { isVerified: true, isBrowserVerified: true }
  },
  Spetz: {
    ws: ["https://spetz.io"],
    urls: ["https://spetz.io/the-role-of-personalization-in-chatbot-engagement"],
    _meta: { isHomepage: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  Stargo: {
    ws: ["https://www.stargo.co"],
    li: ["https://www.linkedin.com/company/stargo-co"],
    fb: ["https://www.facebook.com/stargo.solutions"],
    ig: ["https://www.instagram.com/stargo.think.forward"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "StarkWare Industries": {
    ws: ["https://docs.starkware.co", "https://starkware.co", "https://starknet.io"],
    li: ["http://www.linkedin.com/company/starkware"],
    tw: ["https://twitter.com/StarkWareLtd"],
    gh: ["https://github.com/starkware-libs"],
    ytc: ["https://www.youtube.com/channel/UCnDWguR8mE2oDBsjhQkgbvg"],
    urls: ["https://generatepress.com", "https://medium.com/starkware", "https://www.cairo-lang.org"],
    ytp: ["https://www.youtube.com/@starkware_ltd"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Steakholder Foods": {
    ws: ["https://www.steakholderfoods.com"],
    li: ["https://www.linkedin.com/company/steakholderfoods"],
    fb: ["https://www.facebook.com/steakholderfoods"],
    tw: ["https://x.com/stkhfoods"],
    ig: ["https://www.instagram.com/steakholderfoods"],
    _meta: { isHomepage: true, isVerified: true }
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
    ytc: "https://www.youtube.com/channel/UCvKrw5lNPdLA_3PjnmYK5DA",
    ytp: ["https://www.youtube.com/@trystigg"],
    _meta: { isHomepage: true, isVerified: true }
  },
  StoreDot: {
    ws: ["https://www.store-dot.com"],
    li: ["https://www.linkedin.com/company/storedot"],
    fb: ["https://www.facebook.com/storedotltd"],
    tw: ["https://x.com/storedotltd"],
    ig: ["https://www.instagram.com/storedot_xfc"],
    ytc: "https://www.youtube.com/channel/UC5ChQSDVUxSLokJjP42Wmqg",
    urls: ["https://goo.gl/maps/shPJd5niNA5LsX62A", "https://maps.app.goo.gl/sEhaP5sZy3QUJ2hF7"],
    ytp: ["https://www.youtube.com/@StoreDotLtd"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Stream Security": {
    ws: ["https://www.stream.security"],
    li: ["https://www.linkedin.com/company/streamsecurity"],
    fb: ["https://www.facebook.com/streamcloudsec"],
    tw: ["https://x.com/streamsecurity"],
    ig: ["https://www.instagram.com/stream.security"],
    urls: [
      "https://app.streamsec.io",
      "https://partners.amazonaws.com/partners/0010h00001kMTImAAO/lightlytics.com",
      "https://www.gartner.com/reviews/market/cloud-investigation-and-response-automation-cira/vendor/stream-security/product/stream-security"
    ],
    _meta: { isHomepage: true, isVerified: true }
  },
  Strigo: {
    ws: [
      "https://app.strigo.io",
      "https://docs.strigo.io",
      "https://help.strigo.io",
      "https://status.strigo.io",
      "https://strigo.io"
    ],
    li: ["https://www.linkedin.com/company/strigo"],
    tw: ["https://x.com/strigoio"],
    ytc: "https://www.youtube.com/channel/UCBoUhxtKbxkax3y3dN5HTZw",
    ytp: ["https://www.youtube.com/@strigo8642"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  SuperCom: {
    ws: ["https://www.supercom.com"],
    li: ["https://www.linkedin.com/company/2989525"],
    fb: ["https://www.facebook.com/supercom.group"],
    tw: ["https://x.com/supercomgroup"],
    ytp: ["https://www.youtube.com/@supercomgroup"],
    urls: ["https://www.comeet.com/jobs/supercom/46.00A"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Superstream: {
    ws: [
      "https://app.superstream.ai",
      "https://docs.superstream.ai",
      "https://reliability.superstream.ai",
      "https://signup.superstream.ai",
      "https://www.superstream.ai"
    ],
    li: ["https://www.linkedin.com/company/superstreamai"],
    tw: ["https://x.com/superstreamai"],
    urls: ["https://www.npmjs.com/package/superstream-kafka-analyzer"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Suridata: {
    ws: ["https://www.suridata.ai"],
    li: ["https://www.linkedin.com/company/suridataai"],
    urls: [
      "https://goo.gl/maps/byo3JGyBjmkNEi556",
      "https://goo.gl/maps/xmeLTgJdhUVmVfibA",
      "https://maps.app.goo.gl/wvn4JHTnyUq43M3V9"
    ],
    _meta: { isHomepage: true, isVerified: true }
  },
  Swapp: {
    ws: ["https://app.swapp.ai", "https://swapp.ai"],
    li: ["https://www.linkedin.com/company/swapp-ai"],
    fb: ["https://www.facebook.com/swapparchitecture"],
    tw: ["https://x.com/swapp_ai"],
    ig: ["https://www.instagram.com/swapp_architecture"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Sweet Security": {
    ws: ["https://app.sweet.security", "https://hi.sweet.security", "https://www.sweet.security"],
    li: ["https://www.linkedin.com/company/sweet-security"],
    tw: ["https://twitter.com/Sweet_cloud_sec"],
    urls: ["https://join.slack.com/t/sweet-community/shared_invite/zt-20wmxuiwx-jT8Lre4ov24Lml3_puHaOQ"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Sweetch: {
    ws: ["https://www.sweetch.com"],
    li: ["https://www.linkedin.com/company/sweetch"],
    tw: ["https://x.com/sweetchhealth"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Swimm: {
    ws: ["https://app.swimm.io", "https://docs.swimm.io", "https://swimm.io"],
    li: ["https://www.linkedin.com/company/swimm-io"],
    tw: ["https://x.com/swimm_io"],
    gh: ["https://github.com/swimmio"],
    ytc: "https://www.youtube.com/channel/UC-icYrmhtL3yYxaI0TnL7Lg",
    tt: ["https://www.tiktok.com/@swimmfordevs"],
    urls: ["https://plugins.jetbrains.com/plugin/20716-swimm"],
    ytp: ["https://www.youtube.com/@swimm_io"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Syqe Medical": {
    ws: ["https://www.syqemedical.com"],
    urls: [
      "https://syqe.com",
      "https://www.syqemedical.com/cookie-policy",
      "https://www.syqemedical.com/privacy-notice",
      "https://www.syqemedical.com/terms-of-use"
    ],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  Syte: {
    ws: ["https://www.syte.ai"],
    li: ["https://www.linkedin.com/company/syte-ai"],
    fb: ["https://www.facebook.com/SyteVisualAI"],
    tw: ["https://twitter.com/SyteAI"],
    ig: ["https://www.instagram.com/syte_ai"],
    ytc: ["https://www.youtube.com/channel/UC14_kcbqdtM2GB2-jeJYFTg"],
    tt: ["https://www.tiktok.com/@syte.ai"],
    ytp: ["https://www.youtube.com/@syteproductdiscoveryplatfo6994"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "TAT Technologies": {
    ws: ["https://tat-technologies.com"],
    li: ["https://www.linkedin.com/company/tat-technologies-group"],
    fb: ["https://www.facebook.com/tattechnologiesgroup"],
    tw: ["https://x.com/tattecnologies"],
    urls: ["https://web-skipper.co.il", "https://www.sinapistech.com", "https://www.yoti.co.il"],
    _meta: { isHomepage: true, isVerified: true }
  },
  TaTiO: {
    ws: ["https://www.tatio.io"],
    urls: [
      "https://www.tatio.info/industries",
      "https://www.tatio.info/knowledge-center",
      "https://www.tatio.info/terms-of-use",
      "https://www.tatio.io/home",
      "https://www.tatio.io/product",
      "https://www.tatio.me/blog-1",
      "https://www.tatio.me/book-a-demo",
      "https://www.tatio.me/contact-us",
      "https://www.tatio.me/industries",
      "https://www.tatio.me/terms-of-use"
    ],
    _meta: { isHomepage: true, isVerified: true }
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
    ytp: ["https://www.youtube.com/@TabnineAI"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Tactile Mobility": {
    ws: ["https://tactilemobility.com"],
    li: ["https://www.linkedin.com/company/tactile-mobility"],
    fb: ["https://www.facebook.com/tactilemobility"],
    tw: ["https://x.com/tactilemobility"],
    ig: ["https://www.instagram.com/tactilemobility"],
    _meta: { isHomepage: true, isVerified: true }
  },
  TailorMed: {
    ws: ["https://go.tailormed.co", "https://resources.tailormed.co", "https://tailormed.co"],
    li: ["https://www.linkedin.com/company/tailormed---medical-journey-innovations"],
    fb: ["https://www.facebook.com/tailormed.co"],
    tw: ["https://x.com/tailormedtweet"],
    ig: ["https://www.instagram.com/tailormed.co"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isVerified: true, isBrowserVerified: true }
  },
  TechSee: {
    ws: ["https://techsee.com", "https://techsee.atlassian.net"],
    li: ["https://www.linkedin.com/company/techsee"],
    fb: ["https://www.facebook.com/TechSee-786286871505772", "https://www.facebook.com/profile.php?id=100063770901033"],
    tw: ["https://twitter.com/techsee_me"],
    ytc: ["https://www.youtube.com/channel/UCKoz5028YIn69aQV9W1Mt9g"],
    ytp: ["https://www.youtube.com/@techsee291"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Tedooo: {
    ws: ["https://www.tedooo.com"],
    android_app_ids: ["com.mor.tedooo"],
    android_dev_id: "591913365560966627100",
    urls: ["https://apps.apple.com/us/app/tedooo/id1487331226"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Teramount: {
    ws: ["https://teramount.com"],
    li: ["https://www.linkedin.com/company/teramount"],
    tw: ["https://x.com/teramountltd"],
    urls: ["http://www.tbdm.co.il", "https://maps.google.com"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Terminal X": {
    ws: ["https://www.terminalx.com"],
    fb: ["https://www.facebook.com/weareterminalx"],
    ig: ["https://www.instagram.com/terminalx"],
    ytc: "https://www.youtube.com/channel/UCUTXP6iS-VyE1Vxllg_3W5g",
    tt: ["https://www.tiktok.com/@terminalx1"],
    urls: ["https://click.google-analytics.com/redirect", "https://dreamgiftcard.co.il"],
    android_app_ids: ["com.terminalx"],
    ytp: ["https://www.youtube.com/@terminalx8198"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Teva Pharmaceuticals": {
    ws: ["https://www.tevapharm.com"],
    li: ["https://www.linkedin.com/company/teva-pharmaceuticals"],
    fb: ["https://www.facebook.com/tevapharm"],
    tw: ["https://twitter.com/tevausa"],
    ytp: ["https://www.youtube.com/c/tevapharm"],
    urls: ["https://www.medis.is", "https://www.tapi.com"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Tevel: {
    ws: ["https://accounts.tevel-tech.com", "https://www.tevel-tech.com"],
    li: ["https://www.linkedin.com/company/tevel-aerobotics-technologies"],
    tw: ["https://x.com/tevelaerobotics"],
    ytp: ["https://www.youtube.com/@tevelaeroboticstechnologies"],
    urls: ["https://vagas.co.il", "https://vimeo.com/tevel", "https://waze.com"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "The Agro Exchange": { ws: "https://www.agrox.io" },
  "The Mediterranean Food Lab": {
    ws: ["https://www.med-food-lab.com"],
    urls: ["http://cooksho.com"],
    _meta: { isHomepage: true, isVerified: true }
  },
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
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isVerified: true, isBrowserVerified: true }
  },
  Tidhar: {
    ws: ["https://tidhar.co.il"],
    fb: ["https://www.facebook.com/tidhargroup"],
    ig: ["https://www.instagram.com/tidhargroup"],
    urls: ["https://tidhar.my.site.com/community", "https://www.dofinity.com"],
    _meta: { isHomepage: true, isVerified: true }
  },
  TinyTap: {
    ws: [
      "https://blog.tinytap.com",
      "https://campus.tinytap.com",
      "https://courses.tinytap.com",
      "https://edu.tinytap.com",
      "https://tinytap.com",
      "https://www.start.tinytap.com"
    ],
    fb: ["https://www.facebook.com/tinytapit"],
    tw: ["https://x.com/tinytapedu"],
    ig: ["https://www.instagram.com/tinytapit"],
    tt: ["https://www.tiktok.com/@tinytapgames"],
    urls: [
      "https://a.co/d/fqzEXCO",
      "https://blog.tinytap.com",
      "https://itunes.apple.com/us/app/tinytap-moments-into-games/id493868874",
      "https://tinytap.freshdesk.com/en/support/solutions/folders/36000187005",
      "https://www.animocabrands.com",
      "https://www.animocabrands.com/animoca-brands-edtech-subsidiary-tinytap-reveals-new-ai-features-and-roadmap"
    ],
    android_app_ids: ["tinytap.kids.learning.games"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Tipa: {
    ws: ["https://tipa-corp.com"],
    li: ["https://www.linkedin.com/company/tipa"],
    fb: ["https://www.facebook.com/tipacorp"],
    tw: ["https://x.com/tipacorp"],
    ig: ["https://www.instagram.com/tipacorp"],
    ytc: "https://www.youtube.com/channel/UC7ETnS-RhngfSPmzUbE6Mhw",
    urls: ["https://www.pinterest.com/TipaCorp"],
    ytp: ["https://www.youtube.com/@TIPAcorp"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Token Security": {
    ws: ["https://privilege-guardian.ai.token.security", "https://token.security", "https://trust.token.security"],
    li: ["https://www.linkedin.com/company/token-security"],
    tw: ["https://x.com/thetokensec"],
    gh: ["https://github.com/tokensec"],
    ytp: ["https://www.youtube.com/@token.security"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Tomi: {
    ws: ["https://dao.tomi.com", "https://www.tomi.com"],
    tw: ["https://x.com/tomipioneers"],
    urls: [
      "https://apps.apple.com/us/app/tomi-web3-superapp/id1643501440",
      "https://discord.com/invite/tomipioneers",
      "https://t.me/tomi_official_chat",
      "https://tomi.onelink.me/ZC6z/website"
    ],
    android_app_ids: ["com.tomiapp.production"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isVerified: true, isBrowserVerified: true }
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
    ytp: ["https://www.youtube.com/@Towerjazz_official"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Traceloop: {
    ws: ["https://traceloop.com"],
    li: ["https://www.linkedin.com/company/traceloop"],
    tw: ["https://twitter.com/traceloopdev"],
    gh: ["https://github.com/traceloop/hub", "https://github.com/traceloop/openllmetry"],
    urls: ["https://app.traceloop.com", "https://status.traceloop.com", "https://trust.traceloop.com"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Trail Security": {
    ws: ["https://www.cyera.com"],
    li: ["https://www.linkedin.com/company/cyera"],
    tw: ["https://x.com/cyera_io"],
    ytc: "https://www.youtube.com/channel/UCQZhCZIe6xRDjCkfzzwPBCg",
    urls: ["https://portal.datasecai.io/hc", "https://security.cyera.io", "https://www.cyera.io/legal/privacy-policy"],
    ytp: ["https://www.youtube.com/@CyeraSecurity"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  "Tre Capital GP Ltd": { tw: [""] },
  Treetoscope: {
    ws: ["https://www.treetoscope.com"],
    li: ["https://www.linkedin.com/company/treetoscope"],
    urls: ["https://app.treetoscopeapp.com"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Tres: {
    ws: ["https://help.tres.finance", "https://tres.finance", "https://trustcenter.tres.finance"],
    li: ["https://www.linkedin.com/company/tresfinance"],
    tw: ["https://x.com/tresdotfinance"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Trigo: {
    ws: ["https://www.trigoretail.com"],
    li: ["https://www.linkedin.com/company/trigoretail"],
    ytp: ["https://www.youtube.com/c/Trigoretail"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  "TripleW Ltd.": {
    ws: ["https://www.triplew.co"],
    li: ["https://www.linkedin.com/company/triplew-ltd"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Trustmi: {
    ws: ["https://portal.trustmi.ai", "https://trustmi.ai"],
    li: ["https://www.linkedin.com/company/trustmi-ai"],
    urls: [
      "https://apply.workable.com/trustmi",
      "https://trustmi.webflow.io/privacy-policy",
      "https://www.prnewswire.com/news-releases/trustmi-named-winner-of-the-coveted-top-infosec-innovator-awards-for-2025-302596439.html"
    ],
    _meta: { isHomepage: true, isVerified: true }
  },
  Turpaz: {
    ws: ["https://www.turpaz.co.il"],
    urls: ["https://www.catom.co.il", "https://www.catom.com"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Tweed: {
    ws: ["https://demo.paytweed.com", "https://paytweed.com"],
    li: ["https://www.linkedin.com/company/paytweed"],
    tw: ["https://x.com/paytweed"],
    gh: ["https://github.com/paytweed"],
    urls: ["https://paytweed.medium.com"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Twine: {
    ws: ["https://www.twinesecurity.com"],
    li: ["https://www.linkedin.com/company/twinesecurity"],
    tw: ["https://x.com/twinesecurity"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Twine Solutions": {
    ws: ["https://twine-s.com"],
    li: ["https://www.linkedin.com/company/twine-solutions-ltd"],
    fb: ["https://www.facebook.com/twinesolutions"],
    tw: ["https://x.com/twine_solutions"],
    ig: ["https://www.instagram.com/twine_solutions"],
    ytc: "https://www.youtube.com/channel/UCcXOfI6QXnLjCz82gWGtI4g",
    ytp: ["https://www.youtube.com/@TwineSolutions"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "UBQ Materials": {
    ws: ["https://www.ubqmaterials.com"],
    li: ["https://www.linkedin.com/company/ubq-materials"],
    fb: ["https://www.facebook.com/UBQMaterials"],
    tw: ["https://twitter.com/UBQ_Materials"],
    ig: ["https://www.instagram.com/ubq_materials"],
    ytc: ["https://www.youtube.com/channel/UCDJidIDfuy0bzJT6GocaCrA"],
    ytp: ["https://www.youtube.com/@UBQMaterials"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "UG Labs": {
    ws: ["https://docs.uglabs.io", "https://uglabs.io"],
    li: ["https://www.linkedin.com/company/uglabs"],
    urls: [
      "https://console.stg.uglabs.app/login",
      "https://console.stg.uglabs.app/signup",
      "https://docs.uglabs.io/docs/api/websocket-protocol",
      "https://docs.uglabs.io/docs/intro",
      "https://pug-playground.stg.uglabs.app"
    ],
    _meta: { isHomepage: true, isVerified: true }
  },
  "UNIPaaS Payments Technologies": {
    ws: ["https://docs.unipaas.com", "https://portal.unipaas.com", "https://www.unipaas.com"],
    li: ["https://www.linkedin.com/company/unipaas"],
    ytp: ["https://www.youtube.com/@unipaas"],
    _meta: { isHomepage: true, isVerified: true }
  },
  UltraSight: {
    ws: ["https://ultrasight.com"],
    li: ["https://linkedin.com/company/ultrasightai"],
    tw: ["https://twitter.com/UltraSightAI"],
    urls: ["https://etyhadar.com"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Uniper-care Technologies": {
    ws: ["https://www.unipercare.com"],
    li: ["https://www.linkedin.com/company/uniper-care-technologies"],
    fb: ["https://www.facebook.com/unipercare"],
    ytc: "https://www.youtube.com/channel/UCrdJHxw8b8pY6Hfh8_PfxJg",
    urls: [
      "https://app.uniper-care.com",
      "https://apps.apple.com/us/app/uniper-app/id1529787818",
      "https://unipercare.zendesk.com/hc/en-us",
      "https://web.telegram.org",
      "https://www.whatsapp.com"
    ],
    android_app_ids: ["com.uniper.uniapp"],
    ytp: ["https://www.youtube.com/@unipercare1086"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Upright Technologies": {
    ws: ["https://store.uprightpose.com", "https://www.uprightpose.com"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Upstream Security": {
    ws: ["https://info.upstream.auto", "https://upstream.auto"],
    li: ["https://www.linkedin.com/company/upstream-security"],
    fb: ["https://www.facebook.com/stage.upstream.auto"],
    tw: ["https://x.com/upstreamauto"],
    ig: ["https://www.instagram.com/upstreamsecurity"],
    ytc: "https://www.youtube.com/channel/UC82moW-55gE7wzL643IND-Q",
    urls: ["https://upstreamsecurity.atlassian.net/servicedesk/customer/portal/2/user/login"],
    ytp: ["https://www.youtube.com/@UpstreamSecurity"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Urban Aeronautics": {
    ws: ["https://www.urbanaero.com"],
    li: ["https://www.linkedin.com/company/urban-aeronautics"],
    fb: ["https://www.facebook.com/RealUrbanAero"],
    tw: ["https://twitter.com/realurbanaero"],
    ytc: ["https://www.youtube.com/channel/UCY0m6apxo-2zP3N3Zx8ydaA"],
    ytp: ["https://www.youtube.com/@UrbanAero"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  "V-Wave": {
    ws: ["https://vwavemedical.com"],
    li: ["https://www.linkedin.com/company/johnson-&-johnson-medtech"],
    urls: ["https://www.relieve-hf.info"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "VAST Data": {
    gh: ["https://github.com/vast-data"],
    ytp: ["https://www.youtube.com/vastdata", "https://www.youtube.com/@VASTData"],
    urls: [
      "https://aws.amazon.com/marketplace/seller-profile?id=seller-rhponql53yee4",
      "https://www.carahsoft.com/vast"
    ],
    _meta: { isVerified: true, isBrowserVerified: true }
  },
  VIVID: {
    ws: ["https://link.vivid.me", "https://www.vivid.me"],
    urls: ["https://apps.apple.com/app/VIVID/id1570270579"],
    android_app_ids: ["me.vivid.vivid"],
    _meta: { isHomepage: true }
  },
  "VSL Labs": {
    ws: ["https://status.vsllabs.com", "https://vsllabs.com"],
    li: ["https://www.linkedin.com/company/vsllabs"],
    urls: ["https://status.vsllabs.com"],
    _meta: { isHomepage: true }
  },
  "Valens Semiconductor": {
    ws: ["https://investors.valens.com", "https://www.valens.com"],
    li: ["https://www.linkedin.com/company/valens"],
    fb: ["https://www.facebook.com/valenssemiconductor"],
    tw: ["https://x.com/valenssemi"],
    ig: ["https://www.instagram.com/lifeatvalens"],
    ytc: "https://www.youtube.com/channel/UC3KG2a4fmrIPwN3FCvNBVXA",
    urls: ["https://www.valens.com"],
    ytp: ["https://www.youtube.com/@valenssemiconductor8561"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Valerann: {
    ws: ["https://valerann.com"],
    li: ["https://www.linkedin.com/company/valerann"],
    tw: ["https://x.com/valerann_ltd"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Vanilla Vida": {
    ws: ["https://vanillavida.com"],
    li: ["https://www.linkedin.com/company/vanilla-technologies"],
    ig: ["https://www.instagram.com/vanilla_vida"],
    urls: [
      "http://etyhadar.com",
      "http://www.filin.co.il",
      "https://0304.co.il",
      "https://vanillavida.com",
      "https://vanillavida.wpengine.com/privacy-policy"
    ],
    _meta: { isHomepage: true, isVerified: true }
  },
  Vayu: {
    ws: ["https://app.withvayu.com", "https://guide.withvayu.com", "https://www.withvayu.com"],
    li: ["https://www.linkedin.com/company/withvayu"],
    ytp: ["https://www.youtube.com/@withvayu"],
    urls: ["https://app.goweft.com/login"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Vectorious Medical Technologies": {
    ws: ["https://www.vectoriousmedtech.com"],
    li: ["https://www.linkedin.com/company/vectorious-medical-technologies"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Vee: {
    ws: ["https://team.vee.com", "https://www.vee.com"],
    li: ["https://www.linkedin.com/company/veeai"],
    fb: ["https://www.facebook.com/veeapps"],
    ig: ["https://www.instagram.com/vee.aiforgood"],
    ytp: ["https://www.youtube.com/@vee.channel"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Velox: { ws: ["https://velox-digital.com"], _meta: { isHomepage: true, isVerified: true } },
  Vendict: {
    ws: ["https://myapp.vendict.com", "https://trust.vendict.com", "https://vendict.com"],
    li: ["https://www.linkedin.com/company/vendict"],
    tw: ["https://x.com/vendict_ai"],
    ytp: ["https://www.youtube.com/@vendict7363"],
    urls: ["https://trust.vendict.com"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Vensica Medical": {
    ws: ["https://vensica.com"],
    li: ["https://www.linkedin.com/company/5350087"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Veriti: {
    ws: ["https://www.veriti.ai"],
    li: ["https://www.linkedin.com/company/veriti-security"],
    tw: ["https://twitter.com/VERITISECURITY"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Vessi Medical": {
    ws: ["https://www.vessimed.com"],
    li: ["https://www.linkedin.com/company/vessi-medical"],
    urls: ["https://www.vessimed.com", "https://www.vessimed.com/privacy-policy"],
    _meta: { isHomepage: true }
  },
  "ViAqua Therapeutics": { ws: ["https://www.viaqua-t.com"], _meta: { isHomepage: true, isVerified: true } },
  Videocites: {
    ws: ["https://www.rippleanalytics.com"],
    li: ["https://www.linkedin.com/company/rippleanalytics"],
    _meta: { isHomepage: true, isVerified: true }
  },
  VineSight: {
    ws: ["https://blog.vinesight.com", "https://www.vinesight.com"],
    urls: ["https://vinesight-20319268.hs-sites.com/webinar-the-blindspot-threat"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "VisIC Technologies": {
    ws: ["https://visic-tech.com"],
    li: ["https://www.linkedin.com/company/5443001"],
    ytc: "https://www.youtube.com/channel/UC71qwn_0vTZHbyrN-7N_5Ig",
    ytp: ["https://www.youtube.com/@visictechnologies1097"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Visionary.ai": {
    ws: ["https://visionary.ai"],
    li: ["https://www.linkedin.com/company/visionary-ai"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Visual Layer": {
    ws: ["https://app.visual-layer.com", "https://docs.visual-layer.com", "https://www.visual-layer.com"],
    li: ["https://www.linkedin.com/company/visual-layer"],
    gh: ["https://github.com/visual-layer"],
    ytp: ["https://www.youtube.com/@visual-layer"],
    urls: ["https://discord.com/invite/tkYHJCA7mb"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Voiceitt: {
    ws: ["https://voiceitt.com", "https://web.voiceitt.com"],
    li: ["https://www.linkedin.com/company/viking-maccabee-ventures", "https://www.linkedin.com/company/voiceitt"],
    fb: ["https://www.facebook.com/alex.lytwyn.79", "https://www.facebook.com/voiceitt"],
    ig: ["https://www.instagram.com/voiceitt"],
    tt: ["https://www.tiktok.com/@voiceitt"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Voxia: {
    ws: ["https://www.voxia.ai"],
    li: ["https://www.linkedin.com/company/37429937"],
    fb: ["https://www.facebook.com/voxiaai"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Voyantis: {
    ws: ["https://www.voyantis.ai"],
    li: ["https://www.linkedin.com/company/66924899"],
    fb: ["https://www.facebook.com/voyantis"],
    tw: ["https://twitter.com/Voyantis1"],
    ytp: ["https://www.youtube.com/@Voyantis-ai"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "WSC Sports": {
    ws: ["https://wsc-sports.com"],
    li: ["https://il.linkedin.com/company/wsc-sports-technologies"],
    fb: ["https://www.facebook.com/WSC.SportsTechnologies"],
    tw: ["https://twitter.com/WSC_Sports"],
    ig: ["https://www.instagram.com/wsc_sports"],
    ytp: ["https://www.youtube.com/@wsc-sports"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Wasteless: {
    ws: ["https://www.wasteless.com"],
    li: ["https://www.linkedin.com/company/wasteless-ltd"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Watchful Technologies": {
    ws: ["https://app.watchful.ai", "https://watchful.ai"],
    urls: ["https://app.watchful.ai/login"],
    _meta: { isHomepage: true, isVerified: true }
  },
  WaveBL: {
    ws: ["https://coa.wavebl.com", "https://register.wavebl.com", "https://wavebl.com", "https://wsupport.wavebl.com"],
    li: ["https://www.linkedin.com/company/wavebl"],
    tw: ["https://x.com/wavebl"],
    ytp: ["https://www.youtube.com/@wavebl7286"],
    _meta: { isHomepage: true, isVerified: true }
  },
  WeSki: {
    ws: ["https://careers.weski.com", "https://terms.weski.com", "https://www.weski.com"],
    fb: ["https://www.facebook.com/weskiofficialpage"],
    ig: ["https://www.instagram.com/weski_travel"],
    urls: ["https://uk.trustpilot.com/review/weski.com", "https://www.trustpilot.com/review/www.weski.com"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Wearable Devices": {
    ws: ["https://www.wearabledevices.co.il"],
    li: ["https://www.linkedin.com/company/wearable-devices-ltd"],
    ytp: ["https://www.youtube.com/@mudraband"],
    urls: ["https://www.google.com/maps/search/Hatnufa+5+,+Yokneam+Illit,+Israel"],
    _meta: { isHomepage: true, isVerified: true }
  },
  WeedOut: { ws: ["https://www.weedout-ibs.com"], _meta: { isHomepage: true } },
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
    _meta: { isHomepage: true, isVerified: true }
  },
  "Wi Charge": {
    ws: ["https://www.wi-charge.com"],
    fb: ["https://www.facebook.com/wicharge"],
    tw: ["https://x.com/wichargeltd"],
    ig: ["https://www.instagram.com/wi_charge"],
    ytp: ["https://www.youtube.com/@wi-charge1364"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  Wilco: {
    ws: ["https://help.trywilco.com", "https://www.trywilco.com"],
    li: ["https://www.linkedin.com/company/trywilco"],
    fb: ["https://www.facebook.com/trywilco"],
    tw: ["https://x.com/trywilco"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Wiliot: {
    ws: ["https://www.wiliot.com"],
    li: ["https://www.linkedin.com/company/wiliot"],
    fb: ["https://www.facebook.com/WiliotHQ"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Windward: {
    ws: ["https://developer.windward.ai", "https://windward.ai"],
    li: ["https://www.linkedin.com/company/windward-ltd-"],
    fb: ["https://www.facebook.com/WindwardMaritimeAI"],
    tw: ["https://x.com/WindwardAI"],
    ytc: ["https://www.youtube.com/channel/UCRiZ6MI5mP_oLWwnnblB1KA/videos"],
    ytp: ["https://www.youtube.com/@windwardmaritimeai"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Wing Security": {
    ws: ["https://mc.wing.security", "https://wing.security"],
    li: ["https://www.linkedin.com/company/wing-security"],
    tw: ["https://twitter.com/WingSecSaaS"],
    ytc: ["https://www.youtube.com/channel/UCxms9MOlzm3FkYv2NvE_aBw"],
    ytp: "https://www.youtube.com/@WingSecurity",
    _meta: { isHomepage: true, isVerified: true }
  },
  Winn: {
    ws: ["https://app.winn.ai", "https://trust.winn.ai", "https://winn.ai"],
    li: ["https://www.linkedin.com/company/winnai"],
    tw: ["https://x.com/winn_sales"],
    ig: ["https://www.instagram.com/life.at.winn.ai"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  Wisor: {
    ws: ["https://app.wisor.ai", "https://wisor.ai"],
    li: ["https://www.linkedin.com/company/wisorai"],
    ytp: ["https://www.youtube.com/@wisor-ai"],
    urls: ["https://lp.getwisor.com/wisor-and-cargo-ai-webinar"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isVerified: true, isBrowserVerified: true }
  },
  Wonderful: {
    ws: ["https://www.wonderful.ai"],
    li: ["https://www.linkedin.com/company/wonderfulcx"],
    tw: ["https://x.com/wonderful_ai"],
    urls: ["https://trust.wonderful.ai"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "X-trodes": {
    ws: ["https://xtrodes.com"],
    li: ["https://www.linkedin.com/company/53434548"],
    tw: ["https://x.com/xtrodes"],
    ytp: ["https://www.youtube.com/@xtrodes"],
    urls: [
      "https://23511906.hs-sites.com/knowledge-base",
      "https://organization.app.xtrodes.biot-med.com/auth/login/main",
      "https://xtrodes.applytojob.com/apply"
    ],
    _meta: { isHomepage: true, isVerified: true }
  },
  XJet: {
    ws: ["https://xjet3d.com"],
    li: ["https://www.linkedin.com/company/xjet"],
    fb: ["https://www.facebook.com/yamrefaelconstruction"],
    tw: ["https://x.com/xjet_3d"],
    ig: ["https://www.instagram.com/yamrefael1"],
    ytp: ["https://www.youtube.com/@xjetnpj"],
    _meta: { isHomepage: true, isVerified: true }
  },
  XTEND: {
    ws: ["https://ir.xtend.me", "https://support.xtend.me", "https://www.xtend.me"],
    urls: ["http://ir.xtend.me", "https://support.xtend.me/wp-login.php"],
    _meta: { isHomepage: true }
  },
  "Xpand (formerly 1MRobotics)": {
    ws: ["https://xpand.us"],
    li: ["https://www.linkedin.com/company/xpand-today"],
    tw: ["https://x.com/xpand_today"],
    ytp: ["https://www.youtube.com/@xpand-today"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "Xsight Labs": {
    ws: ["https://xsightlabs.com"],
    li: ["https://www.linkedin.com/company/xsightlabs"],
    tw: ["https://x.com/XsightLabs"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Xyte: {
    ws: ["https://www.xyte.ai"],
    li: ["https://www.linkedin.com/company/xyte"],
    fb: ["https://www.facebook.com/xyte.io"],
    ig: ["https://www.instagram.com/xyte.io"],
    ytp: ["https://www.youtube.com/@xytexaas"],
    urls: ["https://dev.xyte.io", "https://meetings.hubspot.com/xyte/website-demo-ash", "https://updates.xyte.io"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "ZOOZ Power": {
    ws: ["https://ir.zoozpower.com", "https://treasury.zoozpower.com", "https://www.zoozpower.com"],
    li: ["https://www.linkedin.com/company/zooz-power"],
    tw: ["https://x.com/share", "https://x.com/zoozpowerglobal"],
    ytc: "https://www.youtube.com/channel/UCPR6CjT8g71582VynhctehA",
    ytp: ["https://www.youtube.com/@zoozpower"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  Zenity: {
    li: ["https://www.linkedin.com/company/zenitysec"],
    tw: ["https://x.com/zenitysec"],
    gh: ["https://github.com/zenitysec"],
    ytp: ["https://www.youtube.com/@ZenitySecurity"],
    urls: ["https://github.com/zenitysec/sphinx-rego"],
    _meta: { isVerified: true, isBrowserVerified: true }
  },
  "Zero Networks": {
    ws: ["https://zeronetworks.com"],
    li: ["https://www.linkedin.com/company/zeronetworks"],
    fb: ["https://www.facebook.com/ZeroNetworksSec"],
    tw: ["https://x.com/zeronetworks"],
    ytp: ["https://www.youtube.com/@zeronetworks4848"],
    urls: ["https://minus273celsius.slack.com", "https://partners.zeronetworks.com"],
    _meta: { isHomepage: true, isVerified: true }
  },
  Zoog: {
    ws: ["https://app.getzoog.com", "https://getzoog.com", "https://story.getzoog.com"],
    li: ["https://www.linkedin.com/company/zoog-ai"],
    fb: ["https://www.facebook.com/zooghq"],
    tw: ["https://x.com/zooghq"],
    ig: ["https://www.instagram.com/zooghq"],
    ytp: ["https://www.youtube.com/@zooghq"],
    urls: [
      "https://apps.apple.com/il/app/zoog-personalized-video-books/id1534413894",
      "https://getzoog.onelink.me/Z2JW/x29hx49b"
    ],
    _meta: { isHomepage: true, isVerified: true }
  },
  Zsquare: {
    ws: ["https://www.zsquaremedical.com"],
    li: ["https://www.linkedin.com/company/zsquare"],
    tw: ["https://x.com/zsquare_medical"],
    urls: [
      "http://www.pearlcom.co.il",
      "https://www.zsquaremedical.com/privacy-policy",
      "https://www.zsquaremedical.com/terms-of-use"
    ],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  aiOla: {
    ws: ["https://aiola.ai", "https://trust.aiola.ai"],
    li: ["https://www.linkedin.com/company/aiola"],
    tw: ["https://x.com/_aiOla"],
    ytp: ["https://www.youtube.com/@aiOla_"],
    urls: ["https://bit.ly/492GAV7", "https://bit.ly/49fHvjP", "https://bit.ly/4beHmj3", "https://bit.ly/4seWBP7"],
    _meta: { isHomepage: true, isVerified: true }
  },
  bananaz: {
    ws: ["https://go.bananaz.ai", "https://pages.bananaz.ai", "https://www.bananaz.ai"],
    li: ["https://www.linkedin.com/company/bananaz-ai"],
    ytp: ["https://www.youtube.com/@bananaz-ai"],
    urls: ["https://www.aicpa-cima.com/resources/download/soc-for-service-organizations-engagements-overview"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "dWallet Labs": {
    ws: ["https://dwalletlabs.com"],
    li: ["https://www.linkedin.com/company/dwalletlabs"],
    fb: ["https://www.facebook.com/dwalletlabs"],
    tw: ["https://x.com/d3h3d_", "https://x.com/dwalletlabs", "https://x.com/omersadika", "https://x.com/ycscaly"],
    urls: ["https://dwallet.io", "https://dwallet.network"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  deepdub: {
    ws: ["https://app.deepdub.ai", "https://deepdub.ai"],
    li: ["https://www.linkedin.com/company/deepdub-ai"],
    fb: ["https://facebook.com/deepdub.ai.company"],
    tw: ["https://twitter.com/deepdub_ai"],
    ytc: ["https://www.youtube.com/channel/UC4yRa2dcdz7I2l2eag_DefQ"],
    ytp: ["https://www.youtube.com/@deepdub_ai"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isVerified: true, isBrowserVerified: true }
  },
  fintastic: {
    ws: ["https://fintastic.ai"],
    li: ["https://www.linkedin.com/company/fintastic-ai"],
    urls: ["https://fintastic.freshteam.com/jobs"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  "i-BrainTech": {
    ws: ["https://play.i-brain.tech", "https://www.i-brain.tech"],
    li: ["https://www.linkedin.com/company/i-braintech"],
    fb: ["https://www.facebook.com/ibraintechofficial"],
    ig: ["https://www.instagram.com/ibraintech"],
    ytp: ["https://www.youtube.com/@i-braintech6306"],
    _meta: { isHomepage: true, isVerified: true }
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
    _meta: { isHomepage: true, isVerified: true }
  },
  infiniDome: {
    ws: ["https://infinidome.com"],
    li: ["https://www.linkedin.com/company/gps-dome-ltd"],
    ytc: ["https://www.youtube.com/channel/UCzEL6tkHGC-HqtfQitkgDew"],
    ytp: ["https://www.youtube.com/@infinidomeltd"],
    _meta: { isHomepage: true, isVerified: true }
  },
  insoundz: {
    ws: ["https://insoundz.com"],
    li: ["https://www.linkedin.com/company/insoundz"],
    tw: ["https://x.com/insoundz"],
    urls: ["https://human-creative.co"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "lunar.dev": {
    ws: ["https://app.lunar.dev", "https://docs.lunar.dev", "https://www.lunar.dev"],
    li: ["https://www.linkedin.com/company/lunar-api"],
    tw: ["https://x.com/lunardevapi"],
    gh: ["https://github.com/thelunarcompany"],
    ytp: ["https://www.youtube.com/@lunardev-api"],
    ytc: ["https://www.youtube.com/channel/ucgwge-0djzcm-jwu82fbr7a"],
    urls: ["https://discord.com/invite/Kgqu4XQprN", "https://discord.gg/Kgqu4XQprN", "https://docs.lunar.dev"],
    _meta: { isHomepage: true, isVerified: true }
  },
  mPrest: {
    ws: ["https://mprest.com"],
    li: ["https://www.linkedin.com/company/mprest"],
    fb: ["https://www.facebook.com/mprest-systems-658160444214300"],
    urls: ["http://www.titan.co.il", "https://mprest-defense.com", "https://mprest-defense.com/solutions"],
    _meta: { isHomepage: true }
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
    _meta: { isVerified: true, isBrowserVerified: true }
  },
  myInterview: {
    ws: ["https://blog.radancy.com", "https://www.radancy.com"],
    li: ["https://www.linkedin.com/company/radancy"],
    fb: ["https://www.facebook.com/radancy"],
    ig: ["https://www.instagram.com/radancyco"],
    ytp: "https://www.youtube.com/Radancy",
    urls: ["https://dashboard.myinterview.com/login", "https://support.radancy.net/hc/en-us"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "nSure.ai": {
    ws: ["https://nsure.ai"],
    li: ["https://www.linkedin.com/company/nsureai"],
    tw: ["https://x.com/nsureai"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "nT-Tao Compact Fusion Power": { ws: ["https://www.nt-tao.com"], _meta: { isHomepage: true, isVerified: true } },
  proteanTecs: {
    ws: ["https://customers.proteantecs.com", "https://go.proteantecs.com", "https://www.proteantecs.com"],
    li: ["https://www.linkedin.com/company/proteantecs"],
    fb: ["https://www.facebook.com/proteanTecs"],
    tw: ["https://twitter.com/ProteanTecs"],
    ig: ["https://www.instagram.com/proteantecs"],
    ytc: ["https://www.youtube.com/channel/UCy-iC3bfYrosKyJDH1SFqlg"],
    ytp: ["https://www.youtube.com/@proteantecs"],
    _meta: { isHomepage: true, isVerified: true }
  },
  "superwise.ai": {
    ws: [
      "https://app.superwise.ai",
      "https://authentication.superwise.ai",
      "https://docs.superwise.ai",
      "https://sdk.docs.superwise.ai",
      "https://superwise.ai"
    ],
    li: ["https://www.linkedin.com/company/superwiseai"],
    tw: ["https://x.com/superwiseai"],
    gh: ["https://github.com/superwise-ai"],
    ytp: ["https://www.youtube.com/@superwiseai"],
    urls: ["https://discord.com/invite/678qcsA57y", "https://docs.superwise.ai", "https://sdk.docs.superwise.ai"],
    _meta: { isHomepage: true, isVerified: true }
  },
  viisights: {
    ws: ["https://www.viisights.com"],
    li: ["https://www.linkedin.com/company/viisights"],
    fb: ["https://www.facebook.com/viisights"],
    tw: ["https://x.com/@viisights"],
    _meta: { isHomepage: true }
  },
  weSure: {
    ws: ["https://b2c.we-sure.co.il", "https://we-sure.co.il"],
    fb: [
      "https://www.facebook.com/wesure-insurance-%d7%95%d7%95%d7%99%d7%a9%d7%95%d7%a8-%d7%97%d7%91%d7%a8%d7%94-%d7%9c%d7%91%d7%99%d7%98%d7%95%d7%97-232508544298955"
    ],
    tw: ["https://x.com/wesure2"],
    ig: ["https://www.instagram.com/wesure.il"],
    urls: ["https://api.whatsapp.com/send", "https://wesuregroup.com", "https://www.profilesoft.com"],
    _meta: { isHomepage: true, isVerified: true }
  }
}
