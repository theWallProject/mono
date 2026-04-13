import XCTest
import Combine
@testable import TheWall

/// Unit tests for ExtensionActivityChecker service
final class ExtensionActivityCheckerTests: XCTestCase {

    var sut: ExtensionActivityChecker!
    var mockUserDefaults: UserDefaults!
    var cancellables: Set<AnyCancellable>!

    override func setUpWithError() throws {
        try super.setUpWithError()

        // Use in-memory UserDefaults for testing
        mockUserDefaults = UserDefaults(suiteName: "test.extension.\(UUID().uuidString)")!
        cancellables = []

        // Create SUT with mock shared UserDefaults
        sut = ExtensionActivityChecker()

        // Inject mock UserDefaults (requires modification of ExtensionActivityChecker to accept UserDefaults)
        // For now, we'll test via the shared UserDefaults behavior
    }

    override func tearDownWithError() throws {
        cancellables = nil
        mockUserDefaults.removeSuite(named: mockUserDefaults.suiteName)
        mockUserDefaults = nil
        sut = nil

        try super.tearDownWithError()
    }

    // MARK: - Initial State Tests

    func testCheck_NoActivity_NilLastActive() {
        // Given: No extension activity recorded
        let appGroupDefaults = UserDefaults(suiteName: "group.com.techforpalestine.thewalladdon")!
        appGroupDefaults.removeObject(forKey: "extensionLastActive")

        // When: Check activity
        sut.check()

        // Then: Should have nil lastActive and not likely active
        XCTAssertNil(sut.lastActive, "Should have nil lastActive when no activity")
        XCTAssertFalse(sut.isLikelyActive, "Should not be likely active when no activity")
    }

    func testCheck_RecentActivity_IsLikelyActive() {
        // Given: Recent extension activity (10 minutes ago)
        let appGroupDefaults = UserDefaults(suiteName: "group.com.techforpalestine.thewalladdon")!
        let recentTimestamp = Date().addingTimeInterval(-10 * 60).timeIntervalSince1970
        appGroupDefaults.set(recentTimestamp, forKey: "extensionLastActive")

        // When: Check activity
        sut.check()

        // Then: Should be likely active
        XCTAssertNotNil(sut.lastActive, "Should have lastActive timestamp")
        XCTAssertTrue(sut.isLikelyActive, "Should be likely active for recent activity")
    }

    func testCheck_StaleActivity_NotLikelyActive() {
        // Given: Stale extension activity (25 hours ago)
        let appGroupDefaults = UserDefaults(suiteName: "group.com.techforpalestine.thewalladdon")!
        let staleTimestamp = Date().addingTimeInterval(-25 * 60 * 60).timeIntervalSince1970
        appGroupDefaults.set(staleTimestamp, forKey: "extensionLastActive")

        // When: Check activity
        sut.check()

        // Then: Should not be likely active
        XCTAssertNotNil(sut.lastActive, "Should have lastActive timestamp")
        XCTAssertFalse(sut.isLikelyActive, "Should not be likely active for stale activity")
    }

    func testCheck_EdgeCase_Exactly24Hours_IsLikelyActive() {
        // Given: Activity exactly 24 hours ago (just within threshold)
        let appGroupDefaults = UserDefaults(suiteName: "group.com.techforpalestine.thewalladdon")!
        let exactThresholdTimestamp = Date().addingTimeInterval(-23.99 * 60 * 60).timeIntervalSince1970
        appGroupDefaults.set(exactThresholdTimestamp, forKey: "extensionLastActive")

        // When: Check activity
        sut.check()

        // Then: Should still be likely active
        XCTAssertTrue(sut.isLikelyActive, "Should be likely active when just within 24-hour threshold")
    }

    // MARK: - Status Message Tests

    func testStatusMessage_NoActivity() {
        // Given: No extension activity
        let appGroupDefaults = UserDefaults(suiteName: "group.com.techforpalestine.thewalladdon")!
        appGroupDefaults.removeObject(forKey: "extensionLastActive")
        sut.check()

        // When: Get status message
        let message = sut.statusMessage

        // Then: Should indicate unknown status
        XCTAssertEqual(message, "Extension status unknown", "Should show unknown status message")
    }

