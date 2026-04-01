import { describe, expect, it } from "vitest"

import {
  API_ENDPOINT_RULE_FACEBOOK,
  API_ENDPOINT_RULE_GITHUB,
  API_ENDPOINT_RULE_INSTAGRAM,
  API_ENDPOINT_RULE_LINKEDIN_COMPANY,
  API_ENDPOINT_RULE_THREADS,
  API_ENDPOINT_RULE_TIKTOK,
  API_ENDPOINT_RULE_TWITTER,
  API_ENDPOINT_RULE_YOUTUBE_CHANNEL,
  API_ENDPOINT_RULE_YOUTUBE_PROFILE,
  findHintByDomain,
  findInDatabaseByDomain,
  findInDatabaseBySelector,
  getMainDomain,
  getRegisteredDomain,
  FinalDBFileSchema,
  type FinalDBFileType
} from "./index"

/**
 * Helper function to test if a URL matches a regex pattern and extracts the ID
 */
function testRule(rule: { domain: string; regex: string }, url: string, shouldMatch: boolean, expectedId?: string) {
  // Twitter, LinkedIn, and YouTube profile IDs are case-insensitive, so use 'i' flag for these regexes
  const flags =
    rule.domain === "twitter.com" || rule.domain === "linkedin.com" || rule.domain === "youtube.com" ? "i" : ""
  const regex = new RegExp(rule.regex, flags)
  const match = regex.exec(url)

  if (shouldMatch) {
    expect(match).not.toBeNull()
    if (match && expectedId !== undefined) {
      // For YouTube profile, check all capture groups (user/, c/, @, or direct format)
      const capturedId = match[1] || match[2] || match[3] || match[4]
      expect(capturedId).toBe(expectedId)
    }
  } else {
    expect(match).toBeNull()
  }
}

describe("API_ENDPOINT_RULE_LINKEDIN_COMPANY", () => {
  const rule = API_ENDPOINT_RULE_LINKEDIN_COMPANY

  describe("positive cases", () => {
    it("should match linkedin.com/company/microsoft", () => {
      testRule(rule, "https://www.linkedin.com/company/microsoft", true, "microsoft")
    })

    it("should match linkedin.com/company/google with query params", () => {
      testRule(rule, "https://www.linkedin.com/company/google?trk=test", true, "google")
    })

    it("should match linkedin.com/showcase/tech-innovation", () => {
      testRule(rule, "https://www.linkedin.com/showcase/tech-innovation", true, "tech-innovation")
    })

    it("should match linkedin.com/showcase/wix-engineering", () => {
      testRule(rule, "https://www.linkedin.com/showcase/wix-engineering", true, "wix-engineering")
    })

    it("should match linkedin.com/company/wix-engineering", () => {
      testRule(rule, "https://www.linkedin.com/company/wix-engineering", true, "wix-engineering")
    })

    it("should match linkedin.com/showcase/startup-ecosystem with query params", () => {
      testRule(rule, "https://www.linkedin.com/showcase/startup-ecosystem?ref=test", true, "startup-ecosystem")
    })

    it("should match without protocol", () => {
      testRule(rule, "linkedin.com/company/apple", true, "apple")
    })

    it("should match with www", () => {
      testRule(rule, "https://www.linkedin.com/company/amazon", true, "amazon")
    })

    it("should match case-insensitive company names (LinkedIn IDs are case-insensitive)", () => {
      testRule(rule, "https://www.linkedin.com/company/Microsoft", true, "Microsoft")
      testRule(rule, "https://www.linkedin.com/company/MICROSOFT", true, "MICROSOFT")
      testRule(rule, "https://www.linkedin.com/COMPANY/google", true, "google")
      testRule(rule, "https://LINKEDIN.COM/company/apple", true, "apple")
      testRule(rule, "https://www.linkedin.com/SHOWCASE/tech-innovation", true, "tech-innovation")
    })
  })

  describe("negative cases", () => {
    it("should not match linkedin.com/school/mit", () => {
      testRule(rule, "https://www.linkedin.com/school/mit", false)
    })

    it("should not match linkedin.com/in/john-doe", () => {
      testRule(rule, "https://www.linkedin.com/in/john-doe", false)
    })

    it("should not match linkedin.com/feed", () => {
      testRule(rule, "https://www.linkedin.com/feed", false)
    })

    it("should not match linkedin.com/jobs", () => {
      testRule(rule, "https://www.linkedin.com/jobs", false)
    })

    it("should not match linkedin.com/groups", () => {
      testRule(rule, "https://www.linkedin.com/groups/12345", false)
    })

    it("should not match linkedin.com/posts", () => {
      testRule(rule, "https://www.linkedin.com/posts/activity-123456", false)
    })

    it("should not match linkedin.com/learning", () => {
      testRule(rule, "https://www.linkedin.com/learning", false)
    })

    it("should not match other domains", () => {
      testRule(rule, "https://www.facebook.com/meta", false)
    })

    it("should not match linkedin.com/company with no name", () => {
      testRule(rule, "https://www.linkedin.com/company", false)
    })
  })
})

