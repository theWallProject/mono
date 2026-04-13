import SwiftUI

/// Primary button component with The Wall styling
struct PrimaryButtonView: View {

    let title: String
    let action: () -> Void
    var isSecondary: Bool = false

    var body: some View {
        Button {
            action()
        } label: {
            Text(title)
                .font(.wallButton)
                .foregroundStyle(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
                .background(
                    RoundedRectangle(cornerRadius: 12)
                        .fill(isSecondary ? Color.wallSecondary : Color.wallPrimary)
                )
        }
        .buttonStyle(.plain)
    }
}

#Preview {
    VStack(spacing: 16) {
        PrimaryButtonView(title: "Continue") {}
        PrimaryButtonView(title: "Secondary", isSecondary: true) {}
    }
    .padding()
}
