import Foundation

/// Reasons why a company is flagged in The Wall database
///
/// Maps to the reason codes in ALL.json:
/// - h: Headquartered in Israel
/// - f: Founder/financial connection to Israel
/// - i: Investor connection to Israel
/// - BDS_PRIO: BDS Priority boycott target
/// - BDS_PRESSURE: BDS Pressure/divestment target
/// - BDS_GRASS: BDS Grassroots boycott target
/// - b: General BDS list (legacy)
/// - u: Israeli domain (.il)
enum CompanyReason: String, Codable, CaseIterable, Hashable {
    case headquartered = "h"
    case founder = "f"
    case investor = "i"
    case bdsPriority = "BDS_PRIO"
    case bdsPressure = "BDS_PRESSURE"
    case bdsGrassroots = "BDS_GRASS"
    case bds = "b"
    case israeliDomain = "u"

    /// Localized description for display in the UI
    var localizedDescription: String {
        switch self {
        case .headquartered:
            return String(localized: "reason.headquartered", defaultValue: "Headquartered in Israel")
        case .founder:
            return String(localized: "reason.founder", defaultValue: "Founder Connected to Israel")
        case .investor:
            return String(localized: "reason.investor", defaultValue: "Investor Connected to Israel")
        case .bdsPriority:
            return String(localized: "reason.bdsPriority", defaultValue: "BDS Priority Boycott Target")
        case .bdsPressure:
            return String(localized: "reason.bdsPressure", defaultValue: "BDS Pressure/Divestment Target")
        case .bdsGrassroots:
            return String(localized: "reason.bdsGrassroots", defaultValue: "BDS Grassroots Boycott Target")
        case .bds:
            return String(localized: "reason.bds", defaultValue: "BDS Boycott List")
        case .israeliDomain:
            return String(localized: "reason.israeliDomain", defaultValue: "Israeli Website (.il domain)")
        }
    }

    /// SF Symbol icon name for the reason
    var iconName: String {
        switch self {
        case .headquartered:
            return "building.2"
        case .founder:
            return "person.fill"
        case .investor:
            return "dollarsign.circle"
        case .bdsPriority, .bdsPressure, .bdsGrassroots, .bds:
            return "hand.raised"
        case .israeliDomain:
            return "globe"
        }
    }
}