describe("API_ENDPOINT_RULE_FACEBOOK", () => {
  const rule = API_ENDPOINT_RULE_FACEBOOK

  describe("positive cases", () => {
    it("should match facebook.com/zuck", () => {
      testRule(rule, "https://www.facebook.com/zuck", true, "zuck")
    })

    it("should match facebook.com/meta with query params", () => {
      testRule(rule, "https://www.facebook.com/meta?ref=share", true, "meta")
    })

    it("should not match facebook.com/pages/tech-company (pages is excluded)", () => {
      testRule(rule, "https://www.facebook.com/pages/tech-company", false)
    })

    it("should not match facebook.com/profile.php URLs", () => {
      testRule(rule, "https://www.facebook.com/profile.php?id=100089536429763", false)
    })

    it("should not match facebook.com/home.php URLs", () => {
      testRule(rule, "https://www.facebook.com/home.php", false)
    })

    it("should not match facebook.com/sharer.php URLs", () => {
      testRule(rule, "https://www.facebook.com/sharer.php?u=https://example.com", false)
    })

    it("should not match facebook.com/dialog.php URLs", () => {
      testRule(rule, "https://www.facebook.com/dialog.php?app_id=123", false)
    })

    it("should not match facebook.com/login.php URLs", () => {
      testRule(rule, "https://www.facebook.com/login.php?next=https://example.com", false)
    })

    it("should not match any facebook.com/*.php URLs", () => {
      testRule(rule, "https://www.facebook.com/plugins.php", false)
      testRule(rule, "https://www.facebook.com/connect.php", false)
      testRule(rule, "https://www.facebook.com/share.php", false)
    })

    it("should not match facebook.com/search URLs", () => {
      testRule(rule, "https://www.facebook.com/search?q=test", false)
    })

    it("should not match facebook.com/people (exact path)", () => {
      testRule(rule, "https://www.facebook.com/people", false)
    })

    it("should not match facebook.com/share (exact path)", () => {
      testRule(rule, "https://www.facebook.com/share", false)
    })

    it("should not match facebook.com/people/ (path starting with people)", () => {
      testRule(rule, "https://www.facebook.com/people/something", false)
    })

    it("should not match facebook.com/share/ (path starting with share)", () => {
      testRule(rule, "https://www.facebook.com/share/something", false)
    })

    it("should match without protocol", () => {
      testRule(rule, "facebook.com/facebook", true, "facebook")
    })

    it("should match with www", () => {
      testRule(rule, "https://www.facebook.com/netflix", true, "netflix")
    })

    it("should match facebook.com/peopleoffabric (username containing 'people')", () => {
      testRule(rule, "https://www.facebook.com/peopleoffabric", true, "peopleoffabric")
    })

    it("should match facebook.com/shareittIsrael (username containing 'share')", () => {
      testRule(rule, "https://www.facebook.com/shareittIsrael", true, "shareittIsrael")
    })

    it("should not match facebook.com/sharer/sharer.php (share dialog URL)", () => {
      testRule(rule, "https://www.facebook.com/sharer/sharer.php?u=https://example.com", false)
    })

    it("should not match facebook.com/sharer (exact path)", () => {
      testRule(rule, "https://www.facebook.com/sharer", false)
    })

    it("should not match facebook.com/dialog/feed (platform dialog URL)", () => {
      testRule(rule, "https://www.facebook.com/dialog/feed?app_id=123", false)
    })

    it("should not match facebook.com/plugins/like.php (embed plugin URL)", () => {
      testRule(rule, "https://www.facebook.com/plugins/like.php", false)
    })

    it("should not match facebook.com/hashtag/something (hashtag page)", () => {
      testRule(rule, "https://www.facebook.com/hashtag/something", false)
    })

    it("should not match facebook.com/settings (settings page)", () => {
      testRule(rule, "https://www.facebook.com/settings", false)
    })

    it("should not match facebook.com/help (help page)", () => {
      testRule(rule, "https://www.facebook.com/help", false)
    })

    it("should not match facebook.com/notifications (notifications page)", () => {
      testRule(rule, "https://www.facebook.com/notifications", false)
    })

    it("should not match facebook.com/messages (messages page)", () => {
      testRule(rule, "https://www.facebook.com/messages", false)
    })

    it("should not match facebook.com/bookmarks (bookmarks page)", () => {
      testRule(rule, "https://www.facebook.com/bookmarks", false)
    })

    it("should not match facebook.com/stories (stories page)", () => {
      testRule(rule, "https://www.facebook.com/stories", false)
    })

    it("should not match facebook.com/reels (reels page)", () => {
      testRule(rule, "https://www.facebook.com/reels", false)
    })

    it("should not match facebook.com/ads (ads page)", () => {
      testRule(rule, "https://www.facebook.com/ads", false)
    })

    it("should not match facebook.com/p (posts path)", () => {
      testRule(rule, "https://www.facebook.com/p", false)
    })

    it("should not match facebook.com/p/SomePostTitle (post URL)", () => {
      testRule(rule, "https://www.facebook.com/p/SomePostTitle", false)
    })

    it("should match facebook.com/pinterest (username starting with 'p')", () => {
      testRule(rule, "https://www.facebook.com/pinterest", true, "pinterest")
    })
  })

  describe("negative cases", () => {
    it("should not match other domains", () => {
      testRule(rule, "https://www.twitter.com/elonmusk", false)
    })
  })
})

describe("API_ENDPOINT_RULE_TWITTER", () => {
  const rule = API_ENDPOINT_RULE_TWITTER

  describe("positive cases", () => {
    it("should match twitter.com/elonmusk", () => {
      testRule(rule, "https://www.twitter.com/elonmusk", true, "elonmusk")
    })

    it("should match x.com/billgates", () => {
      testRule(rule, "https://www.x.com/billgates", true, "billgates")
    })

    it("should match t.co/username", () => {
      testRule(rule, "https://t.co/example", true, "example")
    })

    it("should match with query params", () => {
      testRule(rule, "https://twitter.com/nasa?s=20", true, "nasa")
    })

    it("should match without protocol", () => {
      testRule(rule, "twitter.com/openai", true, "openai")
    })

    it("should match case-insensitive usernames (Twitter IDs are case-insensitive)", () => {
      testRule(rule, "https://twitter.com/ElonMusk", true, "ElonMusk")
      testRule(rule, "https://twitter.com/ELONMUSK", true, "ELONMUSK")
      testRule(rule, "https://x.com/BillGates", true, "BillGates")
      testRule(rule, "https://X.COM/billgates", true, "billgates")
    })
  })

  describe("negative cases", () => {
    it("should not match twitter.com/search", () => {
      testRule(rule, "https://twitter.com/search?q=test", false)
    })

    it("should not match twitter.com/hashtag", () => {
      testRule(rule, "https://twitter.com/hashtag/tech", false)
    })

    it("should not match twitter.com/i/lists", () => {
      testRule(rule, "https://twitter.com/i/lists/123456", false)
    })

    it("should not match twitter.com/i/events", () => {
      testRule(rule, "https://twitter.com/i/events/123456", false)
    })

    it("should not match twitter.com/intent", () => {
      testRule(rule, "https://twitter.com/intent/tweet", false)
    })

    it("should not match twitter.com/settings", () => {
      testRule(rule, "https://twitter.com/settings/account", false)
    })

    it("should not match x.com/privacy", () => {
      testRule(rule, "https://x.com/privacy", false)
    })

    it("should not match twitter.com/privacy", () => {
      testRule(rule, "https://twitter.com/privacy", false)
    })

    it("should not match twitter.com/en/privacy (locale-prefixed privacy page)", () => {
      testRule(rule, "https://twitter.com/en/privacy", false)
    })

    it("should not match twitter.com/tos", () => {
      testRule(rule, "https://twitter.com/tos", false)
    })

    it("should not match x.com/en/tos", () => {
      testRule(rule, "https://x.com/en/tos", false)
    })

    it("should not match individual tweet status URLs", () => {
      testRule(rule, "https://x.com/cloudnativeboy/status/1876690302104436791", false)
      testRule(rule, "https://twitter.com/someuser/status/1234567890", false)
    })

    it("should not match other domains", () => {
      testRule(rule, "https://www.facebook.com/zuck", false)
    })

    it("should not match domains containing t.co as substring (e.g., au10tix.com)", () => {
      testRule(rule, "https://www.au10tix.com/company", false)
      testRule(rule, "https://au10tix.com/company", false)
      testRule(rule, "au10tix.com/company", false)
    })

    it("should not match twitter.com subdomains (e.g., platform.twitter.com widget embeds)", () => {
      testRule(
        rule,
        "https://platform.twitter.com/widgets/follow_button.2f70fb173b9000da126c79afe2098f02.en.html",
        false
      )
      testRule(rule, "https://developer.twitter.com/en/docs", false)
      testRule(rule, "https://syndication.twitter.com/timeline", false)
      testRule(rule, "https://publish.twitter.com/oembed", false)
    })
  })
})

