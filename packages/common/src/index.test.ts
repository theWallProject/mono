import {describe, it, expect} from "vitest";
import {
  API_ENDPOINT_RULE_LINKEDIN_COMPANY,
  API_ENDPOINT_RULE_FACEBOOK,
  API_ENDPOINT_RULE_TWITTER,
  API_ENDPOINT_RULE_INSTAGRAM,
  API_ENDPOINT_RULE_GITHUB,
  API_ENDPOINT_RULE_YOUTUBE_PROFILE,
  API_ENDPOINT_RULE_YOUTUBE_CHANNEL,
  API_ENDPOINT_RULE_TIKTOK,
  API_ENDPOINT_RULE_THREADS,
  getMainDomain,
} from "./index";

/**
 * Helper function to test if a URL matches a regex pattern and extracts the ID
 */
function testRule(
  rule: {domain: string; regex: string},
  url: string,
  shouldMatch: boolean,
  expectedId?: string
) {
  // Twitter, LinkedIn, and YouTube profile IDs are case-insensitive, so use 'i' flag for these regexes
  const flags =
    rule.domain === "twitter.com" ||
    rule.domain === "linkedin.com" ||
    rule.domain === "youtube.com"
      ? "i"
      : "";
  const regex = new RegExp(rule.regex, flags);
  const match = regex.exec(url);

  if (shouldMatch) {
    expect(match).not.toBeNull();
    if (match && expectedId !== undefined) {
      // For YouTube profile, check all capture groups (user/, c/, @, or direct format)
      const capturedId = match[1] || match[2] || match[3] || match[4];
      expect(capturedId).toBe(expectedId);
    }
  } else {
    expect(match).toBeNull();
  }
}

describe("API_ENDPOINT_RULE_LINKEDIN_COMPANY", () => {
  const rule = API_ENDPOINT_RULE_LINKEDIN_COMPANY;

  describe("positive cases", () => {
    it("should match linkedin.com/company/microsoft", () => {
      testRule(
        rule,
        "https://www.linkedin.com/company/microsoft",
        true,
        "microsoft"
      );
    });

    it("should match linkedin.com/company/google with query params", () => {
      testRule(
        rule,
        "https://www.linkedin.com/company/google?trk=test",
        true,
        "google"
      );
    });

    it("should match linkedin.com/showcase/tech-innovation", () => {
      testRule(
        rule,
        "https://www.linkedin.com/showcase/tech-innovation",
        true,
        "tech-innovation"
      );
    });

    it("should match linkedin.com/showcase/wix-engineering", () => {
      testRule(
        rule,
        "https://www.linkedin.com/showcase/wix-engineering",
        true,
        "wix-engineering"
      );
    });

    it("should match linkedin.com/company/wix-engineering", () => {
      testRule(
        rule,
        "https://www.linkedin.com/company/wix-engineering",
        true,
        "wix-engineering"
      );
    });

    it("should match linkedin.com/showcase/startup-ecosystem with query params", () => {
      testRule(
        rule,
        "https://www.linkedin.com/showcase/startup-ecosystem?ref=test",
        true,
        "startup-ecosystem"
      );
    });

    it("should match without protocol", () => {
      testRule(rule, "linkedin.com/company/apple", true, "apple");
    });

    it("should match with www", () => {
      testRule(rule, "https://www.linkedin.com/company/amazon", true, "amazon");
    });

    it("should match case-insensitive company names (LinkedIn IDs are case-insensitive)", () => {
      testRule(
        rule,
        "https://www.linkedin.com/company/Microsoft",
        true,
        "Microsoft"
      );
      testRule(
        rule,
        "https://www.linkedin.com/company/MICROSOFT",
        true,
        "MICROSOFT"
      );
      testRule(rule, "https://www.linkedin.com/COMPANY/google", true, "google");
      testRule(rule, "https://LINKEDIN.COM/company/apple", true, "apple");
      testRule(
        rule,
        "https://www.linkedin.com/SHOWCASE/tech-innovation",
        true,
        "tech-innovation"
      );
    });
  });

  describe("negative cases", () => {
    it("should not match linkedin.com/school/mit", () => {
      testRule(rule, "https://www.linkedin.com/school/mit", false);
    });

    it("should not match linkedin.com/in/john-doe", () => {
      testRule(rule, "https://www.linkedin.com/in/john-doe", false);
    });

    it("should not match linkedin.com/feed", () => {
      testRule(rule, "https://www.linkedin.com/feed", false);
    });

    it("should not match linkedin.com/jobs", () => {
      testRule(rule, "https://www.linkedin.com/jobs", false);
    });

    it("should not match linkedin.com/groups", () => {
      testRule(rule, "https://www.linkedin.com/groups/12345", false);
    });

    it("should not match linkedin.com/posts", () => {
      testRule(rule, "https://www.linkedin.com/posts/activity-123456", false);
    });

    it("should not match linkedin.com/learning", () => {
      testRule(rule, "https://www.linkedin.com/learning", false);
    });

    it("should not match other domains", () => {
      testRule(rule, "https://www.facebook.com/meta", false);
    });

    it("should not match linkedin.com/company with no name", () => {
      testRule(rule, "https://www.linkedin.com/company", false);
    });
  });
});

