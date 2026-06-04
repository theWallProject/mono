import SwiftUI

/// Company database browser with search
struct DatabaseBrowserView: View {

    @State private var searchText = ""
    @State private var database: CompanyDatabase?
    @State private var isLoading = true
    @State private var error: Error?
    @State private var selectedCompany: Company?

    private var isSearching: Bool {
        !searchText.isEmpty
    }

    private var filteredCompanies: [Company] {
        guard let database = database, isSearching else { return [] }
        return database.search(query: searchText)
    }

    var body: some View {
        VStack(spacing: 0) {
            // Inline search bar
            searchBar

            // Content
            Group {
                if isLoading {
                    loadingView
                } else if error != nil {
                    errorView
                } else if !isSearching {
                    initialStateView
                } else if filteredCompanies.isEmpty {
                    emptyStateView
                } else {
                    companyListView
                }
            }
        }
        .background(Color.wallBackground)
        .sheet(item: $selectedCompany) { company in
            CompanyDetailView(company: company)
        }
        .task {
            await loadDatabase()
        }
    }

    // MARK: - Search Bar

    private var searchBar: some View {
        HStack(spacing: 8) {
            Image(systemName: "magnifyingglass")
                .foregroundStyle(Color.wallOnSurface.opacity(0.4))

            TextField(
                String(localized: "database.search.prompt", defaultValue: "Search companies or domains"),
                text: $searchText
            )
            .font(.wallBody)
            .autocorrectionDisabled()
            .textInputAutocapitalization(.never)

            if !searchText.isEmpty {
                Button {
                    searchText = ""
                } label: {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundStyle(Color.wallOnSurface.opacity(0.4))
                }
            }
        }
        .padding(12)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color.wallSurfaceVariant)
        )
        .padding(.horizontal, 16)
        .padding(.vertical, 8)
    }

    // MARK: - Subviews

    private var loadingView: some View {
        VStack(spacing: 16) {
            ProgressView()
                .scaleEffect(1.5)

            Text(String(localized: "database.loading", defaultValue: "Loading database..."))
                .font(.wallBody)
                .foregroundStyle(Color.wallOnSurface.opacity(0.7))
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color.wallBackground)
    }

    private var errorView: some View {
        VStack(spacing: 16) {
            Image(systemName: "exclamationmark.triangle")
                .font(.system(size: 48))
                .foregroundStyle(Color.wallPrimary)

            Text(String(localized: "database.error.title", defaultValue: "Failed to load database"))
                .font(.wallHeading3)
                .foregroundStyle(Color.wallOnSurface)

            if let error = error {
                Text(error.localizedDescription)
                    .font(.wallCaption)
                    .foregroundStyle(Color.wallOnSurface.opacity(0.7))
                    .multilineTextAlignment(.center)
            }

            Button {
                Task {
                    await loadDatabase()
                }
            } label: {
                Text(String(localized: "database.error.retry", defaultValue: "Retry"))
                    .font(.wallButton)
                    .foregroundStyle(.white)
                    .padding(.horizontal, 32)
                    .padding(.vertical, 12)
                    .background(
                        RoundedRectangle(cornerRadius: 8)
                            .fill(Color.wallPrimary)
                    )
            }
        }
        .padding()
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color.wallBackground)
    }

    private var initialStateView: some View {
        VStack(spacing: 20) {
            Spacer()

            Image(systemName: "magnifyingglass")
                .font(.system(size: 52, weight: .light))
                .foregroundStyle(Color.wallPrimary.opacity(0.5))

            VStack(spacing: 8) {
                Text(String(localized: "database.initial.title", defaultValue: "Search the Database"))
                    .font(.wallHeading3)
                    .foregroundStyle(Color.wallOnSurface)

                Text(String(localized: "database.initial.subtitle", defaultValue: "Enter a company name, app, or website to check if it's on the boycott list"))
                    .font(.wallCaption)
                    .foregroundStyle(Color.wallOnSurface.opacity(0.6))
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 32)
            }

            // Example chips
            VStack(spacing: 8) {
                Text(String(localized: "database.initial.examples", defaultValue: "Try searching for"))
                    .font(.system(size: 12, weight: .medium))
                    .foregroundStyle(Color.wallOnSurface.opacity(0.4))

                HStack(spacing: 8) {
                    SearchChip(text: "Coca-Cola")
                    SearchChip(text: "facebook.com")
                    SearchChip(text: "Nestlé")
                }
            }
            .padding(.top, 4)

            Spacer()
            Spacer()
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color.wallBackground)
    }

    private var emptyStateView: some View {
        VStack(spacing: 16) {
            Image(systemName: "magnifyingglass")
                .font(.system(size: 48))
                .foregroundStyle(Color.wallOnSurface.opacity(0.3))

            Text(String(localized: "database.empty.title", defaultValue: "No companies found"))
                .font(.wallHeading3)
                .foregroundStyle(Color.wallOnSurface)

            Text(String(localized: "database.empty.subtitle", defaultValue: "Try a different search term"))
                .font(.wallCaption)
                .foregroundStyle(Color.wallOnSurface.opacity(0.7))
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color.wallBackground)
    }

    private var companyListView: some View {
        ScrollView {
            LazyVStack(spacing: 0) {
                ForEach(filteredCompanies) { company in
                    CompanyRowView(company: company)
                        .onTapGesture {
                            selectedCompany = company
                        }

                    Divider()
                        .padding(.leading, 16)
                }
            }
        }
        .background(Color.wallBackground)
    }

    // MARK: - Data Loading

    private func loadDatabase() async {
        isLoading = true
        error = nil

        do {
            let loaded = try CompanyDatabase.load()
            await MainActor.run {
                database = loaded
                isLoading = false
            }
        } catch {
            print("[DatabaseBrowser] Failed to load: \(error)")
            await MainActor.run {
                self.error = error
                isLoading = false
            }
        }
    }
}