describe("API_ENDPOINT_RULE_INSTAGRAM", () => {
  const rule = API_ENDPOINT_RULE_INSTAGRAM

  describe("positive cases", () => {
    it("should match instagram.com/nasa", () => {
      testRule(rule, "https://www.instagram.com/nasa", true, "nasa")
    })

    it("should match instagram.com/@cristiano", () => {
      testRule(rule, "https://www.instagram.com/@cristiano", true, "@cristiano")
    })

    it("should match with query params", () => {
      testRule(rule, "https://instagram.com/natgeo?igshid=abc123", true, "natgeo")
    })

    it("should match without protocol", () => {
      testRule(rule, "instagram.com/instagram", true, "instagram")
    })

    it("should match with www", () => {
      testRule(rule, "https://www.instagram.com/taylorswift", true, "taylorswift")
    })
  })

  describe("negative cases", () => {
    it("should not match instagram.com/explore", () => {
      testRule(rule, "https://www.instagram.com/explore", false)
    })

    it("should not match instagram.com/reels", () => {
      testRule(rule, "https://www.instagram.com/reels", false)
    })

    it("should not match instagram.com/reel/ID (singular reel link)", () => {
      testRule(rule, "https://www.instagram.com/reel/DGIcFXtzkZ4", false)
    })

    it("should not match instagram.com/reel (bare, no trailing path)", () => {
      testRule(rule, "https://www.instagram.com/reel", false)
    })

    it("should still match a username starting with 'reel' (e.g. reelfilms)", () => {
      testRule(rule, "https://www.instagram.com/reelfilms", true, "reelfilms")
    })

    it("should not match instagram.com/p/", () => {
      testRule(rule, "https://www.instagram.com/p/ABC123xyz", false)
    })

    it("should not match instagram.com/stories", () => {
      testRule(rule, "https://www.instagram.com/stories/username/123456", false)
    })

    it("should not match instagram.com/tv/", () => {
      testRule(rule, "https://www.instagram.com/tv/ABC123", false)
    })

    it("should not match instagram.com/direct", () => {
      testRule(rule, "https://www.instagram.com/direct/inbox", false)
    })

    it("should not match instagram.com/accounts", () => {
      testRule(rule, "https://www.instagram.com/accounts/edit", false)
    })

    it("should not match other domains", () => {
      testRule(rule, "https://www.facebook.com/instagram", false)
    })
  })
})

describe("API_ENDPOINT_RULE_GITHUB", () => {
  const rule = API_ENDPOINT_RULE_GITHUB

  describe("positive cases", () => {
    it("should match github.com/octocat", () => {
      testRule(rule, "https://www.github.com/octocat", true, "octocat")
    })

    it("should match github.com/microsoft and capture only username (not repo)", () => {
      testRule(rule, "https://github.com/microsoft/vscode", true, "microsoft")
    })

    it("should match github.com/facebook/react and capture only username", () => {
      testRule(rule, "https://github.com/facebook/react/blob/main/README.md", true, "facebook")
    })

    it("should match without protocol", () => {
      testRule(rule, "github.com/google", true, "google")
    })

    it("should match with www", () => {
      testRule(rule, "https://www.github.com/vercel", true, "vercel")
    })
  })

  describe("negative cases", () => {
    it("should not match github.com/issues", () => {
      testRule(rule, "https://github.com/owner/repo/issues/123", false)
    })

    it("should not match github.com/pull", () => {
      testRule(rule, "https://github.com/owner/repo/pull/456", false)
    })

    it("should not match github.com/gists", () => {
      testRule(rule, "https://gist.github.com/username/abc123", false)
    })

    it("should not match github.com/releases", () => {
      testRule(rule, "https://github.com/owner/repo/releases", false)
    })

    it("should not match github.com/actions", () => {
      testRule(rule, "https://github.com/owner/repo/actions", false)
    })

    it("should not match github.com/security", () => {
      testRule(rule, "https://github.com/owner/repo/security", false)
    })

    it("should not match github.com/settings", () => {
      testRule(rule, "https://github.com/settings/profile", false)
    })

    it("should not match other domains", () => {
      testRule(rule, "https://www.facebook.com/github", false)
    })

    it("should not match gist.github.com (should be excluded by lookbehind)", () => {
      testRule(rule, "https://gist.github.com/username/abc123", false)
    })

    it("should not match github.com/marketplace (reserved GitHub path)", () => {
      testRule(rule, "https://github.com/marketplace/qodo-merge-pro", false)
    })

    it("should not match github.com/marketplace root", () => {
      testRule(rule, "https://github.com/marketplace", false)
    })

    it("should not match github.com/explore", () => {
      testRule(rule, "https://github.com/explore", false)
    })

    it("should not match github.com/topics", () => {
      testRule(rule, "https://github.com/topics/javascript", false)
    })

    it("should not match github.com/trending", () => {
      testRule(rule, "https://github.com/trending", false)
    })

    it("should not match github.com/collections", () => {
      testRule(rule, "https://github.com/collections", false)
    })

    it("should not match github.com/sponsors", () => {
      testRule(rule, "https://github.com/sponsors/octocat", false)
    })

    it("should not match github.com/features", () => {
      testRule(rule, "https://github.com/features/actions", false)
    })

    it("should not match github.com/enterprise", () => {
      testRule(rule, "https://github.com/enterprise", false)
    })

    it("should not match github.com/pricing", () => {
      testRule(rule, "https://github.com/pricing", false)
    })

    it("should not match github.com/about", () => {
      testRule(rule, "https://github.com/about", false)
    })

    it("should not match github.com/login", () => {
      testRule(rule, "https://github.com/login", false)
    })

    it("should not match github.com/signup", () => {
      testRule(rule, "https://github.com/signup", false)
    })

    it("should not match github.com/new", () => {
      testRule(rule, "https://github.com/new", false)
    })

    it("should not match github.com/organizations", () => {
      testRule(rule, "https://github.com/organizations", false)
    })

    it("should not match github.com/notifications", () => {
      testRule(rule, "https://github.com/notifications", false)
    })

    it("should not match github.com/codespaces", () => {
      testRule(rule, "https://github.com/codespaces", false)
    })
  })
})

