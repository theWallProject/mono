import XCTest
@testable import TheWall

/// Unit tests for CompanyDatabase service
final class CompanyDatabaseTests: XCTestCase {

    var sut: CompanyDatabase!

    override func setUpWithError() throws {
        try super.setUpWithError()

        // Load test database
        sut = try CompanyDatabase.load(from: "test-companies", bundle: Bundle(for: type(of: self)))
    }

    override func tearDownWithError() throws {
        sut = nil
        try super.tearDownWithError()
    }

    // MARK: - Loading Tests

    func testLoad_Success() throws {
        // Given/When: Database loaded in setUp
        // Then: Should have correct number of companies
        XCTAssertEqual(sut.companies.count, 5, "Should load all 5 test companies")
    }

    func testLoad_FileNotFound_ThrowsError() {
        // Given: Non-existent file
        // When: Attempt to load
        // Then: Should throw fileNotFound error
        XCTAssertThrowsError(try CompanyDatabase.load(from: "nonexistent", bundle: Bundle(for: type(of: self)))) { error in
            guard case CompanyDatabase.DatabaseError.fileNotFound = error else {
                XCTFail("Expected fileNotFound error, got \(error)")
                return
            }
        }
    }

    // MARK: - Find by Domain Tests

    func testFindByDomain_ExactMatch() {
        // Given: Database with facebook.com
        // When: Search by exact domain
        let result = sut.findByDomain("facebook.com")

        // Then: Should find Facebook
        XCTAssertNotNil(result, "Should find company by exact domain")
        XCTAssertEqual(result?.name, "Facebook")
        XCTAssertEqual(result?.domain, "facebook.com")
    }

    func testFindByDomain_CaseInsensitive() {
        // Given: Database with facebook.com
        // When: Search with different casing
        let result = sut.findByDomain("FACEBOOK.COM")

        // Then: Should find Facebook
        XCTAssertNotNil(result, "Domain search should be case-insensitive")
        XCTAssertEqual(result?.name, "Facebook")
    }

    func testFindByDomain_AlternativeDomain() {
        // Given: Facebook with alternative domain fb.com
        // When: Search by alternative domain
        let result = sut.findByDomain("fb.com")

        // Then: Should find Facebook
        XCTAssertNotNil(result, "Should find company by alternative domain")
        XCTAssertEqual(result?.name, "Facebook")
        XCTAssertEqual(result?.domain, "facebook.com")
    }

    func testFindByDomain_NotFound() {
        // Given: Database without example.com
        // When: Search for non-existent domain
        let result = sut.findByDomain("example.com")

        // Then: Should return nil
        XCTAssertNil(result, "Should return nil for non-existent domain")
    }

    // MARK: - Search Tests

    func testSearch_EmptyQuery_ReturnsAllSorted() {
        // Given: Database with 5 companies
        // When: Search with empty query
        let results = sut.search(query: "")

        // Then: Should return all companies sorted by name
        XCTAssertEqual(results.count, 5, "Empty query should return all companies")
        XCTAssertEqual(results.first?.name, "Coca-Cola", "Results should be sorted alphabetically")
    }

    func testSearch_NamePrefix_ReturnsMatches() {
        // Given: Database with multiple companies
        // When: Search by name prefix
        let results = sut.search(query: "Fac")

        // Then: Should find Facebook
        XCTAssertFalse(results.isEmpty, "Should find companies matching prefix")
        XCTAssertTrue(results.contains(where: { $0.name == "Facebook" }), "Should find Facebook")
    }

    func testSearch_NamePartial_ReturnsMatches() {
        // Given: Database with companies
        // When: Search by partial name
        let results = sut.search(query: "coca")

        // Then: Should find Coca-Cola
        XCTAssertFalse(results.isEmpty, "Should find companies with partial name match")
        XCTAssertTrue(results.contains(where: { $0.name == "Coca-Cola" }), "Should find Coca-Cola")
    }