describe("API_ENDPOINT_RULE_FACEBOOK", () => {
  const rule = API_ENDPOINT_RULE_FACEBOOK;

  describe("positive cases", () => {
    it("should match facebook.com/zuck", () => {
      testRule(rule, "https://www.facebook.com/zuck", true, "zuck");
    });

    it("should match facebook.com/meta with query params", () => {
      testRule(rule, "https://www.facebook.com/meta?ref=share", true, "meta");
    });

    it("should match facebook.com/pages/tech-company", () => {
      testRule(
        rule,
        "https://www.facebook.com/pages/tech-company",
        true,
        "pages"
      );
    });

    it("should match without protocol", () => {
      testRule(rule, "facebook.com/facebook", true, "facebook");
    });

    it("should match with www", () => {
      testRule(rule, "https://www.facebook.com/netflix", true, "netflix");
    });
  });

  describe("negative cases", () => {
    it("should not match other domains", () => {
      testRule(rule, "https://www.twitter.com/elonmusk", false);
    });
  });
});

describe("API_ENDPOINT_RULE_TWITTER", () => {
  const rule = API_ENDPOINT_RULE_TWITTER;

  describe("positive cases", () => {
    it("should match twitter.com/elonmusk", () => {
      testRule(rule, "https://www.twitter.com/elonmusk", true, "elonmusk");
    });

    it("should match x.com/billgates", () => {
      testRule(rule, "https://www.x.com/billgates", true, "billgates");
    });

    it("should match t.co/username", () => {
      testRule(rule, "https://t.co/example", true, "example");
    });

    it("should match with query params", () => {
      testRule(rule, "https://twitter.com/nasa?s=20", true, "nasa");
    });

    it("should match without protocol", () => {
      testRule(rule, "twitter.com/openai", true, "openai");
    });

    it("should match case-insensitive usernames (Twitter IDs are case-insensitive)", () => {
      testRule(rule, "https://twitter.com/ElonMusk", true, "ElonMusk");
      testRule(rule, "https://twitter.com/ELONMUSK", true, "ELONMUSK");
      testRule(rule, "https://x.com/BillGates", true, "BillGates");
      testRule(rule, "https://X.COM/billgates", true, "billgates");
    });
  });

  describe("negative cases", () => {
    it("should not match twitter.com/search", () => {
      testRule(rule, "https://twitter.com/search?q=test", false);
    });

    it("should not match twitter.com/hashtag", () => {
      testRule(rule, "https://twitter.com/hashtag/tech", false);
    });

    it("should not match twitter.com/i/lists", () => {
      testRule(rule, "https://twitter.com/i/lists/123456", false);
    });

    it("should not match twitter.com/i/events", () => {
      testRule(rule, "https://twitter.com/i/events/123456", false);
    });

    it("should not match twitter.com/intent", () => {
      testRule(rule, "https://twitter.com/intent/tweet", false);
    });

    it("should not match twitter.com/settings", () => {
      testRule(rule, "https://twitter.com/settings/account", false);
    });

    it("should not match other domains", () => {
      testRule(rule, "https://www.facebook.com/zuck", false);
    });

    it("should not match domains containing t.co as substring (e.g., au10tix.com)", () => {
      testRule(rule, "https://www.au10tix.com/company", false);
      testRule(rule, "https://au10tix.com/company", false);
      testRule(rule, "au10tix.com/company", false);
    });
  });
});

