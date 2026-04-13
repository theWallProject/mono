import SwiftUI

/// The Wall typography system
///
/// Provides consistent font styles using locale-aware font selection.
/// Inter is used for Latin scripts, NotoSansArabic for Arabic.
/// Fonts are registered in Info.plist under UIAppFonts.
extension Font {

    // MARK: - Typography Scale

    /// Heading 1 - Large titles
    /// Size: 28pt, Weight: Bold
    static var wallHeading1: Font {
        LocaleAwareFont.bold(size: 28)
    }

    /// Heading 2 - Section headers
    /// Size: 22pt, Weight: SemiBold
    static var wallHeading2: Font {
        LocaleAwareFont.semiBold(size: 22)
    }

    /// Heading 3 - Subsection headers
    /// Size: 18pt, Weight: SemiBold
    static var wallHeading3: Font {
        LocaleAwareFont.semiBold(size: 18)
    }

    /// Body text - Regular paragraphs
    /// Size: 16pt, Weight: Regular
    static var wallBody: Font {
        LocaleAwareFont.regular(size: 16)
    }

    /// Body medium - Emphasized body text
    /// Size: 16pt, Weight: Medium
    static var wallBodyMedium: Font {
        LocaleAwareFont.medium(size: 16)
    }

    /// Caption - Small labels and secondary text
    /// Size: 14pt, Weight: Regular
    static var wallCaption: Font {
        LocaleAwareFont.regular(size: 14)
    }

    /// Caption medium - Emphasized captions
    /// Size: 14pt, Weight: Medium
    static var wallCaptionMedium: Font {
        LocaleAwareFont.medium(size: 14)
    }

    /// Button text
    /// Size: 16pt, Weight: SemiBold
    static var wallButton: Font {
        LocaleAwareFont.semiBold(size: 16)
    }
}

/// Text style extensions for convenience
extension Text {

    func wallHeading1() -> some View {
        self.font(.wallHeading1)
            .foregroundStyle(Color.wallOnSurface)
    }

    func wallHeading2() -> some View {
        self.font(.wallHeading2)
            .foregroundStyle(Color.wallOnSurface)
    }

    func wallHeading3() -> some View {
        self.font(.wallHeading3)
            .foregroundStyle(Color.wallOnSurface)
    }

    func wallBody() -> some View {
        self.font(.wallBody)
            .foregroundStyle(Color.wallOnSurface)
    }

    func wallBodyMedium() -> some View {
        self.font(.wallBodyMedium)
            .foregroundStyle(Color.wallOnSurface)
    }

    func wallCaption() -> some View {
        self.font(.wallCaption)
            .foregroundStyle(Color.wallOnSurface)
    }

    func wallButton() -> some View {
        self.font(.wallButton)
    }
}
