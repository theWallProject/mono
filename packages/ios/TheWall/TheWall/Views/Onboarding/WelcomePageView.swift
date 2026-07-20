import SwiftUI

/// Welcome page (Page 1 of onboarding)
struct WelcomePageView: View {

    @State private var isPulsing = false

    var body: some View {
        GeometryReader { geometry in
            ScrollView {
                VStack(spacing: 20) {
                    Spacer(minLength: 8)

                    // App icon from asset catalog
                    ZStack {
                        // Pulse ring
                        Circle()
                            .stroke(Color.wallPrimary.opacity(0.3), lineWidth: 2)
                            .frame(width: 160, height: 160)
                            .scaleEffect(isPulsing ? 1.15 : 1.0)
                            .opacity(isPulsing ? 0.0 : 0.5)

                        Circle()
                            .fill(Color.wallPrimary.opacity(0.08))
                            .frame(width: 150, height: 150)

                        Image("WallLogo")
                            .resizable()
                            .aspectRatio(contentMode: .fit)
                            .frame(width: 100, height: 100)
                            .clipShape(RoundedRectangle(cornerRadius: 22, style: .continuous))
                    }
                    .onAppear {
                        withAnimation(
                            .easeInOut(duration: 2.0)
                            .repeatForever(autoreverses: false)
                        ) {
                            isPulsing = true
                        }
                    }

                    // Title
                    Text(String(localized: "welcome.title", defaultValue: "The Wall"))
                        .font(.wallHeading1)
                        .foregroundStyle(Color.wallOnSurface)

                    // Subtitle
                    Text(String(localized: "welcome.subtitle", defaultValue: "Boycott Assistance"))
                        .font(.wallHeading2)
                        .foregroundStyle(Color.wallOnSurface.opacity(0.7))

                    // Company count stat
                    Text(String(localized: "welcome.companyCount", defaultValue: "19,000+ companies"))
                        .font(.wallBodyMedium)
                        .foregroundStyle(Color.wallPrimary)
                        .padding(.vertical, 12)
                        .padding(.horizontal, 24)
                        .background(
                            Capsule()
                                .fill(Color.wallBadgeBg)
                        )

                    Spacer(minLength: 16)

                    // Trust badges
                    VStack(spacing: 12) {
                        HStack(spacing: 12) {
                            TrustBadgeView(
                                icon: "lock.shield",
                                title: String(localized: "welcome.badge.private", defaultValue: "Private"),
                                subtitle: String(localized: "welcome.badge.noTracking", defaultValue: "No tracking")
                            )

                            TrustBadgeView(
                                icon: "dollarsign.circle.fill",
                                title: String(localized: "welcome.badge.free", defaultValue: "Free"),
                                subtitle: String(localized: "welcome.badge.always", defaultValue: "Always")
                            )
                        }

                        TrustBadgeView(
                            icon: "chevron.left.forwardslash.chevron.right",
                            title: String(localized: "welcome.badge.openSource", defaultValue: "Open Source"),
                            subtitle: String(localized: "welcome.badge.transparent", defaultValue: "Transparent & auditable")
                        )
                    }

                    Spacer(minLength: 16)
                }
                .frame(minHeight: geometry.size.height)
                .padding()
            }
        }
    }
}

#Preview {
    WelcomePageView()
        .background(Color.wallBackground)
}
