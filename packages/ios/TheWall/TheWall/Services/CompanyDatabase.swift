import Foundation

/// Company database service
///
/// Loads the ALL.json database and provides efficient search and lookup operations.
/// Uses indices for O(1) domain lookups and efficient prefix searches by name.
final class CompanyDatabase {

    // MARK: - Properties

    /// All companies in the database
    let companies: [Company]

    /// Domain index for O(1) lookups (domain -> company)
    private let domainIndex: [String: Company]

    /// ID index for O(1) lookups (id -> company)
    private let idIndex: [String: Company]

    /// Name prefix index for efficient searching (normalized name prefix -> companies)
    private let nameIndex: [String: [Company]]

    // MARK: - Initialization

    private init(companies: [Company]) {
        self.companies = companies

        // Build domain index (website -> company)
        var domainMap: [String: Company] = [:]
        for company in companies {
            if let ws = company.website {
                domainMap[ws.lowercased()] = company
            }
        }
        self.domainIndex = domainMap

        // Build ID index
        var idMap: [String: Company] = [:]
        for company in companies {
            idMap[company.id.lowercased()] = company
        }
        self.idIndex = idMap

        // Build name prefix index (first 3 chars of each word)
        var nameMap: [String: [Company]] = [:]
        for company in companies {
            let words = company.name.lowercased().components(separatedBy: .whitespacesAndNewlines)
            for word in words where word.count >= 2 {
                let prefix = String(word.prefix(3))
                if nameMap[prefix] == nil {
                    nameMap[prefix] = []
                }
                nameMap[prefix]?.append(company)
            }

            // Also index the full normalized name
            let fullName = company.name.lowercased().replacingOccurrences(of: " ", with: "")
            if fullName.count >= 2 {
                let prefix = String(fullName.prefix(3))
                if nameMap[prefix] == nil {
                    nameMap[prefix] = []
                }
                if !(nameMap[prefix]?.contains(company) ?? false) {
                    nameMap[prefix]?.append(company)
                }
            }
        }
        self.nameIndex = nameMap
    }

    // MARK: - Factory Methods

    /// Loads the company database from a JSON file in the app bundle
    ///
    /// - Parameters:
    ///   - filename: The name of the JSON file (default: "ALL")
    ///   - bundle: The bundle to load from (default: .main)
    /// - Returns: A new CompanyDatabase instance
    /// - Throws: If the file cannot be loaded or parsed
    static func load(from filename: String = "ALL", bundle: Bundle = .main) throws -> CompanyDatabase {
        guard let url = bundle.url(forResource: filename, withExtension: "json") else {
            print("[CompanyDatabase] File not found: \(filename).json in bundle \(bundle.bundlePath)")
            print("[CompanyDatabase] Bundle resources: \(bundle.paths(forResourcesOfType: "json", inDirectory: nil))")
            throw DatabaseError.fileNotFound(filename: filename)
        }

        print("[CompanyDatabase] Loading from: \(url.path)")
        let data = try Data(contentsOf: url)
        print("[CompanyDatabase] Data size: \(data.count) bytes")

        let decoder = JSONDecoder()
        let companies = try decoder.decode([Company].self, from: data)
        print("[CompanyDatabase] Loaded \(companies.count) companies")

        return CompanyDatabase(companies: companies)
    }

    // MARK: - Search & Lookup

    /// Find a company by its exact domain
    ///
    /// - Parameter domain: The domain to look up (case-insensitive)
    /// - Returns: The company if found, nil otherwise
    func findByDomain(_ domain: String) -> Company? {
        let key = domain.lowercased()
        return domainIndex[key] ?? idIndex[key]
    }

    /// Search companies by name or domain
    ///
    /// - Parameter query: The search query
    /// - Returns: Companies matching the query, sorted by relevance
    func search(query: String) -> [Company] {
        guard !query.isEmpty else {
            return companies.sorted { $0.name < $1.name }
        }

        let normalizedQuery = query.lowercased()

        var results = Set<Company>()

        // 1. Exact domain match (highest priority)
        if let company = findByDomain(normalizedQuery) {
            results.insert(company)
        }

        // 2. Name prefix match (high priority)
        if normalizedQuery.count >= 2 {
            let prefix = String(normalizedQuery.prefix(3))
            if let prefixMatches = nameIndex[prefix] {
                for company in prefixMatches where company.name.lowercased().contains(normalizedQuery) {
                    results.insert(company)
                }
            }
        }

        // 3. Full-text search (lower priority)
        if results.count < 50 {
            for company in companies where results.count < 100 {
                if !results.contains(company) && company.searchText.contains(normalizedQuery) {
                    results.insert(company)
                }
            }
        }

        return results.sorted { $0.name < $1.name }
    }

    // MARK: - Errors

    enum DatabaseError: Error, LocalizedError {
        case fileNotFound(filename: String)
        case invalidFormat

        var errorDescription: String? {
            switch self {
            case .fileNotFound(let filename):
                return "Database file '\(filename).json' not found in bundle"
            case .invalidFormat:
                return "Database file has invalid format"
            }
        }
    }
}
