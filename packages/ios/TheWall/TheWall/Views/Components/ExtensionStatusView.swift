import SwiftUI

/// Extension status display component
struct ExtensionStatusView: View {

    @StateObject private var activityChecker = ExtensionActivityChecker()

    var body: some View {
        VStack(spacing: 24) {
            // Status card
            VStack(spacing: 16) {
                // Status indicator
                HStack(spacing: 12) {
                    // Status dot
                    Circle()
                        .fill(activityChecker.isLikelyActive ? Color.wallSecondary : Color.wallOutline)
                        .frame(width: 12, height: 12)

                    Text(activityChecker.statusMessage)
                        .font(.wallHeading3)
                        .foregroundStyle(Color.wallOnSurface)

                    Spacer()

                    // Refresh button
                    Button {
                        activityChecker.check()
                    } label: {
                        Image(systemName: "arrow.clockwise")
                            .font(.system(size: 18))
                            .foregroundStyle(Color.wallPrimary)
                    }
                }

                // Last active time (if available)
                if let lastActive = activityChecker.lastActive {
                    HStack {
                        Image(systemName: "clock")
                            .font(.system(size: 14))
                            .foregroundStyle(Color.wallOnSurface.opacity(0.5))

                        Text("Last active: \(lastActive, style: .relative)")
                            .font(.wallCaption)
                            .foregroundStyle(Color.wallOnSurface.opacity(0.7))

                        Spacer()
                    }
                }

                // Info message
                Text(activityChecker.isLikelyActive
                     ? String(localized: "extensionStatus.working", defaultValue: "The extension is working correctly")
                     : String(localized: "extensionStatus.enableHint", defaultValue: "If you've enabled the extension, visit a website to activate it"))
                    .font(.wallCaption)
                    .foregroundStyle(Color.wallOnSurface.opacity(0.6))
                    .multilineTextAlignment(.leading)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
            .padding()
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color.wallSurfaceVariant)
            )

            // Test button
            TestExtensionButtonView()
        }
        .onAppear {
            activityChecker.check()
        }
    }
}

/// Test extension button component
private struct TestExtensionButtonView: View {

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(String(localized: "extensionStatus.test.title", defaultValue: "Test the Extension"))
                .font(.wallHeading3)
                .foregroundStyle(Color.wallOnSurface)

            Text(String(localized: "extensionStatus.test.description", defaultValue: "Open Safari and visit a flagged website to see The Wall in action"))
                .font(.wallCaption)
                .foregroundStyle(Color.wallOnSurface.opacity(0.7))

            // Example URLs
            VStack(spacing: 8) {
                TestURLButton(domain: "facebook.com")
                TestURLButton(domain: "linkedin.com")
                TestURLButton(domain: "coca-cola.com")
            }
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color.wallSurfaceVariant)
        )
    }
}

/// Test URL button
private struct TestURLButton: View {

    let domain: String

    var body: some View {
        Button {
            if let url = URL(string: "https://\(domain)") {
                UIApplication.shared.open(url)
            }
        } label: {
            HStack {
                Image(systemName: "safari")
                    .foregroundStyle(Color.wallPrimary)

                Text(domain)
                    .font(.wallBodyMedium)
                    .foregroundStyle(Color.wallOnSurface)

                Spacer()

                Image(systemName: "arrow.up.right")
                    .font(.system(size: 12))
                    .foregroundStyle(Color.wallOnSurface.opacity(0.5))
                    .flipsForRightToLeftLayoutDirection(false)
            }
            .padding(.vertical, 12)
            .padding(.horizontal, 16)
            .background(
                RoundedRectangle(cornerRadius: 8)
                    .fill(Color.wallSurface)
            )
        }
    }
}

#Preview {
    ExtensionStatusView()
        .padding()
        .background(Color.wallBackground)
}
