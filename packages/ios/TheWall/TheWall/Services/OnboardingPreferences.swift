import Foundation

/// Protocol for onboarding preferences management
///
/// This protocol defines the interface for managing onboarding completion state.
/// Using a protocol enables easy testing with mock implementations.
protocol OnboardingPreferencesProtocol {
    /// Whether the user has completed the onboarding flow
    var hasCompletedOnboarding: Bool { get }

    /// Mark the onboarding as completed
    func markAsComplete()

    /// Reset the onboarding state (for testing and settings)
    func reset()
}

/// UserDefaults-backed implementation of onboarding preferences
///
/// This service manages the onboarding completion state using UserDefaults.
/// It follows immutable patterns by not exposing mutable state directly.
final class OnboardingPreferences: OnboardingPreferencesProtocol {

    // MARK: - Properties

    private let userDefaults: UserDefaults
    private let key = "hasCompletedOnboarding"

    // MARK: - Initialization

    /// Creates a new onboarding preferences manager
    ///
    /// - Parameter userDefaults: The UserDefaults instance to use (defaults to .standard)
    init(userDefaults: UserDefaults = .standard) {
        self.userDefaults = userDefaults
    }

    // MARK: - OnboardingPreferencesProtocol

    var hasCompletedOnboarding: Bool {
        return userDefaults.bool(forKey: key)
    }

    func markAsComplete() {
        userDefaults.set(true, forKey: key)
        userDefaults.synchronize()
    }

    func reset() {
        userDefaults.removeObject(forKey: key)
        userDefaults.synchronize()
    }
}
