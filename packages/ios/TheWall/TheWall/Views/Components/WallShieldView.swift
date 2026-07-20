import SwiftUI

/// Brand logo component using the actual asset.
struct WallShieldView: View {

    var body: some View {
        Image("WallLogo")
            .resizable()
            .aspectRatio(contentMode: .fit)
    }
}

#Preview {
    WallShieldView()
        .frame(width: 120, height: 120)
        .background(Color.wallBackground)
}
