# AFSC — remaining undecided rows

USA was completed on 2026-11-11 (every USA ISIN has an explicit add or skip in
`src/static_data/external/afscDecisions.json`). This file lists the 82 rows that are
still undecided, grouped by headquarters, for a later pass.

Decisions are recorded in `afscDecisions.json` keyed by **ISIN** — never edit `afsc.json`,
which is re-parsed from `afsc-dataset-2025-07.xlsx` and would overwrite corrections.
Adds need an `action`, a `reason` (`c` for non-Israel HQ, `h` only when the whole company
is in Israel) and a `ws`; use `proofLink` when the dataset `Link` slug belongs to another
company (13 slugs are shared).

Flags legend: div = divest, occ = occupations, pri = prisons, bor = borders.

---

## Japan (11)

- `JP3242800005` — **Canon** (Canon Inc, 7751) — flags: occ
  - https://investigate.info/company/canon
  - A Japanese manufacturer of cameras and film equipment. Its subsidiary Briefcam provides video surveillance tools to the Israeli occupation authorities in East Jerusalem.
- `JP3788600009` — **Hitachi** (Hitachi Ltd, 6501) — flags: occ
  - https://investigate.info/company/hitachi
  - A Japanese multinational conglomerate in the communications, infrastructure, electronics, transportation, heavy machinery, and financial industries, among others. Provides equipment that Israel...
- `JP3787000003` — **Hitachi Construction** (Hitachi Construction Machinery Co Ltd, 6305) — flags: occ
  - https://investigate.info/company/hitachi
  - Subsidiary of Hitachi Construction
- `JP3854600008` — **Honda Motor Co** (Honda Motor Co Ltd, 7267) — flags: bor
  - https://investigate.info/company/honda-motor-co
  - A Japanese vehicle manufacturer that provides vehicles to US Customs and Border Protection.
- `JP3898400001` — **Mitsubishi** (Mitsubishi Corp, 8058) — flags: occ
  - https://investigate.info/company/mitsubishi
  - Subsidiary of Mitsubishi Motors
- `JP3899800001` — **Mitsubishi Motors** (Mitsubishi Motors Corp, 7211) — flags: occ
  - https://investigate.info/company/mitsubishi
  - A Japanese automotive manufacturer. Its vehicles have been used in the process of demolition and confiscation of Palestinian property in the occupied West Bank.
- `JP3733000008` — **NEC** (NEC Corp, 6701) — flags: bor
  - https://investigate.info/company/nec
  - A Japanese IT company that provides US immigration authorities with biometric technologies used to target immigrant communities.
- `JP3435000009` — **Sony Group** (Sony Group Corp, 6758) — flags: occ
  - https://investigate.info/company/sony
  - A Japanese multinational conglomerate that specializes in developing and manufacturing electronic equipment, gaming consoles, instruments, and software. Its cameras are used in surveillance...
- `JP3336450006` — **Sun** (Sun Corp, 6736) — flags: div, pri, bor
  - https://investigate.info/company/cellebrite
  - A majority owner of Cellebrite
- `JP3633400001` — **Toyota Motor** (Toyota Motor Corp, 7203) — flags: occ
  - https://investigate.info/company/toyota-motor
  - A Japanese multinational automotive manufacturer. Its vehicles are used by Israeli security forces to protect illegal settlements, carry out home demolitions, and suppress Palestinian...
- `JP3942800008` — **Yamaha Motor** (Yamaha Motor Co Ltd, 7272) — flags: bor
  - https://investigate.info/company/yamaha-motor
  - A Japanese vehicle manufacturer that provides all-terrain vehicles and watercraft to US Customs and Border Protection.

## Germany (8)

- `DE0006047004` — **Heidelberg Materials** (Heidelberg Materials AG, HEI) — flags: div, occ
  - https://investigate.info/company/heidelbergcement
  - The world's largest cement producer and a leader in the production of aggregates. Operates quarries and manufacturing facilities in the occupied West Bank. Its products have been used to build and...
- `DE0007100000` — **Mercedes-Benz Group** (Mercedes-Benz Group AG, MBG) — flags: occ
  - https://investigate.info/company/mercedes-benz-group
  - A German multinational automotive company that supplies tank transporters to the Israeli military.
