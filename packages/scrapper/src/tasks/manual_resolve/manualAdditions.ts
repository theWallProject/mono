import { ManualOverrideFields } from "../../types"

export type ManualAdditionItem = {
  name: string
} & (
  | ManualOverrideFields
  | { _processed: true }
  | (ManualOverrideFields & { _processed: true })
  | (ManualOverrideFields & { urls?: string[] })
  | (ManualOverrideFields & { _processed: true; urls?: string[] })
)

export const manualAdditions: ManualAdditionItem[] = [
  {
    name: "AHAV",
    reasons: ["b"],
    ws: ["https://www.ahava.com"],
    li: ["https://www.linkedin.com/company/dead-sea-laboratories-ahava"],
    fb: ["https://www.facebook.com/ahavagermany"],
    tw: [""]
  },
  {
    name: "AXA",
    reasons: ["b"],
    ws: ["https://www.axa.com/"],
    li: [
      "https://www.linkedin.com/company/axa/",
      "https://www.linkedin.com/company/axa-wealth/",
      "https://www.linkedin.com/company/axa-group-operations/",
      "https://www.linkedin.com/company/axa-partners/",
      "https://www.linkedin.com/company/axa-global-re/",
      "https://www.linkedin.com/company/bharti-axa-life-insurance/",
      "https://www.linkedin.com/company/axa-mbask-ojsc/",
      "https://www.linkedin.com/company/axa-investment-managers/",
      "https://www.linkedin.com/company/axa-life-invest/",
      "https://www.linkedin.com/company/architas-multi-manager/",
      "https://www.linkedin.com/company/axa-global-direct/",
      "https://www.linkedin.com/company/axa-uk/",
      "https://www.linkedin.com/showcase/healthanea/",
      "https://www.linkedin.com/showcase/axa-von-herz-zu-herz-e-v/",
      "https://www.linkedin.com/company/axahealth/",
      "https://www.linkedin.com/company/gig-saudi/",
      "https://www.linkedin.com/company/axahongkong/",
      "https://www.linkedin.com/company/axa-corporate-solutions/",
      "https://www.linkedin.com/company/axa-gulf/",
      "https://www.linkedin.com/company/axa-liabilities-managers/",
      "https://www.linkedin.com/company/axa-mps/",
      "https://www.linkedin.com/company/axa-minmetals-assurance/",
      "https://www.linkedin.com/company/axa-france/",
      "https://www.linkedin.com/showcase/axa-research-fund/"
    ],
    fb: [
      "https://www.facebook.com/AXA.de/",
      "https://www.facebook.com/AXAAssuranceMaroc",
      "https://www.facebook.com/axainsurance"
    ],
    tw: ["https://x.com/AXA"]
  },
  {
    name: "Chevron",
    reasons: ["b"],
    ws: [
      "https://www.chevron.com",
      "https://www.chevronlubricants.com",
      "www.cpchem.com",
      "https://chevronfuels.com",
      "https://www.chevronmarineproducts.com"
    ],
    fb: [
      "https://www.facebook.com/BonifaceChevronStation",
      "https://www.facebook.com/Chevron",
      "https://www.facebook.com/ChevronAdvocacyNetwork",
      "https://www.facebook.com/ChevronFuelsandRenewableSolutions"
    ],
    li: [
      "https://www.linkedin.com/showcase/chevron-marine-products",
      "https://www.linkedin.com/company/chevron",
      "https://www.linkedin.com/showcase/chevron-colorado",
      "https://www.linkedin.com/showcase/chevronaustralia",
      "https://www.linkedin.com/showcase/chevronhouston",
      "https://www.linkedin.com/showcase/global-lubricants",
      "https://www.linkedin.com/showcase/chevron-new-energies",
      "https://www.linkedin.com/showcase/chevron-delo",
      "https://www.linkedin.com/showcase/chevron-india",
      "https://www.linkedin.com/showcase/chevron-bangladesh",
      "https://www.linkedin.com/showcase/chevron-israel",
      "https://www.linkedin.com/showcase/chevron-oronite",
      "https://www.linkedin.com/showcase/chevron-marine-products",
      "https://www.linkedin.com/company/noble-energy",
      "https://www.linkedin.com/showcase/chevron-technology-ventures"
    ],
    tw: ["https://x.com/Chevron"],
    gh: ["https://github.com/ChevronETC"],
    ytp: [
      "https://www.youtube.com/@Chevron",
      "https://www.youtube.com/@ChevronOronite",
      "https://www.youtube.com/@ChevronTVArchive",
      "https://www.youtube.com/@chevron.australia",
      "https://www.youtube.com/@chevronangola6961",
      "https://www.youtube.com/@chevronfederalcreditunion9683",
      "https://www.youtube.com/@chevronfuels",
      "https://www.youtube.com/@chevronlubricants7032",
      "https://www.youtube.com/@chevronmarineproducts",
      "https://www.youtube.com/@chevronpascagoularefinery7857",
      "https://www.youtube.com/@chevronmarineproducts"
    ],
    ytc: ["https://www.youtube.com/channel/UCG7MOSE5VUfvaZocYhyxi4w"],
    tt: ["https://www.tiktok.com/@chevron"],
    android_app_ids: [
      "com.Chevron.HES.EffeEngmt",
      "com.als.chevron",
      "com.chevron.StartWorkChecksIOGP",
      "com.chevron.cbpandroid",
      "com.chevron.retverify",
      "com.digitalinsight.cma.fiid01002",
      "com.mysalesforce.mycommunity.C00D3000000017zqEAA.A0OT5Y00000000jcWAA",
      "com.outsystemsenterprise.chevronproductsuklim.FASTOnboard",
      "com.outsystemsenterprise.chevronproductsuklim.MLDRMobile",
      "com.polarislabs.horizon.lubewatch.android"
    ],
    urls: [
      "https://apps.apple.com/us/app/chevron/id1450978468",
      "https://chevronadvocacynetwork.com",
      "https://play.google.com/store/apps/dev?id=5536479555375186639",
      "https://www.ecosia.org/search?q=Chevron",
      "https://finance.yahoo.com/quote/CVX/",
      "https://www.cnbc.com/quotes/CVX",
      "https://www.forbes.com/companies/chevron/",
      "https://www.bnm.gov.my/-/chevron-malaysia-limited",
      "https://www.marketwatch.com/investing/stock/cvx",
      "https://markets.ft.com/data/equities/tearsheet/summary?s=CVX:NYQ",
      "https://www.glassdoor.com/Overview/Working-at-Chevron-EI_IE13524.11,18.htm",
      "https://www.reuters.com/company/chevron-corp/",
      "https://www.weforum.org/organizations/chevron-corporation/",
      "https://www.theguardian.com/business/chevron",
      "https://www.morningstar.com/stocks/xnys/cvx/quote",
      "https://www.nasdaq.com/market-activity/stocks/cvx",
      "https://my.jobstreet.com/companies/chevron-168554240598187",
      "https://www.statista.com/topics/5256/chevron/",
      "https://www.ebsco.com/research-starters/business-and-management/chevron-corporation",
      "https://www.google.com/finance/quote/CVX:NYSE?hl=en",
      "https://chevronproductsuklim.outsystemsenterprise.com",
      "https://www.bloomberg.com/profile/company/7728792Z:MK",
      "https://www.yellowpages.my/-1228660"
    ],
    ig: ["https://www.instagram.com/chevron"],
    th: ["https://www.threads.com/@chevron"],

    _processed: true
  },
  {
    name: "HP",
    reasons: ["b"],
    ws: [
      "https://www.hp.com",
      "https://www.omen.com",
      "https://www.hyperx.com",
      "https://www.hpe.com",
      "https://www.arubanetworks.com"
    ],
    li: [
      "https://www.linkedin.com/company/hewlett-packard-enterprise/",
      "https://www.linkedin.com/company/hyperx/",
      "https://www.linkedin.com/company/aruba-a-hewlett-packard-enterprise-company/",
      "https://www.linkedin.com/company/scytale.io/",
      "https://www.linkedin.com/showcase/hewlett-packard-labs/",
      "https://www.linkedin.com/showcase/hpe-financial-services/",
      "https://www.linkedin.com/showcase/hpe-partner-ready/",
      "https://www.linkedin.com/company/athonet/",
      "https://www.linkedin.com/company/cray-inc-/",
      "https://www.linkedin.com/showcase/hpe-it-solutions-for-smb/",
      "https://www.linkedin.com/showcase/hpe-servers-and-systems/",
      "https://www.linkedin.com/company/bluedata-software/",
      "https://www.linkedin.com/company/cloud-cruiser-inc/",
      "https://www.linkedin.com/company/nimble-storage/",
      "https://www.linkedin.com/company/cloudphysics/",
      "https://www.linkedin.com/company/axis-security/",
      "https://www.linkedin.com/company/determined-ai/",
      "https://www.linkedin.com/showcase/hpe-greenlake/",
      "https://www.linkedin.com/showcase/hpe-engage&grow-/",
      "https://www.linkedin.com/company/aruba-a-hewlett-packard-enterprise-company/",
      "https://www.linkedin.com/company/mapr-technologies/",
      "https://www.linkedin.com/company/simplivity-corporation/",
      "https://www.linkedin.com/company/cloud-technology-partners/",
      "https://www.linkedin.com/showcase/hpe-ai/",
      "https://www.linkedin.com/showcase/hpe-aruba-networking/",
      "https://www.linkedin.com/showcase/hpe-pointnext-services/",
      "https://www.linkedin.com/showcase/hpestorage/"
    ],
    fb: [
      "https://www.facebook.com/HP/",
      "https://www.facebook.com/OMENbyHP.de",
      "https://www.facebook.com/HyperXDE/?brand_redir=179848128697913"
    ],
    tw: [
      "https://x.com/hp",
      "https://x.com/OMENbyHP",
      "https://x.com/HyperX",
      "https://x.com/HPE",
      "https://x.com/HPE_Aruba_NETW"
    ]
  },
  {
    name: "Jedyapps",
    reasons: ["h"],
    ws: ["https://www.jedyapps.com/"],
    li: ["https://www.linkedin.com/company/jedyapps"]
  },
  {
    name: "Puma",
    reasons: ["b"],
    ws: ["https://www.puma.com"],
    li: ["https://www.linkedin.com/company/puma/"],
    fb: ["https://www.facebook.com/PumaGermany/"],
    tw: ["https://x.com/puma"]
  },
  {
    name: "Sabra",
    reasons: ["b"],
    ws: ["https://sabra.com/"],
    li: ["https://www.linkedin.com/company/sabra-dipping-company-llc/"],
    fb: ["https://www.facebook.com/Sabra/"],
    tw: ["https://x.com/Sabra"]
  },
  {
    name: "Siemens",
    reasons: ["b"],
    ws: ["https://www.siemens.com/", "https://www.siemens-stiftung.org/"],
    li: [
      "https://www.linkedin.com/company/enlighted-inc/",
      "https://www.linkedin.com/showcase/siemensinfrastructure/",
      "https://www.linkedin.com/showcase/siemens-financial-services/",
      "https://www.linkedin.com/showcase/siemens-research-and-innovation-ecosystem/",
      "https://www.linkedin.com/showcase/mobase/",
      "https://www.linkedin.com/showcase/siemens-mobility/",
      "https://www.linkedin.com/showcase/siemens-industry-/",
      "https://www.linkedin.com/company/ecodomus/",
      "https://www.linkedin.com/company/siemens-healthineers/",
      "https://www.linkedin.com/company/siemenssoftware/",
      "https://www.linkedin.com/company/hacon/",
      "https://www.linkedin.com/company/siemens-eda/"
    ],
    fb: ["https://www.facebook.com/Siemens"],
    tw: ["https://x.com/Siemens"]
  },
  { name: "Wixsite (hosting)", reasons: ["b"], ws: ["wixsite.com"], li: [""], fb: [""], tw: [""] },
  {
    name: "Wordtune",
    reasons: ["h"],
    ws: ["https://www.wordtune.com"],
    li: ["https://www.linkedin.com/showcase/wordtune"],
    fb: ["https://www.facebook.com/wordtune"],
    tw: ["https://x.com/wordtune"],
    ig: ["https://www.instagram.com/wordtune_official"],
    ytc: ["https://www.youtube.com/channel/UCDQlFKBK11jIxm4iVymoAtA"],
    tt: ["https://www.tiktok.com/@wordtune_official"],
    urls: [
      "https://chromewebstore.google.com/detail/wordtune-ai-paraphrasing/nllcnknpjnininklegdoijpljgdjkijc",
      "https://microsoftedge.microsoft.com/addons/detail/wordtune-ai-paraphrasing/fgngodlaekdlibajobmkaklibdggemdd",
      "https://www.linkedin.com/newsletters/6995001803318681600"
    ],
    _processed: true
  }
]
