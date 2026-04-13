import SwiftUI

/// Page indicator dots for onboarding
struct PageIndicatorView: View {

    let currentPage: Int
    let totalPages: Int

    var body: some View {
        HStack(spacing: 8) {
            ForEach(0..<totalPages, id: \.self) { index in
                Circle()
                    .fill(index == currentPage ? Color.wallPrimary : Color.wallOutline)
                    .frame(width: 8, height: 8)
                    .animation(.easeInOut, value: currentPage)
            }
        }
    }
}

#Preview {
    VStack(spacing: 20) {
        PageIndicatorView(currentPage: 0, totalPages: 4)
        PageIndicatorView(currentPage: 1, totalPages: 4)
        PageIndicatorView(currentPage: 2, totalPages: 4)
        PageIndicatorView(currentPage: 3, totalPages: 4)
    }
    .padding()
}