- `DE000RENK730` — **RENK Group** (RENK Group AG, R3NK) — flags: div, occ
  - https://investigate.info/company/renk
  - A German company that makes engines and transmissions for Israel's Merkava battle tank and Namer armored personnel carrier.
- `DE000A0DJ6J9` — **SMA Solar Tech** (SMA Solar Technology AG, S92) — flags: occ
  - https://investigate.info/company/sma-solar-technology
  - A German-owned solar energy equipment supplier whose equipment has been used at a solar field in an illegal Israeli settllement the occupied West Bank.
- `DE0007236101` — **Siemens** (Siemens AG, SIE) — flags: occ
  - https://investigate.info/company/siemens
  - A German multinational conglomerate in the electronics and industrial engineering industries. Its equipment is installed in illegal settlement roads and a the railway tracks in the occupied West Bank.
- `DE000TRAT0N7` — **Traton** (Traton SE, 8TRA) — flags: occ
  - https://investigate.info/company/traton
  - A German manufacturer of commercial vehicles and engineering equipment, majority-owned by Volkswagen. It provides Israel with MAN vehicles, which are converted there into The Skunk, a crowd...
- `DE0007664039` — **Volkswagen** (Volkswagen AG, VOW3) — flags: occ
  - https://investigate.info/company/volkswagen
  - A German manufacturer of commercial vehicles and engineering equipment. Its subsidiary Traton provides Israeli with MAN vehicles, which are converted there into The Skunk, a crowd control weapon...
- `DE0007500001` — **thyssenkrupp** (thyssenkrupp AG, TKA) — flags: div, occ
  - https://investigate.info/company/thyssenkrupp
  - A German engineering company that has provided the Israeli Navy with warships and submarines

## UK (8)

- `GB0002634946` — **BAE Systems** (BAE Systems PLC, BA.) — flags: div, occ
  - https://investigate.info/company/bae-systems
  - The world's seventh-largest military contractor, which manufactures multiple weapon systems routinely used in war crimes against Palestinians.
- `NL0010545661` — **CNH Industrial** (CNH Industrial NV, CNHI) — flags: occ
  - https://investigate.info/company/cnh-industrial
  - A multinational manufacturer of agricultural and construction equipment. Its construction equipment has been used in demolitions of Palestinians' homes and in construction on illegal Israeli...
- `GB0005405286` — **HSBC Holdings** (HSBC Holdings PLC, HSBA) — flags: pri, bor
  - https://investigate.info/company/hsbc-holdings
  - A UK-based bank holding and financial services company. It has been one of the main financial backers of private prison companies CoreCivic and GEO Group.
- `GB0004657408` — **MITIE Gr** (MITIE Group PLC, MTO) — flags: div, pri
  - https://investigate.info/company/mitie-group
  - A British facility management, consultancy, and product management company that operates private prisons and immigration jails in the UK.
- `GB00B2B0DG97` — **RELX** (RELX PLC, REL) — flags: pri, bor
  - https://investigate.info/company/relx
  - A UK-based data broker and information services provider. Its subsidiary LexisNexis provides US immigration authorities with systems used to track and target immigrant communities and sells legal...
- `GB00B63H8491` — **Rolls-Royce Hldgs** (Rolls-Royce Holdings PLC, RR.) — flags: div, occ
  - https://investigate.info/company/rolls-royce-hldgs
  - The UK's second largest weapons manufacturer. Its German subsidiary MTU makes the engines for Israel's main battle tanks and armored personnel carriers.
- `GB0007973794` — **Serco Group** (Serco Group PLC, SRP) — flags: div, pri
  - https://investigate.info/company/serco-group
  - A British multinational outsourcing company that operates prisons and immigration jails in Australia, Germany, New Zealand, and the UK.
- `GB00B1WY2338` — **Smiths Group** (Smiths Group PLC, SMIN) — flags: bor
  - https://investigate.info/company/smiths-group
  - A British engineering company that provides X-ray and surveillance technologies to US immigration authorities for monitoring borders.

