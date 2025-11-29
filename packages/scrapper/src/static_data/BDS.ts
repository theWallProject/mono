import { ManualItemType } from "../types"

// use this code to fetsh all afliated pages from linkedin
/*
const links = [];
document
  .querySelector(".artdeco-modal__content")
  .querySelectorAll(".org-view-entity-card__container")
  .forEach((page) =>
    links.push(`"${page.querySelector("[data-test-app-aware-link]").href}"`),
  );
console.log(links.join(",\n"));

*/

export const BDS: ManualItemType[] = [
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
    tw: [
      "https://x.com/hp",
      "https://x.com/OMENbyHP",
      "https://x.com/HyperX",
      "https://x.com/HPE",
      "https://x.com/HPE_Aruba_NETW"
    ],
    fb: [
      "https://www.facebook.com/HP/",
      "https://www.facebook.com/OMENbyHP.de",
      "https://www.facebook.com/HyperXDE/?brand_redir=179848128697913"
    ]
  },
  {
    name: "Jedyapps",
    reasons: ["h"],
    ws: ["https://www.jedyapps.com/"],
    li: ["https://www.linkedin.com/company/jedyapps"]
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
    tw: ["https://x.com/Siemens"],
    fb: ["https://www.facebook.com/Siemens"]
    // https://www.youtube.com/@siemens
    // https://www.instagram.com/siemens/
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
    tw: ["https://x.com/AXA"],
    fb: [
      "https://www.facebook.com/AXA.de/",
      "https://www.facebook.com/AXAAssuranceMaroc",
      "https://www.facebook.com/axainsurance"
    ]
    // https://www.youtube.com/user/axapeopleprotectors
  },
  {
    name: "Puma",
    reasons: ["b"],

    ws: ["https://www.puma.com"],
    li: ["https://www.linkedin.com/company/puma/"],
    tw: ["https://x.com/puma"],
    fb: ["https://www.facebook.com/PumaGermany/"]
    // https://www.tiktok.com/@puma
    // https://www.instagram.com/puma/
    // https://www.youtube.com/user/PUMA
  },
  {
    name: "AHAV",
    reasons: ["b"],

    ws: ["https://www.ahava.com"],
    li: ["https://www.linkedin.com/company/dead-sea-laboratories-ahava"],
    tw: [""],
    fb: ["https://www.facebook.com/ahavagermany"]
  },
  {
    name: "Sabra",
    reasons: ["b"],

    ws: ["https://sabra.com/"],
    li: ["https://www.linkedin.com/company/sabra-dipping-company-llc/"],
    tw: ["https://x.com/Sabra"],
    fb: ["https://www.facebook.com/Sabra/"]
    // https://www.instagram.com/sabra/
    // https://www.tiktok.com/@sabra
  },
  {
    name: "Wixsite (hosting)",
    reasons: ["b"],

    ws: ["wixsite.com"],
    li: [""],
    tw: [""],
    fb: [""]
  }
]

/*
  {
    name: "",
    reasons: ["b"],

    ws: [""],
    li: [""],
    tw: [""],
    fb: [""],
  },
*/
