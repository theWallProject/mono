import SwiftUI

/// Company detail modal view
struct CompanyDetailView: View {

    let company: Company
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    // Header
                    VStack(alignment: .leading, spacing: 8) {
                        Text(company.name)
                            .font(.wallHeading1)
                            .foregroundStyle(Color.wallOnSurface)

                        Text(company.domain)
                            .font(.wallBody)
                            .foregroundStyle(Color.wallOnSurface.opacity(0.7))
                    }

                    // Reasons section
                    if !company.companyReasons.isEmpty {
                        VStack(alignment: .leading, spacing: 12) {
                            Text(String(localized: "companyDetail.reasons", defaultValue: "Reasons for Flagging"))
                                .font(.wallHeading3)
                                .foregroundStyle(Color.wallOnSurface)

                            VStack(spacing: 8) {
                                ForEach(company.companyReasons, id: \.self) { reason in
                                    ReasonRowView(reason: reason)
                                }
                            }
                        }
                    }

                    // Alternatives
                    if let alternatives = company.alternatives, !alternatives.isEmpty {
                        VStack(alignment: .leading, spacing: 12) {
                            Text(String(localized: "companyDetail.alternatives", defaultValue: "Suggested Alternatives"))
                                .font(.wallHeading3)
                                .foregroundStyle(Color.wallOnSurface)

                            VStack(spacing: 8) {
                                ForEach(alternatives, id: \.self) { alt in
                                    HStack {
                                        VStack(alignment: .leading, spacing: 2) {
                                            Text(alt.name)
                                                .font(.wallBodyMedium)
                                                .foregroundStyle(Color.wallOnSurface)
                                            Text(alt.website)
                                                .font(.wallCaption)
                                                .foregroundStyle(Color.wallOnSurface.opacity(0.5))
                                        }
                                        Spacer()
                                    }
                                    .padding()
                                    .background(
                                        RoundedRectangle(cornerRadius: 8)
                                            .fill(Color.wallSurfaceVariant)
                                    )
                                }
                            }
                        }
                    }

                    // Social links
                    if !company.social.isEmpty {
                        VStack(alignment: .leading, spacing: 12) {
                            Text(String(localized: "companyDetail.social", defaultValue: "Social Media"))
                                .font(.wallHeading3)
                                .foregroundStyle(Color.wallOnSurface)

                            VStack(spacing: 8) {
                                ForEach(Array(company.social.keys.sorted()), id: \.self) { platform in
                                    if let handle = company.social[platform] {
                                        SocialLinkView(platform: platform, handle: handle)
                                    }
                                }
                            }
                        }
                    }

                    // Stock ticker
                    if let ticker = company.stockTicker {
                        VStack(alignment: .leading, spacing: 12) {
                            Text(String(localized: "companyDetail.stockTicker", defaultValue: "Stock Ticker"))
                                .font(.wallHeading3)
                                .foregroundStyle(Color.wallOnSurface)

                            Text(ticker)
                                .font(.wallBody)
                                .foregroundStyle(Color.wallOnSurface.opacity(0.7))
                        }
                    }
                }
                .padding()
            }
            .background(Color.wallBackground)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        dismiss()
                    } label: {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundStyle(Color.wallOnSurface.opacity(0.3))
                    }
                }
            }
        }
    }
}

/// Reason row component
private struct ReasonRowView: View {

    let reason: CompanyReason

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: reason.iconName)
                .font(.system(size: 20))
                .foregroundStyle(Color.wallPrimary)
                .frame(width: 32)

            Text(reason.localizedDescription)
                .font(.wallCaption)
                .foregroundStyle(Color.wallOnSurface)

            Spacer()
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 8)
                .fill(Color.wallSurfaceVariant)
        )
    }
}

/// Social link view component
private struct SocialLinkView: View {

    let platform: String
    let handle: String

    var body: some View {
        HStack {
            Image(systemName: iconForPlatform(platform))
                .foregroundStyle(Color.wallPrimary)

            Text("@\(handle)")
                .font(.wallCaption)
                .foregroundStyle(Color.wallOnSurface.opacity(0.7))

            Spacer()

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

    private func iconForPlatform(_ platform: String) -> String {
        switch platform.lowercased() {
        case "twitter", "x":
            return "bird"
        case "instagram":
            return "camera"
        case "facebook":
            return "person.2"
        case "linkedin":
            return "briefcase"
        default:
            return "link"
        }
    }
}

#Preview {
    CompanyDetailView(
        company: Company(
            id: "example-corp",
            name: "Example Corp",
            reasons: ["h", "f"],
            website: "example.com",
            facebook: "examplecorp",
            instagram: "example_corp",
            linkedin: "example-corp",
            twitter: "example",
            github: nil,
            threads: nil,
            tiktok: nil,
            youtubeChannel: nil,
            youtubePage: nil,
            stockTicker: "EXMP",
            alternatives: [
                Alternative(name: "Better Company", website: "https://better.com"),
                Alternative(name: "Good Corp", website: "https://goodcorp.com")
            ]
        )
    )
}