## France (7)

- `FR0000125338` — **Capgemini** (Capgemini SE, CAP) — flags: pri, bor
  - https://investigate.info/company/capgemini
  - A French IT and engineering firm that provides US immigration authorities with IT solutions used to support deportations.
- `FR0000120172` — **Carrefour** (Carrefour, CA) — flags: occ
  - https://investigate.info/company/carrefour
  - A French multinational retailer with grocery stores located in illegal Israeli settlements in the occupied West Bank.
- `FR0000038606` — **Manitou BF** (Manitou BF SA, MTU) — flags: occ
  - https://investigate.info/company/manitou-bf
  - A French manufacturer of heavy machinery and construction equipment. Its cranes have been used in the construction and maintenance of the separation wall in the occupied West Bank.
- `FR0013344173` — **Roche Bobois** (Roche Bobois SA, RBO) — flags: occ
  - https://investigate.info/company/roche-bobois
  - A French furniture manufacturer that has a store in an illegal settlement in the occupied West Bank.
- `FR0000121220` — **Sodexo** (Sodexo, SW) — flags: div, pri
  - https://investigate.info/company/sodexo
  - A French multinational food services and facilities management company that operates prisons in Australia and the UK.
- `FR0000121329` — **Thales** (Thales, HO) — flags: bor
  - https://investigate.info/company/gemalto
  - A French IT and military company that designs biometric and identification management systems for US and European immigration authorities.
- `FR0000125486` — **Vinci** (Vinci SA, DG) — flags: occ
  - https://investigate.info/company/vinci
  - VINCI's subsidiary SEMI led the project to electrify the Tel Aviv-Jerusalem railway, which crosses into the occupied West Bank.

## Israel (7)

- `IL0010922040` — **Amir Marketing & Inv** (Amir Marketing & Investments In Agriculture Ltd, AMRK) — flags: div, occ
  - https://investigate.info/company/amir-marketing-inv
  - An Israeli agricultural company that operates branches in two illegal settlements in the occupied West Bank.
- `IL0010971468` — **Capital Point** (Capital Point Ltd, CPTP) — flags: occ
  - https://investigate.info/company/capital-point
  - A venture capital investment firm. One of its holdings, Meytag High Tech Ventures, is located at Katzrin, an illegal Israeli settlement in the occupied Golan Heights.
- `IL0007040152` — **Export Investment** (Export Investment Corp Ltd, EXPO) — flags: div, occ
  - https://investigate.info/company/bank-jerusalem
  - The parent company of Bank of Jerusalem, an Israeli bank that finances construction projects and operates branches in illegal settlements in the occupied West Bank.
- `IL0011562803` — **G1 Secure Solutions** (G1 Secure Solutions Ltd, GOSS) — flags: div, occ
  - https://investigate.info/company/g1-secure-solutions
  - One of Israel's largest private security firms, formerly a subsidiary of G4S. Provides security services and equipment to several projects of the Israeli occupation of Palestine, including illegal...
- `AU0000253809` — **Roots Sustainable** (Roots Sustainable Agricultural Technologies Ltd, ROOO) — flags: occ
  - https://investigate.info/company/roots-sustainable
  - An Israeli agricultural technology company that provides climate management technologies to illegal Israeli settlements in the occupied West Bank.
- `IL0011801730` — **Tera Light** (Tera Light Ltd, TRLT) — flags: occ
  - https://investigate.info/company/tera-light
  - An Israeli solar energy company with projects in the occupied West Bank.
- `IL0010972292` — **Themis GREN** (Themis GREN Ltd, TMIS) — flags: div, occ
  - https://investigate.info/company/b-yair-building-1988
  - An Israeli real estate, construction, and development company that builds housing and commercial projects in the occupied Palestinian territory.

## South Korea (7)

- `KR7000150003` — **Doosan** (Doosan Corp, 150) — flags: occ
  - https://investigate.info/company/doosan
  - The parent company of Doosan Enerbility and of Doosan Bobcat, which provides heavy machinery to the Israeli military.
