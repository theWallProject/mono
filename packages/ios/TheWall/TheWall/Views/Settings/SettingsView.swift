import SwiftUI

/// Settings view
struct SettingsView: View {

    @State private var showingOnboarding = false

    var body: some View {
        List {
            // Extension section
            Section {
                NavigationLink {
                    ExtensionGuideView()
                } label: {
                    SettingRowView(
                        icon: "safari",
                        iconColor: .wallPrimary,
                        title: String(localized: "settings.extensionGuide", defaultValue: "Extension Setup Guide")
                    )
                }
            } header: {
                Text(String(localized: "settings.section.extension", defaultValue: "Extension"))
            }

            // App section
            Section {
                Button {
                    showingOnboarding = true
                } label: {
                    SettingRowView(
                        icon: "arrow.counterclockwise",
                        iconColor: .wallPrimary,
                        title: String(localized: "settings.showOnboarding", defaultValue: "Show Onboarding Again")
                    )
                }

                NavigationLink {
                    AboutView()
                } label: {
                    SettingRowView(
                        icon: "info.circle",
                        iconColor: .wallPrimary,
                        title: String(localized: "settings.about", defaultValue: "About The Wall")
                    )
                }
            } header: {
                Text(String(localized: "settings.section.app", defaultValue: "App"))
            }

            // Support section
            Section {
                Button {
                    let subject = String(localized: "settings.reportMistake.subject", defaultValue: "Report a Mistake - The Wall iOS")
                    let body = String(localized: "settings.reportMistake.body", defaultValue: "Please describe the mistake:\n\n")
                    let encodedSubject = subject.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? ""
                    let encodedBody = body.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? ""
                    if let url = URL(string: "mailto:the.wall.addon@proton.me?subject=\(encodedSubject)&body=\(encodedBody)") {
                        UIApplication.shared.open(url)
                    }
                } label: {
                    SettingRowView(
                        icon: "exclamationmark.bubble",
                        iconColor: .orange,
                        title: String(localized: "settings.reportMistake", defaultValue: "Report a Mistake")
                    )
                }

                Link(destination: URL(string: "https://ko-fi.com/thewalladdon")!) {
                    SettingRowView(
                        icon: "heart.fill",
                        iconColor: .red,
                        title: String(localized: "settings.supportKofi", defaultValue: "Support Us on Ko-fi")
                    )
                }

                Link(destination: URL(string: "https://the-wall.win/privacy")!) {
                    SettingRowView(
                        icon: "hand.raised.fill",
                        iconColor: .green,
                        title: String(localized: "settings.privacy", defaultValue: "Privacy Policy")
                    )
                }
            } header: {
                Text(String(localized: "settings.section.support", defaultValue: "Support"))
            }

            // Version section
            Section {
                HStack {
                    Text(String(localized: "settings.version", defaultValue: "Version"))
                        .font(.wallBody)
                        .foregroundStyle(Color.wallOnSurface)

                    Spacer()

                    Text(appVersion)
                        .font(.wallCaption)
                        .foregroundStyle(Color.wallOnSurface.opacity(0.6))
                }

                HStack {
                    Text(String(localized: "settings.build", defaultValue: "Build"))
                        .font(.wallBody)
                        .foregroundStyle(Color.wallOnSurface)

                    Spacer()

                    Text(buildNumber)
                        .font(.wallCaption)
                        .foregroundStyle(Color.wallOnSurface.opacity(0.6))
                }
            } header: {
                Text(String(localized: "settings.section.version", defaultValue: "Version"))
            }
        }
        .listStyle(.insetGrouped)
        .background(Color.wallBackground)
        .fullScreenCover(isPresented: $showingOnboarding) {
            OnboardingView(isPresented: $showingOnboarding)
        }
    }

    // MARK: - Computed Properties

    private var appVersion: String {
        Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0.0"
    }

    private var buildNumber: String {
        Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "1"
    }
}

/// Setting row component
private struct SettingRowView: View {

    let icon: String
    let iconColor: Color
    let title: String

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 20))
                .foregroundStyle(iconColor)
                .frame(width: 28)

            Text(title)
                .font(.wallBody)
                .foregroundStyle(Color.wallOnSurface)
        }
    }
}

/// Extension setup guide view
private struct ExtensionGuideView: View {

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                Text(String(localized: "guide.title", defaultValue: "How to Enable the Extension"))
                    .font(.wallHeading2)
                    .foregroundStyle(Color.wallOnSurface)

                SafariExtensionGuideView()

                PrimaryButtonView(title: String(localized: "guide.openSettings", defaultValue: "Open Settings")) {
                    if let url = URL(string: UIApplication.openSettingsURLString) {
                        UIApplication.shared.open(url)
                    }
                }
            }
            .padding()
        }
        .background(Color.wallBackground)
        .navigationTitle(String(localized: "guide.navTitle", defaultValue: "Setup Guide"))
        .navigationBarTitleDisplayMode(.inline)
    }
}

