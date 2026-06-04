import SwiftUI

/// Company detail modal view
struct CompanyDetailView: View {

    let company: Company
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            ScrollView {
                if company.isAlternative {
                    HintDetailView(company: company)
                } else {
                    FlaggedDetailView(company: company)
                }
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

// MARK: - Hint Detail (suggested alternative)

private struct HintDetailView: View {

    let company: Company

    var body: some View {
        VStack(alignment: .leading, spacing: 20) {
            // Top chip: "Alternative to facebook.com"
            HStack(spacing: 6) {
                Image(systemName: "arrow.triangle.swap")
                    .font(.system(size: 11, weight: .semibold))
                Text(String(format: String(localized: "companyDetail.alternativeToTitle", defaultValue: "Alternative to %@"), company.domain))
                    .font(.system(size: 12, weight: .semibold))
            }
            .foregroundStyle(Color.wallSecondary)
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .background(
                Capsule().fill(Color.wallSecondary.opacity(0.12))
            )

            // Name + host
            VStack(alignment: .leading, spacing: 6) {
                Text(company.name)
                    .font(.wallHeading1)
                    .foregroundStyle(Color.wallOnSurface)

                if let host = company.alternativeHost {
                    Text(host)
                        .font(.wallBody)
                        .foregroundStyle(Color.wallOnSurface.opacity(0.6))
                }
            }

            // Pitch card
            if let hint = company.hintText, !hint.isEmpty {
                HStack(alignment: .top, spacing: 12) {
                    ZStack {
                        Circle()
                            .fill(Color.wallSecondary.opacity(0.18))
                            .frame(width: 36, height: 36)
                        Image(systemName: "lightbulb.fill")
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundStyle(Color.wallSecondary)
                    }

                    Text(hint)
                        .font(.wallBody)
                        .foregroundStyle(Color.wallOnSurface)
                        .fixedSize(horizontal: false, vertical: true)
                }
                .padding(16)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(
                    RoundedRectangle(cornerRadius: 14)
                        .fill(Color.wallSecondary.opacity(0.08))
                        .overlay(
                            RoundedRectangle(cornerRadius: 14)
                                .strokeBorder(Color.wallSecondary.opacity(0.25), lineWidth: 1)
                        )
                )
            }

            // Primary CTA
            if let raw = company.hintUrl, let url = URL(string: raw) {
                Link(destination: url) {
                    HStack(spacing: 8) {
                        Image(systemName: "safari")
                            .font(.system(size: 16, weight: .semibold))
                        Text(String(format: String(localized: "companyDetail.alternativeVisit", defaultValue: "Visit %@"), company.name))
                            .font(.wallButton)
                        Image(systemName: "arrow.up.right")
                            .font(.system(size: 12, weight: .semibold))
                            .flipsForRightToLeftLayoutDirection(false)
                    }
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(
                        RoundedRectangle(cornerRadius: 12)
                            .fill(Color.wallSecondary)
                    )
                }
                .buttonStyle(.plain)
            }

            // Footer disclosure
            HStack(alignment: .top, spacing: 8) {
                Image(systemName: "info.circle")
                    .font(.system(size: 13))
                    .foregroundStyle(Color.wallOnSurface.opacity(0.45))
                Text(String(localized: "companyDetail.alternativeDisclosure", defaultValue: "The Wall suggests this alternative based on community curation."))
                    .font(.wallCaption)
                    .foregroundStyle(Color.wallOnSurface.opacity(0.5))
                    .fixedSize(horizontal: false, vertical: true)
            }
            .padding(.top, 4)

            Spacer(minLength: 0)
        }
        .padding()
    }
}

// MARK: - Flagged Detail (existing layout)

private struct FlaggedDetailView: View {

    let company: Company

    var body: some View {
        VStack(alignment: .leading, spacing: 24) {
            VStack(alignment: .leading, spacing: 8) {
                Text(company.name)
                    .font(.wallHeading1)
                    .foregroundStyle(Color.wallOnSurface)

                Text(company.domain)
                    .font(.wallBody)
                    .foregroundStyle(Color.wallOnSurface.opacity(0.7))
            }

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
}

// MARK: - Reusable rows

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

#Preview("Flagged") {
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
            ],
            isHint: nil,
            hintText: nil,
            hintUrl: nil,
            hintCompanyId: nil
        )
    )
}

#Preview("Hint") {
    CompanyDetailView(
        company: Company(
            id: "hint_ws_Upscrolled_2",
            name: "Upscrolled",
            reasons: [],
            website: "facebook.com",
            facebook: nil,
            instagram: nil,
            linkedin: nil,
            twitter: nil,
            github: nil,
            threads: nil,
            tiktok: nil,
            youtubeChannel: nil,
            youtubePage: nil,
            stockTicker: nil,
            alternatives: nil,
            isHint: true,
            hintText: "Tired of shadowbanning? Upscrolled is Palestinian-founded, with chronological feeds and transparent algorithms.",
            hintUrl: "https://upscrolled.com/?ref=thewall",
            hintCompanyId: "upscrolled_social"
        )
    )
}
