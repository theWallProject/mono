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
    name: "Caltex",
    reasons: ["b"],
    ws: ["https://www.caltex.com", "https://caltexlubricants.com"],
    fb: ["https://www.facebook.com/CaltexLubricantsEG", "https://www.facebook.com/CaltexSingapore"],
    tw: ["https://x.com/CaltexSingapore"],
    ig: ["https://www.instagram.com/boycottcaltex"],
    ytp: [
      "https://www.youtube.com/@CaltexBrand",
      "https://www.youtube.com/@CaltexDavao",
      "https://www.youtube.com/@CaltexLubricantsIN",
      "https://www.youtube.com/@CaltexNZ",
      "https://www.youtube.com/@CaltexPakistanOfficial",
      "https://www.youtube.com/@CaltexPronPiyananOil",
      "https://www.youtube.com/@CaltexSriLanka2021",
      "https://www.youtube.com/@Pt.lancarsaktioffice",
      "https://www.youtube.com/@caltex7410",
      "https://www.youtube.com/@caltex_australia",
      "https://www.youtube.com/@caltexbrafordlubricants5906",
      "https://www.youtube.com/@caltexcambodia1379",
      "https://www.youtube.com/@caltexcambodia1971",
      "https://www.youtube.com/@caltexcareers1480",
      "https://www.youtube.com/@caltexdigital7354",
      "https://www.youtube.com/@caltexeasterncape6866",
      "https://www.youtube.com/@caltexglenashley333",
      "https://www.youtube.com/@caltexksa1253",
      "https://www.youtube.com/@caltexlubenar4660",
      "https://www.youtube.com/@caltexlubricantsme",
      "https://www.youtube.com/@caltexnz2571",
      "https://www.youtube.com/@caltexnz5716",
      "https://www.youtube.com/@caltexofficialstoremalaysi5917",
      "https://www.youtube.com/@caltexsouthafrica5590"
    ],
    tt: [
      "https://www.tiktok.com/@caltex.tmn.intan",
      "https://www.tiktok.com/@caltex_emstar",
      "https://www.tiktok.com/@caltexassamkumbang",
      "https://www.tiktok.com/@caltexbachok",
      "https://www.tiktok.com/@caltexmy",
      "https://www.tiktok.com/@caltexsungaitong",
      "https://www.tiktok.com/@caltexthailand",
      "https://www.tiktok.com/@gimtit168"
    ],
    urls: [
      "https://apps.apple.com/us/app/caltex-nz/id1435121311",
      "https://apps.apple.com/us/app/caltex-pakistan/id1239372998",
      "https://apps.apple.com/us/app/caltex-workshop/id1522862138",
      "https://apps.apple.com/us/app/caltexgo-rewards/id1607535654",
      "https://apps.apple.com/us/app/netlube-caltex-australia/id685230181",
      "https://apps.apple.com/us/app/netlube-caltex-new-zealand/id946248618",
      "https://play.google.com/store/apps/developer?id=Chevron+Singapore+Pte+Ltd",
      "https://afsc.org/BoycottChevron"
    ],
    android_app_ids: [
      "com.Caltex.CaltexWorkshop",
      "com.caltex.starcardonline",
      "com.chevron.caltexgo.prod",
      "pk.caltex.chevron"
    ],
    _processed: true
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
    fb: [
      "https://www.facebook.com/BonifaceChevronStation",
      "https://www.facebook.com/Chevron",
      "https://www.facebook.com/ChevronAdvocacyNetwork",
      "https://www.facebook.com/ChevronFuelsandRenewableSolutions"
    ],
    tw: ["https://x.com/Chevron"],
    ig: ["https://www.instagram.com/chevron"],
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
    th: ["https://www.threads.com/@chevron"],
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
    _processed: true
  },
  {
    name: "Dell",
    reasons: ["b"],
    ws: ["https://www.dell.com", "https://mlink-dell.com"],
    li: [
      "https://www.linkedin.com/company/alienware",
      "https://www.linkedin.com/company/credant-technologies",
      "https://www.linkedin.com/company/dell-compellent",
      "https://www.linkedin.com/company/delltechnologies",
      "https://www.linkedin.com/company/emc-corporation",
      "https://www.linkedin.com/company/gale-technologies",
      "https://www.linkedin.com/company/virtustream",
      "https://www.linkedin.com/company/xtremio",
      "https://www.linkedin.com/showcase/dell-tech-partner"
    ],
    fb: [
      "https://www.facebook.com/Dell",
      "https://www.facebook.com/DellRefurbished",
      "https://www.facebook.com/DellTechCareers",
      "https://www.facebook.com/DellTechnologies"
    ],
    ig: ["https://www.instagram.com/dell"],
    gh: ["https://github.com/dell"],
    ytp: [
      "https://www.youtube.com/@Dell",
      "https://www.youtube.com/@DellTWvlog",
      "https://www.youtube.com/@DellTechnologies",
      "https://www.youtube.com/@DellTechnologies-India",
      "https://www.youtube.com/@DellsuporteBrasil",
      "https://www.youtube.com/@TechSupportDell",
      "https://www.youtube.com/@dellnobrasil",
      "https://www.youtube.com/c/DellEnterpriseSupport"
    ],
    tt: ["https://www.tiktok.com/@dell"],
    th: ["https://www.threads.com/@dell"],
    urls: [
      "https://apps.apple.com/us/app/dell-ar-assistant/id1521610787",
      "https://apps.apple.com/us/app/dell-audio/id6472411862",
      "https://finance.yahoo.com/quote/DELL",
      "https://play.google.com/store/apps/developer?id=Dell+Inc.",
      "https://www.reddit.com/r/Dell"
    ],
    android_dev_id: "com.dell",
    android_app_ids: [
      "com.dell.PartnerProgram",
      "com.dell.ahapp",
      "com.dell.dellaudio",
      "com.dell.dfsm.mobile",
      "com.dell.omm",
      "com.emc.cloudiq",
      "com.emc.mobileapps.elabnavigator"
    ],
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
    name: "Intel",
    reasons: ["b"],
    ws: [
      "https://www.intel.com",
      "https://www.exploreintel.com",
      "https://www.intel.la",
      "https://www.intelcapital.com",
      "https://www.altera.com"
    ],
    li: [
      "https://www.linkedin.com/company/intel-corporation",
      "https://www.linkedin.com/company/intel-ignite",
      "https://www.linkedin.com/company/intel-labs",
      "https://www.linkedin.com/showcase/intel-business",
      "https://www.linkedin.com/showcase/intel-developer-zone",
      "https://www.linkedin.com/showcase/intel-developer",
      "https://www.linkedin.com/showcase/intel-foundry",
      "https://www.linkedin.com/showcase/intel-network-and-edge",
      "https://www.linkedin.com/showcase/intel-software",
      "https://www.linkedin.com/showcase/intelfabric",
      "https://www.linkedin.com/showcase/openatintel"
    ],
    fb: ["https://www.facebook.com/Intel"],
    tw: ["https://x.com/IntelSupport", "https://x.com/intel"],
    ig: ["https://www.instagram.com/intel", "https://www.instagram.com/inteluk"],
    gh: ["https://github.com/intel", "https://github.com/search?q=Intel&type=users"],
    ytp: [
      "https://www.youtube.com/@Intel",
      "https://www.youtube.com/@IntelFoundersTeam",
      "https://www.youtube.com/@IntelGraphics",
      "https://www.youtube.com/@IntelIndonesiaID",
      "https://www.youtube.com/@IntelIreland",
      "https://www.youtube.com/@IntelNewsroom",
      "https://www.youtube.com/@IntelSoftware",
      "https://www.youtube.com/@IntelTechnology",
      "https://www.youtube.com/@intelbusiness",
      "https://www.youtube.com/@intelindia",
      "https://www.youtube.com/@intelkorea",
      "https://www.youtube.com/@intelscope",
      "https://www.youtube.com/@intelthailand2902",
      "https://www.youtube.com/c/Intel"
    ],
    tt: ["https://www.tiktok.com/@intel", "https://www.tiktok.com/@intelgamingofficial"],
    urls: [
      "https://x.com/intel/affiliates",
      "https://play.google.com/store/apps/developer?id=Intel+Corporation",
      "https://edition.cnn.com/markets/stocks/INTC",
      "https://finance.yahoo.com/quote/INTC",
      "https://www.apple.com/us/search/Intel?src=globalnav",
      "https://www.cnbc.com/quotes/INTC",
      "https://www.forbes.com/companies/intel",
      "https://www.marketwatch.com/investing/stock/intc",
      "https://www.mida.gov.my/success-stories/intel-microelectronics",
      "https://www.pcmag.com/brands/intel",
      "https://www.reddit.com/r/intel",
      "https://www.reuters.com/company/intel-corp",
      "https://www.scmp.com/topics/intel",
      "https://www.tradingview.com/symbols/NASDAQ-INTC"
    ],
    android_dev_id: "com.intel",
    _processed: true
  },
  {
    name: "Jedyapps",
    reasons: ["h"],
    ws: ["https://www.jedyapps.com/"],
    li: ["https://www.linkedin.com/company/jedyapps"]
  },
  {
    name: "Microsoft",
    reasons: ["b"],
    ws: ["https://www.microsoft.com"],
    fb: [
      "https://www.facebook.com/MicrosoftAfrica",
      "https://www.facebook.com/MicrosoftDE",
      "https://www.facebook.com/MicrosoftLife",
      "https://www.facebook.com/microsoftresearch"
    ],
    gh: [
      "https://github.com/AzurePipelines",
      "https://github.com/Microsoft-OpenSource-Labs",
      "https://github.com/Microsoft-corp",
      "https://github.com/MicrosoftCopilot",
      "https://github.com/MicrosoftDocs",
      "https://github.com/MicrosoftEdge",
      "https://github.com/MicrosoftResearch",
      "https://github.com/MicrosoftStudentChapter",
      "https://github.com/OfficeDev",
      "https://github.com/azure-ai-foundry",
      "https://github.com/microsoft",
      "https://github.com/microsoftarchive",
      "https://github.com/microsoftgraph",
      "https://github.com/microsoftopensource",
      "https://github.com/search?q=Microsoft&type=users&p=2"
    ],
    ytp: [
      "https://www.youtube.com/@AzureDevelopers",
      "https://www.youtube.com/@EZANZ",
      "https://www.youtube.com/@MSFTEdge",
      "https://www.youtube.com/@MSFTMechanics",
      "https://www.youtube.com/@Microsoft",
      "https://www.youtube.com/@Microsoft.Copilot",
      "https://www.youtube.com/@Microsoft365Japan",
      "https://www.youtube.com/@MicrosoftAPAC",
      "https://www.youtube.com/@MicrosoftAzure",
      "https://www.youtube.com/@MicrosoftCommunityLearning",
      "https://www.youtube.com/@MicrosoftCustomerSupport",
      "https://www.youtube.com/@MicrosoftDeveloper",
      "https://www.youtube.com/@MicrosoftDynamics365",
      "https://www.youtube.com/@MicrosoftEDU",
      "https://www.youtube.com/@MicrosoftFabric",
      "https://www.youtube.com/@MicrosoftHoloLens",
      "https://www.youtube.com/@MicrosoftLearn",
      "https://www.youtube.com/@MicrosoftPowerApps",
      "https://www.youtube.com/@MicrosoftPowerBI",
      "https://www.youtube.com/@MicrosoftSecurity",
      "https://www.youtube.com/@MicrosoftSecurityCommunity",
      "https://www.youtube.com/@MicrosoftTaiwan",
      "https://www.youtube.com/@MicrosoftTeams",
      "https://www.youtube.com/@WorkingAtMicrosoft",
      "https://www.youtube.com/@events_msft",
      "https://www.youtube.com/@microsoftdesign",
      "https://www.youtube.com/@mspowerplatform",
      "https://www.youtube.com/user/officevideos/showcase",
      "https://www.youtube.com/user/surface/custom"
    ],
    tt: [
      "https://www.tiktok.com/@expertzone_na",
      "https://www.tiktok.com/@expertzoneitalia",
      "https://www.tiktok.com/@microsoft",
      "https://www.tiktok.com/@microsoft365",
      "https://www.tiktok.com/@microsoft_israel_rnd",
      "https://www.tiktok.com/@microsoft_jp",
      "https://www.tiktok.com/@microsoftbrasil",
      "https://www.tiktok.com/@microsoftcopilot",
      "https://www.tiktok.com/@microsoftdeveloper",
      "https://www.tiktok.com/@microsoftedge",
      "https://www.tiktok.com/@microsoftedu",
      "https://www.tiktok.com/@microsoftlatam",
      "https://www.tiktok.com/@microsoftshopping",
      "https://www.tiktok.com/@surface",
      "https://www.tiktok.com/@windows",
      "https://www.tiktok.com/search/user?q=Microsoft"
    ],
    android_dev_id: "com.microsoft",
    stock_symbol: "MSFT",
    urls: [
      "https://chromewebstore.google.com/detail/add-to-microsoft-to-do/loblkkbfciiklgoblkigehhghfjfjede",
      "https://chromewebstore.google.com/detail/microsoft-bing-homepage-s/ddojnmkongaimkdddgmcccldlfhokcfb",
      "https://chromewebstore.google.com/detail/microsoft-bing-search-wit/fbgcedjacmlbgleddnoacbnijgmiolem",
      "https://chromewebstore.google.com/detail/microsoft-single-sign-on/ppnbnpeolgkicgegkbkbjmhlideopiji",
      "https://chromewebstore.google.com/search/Microsoft",
      "https://play.google.com/store/apps/dev?id=6720847872553662727"
    ],
    _processed: true
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
    ws: ["https://www.siemens.com", "https://www.siemens-stiftung.org"],
    li: [
      "https://www.linkedin.com/company/enlighted-inc",
      "https://www.linkedin.com/showcase/siemensinfrastructure",
      "https://www.linkedin.com/showcase/siemens-financial-services",
      "https://www.linkedin.com/showcase/siemens-research-and-innovation-ecosystem",
      "https://www.linkedin.com/showcase/mobase/",
      "https://www.linkedin.com/showcase/siemens-mobility",
      "https://www.linkedin.com/showcase/siemens-industry-",
      "https://www.linkedin.com/company/ecodomus/",
      "https://www.linkedin.com/company/siemens-healthineers",
      "https://www.linkedin.com/company/siemenssoftware",
      "https://www.linkedin.com/company/hacon",
      "https://www.linkedin.com/company/siemens-eda"
    ],
    fb: ["https://www.facebook.com/Siemens"],
    tw: ["https://x.com/Siemens"]
  },
  {
    name: "Texaco",
    reasons: ["b"],
    ws: [
      "https://www.texaco.com",
      "https://starrewards.valero.com",
      "https://www.chevrontexacocards.com/Chevron",
      "https://www.texacoinhawaii.com"
    ],
    ig: ["https://www.instagram.com/texacolubricants/?hl=en"],
    ytp: [
      "https://www.youtube.com/@TexacoLubricantsTV",
      "https://www.youtube.com/@Texaco_Srbija",
      "https://www.youtube.com/@texacoinhawaii"
    ],
    tt: [
      "https://www.tiktok.com/@edsllanosdecalibio",
      "https://www.tiktok.com/@texaco.cienaguita",
      "https://www.tiktok.com/@texaco.k1165.sepa2",
      "https://www.tiktok.com/@texaco.peten",
      "https://www.tiktok.com/@texacocontechroncolombia",
      "https://www.tiktok.com/@texacoguatemala",
      "https://www.tiktok.com/@texacolaesmeralda",
      "https://www.tiktok.com/@texacolasamericas",
      "https://www.tiktok.com/@texacowithtechron"
    ],
    urls: [
      "https://apps.apple.com/us/app/texaco/id1451359429",
      "https://www.texacolubricants.com/en_uk/home/Our-People.html",
      "https://www.texacolubricants.com/en_uk/home/products/by_brand/delo.html?src-tab=products",
      "https://www.texacolubricants.com/en_uk/home/products/by_brand/havoline.html?src-tab=products",
      "https://www.texacolubricants.com/en_uk/home/products/by_brand/hdax.html?src-tab=products",
      "https://www.texacolubricants.com/en_uk/home/products/by_brand/techron.html?src-tab=products"
    ],
    android_app_ids: ["com.polarislabs.horizon.texacolubewatch.android"],
    _processed: true
  },
  { name: "Wixsite (hosting)", reasons: ["h"], ws: ["wixsite.com"], li: [""], fb: [""], tw: [""] },
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