describe("API_ENDPOINT_RULE_YOUTUBE_PROFILE", () => {
  const rule = API_ENDPOINT_RULE_YOUTUBE_PROFILE

  describe("positive cases - all equivalent formats", () => {
    describe("Format 1: youtube.com/ID", () => {
      it("should match youtube.com/example", () => {
        testRule(rule, "https://www.youtube.com/example", true, "example")
      })

      it("should match youtube.com/mkbhd", () => {
        testRule(rule, "https://www.youtube.com/mkbhd", true, "mkbhd")
      })

      it("should match with query params", () => {
        testRule(rule, "https://youtube.com/veritasium?si=abc123", true, "veritasium")
      })

      it("should match without protocol", () => {
        testRule(rule, "youtube.com/kurzgesagt", true, "kurzgesagt")
      })

      it("should match with www", () => {
        testRule(rule, "https://www.youtube.com/mkbhd", true, "mkbhd")
      })
    })

    describe("Format 2: youtube.com/@ID", () => {
      it("should match youtube.com/@mkbhd", () => {
        testRule(rule, "https://www.youtube.com/@mkbhd", true, "mkbhd")
      })

      it("should match youtube.com/@MrBeast", () => {
        testRule(rule, "https://www.youtube.com/@MrBeast", true, "MrBeast")
      })

      it("should match https://www.youtube.com/@sentra_security (with protocol and www)", () => {
        testRule(rule, "https://www.youtube.com/@sentra_security", true, "sentra_security")
      })

      it("should match http://www.youtube.com/@sentra_security (with http protocol)", () => {
        testRule(rule, "http://www.youtube.com/@sentra_security", true, "sentra_security")
      })

      it("should match www.youtube.com/@sentra_security (with www but no protocol)", () => {
        testRule(rule, "www.youtube.com/@sentra_security", true, "sentra_security")
      })

      it("should match with query params", () => {
        testRule(rule, "https://youtube.com/@veritasium?si=abc123", true, "veritasium")
      })

      it("should match without protocol", () => {
        testRule(rule, "youtube.com/@kurzgesagt", true, "kurzgesagt")
      })

      it("should match with www", () => {
        testRule(rule, "https://www.youtube.com/@mkbhd", true, "mkbhd")
      })
    })

    describe("Format 3: youtube.com/c/ID", () => {
      it("should match youtube.com/c/omadahealth", () => {
        testRule(rule, "https://www.youtube.com/c/omadahealth", true, "omadahealth")
      })

      it("should match youtube.com/c/ChannelName", () => {
        testRule(rule, "https://www.youtube.com/c/ChannelName", true, "ChannelName")
      })

      it("should match with query params", () => {
        testRule(rule, "https://youtube.com/c/example?sub_confirmation=1", true, "example")
      })

      it("should match without protocol", () => {
        testRule(rule, "youtube.com/c/kurzgesagt", true, "kurzgesagt")
      })

      it("should match with www", () => {
        testRule(rule, "https://www.youtube.com/c/mkbhd", true, "mkbhd")
      })
    })

    describe("Format 4: youtube.com/c/@ID", () => {
      it("should match youtube.com/c/@mkbhd", () => {
        testRule(rule, "https://www.youtube.com/c/@mkbhd", true, "mkbhd")
      })

      it("should match youtube.com/c/@MrBeast", () => {
        testRule(rule, "https://www.youtube.com/c/@MrBeast", true, "MrBeast")
      })

      it("should match with query params", () => {
        testRule(rule, "https://youtube.com/c/@veritasium?si=abc123", true, "veritasium")
      })

      it("should match without protocol", () => {
        testRule(rule, "youtube.com/c/@kurzgesagt", true, "kurzgesagt")
      })

      it("should match with www", () => {
        testRule(rule, "https://www.youtube.com/c/@mkbhd", true, "mkbhd")
      })
    })

    describe("Format 5: youtube.com/user/ID", () => {
      it("should match youtube.com/user/ChannelName", () => {
        testRule(rule, "https://www.youtube.com/user/ChannelName", true, "ChannelName")
      })

      it("should match youtube.com/user/mkbhd", () => {
        testRule(rule, "https://www.youtube.com/user/mkbhd", true, "mkbhd")
      })

      it("should match with query params", () => {
        testRule(rule, "https://youtube.com/user/example?sub_confirmation=1", true, "example")
      })

      it("should match without protocol", () => {
        testRule(rule, "youtube.com/user/kurzgesagt", true, "kurzgesagt")
      })

      it("should match with www", () => {
        testRule(rule, "https://www.youtube.com/user/mkbhd", true, "mkbhd")
      })
    })

    describe("Case-insensitive matching (all formats)", () => {
      it("should match case-insensitive for format 1: youtube.com/ID", () => {
        testRule(rule, "https://www.youtube.com/Example", true, "Example")
        testRule(rule, "https://YOUTUBE.COM/mkbhd", true, "mkbhd")
        testRule(rule, "https://www.YOUTUBE.com/veritasium", true, "veritasium")
      })

      it("should match case-insensitive for format 2: youtube.com/@ID", () => {
        testRule(rule, "https://www.youtube.com/@MKBHD", true, "MKBHD")
        testRule(rule, "https://www.youtube.com/@MRBEAST", true, "MRBEAST")
        testRule(rule, "https://YOUTUBE.COM/@mkbhd", true, "mkbhd")
        testRule(rule, "https://www.YOUTUBE.com/@veritasium", true, "veritasium")
      })

      it("should match case-insensitive for format 3: youtube.com/c/ID", () => {
        testRule(rule, "https://www.youtube.com/c/OMADAHEALTH", true, "OMADAHEALTH")
        testRule(rule, "https://YOUTUBE.COM/c/ChannelName", true, "ChannelName")
        testRule(rule, "https://www.YOUTUBE.com/c/example", true, "example")
      })

      it("should match case-insensitive for format 4: youtube.com/c/@ID", () => {
        testRule(rule, "https://www.youtube.com/c/@MKBHD", true, "MKBHD")
        testRule(rule, "https://YOUTUBE.COM/c/@mkbhd", true, "mkbhd")
        testRule(rule, "https://www.YOUTUBE.com/c/@veritasium", true, "veritasium")
      })

      it("should match case-insensitive for format 5: youtube.com/user/ID", () => {
        testRule(rule, "https://www.youtube.com/user/CHANNELNAME", true, "CHANNELNAME")
        testRule(rule, "https://YOUTUBE.COM/user/mkbhd", true, "mkbhd")
        testRule(rule, "https://www.YOUTUBE.com/user/veritasium", true, "veritasium")
      })
    })

    describe("All formats should capture the same ID for equivalent URLs", () => {
      const testId = "mkbhd"
      it(`should capture "${testId}" from all 5 formats`, () => {
        testRule(rule, `https://www.youtube.com/${testId}`, true, testId)
        testRule(rule, `https://www.youtube.com/@${testId}`, true, testId)
        testRule(rule, `https://www.youtube.com/c/${testId}`, true, testId)
        testRule(rule, `https://www.youtube.com/c/@${testId}`, true, testId)
        testRule(rule, `https://www.youtube.com/user/${testId}`, true, testId)
      })
    })
  })

  describe("negative cases", () => {
    it("should not match youtube.com/watch", () => {
      testRule(rule, "https://www.youtube.com/watch?v=dQw4w9WgXcQ", false)
    })

    it("should not match youtube.com/embed", () => {
      testRule(rule, "https://www.youtube.com/embed/dQw4w9WgXcQ", false)
    })

    it("should not match youtube.com/playlist", () => {
      testRule(rule, "https://www.youtube.com/playlist?list=PLrAXtmRdnEQy6nuLMH1Y3J8", false)
    })

    it("should not match youtube.com/live", () => {
      testRule(rule, "https://www.youtube.com/live/jfKfPfyJRdk", false)
    })

    it("should not match youtube.com/shorts", () => {
      testRule(rule, "https://www.youtube.com/shorts/abc123xyz", false)
    })

    it("should not match youtube.com/results", () => {
      testRule(rule, "https://www.youtube.com/results?search_query=test", false)
    })

    it("should not match youtube.com/channel", () => {
      testRule(rule, "https://www.youtube.com/channel/UCuAXFkgsw1L7xaCfnd5JJOw", false)
    })

    it("should not match youtube.com/feed", () => {
      testRule(rule, "https://www.youtube.com/feed/subscriptions", false)
    })

    it("should not match youtube.com/about", () => {
      testRule(rule, "https://www.youtube.com/about", false)
    })

    it("should not match youtube.com/trending", () => {
      testRule(rule, "https://www.youtube.com/trending", false)
    })

    it("should match youtube.com/user/ChannelName", () => {
      testRule(rule, "https://www.youtube.com/user/ChannelName", true, "ChannelName")
    })

    it("should not match other domains", () => {
      testRule(rule, "https://www.facebook.com/youtube", false)
    })

    describe("Special paths should be excluded even with c/ prefix", () => {
      it("should not match youtube.com/c/watch", () => {
        testRule(rule, "https://www.youtube.com/c/watch", false)
      })

      it("should not match youtube.com/c/channel", () => {
        testRule(rule, "https://www.youtube.com/c/channel", false)
      })

      it("should not match youtube.com/c/embed", () => {
        testRule(rule, "https://www.youtube.com/c/embed", false)
      })

      it("should not match youtube.com/c/feed", () => {
        testRule(rule, "https://www.youtube.com/c/feed", false)
      })

      it("should not match youtube.com/c/live", () => {
        testRule(rule, "https://www.youtube.com/c/live", false)
      })

      it("should not match youtube.com/c/playlist", () => {
        testRule(rule, "https://www.youtube.com/c/playlist", false)
      })

      it("should not match youtube.com/c/results", () => {
        testRule(rule, "https://www.youtube.com/c/results", false)
      })

      it("should not match youtube.com/c/shorts", () => {
        testRule(rule, "https://www.youtube.com/c/shorts", false)
      })

      it("should not match youtube.com/c/trending", () => {
        testRule(rule, "https://www.youtube.com/c/trending", false)
      })

      it("should not match youtube.com/c/about", () => {
        testRule(rule, "https://www.youtube.com/c/about", false)
      })

      it("should not match youtube.com/c/user/", () => {
        testRule(rule, "https://www.youtube.com/c/user/ChannelName", false)
      })
    })

    describe("Special paths should be excluded even with @ prefix", () => {
      it("should not match youtube.com/@watch", () => {
        testRule(rule, "https://www.youtube.com/@watch", false)
      })

      it("should not match youtube.com/@channel", () => {
        testRule(rule, "https://www.youtube.com/@channel", false)
      })

      it("should not match youtube.com/@embed", () => {
        testRule(rule, "https://www.youtube.com/@embed", false)
      })

      it("should not match youtube.com/@feed", () => {
        testRule(rule, "https://www.youtube.com/@feed", false)
      })

      it("should not match youtube.com/@live", () => {
        testRule(rule, "https://www.youtube.com/@live", false)
      })

      it("should not match youtube.com/@playlist", () => {
        testRule(rule, "https://www.youtube.com/@playlist", false)
      })

      it("should not match youtube.com/@results", () => {
        testRule(rule, "https://www.youtube.com/@results", false)
      })

      it("should not match youtube.com/@shorts", () => {
        testRule(rule, "https://www.youtube.com/@shorts", false)
      })

      it("should not match youtube.com/@trending", () => {
        testRule(rule, "https://www.youtube.com/@trending", false)
      })

      it("should not match youtube.com/@about", () => {
        testRule(rule, "https://www.youtube.com/@about", false)
      })

      it("should not match youtube.com/@user/", () => {
        testRule(rule, "https://www.youtube.com/@user/ChannelName", false)
      })
    })

    describe("Special paths should be excluded even with c/@ prefix", () => {
      it("should not match youtube.com/c/@watch", () => {
        testRule(rule, "https://www.youtube.com/c/@watch", false)
      })

      it("should not match youtube.com/c/@channel", () => {
        testRule(rule, "https://www.youtube.com/c/@channel", false)
      })

      it("should not match youtube.com/c/@embed", () => {
        testRule(rule, "https://www.youtube.com/c/@embed", false)
      })

      it("should not match youtube.com/c/@feed", () => {
        testRule(rule, "https://www.youtube.com/c/@feed", false)
      })

      it("should not match youtube.com/c/@live", () => {
        testRule(rule, "https://www.youtube.com/c/@live", false)
      })

      it("should not match youtube.com/c/@playlist", () => {
        testRule(rule, "https://www.youtube.com/c/@playlist", false)
      })

      it("should not match youtube.com/c/@results", () => {
        testRule(rule, "https://www.youtube.com/c/@results", false)
      })

      it("should not match youtube.com/c/@shorts", () => {
        testRule(rule, "https://www.youtube.com/c/@shorts", false)
      })

      it("should not match youtube.com/c/@trending", () => {
        testRule(rule, "https://www.youtube.com/c/@trending", false)
      })

      it("should not match youtube.com/c/@about", () => {
        testRule(rule, "https://www.youtube.com/c/@about", false)
      })

      it("should not match youtube.com/c/@user/", () => {
        testRule(rule, "https://www.youtube.com/c/@user/ChannelName", false)
      })
    })
  })
})

