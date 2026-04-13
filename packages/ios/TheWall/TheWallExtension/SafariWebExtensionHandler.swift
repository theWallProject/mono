import SafariServices
import Foundation

/// Safari Web Extension Handler for iOS
///
/// This class serves two purposes:
/// 1. Handles native messaging between the extension and host app
/// 2. Writes activity timestamps to App Groups for extension status monitoring
///
/// The extension writes `extensionLastActive` to shared UserDefaults whenever
/// the handler is invoked, allowing the host app to detect if the extension is running.
class SafariWebExtensionHandler: NSObject, NSExtensionRequestHandling {

    private let appGroupID = "group.com.techforpalestine.thewalladdon"

    /// Handle incoming requests from the web extension
    ///
    /// This method is called whenever the web extension sends a message to the native app.
    /// It performs two actions:
    /// 1. Writes the current timestamp to shared UserDefaults for activity tracking
    /// 2. Echoes the message back to the extension (standard behavior)
    ///
    /// - Parameter context: The extension request context containing the message
    func beginRequest(with context: NSExtensionContext) {
        // Write activity timestamp to shared UserDefaults
        writeActivityTimestamp()

        // Extract the message from the extension
        let request = context.inputItems.first as? NSExtensionItem
        let message: Any?

        if #available(iOS 15.0, *) {
            message = request?.userInfo?[SFExtensionMessageKey]
        } else {
            message = request?.userInfo?["message"]
        }

        // Echo the message back to the extension
        let response = NSExtensionItem()
        if #available(iOS 15.0, *) {
            response.userInfo = [SFExtensionMessageKey: ["echo": message ?? ""]]
        } else {
            response.userInfo = ["message": ["echo": message ?? ""]]
        }

        context.completeRequest(returningItems: [response], completionHandler: nil)
    }

    /// Writes the current timestamp to shared UserDefaults
    ///
    /// The host app reads this timestamp to determine if the extension is active.
    /// An extension is considered "likely active" if this timestamp is within the last 24 hours.
    private func writeActivityTimestamp() {
        guard let shared = UserDefaults(suiteName: appGroupID) else {
            NSLog("[TheWallExtension] Failed to access shared UserDefaults with suite name: \(appGroupID)")
            return
        }

        let timestamp = Date().timeIntervalSince1970
        shared.set(timestamp, forKey: "extensionLastActive")
        shared.synchronize()

        NSLog("[TheWallExtension] Activity timestamp written: \(timestamp)")
    }
}