describe("API_ENDPOINT_RULE_INSTAGRAM", () => {
  const rule = API_ENDPOINT_RULE_INSTAGRAM;

  describe("positive cases", () => {
    it("should match instagram.com/nasa", () => {
      testRule(rule, "https://www.instagram.com/nasa", true, "nasa");
    });

    it("should match instagram.com/@cristiano", () => {
      testRule(
        rule,
        "https://www.instagram.com/@cristiano",
        true,
        "@cristiano"
      );
    });

    it("should match with query params", () => {
      testRule(
        rule,
        "https://instagram.com/natgeo?igshid=abc123",
        true,
        "natgeo"
      );
    });

    it("should match without protocol", () => {
      testRule(rule, "instagram.com/instagram", true, "instagram");
    });

    it("should match with www", () => {
      testRule(
        rule,
        "https://www.instagram.com/taylorswift",
        true,
        "taylorswift"
      );
    });
  });

  describe("negative cases", () => {
    it("should not match instagram.com/explore", () => {
      testRule(rule, "https://www.instagram.com/explore", false);
    });

    it("should not match instagram.com/reels", () => {
      testRule(rule, "https://www.instagram.com/reels", false);
    });

    it("should not match instagram.com/p/", () => {
      testRule(rule, "https://www.instagram.com/p/ABC123xyz", false);
    });

    it("should not match instagram.com/stories", () => {
      testRule(
        rule,
        "https://www.instagram.com/stories/username/123456",
        false
      );
    });

    it("should not match instagram.com/tv/", () => {
      testRule(rule, "https://www.instagram.com/tv/ABC123", false);
    });

    it("should not match instagram.com/direct", () => {
      testRule(rule, "https://www.instagram.com/direct/inbox", false);
    });

    it("should not match instagram.com/accounts", () => {
      testRule(rule, "https://www.instagram.com/accounts/edit", false);
    });

    it("should not match other domains", () => {
      testRule(rule, "https://www.facebook.com/instagram", false);
    });
  });
});

describe("API_ENDPOINT_RULE_GITHUB", () => {
  const rule = API_ENDPOINT_RULE_GITHUB;

  describe("positive cases", () => {
    it("should match github.com/octocat", () => {
      testRule(rule, "https://www.github.com/octocat", true, "octocat");
    });

    it("should match github.com/microsoft and capture only username (not repo)", () => {
      testRule(rule, "https://github.com/microsoft/vscode", true, "microsoft");
    });

    it("should match github.com/facebook/react and capture only username", () => {
      testRule(
        rule,
        "https://github.com/facebook/react/blob/main/README.md",
        true,
        "facebook"
      );
    });

    it("should match without protocol", () => {
      testRule(rule, "github.com/google", true, "google");
    });

    it("should match with www", () => {
      testRule(rule, "https://www.github.com/vercel", true, "vercel");
    });
  });

  describe("negative cases", () => {
    it("should not match github.com/issues", () => {
      testRule(rule, "https://github.com/owner/repo/issues/123", false);
    });

    it("should not match github.com/pull", () => {
      testRule(rule, "https://github.com/owner/repo/pull/456", false);
    });

    it("should not match github.com/gists", () => {
      testRule(rule, "https://gist.github.com/username/abc123", false);
    });

    it("should not match github.com/releases", () => {
      testRule(rule, "https://github.com/owner/repo/releases", false);
    });

    it("should not match github.com/actions", () => {
      testRule(rule, "https://github.com/owner/repo/actions", false);
    });

    it("should not match github.com/security", () => {
      testRule(rule, "https://github.com/owner/repo/security", false);
    });

    it("should not match github.com/settings", () => {
      testRule(rule, "https://github.com/settings/profile", false);
    });

    it("should not match other domains", () => {
      testRule(rule, "https://www.facebook.com/github", false);
    });

    it("should not match gist.github.com (should be excluded by lookbehind)", () => {
      testRule(rule, "https://gist.github.com/username/abc123", false);
    });
  });
});

