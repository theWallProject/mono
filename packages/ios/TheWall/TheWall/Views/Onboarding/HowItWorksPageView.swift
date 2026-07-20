import SwiftUI

/// How It Works page (Page 2 of onboarding)
struct HowItWorksPageView: View {

    var body: some View {
        VStack(spacing: 32) {
            Spacer()

            // Title
            Text(String(localized: "howItWorks.title", defaultValue: "How It Works"))
                .font(.wallHeading1)
                .foregroundStyle(Color.wallOnSurface)

            // Subtitle
            Text(String(localized: "howItWorks.subtitle", defaultValue: "Simple, automatic, effective"))
                .font(.wallBody)
                .foregroundStyle(Color.wallOnSurface.opacity(0.7))
                .multilineTextAlignment(.center)

            Spacer()

            // 3-step illustration
            VStack(spacing: 40) {
                StepView(
                    number: 1,
                    icon: "safari",
                    title: String(localized: "howItWorks.step1.title", defaultValue: "Browse Normally"),
                    description: String(localized: "howItWorks.step1.description", defaultValue: "Use Safari as you always do")
                )

                StepView(
                    number: 2,
                    icon: "magnifyingglass.circle",
                    title: String(localized: "howItWorks.step2.title", defaultValue: "Automatic Checking"),
                    description: String(localized: "howItWorks.step2.description", defaultValue: "The Wall checks every website against 19K+ companies")
                )

                StepView(
                    number: 3,
                    icon: "hand.raised.fill",
                    title: String(localized: "howItWorks.step3.title", defaultValue: "Get Notified"),
                    description: String(localized: "howItWorks.step3.description", defaultValue: "See an overlay on flagged websites with alternatives")
                )
            }

            Spacer()
        }
        .padding()
    }
}

/// Individual step component
private struct StepView: View {

    let number: Int
    let icon: String
    let title: String
    let description: String

    var body: some View {
        HStack(spacing: 16) {
            // Step number badge
            ZStack {
                Circle()
                    .fill(Color.wallPrimary)
                    .frame(width: 48, height: 48)

                Text("\(number)")
                    .font(.wallHeading2)
                    .foregroundStyle(.white)
            }

            VStack(alignment: .leading, spacing: 4) {
                HStack(spacing: 8) {
                    Image(systemName: icon)
                        .font(.system(size: 20))
                        .foregroundStyle(Color.wallPrimary)

                    Text(title)
                        .font(.wallHeading3)
                        .foregroundStyle(Color.wallOnSurface)
                }

                Text(description)
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

#Preview {
    HowItWorksPageView()
        .background(Color.wallBackground)
}