describe("API_ENDPOINT_RULE_YOUTUBE_CHANNEL", () => {
  const rule = API_ENDPOINT_RULE_YOUTUBE_CHANNEL

  describe("positive cases", () => {
    it("should match youtube.com/channel/UCxxxxx", () => {
      testRule(rule, "https://www.youtube.com/channel/UC123456789", true, "UC123456789")
    })

    it("should match https://www.youtube.com/channel/UC123 (with protocol and www)", () => {
      testRule(rule, "https://www.youtube.com/channel/UC123", true, "UC123")
    })

    it("should match http://www.youtube.com/channel/UC123 (with http protocol)", () => {
      testRule(rule, "http://www.youtube.com/channel/UC123", true, "UC123")
    })

    it("should match www.youtube.com/channel/UC123 (with www but no protocol)", () => {
      testRule(rule, "www.youtube.com/channel/UC123", true, "UC123")
    })

    it("should match with query params", () => {
      testRule(rule, "https://youtube.com/channel/UC123?ref=test", true, "UC123")
    })

    it("should match without protocol", () => {
      testRule(rule, "youtube.com/channel/UC123", true, "UC123")
    })

    it("should match with www", () => {
      testRule(rule, "https://www.youtube.com/channel/UC123", true, "UC123")
    })
  })

  describe("negative cases", () => {
    it("should not match youtube.com/@mkbhd", () => {
      testRule(rule, "https://www.youtube.com/@mkbhd", false)
    })

    it("should not match youtube.com/user/username", () => {
      testRule(rule, "https://www.youtube.com/user/example", false)
    })

    it("should not match youtube.com/c/channelname", () => {
      testRule(rule, "https://www.youtube.com/c/ChannelName", false)
    })

    it("should not match youtube.com/watch", () => {
      testRule(rule, "https://www.youtube.com/watch?v=dQw4w9WgXcQ", false)
    })

    it("should not match youtube.com/playlist", () => {
      testRule(rule, "https://www.youtube.com/playlist?list=PLxxx", false)
    })

    it("should not match youtube.com/channel without ID", () => {
      testRule(rule, "https://www.youtube.com/channel", false)
    })

    it("should not match other domains", () => {
      testRule(rule, "https://www.facebook.com/youtube", false)
    })
  })
})

describe("API_ENDPOINT_RULE_TIKTOK", () => {
  const rule = API_ENDPOINT_RULE_TIKTOK

  describe("positive cases", () => {
    it("should match tiktok.com/@charlidamelio", () => {
      testRule(rule, "https://www.tiktok.com/@charlidamelio", true, "@charlidamelio")
    })

    it("should match tiktok.com/@khaby.lame", () => {
      testRule(rule, "https://www.tiktok.com/@khaby.lame", true, "@khaby.lame")
    })

    it("should match with query params", () => {
      testRule(rule, "https://tiktok.com/@addisonre?lang=en", true, "@addisonre")
    })

    it("should match without protocol", () => {
      testRule(rule, "tiktok.com/@zachking", true, "@zachking")
    })

    it("should match with www", () => {
      testRule(rule, "https://www.tiktok.com/@bella", true, "@bella")
    })
  })

  describe("negative cases", () => {
    it("should not match tiktok.com/@/video", () => {
      testRule(rule, "https://www.tiktok.com/@username/video/123456789", false)
    })

    it("should not match tiktok.com/discover", () => {
      testRule(rule, "https://www.tiktok.com/discover", false)
    })

    it("should not match tiktok.com/foryou", () => {
      testRule(rule, "https://www.tiktok.com/foryou", false)
    })

    it("should not match tiktok.com/trending", () => {
      testRule(rule, "https://www.tiktok.com/trending", false)
    })

    it("should not match tiktok.com/music", () => {
      testRule(rule, "https://www.tiktok.com/music/song-123", false)
    })

    it("should not match tiktok.com/upload", () => {
      testRule(rule, "https://www.tiktok.com/upload", false)
    })

    it("should not match tiktok.com/legal/privacy-policy", () => {
      testRule(rule, "https://www.tiktok.com/legal/privacy-policy", false)
    })

    it("should not match tiktok.com/legal/terms-of-service", () => {
      testRule(rule, "https://www.tiktok.com/legal/terms-of-service", false)
    })

    it("should not match tiktok.com/about", () => {
      testRule(rule, "https://www.tiktok.com/about", false)
    })

    it("should not match tiktok.com/transparency", () => {
      testRule(rule, "https://www.tiktok.com/transparency", false)
    })

    it("should not match tiktok.com/community-guidelines", () => {
      testRule(rule, "https://www.tiktok.com/community-guidelines", false)
    })

    it("should not match other domains", () => {
      testRule(rule, "https://www.instagram.com/charlidamelio", false)
    })
  })
})

