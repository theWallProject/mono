import SafariServices
import Foundation

/// Safari Web Extension Handler for iOS
///
/// Echoes incoming messages from the web extension back to it.
class SafariWebExtensionHandler: NSObject, NSExtensionRequestHandling {

    func beginRequest(with context: NSExtensionContext) {
        let request = context.inputItems.first as? NSExtensionItem
        let message: Any?

        if #available(iOS 15.0, *) {
            message = request?.userInfo?[SFExtensionMessageKey]
        } else {
            message = request?.userInfo?["message"]
        }

        let response = NSExtensionItem()
        if #available(iOS 15.0, *) {
            response.userInfo = [SFExtensionMessageKey: ["echo": message ?? ""]]
        } else {
            response.userInfo = ["message": ["echo": message ?? ""]]
        }

        context.completeRequest(returningItems: [response], completionHandler: nil)
    }
}
