import SwiftUI

/// Main app view with tab navigation
struct MainView: View {

    @State private var selectedTab = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            // Home Tab
            HomeTabView()
                .tabItem {
                    Label(String(localized: "tab.home", defaultValue: "Home"), systemImage: "house.fill")
                }
                .tag(0)

            // Database Tab
            DatabaseTabView()
                .tabItem {
                    Label(String(localized: "tab.database", defaultValue: "Database"), systemImage: "building.2")
                }
                .tag(1)

            // Settings Tab
            SettingsTabView()
                .tabItem {
                    Label(String(localized: "tab.settings", defaultValue: "Settings"), systemImage: "gearshape")
                }
                .tag(2)
        }
        .tint(Color.wallPrimary)
    }
}

// MARK: - Home Tab

/// Branded home screen matching the Android app's visual identity.
private struct HomeTabView: View {

    private var versionLabel: String {
        let version = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0.0"
        let format = String(localized: "status.version", defaultValue: "Version %@")
        return String(format: format, version)
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    // Hero
                    heroSection

                    // Try it
                    testExtensionCard

                    // About
                    aboutCard

                    // Trust badges
                    trustBadgesRow

                    // Version
                    Text(versionLabel)
                        .font(.wallCaption)
                        .foregroundStyle(Color.wallOnSurface.opacity(0.5))
                        .padding(.bottom, 8)
                }
                .padding()
            }
            .background(Color.wallBackground)
            .toolbar(.hidden, for: .navigationBar)
        }
    }

    // MARK: - Hero

    private var heroSection: some View {
        VStack(spacing: 16) {
            Image("BrandLockup")
                .resizable()
                .aspectRatio(contentMode: .fill)
                .frame(maxWidth: .infinity)
                .frame(height: 180)
                .clipShape(RoundedRectangle(cornerRadius: 16))

            Text(String(localized: "home.hero.badge", defaultValue: "19,000+ Companies"))
                .font(.wallCaptionMedium)
                .foregroundStyle(Color.wallBadgeText)
                .padding(.horizontal, 16)
                .padding(.vertical, 6)
                .background(
                    Capsule()
                        .fill(Color.wallBadgeBg)
                )
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 8)
    }

    // MARK: - Test Extension

    private var testExtensionCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(String(localized: "home.test.title", defaultValue: "Test the Extension"))
                .font(.wallHeading3)
                .foregroundStyle(Color.wallOnSurface)

            Text(String(localized: "home.test.description", defaultValue: "Open Safari and visit a flagged website to see The Wall in action"))
                .font(.wallCaption)
                .foregroundStyle(Color.wallOnSurface.opacity(0.7))

            VStack(spacing: 8) {
                TestURLRow(domain: "wix.com")
                TestURLRow(domain: "fiverr.com")
                TestURLRow(domain: "expressvpn.com")
            }
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color.wallSurfaceVariant)
        )
    }

    // MARK: - About

    private var aboutCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(String(localized: "status.about.title", defaultValue: "About The Wall"))
                .font(.wallHeading3)
                .foregroundStyle(Color.wallOnSurface)

            Text(String(localized: "status.about.description", defaultValue: "The Wall helps you identify and avoid companies involved in humanitarian violations, with a focus on the Palestinian cause."))
                .font(.wallCaption)
                .foregroundStyle(Color.wallOnSurface.opacity(0.7))

            HStack {
                Image(systemName: "building.2")
                    .foregroundStyle(Color.wallPrimary)

                Text(String(localized: "status.about.companyCount", defaultValue: "19,000+ companies in database"))
                    .font(.wallCaptionMedium)
                    .foregroundStyle(Color.wallOnSurface)
            }
            .padding(.top, 4)
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color.wallSurfaceVariant)
        )
    }

    // MARK: - Trust Badges

    private var trustBadgesRow: some View {
        HStack(spacing: 12) {
            HomeTrustBadge(
                icon: "wifi.slash",
                label: String(localized: "home.badge.private", defaultValue: "Private")
            )
            HomeTrustBadge(
                icon: "lock.fill",
                label: String(localized: "home.badge.free", defaultValue: "Free")
            )
            HomeTrustBadge(
                icon: "checkmark.seal",
                label: String(localized: "home.badge.openSource", defaultValue: "Open Source")
            )
        }
    }
}

// MARK: - Supporting Views

/// Row that opens a test URL in Safari.
private struct TestURLRow: View {

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

/// Compact trust badge for the home screen.
private struct HomeTrustBadge: View {

    let icon: String
    let label: String

    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.system(size: 20))
                .foregroundStyle(Color.wallPrimary)

            Text(label)
                .font(.system(size: 12, weight: .medium))
                .foregroundStyle(Color.wallOnSurface.opacity(0.7))
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 12)
        .background(
            RoundedRectangle(cornerRadius: 10)
                .fill(Color.wallSurfaceVariant)
        )
    }
}

// MARK: - Database Tab

private struct DatabaseTabView: View {

    var body: some View {
        NavigationStack {
            DatabaseBrowserView()
                .toolbar(.hidden, for: .navigationBar)
        }
    }
}

// MARK: - Settings Tab

private struct SettingsTabView: View {

    var body: some View {
        NavigationStack {
            SettingsView()
                .navigationTitle(String(localized: "settings.navTitle", defaultValue: "Settings"))
                .navigationBarTitleDisplayMode(.inline)
        }
    }
}

#Preview {
    MainView()
}
