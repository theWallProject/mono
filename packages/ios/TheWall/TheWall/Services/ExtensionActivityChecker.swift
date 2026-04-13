import Foundation
import Combine

/// Extension activity checker service
///
/// Monitors the Safari extension's activity by reading timestamps from shared UserDefaults.
/// The extension writes `extensionLastActive` to App Groups whenever its handler is invoked.
final class ExtensionActivityChecker: ObservableObject {

    // MARK: - Published Properties

    /// The last known activity timestamp from the extension
    @Published private(set) var lastActive: Date?

    /// Whether the extension is likely active (active within last 24 hours)
    @Published private(set) var isLikelyActive: Bool = false

    // MARK: - Private Properties

    private let appGroupID = "group.com.techforpalestine.thewalladdon"
    private let timestampKey = "extensionLastActive"
    private let activityThreshold: TimeInterval = 24 * 60 * 60  // 24 hours

    private lazy var shared: UserDefaults? = {
        return UserDefaults(suiteName: appGroupID)
    }()

    // MARK: - Initialization

    init() {
        check()
    }

    // MARK: - Public Methods

    /// Check the current extension activity status
    ///
    /// Reads the latest timestamp from shared UserDefaults and updates published properties.
    /// Call this method to refresh the status.
    func check() {
        guard let shared = shared else {
            NSLog("[ExtensionActivityChecker] Failed to access shared UserDefaults")
            lastActive = nil
            isLikelyActive = false
            return
        }

        let timestamp = shared.double(forKey: timestampKey)

        guard timestamp > 0 else {
            // No activity recorded yet
            lastActive = nil
            isLikelyActive = false
            return
        }

        let date = Date(timeIntervalSince1970: timestamp)
        lastActive = date

        // Consider active if handler was called within the activity threshold
        let now = Date()
        let elapsed = now.timeIntervalSince(date)
        isLikelyActive = elapsed < activityThreshold

        NSLog("[ExtensionActivityChecker] Last active: \(date), likely active: \(isLikelyActive)")
    }

    /// Human-readable localized status message
    var statusMessage: String {
        guard let lastActive = lastActive else {
            return String(localized: "extensionStatus.unknown", defaultValue: "Extension status unknown")
        }

        if isLikelyActive {
            let formatter = RelativeDateTimeFormatter()
            formatter.unitsStyle = .full
            let relative = formatter.localizedString(for: lastActive, relativeTo: Date())
            return String(localized: "extensionStatus.active", defaultValue: "Active \(relative)")
        } else {
            return String(localized: "extensionStatus.notActive", defaultValue: "Not recently active")
        }
    }
}
