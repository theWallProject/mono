import SwiftUI

/// The Wall color system
///
/// Provides semantic color tokens that adapt to light and dark mode.
/// All colors are defined in Assets.xcassets/Colors/ with light/dark variants.
extension Color {

    // MARK: - Primary Colors

    /// Primary brand color (red-orange)
    /// Light: #B72B00, Dark: #B72B00
    static let wallPrimary = Color("WallPrimary")

    /// Darker variant of primary color
    /// Light: #932300, Dark: #932300
    static let wallPrimaryDark = Color("WallPrimaryDark")

    /// Secondary accent color (green)
    /// Light: #2E7D32, Dark: #2E7D32
    static let wallSecondary = Color("WallSecondary")

    // MARK: - Backgrounds

    /// Main background color
    /// Light: #FFFFFF (white), Dark: #0F0F0F (near black)
    static let wallBackground = Color("WallBackground")

    /// Surface color for cards and elevated elements
    /// Light: #FFFFFF, Dark: #1A1A1A
    static let wallSurface = Color("WallSurface")

    /// Surface variant for subtle differentiation
    /// Light: #F5F5F5, Dark: #242424
    static let wallSurfaceVariant = Color("WallSurfaceVariant")

    // MARK: - Text Colors

    /// Primary text color on surfaces
    /// Light: #1A1A1A, Dark: #FFFFFF
    static let wallOnSurface = Color("WallOnSurface")

    /// Primary text color on backgrounds
    /// Light: #1A1A1A, Dark: #FFFFFF
    static let wallOnBackground = Color("WallOnBackground")

    // MARK: - Borders

    /// Border and divider color
    /// Light: #E0E0E0, Dark: #333333
    static let wallOutline = Color("WallOutline")

    // MARK: - Badge Colors

    /// Badge background color
    /// Light: #FFE1CD, Dark: #3D1A12
    static let wallBadgeBg = Color("WallBadgeBg")

    /// Badge text color
    /// Light: #932300, Dark: #FFB4A1
    static let wallBadgeText = Color("WallBadgeText")
}
