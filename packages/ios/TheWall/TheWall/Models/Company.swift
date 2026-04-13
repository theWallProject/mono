import Foundation

/// A company entry from The Wall database
///
/// This model matches the structure of entries in ALL.json.
/// Each company has a name, ID, reasons for flagging, and optional metadata.
struct Company: Codable, Identifiable, Hashable {

    /// Unique slug identifier
    let id: String

    /// Company name
    let name: String

    /// Reasons why this company is flagged
    let reasons: [String]

    /// Website domain (e.g., "example.com")
    let website: String?

    /// Facebook handle
    let facebook: String?

    /// Instagram handle
    let instagram: String?

    /// LinkedIn handle or ID
    let linkedin: String?

    /// Twitter/X handle
    let twitter: String?

    /// GitHub handle
    let github: String?

    /// Threads handle
    let threads: String?

    /// TikTok handle
    let tiktok: String?

    /// YouTube channel ID
    let youtubeChannel: String?

    /// YouTube page/user
    let youtubePage: String?

    /// Stock ticker symbol
    let stockTicker: String?

    /// Suggested alternative companies
    let alternatives: [Alternative]?

    // MARK: - Coding Keys

    enum CodingKeys: String, CodingKey {
        case id
        case name = "n"
        case reasons = "r"
        case website = "ws"
        case facebook = "fb"
        case instagram = "ig"
        case linkedin = "li"
        case twitter = "tw"
        case github = "gh"
        case threads = "th"
        case tiktok = "tt"
        case youtubeChannel = "ytc"
        case youtubePage = "ytp"
        case stockTicker = "s"
        case alternatives = "alt"
    }

    // MARK: - Computed Properties

    /// Display domain (website if available, otherwise ID slug)
    var domain: String {
        website ?? id
    }

    /// Parsed CompanyReason objects
    var companyReasons: [CompanyReason] {
        reasons.compactMap { CompanyReason(rawValue: $0) }
    }

    /// Social media handles as a dictionary for display
    var social: [String: String] {
        var result: [String: String] = [:]
        if let v = facebook { result["Facebook"] = v }
        if let v = instagram { result["Instagram"] = v }
        if let v = linkedin { result["LinkedIn"] = v }
        if let v = twitter { result["Twitter"] = v }
        if let v = github { result["GitHub"] = v }
        if let v = threads { result["Threads"] = v }
        if let v = tiktok { result["TikTok"] = v }
        if let v = youtubeChannel { result["YouTube"] = v }
        else if let v = youtubePage { result["YouTube"] = v }
        return result
    }

    /// Search text (for filtering)
    var searchText: String {
        "\(name.lowercased()) \(domain.lowercased()) \(id.lowercased())"
    }

    // MARK: - Hashable

    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }

    static func == (lhs: Company, rhs: Company) -> Bool {
        lhs.id == rhs.id
    }
}

// MARK: - Alternative

/// An alternative company suggestion
struct Alternative: Codable, Hashable {

    /// Alternative company name
    let name: String

    /// Alternative company website
    let website: String

    enum CodingKeys: String, CodingKey {
        case name = "n"
        case website = "ws"
    }
}
