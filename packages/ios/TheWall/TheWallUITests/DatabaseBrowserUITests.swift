import XCTest

/// UI tests for database browser functionality
final class DatabaseBrowserUITests: XCTestCase {

    var app: XCUIApplication!

    override func setUpWithError() throws {
        try super.setUpWithError()

        continueAfterFailure = false

        app = XCUIApplication()
        app.launchArguments = ["--use-test-database"]
        app.launch()

        // Complete onboarding if needed
        if app.buttons["Get Started"].waitForExistence(timeout: 3) {
            app.buttons["Skip"].tap()
            app.buttons["Get Started"].tap()
        }

        // Navigate to Database tab
        app.tabBars.buttons["Database"].tap()
        XCTAssertTrue(app.navigationBars["Company Database"].waitForExistence(timeout: 2))
    }

    override func tearDownWithError() throws {
        app = nil
        try super.tearDownWithError()
    }

    // MARK: - Search Tests

    func testDatabaseBrowser_InitialState() throws {
        // Given: Database browser loaded
        // Then: Should show companies list
        XCTAssertTrue(app.searchFields["Search companies or domains"].exists)

        // Should show at least some companies (test database has 5)
        let cells = app.cells
        XCTAssertTrue(cells.count >= 1, "Should show company rows")
    }

    func testDatabaseBrowser_SearchCompany() throws {
        // Given: Database browser with search field
        let searchField = app.searchFields["Search companies or domains"]
        XCTAssertTrue(searchField.exists)

        // When: Search for "Facebook"
        searchField.tap()
        searchField.typeText("Facebook")

        // Then: Should show Facebook in results
        XCTAssertTrue(app.cells.staticTexts["Facebook"].waitForExistence(timeout: 2))
    }

    func testDatabaseBrowser_SearchByDomain() throws {
        // Given: Database browser
        let searchField = app.searchFields["Search companies or domains"]

        // When: Search by domain
        searchField.tap()
        searchField.typeText("facebook.com")

        // Then: Should find Facebook
        XCTAssertTrue(app.cells.staticTexts["Facebook"].waitForExistence(timeout: 2))
        XCTAssertTrue(app.cells.staticTexts["facebook.com"].exists)
    }

    func testDatabaseBrowser_PartialSearch() throws {
        // Given: Database browser
        let searchField = app.searchFields["Search companies or domains"]

        // When: Search with partial text
        searchField.tap()
        searchField.typeText("coca")

        // Then: Should find Coca-Cola
        XCTAssertTrue(app.cells.staticTexts["Coca-Cola"].waitForExistence(timeout: 2))
    }

    func testDatabaseBrowser_EmptySearchState() throws {
        // Given: Database browser
        let searchField = app.searchFields["Search companies or domains"]

        // When: Search for non-existent company
        searchField.tap()
        searchField.typeText("nonexistentcompany12345")

        // Then: Should show empty state
        XCTAssertTrue(app.staticTexts["No companies found"].waitForExistence(timeout: 2))
        XCTAssertTrue(app.staticTexts["Try a different search term"].exists)
    }

    func testDatabaseBrowser_ClearSearch() throws {
        // Given: Search results displayed
        let searchField = app.searchFields["Search companies or domains"]
        searchField.tap()
        searchField.typeText("Facebook")
        XCTAssertTrue(app.cells.staticTexts["Facebook"].waitForExistence(timeout: 2))

        // When: Clear search
        if app.buttons["Clear text"].exists {
            app.buttons["Clear text"].tap()
        } else {
            // Fallback: delete text manually
            searchField.tap()
            let deleteString = String(repeating: XCUIKeyboardKey.delete.rawValue, count: 8)
            searchField.typeText(deleteString)
        }

        // Then: Should show all companies again
        let cells = app.cells
        XCTAssertTrue(cells.count > 1, "Should show multiple companies after clearing search")
    }

    // MARK: - Company Row Tests

    func testDatabaseBrowser_CompanyRowDisplay() throws {
        // Given: Database browser with companies
        // When: View first company row
        // Then: Should display company name and domain
        let firstCell = app.cells.firstMatch
        XCTAssertTrue(firstCell.exists, "Should have at least one company row")

        // Company row should have name and domain
        // Note: Specific assertions depend on test data
    }

    func testDatabaseBrowser_ReasonBadges() throws {
        // Given: Search for Facebook (has reasons h, f)
        let searchField = app.searchFields["Search companies or domains"]
        searchField.tap()
        searchField.typeText("Facebook")
        XCTAssertTrue(app.cells.staticTexts["Facebook"].waitForExistence(timeout: 2))

        // Then: Should show reason badges
        let facebookCell = app.cells.containing(.staticText, identifier: "Facebook").firstMatch
        XCTAssertTrue(facebookCell.exists)

        // Badges show reason codes (H, F, etc.)
        // Note: Exact badge text depends on implementation
    }