describe("API_ENDPOINT_RULE_THREADS", () => {
  const rule = API_ENDPOINT_RULE_THREADS

  describe("positive cases", () => {
    it("should match threads.com/@zuck", () => {
      testRule(rule, "https://www.threads.com/@zuck", true, "@zuck")
    })

    it("should match threads.com/@cristiano", () => {
      testRule(rule, "https://www.threads.com/@cristiano", true, "@cristiano")
    })

    it("should match with query params", () => {
      testRule(rule, "https://threads.com/@natgeo?igshid=abc123", true, "@natgeo")
    })

    it("should match without protocol", () => {
      testRule(rule, "threads.com/@instagram", true, "@instagram")
    })

    it("should match with www", () => {
      testRule(rule, "https://www.threads.com/@taylorswift", true, "@taylorswift")
    })
  })

  describe("negative cases", () => {
    it("should not match threads.com/@username/post", () => {
      testRule(rule, "https://www.threads.com/@zuck/post/123456", false)
    })

    it("should not match threads.com/search", () => {
      testRule(rule, "https://www.threads.com/search?q=test", false)
    })

    it("should not match threads.com/explore", () => {
      testRule(rule, "https://www.threads.com/explore", false)
    })

    it("should not match threads.com/activity", () => {
      testRule(rule, "https://www.threads.com/activity", false)
    })

    it("should not match threads.com/settings", () => {
      testRule(rule, "https://www.threads.com/settings", false)
    })

    it("should not match threads.com/legal/privacy-policy", () => {
      testRule(rule, "https://www.threads.com/legal/privacy-policy", false)
    })

    it("should not match threads.com/about", () => {
      testRule(rule, "https://www.threads.com/about", false)
    })

    it("should not match other domains", () => {
      testRule(rule, "https://www.instagram.com/zuck", false)
    })
  })
})

describe("Website URL detection (should not match any social media regex)", () => {
  const allRules = [
    API_ENDPOINT_RULE_LINKEDIN_COMPANY,
    API_ENDPOINT_RULE_FACEBOOK,
    API_ENDPOINT_RULE_TWITTER,
    API_ENDPOINT_RULE_INSTAGRAM,
    API_ENDPOINT_RULE_GITHUB,
    API_ENDPOINT_RULE_YOUTUBE_PROFILE,
    API_ENDPOINT_RULE_YOUTUBE_CHANNEL,
    API_ENDPOINT_RULE_TIKTOK,
    API_ENDPOINT_RULE_THREADS
  ]

  it("should not match careers.wix.com/test as any social media", () => {
    const url = "https://careers.wix.com/test"

    for (const rule of allRules) {
      const flags =
        rule.domain === "twitter.com" || rule.domain === "linkedin.com" || rule.domain === "youtube.com" ? "i" : ""
      const regex = new RegExp(rule.regex, flags)
      const match = regex.exec(url)
      expect(match).toBeNull()
    }
  })

  it("should not match careers.wix.com/test (without protocol) as any social media", () => {
    const url = "careers.wix.com/test"

    for (const rule of allRules) {
      const flags =
        rule.domain === "twitter.com" || rule.domain === "linkedin.com" || rule.domain === "youtube.com" ? "i" : ""
      const regex = new RegExp(rule.regex, flags)
      const match = regex.exec(url)
      expect(match).toBeNull()
    }
  })
})

describe("getMainDomain", () => {
  it("should keep subdomains", () => {
    expect(getMainDomain("https://careers.wix.com/test")).toBe("careers.wix.com")
    expect(getMainDomain("https://www.careers.wix.com/test")).toBe("careers.wix.com")
    expect(getMainDomain("careers.wix.com/test")).toBe("careers.wix.com")
  })

  it("should handle main domain without subdomain", () => {
    expect(getMainDomain("https://wix.com")).toBe("wix.com")
    expect(getMainDomain("https://www.wix.com")).toBe("wix.com")
    expect(getMainDomain("wix.com")).toBe("wix.com")
  })

  it("should handle other subdomains", () => {
    expect(getMainDomain("https://blog.example.com")).toBe("blog.example.com")
    expect(getMainDomain("https://api.github.com")).toBe("api.github.com")
    expect(getMainDomain("https://subdomain.example.co.uk")).toBe("subdomain.example.co.uk")
  })
})

describe("getRegisteredDomain", () => {
  it("should return the registered domain (eTLD+1) stripping subdomains", () => {
    expect(getRegisteredDomain("https://cc.catonetworks.com")).toBe("catonetworks.com")
    expect(getRegisteredDomain("https://cc2.catonetworks.com/login")).toBe("catonetworks.com")
    expect(getRegisteredDomain("https://connect.catonetworks.com")).toBe("catonetworks.com")
    expect(getRegisteredDomain("https://partners.catonetworks.com")).toBe("catonetworks.com")
  })

  it("should return the registered domain for base domains", () => {
    expect(getRegisteredDomain("https://catonetworks.com")).toBe("catonetworks.com")
    expect(getRegisteredDomain("https://www.catonetworks.com")).toBe("catonetworks.com")
    expect(getRegisteredDomain("catonetworks.com")).toBe("catonetworks.com")
  })

  it("should handle country code TLDs", () => {
    expect(getRegisteredDomain("https://subdomain.example.co.uk")).toBe("example.co.uk")
    expect(getRegisteredDomain("https://www.example.co.uk")).toBe("example.co.uk")
  })

  it("should handle URLs without protocol", () => {
    expect(getRegisteredDomain("blog.example.com")).toBe("example.com")
    expect(getRegisteredDomain("careers.wix.com/test")).toBe("wix.com")
  })

  it("should return empty string for invalid input", () => {
    expect(getRegisteredDomain("")).toBe("")
  })
})

