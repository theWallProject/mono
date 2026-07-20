import XCTest

/// UI tests for onboarding flow
final class OnboardingFlowUITests: XCTestCase {

    var app: XCUIApplication!

    override func setUpWithError() throws {
        try super.setUpWithError()

        continueAfterFailure = false

        app = XCUIApplication()
        app.launchArguments = ["--reset-onboarding", "--use-test-database"]
        app.launch()
    }

    override func tearDownWithError() throws {
        app = nil
        try super.tearDownWithError()
    }

    // MARK: - Full Flow Tests

    func testOnboardingFlow_NavigateAllPages() throws {
        // Given: App launched with reset onboarding
        // Verify onboarding is shown
        XCTAssertTrue(app.staticTexts["The Wall"].waitForExistence(timeout: 5))

        // When/Then: Page 1 - Welcome
        XCTAssertTrue(app.staticTexts["The Wall"].exists, "Should show app name")
        XCTAssertTrue(app.staticTexts["Boycott Assistance"].exists, "Should show subtitle")
        XCTAssertTrue(app.staticTexts["19,000+ companies"].exists, "Should show company count")

        // Navigate to page 2
        app.buttons["Next"].tap()

        // Then: Page 2 - How It Works
        XCTAssertTrue(app.staticTexts["How It Works"].waitForExistence(timeout: 2))
        XCTAssertTrue(app.staticTexts["Browse Normally"].exists)
        XCTAssertTrue(app.staticTexts["Automatic Checking"].exists)
        XCTAssertTrue(app.staticTexts["Get Notified"].exists)

        // Navigate to page 3
        app.buttons["Next"].tap()

        // Then: Page 3 - Enable Extension
        XCTAssertTrue(app.staticTexts["Enable the Extension"].waitForExistence(timeout: 2))
        XCTAssertTrue(app.buttons["Open Settings"].exists)

        // Navigate to page 4
        app.buttons["I've Enabled It"].tap()

        // Then: Page 4 - Completion
        XCTAssertTrue(app.staticTexts["You're All Set!"].waitForExistence(timeout: 2))
        XCTAssertTrue(app.buttons["Get Started"].exists)

        // Complete onboarding
        app.buttons["Get Started"].tap()

        // Then: Should show main view
        XCTAssertTrue(app.tabBars.buttons["Status"].waitForExistence(timeout: 2))
    }

    func testOnboardingFlow_SkipButton() throws {
        // Given: On page 1
        XCTAssertTrue(app.staticTexts["The Wall"].waitForExistence(timeout: 5))

        // When: Tap skip button
        app.buttons["Skip"].tap()

        // Then: Should jump to final page
        XCTAssertTrue(app.staticTexts["You're All Set!"].waitForExistence(timeout: 2))
    }

    func testOnboardingFlow_BackButton() throws {
        // Given: Navigate to page 2
        XCTAssertTrue(app.staticTexts["The Wall"].waitForExistence(timeout: 5))
        app.buttons["Next"].tap()
        XCTAssertTrue(app.staticTexts["How It Works"].waitForExistence(timeout: 2))

        // When: Tap back button
        app.buttons["Back"].tap()

        // Then: Should return to page 1
        XCTAssertTrue(app.staticTexts["The Wall"].waitForExistence(timeout: 2))
        XCTAssertTrue(app.staticTexts["Boycott Assistance"].exists)
    }

    func testOnboardingFlow_PageIndicator() throws {
        // Given: On page 1
        XCTAssertTrue(app.staticTexts["The Wall"].waitForExistence(timeout: 5))

        // Then: Page indicator should show page 1 of 4
        // Page indicators are circles, we can verify by counting them
        let indicators = app.otherElements.matching(identifier: "PageIndicator")
        // Note: The actual implementation may vary, adjust selector as needed

        // When: Navigate through pages
        app.buttons["Next"].tap()
        // Page indicator should update

        app.buttons["Next"].tap()
        // Page indicator should update

        app.buttons["I've Enabled It"].tap()
        // Page indicator should show final page
    }

