import SwiftUI

/// Completion page (Page 4 of onboarding)
struct CompletionPageView: View {

    @State private var isAnimating = false

    var body: some View {
        VStack(spacing: 32) {
            Spacer()

            // Checkmark animation
            ZStack {
                // Outer circle
                Circle()
                    .stroke(Color.wallSecondary.opacity(0.2), lineWidth: 4)
                    .frame(width: 120, height: 120)

                // Inner circle
                Circle()
                    .fill(Color.wallSecondary)
                    .frame(width: 100, height: 100)
                    .scaleEffect(isAnimating ? 1.0 : 0.5)
                    .opacity(isAnimating ? 1.0 : 0.0)

                // Checkmark
                Image(systemName: "checkmark")
                    .font(.system(size: 50, weight: .bold))
                    .foregroundStyle(.white)
                    .scaleEffect(isAnimating ? 1.0 : 0.5)
                    .opacity(isAnimating ? 1.0 : 0.0)
            }
            .onAppear {
                withAnimation(.spring(response: 0.6, dampingFraction: 0.7)) {
                    isAnimating = true
                }
            }

            // Title
            Text(String(localized: "completion.title", defaultValue: "You're All Set!"))
                .font(.wallHeading1)
                .foregroundStyle(Color.wallOnSurface)
                .multilineTextAlignment(.center)

            // Message
            VStack(spacing: 12) {
                Text(String(localized: "completion.message", defaultValue: "The Wall is now protecting your browsing"))
                    .font(.wallBody)
                    .foregroundStyle(Color.wallOnSurface.opacity(0.7))
                    .multilineTextAlignment(.center)

                Text(String(localized: "completion.visitWebsite", defaultValue: "Visit any website and see The Wall in action"))
                    .font(.wallCaption)
                    .foregroundStyle(Color.wallOnSurface.opacity(0.5))
                    .multilineTextAlignment(.center)
            }

            Spacer()

            // Features list
            VStack(alignment: .leading, spacing: 16) {
                FeatureRowView(
                    icon: "magnifyingglass.circle.fill",
                    text: String(localized: "completion.feature.browse", defaultValue: "Browse our database of 19,000+ companies")
                )

                FeatureRowView(
                    icon: "shield.checkered",
                    text: String(localized: "completion.feature.status", defaultValue: "Check extension status anytime")
                )

                FeatureRowView(
                    icon: "gearshape.fill",
                    text: String(localized: "completion.feature.settings", defaultValue: "Customize settings and preferences")
                )
            }
            .padding()
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color.wallSurfaceVariant)
            )

            Spacer()
        }
        .padding()
    }
}

/// Feature row component
private struct FeatureRowView: View {

    let icon: String
    let text: String

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 20))
                .foregroundStyle(Color.wallPrimary)

            Text(text)
                .font(.wallCaption)
                .foregroundStyle(Color.wallOnSurface)

            Spacer()
        }
    }
}

#Preview {
    CompletionPageView()
        .background(Color.wallBackground)
}