describe("findInDatabaseByDomain with subdomain support", () => {
  const mockDatabase: FinalDBFileType[] = [
    { id: "1", ws: "wix.com", r: ["h"], n: "Wix" },
    { id: "2", ws: "fr.wix.com", r: ["h"], n: "Wix France" },
    { id: "3", ws: "example.co.uk", r: ["h"], n: "Example UK" }
  ]

  describe("Base domain stored → matches all subdomains", () => {
    const baseDomainOnlyDb: FinalDBFileType[] = [{ id: "1", ws: "wix.com", r: ["h"], n: "Wix" }]

    it("should match exact base domain wix.com → wix.com", () => {
      const result = findInDatabaseByDomain("wix.com", baseDomainOnlyDb)
      expect(result?.id).toBe("1")
    })

    it("should match subdomain fr.wix.com when base wix.com is stored", () => {
      const result = findInDatabaseByDomain("fr.wix.com", baseDomainOnlyDb)
      expect(result?.id).toBe("1") // Should match base domain entry
    })

    it("should match subdomain careers.wix.com when base wix.com is stored", () => {
      const result = findInDatabaseByDomain("careers.wix.com", baseDomainOnlyDb)
      expect(result?.id).toBe("1")
    })

    it("should match nested subdomain api.fr.wix.com when base wix.com is stored", () => {
      const result = findInDatabaseByDomain("api.fr.wix.com", baseDomainOnlyDb)
      expect(result?.id).toBe("1")
    })
  })

  describe("Subdomain stored → ONLY matches exact subdomain", () => {
    it("should match exact subdomain fr.wix.com → fr.wix.com", () => {
      const result = findInDatabaseByDomain("fr.wix.com", mockDatabase)
      expect(result?.id).toBe("2") // Exact match takes priority
    })

    it("should NOT match base domain wix.com when subdomain fr.wix.com is stored", () => {
      // Since we have both wix.com and fr.wix.com, it will match wix.com entry
      const result = findInDatabaseByDomain("wix.com", mockDatabase)
      expect(result?.id).toBe("1") // Should match only the base entry
    })

    it("should NOT match different subdomain de.wix.com when fr.wix.com is stored", () => {
      const result = findInDatabaseByDomain("de.wix.com", mockDatabase)
      expect(result?.id).toBe("1") // Should fall back to base wix.com entry
    })
  })

  describe("Edge cases", () => {
    it("should NOT match different base domains", () => {
      const result = findInDatabaseByDomain("other.com", mockDatabase)
      expect(result).toBeNull()
    })

    it("should handle .co.uk and similar TLDs correctly", () => {
      const result = findInDatabaseByDomain("subdomain.example.co.uk", mockDatabase)
      expect(result?.id).toBe("3")
    })

    it("should handle database with only subdomain entry", () => {
      const subdomainOnlyDb: FinalDBFileType[] = [{ id: "1", ws: "fr.wix.com", r: ["h"], n: "Wix France" }]
      // Exact match should work
      expect(findInDatabaseByDomain("fr.wix.com", subdomainOnlyDb)?.id).toBe("1")
      // Base domain should NOT match when only subdomain is stored
      expect(findInDatabaseByDomain("wix.com", subdomainOnlyDb)).toBeNull()
      // Different subdomain should NOT match
      expect(findInDatabaseByDomain("de.wix.com", subdomainOnlyDb)).toBeNull()
    })

    it("should handle empty database", () => {
      const emptyDb: FinalDBFileType[] = []
      expect(findInDatabaseByDomain("wix.com", emptyDb)).toBeNull()
    })

    it("should handle entries without ws field", () => {
      const dbWithMissingWs: FinalDBFileType[] = [{ id: "1", r: ["h"], n: "No Website" }]
      expect(findInDatabaseByDomain("wix.com", dbWithMissingWs)).toBeNull()
    })
  })

  describe("Array hints support", () => {
    it("should match any domain in ws array for hints", () => {
      const hintDb: FinalDBFileType[] = [
        { id: "hint_BBC", ws: ["bbc.com", "bbc.co.uk"], r: [], n: "BBC", isHint: true }
      ]

      const result1 = findInDatabaseByDomain("bbc.com", hintDb)
      expect(result1?.id).toBe("hint_BBC")

      const result2 = findInDatabaseByDomain("bbc.co.uk", hintDb)
      expect(result2?.id).toBe("hint_BBC")
    })

    it("should NOT match domains not in ws array", () => {
      const hintDb: FinalDBFileType[] = [
        { id: "hint_BBC", ws: ["bbc.com", "bbc.co.uk"], r: [], n: "BBC", isHint: true }
      ]

      const result = findInDatabaseByDomain("bbc.net", hintDb)
      expect(result).toBeNull()
    })

    it("should handle subdomain matching with array hints", () => {
      const hintDb: FinalDBFileType[] = [
        { id: "hint_example", ws: ["example.com", "test.com"], r: [], n: "Example", isHint: true }
      ]

      // Subdomain should match base domain in array
      const result = findInDatabaseByDomain("fr.example.com", hintDb)
      expect(result?.id).toBe("hint_example")
    })
  })
})

describe("findInDatabaseBySelector with array hints", () => {
  it("should match any GitHub username in gh array for hints", () => {
    const hintDb: FinalDBFileType[] = [
      {
        id: "hint_microsoft",
        gh: ["microsoft", "microsoftgraph", "MicrosoftDocs"],
        r: [],
        n: "Microsoft",
        isHint: true
      }
    ]

    const result1 = findInDatabaseBySelector("microsoft", "gh", "github.com", hintDb)
    expect(result1?.id).toBe("hint_microsoft")

    const result2 = findInDatabaseBySelector("microsoftgraph", "gh", "github.com", hintDb)
    expect(result2?.id).toBe("hint_microsoft")

    const result3 = findInDatabaseBySelector("MicrosoftDocs", "gh", "github.com", hintDb)
    expect(result3?.id).toBe("hint_microsoft")
  })

  it("should match any YouTube profile in ytp array for hints (case-insensitive)", () => {
    const hintDb: FinalDBFileType[] = [
      {
        id: "hint_microsoft",
        ytp: ["@Microsoft", "@MicrosoftAzure", "@MicrosoftDeveloper"],
        r: [],
        n: "Microsoft",
        isHint: true
      }
    ]

    // Case-insensitive matching for YouTube
    const result1 = findInDatabaseBySelector("@microsoft", "ytp", "youtube.com", hintDb)
    expect(result1?.id).toBe("hint_microsoft")

    const result2 = findInDatabaseBySelector("MICROSOFTAZURE", "ytp", "youtube.com", hintDb)
    expect(result2?.id).toBe("hint_microsoft")

    // With @ prefix
    const result3 = findInDatabaseBySelector("@MicrosoftDeveloper", "ytp", "youtube.com", hintDb)
    expect(result3?.id).toBe("hint_microsoft")
  })

  it("should NOT match selectors not in array", () => {
    const hintDb: FinalDBFileType[] = [
      {
        id: "hint_microsoft",
        gh: ["microsoft", "microsoftgraph"],
        r: [],
        n: "Microsoft",
        isHint: true
      }
    ]

    const result = findInDatabaseBySelector("apple", "gh", "github.com", hintDb)
    expect(result).toBeNull()
  })

  it("should still work with string selectors (non-hint entries)", () => {
    const mixedDb: FinalDBFileType[] = [
      { id: "regular_wix", gh: "wix", r: ["h"], n: "Wix" },
      { id: "hint_microsoft", gh: ["microsoft", "microsoftgraph"], r: [], n: "Microsoft", isHint: true }
    ]

    const result1 = findInDatabaseBySelector("wix", "gh", "github.com", mixedDb)
    expect(result1?.id).toBe("regular_wix")

    const result2 = findInDatabaseBySelector("microsoft", "gh", "github.com", mixedDb)
    expect(result2?.id).toBe("hint_microsoft")
  })
})