/// Guide step component
private struct GuideStepView: View {

    let number: Int
    let title: String
    let description: String

    var body: some View {
        HStack(alignment: .top, spacing: 16) {
            ZStack {
                Circle()
                    .fill(Color.wallPrimary)
                    .frame(width: 32, height: 32)

                Text("\(number)")
                    .font(.wallBodyMedium)
                    .foregroundStyle(.white)
            }

            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.wallHeading3)
                    .foregroundStyle(Color.wallOnSurface)

                Text(description)
                    .font(.wallCaption)
                    .foregroundStyle(Color.wallOnSurface.opacity(0.7))
            }

            Spacer()
        }
    }
}

/// About view
private struct AboutView: View {

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                // Logo and title
                VStack(spacing: 16) {
                    WallShieldView()
                        .frame(width: 100, height: 100)

                    Text(String(localized: "about.title", defaultValue: "The Wall"))
                        .font(.wallHeading1)
                        .foregroundStyle(Color.wallOnSurface)
                }
                .frame(maxWidth: .infinity)

                // Mission
                VStack(alignment: .leading, spacing: 12) {
                    Text(String(localized: "about.mission.title", defaultValue: "Our Mission"))
                        .font(.wallHeading2)
                        .foregroundStyle(Color.wallOnSurface)

                    Text(String(localized: "about.mission.description", defaultValue: "The Wall is a boycott assistance tool that helps identify companies involved in humanitarian violations, with a focus on the Palestinian cause. We provide transparency and alternatives to support ethical consumer choices."))
                        .font(.wallBody)
                        .foregroundStyle(Color.wallOnSurface.opacity(0.7))
                }

                // Stats
                VStack(spacing: 12) {
                    StatRowView(
                        icon: "building.2",
                        value: "26,000+",
                        label: String(localized: "about.stats.companies", defaultValue: "Companies tracked")
                    )
                    StatRowView(
                        icon: "globe",
                        label: String(localized: "about.stats.openSource", defaultValue: "Free and open source")
                    )
                    StatRowView(
                        icon: "lock.shield",
                        label: String(localized: "about.stats.privacy", defaultValue: "Privacy-first, no tracking")
                    )
                }

                // Links
                VStack(alignment: .leading, spacing: 12) {
                    Text(String(localized: "about.learnMore", defaultValue: "Learn More"))
                        .font(.wallHeading3)
                        .foregroundStyle(Color.wallOnSurface)

                    Link(destination: URL(string: "https://the-wall.win")!) {
                        LinkRowView(
                            icon: "globe",
                            title: String(localized: "about.website", defaultValue: "Website"),
                            url: "the-wall.win"
                        )
                    }

                    Link(destination: URL(string: "https://github.com/theWallProject")!) {
                        LinkRowView(
                            icon: "chevron.left.forwardslash.chevron.right",
                            title: String(localized: "about.github", defaultValue: "GitHub"),
                            url: "github.com/theWallProject"
                        )
                    }
                }

                // License
                Text(String(localized: "about.license", defaultValue: "Licensed under MIT License"))
                    .font(.wallCaption)
                    .foregroundStyle(Color.wallOnSurface.opacity(0.5))
                    .frame(maxWidth: .infinity, alignment: .center)
                    .padding(.top)
            }
            .padding()
        }
        .background(Color.wallBackground)
        .navigationTitle(String(localized: "about.navTitle", defaultValue: "About"))
        .navigationBarTitleDisplayMode(.inline)
    }
}

/// Stat row component
private struct StatRowView: View {

    let icon: String
    var value: String?
    let label: String

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 24))
                .foregroundStyle(Color.wallPrimary)
                .frame(width: 32)

            VStack(alignment: .leading, spacing: 2) {
                if let value = value {
                    Text(value)
                        .font(.wallHeading3)
                        .foregroundStyle(Color.wallOnSurface)
                }

                Text(label)
                    .font(.wallCaption)
                    .foregroundStyle(Color.wallOnSurface.opacity(0.7))
            }

            Spacer()
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color.wallSurfaceVariant)
        )
    }
}

/// Link row component
private struct LinkRowView: View {

    let icon: String
    let title: String
    let url: String

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .foregroundStyle(Color.wallPrimary)

            Text(title)
                .font(.wallBody)
                .foregroundStyle(Color.wallOnSurface)

            Spacer()

            Text(url)
                .font(.wallCaption)
                .foregroundStyle(Color.wallOnSurface.opacity(0.5))

            Image(systemName: "arrow.up.right")
                .font(.system(size: 12))
                .foregroundStyle(Color.wallOnSurface.opacity(0.5))
                .flipsForRightToLeftLayoutDirection(false)
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 8)
                .fill(Color.wallSurfaceVariant)
        )
    }
}

#Preview {
    NavigationStack {
        SettingsView()
            .navigationTitle("Settings")
    }
}