    func testStatusMessage_RecentActivity() {
        // Given: Recent activity
        let appGroupDefaults = UserDefaults(suiteName: "group.com.techforpalestine.thewalladdon")!
        let recentTimestamp = Date().addingTimeInterval(-5 * 60).timeIntervalSince1970
        appGroupDefaults.set(recentTimestamp, forKey: "extensionLastActive")
        sut.check()

        // When: Get status message
        let message = sut.statusMessage

        // Then: Should show relative time
        XCTAssertTrue(message.contains("Active"), "Should indicate active status")
        XCTAssertTrue(message.contains("ago") || message.contains("minute"), "Should include relative time")
    }

    func testStatusMessage_StaleActivity() {
        // Given: Stale activity
        let appGroupDefaults = UserDefaults(suiteName: "group.com.techforpalestine.thewalladdon")!
        let staleTimestamp = Date().addingTimeInterval(-30 * 60 * 60).timeIntervalSince1970
        appGroupDefaults.set(staleTimestamp, forKey: "extensionLastActive")
        sut.check()

        // When: Get status message
        let message = sut.statusMessage

        // Then: Should indicate not recently active
        XCTAssertEqual(message, "Not recently active", "Should show not recently active message")
    }

    // MARK: - Observable Tests

    func testCheck_UpdatesPublishedProperties() {
        // Given: Expectation for published property changes
        let expectation = expectation(description: "Published properties updated")
        expectation.expectedFulfillmentCount = 2 // lastActive + isLikelyActive

        var lastActiveChanged = false
        var isLikelyActiveChanged = false

        // Subscribe to published properties
        sut.$lastActive
            .dropFirst() // Skip initial value
            .sink { _ in
                lastActiveChanged = true
                if lastActiveChanged && isLikelyActiveChanged {
                    expectation.fulfill()
                }
            }
            .store(in: &cancellables)

        sut.$isLikelyActive
            .dropFirst() // Skip initial value
            .sink { _ in
                isLikelyActiveChanged = true
                if lastActiveChanged && isLikelyActiveChanged {
                    expectation.fulfill()
                }
            }
            .store(in: &cancellables)

        // When: Set recent activity and check
        let appGroupDefaults = UserDefaults(suiteName: "group.com.techforpalestine.thewalladdon")!
        let recentTimestamp = Date().timeIntervalSince1970
        appGroupDefaults.set(recentTimestamp, forKey: "extensionLastActive")

        sut.check()

        // Then: Published properties should update
        wait(for: [expectation], timeout: 1.0)
        XCTAssertTrue(lastActiveChanged, "lastActive should have changed")
        XCTAssertTrue(isLikelyActiveChanged, "isLikelyActive should have changed")
    }

    // MARK: - Edge Cases

    func testCheck_MultipleCallsWithSameData_Idempotent() {
        // Given: Activity recorded
        let appGroupDefaults = UserDefaults(suiteName: "group.com.techforpalestine.thewalladdon")!
        let timestamp = Date().timeIntervalSince1970
        appGroupDefaults.set(timestamp, forKey: "extensionLastActive")

        // When: Check multiple times
        sut.check()
        let firstResult = sut.isLikelyActive

        sut.check()
        let secondResult = sut.isLikelyActive

        sut.check()
        let thirdResult = sut.isLikelyActive

        // Then: Results should be consistent
        XCTAssertEqual(firstResult, secondResult, "Multiple checks should be idempotent")
        XCTAssertEqual(secondResult, thirdResult, "Multiple checks should be idempotent")
    }

    func testCheck_InvalidTimestamp_HandlesGracefully() {
        // Given: Invalid timestamp (negative)
        let appGroupDefaults = UserDefaults(suiteName: "group.com.techforpalestine.thewalladdon")!
        appGroupDefaults.set(-1.0, forKey: "extensionLastActive")

        // When: Check activity
        sut.check()

        // Then: Should handle gracefully (not crash)
        // The actual behavior depends on implementation, but it shouldn't crash
        XCTAssertNotNil(sut.lastActive, "Should handle invalid timestamp")
    }
}
