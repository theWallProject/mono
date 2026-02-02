import { CompressedManualItemType } from "../../types"

/**
 * Upscrolled hints - Palestinian-founded social media alternative
 *
 * Upscrolled is a social media platform founded by Issam Hijazi
 * (Palestinian-Jordanian-Australian developer).
 * Company: Recursive Methods Pty Ltd (Australia)
 * Backed by Tech for Palestine
 */
export const upscrolledHints: CompressedManualItemType[] = [
  {
    name: "Upscrolled",
    ws: ["https://instagram.com", "https://tiktok.com", "https://facebook.com", "https://threads.net"],
    isHint: true,
    hintText:
      "Tired of shadowbanning? Upscrolled is Palestinian-founded, with chronological feeds and transparent algorithms.",
    hintUrl: "https://upscrolled.com/?ref=thewall",
    hintCompanyId: "upscrolled_social",
    hint_android_id: "com.upscrolled.app",
    android_app_ids: [
      "com.facebook.katana",
      "com.facebook.lite",
      "com.instagram.android",
      // threads app
      "com.instagram.barcelona",
      // tiktok app
      "com.zhiliaoapp.musically",
      "com.ss.android.ugc.tiktok.pro"
    ]
  }
]