describe("API_ENDPOINT_RULE_YOUTUBE_PROFILE", () => {
  const rule = API_ENDPOINT_RULE_YOUTUBE_PROFILE;

  describe("positive cases - all equivalent formats", () => {
    describe("Format 1: youtube.com/ID", () => {
      it("should match youtube.com/example", () => {
        testRule(rule, "https://www.youtube.com/example", true, "example");
      });

      it("should match youtube.com/mkbhd", () => {
        testRule(rule, "https://www.youtube.com/mkbhd", true, "mkbhd");
      });

      it("should match with query params", () => {
        testRule(
          rule,
          "https://youtube.com/veritasium?si=abc123",
          true,
          "veritasium"
        );
      });

      it("should match without protocol", () => {
        testRule(rule, "youtube.com/kurzgesagt", true, "kurzgesagt");
      });

      it("should match with www", () => {
        testRule(rule, "https://www.youtube.com/mkbhd", true, "mkbhd");
      });
    });

    describe("Format 2: youtube.com/@ID", () => {
      it("should match youtube.com/@mkbhd", () => {
        testRule(rule, "https://www.youtube.com/@mkbhd", true, "mkbhd");
      });

      it("should match youtube.com/@MrBeast", () => {
        testRule(rule, "https://www.youtube.com/@MrBeast", true, "MrBeast");
      });

      it("should match https://www.youtube.com/@sentra_security (with protocol and www)", () => {
        testRule(
          rule,
          "https://www.youtube.com/@sentra_security",
          true,
          "sentra_security"
        );
      });

      it("should match http://www.youtube.com/@sentra_security (with http protocol)", () => {
        testRule(
          rule,
          "http://www.youtube.com/@sentra_security",
          true,
          "sentra_security"
        );
      });

      it("should match www.youtube.com/@sentra_security (with www but no protocol)", () => {
        testRule(
          rule,
          "www.youtube.com/@sentra_security",
          true,
          "sentra_security"
        );
      });

      it("should match with query params", () => {
        testRule(
          rule,
          "https://youtube.com/@veritasium?si=abc123",
          true,
          "veritasium"
        );
      });

      it("should match without protocol", () => {
        testRule(rule, "youtube.com/@kurzgesagt", true, "kurzgesagt");
      });

      it("should match with www", () => {
        testRule(rule, "https://www.youtube.com/@mkbhd", true, "mkbhd");
      });
    });

    describe("Format 3: youtube.com/c/ID", () => {
      it("should match youtube.com/c/omadahealth", () => {
        testRule(
          rule,
          "https://www.youtube.com/c/omadahealth",
          true,
          "omadahealth"
        );
      });

      it("should match youtube.com/c/ChannelName", () => {
        testRule(
          rule,
          "https://www.youtube.com/c/ChannelName",
          true,
          "ChannelName"
        );
      });

      it("should match with query params", () => {
        testRule(
          rule,
          "https://youtube.com/c/example?sub_confirmation=1",
          true,
          "example"
        );
      });

      it("should match without protocol", () => {
        testRule(rule, "youtube.com/c/kurzgesagt", true, "kurzgesagt");
      });

      it("should match with www", () => {
        testRule(rule, "https://www.youtube.com/c/mkbhd", true, "mkbhd");
      });
    });

    describe("Format 4: youtube.com/c/@ID", () => {
      it("should match youtube.com/c/@mkbhd", () => {
        testRule(rule, "https://www.youtube.com/c/@mkbhd", true, "mkbhd");
      });

      it("should match youtube.com/c/@MrBeast", () => {
        testRule(rule, "https://www.youtube.com/c/@MrBeast", true, "MrBeast");
      });

      it("should match with query params", () => {
        testRule(
          rule,
          "https://youtube.com/c/@veritasium?si=abc123",
          true,
          "veritasium"
        );
      });

      it("should match without protocol", () => {
        testRule(rule, "youtube.com/c/@kurzgesagt", true, "kurzgesagt");
      });

      it("should match with www", () => {
        testRule(rule, "https://www.youtube.com/c/@mkbhd", true, "mkbhd");
      });
    });

    describe("Format 5: youtube.com/user/ID", () => {
      it("should match youtube.com/user/ChannelName", () => {
        testRule(
          rule,
          "https://www.youtube.com/user/ChannelName",
          true,
          "ChannelName"
        );
      });

      it("should match youtube.com/user/mkbhd", () => {
        testRule(rule, "https://www.youtube.com/user/mkbhd", true, "mkbhd");
      });

      it("should match with query params", () => {
        testRule(
          rule,
          "https://youtube.com/user/example?sub_confirmation=1",
          true,
          "example"
        );
      });

      it("should match without protocol", () => {
        testRule(rule, "youtube.com/user/kurzgesagt", true, "kurzgesagt");
      });

      it("should match with www", () => {
        testRule(rule, "https://www.youtube.com/user/mkbhd", true, "mkbhd");
      });
    });

    describe("Case-insensitive matching (all formats)", () => {
      it("should match case-insensitive for format 1: youtube.com/ID", () => {
        testRule(rule, "https://www.youtube.com/Example", true, "Example");
        testRule(rule, "https://YOUTUBE.COM/mkbhd", true, "mkbhd");
        testRule(
          rule,
          "https://www.YOUTUBE.com/veritasium",
          true,
          "veritasium"
        );
      });

      it("should match case-insensitive for format 2: youtube.com/@ID", () => {
        testRule(rule, "https://www.youtube.com/@MKBHD", true, "MKBHD");
        testRule(rule, "https://www.youtube.com/@MRBEAST", true, "MRBEAST");
        testRule(rule, "https://YOUTUBE.COM/@mkbhd", true, "mkbhd");
        testRule(
          rule,
          "https://www.YOUTUBE.com/@veritasium",
          true,
          "veritasium"
        );
      });

      it("should match case-insensitive for format 3: youtube.com/c/ID", () => {
        testRule(
          rule,
          "https://www.youtube.com/c/OMADAHEALTH",
          true,
          "OMADAHEALTH"
        );
        testRule(
          rule,
          "https://YOUTUBE.COM/c/ChannelName",
          true,
          "ChannelName"
        );
        testRule(rule, "https://www.YOUTUBE.com/c/example", true, "example");
      });

      it("should match case-insensitive for format 4: youtube.com/c/@ID", () => {
        testRule(rule, "https://www.youtube.com/c/@MKBHD", true, "MKBHD");
        testRule(rule, "https://YOUTUBE.COM/c/@mkbhd", true, "mkbhd");
        testRule(
          rule,
          "https://www.YOUTUBE.com/c/@veritasium",
          true,
          "veritasium"
        );
      });

      it("should match case-insensitive for format 5: youtube.com/user/ID", () => {
        testRule(
          rule,
          "https://www.youtube.com/user/CHANNELNAME",
          true,
          "CHANNELNAME"
        );
        testRule(rule, "https://YOUTUBE.COM/user/mkbhd", true, "mkbhd");
        testRule(
          rule,
          "https://www.YOUTUBE.com/user/veritasium",
          true,
          "veritasium"
        );
      });
    });

    describe("All formats should capture the same ID for equivalent URLs", () => {
      const testId = "mkbhd";
      it(`should capture "${testId}" from all 5 formats`, () => {
        testRule(rule, `https://www.youtube.com/${testId}`, true, testId);
        testRule(rule, `https://www.youtube.com/@${testId}`, true, testId);
        testRule(rule, `https://www.youtube.com/c/${testId}`, true, testId);
        testRule(rule, `https://www.youtube.com/c/@${testId}`, true, testId);
        testRule(rule, `https://www.youtube.com/user/${testId}`, true, testId);
      });
    });
  });

  describe("negative cases", () => {
    it("should not match youtube.com/watch", () => {
      testRule(rule, "https://www.youtube.com/watch?v=dQw4w9WgXcQ", false);
    });

    it("should not match youtube.com/embed", () => {
      testRule(rule, "https://www.youtube.com/embed/dQw4w9WgXcQ", false);
    });

    it("should not match youtube.com/playlist", () => {
      testRule(
        rule,
        "https://www.youtube.com/playlist?list=PLrAXtmRdnEQy6nuLMH1Y3J8",
        false
      );
    });

    it("should not match youtube.com/live", () => {
      testRule(rule, "https://www.youtube.com/live/jfKfPfyJRdk", false);
    });

    it("should not match youtube.com/shorts", () => {
      testRule(rule, "https://www.youtube.com/shorts/abc123xyz", false);
    });

    it("should not match youtube.com/results", () => {
      testRule(
        rule,
        "https://www.youtube.com/results?search_query=test",
        false
      );
    });

    it("should not match youtube.com/channel", () => {
      testRule(
        rule,
        "https://www.youtube.com/channel/UCuAXFkgsw1L7xaCfnd5JJOw",
        false
      );
    });

    it("should not match youtube.com/feed", () => {
      testRule(rule, "https://www.youtube.com/feed/subscriptions", false);
    });

    it("should not match youtube.com/about", () => {
      testRule(rule, "https://www.youtube.com/about", false);
    });

    it("should not match youtube.com/trending", () => {
      testRule(rule, "https://www.youtube.com/trending", false);
    });

    it("should match youtube.com/user/ChannelName", () => {
      testRule(
        rule,
        "https://www.youtube.com/user/ChannelName",
        true,
        "ChannelName"
      );
    });

    it("should not match other domains", () => {
      testRule(rule, "https://www.facebook.com/youtube", false);
    });

    describe("Special paths should be excluded even with c/ prefix", () => {
      it("should not match youtube.com/c/watch", () => {
        testRule(rule, "https://www.youtube.com/c/watch", false);
      });

      it("should not match youtube.com/c/channel", () => {
        testRule(rule, "https://www.youtube.com/c/channel", false);
      });

      it("should not match youtube.com/c/embed", () => {
        testRule(rule, "https://www.youtube.com/c/embed", false);
      });

      it("should not match youtube.com/c/feed", () => {
        testRule(rule, "https://www.youtube.com/c/feed", false);
      });

      it("should not match youtube.com/c/live", () => {
        testRule(rule, "https://www.youtube.com/c/live", false);
      });

      it("should not match youtube.com/c/playlist", () => {
        testRule(rule, "https://www.youtube.com/c/playlist", false);
      });

      it("should not match youtube.com/c/results", () => {
        testRule(rule, "https://www.youtube.com/c/results", false);
      });

      it("should not match youtube.com/c/shorts", () => {
        testRule(rule, "https://www.youtube.com/c/shorts", false);
      });

      it("should not match youtube.com/c/trending", () => {
        testRule(rule, "https://www.youtube.com/c/trending", false);
      });

      it("should not match youtube.com/c/about", () => {
        testRule(rule, "https://www.youtube.com/c/about", false);
      });

      it("should not match youtube.com/c/user/", () => {
        testRule(rule, "https://www.youtube.com/c/user/ChannelName", false);
      });
    });

    describe("Special paths should be excluded even with @ prefix", () => {
      it("should not match youtube.com/@watch", () => {
        testRule(rule, "https://www.youtube.com/@watch", false);
      });

      it("should not match youtube.com/@channel", () => {
        testRule(rule, "https://www.youtube.com/@channel", false);
      });

      it("should not match youtube.com/@embed", () => {
        testRule(rule, "https://www.youtube.com/@embed", false);
      });

      it("should not match youtube.com/@feed", () => {
        testRule(rule, "https://www.youtube.com/@feed", false);
      });

      it("should not match youtube.com/@live", () => {
        testRule(rule, "https://www.youtube.com/@live", false);
      });

      it("should not match youtube.com/@playlist", () => {
        testRule(rule, "https://www.youtube.com/@playlist", false);
      });

      it("should not match youtube.com/@results", () => {
        testRule(rule, "https://www.youtube.com/@results", false);
      });

      it("should not match youtube.com/@shorts", () => {
        testRule(rule, "https://www.youtube.com/@shorts", false);
      });

      it("should not match youtube.com/@trending", () => {
        testRule(rule, "https://www.youtube.com/@trending", false);
      });

      it("should not match youtube.com/@about", () => {
        testRule(rule, "https://www.youtube.com/@about", false);
      });

      it("should not match youtube.com/@user/", () => {
        testRule(rule, "https://www.youtube.com/@user/ChannelName", false);
      });
    });

    describe("Special paths should be excluded even with c/@ prefix", () => {
      it("should not match youtube.com/c/@watch", () => {
        testRule(rule, "https://www.youtube.com/c/@watch", false);
      });

      it("should not match youtube.com/c/@channel", () => {
        testRule(rule, "https://www.youtube.com/c/@channel", false);
      });

      it("should not match youtube.com/c/@embed", () => {
        testRule(rule, "https://www.youtube.com/c/@embed", false);
      });

      it("should not match youtube.com/c/@feed", () => {
        testRule(rule, "https://www.youtube.com/c/@feed", false);
      });

      it("should not match youtube.com/c/@live", () => {
        testRule(rule, "https://www.youtube.com/c/@live", false);
      });

      it("should not match youtube.com/c/@playlist", () => {
        testRule(rule, "https://www.youtube.com/c/@playlist", false);
      });

      it("should not match youtube.com/c/@results", () => {
        testRule(rule, "https://www.youtube.com/c/@results", false);
      });

      it("should not match youtube.com/c/@shorts", () => {
        testRule(rule, "https://www.youtube.com/c/@shorts", false);
      });

      it("should not match youtube.com/c/@trending", () => {
        testRule(rule, "https://www.youtube.com/c/@trending", false);
      });

      it("should not match youtube.com/c/@about", () => {
        testRule(rule, "https://www.youtube.com/c/@about", false);
      });

      it("should not match youtube.com/c/@user/", () => {
        testRule(rule, "https://www.youtube.com/c/@user/ChannelName", false);
      });
    });
  });
});

