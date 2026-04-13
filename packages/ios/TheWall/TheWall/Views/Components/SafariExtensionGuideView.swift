import SwiftUI

/// Native iOS-Settings-style visual guide for enabling the Safari extension.
///
/// Renders 6 step cards that mimic the actual iOS Settings UI, showing
/// the exact navigation path: Settings > Apps > Safari > Extensions > The Wall > Allow.
struct SafariExtensionGuideView: View {

    var body: some View {
        VStack(spacing: 16) {
            // Step 1: Open Settings
            GuideStepCard(
                number: 1,
                title: String(localized: "guide.visual.step1.title", defaultValue: "Open Settings"),
                path: [PathItem(label: String(localized: "guide.visual.path.settings", defaultValue: "Settings"), icon: "gear")],
                description: String(localized: "guide.visual.step1.description", defaultValue: "Open the Settings app on your iPhone")
            ) {
                SettingsRow(
                    icon: "gear",
                    iconGradient: [Color(.systemGray)],
                    label: String(localized: "guide.visual.row.settings", defaultValue: "Settings")
                )
            }

            // Step 2: Go to Apps
            GuideStepCard(
                number: 2,
                title: String(localized: "guide.visual.step2.title", defaultValue: "Go to Apps"),
                path: [
                    PathItem(label: String(localized: "guide.visual.path.settings", defaultValue: "Settings")),
                    PathItem(label: String(localized: "guide.visual.path.apps", defaultValue: "Apps"), icon: "square.grid.2x2")
                ],
                description: String(localized: "guide.visual.step2.description", defaultValue: "Scroll down and tap on \"Apps\"")
            ) {
                SettingsRow(
                    icon: "square.grid.2x2",
                    iconGradient: [.purple, .blue, .cyan, .green],
                    label: String(localized: "guide.visual.row.apps", defaultValue: "Apps")
                )
            }

            // Step 3: Select Safari
            GuideStepCard(
                number: 3,
                title: String(localized: "guide.visual.step3.title", defaultValue: "Select Safari"),
                path: [
                    PathItem(label: String(localized: "guide.visual.path.apps", defaultValue: "Apps")),
                    PathItem(label: "Safari", icon: "safari")
                ],
                description: String(localized: "guide.visual.step3.description", defaultValue: "Find and tap on Safari in the apps list")
            ) {
                SettingsRow(
                    icon: "safari",
                    iconGradient: [Color(.systemCyan), Color(.systemBlue)],
                    label: "Safari"
                )
            }

            // Step 4: Open Extensions
            GuideStepCard(
                number: 4,
                title: String(localized: "guide.visual.step4.title", defaultValue: "Open Extensions"),
                path: [
                    PathItem(label: "Safari"),
                    PathItem(label: String(localized: "guide.visual.path.extensions", defaultValue: "Extensions"), icon: "puzzlepiece.extension")
                ],
                description: String(localized: "guide.visual.step4.description", defaultValue: "Tap on \"Extensions\" under the General section")
            ) {
                SettingsRow(
                    icon: "puzzlepiece.extension",
                    iconGradient: [Color(.systemOrange)],
                    label: String(localized: "guide.visual.row.extensions", defaultValue: "Extensions")
                )
            }

            // Step 5: Enable The Wall
            GuideStepCard(
                number: 5,
                title: String(localized: "guide.visual.step5.title", defaultValue: "Enable The Wall"),
                path: [
                    PathItem(label: String(localized: "guide.visual.path.extensions", defaultValue: "Extensions")),
                    PathItem(label: String(localized: "guide.visual.path.theWall", defaultValue: "The Wall"), icon: "shield.fill")
                ],
                description: String(localized: "guide.visual.step5.description", defaultValue: "Tap \"The Wall\" and turn on \"Allow Extension\"")
            ) {
                ToggleRow(label: String(localized: "guide.visual.row.allowExtension", defaultValue: "Allow Extension"), isOn: true)
            }

            // Step 6: Grant Permissions
            GuideStepCard(
                number: 6,
                title: String(localized: "guide.visual.step6.title", defaultValue: "Grant Permissions"),
                path: [
                    PathItem(label: String(localized: "guide.visual.path.allWebsites", defaultValue: "All Websites")),
                    PathItem(label: String(localized: "guide.visual.path.allow", defaultValue: "Allow"), icon: "checkmark.circle")
                ],
                description: String(localized: "guide.visual.step6.description", defaultValue: "Tap \"All Websites\" and select \"Allow\"")
            ) {
                PermissionPickerVisual()
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

/// A single step card with number badge, path breadcrumbs, description, and iOS-style visual.
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

            // iOS Settings visual
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

/// Mimics a row in iOS Settings with an icon, label, and chevron.
private struct SettingsRow: View {

    let icon: String
    let iconGradient: [Color]
    let label: String

    var body: some View {
        HStack(spacing: 12) {
            // Icon badge
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

// MARK: - Toggle Row Visual

/// Mimics an iOS Settings toggle row.
private struct ToggleRow: View {

    let label: String
    let isOn: Bool

    var body: some View {
        HStack {
            Text(label)
                .font(.system(size: 16))
                .foregroundStyle(Color(.label))

            Spacer()

            // Static toggle visual (not interactive)
            Capsule()
                .fill(isOn ? Color(.systemGreen) : Color(.systemGray4))
                .frame(width: 51, height: 31)
                .overlay(
                    Circle()
                        .fill(.white)
                        .shadow(color: .black.opacity(0.15), radius: 1, y: 1)
                        .frame(width: 27, height: 27)
                        .offset(x: isOn ? 10 : -10),
                    alignment: .center
                )
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 8)
    }
}

// MARK: - Permission Picker Visual

/// Mimics the iOS Settings permission picker (Ask / Deny / Allow).
private struct PermissionPickerVisual: View {

    var body: some View {
        VStack(spacing: 0) {
            PermissionOptionRow(label: String(localized: "guide.visual.permission.ask", defaultValue: "Ask"), isSelected: false, showDivider: true)
            PermissionOptionRow(label: String(localized: "guide.visual.permission.deny", defaultValue: "Deny"), isSelected: false, showDivider: true)
            PermissionOptionRow(label: String(localized: "guide.visual.permission.allow", defaultValue: "Allow"), isSelected: true, showDivider: false)
        }
    }
}

/// A single permission option row.
private struct PermissionOptionRow: View {

    let label: String
    let isSelected: Bool
    let showDivider: Bool

    var body: some View {
        VStack(spacing: 0) {
            HStack {
                Text(label)
                    .font(.system(size: 16))
                    .foregroundStyle(Color(.label))

                Spacer()

                if isSelected {
                    Image(systemName: "checkmark")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundStyle(Color(.systemBlue))
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 11)

            if showDivider {
                Divider()
                    .padding(.leading, 16)
            }
        }
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