    func testSearch_DomainMatch_ReturnsMatch() {
        // Given: Database with companies
        // When: Search by domain
        let results = sut.search(query: "intel.com")

        // Then: Should find Intel
        XCTAssertFalse(results.isEmpty, "Should find company by domain")
        XCTAssertEqual(results.first?.name, "Intel Corporation")
    }

    func testSearch_CaseInsensitive() {
        // Given: Database with Facebook
        // When: Search with different casing
        let results = sut.search(query: "FACEBOOK")

        // Then: Should find Facebook
        XCTAssertFalse(results.isEmpty, "Search should be case-insensitive")
        XCTAssertTrue(results.contains(where: { $0.name == "Facebook" }))
    }

    func testSearch_NoMatches_ReturnsEmpty() {
        // Given: Database
        // When: Search for non-existent company
        let results = sut.search(query: "nonexistent")

        // Then: Should return empty array
        XCTAssertTrue(results.isEmpty, "Should return empty array when no matches")
    }

    // MARK: - Index Performance Tests

    func testDomainIndex_O1Lookup() {
        // Given: Database with 5 companies
        // When: Perform multiple lookups
        measure {
            for _ in 0..<1000 {
                _ = sut.findByDomain("facebook.com")
                _ = sut.findByDomain("intel.com")
                _ = sut.findByDomain("mcdonalds.com")
            }
        }

        // Then: Should complete quickly (O(1) average case)
        // Performance test validates index efficiency
    }

    // MARK: - Company Model Tests

    func testCompany_AllDomains_IncludesAlternatives() {
        // Given: Facebook with alternative domains
        guard let facebook = sut.findByDomain("facebook.com") else {
            XCTFail("Should find Facebook")
            return
        }

        // When: Get all domains
        let allDomains = facebook.allDomains

        // Then: Should include primary and alternatives
        XCTAssertTrue(allDomains.contains("facebook.com"), "Should include primary domain")
        XCTAssertTrue(allDomains.contains("fb.com"), "Should include alternative domain fb.com")
        XCTAssertTrue(allDomains.contains("meta.com"), "Should include alternative domain meta.com")
        XCTAssertEqual(allDomains.count, 3, "Should have all 3 domains")
    }

    func testCompany_CompanyReasons_ParsesCorrectly() {
        // Given: Facebook with reasons h and f
        guard let facebook = sut.findByDomain("facebook.com") else {
            XCTFail("Should find Facebook")
            return
        }

        // When: Get parsed reasons
        let reasons = facebook.companyReasons

        // Then: Should have correct reasons
        XCTAssertEqual(reasons.count, 2, "Facebook should have 2 reasons")
        XCTAssertTrue(reasons.contains(.humanitarian), "Should have humanitarian reason")
        XCTAssertTrue(reasons.contains(.funding), "Should have funding reason")
    }

    func testCompany_SearchText_IncludesNameAndDomain() {
        // Given: Facebook company
        guard let facebook = sut.findByDomain("facebook.com") else {
            XCTFail("Should find Facebook")
            return
        }

        // When: Get search text
        let searchText = facebook.searchText

        // Then: Should include name and domains in lowercase
        XCTAssertTrue(searchText.contains("facebook"), "Search text should include name")
        XCTAssertTrue(searchText.contains("facebook.com"), "Search text should include primary domain")
        XCTAssertTrue(searchText.contains("fb.com"), "Search text should include alternative domains")
    }

    // MARK: - Data Integrity Tests

    func testAllCompanies_HaveRequiredFields() {
        // Given: All companies in database
        // When: Check each company
        for company in sut.companies {
            // Then: Should have required fields
            XCTAssertFalse(company.domain.isEmpty, "Company \(company.name) should have domain")
            XCTAssertFalse(company.name.isEmpty, "Company should have name")
            XCTAssertFalse(company.reasons.isEmpty, "Company \(company.name) should have at least one reason")
        }
    }
}
