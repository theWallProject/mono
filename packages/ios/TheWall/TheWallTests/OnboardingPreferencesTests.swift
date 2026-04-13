import XCTest
@testable import TheWall

/// Unit tests for OnboardingPreferences service
final class OnboardingPreferencesTests: XCTestCase {

    var sut: OnboardingPreferences!
    var mockUserDefaults: UserDefaults!

    override func setUpWithError() throws {
        try super.setUpWithError()

        // Use in-memory UserDefaults for testing
        mockUserDefaults = UserDefaults(suiteName: "test.onboarding.\(UUID().uuidString)")!
        sut = OnboardingPreferences(userDefaults: mockUserDefaults)
    }

    override func tearDownWithError() throws {
        // Clean up
        mockUserDefaults.removeSuite(named: mockUserDefaults.suiteName)
        mockUserDefaults = nil
        sut = nil

        try super.tearDownWithError()
    }

    // MARK: - Initial State Tests

    func testInitialState_NotCompleted() {
        // Given: Fresh OnboardingPreferences instance
        // When: Check completion state
        let hasCompleted = sut.hasCompletedOnboarding

        // Then: Should not be completed
        XCTAssertFalse(hasCompleted, "Onboarding should not be completed initially")
    }

    // MARK: - Mark as Complete Tests

    func testMarkAsComplete_SetsFlag() {
        // Given: Fresh OnboardingPreferences
        XCTAssertFalse(sut.hasCompletedOnboarding)

        // When: Mark as complete
        sut.markAsComplete()

        // Then: Should be completed
        XCTAssertTrue(sut.hasCompletedOnboarding, "Onboarding should be marked as completed")
    }

    func testMarkAsComplete_PersistsAcrossInstances() {
        // Given: OnboardingPreferences marked as complete
        sut.markAsComplete()

        // When: Create new instance with same UserDefaults
        let newInstance = OnboardingPreferences(userDefaults: mockUserDefaults)

        // Then: Should still be completed
        XCTAssertTrue(newInstance.hasCompletedOnboarding, "Completion state should persist across instances")
    }

    // MARK: - Reset Tests

    func testReset_ClearsFlag() {
        // Given: Completed onboarding
        sut.markAsComplete()
        XCTAssertTrue(sut.hasCompletedOnboarding)

        // When: Reset
        sut.reset()

        // Then: Should not be completed
        XCTAssertFalse(sut.hasCompletedOnboarding, "Reset should clear completion flag")
    }

    func testReset_PersistsAcrossInstances() {
        // Given: Completed onboarding that is then reset
        sut.markAsComplete()
        sut.reset()

        // When: Create new instance
        let newInstance = OnboardingPreferences(userDefaults: mockUserDefaults)

        // Then: Should not be completed
        XCTAssertFalse(newInstance.hasCompletedOnboarding, "Reset should persist across instances")
    }

    // MARK: - Edge Cases

    func testMultipleMarkAsComplete_Idempotent() {
        // Given: OnboardingPreferences
        // When: Mark as complete multiple times
        sut.markAsComplete()
        sut.markAsComplete()
        sut.markAsComplete()

        // Then: Should still be completed (no side effects)
        XCTAssertTrue(sut.hasCompletedOnboarding, "Multiple markAsComplete calls should be idempotent")
    }

    func testMultipleReset_Idempotent() {
        // Given: Completed onboarding
        sut.markAsComplete()

        // When: Reset multiple times
        sut.reset()
        sut.reset()
        sut.reset()

        // Then: Should still be not completed
        XCTAssertFalse(sut.hasCompletedOnboarding, "Multiple reset calls should be idempotent")
    }

    func testResetWithoutCompletion_NoError() {
        // Given: Never completed onboarding
        XCTAssertFalse(sut.hasCompletedOnboarding)

        // When: Reset without completion
        sut.reset()

        // Then: Should not throw or cause issues
        XCTAssertFalse(sut.hasCompletedOnboarding, "Reset without prior completion should not cause issues")
    }
}