- `KR7241560002` — **Doosan Bobcat** (Doosan Bobcat Inc, 241560) — flags: occ
  - https://investigate.info/company/doosan-bobcat
  - Provides heavy machinery to the Israeli military, which uses it illegally in the occupied Palestinian territory.
- `KR7034020008` — **Doosan Enerbility** (Doosan Enerbility Co Ltd, 34020) — flags: occ
  - https://investigate.info/company/doosan-enerbility
  - The parent company of Doosan Bobcat, which provides heavy machinery to the Israeli military.
- `KR7267250009` — **HD Hyundai** (HD Hyundai, 267250) — flags: occ
  - https://investigate.info/company/hd-hyundai
  - The parent company of Korea Shipbuilding and its subsidiary Hyundai Heavy Industries, whose products are used to demolish homes and to construct illegal settlements in the occupied West Bank and...
- `KR7329180004` — **HD Hyundai Heavy** (HD Hyundai Heavy Industries, 329180) — flags: occ
  - https://investigate.info/company/hyundai-heavy-industries
  - The world's largest shipbuilding company and a major heavy equipment manufacturer. Its products are used to demolish homes and to construct illegal settlements in the occupied West Bank and Golan...
- `KR7009540006` — **HD Korea Shipbuilding** (HD Korea Shipbuilding & Offshore Engineering, 9540) — flags: occ
  - https://investigate.info/company/korea-shipbuilding
  - The parent company of HD Hyundai Heavy Industries, whose products are used to demolish homes and to construct illegal settlements in the occupied West Bank and Golan Heights.
- `KR7042670000` — **Hyundai Doosan Infracore** (Hyundai Doosan Infracore Co Ltd, 42670) — flags: occ
  - https://investigate.info/company/doosan
  - A subsidiary of Doosan and parent company of Bobcat, which makes construction equipment that has been used in the construction of the West Bank separation wall and infrastructure projects in...

## Canada (6)

- `CA05577W2004` — **BRP** (BRP Inc, DOO) — flags: occ
  - https://investigate.info/company/brp
  - A Canadian manufacturer of recreational vehicles that provides Can-Am all-terrain vehicles (ATVs) to the Israeli military.
- `CA3039011026` — **Fairfax Finl Hldgs** (Fairfax Financial Holdings Ltd, FFH) — flags: pri
  - https://investigate.info/company/fairfax-financial-holdings
  - A Canadian financial holding company. Its subsidiary Crum & Forster is the largest bail insurance company in the US.
- `CA74167P1080` — **Primo Water** (Primo Water Corp, PRMW) — flags: div, occ
  - https://investigate.info/company/primo-water
  - A Canadian multinational beverage and food service company (formerly Cott Corp). Its Israeli subsidiary Eden Springs extracts water from the occupied Golan Heights and is headquartered in an...
- `CA76131D1033` — **Restaurant Brands Intl** (Restaurant Brands International Inc, QSR) — flags: pri
  - https://investigate.info/company/rbi
  - One of the world's largest fast-food restaurant companies. It uses prison labor at its restaurants and has prison labor in its supply chain.
- `CA8849038085` — **Thomson Reuters** (Thomson Reuters Corp, TRI) — flags: div, pri, bor
  - https://investigate.info/company/thomson-reuters
  - A Canadian data broker and information services provider. It provides US immigration authorities with systems used to track and target immigrant communities and sells legal databases to prisons...
- `CA92938W2022` — **WSP Global** (WSP Global Inc, WSP) — flags: occ
  - https://investigate.info/company/wsp-global
  - WSP planned and designed the Jerusalem Light Rail, which connects illegal Israeli settlements in occupied East Jerusalem with the western part of the city, according to Who Profits.

## China (6)

- `CNE000000Q52` — **Adama** (Adama Ltd, 553) — flags: occ
  - https://investigate.info/company/adama
  - A Chinese-owned Israeli chemical pesticide manufacturer that supports agriculture in illegal Israeli settlements in the occupied West Bank and Golan Heights. Its products have also been used by...
- `CNE000001C99` — **Bright Dairy & Food Co** (Bright Dairy & Food Co Ltd, 600597) — flags: occ
  - https://investigate.info/company/bright-dairy-food-co
  - A Chinese-owned dairy company whose Israeli subsidiary, Tnuva, sources milk from illegal Israeli settlements in the occupied West Bank and Golan Heights.