describe("API_ENDPOINT_RULE_YOUTUBE_CHANNEL", () => {
  const rule = API_ENDPOINT_RULE_YOUTUBE_CHANNEL;

  describe("positive cases", () => {
    it("should match youtube.com/channel/UCxxxxx", () => {
      testRule(
        rule,
        "https://www.youtube.com/channel/UC123456789",
        true,
        "UC123456789"
      );
    });

    it("should match https://www.youtube.com/channel/UC123 (with protocol and www)", () => {
      testRule(rule, "https://www.youtube.com/channel/UC123", true, "UC123");
    });

    it("should match http://www.youtube.com/channel/UC123 (with http protocol)", () => {
      testRule(rule, "http://www.youtube.com/channel/UC123", true, "UC123");
    });

    it("should match www.youtube.com/channel/UC123 (with www but no protocol)", () => {
      testRule(rule, "www.youtube.com/channel/UC123", true, "UC123");
    });

    it("should match with query params", () => {
      testRule(
        rule,
        "https://youtube.com/channel/UC123?ref=test",
        true,
        "UC123"
      );
    });

    it("should match without protocol", () => {
      testRule(rule, "youtube.com/channel/UC123", true, "UC123");
    });

    it("should match with www", () => {
      testRule(rule, "https://www.youtube.com/channel/UC123", true, "UC123");
    });
  });

  describe("negative cases", () => {
    it("should not match youtube.com/@mkbhd", () => {
      testRule(rule, "https://www.youtube.com/@mkbhd", false);
    });

    it("should not match youtube.com/user/username", () => {
      testRule(rule, "https://www.youtube.com/user/example", false);
    });

    it("should not match youtube.com/c/channelname", () => {
      testRule(rule, "https://www.youtube.com/c/ChannelName", false);
    });

    it("should not match youtube.com/watch", () => {
      testRule(rule, "https://www.youtube.com/watch?v=dQw4w9WgXcQ", false);
    });

    it("should not match youtube.com/playlist", () => {
      testRule(rule, "https://www.youtube.com/playlist?list=PLxxx", false);
    });

    it("should not match youtube.com/channel without ID", () => {
      testRule(rule, "https://www.youtube.com/channel", false);
    });

    it("should not match other domains", () => {
      testRule(rule, "https://www.facebook.com/youtube", false);
    });
  });
});

