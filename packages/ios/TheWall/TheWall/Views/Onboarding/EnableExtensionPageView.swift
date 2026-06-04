import SwiftUI

/// Enable Extension page (Page 3 of onboarding)
///
/// Guides the user through enabling the Safari extension. The user opens
/// Settings to flip the toggle, then taps "I've enabled it" to advance.
struct EnableExtensionPageView: View {

    @State private var extensionEnabled = false

    var onExtensionDetected: (() -> Void)?

    var body: some View {
        GeometryReader { geometry in
            ScrollView {
                VStack(spacing: 20) {
                    Spacer(minLength: 8)

                    Text(String(localized: "enableExtension.title", defaultValue: "Enable the Extension"))
                        .font(.wallHeading1)
                        .foregroundStyle(Color.wallOnSurface)
                        .multilineTextAlignment(.center)

                    Text(String(localized: "enableExtension.subtitle", defaultValue: "Follow these steps to activate The Wall"))
                        .font(.wallBody)
                        .foregroundStyle(Color.wallOnSurface.opacity(0.7))
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 8)

                    SafariExtensionGuideView()

                    Spacer(minLength: 12)

                    if !extensionEnabled {
                        Button {
                            if let url = URL(string: "https://techforpalestine.org") {
                                UIApplication.shared.open(url)
                            }
                        } label: {
                            HStack(spacing: 8) {
                                Image(systemName: "safari")
                                    .font(.system(size: 18, weight: .semibold))
                                Text(String(localized: "enableExtension.openSafari", defaultValue: "Open Safari"))
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

                        Button {
                            withAnimation(.spring(response: 0.5, dampingFraction: 0.7)) {
                                extensionEnabled = true
                            }
                        } label: {
                            Text(String(localized: "enableExtension.iveEnabled", defaultValue: "I've enabled it"))
                                .font(.wallButton)
                                .foregroundStyle(Color.wallPrimary)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 14)
                                .background(
                                    RoundedRectangle(cornerRadius: 12)
                                        .strokeBorder(Color.wallPrimary, lineWidth: 1.5)
                                )
                        }
                        .buttonStyle(.plain)
                    }

                    if extensionEnabled {
                        successView
                            .transition(.scale.combined(with: .opacity))
                            .onAppear {
                                triggerSuccessHaptic()
                                DispatchQueue.main.asyncAfter(deadline: .now() + 1.2) {
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
