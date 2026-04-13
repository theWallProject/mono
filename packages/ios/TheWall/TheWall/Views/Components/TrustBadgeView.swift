import SwiftUI

/// Trust badge component for onboarding
struct TrustBadgeView: View {

    let icon: String
    let title: String
    let subtitle: String

    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.system(size: 32))
                .foregroundStyle(Color.wallPrimary)

            Text(title)
                .font(.wallHeading3)
                .foregroundStyle(Color.wallOnSurface)

            Text(subtitle)
                .font(.wallCaption)
                .foregroundStyle(Color.wallOnSurface.opacity(0.7))
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color.wallSurfaceVariant)
        )
    }
}

#Preview {
    VStack(spacing: 16) {
        TrustBadgeView(
            icon: "lock.shield",
            title: "Private",
            subtitle: "No tracking"
        )

        TrustBadgeView(
            icon: "dollarsign.circle.fill",
            title: "Free",
            subtitle: "Always"
        )

        TrustBadgeView(
            icon: "chevron.left.forwardslash.chevron.right",
            title: "Open Source",
            subtitle: "Transparent"
        )
    }
    .padding()
}