describe("API_ENDPOINT_RULE_TIKTOK", () => {
  const rule = API_ENDPOINT_RULE_TIKTOK;

  describe("positive cases", () => {
    it("should match tiktok.com/@charlidamelio", () => {
      testRule(
        rule,
        "https://www.tiktok.com/@charlidamelio",
        true,
        "@charlidamelio"
      );
    });

    it("should match tiktok.com/@khaby.lame", () => {
      testRule(rule, "https://www.tiktok.com/@khaby.lame", true, "@khaby.lame");
    });

    it("should match with query params", () => {
      testRule(
        rule,
        "https://tiktok.com/@addisonre?lang=en",
        true,
        "@addisonre"
      );
    });

    it("should match without protocol", () => {
      testRule(rule, "tiktok.com/@zachking", true, "@zachking");
    });

    it("should match with www", () => {
      testRule(rule, "https://www.tiktok.com/@bella", true, "@bella");
    });
  });

  describe("negative cases", () => {
    it("should not match tiktok.com/@/video", () => {
      testRule(rule, "https://www.tiktok.com/@username/video/123456789", false);
    });

    it("should not match tiktok.com/discover", () => {
      testRule(rule, "https://www.tiktok.com/discover", false);
    });

    it("should not match tiktok.com/foryou", () => {
      testRule(rule, "https://www.tiktok.com/foryou", false);
    });

    it("should not match tiktok.com/trending", () => {
      testRule(rule, "https://www.tiktok.com/trending", false);
    });

    it("should not match tiktok.com/music", () => {
      testRule(rule, "https://www.tiktok.com/music/song-123", false);
    });

    it("should not match tiktok.com/upload", () => {
      testRule(rule, "https://www.tiktok.com/upload", false);
    });

    it("should not match other domains", () => {
      testRule(rule, "https://www.instagram.com/charlidamelio", false);
    });
  });
});

