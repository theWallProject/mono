import SwiftUI

/// Main app entry point
@main
struct TheWallApp: App {

    @StateObject private var onboardingPreferences = OnboardingPreferences()
    @State private var showOnboarding = false

    init() {
        configureAppearance()
        handleLaunchArguments()
    }

    var body: some Scene {
        WindowGroup {
            Group {
                if showOnboarding {
                    OnboardingView(isPresented: $showOnboarding)
                } else {
                    MainView()
                }
            }
            .onAppear {
                showOnboarding = !onboardingPreferences.hasCompletedOnboarding
            }
            .onChange(of: showOnboarding) { _, newValue in
                if !newValue {
                    onboardingPreferences.markAsComplete()
                }
            }
        }
    }

    // MARK: - Appearance

    /// Configure global UIKit appearance to match The Wall brand identity.
    /// Orange (#B72B00) navigation bar and tab bar with white text/icons,
    /// matching the Android app's TopAppBar and bottom navigation.
    private func configureAppearance() {
        let brandColor = UIColor(red: 183/255, green: 43/255, blue: 0, alpha: 1)

        // Navigation bar — orange background, white text
        let navAppearance = UINavigationBarAppearance()
        navAppearance.configureWithOpaqueBackground()
        navAppearance.backgroundColor = brandColor
        navAppearance.titleTextAttributes = [.foregroundColor: UIColor.white]
        navAppearance.largeTitleTextAttributes = [.foregroundColor: UIColor.white]
        UINavigationBar.appearance().standardAppearance = navAppearance
        UINavigationBar.appearance().scrollEdgeAppearance = navAppearance
        UINavigationBar.appearance().compactAppearance = navAppearance
        UINavigationBar.appearance().tintColor = .white

        // Tab bar — brand-tinted icons on system glass background
        let tabAppearance = UITabBarAppearance()
        tabAppearance.configureWithDefaultBackground()

        let itemAppearance = UITabBarItemAppearance()
        itemAppearance.normal.iconColor = UIColor.label.withAlphaComponent(0.5)
        itemAppearance.normal.titleTextAttributes = [.foregroundColor: UIColor.label.withAlphaComponent(0.5)]
        itemAppearance.selected.iconColor = brandColor
        itemAppearance.selected.titleTextAttributes = [.foregroundColor: brandColor]

        tabAppearance.stackedLayoutAppearance = itemAppearance
        tabAppearance.inlineLayoutAppearance = itemAppearance
        tabAppearance.compactInlineLayoutAppearance = itemAppearance

        UITabBar.appearance().standardAppearance = tabAppearance
        UITabBar.appearance().scrollEdgeAppearance = tabAppearance
        UITabBar.appearance().tintColor = brandColor
    }

    // MARK: - Launch Arguments

    /// Handle launch arguments for testing and debugging
    private func handleLaunchArguments() {
        let arguments = ProcessInfo.processInfo.arguments

        // Reset onboarding for testing
        if arguments.contains("--reset-onboarding") {
            let preferences = OnboardingPreferences()
            preferences.reset()
            print("[TheWallApp] Onboarding reset via launch argument")
        }

        // Use test database for testing
        if arguments.contains("--use-test-database") {
            print("[TheWallApp] Using test database mode")
            // This can be checked in CompanyDatabase.load() if needed
        }
    }
}

/// ObservableObject wrapper for OnboardingPreferences
///
/// This allows OnboardingPreferences to work with @StateObject
extension OnboardingPreferences: ObservableObject {
    // No additional implementation needed - the protocol conformance is sufficient
}