- `HK0656038673` — **Fosun International** (Fosun International Ltd, 656) — flags: occ
  - https://investigate.info/company/fosun-international
  - A Chinese multinational conglomerate that owns AHAVA, which has a production site and visitor center in an illegal Israeli settlement, despite moving its operations outside of the occupied...
- `CNE100000PM8` — **Hangzhou Hik-Vision** (Hangzhou Hik-Vision Digital Technology Co Ltd, 2415) — flags: occ
  - https://investigate.info/company/hangzhou-hik-vision
  - A Chinese manufacturer of surveillance cameras and software, AI systems, access control technology, and other products. Its equipment is used to surveil Palestinians in the occupied West Bank and...
- `CNE100000SD1` — **JA Solar Technology Co** (JA Solar Technology Co Ltd, 2459) — flags: occ
  - https://investigate.info/company/ja-solar-technology
  - A Chinese manufacturer of solar energy systems. Provides solar panels for a solar farm in an illegal Israeli settlement in the occupied West Bank.
- `KYG8116S1057` — **Shunfeng Intl Clean** (Shunfeng International Clean Energy Ltd, 1165) — flags: div, occ
  - https://investigate.info/company/shunfeng-intl-clean
  - A Chinese solar energy company. Its solar panels are used in illegal Israeli settlements in the occupied West Bank and Golan Heights.

## Netherlands (3)

- `NL0000235190` — **Airbus** (Airbus SE, AIR) — flags: div, bor
  - https://investigate.info/company/airbus
  - A Dutch multinational military and aerospace company whose helicopters are used to monitor the US–Mexico border.
- `NL0000113652` — **Kardan** (Kardan NV, KRNV-M) — flags: div, occ
  - https://investigate.info/company/kardan
  - A Dutch investment company that develops and manages assets and projects in real estate and water infrastructure. Through its subsidiary TAHAL Group, the company has carried out multiple projects...
- `NL0000852523` — **TKH Group** (TKH Group NV, TWEKA) — flags: occ
  - https://investigate.info/company/tkh
  - A Dutch technology company whose surveillance cameras are used to surveil Palestinians in the occupied West Bank and by prison and police agencies worldwide.

## Sweden (3)

- `SE0017486889` — **Atlas Copco** (Atlas Copco AB, ATCO A) — flags: occ
  - https://investigate.info/company/atlas-copco
  - A Swedish multinational manufacturer of industrial tools and equipment. Some of its products were used in the construction of the Tel Aviv–Jerusalem railway, which cuts through the occupied West Bank.
- `SE0000526626` — **Micro Systemation** (Micro Systemation AB, MSAB B) — flags: pri, bor
  - https://investigate.info/company/msab
  - A Swedish data extraction firm that provides digital forensics tools to law enforcement and immigration authorities.
- `SE0000115420` — **Volvo** (Volvo AB, VOLV A) — flags: occ
  - https://investigate.info/company/volvo
  - A Swedish multinational manufacturer of trucks, buses, construction equipment, and industrial systems. Its vehicles and equipment have been used in demolitions of Palestinians' homes and in the...

## India (2)

- `INE175A01038` — **Jain Irrigation Systems** (Jain Irrigation Systems Ltd, 500219) — flags: occ
  - https://investigate.info/company/jain-irrigation-systems
  - An Indian multinational manufacturing company. Its subsidiary NaanDan Jain Irrigation carries out irrigation projects in and provides services to illegal Israeli settlements in the occupied West...
- `INE155A01022` — **Tata Motors** (Tata Motors Ltd, TATAMOTORS) — flags: occ
  - https://investigate.info/company/tata-motors
  - An Indian multinational automobile manufacturer that supplies Land Rover vehicles to the Israeli military for use in the occupied Palestinian territory.

## Italy (2)

- `IT0003856405` — **Leonardo** (Leonardo SpA, LDO) — flags: div, occ
  - https://investigate.info/company/leonardo
  - An Italian weapon manufacturer that provides the Israeli Navy with warship guns
