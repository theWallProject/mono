/**
 * Android app discoveries from assetlinks.json probing.
 *
 * This file is the source of truth for machine-discovered Android package IDs.
 * It is consumed by merge_static.ts during aggregation (pnpm build:scrapper / pnpm apply-overrides).
 * Do NOT edit manualOverrides.ts for android discoveries — add entries here instead.
 *
 * Each entry maps a company to its discovered Android package names,
 * along with the domain probed and discovery metadata.
 */

export type AndroidDiscovery = {
  /** Company name (must match the name in the main database) */
  readonly company: string
  /** Domain that was probed for .well-known/assetlinks.json */
  readonly domain: string
  /** Android package names found in the assetlinks response */
  readonly packages: readonly string[]
  /** Discovery method */
  readonly source: "assetlinks" | "playstore" | "homepage"
  /** ISO date when the discovery was made */
  readonly discoveredAt: string
}

export const androidDiscoveries: readonly AndroidDiscovery[] = [
  {
    company: "24me",
    domain: "twentyfour.me",
    packages: ["app.groupcal.www", "app.groupcal.www2"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "2BI",
    domain: "2bi.me",
    packages: ["me.co.mpm.cosmetics", "me.dvabi.digitalnikiosk", "me.dvabi.digitalnikiosk.alpha"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "365Scores",
    domain: "365scores.com",
    packages: ["com.scores365"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  { company: "Agrio", domain: "agrio.app", packages: ["com.agrio"], source: "assetlinks", discoveredAt: "2026-02-28" },
  {
    company: "Air Doctor",
    domain: "air-dr.com",
    packages: ["com.gaiamobile.airdoctor"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Airbnb",
    domain: "airbnb.com",
    packages: ["com.airbnb.android", "com.airbnb.android.development", "com.airbnb.android.myflavor.development"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Akool",
    domain: "akool.com",
    packages: ["com.akool.xavatar"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Albert",
    domain: "albert.com",
    packages: ["com.meetalbert"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Amazon",
    domain: "amazon.com",
    packages: [
      "in.amazon.mShop.android.shopping",
      "cn.amazon.mShop.android",
      "com.amazon.mShop.android.business.shopping",
      "in.amazon.mShop.android.business.shopping",
      "com.amazon.mp3",
      "com.amazon.kindle",
      "com.amazon.kindlefs",
      "com.amazon.clouddrive.photos",
      "com.audible.application",
      "com.amazon.map.sample.one",
      "com.wholefoods.wholefoodsmarket",
      "com.eero.android",
      "com.eero.android.dogfood",
      "com.amazon.dee.app",
      "com.amazon.sellermobile.android"
    ],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Amazon Web Services",
    domain: "amazon.com",
    packages: [
      "in.amazon.mShop.android.shopping",
      "cn.amazon.mShop.android",
      "com.amazon.mShop.android.business.shopping",
      "in.amazon.mShop.android.business.shopping",
      "com.amazon.mp3",
      "com.amazon.kindle",
      "com.amazon.kindlefs",
      "com.amazon.clouddrive.photos",
      "com.audible.application",
      "com.amazon.map.sample.one",
      "com.wholefoods.wholefoodsmarket",
      "com.eero.android",
      "com.eero.android.dogfood",
      "com.amazon.dee.app",
      "com.amazon.sellermobile.android"
    ],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Animoove",
    domain: "animoove.com",
    packages: ["com.animoove.player", "dev.animoove.player"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Anonybit",
    domain: "anonybit.io",
    packages: ["io.anonybit.demo"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  { company: "Any.do", domain: "any.do", packages: ["com.anydo"], source: "assetlinks", discoveredAt: "2026-02-28" },
  {
    company: "AppCard",
    domain: "appcard.com",
    packages: [
      "com.appcard.appcard",
      "com.appcard.app",
      "com.foodtown",
      "com.islandpacificmarket.islandpacificbonus",
      "com.pruettsmarket.pruettsmarket",
      "com.jjfoods.jjfoods",
      "com.freshcountymarket.fcmrewards",
      "com.bendfood4less.shop",
      "com.marketofchoice.marketofchoice",
      "com.foodarama",
      "com.brucesfoodland",
      "com.niemanns.maxplus",
      "com.mercatustechnologies.pigglywiggly",
      "com.waltchurchillmarket.googleplay",
      "com.ballsfoods.henhouse",
      "com.freshtakegrocerycorporation.freshpointsrewards",
      "com.foodfair.foodfairmarket.googleplay"
    ],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "AppsVillage",
    domain: "appv.co",
    packages: ["com.appsvillage.adrabbit"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Artishok",
    domain: "artishok.io",
    packages: ["io.artishok.hub"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "ASCAP",
    domain: "ascap.com",
    packages: ["com.ascap.app", "com.ascap.app.develop", "com.ascap.app.qa", "com.ascap.app.uat"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "AsiaYo",
    domain: "asiayo.com",
    packages: ["com.asiayo.app"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Assac Networks",
    domain: "assacnetworks.com",
    packages: ["com.assacnetworks.shieldit"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Associated Press",
    domain: "apnews.com",
    packages: ["mnn.Android"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Atletico Madrid",
    domain: "atleticodemadrid.com",
    packages: ["com.mcentric.mcclient.MyAtleticoMadrid"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Autority.io",
    domain: "autority.io",
    packages: ["io.autority.client"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Baladi Supermarket",
    domain: "baladisupermarket.com",
    packages: ["com.selfpoint.baladi"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Bazaart",
    domain: "bazaart.me",
    packages: ["me.bazaart.app"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "BBC",
    domain: "bbc.co.uk",
    packages: [
      "bbc.iplayer.android",
      "uk.co.bbc.androiduniversallinks",
      "uk.co.bbc.authtoolkit",
      "uk.co.bbc.authtoolkit.sandbox",
      "uk.co.bbc.integrationapp",
      "uk.co.bbc.onetapapp",
      "uk.co.bbc.cbbcbuzz",
      "uk.co.bbc.bitesize",
      "com.bbc.sounds",
      "com.bbc.sounds.buildly",
      "com.bbc.sounds.rmsTest",
      "com.bbc.sounds.spikelee",
      "bbc.news.mobile.cymru",
      "bbc.mobile.news.uk",
      "uk.co.bbc.mundo",
      "uk.co.bbc.russian",
      "uk.co.bbc.hindi",
      "uk.co.bbc.arabic",
      "uk.co.bbc.ww",
      "bbc.mobile.weather",
      "uk.co.bbc.android.sportdomestic",
      "bbc.mobile.sport.ww",
      "com.bbc.bbcx.test",
      "uk.co.bbc.android.mytopics",
      "uk.co.bbc.pam.sampleapp",
      "bbc.mobile.news.ww",
      "uk.co.bbc.cbeebiesstorytime",
      "uk.co.bbc.cbeebiesgetcreative",
      "uk.co.bbc.cbeebiesgoexplore",
      "uk.co.bbc.cbeebiesplaytimeisland",
      "air.uk.co.bbc.cbeebiesstorytime",
      "air.com.cc.uk.co.bbc.cbeebiesstorytime",
      "uk.co.bbc.cbeebiesgetcreative.freetime",
      "uk.co.bbc.cbeebiesplaytimeisland.freetime",
      "uk.co.bbc.cbeebiesgoexplore.freetime"
    ],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "BeeDeals",
    domain: "bee.deals",
    packages: ["deals.bee.il.twa"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Better Chains, Inc.",
    domain: "betterchains.com",
    packages: ["com.betterchains.management"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Better Together",
    domain: "bettertogether-app.com",
    packages: ["com.bettertogether.us"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Bidspirit",
    domain: "bidspirit.com",
    packages: ["com.bidspirit.prod"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Bikeable",
    domain: "wix.com",
    packages: ["com.wix.admin"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Binah.ai",
    domain: "binah.ai",
    packages: ["com.binah.saas"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Bizzabo",
    domain: "bizzabo.com",
    packages: ["com.bizzabo.client"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Blinq",
    domain: "blinq.me",
    packages: ["com.rabbl.blinq"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Bookaway.com",
    domain: "bookaway.com",
    packages: ["com.bookaway.users"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Booking",
    domain: "booking.com",
    packages: ["com.booking"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Bookmate",
    domain: "bookmate.com",
    packages: ["com.bookmate", "com.bookmate.qa"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Boomerang",
    domain: "wix.com",
    packages: ["com.wix.admin"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "BrainQ",
    domain: "brainqtech.com",
    packages: ["com.brainq.treatmentmanager", "com.brainq.treatmentmanager.market", "com.brainq.treatmentmanager.demo"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "BUFF",
    domain: "buff.game",
    packages: ["com.buff.game.appmobile", "com.buff.game.play", "com.buff.play"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Bujeti",
    domain: "bujeti.com",
    packages: ["com.anonymous.bujeti"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "CallApp",
    domain: "callapp.com",
    packages: ["com.callapp.contacts"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Carlock",
    domain: "carlock.co",
    packages: ["com.carlock.protectus"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Castore",
    domain: "castore.com",
    packages: ["co.tapcart.app.id_qoKASLxXIa"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Cazoo",
    domain: "cazoo.co.uk",
    packages: ["com.motors.consumer", "com.motors.consumer.qa", "com.motors.consumer.development"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "CB4",
    domain: "cb4.com",
    packages: ["com.cb4.mobile.cretail"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Centrical Software",
    domain: "centricalsoft.com",
    packages: ["com.celray", "com.tumblr"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "ChatGPT",
    domain: "chatgpt.com",
    packages: ["com.openai.chatgpt", "com.openai.sora"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Checker Software",
    domain: "checker-soft.com",
    packages: ["com.mor.sa.android.activities"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Cheetah",
    domain: "gocheetah.com",
    packages: ["com.restaurantcheetah.cheetah_app"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "ChillBox",
    domain: "wix.com",
    packages: ["com.wix.admin"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "ClassPass",
    domain: "classpass.com",
    packages: ["com.classpass.classpass"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Claude",
    domain: "claude.ai",
    packages: ["com.anthropic.claude"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "CleverGames",
    domain: "clevergames.org",
    packages: ["com.clever.wordsbattle"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "CNN",
    domain: "cnn.com",
    packages: ["com.cnn.mobile.android.phone"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Codecademy",
    domain: "codecademy.com",
    packages: ["com.codecademy.pwa"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Colnect",
    domain: "colnect.com",
    packages: ["com.colnect.webv"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Cowrywise",
    domain: "cowrywise.com",
    packages: ["com.cowrywise.android"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Creature Comforts",
    domain: "creaturecomforts.co.uk",
    packages: ["uk.co.creaturecomforts", "uk.co.creaturecomforts.preprod"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Curve",
    domain: "curve.com",
    packages: ["com.imaginecurve.curve.prd"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Dalet",
    domain: "dalet.com",
    packages: ["com.dalet.flex", "com.dalet.pyramid"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Deliveroo",
    domain: "deliveroo.co.uk",
    packages: ["com.deliveroo.orderapp", "com.deliveroo.orderapp.prod"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Digitally Imported",
    domain: "di.fm",
    packages: ["com.audioaddict.di"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Disney+",
    domain: "disneyplus.com",
    packages: ["com.disney.disneyplus"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "DocDoc",
    domain: "docdoc.ru",
    packages: ["com.docdoc.docdoc"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "DoCloud",
    domain: "wix.com",
    packages: ["com.wix.admin"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "DragonX",
    domain: "dragonx.cloud",
    packages: ["cloud.dragonx.pilot"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Dramaton",
    domain: "dramaton.com",
    packages: ["com.dramaton.squisher", "com.dramaton.slime"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Dride, Inc.",
    domain: "dride.io",
    packages: ["io.dride.ddpai", "io.dride.fleet", "io.dride.yi", "io.dride"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Drupe Mobile",
    domain: "getdrupe.com",
    packages: ["mobi.drupe.app"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Duve",
    domain: "duve.com",
    packages: ["com.wb.guestapp"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "DW",
    domain: "dw.com",
    packages: ["com.idmedia.android.newsportal"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Ecologi",
    domain: "ecologi.com",
    packages: ["com.ecologi.x.twa"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Efobus",
    domain: "efobus.com",
    packages: ["il.co.mitug.WhereBus", "com.efobus.efobus30", "com.horim.horimBegova1"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Embr Labs",
    domain: "embrlabs.com",
    packages: ["co.tapcart.app.id_KBcPjid98f"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Empathy",
    domain: "empathy.com",
    packages: ["com.empathy.companion"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "enabley",
    domain: "enabley.io",
    packages: [
      "io.enabley",
      "io.enabley.challenge",
      "io.enabley.clientco",
      "io.enabley.campofirme",
      "io.enabley.universidade",
      "io.enabley.azrieligroup",
      "io.enabley.granado",
      "io.enabley.evoy",
      "io.enabley.mekorot",
      "io.enabley.technit",
      "io.enabley.allgoods",
      "io.enabley.livinggoods",
      "io.enabley.vmeduca",
      "io.enabley.asas",
      "io.enabley.cejam",
      "io.enabley.combio",
      "io.enabley.unionengineers_Android",
      "io.enabley.oralunic",
      "io.enabley.cocamar",
      "io.enabley.vtal",
      "io.enabley.tikshoov",
      "io.enabley.fb.bohn",
      "io.enabley.constellation",
      "io.enabley.circle",
      "io.enabley.calanit",
      "io.enabley.aster_experdite",
      "io.enabley.focus",
      "io.enabley.vivo",
      "io.enabley.aster",
      "com.timetoknow.echo.setsystem",
      "com.socasesores.campusvirtual",
      "br.com.atualizatreinamento",
      "io.enabley.unicase"
    ],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Engageli",
    domain: "engageli.com",
    packages: ["com.engageli.students"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "eToro",
    domain: "etoro.com",
    packages: ["com.etoro.openbook"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Evinced",
    domain: "evinced.com",
    packages: ["com.evinced.scan"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Expedia",
    domain: "expedia.com",
    packages: ["com.expedia.bookings", "com.expedia.bookings.next", "com.expedia.bookings.develop"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "ExpressVPN",
    domain: "expressvpn.com",
    packages: ["com.expressvpn.vpn"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "FamilyKeeper",
    domain: "familykeeper.co",
    packages: ["co.familykeeper.parents", "co.familykeeper.kids"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Faye",
    domain: "withfaye.com",
    packages: ["com.withfaye.app.stg", "com.withfaye.app"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "FeelThere",
    domain: "feelthere.live",
    packages: ["com.feelthere"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "FENIX",
    domain: "fenix.life",
    packages: ["life.fenix.sharing.app", "com.letspalm", "com.arnab", "life.fenix.service.app"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Fiix Applications",
    domain: "jfiix.com",
    packages: ["com.fiixapp"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Finom",
    domain: "finom.co",
    packages: ["tech.pnlfin.finom"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Fiverr",
    domain: "fiverr.com",
    packages: ["com.fiverr.fiverr"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Flycatcher Toys",
    domain: "flycatcher.toys",
    packages: ["com.flycatcher.smartsketcher"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Foodonet",
    domain: "wix.com",
    packages: ["com.wix.admin"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Fooducate",
    domain: "fooducate.com",
    packages: ["com.fooducate.nutritionapp"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Fordefi",
    domain: "fordefi.com",
    packages: ["io.arnac"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Fox News",
    domain: "foxnews.com",
    packages: ["com.foxnews.android"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "FreshBus",
    domain: "freshbus.com",
    packages: ["com.freshbus.app"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Fundbox",
    domain: "fundbox.com",
    packages: ["com.fundbox.mobile"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "FX Leaders",
    domain: "fxleaders.com",
    packages: ["org.brokers.userinterface"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "FXEmpire",
    domain: "fxempire.com",
    packages: ["org.fxempire.app.FXEmpire.production"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "G-Med",
    domain: "g-med.com",
    packages: ["com.gmed.prog"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "GameTree",
    domain: "gametree.me",
    packages: ["com.gametreeapp"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Gartner",
    domain: "gartner.com",
    packages: ["com.gartner.mygartner", "qa.pulse.app"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "GayOut",
    domain: "gayout.com",
    packages: ["com.gayout.www.twa"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Get in LTD",
    domain: "get-in.com",
    packages: ["xyz.getin.wallet.fans"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  { company: "Getir", domain: "getir.com", packages: ["com.getir"], source: "assetlinks", discoveredAt: "2026-02-28" },
  {
    company: "Glovo",
    domain: "glovoapp.com",
    packages: ["com.glovo"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  { company: "Grok", domain: "grok.com", packages: ["ai.x.grok"], source: "assetlinks", discoveredAt: "2026-02-28" },
  {
    company: "Grover",
    domain: "grover.com",
    packages: ["com.groverapp"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "GuruShots",
    domain: "gurushots.com",
    packages: ["com.gurushots.app"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Haaretz",
    domain: "haaretz.com",
    packages: ["com.opentech.haaretz"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "HAAT Delivery",
    domain: "haat.delivery",
    packages: ["com.haat.client"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Hapoel Petah Tikva",
    domain: "hapoelpt.com",
    packages: ["com.hapoelpt.app"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Hidabrut organization",
    domain: "hidabroot.org",
    packages: ["net.linnovate.hidabroot"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Hobi",
    domain: "hobiapp.com",
    packages: ["com.hobi.android"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Holidu",
    domain: "holidu.com",
    packages: ["com.holidu.holidu"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Hombi",
    domain: "hombi.co",
    packages: ["com.ionicframework.vaadapp212468"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "HomeConnex",
    domain: "home-connex.com",
    packages: ["app.mobile.home_connex.homeconnexappandroid"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Hometalk",
    domain: "hometalk.com",
    packages: ["com.hometalkmobileapp", "com.hometalkmobileapp.automation"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Honeybook",
    domain: "honeybook.com",
    packages: ["com.honeybook.alfred"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "HungryPanda",
    domain: "hungrypanda.co",
    packages: ["com.hungrypanda.waimai"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "HybRead",
    domain: "wordpress.com",
    packages: [
      "org.wordpress.android",
      "com.jetpack.android",
      "org.wordpress.android.prealpha",
      "com.jetpack.android.prealpha",
      "com.woocommerce.android",
      "com.woocommerce.android.prealpha"
    ],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "ianacare",
    domain: "ianacare.com",
    packages: ["com.ianacare.ianacare"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "ifeel",
    domain: "ifeelonline.com",
    packages: ["com.ifeel.ifeeluserchat", "com.ifeel.ifeeltherapist"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  { company: "ILTV News", domain: "iltv.tv", packages: ["ott.iltv"], source: "assetlinks", discoveredAt: "2026-02-28" },
  {
    company: "Imagine",
    domain: "imagineusa.com",
    packages: ["com.mysalesforce.mycommunity.C00D6A000001V6zaUAC.A0OT3s000000GmaAGAS"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "InsideTracker",
    domain: "insidetracker.com",
    packages: ["segterra.itracker.purple_android"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Intel",
    domain: "intel.com",
    packages: ["com.intel.AppShell.BIL", "com.intel.AppShell.AS10AppLinks", "com.intel.AppShell.BILTEST"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Intellisen",
    domain: "wix.com",
    packages: ["com.wix.admin"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Investing.com",
    domain: "investing.com",
    packages: ["com.fusionmedia.investing"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Jaybee.com",
    domain: "jaybee.com",
    packages: ["com.jaybee.smartbutler"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "JAZZRADIO.com",
    domain: "jazzradio.com",
    packages: ["com.audioaddict.jr"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Joompers",
    domain: "joompers.com",
    packages: ["com.joompers.app"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Justos",
    domain: "justos.com",
    packages: ["br.com.justos.app"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Kama",
    domain: "kama.co",
    packages: ["com.kama.android", "com.kama.android.preprod"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Karma",
    domain: "karmanow.com",
    packages: ["com.shoptagr"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Kasamba",
    domain: "kasamba.com",
    packages: ["com.liveperson.kasamba.android"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Kashable",
    domain: "kashable.com",
    packages: ["com.exp.kashable"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Katkuti",
    domain: "wix.com",
    packages: ["com.wix.admin"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Kidyos",
    domain: "wordpress.com",
    packages: [
      "org.wordpress.android",
      "com.jetpack.android",
      "org.wordpress.android.prealpha",
      "com.jetpack.android.prealpha",
      "com.woocommerce.android",
      "com.woocommerce.android.prealpha"
    ],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "kimkim",
    domain: "kimkim.com",
    packages: ["com.kimkim.app"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Klips",
    domain: "klips.com",
    packages: ["com.klips.trading"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  { company: "Klook", domain: "klook.com", packages: ["com.klook"], source: "assetlinks", discoveredAt: "2026-02-28" },
  {
    company: "KRE8.TV",
    domain: "kre8.tv",
    packages: ["com.piiym.celebrate"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "LEELOO",
    domain: "leelo-ai.com",
    packages: ["com.example.leelo"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "LifeOhrB",
    domain: "wix.com",
    packages: ["com.wix.admin"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Lingopie",
    domain: "lingopie.com",
    packages: ["com.lingopie.android", "com.lingopie.android.stg"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Logic Wiz",
    domain: "logic-wiz.com",
    packages: ["com.uvmlab.usudoku"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Luko",
    domain: "luko.eu",
    packages: ["com.getluko.cover.app"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Lumen",
    domain: "lumen.me",
    packages: ["com.metaflow.lumen"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Matific",
    domain: "matific.com",
    packages: ["com.slatescience.Matific"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "McDonalds",
    domain: "mcdonalds.com",
    packages: ["com.mcdonalds.app"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "medflex",
    domain: "medflex.de",
    packages: ["de.medflex.app.flutter", "de.medflex.app.flutter.integration"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Mesh Payments",
    domain: "meshpayments.com",
    packages: ["com.meshpayments.android"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Metafy",
    domain: "metafy.gg",
    packages: ["app.metafy.gg"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Mixtiles",
    domain: "mixtiles.com",
    packages: ["com.mixtiles.android"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "monday.com",
    domain: "monday.com",
    packages: ["com.dapulse.dapulse", "com.monday.monday"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Moovit",
    domain: "moovit.com",
    packages: ["com.tranzmate", "com.moovit.carpool"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Mottech Water Management",
    domain: "mottech.com",
    packages: ["com.mottech.iccpro"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Movoto",
    domain: "movoto.com",
    packages: ["com.movoto.twa", "com.movoto.movoto"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Musely",
    domain: "musely.com",
    packages: ["com.production.truspertips"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "MY4t",
    domain: "my4t.com",
    packages: ["com.celray", "com.tumblr"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "MyGate",
    domain: "mygate.com",
    packages: ["com.mygate.user", "com.mygate.user.alefcommunity", "com.mygate.user.maia"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "MyHeritage",
    domain: "myheritage.com",
    packages: ["air.com.myheritage.mobile"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Nas.io",
    domain: "nas.io",
    packages: ["com.nas.academy"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "New York Times",
    domain: "nytimes.com",
    packages: [
      "com.nytimes.crossword",
      "com.nytimes.android",
      "com.nytimes.cooking",
      "com.theathletic.developer",
      "com.theathletic",
      "com.nytimes.crisscrosswords",
      "com.nytimes.wordgame"
    ],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Newsrael",
    domain: "newsrael.com",
    packages: ["com.newsrael"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Nexar",
    domain: "getnexar.com",
    packages: ["mobi.nexar.dashcam"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Nift Networks",
    domain: "gonift.com",
    packages: ["com.nift.niftgift"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Niio",
    domain: "niio.com",
    packages: ["com.niioart.app"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "NiYO Solutions",
    domain: "goniyo.com",
    packages: [
      "finance.global.travel.niyo",
      "finance.global.travel.niyodev",
      "com.niyo.global",
      "com.niyo.idfcsavingsaccount",
      "com.niyo.equitassavingsaccount",
      "finance.savings.account.niyoxbankingdev"
    ],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "OfficeGuy",
    domain: "myofficeguy.com",
    packages: ["com.app.sumit"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Online Pianist",
    domain: "onlinepianist.com",
    packages: ["com.onlinepianist.onlinepianist"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "OP.GG",
    domain: "op.gg",
    packages: ["gg.op.lol.android"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Open-Finance.ai",
    domain: "open-finance.ai",
    packages: ["com.safecashapps", "com.cashimerchant"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Optery",
    domain: "optery.com",
    packages: ["com.optery.mobile", "com.corbado.passkeys.pub"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "OrganizEat",
    domain: "organizeat.com",
    packages: ["com.organizeat.android"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Otis AI",
    domain: "meetotis.com",
    packages: ["com.otis"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "OurCrowd",
    domain: "ourcrowd.com",
    packages: ["com.ourcrowd.app"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Outdoorsy",
    domain: "outdoorsy.com",
    packages: ["com.outdoorsy.renter", "com.outdoorsy.owner", "com.outdoorsy.wheelbase"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Ovdimnet",
    domain: "priority-software.com",
    packages: ["com.priority_software.template"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "OwnID",
    domain: "ownid.com",
    packages: ["com.ownid.demo.gigya"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Pagaleve",
    domain: "pagaleve.com.br",
    packages: ["com.pagaleve"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "PapaJohns",
    domain: "papajohns.com",
    packages: ["com.papajohns.android"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Parenthoods",
    domain: "parenthoods.com",
    packages: ["com.wonderschool.parenthoods"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Piggy",
    domain: "piggy.to",
    packages: ["com.piggy.piggyapp"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Planado",
    domain: "planado.ru",
    packages: ["app.planado"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "PlaySight Interactive",
    domain: "playsight.com",
    packages: ["com.playsight.tennis"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Plus500",
    domain: "plus500.com",
    packages: ["com.Plus500"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Popshop Live",
    domain: "popshop.live",
    packages: ["com.popshoplive"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Positive Apps",
    domain: "positive-apps.com",
    packages: ["com.positive_apps.buzz_car.prod"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Postmates",
    domain: "postmates.com",
    packages: [
      "com.ubercab.eats",
      "com.ubercab.eats.exo",
      "com.ubercab.presidio.exo",
      "com.postmates.android",
      "com.postmates.android.exo"
    ],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Priority Software",
    domain: "priority-software.com",
    packages: ["com.priority_software.template"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "ProactiView",
    domain: "proactiview.com",
    packages: ["com.celray", "com.tumblr"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Promo.com",
    domain: "promo.com",
    packages: ["com.promo.mobile"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Pruvo",
    domain: "pruvo.com",
    packages: ["net.pruvo.mobile"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Puls",
    domain: "puls.com",
    packages: ["com.puls.consumers"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "PulseNmore",
    domain: "pulsenmore.com",
    packages: ["com.PulseNMore.MobileApp"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  { company: "Qlik", domain: "qlik.com", packages: ["com.qlik.qsm"], source: "assetlinks", discoveredAt: "2026-02-28" },
  { company: "QLOG", domain: "qlog.co", packages: ["co.qlog.rna"], source: "assetlinks", discoveredAt: "2026-02-28" },
  {
    company: "RadioTunes",
    domain: "radiotunes.com",
    packages: ["com.audioaddict.sky"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Red Sea",
    domain: "redseafish.com",
    packages: ["com.hippotec.redsea"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Rezid.net",
    domain: "rezid.net",
    packages: ["com.arcode.rezidnet"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Riuto",
    domain: "wix.com",
    packages: ["com.wix.admin"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Riverside.fm",
    domain: "riverside.com",
    packages: ["riverside.fm"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Robomow",
    domain: "robomow.com",
    packages: ["com.robomow3.robomow", "com.sbd.app", "com.cubcadet3.app"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Roya Music",
    domain: "wix.com",
    packages: ["com.wix.admin"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Royal Road",
    domain: "royalroad.com",
    packages: ["com.NotYetMedia.RoyalRoad"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  { company: "s16vc", domain: "s16vc.com", packages: ["notion.id"], source: "assetlinks", discoveredAt: "2026-02-28" },
  {
    company: "Sabaza",
    domain: "sabaza.com",
    packages: ["com.sabaza.sabazaapp"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Sage Recipe Box",
    domain: "wix.com",
    packages: ["com.wix.admin"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Sber-Zvuk",
    domain: "zvuk.com",
    packages: ["com.zvooq.openplay"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "SberHealth",
    domain: "sberhealth.ru",
    packages: ["com.docdoc.docdoc"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "SeatGeek",
    domain: "seatgeek.com",
    packages: ["com.seatgeek.android"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Secret Double Octopus",
    domain: "doubleoctopus.com",
    packages: ["com.doubleoctopus.authenticator"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "SEE IDC",
    domain: "wix.com",
    packages: ["com.wix.admin"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Seeking Alpha",
    domain: "seekingalpha.com",
    packages: ["com.seekingalpha.webwrapper"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "ShopClues",
    domain: "shopclues.com",
    packages: ["com.shopclues"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Singit",
    domain: "singit.io",
    packages: ["com.singit"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Sky News",
    domain: "sky.com",
    packages: ["com.bskyb.skyservice"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "SmartThings",
    domain: "smartthings.com",
    packages: ["com.samsung.android.oneconnect"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Sociallix",
    domain: "sociallix.com",
    packages: ["com.sociallix.android"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "SpeakingPal",
    domain: "speakingpal.com",
    packages: ["com.speakingpal.speechtrainer.sp"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Sync.ME",
    domain: "sync.me",
    packages: ["com.syncme.syncmeapp", "me.sync.callerid"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Tap Mobile",
    domain: "tap.pm",
    packages: ["pdf.tap.scanner"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "TechSee",
    domain: "techsee.com",
    packages: [
      "com.techsee.techseeinstantmirroring",
      "com.geappliances.newfi20",
      "com.techsee.visualengagement",
      "me.techsee.app",
      "com.xiaomi.mi_care",
      "com.techsee.sdkintegration"
    ],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Tedooo",
    domain: "tedooo.com",
    packages: ["com.mor.tedooo"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Terminal X",
    domain: "terminalx.com",
    packages: ["com.terminalx"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Text to Speech Reader",
    domain: "ttsreader.com",
    packages: ["com.wellsrc.ttsreader_flutter"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "The Guardian",
    domain: "theguardian.com",
    packages: ["com.guardian", "uk.co.guardian.puzzles"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "The Marathon Group",
    domain: "wix.com",
    packages: ["com.wix.admin"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "TheMarker",
    domain: "themarker.com",
    packages: ["com.themarker"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "TinyTap",
    domain: "tinytap.com",
    packages: ["tinytap.kids.learning.games", "tinycourses.kids.learning.games", "mathlingo.kids.math.games"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "TipRanks",
    domain: "tipranks.com",
    packages: ["com.tipranks.android"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Trailze",
    domain: "trailze.com",
    packages: ["com.trailzeoutdoor.android"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Travel Quest",
    domain: "travelandquest.com",
    packages: ["com.travelandquest.tq"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Travelio",
    domain: "travelio.com",
    packages: ["com.travelio.travelioapp"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "TravelPerk",
    domain: "travelperk.com",
    packages: ["com.travelperk"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Turismocity",
    domain: "turismocity.com.ar",
    packages: ["com.grupodc.turismocity"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Turo",
    domain: "turo.com",
    packages: ["com.relayrides.android.relayrides"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Uglyshuz",
    domain: "uglyshuz.com",
    packages: ["com.appcommerce.uglyshuz"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Uptime.com",
    domain: "uptime.com",
    packages: ["com.apppartner.uptime.uptime"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Veryo Studios",
    domain: "apesrevenge.com",
    packages: ["com.veryo.apestd"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Visuality Systems",
    domain: "visualitynq.com",
    packages: ["com.visuality.filemanager"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "VK",
    domain: "vk.com",
    packages: [
      "com.vkontakte.android",
      "com.vk.im",
      "com.vk.calls",
      "com.vk.clips",
      "com.vk.tv",
      "com.vk.superapp.sample",
      "com.vk.vkvideo",
      "com.vk.love",
      "com.vk.admin",
      "ru.vk.store",
      "ru.vk.store.qa",
      "com.uma.musicvk"
    ],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Wall Street Journal",
    domain: "wsj.com",
    packages: ["wsj.reader_sp", "wsj.reader_t3", "wsj.reader_dev", "wsj.reader_beta"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Washington Post",
    domain: "washingtonpost.com",
    packages: ["com.washingtonpost.android", "com.washingtonpost.rainbow"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Watani Mall",
    domain: "watanimall.com",
    packages: ["com.appcommerce.watanimall"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "WayUp",
    domain: "wayup.com",
    packages: ["com.wayup_rn"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Waze",
    domain: "waze.com",
    packages: ["com.waze", "com.waze.fishfood", "com.waze.dogfood", "com.waze.alpha", "com.waze.prebeta"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "WEbook",
    domain: "webook.com",
    packages: ["com.webook.android"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Wego",
    domain: "wego.co.in",
    packages: ["com.wego.android"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Wild Intelligence",
    domain: "substack.com",
    packages: ["com.substack.app"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Windy App",
    domain: "windy.app",
    packages: ["co.windyapp.android"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Withapp",
    domain: "withapp.io",
    packages: ["life.odawith.app"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  { company: "Wix", domain: "wix.com", packages: ["com.wix.admin"], source: "assetlinks", discoveredAt: "2026-02-28" },
  {
    company: "Wix Japan",
    domain: "wix.com",
    packages: ["com.wix.admin"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Wolt",
    domain: "wolt.com",
    packages: ["com.wolt.android"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Yahalom Software",
    domain: "yahaloms.com",
    packages: ["com.yahaloms.y_survey"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Yandex",
    domain: "yandex.com",
    packages: [
      "com.yandex.yazeka",
      "ru.yandex.searchplugin",
      "ru.yandex.weatherplugin",
      "ru.yandex.yandexmaps",
      "ru.yandex.yandexmaps.pr",
      "ru.yandex.bus.tickets",
      "ru.yandex.metro",
      "com.yandex.yamb",
      "com.yandex.messaging.demo",
      "ru.yandex.yandexnavi",
      "ru.yandex.yandexnavi.pr",
      "com.yandex.browser",
      "com.yandex.browser.broteam",
      "com.yandex.browser.alpha",
      "com.yandex.qmobile",
      "com.yandex.q",
      "com.yandex.searchapp",
      "ru.yandex.auth.client",
      "ru.yandex.key",
      "ru.yandex.taxi",
      "com.yandex.yango",
      "com.yandex.rhythm",
      "ru.yandex.mail",
      "ru.beru.android.qa",
      "ru.beru.android",
      "ru.yandex.music",
      "com.yandex.bank",
      "ru.yandex.disk",
      "ru.kinopoisk",
      "com.yandex.aliceapp",
      "com.yandex.huawei.alice",
      "ru.yandex.taximeter",
      "ru.yandex.cloud",
      "ru.foodfox.client",
      "ru.yandex.telemost",
      "ru.plus.bookmate"
    ],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Yandex Türkiye",
    domain: "yandex.com.tr",
    packages: [
      "com.yandex.yazeka",
      "ru.yandex.searchplugin",
      "ru.yandex.weatherplugin",
      "ru.yandex.yandexmaps",
      "ru.yandex.yandexmaps.pr",
      "ru.yandex.bus.tickets",
      "ru.yandex.metro",
      "com.yandex.yamb",
      "com.yandex.messaging.demo",
      "ru.yandex.yandexnavi",
      "ru.yandex.yandexnavi.pr",
      "com.yandex.browser",
      "com.yandex.browser.broteam",
      "com.yandex.browser.alpha",
      "com.yandex.qmobile",
      "com.yandex.q",
      "com.yandex.searchapp",
      "ru.yandex.auth.client",
      "ru.yandex.key",
      "ru.yandex.taxi",
      "com.yandex.yango",
      "com.yandex.rhythm",
      "ru.yandex.mail",
      "ru.beru.android.qa",
      "ru.beru.android",
      "ru.yandex.music",
      "com.yandex.bank",
      "ru.yandex.disk",
      "ru.kinopoisk",
      "com.yandex.aliceapp",
      "com.yandex.huawei.alice",
      "ru.yandex.taximeter",
      "ru.yandex.cloud",
      "ru.foodfox.client",
      "ru.yandex.telemost",
      "ru.plus.bookmate"
    ],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Yandex.Market",
    domain: "yandex.ru",
    packages: [
      "com.yandex.yazeka",
      "ru.yandex.searchplugin",
      "ru.yandex.weatherplugin",
      "ru.yandex.yandexmaps",
      "ru.yandex.yandexmaps.pr",
      "ru.yandex.bus.tickets",
      "ru.yandex.metro",
      "com.yandex.yamb",
      "com.yandex.messaging.demo",
      "ru.yandex.yandexnavi",
      "ru.yandex.yandexnavi.pr",
      "com.yandex.browser",
      "com.yandex.browser.broteam",
      "com.yandex.browser.alpha",
      "com.yandex.qmobile",
      "com.yandex.q",
      "com.yandex.searchapp",
      "ru.yandex.auth.client",
      "ru.yandex.key",
      "ru.yandex.taxi",
      "com.yandex.yango",
      "com.yandex.rhythm",
      "ru.yandex.mail",
      "ru.beru.android.qa",
      "ru.beru.android",
      "ru.yandex.music",
      "com.yandex.bank",
      "ru.yandex.disk",
      "ru.kinopoisk",
      "com.yandex.aliceapp",
      "com.yandex.huawei.alice",
      "ru.yandex.taximeter",
      "ru.yandex.cloud",
      "ru.foodfox.client",
      "ru.yandex.telemost",
      "ru.plus.bookmate"
    ],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Ynetnews",
    domain: "ynetnews.com",
    packages: ["com.goldtouch.ynet"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "ZBENKO",
    domain: "zbenko.com",
    packages: ["com.zbenko.game"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Zoomcar",
    domain: "zoomcar.com",
    packages: ["com.zoomcar"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  },
  {
    company: "Zwift",
    domain: "zwift.com",
    packages: ["com.zwift.android.alpha", "com.zwift.android.prod"],
    source: "assetlinks",
    discoveredAt: "2026-02-28"
  }
]