describe("findHintByDomain", () => {
  const mockHintDb: FinalDBFileType[] = [
    {
      id: "hint_upscrolled",
      ws: ["https://instagram.com", "https://tiktok.com", "https://facebook.com", "https://threads.net"],
      r: [],
      n: "Upscrolled",
      isHint: true,
      hintText: "Try Upscrolled!",
      hintUrl: "https://upscrolled.com",
      hintCompanyId: "upscrolled_social"
    },
    {
      id: "hint_newscord",
      ws: ["https://bbc.com", "https://cnn.com"],
      r: [],
      n: "Newscord",
      isHint: true,
      hintText: "Try Newscord!",
      hintUrl: "https://newscord.org"
    },
    { id: "regular_wix", ws: "wix.com", r: ["h"], n: "Wix" },
    // Microsoft hint with xbox.com - used to test x.com vs xbox.com substring bug
    {
      id: "hint_microsoft",
      ws: ["https://xbox.com", "https://microsoft.com"],
      r: [],
      n: "Microsoft",
      isHint: true,
      hintText: "Microsoft is a BDS target",
      hintUrl: "https://bdsmovement.net/microsoft",
      hintCompanyId: "microsoft_bds_prio"
    }
  ]

  describe("Positive cases", () => {
    it("should find hint for instagram.com", () => {
      const result = findHintByDomain("instagram.com", mockHintDb)
      expect(result?.id).toBe("hint_upscrolled")
      expect(result?.isHint).toBe(true)
    })

    it("should find hint for tiktok.com", () => {
      const result = findHintByDomain("tiktok.com", mockHintDb)
      expect(result?.id).toBe("hint_upscrolled")
    })

    it("should find hint for facebook.com", () => {
      const result = findHintByDomain("facebook.com", mockHintDb)
      expect(result?.id).toBe("hint_upscrolled")
    })

    it("should find hint for threads.net", () => {
      const result = findHintByDomain("threads.net", mockHintDb)
      expect(result?.id).toBe("hint_upscrolled")
    })

    it("should find hint for bbc.com", () => {
      const result = findHintByDomain("bbc.com", mockHintDb)
      expect(result?.id).toBe("hint_newscord")
    })

    it("should find hint for cnn.com", () => {
      const result = findHintByDomain("cnn.com", mockHintDb)
      expect(result?.id).toBe("hint_newscord")
    })

    it("should handle www prefix", () => {
      const result = findHintByDomain("www.instagram.com", mockHintDb)
      expect(result?.id).toBe("hint_upscrolled")
    })

    it("should find hint for xbox.com", () => {
      const result = findHintByDomain("xbox.com", mockHintDb)
      expect(result?.id).toBe("hint_microsoft")
    })

    it("should find hint for microsoft.com", () => {
      const result = findHintByDomain("microsoft.com", mockHintDb)
      expect(result?.id).toBe("hint_microsoft")
    })
  })

  describe("Negative cases", () => {
    it("should NOT find hint for non-hint entries", () => {
      const result = findHintByDomain("wix.com", mockHintDb)
      expect(result).toBeNull()
    })

    it("should NOT find hint for domains not in any hint", () => {
      const result = findHintByDomain("youtube.com", mockHintDb)
      expect(result).toBeNull()
    })

    it("should NOT find hint for empty database", () => {
      const result = findHintByDomain("instagram.com", [])
      expect(result).toBeNull()
    })

    it("should NOT match x.com to xbox.com hint (substring false positive)", () => {
      // This tests the critical bug where x.com was incorrectly matching xbox.com
      // because "xbox.com".includes("x.com") returned true with old substring logic
      const result = findHintByDomain("x.com", mockHintDb)
      expect(result).toBeNull()
    })

    it("should NOT match partial domain substrings", () => {
      // Ensure "book.com" doesn't match "facebook.com" hint
      const result = findHintByDomain("book.com", mockHintDb)
      expect(result).toBeNull()
    })
  })

  describe("Edge cases", () => {
    it("should return hint with all properties intact", () => {
      const result = findHintByDomain("instagram.com", mockHintDb)
      expect(result).not.toBeNull()
      expect(result?.hintText).toBe("Try Upscrolled!")
      expect(result?.hintUrl).toBe("https://upscrolled.com")
      expect(result?.hintCompanyId).toBe("upscrolled_social")
    })

    it("should handle hint without hintCompanyId", () => {
      const result = findHintByDomain("bbc.com", mockHintDb)
      expect(result).not.toBeNull()
      expect(result?.hintCompanyId).toBeUndefined()
    })
  })
})

describe("FinalDBFileSchema - Custom reason validation", () => {
  describe("Valid entries with reason 'c'", () => {
    it("should accept entry with reason 'c' and proof_text", () => {
      const entry = {
        id: "test-company",
        ws: "https://example.com",
        r: ["c"],
        n: "Test Company",
        proof_text: "Evidence of Israeli connection"
      }
      const result = FinalDBFileSchema.safeParse(entry)
      expect(result.success).toBe(true)
    })

    it("should accept entry with reason 'c' and proof_link", () => {
      const entry = {
        id: "test-company",
        ws: "https://example.com",
        r: ["c"],
        n: "Test Company",
        proof_link: "https://example.com/evidence"
      }
      const result = FinalDBFileSchema.safeParse(entry)
      expect(result.success).toBe(true)
    })

    it("should accept entry with reason 'c' and both proof_text and proof_link", () => {
      const entry = {
        id: "test-company",
        ws: "https://example.com",
        r: ["c"],
        n: "Test Company",
        proof_text: "Evidence of Israeli connection",
        proof_link: "https://example.com/evidence"
      }
      const result = FinalDBFileSchema.safeParse(entry)
      expect(result.success).toBe(true)
    })

    it("should accept entry with reason 'c' alongside other reasons", () => {
      const entry = {
        id: "test-company",
        ws: "https://example.com",
        r: ["h", "c"],
        n: "Test Company",
        proof_text: "Additional evidence"
      }
      const result = FinalDBFileSchema.safeParse(entry)
      expect(result.success).toBe(true)
    })
  })

  describe("Invalid entries with reason 'c'", () => {
    it("should reject entry with reason 'c' but no proof fields", () => {
      const entry = {
        id: "test-company",
        ws: "https://example.com",
        r: ["c"],
        n: "Test Company"
      }
      const result = FinalDBFileSchema.safeParse(entry)
      expect(result.success).toBe(false)
      const error = result.success ? null : result.error
      expect(error).not.toBeNull()
      expect(error?.issues[0]?.message).toContain("must have proof_text or proof_link")
    })

    it("should reject entry with reason 'c' and empty proof_text", () => {
      const entry = {
        id: "test-company",
        ws: "https://example.com",
        r: ["c"],
        n: "Test Company",
        proof_text: ""
      }
      const result = FinalDBFileSchema.safeParse(entry)
      expect(result.success).toBe(false)
    })
  })

  describe("Valid entries without reason 'c'", () => {
    it("should accept entry with other reasons and no proof fields", () => {
      const entry = {
        id: "test-company",
        ws: "https://example.com",
        r: ["h"],
        n: "Test Company"
      }
      const result = FinalDBFileSchema.safeParse(entry)
      expect(result.success).toBe(true)
    })

    it("should accept entry with BDS reasons and no proof fields", () => {
      const entry = {
        id: "test-company",
        ws: "https://example.com",
        r: ["BDS_PRIO"],
        n: "Test Company"
      }
      const result = FinalDBFileSchema.safeParse(entry)
      expect(result.success).toBe(true)
    })
  })
})
