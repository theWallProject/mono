import SwiftUI

/// Enable Extension page (Page 3 of onboarding)
///
/// Guides the user through enabling the Safari extension with
/// native iOS Settings-style visual step cards and an "Open Settings" button.
struct EnableExtensionPageView: View {

    @StateObject private var activityChecker = ExtensionActivityChecker()
    @State private var extensionDetected = false

    /// Called when the extension is detected as active
    var onExtensionDetected: (() -> Void)?

    private let pollTimer = Timer.publish(every: 2, on: .main, in: .common).autoconnect()

    var body: some View {
        GeometryReader { geometry in
            ScrollView {
                VStack(spacing: 20) {
                    Spacer(minLength: 8)

                    // Title
                    Text(String(localized: "enableExtension.title", defaultValue: "Enable the Extension"))
                        .font(.wallHeading1)
                        .foregroundStyle(Color.wallOnSurface)
                        .multilineTextAlignment(.center)

                    // Subtitle
                    Text(String(localized: "enableExtension.subtitle", defaultValue: "Follow these steps to activate The Wall"))
                        .font(.wallBody)
                        .foregroundStyle(Color.wallOnSurface.opacity(0.7))
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 8)

                    // Visual step cards
                    SafariExtensionGuideView()

                    Spacer(minLength: 12)

                    // Open Settings button
                    if !extensionDetected {
                        Button {
                            if let url = URL(string: UIApplication.openSettingsURLString) {
                                UIApplication.shared.open(url)
                            }
                        } label: {
                            HStack(spacing: 8) {
                                Image(systemName: "gear")
                                    .font(.system(size: 18, weight: .semibold))
                                Text(String(localized: "enableExtension.openSettings", defaultValue: "Open Settings"))
                                    .font(.wallButton)
                            }
                            .foregroundStyle(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                            .background(
                                RoundedRectangle(cornerRadius: 12)
                                    .fill(Color.wallPrimary)
                            )
                        }
                        .buttonStyle(.plain)
                    }

                    // Success celebration when extension detected
                    if extensionDetected {
                        successView
                            .transition(.scale.combined(with: .opacity))
                            .onAppear {
                                triggerSuccessHaptic()
                                DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
                                    onExtensionDetected?()
                                }
                            }
                    }

                    Spacer(minLength: 16)
                }
                .frame(minHeight: geometry.size.height)
                .padding()
            }
        }
        .onReceive(pollTimer) { _ in
            guard !extensionDetected else { return }
            activityChecker.check()
            if activityChecker.isLikelyActive {
                withAnimation(.spring(response: 0.5, dampingFraction: 0.7)) {
                    extensionDetected = true
                }
            }
        }
        .onAppear {
            activityChecker.check()
            if activityChecker.isLikelyActive {
                extensionDetected = true
            }
        }
    }

    // MARK: - Subviews

    private var successView: some View {
        VStack(spacing: 12) {
            Image(systemName: "checkmark.seal.fill")
                .font(.system(size: 44))
                .foregroundStyle(Color.wallSecondary)

            Text(String(localized: "enableExtension.allDone", defaultValue: "All Done!"))
                .font(.wallHeading3)
                .foregroundStyle(Color.wallSecondary)

            Text(String(localized: "enableExtension.ready", defaultValue: "The Wall is ready to protect your browsing"))
                .font(.wallCaption)
                .foregroundStyle(Color.wallOnSurface.opacity(0.6))
                .multilineTextAlignment(.center)
        }
        .padding(.vertical, 20)
        .padding(.horizontal, 24)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color.wallSecondary.opacity(0.08))
                .overlay(
                    RoundedRectangle(cornerRadius: 16)
                        .strokeBorder(Color.wallSecondary.opacity(0.2), lineWidth: 1)
                )
        )
    }

    // MARK: - Actions

    private func triggerSuccessHaptic() {
        let generator = UINotificationFeedbackGenerator()
        generator.notificationOccurred(.success)
    }
}

#Preview {
    EnableExtensionPageView()
        .background(Color.wallBackground)
}