- `US63905A2006` — **Natuzzi** (Natuzzi SPA, NTZ) — flags: occ
  - https://investigate.info/company/natuzzi
  - An Italian furniture manufacturer. Has a store in an illegal settlement in the occupied West Bank.

## Mexico (2)

- `MXP225611567` — **Cemex** (Cemex SAB de CV, CEMEXCPO) — flags: div, occ
  - https://investigate.info/company/cemex
  - A Mexican construction materials manufacturer. Has factories in the occupied West Bank and Golan Heights and provides building materials to construction projects in illegal settlements in the...
- `MX01OR010004` — **Orbia Advance Corp SAB** (Orbia Advance Corp SAB de CV, ORBIA) — flags: occ
  - https://investigate.info/company/orbia
  - A Mexican company (formerly Mexichem) that operates in the materials, agriculture, and infrastructure industries. Its Israeli subsidiary Netafim, a world leader in precision irrigation...

## Spain (2)

- `ES0121975009` — **CAF** (Construcciones y Auxiliar de Ferrocarriles SA, CAF) — flags: occ
  - https://investigate.info/company/caf
  - A Spanish manufacturer of railway vehicles and buses. It is involved in the construction, expansion, operation, and maintenance of the Jerusalem Light Rail, which is part of Israel's illegal...
- `LU1048328220` — **Edreams Odigeo** (Edreams Odigeo SA, EDR) — flags: occ
  - https://investigate.info/company/edreams-odigeo
  - One of the world’s largest digital travel companies. Listed rental properties in illegal Israeli settlements.

## Switzerland (2)

- `CH0012221716` — **ABB** (ABB Ltd, ABBN) — flags: occ
  - https://investigate.info/company/abb
  - A Swedish-Swiss multinational corporation that manufactures robotics, electrification equipment, and automation technology. Its equipment has been used at solar energy fields in the occupied West...
- `CH0010570767` — **Chocoladefabriken** (Chocoladefabriken Lindt & Spruengli AG, LISN) — flags: pri
  - https://investigate.info/company/lindt
  - A Swiss chocolate and confectionery company. Its American subsidiary Russell Stover uses prison labor.

## Belgium (1)

- `BE0003470755` — **Solvay** (Solvay SA, SOLB) — flags: occ
  - https://investigate.info/company/solvay
  - A Belgian multinational chemical company whose products were used in the construction of a water system for illegal settlements in the occupied West Bank.

## Czech Republic (1)

- `CZ0009008942` — **Colt CZ Group** (Colt CZ Group SE, CZG) — flags: div, occ, pri, bor
  - https://investigate.info/company/colt-cz-group
  - A manufacturer of firearms and ammunition for military, law enforcement, and commercial markets in Israel, the U.S., and around the world.

## Denmark (1)

- `DK0010244425` — **A. P. Moller Maersk** (A. P. Moller Maersk A/S, MAERSK B) — flags: occ
  - https://investigate.info/company/maersk
  - One of the world's largest shipping companies, Maersk is one of the main shippers of weapons and military equipment to Israel. It also ships for export products made in Israel's illegal...

## Ireland (1)

- `IE00B4BNMY34` — **Accenture** (Accenture PLC, ACN) — flags: bor
  - https://investigate.info/company/accenture
  - An Irish multinational professional services firm that provides technical and planning support to CBP and ICE.

## Norway (1)

- `NO0003043309` — **Kongsberg Gruppen** (Kongsberg Gruppen ASA, KOG) — flags: div, occ
  - https://investigate.info/company/kongsberg-gruppen
  - A Norwegian multinational company operating in the marine, weapons, aerospace, oil and gas, and utilities industries. Its subsidiary Kongsberg Defence & Aerospace owns 25% of Norwegian weapons...

## Poland (1)

- `PLSOFTB00016` — **Asseco Poland** (Asseco Poland SA, ACP) — flags: occ
  - https://investigate.info/company/asseco-poland
  - A Polish multinational software company that owns Formula Systems and Matrix IT, both of which provide multiple services to illegal Israeli settlements, the Israeli military, and the Israeli...
