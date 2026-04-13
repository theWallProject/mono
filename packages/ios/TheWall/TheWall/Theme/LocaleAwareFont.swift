import SwiftUI

/// Locale-aware font selection helper
///
/// Automatically selects Inter (Latin) or NotoSansArabic based on the current locale.
/// Both font families are registered in Info.plist under UIAppFonts.
enum LocaleAwareFont {

    /// Whether the current locale uses Arabic script
    static var isArabic: Bool {
        Locale.current.language.languageCode == .arabic
    }

    // MARK: - Font Names

    private enum Latin: String {
        case regular = "Inter-Regular"
        case medium = "Inter-Medium"
        case semiBold = "Inter-SemiBold"
        case bold = "Inter-Bold"
    }

    private enum Arabic: String {
        case regular = "NotoSansArabic-Regular"
        case medium = "NotoSansArabic-Medium"
        case semiBold = "NotoSansArabic-SemiBold"
        case bold = "NotoSansArabic-Bold"
    }

    // MARK: - Font Builders

    static func regular(size: CGFloat) -> Font {
        let name = isArabic ? Arabic.regular.rawValue : Latin.regular.rawValue
        return .custom(name, size: size)
    }

    static func medium(size: CGFloat) -> Font {
        let name = isArabic ? Arabic.medium.rawValue : Latin.medium.rawValue
        return .custom(name, size: size)
    }

    static func semiBold(size: CGFloat) -> Font {
        let name = isArabic ? Arabic.semiBold.rawValue : Latin.semiBold.rawValue
        return .custom(name, size: size)
    }

    static func bold(size: CGFloat) -> Font {
        let name = isArabic ? Arabic.bold.rawValue : Latin.bold.rawValue
        return .custom(name, size: size)
    }
}
