import SwiftUI

/// Onboarding container view with horizontal paging
struct OnboardingView: View {

    @State private var currentPage = 0
    @Binding var isPresented: Bool

    private let totalPages = 4

    var body: some View {
        ZStack {
            Color.wallBackground
                .ignoresSafeArea()

            VStack(spacing: 0) {
                // Skip button (only on pages 1-3)
                HStack {
                    Spacer()

                    if currentPage < 3 {
                        Button {
                            withAnimation {
                                currentPage = 3
                            }
                        } label: {
                            Text(String(localized: "onboarding.skip", defaultValue: "Skip"))
                                .font(.wallBodyMedium)
                                .foregroundStyle(Color.wallOnSurface.opacity(0.6))
                        }
                        .padding()
                    } else {
                        // Empty spacer to maintain layout
                        Text("")
                            .padding()
                    }
                }

                // Page content
                TabView(selection: $currentPage) {
                    WelcomePageView()
                        .tag(0)

                    HowItWorksPageView()
                        .tag(1)

                    EnableExtensionPageView(onExtensionDetected: {
                        // Auto-advance to completion when extension detected
                        withAnimation {
                            currentPage = 3
                        }
                    })
                    .tag(2)

                    CompletionPageView()
                        .tag(3)
                }
                .tabViewStyle(.page(indexDisplayMode: .never))
                .animation(.easeInOut, value: currentPage)

                // Page indicator
                PageIndicatorView(
                    currentPage: currentPage,
                    totalPages: totalPages
                )
                .padding(.vertical, 16)

                // Navigation buttons
                HStack(spacing: 16) {
                    // Back button (except on first page)
                    if currentPage > 0 {
                        Button {
                            withAnimation {
                                currentPage -= 1
                            }
                        } label: {
                            Text(String(localized: "onboarding.back", defaultValue: "Back"))
                                .font(.wallButton)
                                .foregroundStyle(Color.wallPrimary)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 16)
                                .background(
                                    RoundedRectangle(cornerRadius: 12)
                                        .strokeBorder(Color.wallPrimary, lineWidth: 2)
                                )
                        }
                        .buttonStyle(.plain)
                    }

                    // Next/Done button
                    if currentPage < 3 {
                        PrimaryButtonView(
                            title: currentPage == 2
                                ? String(localized: "onboarding.enabled", defaultValue: "I've Enabled It")
                                : String(localized: "onboarding.next", defaultValue: "Next")
                        ) {
                            withAnimation {
                                currentPage += 1
                            }
                        }
                    } else {
                        PrimaryButtonView(title: String(localized: "onboarding.getStarted", defaultValue: "Get Started")) {
                            isPresented = false
                        }
                    }
                }
                .padding(.horizontal)
                .padding(.bottom, 32)
            }
        }
    }
}

#Preview {
    OnboardingView(isPresented: .constant(true))
}