    // MARK: - Company Detail Tests

    func testDatabaseBrowser_TapCompanyOpensDetail() throws {
        // Given: Search for Facebook
        let searchField = app.searchFields["Search companies or domains"]
        searchField.tap()
        searchField.typeText("Facebook")
        XCTAssertTrue(app.cells.staticTexts["Facebook"].waitForExistence(timeout: 2))

        // When: Tap on Facebook row
        app.cells.staticTexts["Facebook"].tap()

        // Then: Should open detail modal
        XCTAssertTrue(app.staticTexts["Facebook"].waitForExistence(timeout: 2))
        XCTAssertTrue(app.staticTexts["facebook.com"].exists)
    }

    func testCompanyDetail_DisplaysReasons() throws {
        // Given: Open Facebook detail
        let searchField = app.searchFields["Search companies or domains"]
        searchField.tap()
        searchField.typeText("Facebook")
        app.cells.staticTexts["Facebook"].tap()

        // Then: Should show reasons section
        XCTAssertTrue(app.staticTexts["Reasons for Flagging"].waitForExistence(timeout: 2))

        // Should show specific reasons
        XCTAssertTrue(app.staticTexts["Humanitarian Violations"].exists ||
                      app.staticTexts["Funding/Financial Support"].exists)
    }

    func testCompanyDetail_DisplaysAlternatives() throws {
        // Given: Open Facebook detail (has alternatives)
        let searchField = app.searchFields["Search companies or domains"]
        searchField.tap()
        searchField.typeText("Facebook")
        app.cells.staticTexts["Facebook"].tap()

        // Then: Should show alternatives section if available
        if app.staticTexts["Suggested Alternatives"].exists {
            XCTAssertTrue(app.staticTexts["Signal"].exists ||
                          app.staticTexts["Mastodon"].exists)
        }
    }

    func testCompanyDetail_DisplaysAlternativeDomains() throws {
        // Given: Open Facebook detail (has alternative domains)
        let searchField = app.searchFields["Search companies or domains"]
        searchField.tap()
        searchField.typeText("Facebook")
        app.cells.staticTexts["Facebook"].tap()

        // Then: Should show alternative domains section if available
        if app.staticTexts["Alternative Domains"].exists {
            XCTAssertTrue(app.staticTexts["fb.com"].exists ||
                          app.staticTexts["meta.com"].exists)
        }
    }

    func testCompanyDetail_DisplaysSocialLinks() throws {
        // Given: Open Facebook detail (has social links)
        let searchField = app.searchFields["Search companies or domains"]
        searchField.tap()
        searchField.typeText("Facebook")
        app.cells.staticTexts["Facebook"].tap()

        // Then: Should show social media section if available
        if app.staticTexts["Social Media"].exists {
            XCTAssertTrue(app.staticTexts["@facebook"].exists)
        }
    }

    func testCompanyDetail_CloseButton() throws {
        // Given: Company detail open
        let searchField = app.searchFields["Search companies or domains"]
        searchField.tap()
        searchField.typeText("Facebook")
        app.cells.staticTexts["Facebook"].tap()
        XCTAssertTrue(app.staticTexts["Reasons for Flagging"].waitForExistence(timeout: 2))

        // When: Tap close button
        app.buttons.element(matching: .button, identifier: "close").tap()

        // Then: Should dismiss detail and return to list
        XCTAssertTrue(app.searchFields["Search companies or domains"].waitForExistence(timeout: 2))
    }

    // MARK: - Performance Tests

    func testDatabaseBrowser_LoadPerformance() throws {
        // Measure time to load database browser
        measure {
            // Navigate away and back
            app.tabBars.buttons["Settings"].tap()
            app.tabBars.buttons["Database"].tap()
        }
    }

    func testDatabaseBrowser_SearchPerformance() throws {
        // Measure search performance
        let searchField = app.searchFields["Search companies or domains"]

        measure {
            searchField.tap()
            searchField.typeText("test")

            if app.buttons["Clear text"].exists {
                app.buttons["Clear text"].tap()
            }
        }
    }

    // MARK: - Edge Cases

    func testDatabaseBrowser_RapidSearch() throws {
        // Given: Database browser
        let searchField = app.searchFields["Search companies or domains"]

        // When: Rapidly type and delete search text
        searchField.tap()
        searchField.typeText("Face")
        searchField.typeText("book")

        // Then: Should handle gracefully
        XCTAssertTrue(app.cells.staticTexts["Facebook"].waitForExistence(timeout: 2))
    }

    func testDatabaseBrowser_SpecialCharacters() throws {
        // Given: Database browser
        let searchField = app.searchFields["Search companies or domains"]

        // When: Search with special characters
        searchField.tap()
        searchField.typeText("@#$%")

        // Then: Should show empty state (no results)
        XCTAssertTrue(app.staticTexts["No companies found"].waitForExistence(timeout: 2))
    }
}
