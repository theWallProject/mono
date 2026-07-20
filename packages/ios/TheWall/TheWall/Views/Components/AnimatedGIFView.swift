import SwiftUI
import UIKit
import ImageIO

/// Plays a bundled animated GIF on a loop inside a SwiftUI hierarchy.
struct AnimatedGIFView: UIViewRepresentable {

    let resourceName: String
    let resourceExtension: String

    init(_ resourceName: String, ext: String = "gif") {
        self.resourceName = resourceName
        self.resourceExtension = ext
    }

    func makeUIView(context: Context) -> UIImageView {
        let imageView = UIImageView()
        imageView.contentMode = .scaleAspectFit
        imageView.clipsToBounds = true
        imageView.image = Self.loadAnimatedImage(name: resourceName, ext: resourceExtension)
        imageView.setContentHuggingPriority(.defaultLow, for: .vertical)
        imageView.setContentHuggingPriority(.defaultLow, for: .horizontal)
        return imageView
    }

    func updateUIView(_ uiView: UIImageView, context: Context) {}

    // MARK: - GIF decoding

    private static func loadAnimatedImage(name: String, ext: String) -> UIImage? {
        guard
            let url = Bundle.main.url(forResource: name, withExtension: ext),
            let data = try? Data(contentsOf: url),
            let source = CGImageSourceCreateWithData(data as CFData, nil)
        else {
            return UIImage(named: name)
        }

        let count = CGImageSourceGetCount(source)
        guard count > 1 else {
            if let cg = CGImageSourceCreateImageAtIndex(source, 0, nil) {
                return UIImage(cgImage: cg)
            }
            return nil
        }

        var frames: [UIImage] = []
        frames.reserveCapacity(count)
        var totalDuration: TimeInterval = 0

        for index in 0..<count {
            guard let cg = CGImageSourceCreateImageAtIndex(source, index, nil) else { continue }
            frames.append(UIImage(cgImage: cg))
            totalDuration += frameDuration(source: source, index: index)
        }

        if totalDuration <= 0 {
            totalDuration = Double(frames.count) / 12.0
        }

        return UIImage.animatedImage(with: frames, duration: totalDuration)
    }

    private static func frameDuration(source: CGImageSource, index: Int) -> TimeInterval {
        let defaultDuration: TimeInterval = 0.1
        guard
            let properties = CGImageSourceCopyPropertiesAtIndex(source, index, nil) as? [CFString: Any],
            let gifProperties = properties[kCGImagePropertyGIFDictionary] as? [CFString: Any]
        else {
            return defaultDuration
        }

        if let unclamped = gifProperties[kCGImagePropertyGIFUnclampedDelayTime] as? Double, unclamped > 0 {
            return unclamped
        }
        if let clamped = gifProperties[kCGImagePropertyGIFDelayTime] as? Double, clamped > 0 {
            return clamped
        }
        return defaultDuration
    }
}
