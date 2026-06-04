import SwiftUI

/// Two-step visual guide for enabling The Wall directly from Safari's AA menu.
struct SafariExtensionGuideView: View {

    var body: some View {
        VStack(spacing: 16) {
            // Step 1: Open Safari
            GuideStepCard(
                number: 1,
                title: String(localized: "guide.visual.step1.title", defaultValue: "Open Safari"),
                path: [PathItem(label: "Safari", icon: "safari")],
                description: String(localized: "guide.visual.step1.description", defaultValue: "Launch Safari and open any website")
            ) {
                SettingsRow(
                    icon: "safari",
                    iconGradient: [Color(.systemCyan), Color(.systemBlue)],
                    label: "Safari"
                )
            }

            // Step 2: Enable from the AA menu (animated tutorial)
            GuideStepCard(
                number: 2,
                title: String(localized: "guide.visual.step2.title", defaultValue: "Enable from the AA menu"),
                path: [
                    PathItem(label: "AA", icon: "textformat.size"),
                    PathItem(label: String(localized: "guide.visual.path.manageExtensions", defaultValue: "Manage Extensions"), icon: "puzzlepiece.extension")
                ],
                description: String(localized: "guide.visual.step2.description", defaultValue: "Tap the AA button in the address bar, choose Manage Extensions, and turn on The Wall")
            ) {
                AnimatedGIFView("safari-enable")
                    .aspectRatio(320.0 / 210.0, contentMode: .fit)
                    .frame(maxWidth: .infinity)
            }

            // Footer
            HStack(spacing: 6) {
                Image(systemName: "checkmark.circle.fill")
                    .foregroundStyle(Color.wallSecondary)
                Text(String(localized: "guide.visual.footer", defaultValue: "You're all set! The Wall is now active in Safari."))
                    .font(.wallCaptionMedium)
                    .foregroundStyle(Color.wallSecondary)
            }
            .padding(.top, 4)
        }
    }
}

// MARK: - Guide Step Card

/// A single step card with number badge, path breadcrumbs, description, and visual.
private struct GuideStepCard<Visual: View>: View {

    let number: Int
    let title: String
    let path: [PathItem]
    let description: String
    @ViewBuilder let visual: () -> Visual

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Header: number badge + title
            HStack(spacing: 10) {
                StepBadge(number: number)

                Text(title)
                    .font(.wallBodyMedium)
                    .foregroundStyle(Color.wallOnSurface)
            }

            // Path breadcrumbs
            HStack(spacing: 6) {
                ForEach(Array(path.enumerated()), id: \.offset) { index, item in
                    if index > 0 {
                        Image(systemName: "chevron.right")
                            .font(.system(size: 9, weight: .bold))
                            .foregroundStyle(Color.wallSecondary)
                    }

                    HStack(spacing: 4) {
                        if let icon = item.icon {
                            Image(systemName: icon)
                                .font(.system(size: 10))
                        }
                        Text(item.label)
                            .font(.system(size: 12, weight: .medium))
                    }
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(
                        Capsule()
                            .fill(Color.wallOnSurface.opacity(0.08))
                    )
                    .foregroundStyle(Color.wallOnSurface.opacity(0.7))
                }
            }

            // Description
            Text(description)
                .font(.wallCaption)
                .foregroundStyle(Color.wallOnSurface.opacity(0.5))

            // Visual
            VStack(spacing: 0) {
                visual()
            }
            .background(Color(.systemBackground))
            .clipShape(RoundedRectangle(cornerRadius: 10))
        }
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color.wallSurfaceVariant)
        )
    }
}

// MARK: - Step Badge

private struct StepBadge: View {

    let number: Int

    var body: some View {
        ZStack {
            Circle()
                .fill(
                    LinearGradient(
                        colors: [Color.wallPrimary, Color.wallPrimaryDark],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .frame(width: 28, height: 28)

            Text("\(number)")
                .font(.system(size: 14, weight: .bold, design: .rounded))
                .foregroundStyle(.white)
        }
    }
}

// MARK: - Path Breadcrumb Model

private struct PathItem {
    let label: String
    var icon: String?
}

// MARK: - iOS Settings Row Visual

private struct SettingsRow: View {

    let icon: String
    let iconGradient: [Color]
    let label: String

    var body: some View {
        HStack(spacing: 12) {
            ZStack {
                RoundedRectangle(cornerRadius: 6)
                    .fill(
                        LinearGradient(
                            colors: iconGradient,
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(width: 29, height: 29)

                Image(systemName: icon)
                    .font(.system(size: 15, weight: .medium))
                    .foregroundStyle(.white)
            }

            Text(label)
                .font(.system(size: 16))
                .foregroundStyle(Color(.label))

            Spacer()

            Image(systemName: "chevron.right")
                .font(.system(size: 13, weight: .semibold))
                .foregroundStyle(Color(.tertiaryLabel))
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 11)
    }
}

// MARK: - Previews

#Preview("Guide - Light") {
    ScrollView {
        SafariExtensionGuideView()
            .padding()
    }
    .background(Color.wallBackground)
}

#Preview("Guide - Dark") {
    ScrollView {
        SafariExtensionGuideView()
            .padding()
    }
    .background(Color.wallBackground)
    .preferredColorScheme(.dark)
}