/// Company row component
private struct CompanyRowView: View {

    let company: Company

    var body: some View {
        HStack(spacing: 12) {
            // Icon — semantically tinted: amber lightbulb for hints, red building for flagged companies
            ZStack {
                Circle()
                    .fill(accentTint.opacity(0.12))
                    .frame(width: 44, height: 44)

                Image(systemName: company.isAlternative ? "lightbulb.fill" : "building.2")
                    .font(.system(size: 20))
                    .foregroundStyle(accentTint)
            }

            // Info
            VStack(alignment: .leading, spacing: 4) {
                Text(company.name)
                    .font(.wallBodyMedium)
                    .foregroundStyle(Color.wallOnSurface)

                if company.isAlternative {
                    HStack(spacing: 4) {
                        Image(systemName: "arrow.right")
                            .font(.system(size: 10, weight: .semibold))
                            .foregroundStyle(Color.wallOnSurface.opacity(0.4))
                            .flipsForRightToLeftLayoutDirection(true)
                        Text(altSubtitle)
                            .font(.wallCaption)
                            .foregroundStyle(Color.wallOnSurface.opacity(0.6))
                            .lineLimit(1)
                    }

                    Text(String(localized: "database.row.alternativeTag", defaultValue: "Suggested alternative"))
                        .font(.system(size: 10, weight: .semibold))
                        .foregroundStyle(accentTint)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(
                            Capsule().fill(accentTint.opacity(0.14))
                        )
                } else {
                    Text(company.domain)
                        .font(.wallCaption)
                        .foregroundStyle(Color.wallOnSurface.opacity(0.6))

                    if !company.companyReasons.isEmpty {
                        HStack(spacing: 4) {
                            ForEach(company.companyReasons.prefix(3), id: \.self) { reason in
                                Text(reason.rawValue.uppercased())
                                    .font(.system(size: 10, weight: .semibold))
                                    .foregroundStyle(Color.wallBadgeText)
                                    .padding(.horizontal, 6)
                                    .padding(.vertical, 2)
                                    .background(
                                        Capsule().fill(Color.wallBadgeBg)
                                    )
                            }

                            if company.companyReasons.count > 3 {
                                Text("+\(company.companyReasons.count - 3)")
                                    .font(.system(size: 10, weight: .semibold))
                                    .foregroundStyle(Color.wallOnSurface.opacity(0.5))
                            }
                        }
                    }
                }
            }

            Spacer()

            Image(systemName: "chevron.right")
                .font(.system(size: 14))
                .foregroundStyle(Color.wallOnSurface.opacity(0.3))
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .background(Color.wallBackground)
    }

    private var accentTint: Color {
        // Hints use amber/secondary palette; flagged companies stay in the primary red palette.
        company.isAlternative ? Color.wallSecondary : Color.wallPrimary
    }

    private var altSubtitle: String {
        let target = company.domain
        return String(format: String(localized: "database.row.alternativeTo", defaultValue: "Alternative to %@"), target)
    }
}

/// Tappable search suggestion chip.
private struct SearchChip: View {

    let text: String

    var body: some View {
        Text(text)
            .font(.system(size: 13, weight: .medium))
            .foregroundStyle(Color.wallPrimary)
            .padding(.horizontal, 14)
            .padding(.vertical, 7)
            .background(
                Capsule()
                    .fill(Color.wallPrimary.opacity(0.1))
            )
            .overlay(
                Capsule()
                    .stroke(Color.wallPrimary.opacity(0.2), lineWidth: 1)
            )
    }
}

#Preview {
    NavigationStack {
        DatabaseBrowserView()
            .navigationTitle("Database")
    }
}