describe("API_ENDPOINT_RULE_THREADS", () => {
  const rule = API_ENDPOINT_RULE_THREADS;

  describe("positive cases", () => {
    it("should match threads.com/@zuck", () => {
      testRule(rule, "https://www.threads.com/@zuck", true, "@zuck");
    });

    it("should match threads.com/@cristiano", () => {
      testRule(rule, "https://www.threads.com/@cristiano", true, "@cristiano");
    });

    it("should match with query params", () => {
      testRule(
        rule,
        "https://threads.com/@natgeo?igshid=abc123",
        true,
        "@natgeo"
      );
    });

    it("should match without protocol", () => {
      testRule(rule, "threads.com/@instagram", true, "@instagram");
    });

    it("should match with www", () => {
      testRule(
        rule,
        "https://www.threads.com/@taylorswift",
        true,
        "@taylorswift"
      );
    });
  });

  describe("negative cases", () => {
    it("should not match threads.com/@username/post", () => {
      testRule(rule, "https://www.threads.com/@zuck/post/123456", false);
    });

    it("should not match threads.com/search", () => {
      testRule(rule, "https://www.threads.com/search?q=test", false);
    });

    it("should not match threads.com/explore", () => {
      testRule(rule, "https://www.threads.com/explore", false);
    });

    it("should not match threads.com/activity", () => {
      testRule(rule, "https://www.threads.com/activity", false);
    });

    it("should not match threads.com/settings", () => {
      testRule(rule, "https://www.threads.com/settings", false);
    });

    it("should not match other domains", () => {
      testRule(rule, "https://www.instagram.com/zuck", false);
    });
  });
});

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
    API_ENDPOINT_RULE_THREADS,
  ];

  it("should not match careers.wix.com/test as any social media", () => {
    const url = "https://careers.wix.com/test";

    for (const rule of allRules) {
      const flags =
        rule.domain === "twitter.com" ||
        rule.domain === "linkedin.com" ||
        rule.domain === "youtube.com"
          ? "i"
          : "";
      const regex = new RegExp(rule.regex, flags);
      const match = regex.exec(url);
      expect(match).toBeNull();
    }
  });

  it("should not match careers.wix.com/test (without protocol) as any social media", () => {
    const url = "careers.wix.com/test";

    for (const rule of allRules) {
      const flags =
        rule.domain === "twitter.com" ||
        rule.domain === "linkedin.com" ||
        rule.domain === "youtube.com"
          ? "i"
          : "";
      const regex = new RegExp(rule.regex, flags);
      const match = regex.exec(url);
      expect(match).toBeNull();
    }
  });
});

describe("getMainDomain", () => {
  it("should keep subdomains", () => {
    expect(getMainDomain("https://careers.wix.com/test")).toBe(
      "careers.wix.com"
    );
    expect(getMainDomain("https://www.careers.wix.com/test")).toBe(
      "careers.wix.com"
    );
    expect(getMainDomain("careers.wix.com/test")).toBe("careers.wix.com");
  });

  it("should handle main domain without subdomain", () => {
    expect(getMainDomain("https://wix.com")).toBe("wix.com");
    expect(getMainDomain("https://www.wix.com")).toBe("wix.com");
    expect(getMainDomain("wix.com")).toBe("wix.com");
  });

  it("should handle other subdomains", () => {
    expect(getMainDomain("https://blog.example.com")).toBe("blog.example.com");
    expect(getMainDomain("https://api.github.com")).toBe("api.github.com");
    expect(getMainDomain("https://subdomain.example.co.uk")).toBe(
      "subdomain.example.co.uk"
    );
  });
});