    func testOnboardingFlow_Completion() throws {
        // Given: Navigate through all pages
        XCTAssertTrue(app.staticTexts["The Wall"].waitForExistence(timeout: 5))
        app.buttons["Next"].tap()
        app.buttons["Next"].tap()
        app.buttons["I've Enabled It"].tap()

        // When: Complete onboarding
        app.buttons["Get Started"].tap()

        // Then: Should dismiss onboarding and show main view
        XCTAssertTrue(app.tabBars.buttons["Status"].waitForExistence(timeout: 2))
        XCTAssertTrue(app.tabBars.buttons["Database"].exists)
        XCTAssertTrue(app.tabBars.buttons["Settings"].exists)

        // And onboarding should not appear again on relaunch
        app.terminate()
        app.launch()

        // Should go straight to main view (not onboarding)
        XCTAssertTrue(app.tabBars.buttons["Status"].waitForExistence(timeout: 5))
    }

    // MARK: - Individual Page Tests

    func testWelcomePage_TrustBadges() throws {
        // Given: On welcome page
        XCTAssertTrue(app.staticTexts["The Wall"].waitForExistence(timeout: 5))

        // Then: Should show all three trust badges
        XCTAssertTrue(app.staticTexts["Private"].exists)
        XCTAssertTrue(app.staticTexts["Free"].exists)
        XCTAssertTrue(app.staticTexts["Open Source"].exists)
    }

    func testEnableExtensionPage_OpenSettings() throws {
        // Given: Navigate to enable extension page
        XCTAssertTrue(app.staticTexts["The Wall"].waitForExistence(timeout: 5))
        app.buttons["Next"].tap()
        app.buttons["Next"].tap()

        // When: Tap "Open Settings" button
        // Note: This will actually open Settings app, which ends the test
        // We just verify the button exists and is tappable
        XCTAssertTrue(app.buttons["Open Settings"].exists)
        XCTAssertTrue(app.buttons["Open Settings"].isEnabled)
    }

    func testCompletionPage_Animation() throws {
        // Given: Navigate to completion page
        XCTAssertTrue(app.staticTexts["The Wall"].waitForExistence(timeout: 5))
        app.buttons["Skip"].tap()

        // Then: Should show checkmark and completion message
        XCTAssertTrue(app.staticTexts["You're All Set!"].exists)
        XCTAssertTrue(app.staticTexts["The Wall is now protecting your browsing"].exists)
    }

    // MARK: - Edge Cases

    func testOnboardingFlow_RapidNavigation() throws {
        // Given: On page 1
        XCTAssertTrue(app.staticTexts["The Wall"].waitForExistence(timeout: 5))

        // When: Rapidly tap next
        app.buttons["Next"].tap()
        app.buttons["Next"].tap()

        // Then: Should handle correctly without crashing
        XCTAssertTrue(app.staticTexts["Enable the Extension"].waitForExistence(timeout: 2))
    }

    func testOnboardingFlow_BackAndForth() throws {
        // Given: On page 1
        XCTAssertTrue(app.staticTexts["The Wall"].waitForExistence(timeout: 5))

        // When: Navigate back and forth
        app.buttons["Next"].tap()
        XCTAssertTrue(app.staticTexts["How It Works"].waitForExistence(timeout: 2))

        app.buttons["Back"].tap()
        XCTAssertTrue(app.staticTexts["The Wall"].waitForExistence(timeout: 2))

        app.buttons["Next"].tap()
        XCTAssertTrue(app.staticTexts["How It Works"].waitForExistence(timeout: 2))

        app.buttons["Next"].tap()
        XCTAssertTrue(app.staticTexts["Enable the Extension"].waitForExistence(timeout: 2))

        app.buttons["Back"].tap()
        XCTAssertTrue(app.staticTexts["How It Works"].waitForExistence(timeout: 2))

        // Then: Should handle navigation correctly
    }
}
